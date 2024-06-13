#!/bin/bash

if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

if [ -z "$DATABASE_URL" ] || [ -z "$DATABASE_NAME" ] || [ -z "$DATA_DIRECTORY" ]; then
    if [ -z "$DATABASE_URL" ]; then
        echo "DATABASE_URL is not set in .env file"
    fi
    if [ -z "$DATABASE_NAME" ]; then
        echo "DATABASE_NAME is not set in .env file"
    fi
    if [ -z "$DATA_DIRECTORY" ]; then
        echo "DATA_DIRECTORY is not set in .env file"
    fi
    exit 1
fi

# Check if a version parameter is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <version>"
    exit 1
fi

VERSION="$1"
VERSION_DIRECTORY="$DATA_DIRECTORY/$VERSION"

# Check if the specified version directory exists
if [ ! -d "$VERSION_DIRECTORY" ]; then
    echo "Version '$VERSION' not found in '$DATA_DIRECTORY'"
    exit 1
fi

# Import all collections to MongoDB
mongorestore --verbose --uri="$DATABASE_URL" "$VERSION_DIRECTORY/$DATABASE_NAME"