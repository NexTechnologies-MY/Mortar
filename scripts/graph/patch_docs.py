#!/usr/bin/env python3
"""Patch small documentation edits in graphify-out/ without rereading with Claude.

Workflow:
  1. Prepare chunks and baselines for the modified documents:
     $(head -1 "$(command -v graphify)" | cut -c3-) scripts/graph/patch_docs.py prepare docs/path.md ...
  2. Edit graphify-out/.graphify_chunk_NN.json to reflect the text changes.
  3. Validate structural consistency:
     $(head -1 "$(command -v graphify)" | cut -c3-) scripts/graph/patch_docs.py check
  4. Merge changes back into graphify-out/:
     $(head -1 "$(command -v graphify)" | cut -c3-) scripts/graph/patch_docs.py merge [--tokens N] [--force]
  5. Run code pass twice:
     graphify update .
     graphify update .
  6. Finalize report and clean intermediate files:
     $(head -1 "$(command -v graphify)" | cut -c3-) scripts/graph/patch_docs.py finish
"""

import argparse
import collections
import glob
import json
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd().resolve()
OUT = ROOT / "graphify-out"
REPORT_ROOT = "Mortar"
VALID_FT = {"code", "document", "paper", "image", "rationale", "concept"}


def _resolve_spec() -> str:
    import graphify

    spec_p = (
        Path(graphify.__file__).resolve().parent
        / "skills"
        / "claude"
        / "references"
        / "extraction-spec.md"
    )
    if not spec_p.exists():
        raise FileNotFoundError(f"Extraction spec not found at {spec_p}")
    return str(spec_p)


def _rel_of(sf: str) -> str:
    p = Path(sf)
    if p.is_absolute():
        try:
            return str(p.resolve().relative_to(ROOT))
        except ValueError:
            return "OUTSIDE:" + sf
    return sf


