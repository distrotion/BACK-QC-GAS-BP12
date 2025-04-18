const express = require("express");
const { kill } = require("nodemon/lib/monitor/run");
const router = express.Router();
var request = require('request');
let mongodb = require('../../function/mongodb');


// let TGPHRC004 = require('./001/cleardata');

router.get('/checklist', async (req, res) => {

  let output = [];
  res.json(output);

});

module.exports = router;