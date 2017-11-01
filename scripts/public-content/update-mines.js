'use strict';

var MongoClient = require('mongodb').MongoClient;
var Promise     = require('promise');
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

var getProjects = function(db) {
  return new Promise(function(resolve, reject) {
    // Find all of the projects
    db.collection('projects').find({}).toArray(function(err, object) {
      if (err) {
        console.log('x failed to find projects');
        reject(err);
      } else {
        console.log(': found ' + object.length + ' projects');
        resolve(object);
      }
    });
  });
};

var getContentHtml = function(project, page, type) {
  var content = project.content ? project.content.filter(function(c) { return c.type === type && c.page === page; }) : [];
  return content.length ? content[0].html : '';
};

var updateProject = function(db, project) {
  return new Promise(function(resolve, reject) {
    console.log(': updating project ' + project.code);

    var activities = project.activities && project.activities.length ? project.activities : [{
      name   : 'Design',
      status : ''
    }, {
      name   : 'Construction',
      status : ''
    }, {
      name   : 'Operation',
      status : ''
    }, {
      name   : 'Closure',
      status : ''
    }, {
      name   : 'Reclamation',
      status : ''
    }, {
      name   : 'Monitoring & Reporting',
      status : ''
    }];

    // Ensure order is set
    _.each(activities, function(a, i) { a.order = i; });

    db.collection('projects').updateOne({ code: project.code }, { $set: {
      subtitle   : getContentHtml(project, 'DETAILS', 'SUBTITLE') || project.subtitle || (project.name + ' Overview'),
      activities : activities,
      content    : [{
        page: 'Mines',
        type: 'Intro',
        html: getContentHtml(project, 'DETAILS', 'INTRO_TEXT') || getContentHtml(project, 'Mines', 'Intro') || project.description
      } , {
        page: 'Auth',
        type: 'Intro',
        html: getContentHtml(project, 'Auth', 'Intro') || 'Environmental assessment certificates and permits issued under the Mines Act and the Environmental Management Act (EMA) are the primary provincial authorizations for major mine projects in British Columbia. Below you will find a list of authorizations associated with each of these three acts (as applicable).'
      } , {
        page: 'Comp',
        type: 'Intro',
        html: getContentHtml(project, 'Comp', 'Intro') || 'Compliance and enforcement (C&amp;E) activities begin after a claim is staked and continue through exploration and the life of a mine. The Ministry of Energy, Mines and Petroleum Resources (EMPR), Ministry of Environment and Climate Change Strategy (ENV) and Environmental Assessment Office (EAO) work together to provide integrated oversight of British Columbia&#39;s mining sector. Records of inspections conducted during the 2016 calendar year can be found below.'
      } , {
        page: 'Other',
        type: 'Intro',
        html: getContentHtml(project, 'Other', 'Intro') || 'Below you will find recent annual reports (including annual reclamation reports, annual dam safety inspection reports and related documents) as well as other select documents of interest. More documents will be added here on an ongoing basis.'
      }]
    }}, {}, function(err, obj) {
      if (err) {
        console.log('x Failed to update project ' + project.code);
        reject(err);
      } else if (obj.result.n === 0) {
        console.log('x Failed to find project ' + project.code);
        resolve(obj);
      } else {
        console.log(': Successfully updated project ' + project.code);
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
        console.log(': getting projects');
        return getProjects(database);
      })
      .then(function(projects) {
        console.log(': updating projects...');
        var projectPromises = []
        _.each(projects, function(project) {
          projectPromises.push(updateProject(database, project));
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
