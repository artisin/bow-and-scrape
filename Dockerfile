########
# BASE
########
FROM node:16-bullseye-slim as base

WORKDIR /usr/app

########
# DEPS
########
FROM base as deps

RUN apt-get update \
    && apt-get install -y \
    tini \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json for version number
COPY package*.json ./

RUN npm ci --only=production && $(npx install-browser-deps) \
    # Heavy inspiration from: https://github.com/ulixee/secret-agent/blob/main/Dockerfile
    && groupadd -r scrape \
    && useradd -r -g scrape -G audio,video scrape \
    && mkdir -p /home/scrape/Downloads \
    && mkdir -p /home/scrape/.cache \
    && chown -R scrape:scrape /home/scrape \
    && mv ~/.cache/secret-agent /home/scrape/.cache/ \
    && chmod 777 /tmp \
    && chmod -R 777 /home/scrape/.cache/secret-agent

########
# BUILD
########
FROM base as build

# Copy all source files
COPY package*.json tsconfig.json ./

# Add dev deps
RUN npm ci

# Copy source code
COPY src src
COPY __scripts__ __scripts__

RUN npm run build


########
# DEPLOY
########
FROM deps as deploy

# Add below to run as unprivileged user.
USER scrape

# Steal compiled code from build image
COPY --from=build /usr/app/dist ./dist 

LABEL org.opencontainers.image.title="bow-and-scrape" \ 
    org.opencontainers.image.url="https://github.com/artisin/bow-and-scrape" \
    org.opencontainers.image.description="Scrape with secret-agent" \
    org.opencontainers.image.name="bow-and-scrape" \
    org.opencontainers.image.base.name="node:16-bullseye-slim"

ARG COMMIT_SHA=""

ENV NODE_ENV=production \
    CACHE_DIR=/bow-and-scrape \
    COMMIT_SHA=${COMMIT_SHA}

ENV    PORT 8080
EXPOSE $PORT

VOLUME [ "/bow-and-scrape" ]

ENTRYPOINT ["tini", "--"]

CMD ["node", "__scripts__/server.js"]