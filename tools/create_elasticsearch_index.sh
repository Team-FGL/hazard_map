#!/bin/bash
# require kuromoji plugin

curl -XPUT 'localhost:9200/ksj' -d '{
    "settings": {
        "analysis": {
            "analyzer": {
                "default" : {
                    "type" : "kuromoji"
                }
            }
        }
    }
}'
