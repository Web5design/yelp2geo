// Generated by CoffeeScript 1.6.3
(function() {
  var address, config, coords, find, open, q, queue, req, yelp;

  req = require('request');

  queue = require('queue-async');

  config = require('../config');

  open = require('opener');

  yelp = require('yelp').createClient(config);

  coords = function(name, address, data) {
    var feature, lat, loc, lon;
    loc = data.results[0].geometry.location;
    lat = loc.lat;
    lon = loc.lng;
    return feature = {
      type: "Feature",
      properties: {
        name: name,
        address: address,
        lat: "" + lat,
        lon: "" + lon
      },
      geometry: {
        type: "Point",
        coordinates: [lon, lat]
      }
    };
  };

  find = function(name, address, callback, final) {
    var url;
    url = "https://maps.googleapis.com/maps/api/geocode/json?address=\"" + address + "\"&sensor=false";
    return req(url, function(err, res, body) {
      var data, result;
      if (err) {
        return console.log(err);
      } else {
        data = JSON.parse(body);
        if (data.error_message) {
          console.log("Google's Geocoding API says ...");
          return console.log(data.status, data.error_message);
        } else {
          result = callback(name, address, data);
          return final(null, result);
        }
      }
    });
  };

  address = function(b) {
    return b.location.display_address.join(', ');
  };

  q = queue(10);

  exports.map = function(err, geojson) {
    var e, url;
    try {
      url = 'http://geojson.io/#data=data:application/json,';
      return open(url + encodeURIComponent(geojson));
    } catch (_error) {
      e = _error;
      return console.error(e);
    }
  };

  exports.print = function(err, geojson) {
    return console.log(geojson);
  };

  exports.search = function(term, city, callback) {
    var query, render;
    render = function(err, data) {
      var b, i, _ref;
      _ref = data.businesses;
      for (i in _ref) {
        b = _ref[i];
        if (i < 10) {
          q.defer(find, b.name, address(b), coords);
        }
      }
      return q.awaitAll(function(err, results) {
        var geojson, output;
        output = {
          type: "FeatureCollection",
          features: results
        };
        geojson = JSON.stringify(output);
        return callback(err, geojson);
      });
    };
    query = {
      term: term || config["default"].term,
      location: city || config["default"].city
    };
    return yelp.search(query, render);
  };

}).call(this);
