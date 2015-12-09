Demo with d3js and planetaryjs library
=====================

### Install

You need doing to run the demo the following steps:

1) Install all the files for the project from Internet
```
npm install
cd tools; ./update_country_codes.sh
```

2) Copy d3-planetary.nginx.conf to the nginx configuration directory, usually /etc/nginx/site-enabled.
If there is no directory nginx in /etc then you probably don't have nginx. You can install it using
```
sudo apt-get install nginx
```

3) Edit /etc/nginx/site-enabled/d3-planetary.nginx.conf and set the right paths in that file

4) Start or restart nginx using
```
sudo service nginx start
```

5) Open http://localhost:7000 in your browser and enjoy
