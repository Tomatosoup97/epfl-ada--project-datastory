#!/bin/bash
set -e

docker run --rm \
  -it \
  --volume="$PWD:/srv/jekyll" \
  --volume="$PWD/vendor/bundle:/usr/local/bundle" \
  --publish 127.0.0.1:4000:4000 \
  jekyll/jekyll \
  bash
