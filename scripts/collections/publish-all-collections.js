'use strict';

var Promise      = require('es6-promise').Promise;
var RequestRetry = require('requestretry');
var _            = require('lodash');

//
// The args are the MEM hostname and sessionId. (Log in to MEM and get the sessionID from cookies.)
//
//   node publish-all-collections.js mem-admin-dev.pathfinder.gov.bc.ca s%3Asls3VeZJA3yS5KdnNXHY_PuXVB1TxTND.TIB3XwtrJBjlvaWnsJEcfaMKVtMm5TFWAi8YUEcN910
//

var apiHost = 'http://' + process.argv[2];
var cookie  = 'sessionId=' + process.argv[3];

var chunkSize = 10;

console.log('Publishing All Collections');
console.log('--------------------------');

var api = function(url, method, description) {
	return new Promise(function(resolve, reject) {
		RequestRetry({
			url           : apiHost + '/api/' + url,
			method        : method,
			body          : {},
			json          : true,
			maxAttempts   : 25,
			retryDelay    : 5000,
			retryStrategy : RequestRetry.RetryStrategies.HTTPOrNetworkError,
			headers       : {
				'User-Agent' : 'request',
				'Cookie'     : cookie
			}
		}, function(err, res, body) {
			if (err) {
				console.log(': error ' + description + err);
				resolve();
			} else if (res.statusCode != 200) {
				console.log(': ' + res.statusCode + ' while ' + description);
				resolve();
			} else if (!body) {
				console.log(': failed while ' + description);
				resolve();
			} else {
				console.log(': succeeded in ' + description);
				resolve(body);
			}
		});
	});
};

var getUnpublishedCollections = function() {
	return api('query/collection?isPublished=false', 'GET', 'getting unpublished collections');
};

var count = 0;

var publishCollection = function(collection) {
	console.log(': [' + (++count) + '] publishing ' + collection.displayName);
	return api('collections/' + collection._id + '/publish', 'PUT', 'publishing ' + collection.displayName);
};

var publishNextChunk = function(chunks) {
	if (chunks && chunks.length > 0) {
		// Get the next chunk of collections
		var chunk = chunks[0];
		// Build an array of promises to publish collections
		var promises = [];
		_.each(chunk, function(collection) {
			promises.push(publishCollection(collection));
		});
		// Publish all of the collections in the chunk
		return Promise.all(promises).then(function() {
			// When they're all done, move on to the next chunk.
			return publishNextChunk(_.tail(chunks));
		});
	}
};

var run = function () {
	return new Promise(function (resolve, reject) {
		console.log('start');
		return getUnpublishedCollections()
			.then(function(collections) {
				console.log(': processing ' + collections.length + ' unpublished collections');
				// Break up into smaller groups
				return _.chunk(collections, chunkSize);
			})
			.then(function(chunks) {
				return publishNextChunk(chunks);
			})
			.then(function() {
				console.log('end');
				resolve(':)');
			}, function (err) {
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

