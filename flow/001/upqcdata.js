const express = require("express");
const router = express.Router();
var mongodb = require('../../function/mongodb');


router.post('/upqcdata',async (req,res) => {
    //-------------------------------------
    console.log('--upqcdata--');
    console.log(req.body);
    //-------------------------------------
    
    
    //-------------------------------------
      res.json(output);
});


module.exports = router;