'use strict';

var MongoClient = require('mongodb').MongoClient;
var Promise     = require('promise');
var _           = require('lodash');

var defaultConnectionString = 'mongodb://localhost:27017/mem-dev';
var username                = '';
var password                = '';
var host                    = '';
var db                      = '';
var noUpdate                = ''; // show inspection names, but do not update inspections
var url                     = '';

var args = process.argv.slice(2);
if (args.length < 4) {
	console.log('using default localhost connection:', defaultConnectionString);
	noUpdate   = args[0];
	url        = defaultConnectionString;
} else {
	username   = args[0];
	password   = args[1];
	host       = args[2];
	db         = args[3];
	noUpdate   = args[4];
	url        = 'mongodb://' + username + ':' + password + '@' + host + ':27017/' + db;
}

var getInspections = function(db) {
	return new Promise(function(resolve, reject) {
		// Find all of the inspections
		db.collection('collections').find({ type: 'Inspection Report' }).toArray(function(err, object) {
			if (err) {
				console.log('x failed to find inspections');
				reject(err);
			} else {
				console.log(': found ' + object.length + ' inspections');
				resolve(object);
			}
		});
	});
};

var updateInspectionName = function(db, inspection, name) {
	return new Promise(function(resolve, reject) {
		db.collection('collections').updateOne({ _id: inspection._id }, { $set: { displayName: name } } , {}, function(err, obj) {
			if (err) {
				console.log('x failed to update inspection ' + inspection.displayName + ' to ' + name);
			} else if (obj.result.n === 0) {
				console.log('x failed to find inspection ' + inspection.displayName);
			} else {
				console.log(': ' + inspection.displayName + ' -> ' + name);
			}
			resolve();
		});
	});
};

var scanInspection = function(db, inspection) {
	return new Promise(function(resolve, reject) {
		// Find the collection document for the main document
		if (!inspection.mainDocument) {
			// Skip collections without a main document
			console.log(': ' + inspection.displayName + ' - no main document');
			resolve();
		} else {
			db.collection('collectiondocuments').findOne({ _id: inspection.mainDocument },function(err, collectionDocument) {
				if (err) {
					// Skip orphaned collection documents
					console.log(': ' + inspection.displayName + ' - main collection document is orphaned');
					resolve();
				} else {
					// Find the related document
					db.collection('documents').findOne({ _id: collectionDocument.document },function(err, document) {
						if (err || !document) {
							// Skip orphaned documents
							console.log(': ' + inspection.displayName + ' - main document is orphaned');
							resolve();
						} else {
							// Check for inspection number
							var match = inspection.displayName.match(/\d+/);
							if (!match) {
								// Skip it
								console.log(': ' + inspection.displayName + ' - no inspection number');
								resolve();
							} else {
								var name = '';
								if (inspection.isForMEM) {
									// Find the last document category
									var category = _.last(document.documentCategories);
									if (category) {
										category = _.last(_.split(category, ' > '));
									}
									name = category + ' Inspection ' + match[0];
								} else if (inspection.isForENV) {
									var name = 'Inspection ' + match[0];
								}
								if (name) {
									if (noUpdate) {
										console.log(': ' + inspection.displayName + ' -> ' + name);
									} else {
										updateInspectionName(db, inspection, name);
									}
								}
								resolve();
							}
						}
					});
				}
			});
		}
	});
};

var run = function () {
	var database = null;
	return new Promise(function (resolve, reject) {
		console.log('start');
		MongoClient.connect(url)
			.then(function(db) {
				console.log(': db connected');
				return db;
			})
			.then(function(db) {
				database = db;
				console.log(': getting inspections');
				return getInspections(database);
			})
			.then(function(inspections) {
				var promises = [];
				inspections.forEach(function(inspection, index) {
					promises.push(scanInspection(database, inspection));
				});
				return Promise.all(promises);
			})
			.then(function(data) {
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
}).catch(function (error) {
	console.error('error ', error);
	process.exit();
});
