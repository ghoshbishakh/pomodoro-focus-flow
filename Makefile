# Simple Makefile for Next.js project

# Default target
all: help

# Build the application
build:
	@echo "Building Next.js application..."
	@npm run build

# Export the application to a static site
export:
	@echo "Exporting to static site..."
	@npm run build
	@echo "Static site exported to ./out directory."

# Help
help:
	@echo "Available targets:"
	@echo "  build   - Build the Next.js application"
	@echo "  export  - Export the application as a static site to the 'out' directory"
