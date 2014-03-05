#!/bin/bash
OUTPUTFILE=esbulkimport.txt
rm ${OUTPUTFILE}
touch ${OUTPUTFILE}
for FILE in `ls *.shp`
do
    JSONFILE="${FILE}.json"
    ogr2ogr -f "GeoJSON" ${JSONFILE} ${FILE}
    perl ./elasticsearch_bulk_import_style.pl ${JSONFILE} >> ${OUTPUTFILE}
done
