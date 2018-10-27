# since all schemas have a module.export, scan them and put them into a file
# will be using coffee as they're written in it

SRC_DIR='../approach_002-schemas'
IMPORTS_SRC="$SRC_DIR/imports.out.coffee";

function populate {
  cd '../schemas';
  echo 'SCHEMAS = {}' > $IMPORTS_SRC;

  for schema in $(ls | grep -v 'node_modules'); do
    schemaName=$(echo "$schema" | sed 's/\.coffee//')

    echo $schemaName \
    | sed 's/^/SCHEMAS.'"$schemaName"' = require "..\/schemas\//' \
    | sed 's/$/"/' \
    >> $IMPORTS_SRC;
  done
  echo 'module.exports = SCHEMAS' >> $IMPORTS_SRC;
  echo "done, check $IMPORTS_SRC file"
  # get back
  cd $SRC_DIR
}

populate
