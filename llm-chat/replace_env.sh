#!/bin/bash

# Replace placeholders with actual environment variable values
sed -i "s/%REACT_APP_API_URL%/$(echo $REACT_APP_API | sed 's/\//\\\//g')/g" /usr/share/nginx/html/index.html