def _read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, data: dict, indent: int | None = None) -> None:
    path.write_text(
        json.dumps(data, indent=indent, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def cmd_prepare(args: argparse.Namespace) -> None:
    if not OUT.is_dir():
        print(f"Error: {OUT} not found. Run from the repository root.", file=sys.stderr)
        sys.exit(1)

    from graphify.detect import detect_incremental
    from graphify.extract import collect_files, extract

    # 1. Incremental detection (update.md Blocks 1 & 2)
    result = detect_incremental(ROOT)
    _write_json(OUT / ".graphify_incremental.json", result)
    detect_payload = {
        "files": result.get("new_files", {}),
        "all_files": result.get("files", {}),
        "total_files": result.get("new_total", 0),
        "total_words": result.get("total_words", 0),
        "skipped_sensitive": result.get("skipped_sensitive", []),
        "needs_graph": True,
    }
    _write_json(OUT / ".graphify_detect.json", detect_payload)

    # 2. AST extraction for code files if any changed
    code_files: list[Path] = []
    for f in result.get("new_files", {}).get("code", []):
        p = Path(f)
        code_files.extend(collect_files(p) if p.is_dir() else [p])

    if code_files:
        ast_result = extract(code_files, cache_root=ROOT)
        _write_json(OUT / ".graphify_ast.json", ast_result, indent=2)
        print(f"AST: {len(ast_result['nodes'])} nodes, {len(ast_result['edges'])} edges")
    else:
        _write_json(
            OUT / ".graphify_ast.json",
            {"nodes": [], "edges": [], "input_tokens": 0, "output_tokens": 0},
        )
        print("No code files - skipping AST extraction")

    # 3. Uncached document list (absolute paths)
    resolved_docs: list[Path] = []
    for doc in args.docs:
        p = Path(doc)
        if not p.is_absolute():
            p = (ROOT / p).resolve()
        resolved_docs.append(p)

    (OUT / ".graphify_uncached.txt").write_text(
        "\n".join(str(p) for p in resolved_docs) + "\n",
        encoding="utf-8",
    )

    # 4. Extract current nodes, links, and hyperedges for each document
    graph_path = OUT / "graph.json"
    if not graph_path.exists():
        print(f"Error: {graph_path} not found.", file=sys.stderr)
        sys.exit(1)

    cur_graph = _read_json(graph_path)
    nodes_by_sf = collections.defaultdict(list)
    for n in cur_graph.get("nodes", []):
        nodes_by_sf[n.get("source_file")].append(n)

    links_by_sf = collections.defaultdict(list)
    for e in cur_graph.get("links", []):
        links_by_sf[e.get("source_file")].append(e)

    hyp_list = cur_graph.get("graph", {}).get("hyperedges", []) or cur_graph.get("hyperedges", [])
    hyp_by_sf = collections.defaultdict(list)
    for h in hyp_list:
        hyp_by_sf[h.get("source_file")].append(h)

    for idx, doc_p in enumerate(resolved_docs):
        rel_path = _rel_of(str(doc_p))
        raw_nodes = nodes_by_sf.get(rel_path, [])
        raw_links = links_by_sf.get(rel_path, [])
        raw_hyp = hyp_by_sf.get(rel_path, [])

        chunk_nodes = []
        for n in raw_nodes:
            item = dict(n)
            item.pop("community", None)
            item.pop("community_name", None)
            item.pop("norm_label", None)
            item["source_file"] = str(doc_p)
            item["_origin"] = "semantic"
            chunk_nodes.append(item)

        chunk_edges = []
        for e in raw_links:
            item = dict(e)
            item["source_file"] = str(doc_p)
            item["_origin"] = "semantic"
            chunk_edges.append(item)

        chunk_hyp = []
        for h in raw_hyp:
            item = dict(h)
            item["source_file"] = str(doc_p)
            chunk_hyp.append(item)

        chunk_data = {
            "nodes": chunk_nodes,
            "edges": chunk_edges,
            "hyperedges": chunk_hyp,
            "input_tokens": 0,
            "output_tokens": 0,
        }
        chunk_file = OUT / f".graphify_chunk_{idx:02d}.json"
        _write_json(chunk_file, chunk_data, indent=2)

        baseline_lines = [f"# {len(chunk_nodes)} existing nodes for {rel_path}"]
        for n in sorted(chunk_nodes, key=lambda x: x["id"]):
            baseline_lines.append(
                f"{n['id']}\t{n.get('label', '')}\t{n.get('file_type', 'concept')}"
            )
        baseline_file = OUT / f".graphify_baseline_{idx:02d}.txt"
        baseline_file.write_text("\n".join(baseline_lines) + "\n", encoding="utf-8")

        print(
            f"Prepared {chunk_file.name} and {baseline_file.name} for {rel_path} "
            f"({len(chunk_nodes)} nodes)"
        )


def cmd_check(args: argparse.Namespace) -> None:
    cur = _read_json(OUT / "graph.json")
    cur_by_id = {n["id"]: n for n in cur.get("nodes", [])}

    baselines: dict[str, set[str]] = {}
    baseline_files = sorted(OUT.glob(".graphify_baseline_*.txt"))
    for b in baseline_files:
        lines = b.read_text(encoding="utf-8").splitlines()
        if not lines:
            continue
        rel = lines[0].split(" for ", 1)[1].strip()
        baselines[rel] = {line.split("\t")[0] for line in lines[1:] if line.strip()}

    chunk_files = sorted(OUT.glob(".graphify_chunk_*.json"))
    if not chunk_files:
        print("No chunk files found in graphify-out/", file=sys.stderr)
        sys.exit(1)

    data = {str(c): _read_json(c) for c in chunk_files}
    chunk_ids = {n["id"] for d in data.values() for n in d.get("nodes", [])}
    known = chunk_ids | set(cur_by_id)

    per_file: dict[str, set[str]] = collections.defaultdict(set)
    ok = True

    for c, d in data.items():
        nodes = d.get("nodes", [])
        edges = d.get("edges", [])
        hyper = d.get("hyperedges", [])

        ids = [n["id"] for n in nodes]
        dup = [i for i, k in collections.Counter(ids).items() if k > 1]
        bad_ft = [n["id"] for n in nodes if n.get("file_type") not in VALID_FT]
        bad_id = [
            i
            for i in ids
            if not all(ch.islower() or ch.isdigit() or ch == "_" for ch in i)
        ]
        dangling = [
            (e.get("source"), e.get("target"))
            for e in edges
            if e.get("source") not in known or e.get("target") not in known
        ]
        noscore = sum(1 for e in edges if "confidence_score" not in e)
        half = sum(
            1
            for e in edges
            if e.get("confidence") == "INFERRED" and e.get("confidence_score") == 0.5
        )
        rel_sf = sum(
            1
            for x in nodes + edges + hyper
            if not Path(str(x.get("source_file", ""))).is_absolute()
        )
        hyper_bad = [
            h.get("id")
            for h in hyper
            if any(m not in known for m in h.get("nodes", []))
        ]

        for n in nodes:
            per_file[_rel_of(n.get("source_file", ""))].add(n["id"])

        stolen = [
            n["id"]
            for n in nodes
            if n["id"] in cur_by_id
            and cur_by_id[n["id"]].get("source_file") != _rel_of(n.get("source_file", ""))
        ]

        flags = {
            "dup": dup[:5],
            "bad_ft": bad_ft[:5],
            "bad_id": bad_id[:5],
            "dangling": dangling[:5],
            "noscore": noscore,
            "half": half,
            "relative_source_file": rel_sf,
            "hyper_bad": hyper_bad[:5],
            "stolen": stolen[:8],
        }
        bad = {k: v for k, v in flags.items() if v}
        ok = ok and not bad
        print(
            f"{Path(c).name}: {len(nodes)} nodes, {len(edges)} edges, {len(hyper)} hyperedges",
            "OK" if not bad else bad,
        )

    print()
    for rel, base in sorted(baselines.items()):
        got = per_file.get(rel, set())
        if not got:
            print(f"{rel}: NO CHUNK YET (baseline {len(base)})")
            continue
        dropped = sorted(base - got)
        new = sorted(got - base)
        print(
            f"{rel}: baseline {len(base)}, kept {len(base & got)}, dropped {len(dropped)}, new {len(new)}, total {len(got)}"
        )
        if dropped:
            print("   dropped:", ", ".join(dropped))

    extra = sorted(set(per_file) - set(baselines))
    if extra:
        print("chunk nodes with unexpected source files:", extra)

    if ok:
        print("\nALL CHUNKS STRUCTURALLY OK")
    else:
        print("\nSTRUCTURAL PROBLEMS ABOVE")
        sys.exit(1)


def cmd_merge(args: argparse.Namespace) -> None:
    from graphify.analyze import god_nodes, graph_diff, suggest_questions, surprising_connections
    from graphify.build import build_from_json, build_merge
    from graphify.cache import save_semantic_cache
    from graphify.cli import _stamped_manifest_files
    from graphify.cluster import (
        cluster,
        community_member_sigs,
        label_communities_by_hub,
        remap_communities_to_previous,
        score_all,
    )
    from graphify.detect import detect, save_manifest
    from graphify.diagnostics import diagnose_extraction, format_diagnostic_report
    from graphify.export import to_json
    from graphify.report import generate, load_learning_for_report
    from graphify.watch import _read_build_excludes, _read_build_gitignore
    from networkx.readwrite import json_graph

    spec = _resolve_spec()
    chunks = sorted(glob.glob(str(OUT / ".graphify_chunk_*.json")))
    if not chunks:
        print("No chunk files found in graphify-out/", file=sys.stderr)
        sys.exit(1)

    chunk_data = {c: _read_json(Path(c)) for c in chunks}
    ast = _read_json(OUT / ".graphify_ast.json")
    old_graph = _read_json(OUT / "graph.json")
    old_sf = {n["id"]: n.get("source_file") for n in old_graph.get("nodes", [])}

    redo_docs = {
        _rel_of(f)
        for f in (OUT / ".graphify_uncached.txt").read_text(encoding="utf-8").splitlines()
        if f
    }
    inc_data = _read_json(OUT / ".graphify_incremental.json")
    redo_code = {
        _rel_of(f) for f in inc_data.get("new_files", {}).get("code", [])
    }
    chunk_ids = {n["id"] for d in chunk_data.values() for n in d.get("nodes", [])}
    survivors = (
        {i for i, s in old_sf.items() if s not in redo_docs | redo_code}
        | chunk_ids
        | {n["id"] for n in ast.get("nodes", [])}
    )

    restored = 0
    for c, d in chunk_data.items():
        mine = {_rel_of(n["source_file"]): n["source_file"] for n in d.get("nodes", [])}
        have = {(frozenset((e["source"], e["target"])), e.get("relation")) for e in d.get("edges", [])}
        for e in old_graph.get("links", []):
            doc = e.get("source_file")
            if doc not in mine:
                continue
            if old_sf.get(e["source"]) == doc and old_sf.get(e["target"]) == doc:
                continue
            if e["source"] not in survivors or e["target"] not in survivors:
                continue
            key = (frozenset((e["source"], e["target"])), e.get("relation"))
            if key in have:
                continue
            d["edges"].append({**e, "_origin": "semantic", "source_file": mine[doc]})
            have.add(key)
            restored += 1
    print(f"Restored {restored} cross-file edges")

    nodes: list[dict] = []
    edges: list[dict] = []
    hyper: list[dict] = []
    tin = args.tokens

    for c in chunks:
        d = chunk_data[c]
        for n in d.get("nodes", []):
            n["_origin"] = "semantic"
        for e in d.get("edges", []):
            e["_origin"] = "semantic"
        d["input_tokens"] = 0
        d["output_tokens"] = 0
        nodes += d.get("nodes", [])
        edges += d.get("edges", [])
        hyper += d.get("hyperedges", [])

    if chunks:
        chunk_data[chunks[0]]["input_tokens"] = tin
    for c in chunks:
        _write_json(Path(c), chunk_data[c], indent=2)

    new_sem = {
        "nodes": nodes,
        "edges": edges,
        "hyperedges": hyper,
        "input_tokens": tin,
        "output_tokens": 0,
    }
    _write_json(OUT / ".graphify_semantic_new.json", new_sem, indent=2)
    print(f"Merged {len(chunks)} chunks: {tin:,} tokens")

    uncached = [
        l
        for l in (OUT / ".graphify_uncached.txt").read_text(encoding="utf-8").splitlines()
        if l
    ]
    saved = save_semantic_cache(
        nodes,
        edges,
        hyper,
        root=str(ROOT),
        allowed_source_files=uncached,
        prompt_file=spec,
    )
    print(f"Cached {saved} files")

    seen_ids: set[str] = set()
    dedup_nodes: list[dict] = []
    for n in nodes:
        if n["id"] not in seen_ids:
            seen_ids.add(n["id"])
            dedup_nodes.append(n)
    sem = {
        "nodes": dedup_nodes,
        "edges": edges,
        "hyperedges": hyper,
        "input_tokens": tin,
        "output_tokens": 0,
    }

    ast_seen = {n["id"] for n in ast.get("nodes", [])}
    merged_nodes = list(ast.get("nodes", [])) + [
        n for n in sem["nodes"] if n["id"] not in ast_seen
    ]
    extraction = {
        "nodes": merged_nodes,
        "edges": ast.get("edges", []) + sem["edges"],
        "hyperedges": hyper,
        "input_tokens": tin,
        "output_tokens": 0,
    }
    print(
        f"Part C: {len(merged_nodes)} nodes ({len(ast.get('nodes', []))} AST + {len(sem['nodes'])} semantic)"
    )

    shutil.copy(OUT / "graph.json", OUT / ".graphify_old.json")
    old_data = _read_json(OUT / ".graphify_old.json")

    G = build_merge(
        [extraction],
        graph_path=str(OUT / "graph.json"),
        prune_sources=None,
        root=str(ROOT),
        directed=False,
    )
    merged_out = {
        "nodes": [{"id": n, **d} for n, d in G.nodes(data=True)],
        "edges": [
            {
                **{k: v for k, v in d.items() if k not in ("_src", "_tgt", "source", "target")},
                "source": d.get("_src", u),
                "target": d.get("_tgt", v),
            }
            for u, v, d in G.edges(data=True)
        ],
        "hyperedges": list(G.graph.get("hyperedges", [])),
        "input_tokens": tin,
        "output_tokens": 0,
    }
    _write_json(OUT / ".graphify_extract.json", merged_out)
    print(f"build_merge: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")

    mf = _stamped_manifest_files(inc_data.get("files", {}), extraction, ROOT)
    sem_types = ("document", "paper", "image")
    dispatched = {
        f
        for t, fl in inc_data.get("new_files", {}).items()
        if t in sem_types
        for f in fl
    }
    stamped = {f for fl in mf.values() for f in fl}
    cleared = dispatched - stamped
    scan = {f for fl in inc_data.get("files", {}).values() for f in fl}
    save_manifest(mf, root=str(ROOT), scan_corpus=scan, clear_semantic=cleared or None)
    print(f"Manifest saved ({len(cleared)} dispatched docs left unstamped)")

    G = build_from_json(merged_out, root=str(ROOT), directed=False)
    if G.number_of_nodes() < len(old_data["nodes"]) and not args.force:
        print(
            f"STOP: graph would shrink {len(old_data['nodes'])} -> {G.number_of_nodes()} (pass --force if intentional)",
            file=sys.stderr,
        )
        sys.exit(1)

    communities = cluster(G)
    prev = {}
    for n in old_data.get("nodes", []):
        if n.get("community") is not None:
            prev[str(n["id"])] = int(n["community"])
    communities = remap_communities_to_previous(communities, prev)
    cohesion = score_all(G, communities)
    gods = god_nodes(G)
    surprises = surprising_connections(G, communities)

    raw_labels = _read_json(OUT / ".graphify_labels.json")
    labels = {
        int(k): v
        for k, v in raw_labels.items()
        if int(k) in communities and v != f"Community {int(k)}"
    }
    saved_sigs = {int(k): v for k, v in _read_json(OUT / ".graphify_labels.json.sig").items()}
    cur_sigs = community_member_sigs(communities)
    stale = {cid for cid in labels if saved_sigs.get(cid) != cur_sigs.get(cid)}
    for cid in stale:
        del labels[cid]
    missing = {cid: m for cid, m in communities.items() if cid not in labels}
    labels.update(label_communities_by_hub(G, missing))
    print(
        f"Communities: {len(communities)}; kept {len(communities) - len(missing)} names, "
        f"hub-named {len(missing)} ({len(stale)} changed, {len(missing) - len(stale)} new)"
    )

    detected = detect(
        ROOT,
        extra_excludes=_read_build_excludes(OUT) or None,
        gitignore=_read_build_gitignore(OUT),
    )
    code_files = detected.get("files", {}).get("code", [])
    detection = {
        "files": {"code": code_files, "document": [], "paper": [], "image": []},
        "total_files": len(code_files),
        "total_words": detected.get("total_words", 0),
        "unclassified": detected.get("unclassified", []),
    }
    commit = subprocess.check_output(
        ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True
    ).strip()
    questions = suggest_questions(G, communities, labels)
    report = generate(
        G,
        communities,
        cohesion,
        labels,
        gods,
        surprises,
        detection,
        {"input": tin, "output": 0},
        REPORT_ROOT,
        suggested_questions=questions,
        built_at_commit=commit,
        learning=load_learning_for_report(OUT / "graph.json"),
    )
    if not to_json(
        G,
        communities,
        str(OUT / "graph.json"),
        built_at_commit=commit,
        community_labels=labels,
        force=args.force,
    ):
        print("STOP: to_json refused to shrink graph.json", file=sys.stderr)
        sys.exit(1)

    (OUT / "GRAPH_REPORT.md").write_text(report, encoding="utf-8")
    (OUT / ".graphify_labels.json").write_text(
        json.dumps({str(k): v for k, v in sorted(labels.items())}, ensure_ascii=False, indent=2)
        + "\n",
        encoding="utf-8",
    )
    (OUT / ".graphify_labels.json.sig").write_text(
        json.dumps({str(k): v for k, v in cur_sigs.items()}),
        encoding="utf-8",
    )
    print(
        f"Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} communities"
    )

    summary = diagnose_extraction(merged_out, directed=False, root=str(ROOT))
    print(format_diagnostic_report(summary))

    G_old = json_graph.node_link_graph(old_data, edges="links")
    diff = graph_diff(G_old, G)
    print(diff["summary"])
    if diff.get("removed_nodes"):
        print(
            "removed nodes:",
            len(diff["removed_nodes"]),
            [n["label"] for n in diff["removed_nodes"]][:40],
        )

    cost_path = OUT / "cost.json"
    cost = _read_json(cost_path)
    cost["runs"].append(
        {
            "date": datetime.now(timezone.utc).isoformat(),
            "input_tokens": tin,
            "output_tokens": 0,
            "files": len(dispatched),
        }
    )
    cost["total_input_tokens"] += tin
    _write_json(cost_path, cost, indent=2)
    print(f"cost.json: this run {tin:,} tokens over {len(dispatched)} docs")


def cmd_finish(args: argparse.Namespace) -> None:
    # 1. Fix GRAPH_REPORT.md header
    report_p = OUT / "GRAPH_REPORT.md"
    if report_p.exists():
        text = report_p.read_text(encoding="utf-8")
        lines = text.splitlines(keepends=True)
        if lines and lines[0].startswith("# Graph Report - "):
            m = re.search(r"\((\d{4}-\d{2}-\d{2})\)", lines[0])
            if m:
                lines[0] = f"# Graph Report - Mortar  ({m.group(1)})\n"
            else:
                lines[0] = re.sub(r"^# Graph Report - .*?  \(", "# Graph Report - Mortar  (", lines[0])
            report_p.write_text("".join(lines), encoding="utf-8")
            print("Fixed GRAPH_REPORT.md first line")

    # 2. Check that no committed graph file contains machine paths
    tracked_names = [
        ".graphify_labels.json",
        ".graphify_labels.json.sig",
        "GRAPH_REPORT.md",
        "cost.json",
        "graph.html",
        "graph.json",
        "manifest.json",
    ]
    bad: list[str] = []
    for name in tracked_names:
        p = OUT / name
        if p.exists():
            content = p.read_text(encoding="utf-8", errors="ignore")
            for leak in ("/tmp/", "/home/", "scratchpad"):
                if leak in content:
                    bad.append(f"{name} contains '{leak}'")
    if bad:
        print("FAILED: Committed graph files contain machine paths:", file=sys.stderr)
        for b in bad:
            print(f"  {b}", file=sys.stderr)
        sys.exit(1)

    # 3. Clean up intermediate files
    intermediate_patterns = [
        ".graphify_detect.json",
        ".graphify_incremental.json",
        ".graphify_uncached.txt",
        ".graphify_ast.json",
        ".graphify_extract.json",
        ".graphify_old.json",
        ".graphify_analysis.json",
        ".graphify_semantic*.json",
        ".graphify_chunk_*.json",
        ".graphify_baseline_*.txt",
    ]
    deleted_count = 0
    for pattern in intermediate_patterns:
        for p in OUT.glob(pattern):
            try:
                p.unlink()
                deleted_count += 1
            except OSError as exc:
                print(f"Warning: could not delete {p}: {exc}", file=sys.stderr)
    print(f"Removed {deleted_count} intermediate files")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Patch document nodes in graphify-out without model re-reads"
    )
    subparsers = parser.add_subparsers(dest="subcommand", required=True)

    prepare_p = subparsers.add_parser("prepare", help="Prepare chunks and baselines for docs")
    prepare_p.add_argument("docs", nargs="+", help="Paths to documents to patch")
    prepare_p.set_defaults(func=cmd_prepare)

    check_p = subparsers.add_parser("check", help="Validate chunks against baselines")
    check_p.set_defaults(func=cmd_check)

    merge_p = subparsers.add_parser("merge", help="Merge chunks into graphify-out")
    merge_p.add_argument("--tokens", type=int, default=0, help="Input tokens spent (default: 0)")
    merge_p.add_argument("--force", action="store_true", help="Allow graph to shrink if intentional")
    merge_p.set_defaults(func=cmd_merge)

    finish_p = subparsers.add_parser("finish", help="Fix report header and clean intermediates")
    finish_p.set_defaults(func=cmd_finish)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
