'use strict';

var request = require('request');
var _ 		= require('lodash');
var fs 		= require('fs');
var memfile = './mem.json';
var epicfile = './epic.json';

// Initialize files.
fs.writeFileSync(memfile, "[]");
fs.writeFileSync(epicfile, "[]");

function addToObj(obj, file) {
        var configFile = fs.readFileSync(file);
        var config = JSON.parse(configFile);
        config.push(obj);
        var configJSON = JSON.stringify(config);
        fs.writeFileSync(file, configJSON);
    }
// Get the project listing first.
// Get the objectID for the project in question.
var base = "https://projects.eao.gov.bc.ca";
request ({
	url    : base + "/api/project",
	method : 'GET'
}, function (err, res, body) {
	if (err) {
		console.log("error:",err);
	} else if (res.statusCode !== 200) {
		console.log("error:",err);
	} else {
		console.log("200 OK.");
		var projects = JSON.parse(body);

		_.each(projects, function (p) {
			var newObj = {
				_id: p._id,
				code: p.code,
				eacDecision: p.eacDecision,
				name: p.name,
				proponent: {
					_id: p.proponent._id,
					name: p.proponent.name
				}
			};
			addToObj(newObj, epicfile);
		});
	}
});

base = "https://mines.empr.gov.bc.ca";
request ({
	url    : base + "/api/project",
	method : 'GET'
}, function (err, res, body) {
	if (err) {
		console.log("error:",err);
	} else if (res.statusCode !== 200) {
		console.log("error:",err);
	} else {
		console.log("200 OK.");
		var projects = JSON.parse(body);

		_.each(projects, function (p) {
			var ownership = {};
			if (p.proponent !== null) {
				ownership._id = p.proponent._id;
				ownership.name = p.proponent.name;
			} else {
				ownership.name = p.ownership;
			}
			var newObj = {
				_id: p._id,
				code: p.code,
				name: p.name,
				memPermitID: p.memPermitID,
				proponent: ownership
			};
			addToObj(newObj, memfile);
		});
	}
});