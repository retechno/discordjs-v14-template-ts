#!/bin/bash  

# Name or ID of the container  
CONTAINER_NAME="api_v1.0.7"  

# Restart the container  
docker restart $CONTAINER_NAME  

# Check if the container restarted successfully  
if [ $? -eq 0 ]; then  
    echo "Container $CONTAINER_NAME restarted successfully."  
else  
    echo "Failed to restart container $CONTAINER_NAME."  
fi