#!/bin/bash

# Provide the path to your .env file
ENV_FILE_PATH=".env"  # Change this accordingly

# Write environment variables to the .env file
echo "# This file is autogenerated, any changes will be overwritten" > $ENV_FILE_PATH
for var in $(env | grep -o '^[^=]*') ; do
    echo "${var}=${!var}" >> $ENV_FILE_PATH
done

echo "Environment variables have been written to .env file."