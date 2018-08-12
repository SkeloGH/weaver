#! /bin/bash

WD=$(pwd)
SOURCE="$WD/schemas"
DEST="$WD/all_schemas.out"
echo '' > $DEST
cd $SOURCE;
for dir in $(ls);
  do
    cat $dir | grep -Ev "(module|mongoose|require '|process\.env|\.index|\$exists)" >> $DEST
  done
