const express = require("express");
const { kill } = require("nodemon/lib/monitor/run");
const router = express.Router();
var request = require('request');
let mongodb = require('../../function/mongodb');

//----------------- DATABASE

let MAIN_DATA = 'MAIN_DATA';
let MAIN = 'MAIN';

let PATTERN = 'PATTERN';
let PATTERN_01 = 'PATTERN_01';
let GRAPH_TABLE = 'GRAPH_TABLE';
let master_FN = 'master_FN';
let ITEMs = 'ITEMs';
let METHOD = 'METHOD';
let MACHINE = 'MACHINE';

//------------------

router.post('/GRAPH-STD-UPDATE', async (req, res) => {
  //-------------------------------------
  console.log('--GRAPH-STD-UPDATE--');
  // console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let check = await mongodb.find(PATTERN, GRAPH_TABLE, { "UID": input['UID'] });

  if (check.length === 0) {

    input['UID'] = `GP-${Date.now()}`;
    var ins = await mongodb.insertMany(PATTERN, GRAPH_TABLE, [input]);

  } else {
    //
    let upd = await mongodb.update(PATTERN, GRAPH_TABLE, { "UID": input['UID'] }, { $set: { 
      "NO":input['NO'],
      "GT1":input['GT1'],
      "GT2":input['GT2'],
      "GT3":input['GT3'],
      "GT4":input['GT4'],
      "GT5":input['GT5'],
      "GT6":input['GT6'],
      "GT7":input['GT7'],
      "GT8":input['GT8'],
      "GT9":input['GT9'],
      "GT10":input['GT10'],
      "GT11":input['GT11'],
      "GT12":input['GT12'],
      "GT13":input['GT13'],
      "GT14":input['GT14'],
      "GT15":input['GT15'],
      "GT16":input['GT16'],
      "GT17":input['GT17'],
      "GT18":input['GT18'],
      "GT19":input['GT19'],
      "GT20":input['GT20'],
    } });
  }

  output = await mongodb.find(PATTERN, GRAPH_TABLE, {});

  //-------------------------------------
  res.json(output);
});

router.post('/GRAPH-STD-GET', async (req, res) => {
  //-------------------------------------
  console.log('--GRAPH-STD-GET--');
  // console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let graph = await mongodb.find(PATTERN, GRAPH_TABLE, { });

  let output = graph;
  //-------------------------------------
  res.json(output);
});


module.exports = router;