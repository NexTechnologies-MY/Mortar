# Graphify

`graphify-out/` holds a knowledge graph of this repository. Code files and
documents are nodes; imports, calls and references are edges; related nodes are
grouped into communities. Asking the graph costs a fraction of the tokens that
reading files through repeated searches costs, so agents ask it first.

Install it once with `uv tool install "graphifyy[sql]==0.9.71"` (or
`pipx install "graphifyy[sql]==0.9.71"`), which provides the `graphify` command.
Everyone installs the same version, because a different one extracts the same
code differently and the graph churns. The `sql` extra reads
`server/db/schema.sql`; without it those nodes vanish. In Claude Code, the
`/graphify` skill wraps the same tool; `graphify install --platform claude` adds
it.

## Ask The Graph First

Before searching with grep or opening file after file, query the graph:

```bash
graphify query "how does Today choose each card's next step"
graphify explain "nextStepFor"
graphify path "AskPanel" "createAssistant"
graphify affected "PERSONA_PAGES"
graphify god-nodes
```

- `query` walks the graph breadth first. Add `--dfs` to trace one path, and
  `--budget N` to cap the answer at N tokens.
- `explain` describes one node and its neighbours, `path` finds how two things
  connect, and `affected` lists what a change to something would touch.
- `graphify-out/GRAPH_REPORT.md` is the plain-language overview.

Fall back to grep only when the graph does not answer, or when you need exact
text or line numbers.

## Keep It Current

The graph is committed, so `main` must always carry a current one.

- Refresh it as the last commit of every pull request: rebase on `main`, run
  `graphify update .`, and commit `graphify-out/`. Refreshing inside the pull
  request keeps `main` current without an extra commit, which would redeploy the
  prototype.
- `graphify update .` re-extracts changed code with no model and no key. When a
  pull request changes documents, also run the `/graphify . --update` skill,
  which re-reads changed documents with the model.
- When two pull requests both change `graphify-out/`, do not merge the graph
  files by hand. Take either side, run `graphify update .` again, and commit the
  result.
- `graphify update` refuses to write a graph with fewer nodes. After a refactor
  that deletes code, pass `--force`. Otherwise a refusal means nodes are being
  lost by mistake: check `graphify --version` and the install line above before
  forcing anything.
- Document nodes written by the model must carry `"_origin": "semantic"` in
  `graph.json`. Without it, a node with a line number looks code-extracted, and
  `graphify update` replaces it with bare headings. graphify stamps new nodes
  itself.
- Commit everything `graphify update` writes to `graphify-out/`, including
  `.graphify_labels.json.sig`. It lets the next update keep the name of each
  community that did not change. The dated snapshot folders and `cache/` are
  local and ignored.
- When `.graphifyignore` changes, or `graphify query` cannot find code you know
  exists, rebuild the whole graph with `/graphify .` instead of updating it.

## What The Graph Leaves Out

`.graphifyignore` uses `.gitignore` syntax and applies on top of `.gitignore`.
It keeps out files with no extractable knowledge: images, video and audio, PDFs
and Office files, fonts, archives and binaries, Python bytecode, data dumps, the
precomputed Jev cache (`server/fixtures/jev-cache.json`), lockfiles, vendored
agent tooling and the graph itself. When you add a new kind of generated or
binary file, add it there.
