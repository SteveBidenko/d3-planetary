#!/bin/bash

SOURCE=http://www.iso.org/iso/home/standards/country_codes/country_names_and_code_elements_txt-temp.htm
wget $SOURCE -O tools/country_codes.csv

LAKES=http://planetaryjs.com/world-110m-withlakes.json
wget $LAKES -O site/lib/world-110m-withlakes.json

npm install
bower install
gulp
nodejs tools/convert-country-codes-to-json.js
