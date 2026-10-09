#!/bin/bash
set -euo pipefail
if [[ "$(uname -s)" != Darwin ]]; then
  echo 'Gerçek iOS Simulator ekranını kaydetmek için macOS gerekir.' >&2
  exit 1
fi
if [[ $# != 1 ]]; then
  echo 'Kullanım: bash scripts/capture-ios-screenshot.sh release/screenshots/iphone-home.png' >&2
  exit 1
fi
mkdir -p "$(dirname "$1")"
xcrun simctl io booted screenshot --type=png "$1"
echo 'Ekran kaydedildi. Simülatör açık ve gerçek uygulama görünür olmalı; mağaza boyutunu ve alfa kanalını kontrol et.'
