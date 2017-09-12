'use strict';

var MongoClient = require('mongodb').MongoClient;
var ObjectID    = require('mongodb').ObjectID;
var Promise     = require('promise');
var request     = require('request');
var _           = require('lodash');

var defaultConnectionString = 'mongodb://localhost:27017/mem-dev';
var username                = '';
var password                = '';
var host                    = '';
var db                      = '';
var url                     = '';

var args = process.argv.slice(2);
if (args.length !== 4) {
	console.log('Using default localhost connection:', defaultConnectionString);
	url  = defaultConnectionString;
} else {
	username = args[0];
	password = args[1];
	host     = args[2];
	db       = args[3];
	url      = 'mongodb://' + username + ':' + password + '@' + host + ':27017/' + db;
}

var getProjectsFromMMTI = function() {
	return new Promise(function(resolve, reject) {
		request({
			url    : 'http://mines.nrs.gov.bc.ca/api/project/',
			method : 'GET',
		}, function(err, res, body) {
			if (err) {
				console.log('x error fetching projects from MMTI' + err);
				resolve();
			} else if (res.statusCode != 200) {
				console.log('x ' + res.statusCode + ' while fetching projects from MMTI');
				resolve();
			} else if (!body) {
				console.log('x failed to fetch projects from MMTI');
				resolve();
			} else {
				var project = JSON.parse(body)
				console.log(': successfully fetched projects from MMTI');
				resolve(project);
			}
		});
	});
}

var mapToMemProjectCode = function(code) {
	switch (code) {
		case 'brule':
			return 'brule-dillon';
		case 'copper-mountain':
			return 'copper-mountain-similco';
		case 'highland-valley-copper':
			return 'highland-valley-copper-hvc';
		default:
			return code;
	};
};

var getRelatedEpicProjects = function(code) {
	switch (code) {
		case 'brucejack':
			return ['brucejack-gold-mine'];
		case 'brule':
			return ['brule-mine'];
		case 'coal-mountain-operations':
			return ['coal-mountain-phase-2'];
		case 'copper-mountain':
			return [];
		case 'elkview-operations':
			return [];
		case 'fording-river-operations':
			return ['fording-river-operations-swift'];
		case 'gibraltar':
			return [];
		case 'greenhills-operations':
			return [];
		case 'highland-valley-copper':
			return [];
		case 'kemess':
			return ['kemess-south', 'kemess-underground', 'kemess-north-copper-gold-mine'];
		case 'line-creek-operations':
			return ['line-creek-coal', 'line-creek-operations-phase-ii'];
		case 'mount-milligan':
			return ['mount-milligan-copper-gold', 'mt-milligan-copper-gold'];
		case 'mount-polley':
			return ['mt-polley-copper'];
		case 'new-afton':
			return [];
		case 'red-chris':
			return ['red-chris-copper-and-gold-mine', 'red-chris-porphyry-copper-gold-mine'];
		case 'silvertip':
			return ['silvertip-silver-lead-zinc-mine'];
		case 'trend-roman':
			return ['roman-coal-mine'];
		case 'tulsequah-chief':
			return ['tulsequah-chief-mine'];
		case 'wolverine':
			return ['wolverine-coal-mine'];
		default:
			return [];
	};
};

var update = function(memProject, mmtiProject) {
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

var updateProject = function(db, mmtiProject) {
	return new Promise(function(resolve, reject) {
		var memCode = mapToMemProjectCode(mmtiProject.code);
		console.log(': updating project ' + memCode);

		db.collection('projects').updateOne({ code: memCode }, { $set: {
			isMajorMine             : true,
			morePermitsLinkYear     : mmtiProject.morePermitsLinkYear     || '',
			morePermitsLink         : mmtiProject.morePermitsLink         || '',
			moreInspectionsLink     : mmtiProject.moreInspectionsLink     || '',
			moreInspectionsLinkYear : mmtiProject.moreInspectionsLinkYear || '',
			activities              : mmtiProject.activities              || [],
			externalLinks           : mmtiProject.externalLinks           || [],
			content                 : mmtiProject.content                 || [],
			epicProjectCodes        : getRelatedEpicProjects(mmtiProject.code),
		}}, {}, function(err, obj) {
			if (err) {
				console.log('x Failed to update project ' + memCode);
				reject(err);
			} else if (obj.result.n === 0) {
				console.log('x Failed to find project ' + memCode);
				resolve(obj);
			} else {
				console.log(': Successfully updated project ' + memCode);
				resolve(obj);
			}
		});
	});
}

var run = function () {
	var database = null;

	return new Promise(function (resolve, reject) {
		console.log('start');
		MongoClient.connect(url)
			.then(function(db) {
				console.log(': db connected');
				database = db;
			})
			.then(function() {
				console.log(': getting projects from MMTI');
				return getProjectsFromMMTI();
			})
			.then(function(projects) {
				console.log(': updating projects...');
				var projectPromises = []
				_.each(projects, function(mmtiProject) {
					projectPromises.push(updateProject(database, mmtiProject));
				});
				return Promise.all(projectPromises);
			})
			.then(function() {
				database.close();
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
