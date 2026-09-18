FROM oven/bun:1.3.14-alpine AS build
WORKDIR /app
# The prepare script installs git hooks; there is no .git in the image, so skip it.
ENV HUSKY=0
# Workspace manifests first, so the dependency layer is cached until a lockfile or manifest changes.
COPY package.json bun.lock ./
COPY frontend/package.json frontend/
COPY packages/core/package.json packages/core/
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist/ /usr/share/nginx/html/
EXPOSE 8080
