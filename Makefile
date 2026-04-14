# Presentation Generation Harness -- Build
#
# Usage:
#   make html DIR=/path/to/presentation THEME=bai-flat
#   make pdf  DIR=/path/to/presentation THEME=bai-flat
#   make setup   # npm install

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

.PHONY: help setup html pdf clean check-dir

help:
	@echo ""
	@echo "Presentation Generation Harness"
	@echo "==============================="
	@echo ""
	@echo "Targets:"
	@echo "  setup            Install dependencies (npm install)"
	@echo "  html             Build HTML slides"
	@echo "  pdf              Build PDF slides"
	@echo "  clean            Remove output/ and assembled slides.md"
	@echo ""
	@echo "Required:"
	@echo "  DIR=<path>       Presentation directory (must contain sections/)"
	@echo ""
	@echo "Optional:"
	@echo "  THEME=<name>     Theme name (default: bai-flat)"
	@echo ""

setup:
	npm install

check-dir:
	@test -d "$(DIR)/sections" || (echo "Error: $(DIR)/sections not found" && exit 1)

html: check-dir
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

clean:
	@test -n "$(DIR)" || (echo "Error: DIR is required" && exit 1)
	rm -rf "$(DIR)/output"
	rm -f "$(DIR)/slides.md"
