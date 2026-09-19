FROM oven/bun:1.3.14-alpine AS build
WORKDIR /app
# The prepare script installs git hooks; there is no .git in the image, so skip it.
ENV HUSKY=0
# Workspace manifests first, so the dependency layer is cached until a lockfile or manifest changes.
COPY package.json bun.lock ./
COPY frontend/package.json frontend/
COPY packages/core/package.json packages/core/
COPY packages/jev/package.json packages/jev/
COPY server/package.json server/
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1.3.14-alpine
WORKDIR /app
ENV NODE_ENV=production
# node_modules carries the @mortar/* workspace symlinks; all of packages/ ships so a
# future packages/jev workspace resolves without a Dockerfile change.
COPY --from=build /app/package.json /app/bun.lock ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/server ./server
COPY --from=build /app/frontend/dist ./frontend/dist
EXPOSE 8080
# Runs with DATABASE_URL, TYPESAFE_API_KEY and PORT only.
CMD ["bun", "server/src/index.ts"]
