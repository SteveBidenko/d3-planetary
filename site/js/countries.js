(function () {
    var xmlhttp = new XMLHttpRequest(),
        countriesUrl = 'country_codes.json',
        countries = {},
        selectedCountry = document.getElementById('selectedCountry');

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            JSON.parse(xmlhttp.responseText).forEach(function(val) {
                var option = document.createElement("option");
                option.text = val["Country Name"];
                option.value = val["ISO 3166-1-alpha-2 code"];
                selectedCountry.add(option);
                countries[val["ISO 3166-1-alpha-2 code"]] = val["Country Name"];
            });
            // console.log(countries);
        };
    };

    xmlhttp.open("GET", countriesUrl, true);
    xmlhttp.send();

})();
