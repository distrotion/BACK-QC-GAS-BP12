const express = require("express");
const router = express.Router();
var mongodb = require('../../function/mongodb');
var mssql = require('./../../function/mssql');


//----------------- DATABASE

let MAIN_DATA = 'MAIN_DATA';
let MAIN = 'MAIN';

let PATTERN = 'PATTERN';
let PATTERN_01 = 'PATTERN_01';
let master_FN = 'master_FN';
let ITEMs = 'ITEMs';
let METHOD = 'METHOD';
let MACHINE = 'MACHINE';

//-----------------

const d = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });;
let day = d;

Number.prototype.pad = function (n) {
  if (n === undefined)
    n = 2;

  return (new Array(n).join('0') + this).slice(-n);
}

//-----------------


router.get('/report01', async (req, res) => {
  res.json("report01");
});


router.post('/ReportListACT', async (req, res) => {
  console.log('--ReportList--');
  console.log(req.body);
  let input = req.body;

  let DATAlist = [];
  if (input['month'] != undefined && input['year'] != undefined && parseInt(input['month']) > 0 && parseInt(input['month']) <= 12 && parseInt(input['year']) >= 2022) {
    let startM = 0;
    let startD = 0;
    let stoptM = 0;
    let stoptD = 0;
    let startY = 0;
    let stoptY = 0;




    console.log(input['month'])
    if (input['month'] == '1') {
      startY = parseInt(input['year']) - 1
      stoptY = parseInt(input['year'])
      startM = 11;
      startD = 31;
      stoptM = 0;
      stoptD = 31;
    } else if (input['month'] == '2') {
      startY = parseInt(input['year'])
      stoptY = parseInt(input['year'])
      startM = 0;
      startD = 31;
      stoptM = 1;
      stoptD = 29;
    } else if (input['month'] == '3') {
      startY = parseInt(input['year'])
      stoptY = parseInt(input['year'])
      startM = 1;
      startD = 29;
      stoptM = 2;
      stoptD = 31;
    } else if (input['month'] == '4') {
      startY = parseInt(input['year'])
      stoptY = parseInt(input['year'])
      startM = 2;
      startD = 31;
      stoptM = 3;
      stoptD = 30;
    } else if (input['month'] == '5') {
      startY = parseInt(input['year'])
      stoptY = parseInt(input['year'])
      startM = 3;
      startD = 30;
      stoptM = 4;
      stoptD = 31;
    } else if (input['month'] == '6') {
      startY = parseInt(input['year'])
      stoptY = parseInt(input['year'])
      startM = 4;
      startD = 31;
      stoptM = 5;
      stoptD = 30;
    } else if (input['month'] == '7') {
      startY = parseInt(input['year'])
      stoptY = parseInt(input['year'])
      startM = 5;
      startD = 30;
      stoptM = 6;
      stoptD = 31;
    } else if (input['month'] == '8') {
      startY = parseInt(input['year'])
      stoptY = parseInt(input['year'])
      startM = 6;
      startD = 31;
      stoptM = 7;
      stoptD = 31;
    } else if (input['month'] == '9') {
      startY = parseInt(input['year'])
      stoptY = parseInt(input['year'])
      startM = 7;
      startD = 31;
      stoptM = 8;
      stoptD = 30;
    } else if (input['month'] == '10') {
      startY = parseInt(input['year'])
      stoptY = parseInt(input['year'])
      startM = 8;
      startD = 30;
      stoptM = 9;
      stoptD = 31;
    } else if (input['month'] == '11') {
      startY = parseInt(input['year'])
      stoptY = parseInt(input['year'])
      startM = 9;
      startD = 31;
      stoptM = 10;
      stoptD = 30;
    } else if (input['month'] == '12') {
      startY = parseInt(input['year'])
      stoptY = parseInt(input['year'])
      startM = 10;
      startD = 30;
      stoptM = 11;
      stoptD = 31;
    } else {
      return res.json([]);
    }


  // var d = new Date();
  // d.setFullYear(d.getFullYear(), d.getMonth(), 1);

  // var dc = new Date();
  // dc.setFullYear(dc.getFullYear(), dc.getMonth(), 7);
  
    var d = new Date();
    d.setFullYear(startY, startM, startD);
    d.setDate(d.getDate() - 1);
    var dc = new Date();
    dc.setFullYear(stoptY, stoptM, stoptD);
    dc.setDate(dc.getDate() + 1);
    

    console.log(d)
    console.log(dc)
  
    // day = `${d.getFullYear()}-${(d.getMonth() + 1).pad(2)}-${(d.getDate()).pad(2)}`
    // dayC = `${dc.getFullYear()}-${(dc.getMonth() + 1).pad(2)}-${(dc.getDate()).pad(2)}`
    // tim = `${(d.getHours()).pad(2)}:${(d.getMinutes()).pad(2)}:${(d.getSeconds()).pad(2)}`
  
    out = {
      "ALL_DONE": 'DONE',
      "dateG":
      {
        "$gte": d,
        "$lt": dc
      }
    }
    // console.log(out)
    let find = await mongodb.find(MAIN_DATA, MAIN, out);
    let masterITEMs = await mongodb.find(master_FN, ITEMs, {});
   
    for (i = 0; i < find.length; i++) {
      //
      // console.log(Object.getOwnPropertyNames(find[i]["FINAL"]));
      let INS = Object.getOwnPropertyNames(find[i]["FINAL"]);
      console.log("-------------------" + i)
      let depDATAlist = [];
      for (j = 0; j < INS.length; j++) {
        let Item = find[i]["FINAL"][INS[j]];
        let Itemlist = Object.getOwnPropertyNames(find[i]["FINAL"][INS[j]]);
        // console.log(Itemlist);
        for (k = 0; k < Itemlist.length; k++) {
  
          if (Item[Itemlist[k]]["PSC1"] != undefined) {
  
            if (Item[Itemlist[k]]["PSC1"].length === undefined) {
              // console.log(Item[Itemlist[k]]["PSC1"]["PO1"]);
              let name = "";
                    for (s = 0; s < masterITEMs.length; s++) {
                      if (masterITEMs[s]["masterID"] === Itemlist[k]) {
                        // console.log(masterITEMs[s]["ITEMs"]);
                        name = masterITEMs[s]["ITEMs"];
                        let data = {}
                        data[name] = Item[Itemlist[k]]["PSC1"]["PO2"];
                        if (data[name].length > 0) {
                          depDATAlist.push(data)
                        }
                        break;
                      }
                    }
            } else {
              // console.log(Item[Itemlist[k]]["PSC1"].length);
              let deppdata = Item[Itemlist[k]]["PSC1"];
  
              // console.log(deppdata);
              for (l = 0; l < deppdata.length; l++) {
                if (deppdata[l]["PO1"] === undefined) {
                  // console.log(deppdata[l]["PIC1data"]);
                  let name = "";
                  for (s = 0; s < masterITEMs.length; s++) {
                    if (masterITEMs[s]["masterID"] === Itemlist[k]) {
                      // console.log(masterITEMs[s]["ITEMs"]);
                      name = masterITEMs[s]["ITEMs"];
                      let data = {}
                      data[name] = [deppdata[l]["PIC1data"], deppdata[l]["PIC2data"], deppdata[l]["PIC3data"], deppdata[l]["PIC4data"]];
                      if (data[name].length > 0) {
                        depDATAlist.push(data)
                      }
                      break;
                    }
                  }
                  // console.log([deppdata[l]["PIC1data"],deppdata[l]["PIC2data"],deppdata[l]["PIC3data"],deppdata[l]["PIC4data"]]);
  
  
                } else {
  
                  if (deppdata[l]["PO1"] !== "Mean") {
                    // console.log(deppdata[l]["PO1"]);
                    // console.log(deppdata[l]["PO3"]);
                    // depDATAlist.push(deppdata[l]["PO3"])
                    let name = "";
                    for (s = 0; s < masterITEMs.length; s++) {
                      if (masterITEMs[s]["masterID"] === Itemlist[k]) {
                        // console.log(masterITEMs[s]["ITEMs"]);
                        name = masterITEMs[s]["ITEMs"];
                        let data = {}
                        data[name] = deppdata[l]["PO3"];
                        if (data[name].length > 0) {
                          depDATAlist.push(data)
                        }
                        break;
                      }
                    }
  
                  }
                }
  
              }
  
            }
          }
        }
  
      }
      // console.log(depDATAlist)
      DATAlist.push({
         "STATUS":"OK",
        "PO":find[i]['PO'],
        "CP":find[i]['CP'],
        "CUSTNAME":find[i]['CUSTNAME'],
        "CUSLOTNO":find[i]['CUSLOTNO'],
        "PART":find[i]['PART'],
        "PARTNAME":find[i]['PARTNAME'],
        "MATERIAL":find[i]['MATERIAL'],
        "QUANTITY":find[i]['QUANTITY'],
        "dateG":find[i]['dateG'],
        "FG_CHARG":find[i]['FG_CHARG'],
        "DATA":depDATAlist
      })
    }
  
  
  

  }

  return res.json(DATAlist);
});


