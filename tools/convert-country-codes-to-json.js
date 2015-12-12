// converter CSV to JSON
var Converter = require("csvtojson").Converter,
    converter = new Converter({
        delimiter: ';',
        toArrayString: true
    }),
    readStream = require("fs").createReadStream("tools/country_codes.csv"),
    writeStream = require("fs").createWriteStream("site/lib/country_codes.json");

// end_parsed will be emitted once parsing finished
converter.on("end_parsed", function (jsonArray) {
   console.log(jsonArray);
});

//read from file and
readStream.pipe(converter).pipe(writeStream);
