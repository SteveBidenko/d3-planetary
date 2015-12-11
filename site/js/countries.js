(function () {
    var xmlhttp = new XMLHttpRequest(),
        countriesUrl = 'country_codes.json',
        globe = document.globe,
        countries = {},
        geoPanel = document.getElementById('geoPanel'),
        selectedCountry = document.getElementById('selectedCountry');
    /**
     * Add all the countries to the select with id selectedCountry after download them
     */
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            JSON.parse(xmlhttp.responseText).forEach(function(val) {
                var option = document.createElement("option");
                option.text = val["Country Name"];
                option.value = val["ISO 3166-1-alpha-2 code"];
                selectedCountry.add(option);
                countries[val["ISO 3166-1-alpha-2 code"]] = val["Country Name"];
            });
            /**
             * Rotate the globe when data is arrived
             */
            globe.rotateGlobe(selectedCountry.value);
        };
    };
    /**
     * Start downloading the JSON file
     */
    xmlhttp.open("GET", countriesUrl, true);
    xmlhttp.send();
    /**
     * Add listener to the event onchange. When the select has a new value then rotate the globe
     */
    selectedCountry.addEventListener('change', function (event) {
        globe.rotateGlobe(event.target.value);
    });
    /**
     * Use this function when we need to rotate the globe
     * @param {String} isoCode which is described in ISO-3166-1 alpha-2 code
     */
    globe.rotateGlobe = function(isoCode) {
        var nameSelectedCountry = countries[isoCode];
        /**
         * Look for the geo-coordinates for isoCode in the Google Maps API
         */
        document.geocoder.geocode({'address': nameSelectedCountry}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK && results[0]) {
                var coords = [-results[0].geometry.location.lng(), -results[0].geometry.location.lat()];
                /**
                 * When found coordinates then rotate the globe
                 */
                d3.transition()
                    .duration(1250)
                    .tween('rotate', function() {
                        var projection = globe.projection,
                            r = d3.interpolate(projection.rotate(), coords);

                        return function(t) {
                            projection.rotate(r(t));
                        };
                    })
                    .transition();
                /**
                 * Update geoPanel
                 */
                geoPanel.textContent = nameSelectedCountry + " (" + isoCode + ")";
            }
        });
    };
})();
