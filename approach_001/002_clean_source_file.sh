#! /bin/bash

cat 'all_schemas.out' | grep -E '(new|Id|_id)'| grep -Ev '-' > 'filtered_fields.out'