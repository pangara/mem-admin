'use strict';

var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var Promise     = require('promise');
var _           = require('lodash');


var defaultConnectionString = 'mongodb://localhost:27017/mem-dev';
var username                = '';
var password                = '';
var host                    = '';
var db                      = '';
var url                     = '';
var test                    = false;

var args = process.argv.slice(2);
if (args.length !== 4) {
	console.log('Using default localhost connection:', defaultConnectionString);
	url  = defaultConnectionString;
	test = args[0] === 'test';
} else {
	username = args[0];
	password = args[1];
	host     = args[2];
	db       = args[3];
	test     = args[4] === 'test';
	url      = 'mongodb://' + username + ':' + password + '@' + host + ':27017/' + db;
}

var authorizations = require(test ? './test_authorizations.json' : './authorizations.json');
var inspections    = require(test ? './test_inspections.json'    : './inspections.json');
var otherDocuments = require(test ? './test_otherdocuments.json' : './otherdocuments.json');

var update = function(id, displayName) {
	return new Promise(function(resolve, reject) {
		MongoClient.connect(url, function(err, db) {

			var collection = db.collection('documents');

			collection.updateOne({ _id: ObjectID.createFromHexString(id) }, { $set: { displayName: displayName } } , { }, function(err, obj) {
				db.close();
				if (err) {
					console.log('x Failed to update document ' + id + ' to ' + displayName);
					reject(err);
				} else if (obj.result.n === 0) {
					console.log('x Failed to find document ' + id);
					resolve(obj);
				} else {
					console.log(': Successfully updated document ' + id + ' to ' + displayName);
					resolve(obj);
				}
			});

		});
	});
};

var addDocumentsToArray = function(parent, updateArray) {
	_.each(parent.followUpDocuments, function(d) {
		var matches = d.ref.match('api/document/(.+)/fetch$');
		if (matches) {
			updateArray.push(update(matches[1], d.name));
		}
	});
};

var run = function() {
	return new Promise(function (resolve, reject) {
		console.log('start');
		var updates = [];
		Promise.resolve()
			.then(function() {
				console.log('1 - get authorization documents');
				_.each(authorizations, function(a) {
					addDocumentsToArray(a, updates);
				});
			})
			.then(function() {
				console.log('2 - get inspection documents');
				_.each(inspections, function(i) {
					addDocumentsToArray(i, updates);
				});
			})
			.then(function() {
				console.log('3 - get other documents');
				_.each(otherDocuments, function(o) {
					addDocumentsToArray(o, updates);
				});
			})
			.then(function() {
				console.log('4 - update documents');
				return Promise.all(updates);
			})
			.then(function() {
				console.log('end');
				resolve(':)');
			}, function(err) {
				console.log('ERROR: end');
				console.log('ERROR: end err = ', JSON.stringify(err));
				reject(err);
			});
	});
};


run().then(function(success) {
	console.log('success ', success);
	process.exit();
}).catch(function(error) {
	console.error('error ', error);
	process.exit();
});
