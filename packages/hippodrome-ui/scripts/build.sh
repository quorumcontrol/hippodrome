#!/usr/bin/env bash

set -x -e

export CI=false
react-scripts build
