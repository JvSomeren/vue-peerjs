#!/usr/bin/env bash
set -e

if [[ -z $1 ]]; then
  echo "Enter new version: "
  read $VERSION
else
  VERSION=$1
fi

read -p "Releasing $VERSION - are you sure? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Releasing $VERSION ..."

  if [[ -z ${SKIP_TESTS} ]]; then
    echo 'Nothing'
    npm run lint
    # npm run flow
    # npm run test -- --coverage
    # npm run test:coverage
    # npm run test:e2e
    # npm run test:ssr
  fi

  # build
  VERSION=${VERSION} npm run build

  # commit
  git add -f \
    dist/*.js
  git commit -m "build: build $VERSION"
  # generate release note
  npm run release:note ${VERSION}
  # tag version
  npm version ${VERSION} --message "build: release $VERSION"

  # publish
  git push origin refs/tags/v${VERSION}
  git push
  npm publish
fi
