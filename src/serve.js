var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var namedserver = "localhost";
var TrackModel;

///SPOTIFY LOGIN VARS/HELPER
var client_id = '9aa54e5b6fac4323951543510f964a82'; // Your client id
var client_secret = 'b69a18826f204d18a52e0b1866bb6d0e'; // Your client secret
var redirect_uri = 'http://'+namedserver+':8888/callback/'; // Your redirect uri

var stateKey = 'spotify_auth_state';
/**
 * Helper - Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

//INIT SERVER
var app = express();

//NEED THE COOKIE PARSER FOR LOGIN
app.use(express.static(__dirname + '/public'))
   .use(cookieParser())
    .use(bodyParser.text());

//DEFINE PATHS
app.get('/login', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // REQUEST AUTH FROM USER
  var scope = 'user-read-private user-read-email playlist-modify-private playlist-modify-private';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

//POST-LOGIN
app.get('/callback', function(req, res) {

  // REQUEST ACCESS/REFRESH TOKENS

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };
    
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
       
        var access_token = body.access_token,
            refresh_token = body.refresh_token;
        
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // USE ACCESS TOKEN TO GET USER INFO FROM SPOTIFY WEB API
        request.get(options, function(error, response, body) {
  
         console.log(body.id);
          mongoose.connect('mongodb://'+namedserver+'/test');
          var db = mongoose.connection;
          db.on('error', console.error.bind(console, 'connection error:'));
          db.once('open', function (callback) {
  
	var trackSchema = mongoose.Schema({
		"name": String,
		"album": String,
		"albumArt": String,
        "artist": String
	});
    var name = body.email.split("\@");
    TrackModel = mongoose.model('Track', trackSchema, name[0]+name[1]);
          
});
     
        });         
         
        // pass to browser
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
   
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    
    });
  }
});

//REFRESH_TOKEN FOR SPOTIFY AUTH
app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

//server path to retrieve documents
	app.get("/getEntry", function(req, res) {
		TrackModel.find(req.query, function(err, track) {
			if (err) {
				console.log(err);
                res.status(500).send("SERV: Query failure");
			} else {
				res.status(200).send(track);         
			}
		});

	});





//server path to save new documents in collection
app.post('/addEntry', function(req, res) {
    'use strict';
    console.log("DATABASE STORE --");
    var obj = JSON.parse(req.body);
    var info = {"name": obj.name, "album": obj.album.name, "albumArt": obj.album.images[obj.album.images.length-1].url, "artist":           obj.artists[0].name };
    var newTrack = new TrackModel(info);
    newTrack.save(function(error, data) {
    if (error) console.log(error);		
    });
    console.log(info);
res.sendStatus(200);
});
    
//server path to delete documents from collection
	app.post("/removeEntry", function(req, res) {
        console.log("DATABASE REM --");
		var oldTrack = new TrackModel(JSON.parse(req.body));
		oldTrack.remove(function(error, data) {
			if (error) console.log(error);            
		});
        res.sendStatus(200);
	});


console.log('Listening on 8888');
app.listen(8888);

