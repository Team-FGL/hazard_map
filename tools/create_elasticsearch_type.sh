#!/bin/bash

curl -XPUT 'http://localhost:9200/ksj/medicalplace/_mapping' -d '
{
    "medicalplace" : {
        "properties": {
            "geometry": {
                "type": "geo_shape",
                        "tree": "quadtree",
            "precision": "1m"

            }
        }
    }
}'
