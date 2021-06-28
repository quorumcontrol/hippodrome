#!/usr/bin/env bash

set -x -e

pushd ../contracts
export FIRST_RUN=true
yarn install || true #WTF netlify? why you no build
yarn build
popd

export CI=false
react-scripts build
