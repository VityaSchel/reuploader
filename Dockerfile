# Build node_modules to avoid installing NPM (additinal container size)

FROM alpine AS stage

WORKDIR /app
COPY . /app

RUN /bin/sh -c 'apk add --update npm'
RUN /bin/sh -c 'npm i'

# Build aclual container

FROM alpine:3.14

COPY . /app
COPY --from=stage /app/node_modules /app/node_modules
WORKDIR /app

RUN /bin/sh -c 'apk add --no-cache python3 py3-pip nodejs ffmpeg gcc libc-dev'
RUN /bin/sh -c '$(which pip) install --user --upgrade streamlink'