router.post('/CopyReport', async (req, res) => {
  //-------------------------------------
  console.log('--CopyReport--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = "NOK";
  //-------------------------------------

  if (input[`original`] !== undefined && input[`new`] !== undefined) {

    let newdataHEAD = {};

    let find = await mongodb.find("ORDER", "ORDER", {});
    if (find.length > 0) {
      let sapdata = find[0][`DATA`];
      let CUSLOTNOd = ``
      for (i = 0; i < sapdata.length; i++) {
        if (input[`new`] === sapdata[i][`PO`]) {
          newdataHEAD = sapdata[i];
          CUSLOTNOd = CUSLOTNOd+ sapdata[i][`CUSLOTNO`]+`,`
          // break;
        }
      }

      if (newdataHEAD[`CP`] != undefined) {
        let testDB = await mongodb.find(MAIN_DATA, MAIN, { "PO": input[`new`] });
        if (testDB.length === 0) {
          let origianlDB = await mongodb.find(MAIN_DATA, MAIN, { "PO": input[`original`] });
          let NewMATCP = await mongodb.find(PATTERN, PATTERN_01, { "CP": newdataHEAD[`CP`] });
          console.log(newdataHEAD[`CP`]);
          console.log(NewMATCP.length );
          
          console.log(origianlDB.length );
          if (NewMATCP.length > 0 && origianlDB.length > 0) {
            let NewMATCPdata = NewMATCP[0];
            let origianlDBdata = origianlDB[0];



            let newINSERT = {
              "PO": input[`new`],
              "CP": NewMATCPdata[`CP`],
              "MATCP": NewMATCPdata[`CP`],
              "CUSTOMER": NewMATCPdata[`CUSTOMER`],
              "PART": NewMATCPdata[`PART`],
              "PARTNAME": NewMATCPdata[`PARTNAME`],
              "MATERIAL": NewMATCPdata[`MATERIAL`],

              //
              "QTY": newdataHEAD[`QUANTITY`],
              "PROCESS": newdataHEAD[`PROCESS`],
              "CUSLOT": CUSLOTNOd,
              "TPKLOT": newdataHEAD[`FG_CHARG`],
              "QUANTITY": newdataHEAD[`QUANTITY`],
              "CUSLOTNO": CUSLOTNOd,
              "FG_CHARG": newdataHEAD[`FG_CHARG`],
              "CUSTNAME": newdataHEAD[`CUSTNAME`],
              //
              "PARTNAME_PO": origianlDBdata[`PARTNAME_PO`],
              "PART_PO": origianlDBdata[`PART_PO`],
              "RESULTFORMAT": origianlDBdata[`RESULTFORMAT`],
              "GRAPHTYPE": origianlDBdata[`GRAPHTYPE`],
              "GAP": origianlDBdata[`GAP`],
              "dateupdatevalue": origianlDBdata[`dateupdatevalue`],
              "FINAL": origianlDBdata[`FINAL`],
              "CHECKlist": origianlDBdata[`CHECKlist`],
              "FINAL_ANS": origianlDBdata[`FINAL_ANS`],
              "ALL_DONE": "DONE",
              "PO_judgment": "DONE",
              //
              "ReferFrom": input[`original`],
              "dateG": new Date(),
              "dateGSTR": day,


            };

            let insertdb = await mongodb.insertMany(MAIN_DATA, MAIN, [newINSERT]);
            // console.log(newINSERT);
            output = "OK";
          }

        }

      }

    }

  }

  return res.json(output);
});





module.exports = router;