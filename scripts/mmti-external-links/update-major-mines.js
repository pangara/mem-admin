// @ts-check
'use strict';

var mongodb     = require('mongodb');
var Promise     = require('promise');
var _           = require('lodash');

// These ones help with type checking and JSDoc
var MongoClient = mongodb.MongoClient;
var Db          = mongodb.Db;

var defaultConnectionString = 'mongodb://localhost:27017/mem-dev';
var username                = '';
var password                = '';
var host                    = '';
var db                      = '';
var url                     = '';

var args = process.argv.slice(2);
if (args.length !== 4) {
  console.log('Using default localhost connection:', defaultConnectionString);
  url = defaultConnectionString;
} else {
  username = args[0];
  password = args[1];
  host     = args[2];
  db       = args[3];
  url      = 'mongodb://' + username + ':' + password + '@' + host + ':27017/' + db;
}

/**
 * @param {Db} db
 */
var getMajorMines = function (db) {
  return new Promise(function (resolve, reject) {
    // find all MMTI projects (major mines)
    db.collection('projects')
      .find({ isMajorMine: true })
      .toArray()
      .then(function (majorMines) {
        console.log(': found ' + majorMines.length + ' MMTI projects (major mines)');
        return resolve(majorMines);
      })
      .catch(function (err) {
        console.log('x failed to find MMTI projects (major mines)');
        return reject(err);
      });
  });
}

/**
 * @param {Db} db
 * @param {*} mmtiProject
 */
var updateProject = function (db, mmtiProject) {
  return new Promise(function (resolve, reject) {
    /** @type {string} */
    var code = mmtiProject.code;
    console.log(': updating project ' + code);

    /** @type {number} */
    var originalLinkCount = (mmtiProject.externalLinks || []).length;
    console.log(': found ' + originalLinkCount + ' external links');

    // filter out duplicate links
    var links = _.uniqBy(mmtiProject.externalLinks, 'link');

    // Process link data models -> { link, title, order }
    links = _.map(links, function (value, index, arr) {
      // Ignore everything, except `link` and `title`
      var linkAndTitle = _.pick(value, ['link', 'title']);
      var obj = _.extend({ order: index + 1 }, linkAndTitle);
      return obj;
    });

    var linkCount = (links || []).length;
    console.log(': discarded ' + (originalLinkCount - linkCount) + ' duplicate links');

    db.collection('projects').updateOne({ code: code }, { $set: { externalLinks: links || [] } }, {})
      .then(function (obj) {
        if (obj.result.n === 0) {
          console.log('x Failed to find project ' + code);
          return resolve(obj);
        } else {
          console.log(': Successfully updated project ' + code);
          return resolve(obj);
        }
      })
      .catch(function (err) {
        if (err) {
          console.log('x Failed to update project ' + code);
          return reject(err);
        }
      });
  });
}

var run = function () {
  /** @type {Db} */
  var database = null;

  return new Promise(function (resolve, reject) {
    console.log('start');
    MongoClient.connect(url)
      .then(function (db) {
        console.log(': db connected');
        database = db;
      })
      .then(function () {
        console.log(': getting MMTI projects (major mines)');
        return getMajorMines(database);
      })
      .then(function (projects) {
        console.log(': updating projects...');
        var projectPromises = _.map(projects, function (mmtiProject) {
          return updateProject(database, mmtiProject);
        });
        return Promise.all(projectPromises);
      })
      .then(function () {
        database.close();
        console.log('end');
        resolve(':)');
      }, function (err) {
        console.log('ERROR: end err = ', JSON.stringify(err));
        reject(err);
      });
  });
};

run().then(function (success) {
  console.log('success ', success);
  process.exit();
}).catch(function (error) {
  console.error('error ', error);
  process.exit();
});
