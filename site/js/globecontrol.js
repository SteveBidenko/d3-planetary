(function() {
    var globe = planetaryjs.planet(),
        container = document.getElementsByClassName('container'),
        canvas = document.getElementById('rotatingGlobe'),
        landscape = window.innerWidth > window.innerHeight, // true if landscape
        canvasSize = (landscape ? (window.innerHeight - 48) : window.innerWidth ) - 2,
        isNetscape = navigator.appName === 'Netscape',
        geoPanel = document.getElementById('geoPanel'),
        geocoder = new google.maps.Geocoder,
        globeRadius = canvasSize / 2,
        geopanelColor = 'black',
        oceanColor = '#2a357d',
        landColor = '#389631',
        xmlhttp = new XMLHttpRequest(),
        countriesUrl = '/lib/country_codes.json',
        countries = {},
        selectedCountry = document.getElementById('selectedCountry');
    /**
     * Init the canvas, geoPanel, container
     */
    canvas.width = canvas.height = canvasSize;
    if (landscape) {
        // We need to set the width of the container. Otherwise the geoPanel sets out of the globe
        (window.innerWidth >= canvasSize * 2) && (container[0].style.width = (canvasSize + globeRadius) + 'px');
    } else {
        container[0].style.width = canvasSize + 'px';
    }
    /**
     * Add all the countries to the select with id selectedCountry after download them
     */
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            JSON.parse(xmlhttp.responseText).forEach(function(value) {
                var option = document.createElement("option"),
                    countryName = value["Country Name"];

                countries[value["ISO 3166-1-alpha-2 code"]] = countryName;
                // cut the countryName to the first comma
                option.text = countryName.split(',')[0];
                option.value = value["ISO 3166-1-alpha-2 code"];
                selectedCountry.add(option);
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
    // The `earth` plugin draws the oceans and the land; it's actually
    // a combination of several separate built-in plugins.
    //
    // Note that we're loading a special TopoJSON file
    // (world-110m-withlakes.json) so we can render lakes.
    globe.loadPlugin(planetaryjs.plugins.earth({
        topojson: { file:   '/lib/world-110m-withlakes.json' },
        oceans:   { fill:   oceanColor },
        land:     { fill:   landColor },
        borders:  { stroke: '#008000' }
    }));
    // Load our custom `lakes` plugin to draw lakes; see below.
    globe.loadPlugin(lakes({
        fill: oceanColor
    }));
    // The `zoom` and `drag` plugins enable
    // manipulating the globe with the mouse.
    globe.loadPlugin(planetaryjs.plugins.zoom({
        scaleExtent: [globeRadius, 20 * globeRadius]
    }));
    /**
     * Add the drag plugin for the globe
     */
    globe.loadPlugin(planetaryjs.plugins.drag({}));
    // Set up the globe's initial scale, offset, and rotation.
    globe.projection.scale(globeRadius).translate([globeRadius, globeRadius]).rotate([0, -10, 0]);

    // Every few hundred milliseconds, we'll draw another random ping.
    var colors = ['red', 'yellow', 'white', 'orange', 'green', 'cyan', 'pink'];

    // The `pings` plugin draws animated pings on the globe.
    globe.loadPlugin(planetaryjs.plugins.pings());
    setInterval(function() {
        var lat = Math.random() * 170 - 85;
        var lng = Math.random() * 360 - 180;
        var color = colors[Math.floor(Math.random() * colors.length)];
        globe.plugins.pings.add(lng, lat, { color: color, ttl: 2000, angle: Math.random() * 10 });
    }, 500);

    /**
     * setup the cursor as pointer while mouse pressing
     */
    canvas.onmousedown = function () { this.style.cursor = "pointer"; };
    /**
     * restore the cursor while mouse releasing
     */
    canvas.onmouseup = function () { this.style.cursor = ""; };
    geoPanel.style.color = geopanelColor;
    /**
     * setup the handler for click to show geo coordinates (longitude, altitude)
     */
    canvas.addEventListener('click', function(event) {
        var x = event[isNetscape ? 'clientX' : 'x'],
            y = event[isNetscape ? 'clientY' : 'y'],
            coordinates;

        x -= this.offsetLeft;
        y -= this.offsetTop;
        coordinates = globe.projection.invert([x, y]);
        geoPanel.textContent = "[" + coordinates.join(",") + "]";

        geocoder.geocode({'location': { lat: coordinates[1], lng: coordinates[0] }}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK && results[0]) {
                var twoLetterCode = getComponent(results, 'country');
                geoPanel.textContent = getComponent(results, 'country', 'long_name');
                // Link from the globe to the tag with id selectedCountry
                selectedCountry.value = twoLetterCode;
                // Rotate the globe
                globe.rotateGlobe(twoLetterCode);
            }
        });
    }, false);

    // Draw that globe!
    globe.draw(canvas);

    // This plugin takes lake data from the special
    // TopoJSON we're loading and draws them on the map.
    function lakes(options) {
        options = options || {};
        var lakes = null;

        return function(planet) {
            planet.onInit(function() {
                /**
                 * We can access the data loaded from the TopoJSON plugin on its namespace on `planet.plugins`.
                 * We're loading a custom TopoJSON file with an object called "ne_110m_lakes".
                 */
                var world = planet.plugins.topojson.world;
                lakes = topojson.feature(world, world.objects.ne_110m_lakes);
            });

            planet.onDraw(function() {
                planet.withSavedContext(function(context) {
                    context.beginPath();
                    planet.path.context(context)(lakes);
                    context.fillStyle = options.fill || 'black';
                    context.fill();
                });
            });
        };
    };
    /**
     * Check argument for NULL value or change all the spaces to empty symbol
     * @param text
     * @returns {boolean}
     */
    function isNullOrWhitespace(text) {
        return text == null ? true : text.replace(/\s/gi, '').length < 1;
    }
    /**
     * Looking for a desired type in the results and getting component using typeName
     * @param {Object} results
     * @param {String} desiredType, for example 'country'
     * @param {?String} typeName, for example 'long_name'. If it doesn't set it is equal to 'short_name'
     * @returns {*}
     */
    function getComponent(results, desiredType, typeName) {
        var address_components = results[0].address_components;

        typeof typeName === 'undefined' && (typeName = 'short_name');
        for (var i = 0; i < address_components.length; i++) {
            var shortname = address_components[i].short_name,
                type = address_components[i].types;

            if (type.indexOf(desiredType) != -1) {
                return isNullOrWhitespace(address_components[i][typeName]) ? shortname : address_components[i][typeName];
            }
        }
    }
    /**
     * Use this function when we need to rotate the globe
     * @param {String} isoCode which is described in ISO-3166-1 alpha-2 code
     */
    globe.rotateGlobe = function(isoCode) {
        var nameSelectedCountry = countries[isoCode];
        /**
         * Look for the geo-coordinates for isoCode in the Google Maps API
         */
        geocoder.geocode({'address': nameSelectedCountry}, function(results, status) {
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

                        return function(t) { projection.rotate(r(t)); };
                    })
                    .transition();
                /**
                 * Update geoPanel
                 */
                geoPanel.textContent = nameSelectedCountry;
            }
        });
    };
})();
