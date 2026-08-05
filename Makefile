# Presentation Generation Harness -- Build
#
# Usage:
#   make html DIR=/path/to/presentation THEME=bai-flat
#   make pdf  DIR=/path/to/presentation THEME=bai-flat
#   make setup   # brew deps (git-crypt, gnupg, fswatch) + npm ci

TEMPLATE_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
THEME        ?= bai-flat
THEME_DIR    := $(TEMPLATE_DIR)themes/$(THEME)
CONFIG       := $(TEMPLATE_DIR)engine/marp.config.js
SCRIPTS      := $(TEMPLATE_DIR)engine/scripts
SLIDES       := $(DIR)/slides.md
OUTPUT_DIR   := $(DIR)/output
LOCAL_THEME  := $(DIR)/theme.css
MERGED_THEME := $(OUTPUT_DIR)/.merged-theme.css

.DEFAULT_GOAL := help

.PHONY: help setup unlock unlock-help html pdf html-wl pdf-wl lint mocks watch clean check-dir

help:
	@echo ""
	@echo "Presentation Generation Harness"
	@echo "==============================="
	@echo ""
	@echo "Targets:"
	@echo "  setup            Install brew deps + npm ci + attempt git-crypt unlock"
	@echo "  unlock           Attempt git-crypt unlock; print key-setup help on failure"
	@echo "  html             Build HTML slides"
	@echo "  pdf              Build PDF slides"
	@echo "  html-wl          Build whitelabel HTML slides"
	@echo "  pdf-wl           Build whitelabel PDF slides"
	@echo "  lint             Check slide text against .claude/rules/ (exits non-zero on hits)"
	@echo "  mocks            Render draft/mocks/*.excalidraw to images/mocks/*.svg"
	@echo "  watch            Rebuild HTML on every change to sections/, images/ or draft/mocks/"
	@echo "  clean            Remove output/ and assembled slides.md"
	@echo ""
	@echo "Required:"
	@echo "  DIR=<path>       Presentation directory (must contain sections/)"
	@echo ""
	@echo "Optional:"
	@echo "  THEME=<name>     Theme name (default: bai-flat)"
	@echo ""

setup:
	@command -v brew >/dev/null 2>&1 || (echo "Error: Homebrew required. Install from https://brew.sh" && exit 1)
	brew install git-crypt gnupg fswatch
	npm ci
	@$(MAKE) --no-print-directory unlock

unlock:
	@if git-crypt unlock 2>/dev/null; then \
		echo "git-crypt: unlocked."; \
	else \
		$(MAKE) --no-print-directory unlock-help; \
	fi

unlock-help:
	@echo ""
	@echo "git-crypt unlock failed. The repo decryption key is not available on this machine."
	@echo ""
	@echo "Option A: Symmetric key (simplest, if you have a backup)"
	@echo "  1. Copy the backup key from another device to:"
	@echo "       ~/.gnupg/slide-engine-git-crypt.key"
	@echo "  2. Run: git-crypt unlock ~/.gnupg/slide-engine-git-crypt.key"
	@echo ""
	@echo "Option B: GPG private key (transfer from another device)"
	@echo "  On the source device (where the repo is already unlocked):"
	@echo "    gpg --list-secret-keys --keyid-format=long"
	@echo "    gpg --export-secret-keys --armor <KEY_ID> > slide-engine-gpg.asc"
	@echo "    gpg --export-ownertrust > slide-engine-trust.txt"
	@echo "  Transfer slide-engine-gpg.asc + slide-engine-trust.txt securely"
	@echo "  (scp over SSH, encrypted USB, 1Password secure note, etc.)."
	@echo "  On this device:"
	@echo "    gpg --import slide-engine-gpg.asc"
	@echo "    gpg --import-ownertrust slide-engine-trust.txt"
	@echo "    git-crypt unlock"
	@echo "    shred -u slide-engine-gpg.asc slide-engine-trust.txt"
	@echo ""

check-dir:
	@test -d "$(DIR)/sections" || (echo "Error: $(DIR)/sections not found" && exit 1)

lint:
	@bash "$(SCRIPTS)/lint-text.sh" $(if $(DIR),"$(DIR)",presentations)

mocks:
	@test -n "$(DIR)" || (echo "Error: DIR is required" && exit 1)
	@bash "$(SCRIPTS)/mock-export.sh" "$(DIR)" $(if $(FORCE),--force,)

watch: check-dir
	@bash "$(SCRIPTS)/watch.sh" "$(DIR)" "$(THEME)"

