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
     wget \
    && rm -rf /var/lib/apt/lists/*

# https://github.com/Yelp/dumb-init
RUN wget -O /usr/local/bin/dumb-init \
      https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64 && \
    chmod +x /usr/local/bin/dumb-init

# Copy package.json for version number
COPY package*.json ./

RUN npm ci --only=production && $(npx install-browser-deps) \
    # Heavy inspiration from: https://github.com/ulixee/secret-agent/blob/main/Dockerfile
    && groupadd -r scrape \
    && useradd -r -g scrape -G audio,video scrape \
    && mkdir -p /home/scrape/Downloads \
    && mkdir -p /home/scrape/build \
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
COPY Makefile package*.json tsconfig.json ./

# Add dev deps
RUN npm ci

# Copy source code
COPY src src

RUN make build


########
# DEPLOY
########
FROM deps as deploy

# Add below to run as unprivileged user.
USER scrape


# Steal compiled code from build image
COPY --from=build /usr/app/dist ./build/dist 


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


# ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
ENTRYPOINT ["tail", "-f", "/dev/null"]

# CMD ["node"]
# CMD ["node", "./__scripts__/server.js"]