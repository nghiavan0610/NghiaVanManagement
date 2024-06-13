#!/bin/bash

if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

if [ -z "$DATABASE_URL" ] || [ -z "$DATA_DIRECTORY" ]; then
    if [ -z "$DATABASE_URL" ]; then
        echo "DATABASE_URL is not set in .env file"
    fi
    if [ -z "$DATA_DIRECTORY" ]; then
        echo "DATA_DIRECTORY is not set in .env file"
    fi
    exit 1
fi

# Add version information with the current date and time
VERSION=$(date +"%Y-%m-%d")
OUTPUT_DIRECTORY_WITH_VERSION="$DATA_DIRECTORY/$VERSION"

# Ensure the output directory exists
mkdir -p "$OUTPUT_DIRECTORY_WITH_VERSION"

# Export all collections to JSON files
mongodump --verbose --uri="$DATABASE_URL" --out "$OUTPUT_DIRECTORY_WITH_VERSION"
