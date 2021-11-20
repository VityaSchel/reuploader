# Build node_modules to avoid installing NPM (additinal container size)

FROM alpine AS stage

RUN 'apk add --update npm'
RUN 'npm i'

# Build aclual container

FROM alpine:3.14

COPY --from=stage /node_modules /node_modules

RUN apk add --no-cache python3 py3-pip nodejs ffmpeg gcc libc-dev
RUN $(which pip) install --user --upgrade streamlink