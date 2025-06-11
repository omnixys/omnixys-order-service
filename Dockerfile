# syntax=docker/dockerfile:1.14.0
ARG NODE_VERSION=23.10.0

# ---------------------------------------------------------------------------------------
# Stage 1: dist (Build)
# ---------------------------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS dist
WORKDIR /home/node
USER node

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY --chown=node:node . .
RUN npm run build

# ---------------------------------------------------------------------------------------
# Stage 2: dependencies (Production Node Modules only)
# ---------------------------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS dependencies
WORKDIR /home/node
USER node

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --omit=dev --omit=peer --no-audit --no-fund

# ---------------------------------------------------------------------------------------
# Stage 3: final
# ---------------------------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS final
LABEL org.opencontainers.image.title="order" \
      org.opencontainers.image.description="Appserver order" \
      org.opencontainers.image.version="2025.05.16" \
      org.opencontainers.image.licenses="GPL-3.0-or-later" \
      org.opencontainers.image.authors="caleb.gyamfi@omnixys.com"

WORKDIR /opt/app
RUN apt-get update && \
    apt-get install -y --no-install-recommends dumb-init wget && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/*

USER node

COPY --from=dependencies --chown=node:node /home/node/node_modules ./node_modules
COPY --from=dist --chown=node:node /home/node/dist ./dist
COPY --chown=node:node package.json ./

EXPOSE 3000
ENTRYPOINT ["dumb-init", "/usr/local/bin/node", "dist/main.js"]