html: check-dir
	@bash "$(SCRIPTS)/lint-text.sh" -w -q "$(DIR)"
	@bash "$(SCRIPTS)/assemble-sections.sh" "$(DIR)"
	@node "$(SCRIPTS)/render-mermaid.js" "$(DIR)" || true
	@mkdir -p "$(OUTPUT_DIR)"
	@node "$(SCRIPTS)/merge-theme.js" \
		--base "$(THEME_DIR)/theme.css" \
		--local "$(LOCAL_THEME)" \
		--theme-dir "$(THEME_DIR)" \
		--slides-dir "$(abspath $(DIR))" \
		--output "$(MERGED_THEME)"
	THEME_DIR="$(THEME_DIR)" npx marp --no-stdin \
		--config "$(CONFIG)" \
		--theme-set "$(MERGED_THEME)" \
		--html --allow-local-files \
		--output "$(OUTPUT_DIR)/slides.html" \
		"$(SLIDES)"
	@node "$(SCRIPTS)/marp-postprocess.js" \
		"$(OUTPUT_DIR)/slides.html" --theme-dir "$(THEME_DIR)"
	@echo "Built: $(OUTPUT_DIR)/slides.html"

pdf: check-dir
	@bash "$(SCRIPTS)/assemble-sections.sh" "$(DIR)"
	@node "$(SCRIPTS)/render-mermaid.js" "$(DIR)" || true
	@mkdir -p "$(OUTPUT_DIR)"
	@node "$(SCRIPTS)/merge-theme.js" \
		--base "$(THEME_DIR)/theme.css" \
		--local "$(LOCAL_THEME)" \
		--theme-dir "$(THEME_DIR)" \
		--slides-dir "$(abspath $(DIR))" \
		--output "$(MERGED_THEME)"
	THEME_DIR="$(THEME_DIR)" npx marp --no-stdin \
		--config "$(CONFIG)" \
		--theme-set "$(MERGED_THEME)" \
		--html --pdf --allow-local-files \
		--output "$(OUTPUT_DIR)/slides.pdf" \
		"$(SLIDES)"
	@echo "Built: $(OUTPUT_DIR)/slides.pdf"

html-wl: check-dir
	@bash "$(SCRIPTS)/assemble-sections.sh" "$(DIR)"
	@node "$(SCRIPTS)/render-mermaid.js" "$(DIR)" || true
	@bash "$(SCRIPTS)/build-variant.sh" "$(DIR)" whitelabel
	@mkdir -p "$(OUTPUT_DIR)"
	@node "$(SCRIPTS)/merge-theme.js" \
		--base "$(THEME_DIR)/theme.css" \
		--local "$(LOCAL_THEME)" \
		--theme-dir "$(THEME_DIR)" \
		--slides-dir "$(abspath $(DIR))" \
		--output "$(MERGED_THEME)"
	THEME_DIR="$(THEME_DIR)" npx marp --no-stdin \
		--config "$(CONFIG)" \
		--theme-set "$(MERGED_THEME)" \
		--html --allow-local-files \
		--output "$(OUTPUT_DIR)/slides-wl.html" \
		"$(SLIDES)"
	@node "$(SCRIPTS)/marp-postprocess.js" \
		"$(OUTPUT_DIR)/slides-wl.html" --theme-dir "$(THEME_DIR)"
	@echo "Built: $(OUTPUT_DIR)/slides-wl.html"

pdf-wl: check-dir
	@bash "$(SCRIPTS)/assemble-sections.sh" "$(DIR)"
	@node "$(SCRIPTS)/render-mermaid.js" "$(DIR)" || true
	@bash "$(SCRIPTS)/build-variant.sh" "$(DIR)" whitelabel
	@mkdir -p "$(OUTPUT_DIR)"
	@node "$(SCRIPTS)/merge-theme.js" \
		--base "$(THEME_DIR)/theme.css" \
		--local "$(LOCAL_THEME)" \
		--theme-dir "$(THEME_DIR)" \
		--slides-dir "$(abspath $(DIR))" \
		--output "$(MERGED_THEME)"
	THEME_DIR="$(THEME_DIR)" npx marp --no-stdin \
		--config "$(CONFIG)" \
		--theme-set "$(MERGED_THEME)" \
		--html --pdf --allow-local-files \
		--output "$(OUTPUT_DIR)/slides-wl.pdf" \
		"$(SLIDES)"
	@echo "Built: $(OUTPUT_DIR)/slides-wl.pdf"

clean:
	@test -n "$(DIR)" || (echo "Error: DIR is required" && exit 1)
	rm -rf "$(DIR)/output"
	rm -f "$(DIR)/slides.md"
