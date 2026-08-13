FROM node:26.7.0-bookworm-slim AS build

ARG SADDLE_VERSION
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --legacy-peer-deps

COPY . .
RUN npm run build:engine

FROM node:26.7.0-bookworm-slim AS runtime

ARG SADDLE_VERSION
LABEL org.opencontainers.image.title="Saddle" \
      org.opencontainers.image.description="Storage-backed browser and compute engine" \
      org.opencontainers.image.source="https://github.com/wenathlan/saddle" \
      org.opencontainers.image.version="$SADDLE_VERSION"

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/dist ./dist

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD ["node", "dist/cli/main.js", "help"]

ENTRYPOINT ["node", "dist/cli/main.js"]
