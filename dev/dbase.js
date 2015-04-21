
var mongoose = require('mongoose');

var TrackModel;
var TrackSchema;

db = mongoose.createConnection();

db.on('error', function() {
//error handling
});

db.once('open', function() {

//how to check if a collection exists
    mongoose.connection.db.listCollection({name: 'auserscollection'})
    .next(function(err, collinfo) {
        if (collinfo) {
            // The collection exists
        }
    });
	
//we can determine what goes in the schema: genre?  album?  url of album art? artist?, etc.
	TrackSchema = mongoose.Schema({
		"name": String,
		"genre": String,
		"albumArt": String,
        "artist": String
	});
    
//if user's collection already exists, should retrieve existing model - test
    var TrackModel = mongoose.model('Track', TrackSchema, 'auserscollection');
    
});

//if this database doesn't exist, I believe it will be created - test
db.open('localhost', 'spotify', port, [opts]);

    
//server needs a path to retrieve documents
	app.get("/getDoc", function(req, res) {
		TrackModel.find(req.query, function(err, musician) {
			if (err) {
				console.log(err);
			} else {
				res.json(musician);
			}
		});
	});

//server needs a path to save new documents in collection
	app.post("/saveDoc", function(req, res) {
		var newTrack = new TrackModel(req.body);
		newTrack.save(function(error, data) {
			if (error) console.log(error);
		});
	});
    
//server needs a path to delete documents from collection?
	app.post("/removeDoc", function(req, res) {
		var oldTrack = new TrackModel(req.body);
		oldTrack.remove(function(error, data) {
			if (error) console.log(error);
		});
	});
