#! /usr/local/bin/node
/*jslint node:true */
// provisionApiProduct.js
// ------------------------------------------------------------------
// provision an Apigee Edge API Product
//
// Copyright 2017-2018 Google LLC.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// last saved: <2018-August-20 10:45:35>

var edgejs = require('apigee-edge-js'),
    common = edgejs.utility,
    apigeeEdge = edgejs.edge,
    sprintf = require('sprintf-js').sprintf,
    Getopt = require('node-getopt'),
    version = '20180820-1042',
    getopt = new Getopt(common.commonOptions.concat([
      ['p' , 'proxy=ARG', 'Required. name of API proxy to include in the API Product'],
      ['a' , 'access=ARG', 'Optional. tag the API Product for {public,internal,private} access.'],
      ['N' , 'productname=ARG', 'Required. name for API product'],
      ['D' , 'description=ARG', 'Optional. description for the API product'],
      ['A' , 'approvalType=ARG', 'Optional. either manual or auto. (default: auto)'],
      ['S' , 'scopes=ARG', 'Optional. comma-separated list of possible scopes for the API product'],
      ['e' , 'env=ARG', 'Optional. the Edge environment on which to enable the Product (default: all)']
    ])).bindHelp();

// ========================================================

console.log(
  'Apigee Edge Product Provisioning tool, version: ' + version + '\n' +
    'Node.js ' + process.version + '\n');

common.logWrite('start');

// process.argv array starts with 'node' and 'scriptname.js'
var opt = getopt.parse(process.argv.slice(2));

if ( !opt.options.proxy ) {
  console.log('You must specify a proxy');
  getopt.showHelp();
  process.exit(1);
}

if ( !opt.options.productname ) {
  console.log('You must specify a name for the API Product');
  getopt.showHelp();
  process.exit(1);
}

common.verifyCommonRequiredParameters(opt.options, getopt);

var options = {
      mgmtServer: opt.options.mgmtserver,
      org : opt.options.org,
      user: opt.options.username,
      password: opt.options.password,
      no_token: opt.options.notoken,
      verbosity: opt.options.verbose || 0
    };

apigeeEdge.connect(options, function(e, org) {
  if (e) {
    common.logWrite(JSON.stringify(e, null, 2));
    common.logWrite(JSON.stringify(result, null, 2));
    //console.log(e.stack);
    process.exit(1);
  }
  common.logWrite('connected');

  var options = {
        productName: opt.options.productname,
        proxies: [opt.options.proxy],
        environments: opt.options.env,
        description: opt.options.description,
        approvalType : opt.options.approvalType || "auto", //|| manual
      };

  if (opt.options.scopes) {
    options.scopes = opt.options.scopes.split(',').trim();
  }
  if (opt.options.access) {
    options.attributes = { "access": opt.options.access };
  }

  org.products.create(options, function(e, result){
    if (e) {
      common.logWrite(JSON.stringify(e, null, 2));
      common.logWrite(JSON.stringify(result, null, 2));
      //console.log(e.stack);
      process.exit(1);
    }
    common.logWrite(sprintf('ok. product name: %s', result.name));
  });
});
