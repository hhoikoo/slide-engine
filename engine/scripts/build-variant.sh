#!/usr/bin/env bash
set -euo pipefail

# build-variant.sh -- preprocess slides.md for vendor or whitelabel build variants.
#
# Strips conditional blocks and applies term substitutions based on variant type.
# Reads substitution rules from variants.yaml (or variants.json) in the presentation dir.
#
# Usage: build-variant.sh <presentation-dir> <vendor|whitelabel>
#
# If no variants.yaml/json exists, the script is a no-op (copies slides.md unchanged).

PRES_DIR="${1:?Usage: build-variant.sh <presentation-dir> <vendor|whitelabel>}"
VARIANT="${2:?Usage: build-variant.sh <presentation-dir> <vendor|whitelabel>}"
SLIDES="${PRES_DIR}/slides.md"

if [ ! -f "${SLIDES}" ]; then
  echo "build-variant: ${SLIDES} not found" >&2
  exit 1
fi

if [ "${VARIANT}" != "vendor" ] && [ "${VARIANT}" != "whitelabel" ]; then
  echo "build-variant: variant must be 'vendor' or 'whitelabel', got '${VARIANT}'" >&2
  exit 1
fi

# Find variants config
VARIANTS_CONFIG=""
if [ -f "${PRES_DIR}/variants.yaml" ]; then
  VARIANTS_CONFIG="${PRES_DIR}/variants.yaml"
elif [ -f "${PRES_DIR}/variants.json" ]; then
  VARIANTS_CONFIG="${PRES_DIR}/variants.json"
fi

# If no config, no-op
if [ -z "${VARIANTS_CONFIG}" ]; then
  exit 0
fi

CONTENT=$(cat "${SLIDES}")

if [ "${VARIANT}" = "vendor" ]; then
  # Strip whitelabel-only blocks (including markers)
  CONTENT=$(echo "${CONTENT}" | sed '/<!-- whitelabel-start -->/,/<!-- whitelabel-end -->/d')
  # Remove vendor markers but keep content between them
  CONTENT=$(echo "${CONTENT}" | sed '/<!-- vendor-start -->/d; /<!-- vendor-end -->/d')
elif [ "${VARIANT}" = "whitelabel" ]; then
  # Strip vendor-only blocks (including markers)
  CONTENT=$(echo "${CONTENT}" | sed '/<!-- vendor-start -->/,/<!-- vendor-end -->/d')
  # Remove whitelabel markers but keep content between them
  CONTENT=$(echo "${CONTENT}" | sed '/<!-- whitelabel-start -->/d; /<!-- whitelabel-end -->/d')

  # Apply term substitutions from config
  if [ -n "${VARIANTS_CONFIG}" ]; then
    # Use node to parse yaml/json and apply substitutions
    CONTENT=$(echo "${CONTENT}" | node -e "
const fs = require('fs');
const configPath = '${VARIANTS_CONFIG}';
const config = configPath.endsWith('.json')
  ? JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  : null;

// For YAML, parse manually (key: value lines under substitutions:)
let subs = {};
if (config && config.substitutions) {
  subs = config.substitutions;
} else if (!config) {
  const yaml = fs.readFileSync(configPath, 'utf-8');
  const lines = yaml.split('\n');
  let inSubs = false;
  for (const line of lines) {
    if (/^substitutions:/.test(line)) { inSubs = true; continue; }
    if (inSubs && /^\S/.test(line)) { inSubs = false; continue; }
    if (inSubs) {
      const m = line.match(/^\s+\"?(.+?)\"?\s*:\s*\"?(.+?)\"?\s*$/);
      if (m) subs[m[1]] = m[2];
    }
  }
}

let input = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', d => input += d);
process.stdin.on('end', () => {
  // Sort by key length descending so longer matches replace first
  const keys = Object.keys(subs).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    input = input.split(k).join(subs[k]);
  }
  process.stdout.write(input);
});
")
  fi
fi

echo "${CONTENT}" > "${SLIDES}"
