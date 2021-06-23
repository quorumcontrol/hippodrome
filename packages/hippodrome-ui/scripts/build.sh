#!/usr/bin/env bash

set -x -e

pushd ../contracts
yarn install
yarn build
popd

export CI=false
react-scripts build
