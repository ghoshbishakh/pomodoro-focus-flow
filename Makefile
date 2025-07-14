# Makefile for building a static frontend site

# Define the build command
BUILD_COMMAND = npm run build

# Define the output directory for static files
DIST_DIR = dist

# Default target: build the static site
all: build

# Build the project and output to the dist directory
build:
	$(BUILD_COMMAND)

# Clean up the build artifacts
clean:
	rm -rf $(DIST_DIR)

.PHONY: all build clean