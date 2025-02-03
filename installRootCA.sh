#!/usr/bin/env bash
set -Eeuo pipefail

sudo cp cert/rootCA.crt /usr/local/share/ca-certificates
sudo update-ca-certificates
sudo rm /usr/local/share/ca-certificates/rootCA.crt