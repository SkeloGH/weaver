#!/bin/bash


# ----------------------------------------------
# Help users if they run this script incorrectly
# ----------------------------------------------
function usage {
  echo "";
  echo "Usage: ./001_populate_imports.sh";
  echo "   or: ./001_populate_imports.sh \$ENVIRONMENT_INI";
  echo "";
  echo "Examples:";
  echo "";
  echo "  Using default configuration:";
  echo "       ./001_populate_imports.sh";
  echo "       /path/to/001_populate_imports.sh";
  echo "";
  echo "  Using custom configuration:";
  echo "       ./001_populate_imports.sh my.ini";
  echo "       ./schemas/001_populate_imports.sh environment.ini";
  echo "       /path/to/001_populate_imports.sh /path/to/custom.ini";
  echo "";
  return 0;
}

# ---------------------------------------------------------------------------
# Combine schemas into a coffee file to import them all
# Arguments:
#  :: IMPORTS_SRC_DIRECTORY:          set in $ENV_CONFIG_DIR/$ENV_CONFIG_FILE
#      - schema inputs are pulled from here
#  :: IMPORTS_OUT_DIRECTORY:          set in $ENV_CONFIG_DIR/$ENV_CONFIG_FILE
#      - coffee file is placed in this directory
#  :: IMPORTS_OUT_SCHEMA_DIRECTORY:   set in $ENV_CONFIG_DIR/$ENV_CONFIG_FILE
#      -
#  :: IMPORTS_OUT_COFFEE:             set in $ENV_CONFIG_DIR/$ENV_CONFIG_FILE
#      - coffee file will use this name
# ---------------------------------------------------------------------------
function populate {
  mkdir -p $IMPORTS_OUT_DIRECTORY || exit 1;
  mkdir -p $IMPORTS_OUT_SCHEMA_DIRECTORY || exit 1;
  mkdir -p $IMPORTS_SRC_DIRECTORY || exit 1;
  echo "creating import file for schemas from $IMPORTS_SRC_DIRECTORY";
  echo 'SCHEMAS = {}' > $IMPORTS_OUT_DIRECTORY/$IMPORTS_OUT_COFFEE;
  for schema in `ls $IMPORTS_SRC_DIRECTORY | grep -v node_modules`; do
    schemaName=`echo "$schema" | sed 's/\.coffee//'`;
    echo "SCHEMAS.$schemaName = require \"$IMPORTS_OUT_SCHEMA_DIRECTORY/$schemaName\"" \
      >> $IMPORTS_OUT_DIRECTORY/$IMPORTS_OUT_COFFEE;
    echo -e "\tcopying ${schema} from $IMPORTS_SRC_DIRECTORY to $IMPORTS_OUT_SCHEMA_DIRECTORY";
    cp $IMPORTS_SRC_DIRECTORY/$schema $IMPORTS_OUT_SCHEMA_DIRECTORY/$schema;
  done
  echo 'module.exports = SCHEMAS' >> $IMPORTS_OUT_DIRECTORY/$IMPORTS_OUT_COFFEE;
  echo "populate schema file saved to $IMPORTS_OUT_DIRECTORY/$IMPORTS_OUT_COFFEE";
  return 0;
}

# ----------------------------------------------------------------------------------
# Replace configuration placeholders in template with values 
#   from environment config/ini file
# Positional Arguments:
#  $1 :: .ini file directory path
#  $2 :: .ini file name with configuration values to fill in output from template
#  $3 :: base template input file directory path
#  $4 :: base template input file name used to create output file with
#  $5 :: output file directory path
#  $6 :: output file name with populated values from template and .ini
#  -> create a modified template file with values populated and save the output file 
#     wherever specified
# ----------------------------------------------------------------------------------
function fill_template {
  local _INI_FILE_SRC_DIR=$1;
  local _INI_FILE_SRC_FILE=$2;
  local _TEMPLATE_FILE_SRC_DIR=$3;
  local _TEMPLATE_FILE_SRC_FILE=$4;
  local _OUTPUT_FILE_SRC_DIR=$5;
  local _OUTPUT_FILE_SRC_FILE=$6;

  rm "${_OUTPUT_FILE_SRC_DIR}/${_OUTPUT_FILE_SRC_FILE}";
  eval "echo \"$(cat ${_TEMPLATE_FILE_SRC_DIR}/${_TEMPLATE_FILE_SRC_FILE})\"" \
    >> "${_OUTPUT_FILE_SRC_DIR}/${_OUTPUT_FILE_SRC_FILE}";
}

function run_imports2dot_coffee {
  # TODO: figure out how to run it normally before attempting automation
  : # this is a noop (no operation) character, placeholder
  : # 1. upstream repos need to be installed via npm. it appears they link correctly when using full filepaths
  : # 2. this repostory needs to be running with correct version of nvm
  : # 3. this repository should have node deps installed
  : # 4. use the node_modules coffee script binary to run script with
}

# ---------------------------------
# Set up script context
# Arguments:
#  :: [OPTIONAL] ${environment}.ini
#      - config file to load
#  -> load arguments
#  -> use defaults where unset
#  -> load configuration file
#  -> move to working directory
#  -> load nvm
# ---------------------------------
export SCRIPT_DIR="`dirname $0`";
export SCRIPT_NAME=$0;
export ENV_CONFIG_FILE=$1;
export ENV_CONFIG_DIR="";
if [ "$ENV_CONFIG_FILE" = "" ]; then
  ENV_CONFIG_FILE="default.ini";
  ENV_CONFIG_DIR="$SCRIPT_DIR/..";
else
  ENV_CONFIG_DIR="`dirname $ENV_CONFIG_FILE`";
  ENV_CONFIG_FILE="`basename $ENV_CONFIG_FILE`";
fi
if [ ! -f "$ENV_CONFIG_DIR/$ENV_CONFIG_FILE" ]; then
  echo "$ENV_CONFIG_DIR/$ENV_CONFIG_FILE configuration file not found" >&2;
  usage;
  exit 1;
fi
echo "running $SCRIPT_NAME";
echo "loading $ENV_CONFIG_DIR/$ENV_CONFIG_FILE";
source <(grep = "$ENV_CONFIG_DIR/$ENV_CONFIG_FILE");
echo "entering $SCRIPT_DIR";
pushd $SCRIPT_DIR > /dev/null;

# -------------------------------------------------------------
# Perform primary script functions
#  -> since all schemas have a module.export, scan them and put
#     them into a file using coffee as they've written it
# -------------------------------------------------------------
populate;
fill_template $ENV_CONFIG_DIR \
  $ENV_CONFIG_FILE \
  $IMPORTS2DOT_TEMPLATE_DIR \
  $IMPORTS2DOT_TEMPLATE \
  $IMPORTS2DOT_OUT_DIRECTORY \
  $IMPORTS2DOT_OUT_COFFEE;

# ----------------------------
# Return to parent context
#  -> Notify user of success
#  -> Go to original directory
# ----------------------------
echo "returning from $SCRIPT_DIR";
popd > /dev/null;
echo "successfully joined schemas to $SCHEMA_OUTPUT_DIRECTORY/$SCHEMA_OUTPUT_FILENAME"
exit 0;
