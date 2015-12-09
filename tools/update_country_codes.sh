#!/bin/bash

SOURCE=http://www.iso.org/iso/home/standards/country_codes/country_names_and_code_elements_txt-temp.htm

wget $SOURCE -O country_codes.csv

nodejs convert-country-codes-to-json.js
