#!/bin/bash


# ----------------------------------------------
# Help users if they run this script incorrectly
# ----------------------------------------------
function usage {
  echo "";
  echo "Usage: ./01.join_and_filter_schemas.sh";
  echo "   or: ./01.join_and_filter_schemas.sh \$ENVIRONMENT_INI";
  echo "";
  echo "Examples:";
  echo "";
  echo "  Using default configuration:";
  echo "       ./01.join_and_filter_schemas.sh";
  echo "       /path/to/01.join_and_filter_schemas.sh";
  echo "";
  echo "  Using custom configuration:";
  echo "       ./01.join_and_filter_schemas.sh my.ini";
  echo "       ./schemas/01.join_and_filter_schemas.sh environment.ini";
  echo "       /path/to/01.join_and_filter_schemas.sh /path/to/custom.ini";
  echo "";
  return 0;
}

# -----------------------------------------------------------------------------------
# Copy schemas into one output folder for later consumption
# Arguments:
#  :: SCHEMA_INPUT_DIRECTORY:                 set in $ENV_CONFIG_DIR/$ENV_CONFIG_FILE
#      - schema input files are consumed from here
#  :: SCHEMA_OUTPUT_DIRECTORY:                set in $ENV_CONFIG_DIR/$ENV_CONFIG_FILE
#      - schema output files are saved to this directory
#  :: SCHEMA_OUTPUT_FILENAME:                 set in $ENV_CONFIG_DIR/$ENV_CONFIG_FILE
#      - schema combined output file will have this name
# -----------------------------------------------------------------------------------
function combine_schemas {
  mkdir -p $SCHEMA_INPUT_DIRECTORY || exit 1;
  mkdir -p $SCHEMA_OUTPUT_DIRECTORY || exit 1;
  echo "deleting $SCHEMA_OUTPUT_DIRECTORY/$SCHEMA_OUTPUT_FILENAME if exists";
  touch "$SCHEMA_OUTPUT_DIRECTORY/$SCHEMA_OUTPUT_FILENAME";
  rm "$SCHEMA_OUTPUT_DIRECTORY/$SCHEMA_OUTPUT_FILENAME";
  echo "creating $SCHEMA_OUTPUT_DIRECTORY/$SCHEMA_OUTPUT_FILENAME from contents of $SCHEMA_INPUT_DIRECTORY";
  for src_schema_filename in `ls $SCHEMA_INPUT_DIRECTORY`; do
    echo -e "\tprocessing $SCHEMA_INPUT_DIRECTORY/$src_schema_filename";
    #cat "$SCHEMA_INPUT_DIRECTORY/$src_schema_filename" \
    #  | grep -Ev "(module|mongoose|require '|process\.env|\.index|\$exists)" \
    #  >> $SCHEMA_OUTPUT_DIRECTORY/$SCHEMA_OUTPUT_FILENAME;
    cat "$SCHEMA_INPUT_DIRECTORY/$src_schema_filename" \
      >> $SCHEMA_OUTPUT_DIRECTORY/$SCHEMA_OUTPUT_FILENAME;
  done

  return 0;
}



# -----------------------------------------------------------------------------------
# Consume schemas to create a filtered fields schema
# Arguments:
#  :: SCHEMA_INPUT_DIRECTORY:                 set in $ENV_CONFIG_DIR/$ENV_CONFIG_FILE
#      - schema input files are consumed from here
#  :: SCHEMA_OUTPUT_DIRECTORY:                set in $ENV_CONFIG_DIR/$ENV_CONFIG_FILE
#      - schema output files are saved to this directory
#  :: SCHEMA_OUTPUT_FILENAME:                 set in $ENV_CONFIG_DIR/$ENV_CONFIG_FILE
#      - schema combined output file will have this name
#  :: SCHEMA_FILTERED_FIELDS_OUTPUT_FILENAME: set in $ENV_CONFIG_DIR/$ENV_CONFIG_FILE
#      - schema filtered fields will be saved within this file
# -----------------------------------------------------------------------------------
function filter_schemas {
  echo "deleting $SCHEMA_OUTPUT_DIRECTORY/$SCHEMA_FILTERED_FIELDS_OUTPUT_FILENAME if exists";
  touch "$SCHEMA_OUTPUT_DIRECTORY/$SCHEMA_FILTERED_FIELDS_OUTPUT_FILENAME";
  rm "$SCHEMA_OUTPUT_DIRECTORY/$SCHEMA_FILTERED_FIELDS_OUTPUT_FILENAME";
  echo "creating $SCHEMA_OUTPUT_DIRECTORY/$SCHEMA_FILTERED_FIELDS_OUTPUT_FILENAME from contents of $SCHEMA_OUTPUT_DIRECTORY/$SCHEMA_FILTERED_FIELDS_OUTPUT_FILENAME";
  cat $SCHEMA_OUTPUT_DIRECTORY/$SCHEMA_OUTPUT_FILENAME \
    | grep -E '(new|Id|_id)' \
    | grep -Ev '-' \
    >> $SCHEMA_OUTPUT_DIRECTORY/$SCHEMA_FILTERED_FIELDS_OUTPUT_FILENAME;

  return 0;
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

# --------------------------------------------------------------
# Perform primary script functions
#  -> combine schemas into one output file for later consumption
#  -> consume schemas to create a filtered fields schema
# --------------------------------------------------------------
combine_schemas;
filter_schemas;

# ----------------------------
# Return to parent context
#  -> Notify user of success
#  -> Go to original directory
# ----------------------------
echo "returning from $SCRIPT_DIR";
popd > /dev/null;
echo "successfully joined schemas to $SCHEMA_OUTPUT_DIRECTORY/$SCHEMA_OUTPUT_FILENAME"
exit 0;
