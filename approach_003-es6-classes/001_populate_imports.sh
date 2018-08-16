# Scans files with class exports and put them into a file
# Recommendation: class filenames should be the same name as the schema in it.

IMPORTS_SRC="./imports.out.js";

function populate {
  echo -e 'CLASSES = {}' > $IMPORTS_SRC;

  for exported in $(ls classes | grep -v 'node_modules'); do
    exportedName=$(echo "$exported" | sed 's/\.js//')

    echo $exportedName \
    | sed 's/^/CLASSES.'"$exportedName"' = require(".\/classes\//' \
    | sed 's/$/");/' \
    >> $IMPORTS_SRC;
  done
  echo -e 'module.exports = CLASSES' >> $IMPORTS_SRC;
  echo "done, check $IMPORTS_SRC file"
}

populate
