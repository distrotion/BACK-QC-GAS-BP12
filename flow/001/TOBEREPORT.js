const express = require("express");
const router = express.Router();
var mssql = require('../../function/mssql');
var mongodb = require('../../function/mongodb');
var httpreq = require('../../function/axios');
var axios = require('axios');


let MAIN_DATA = 'MAIN_DATA';
let MAIN = 'MAIN';
// let MAIN = 'MAIN_210624';

let PATTERN = 'PATTERN';
let PATTERN_01 = 'PATTERN_01';

let master_FN = 'master_FN';
let ITEMs = 'ITEMs';



router.post('/TOBEREPOR/GETDATA', async (req, res) => {
  //-------------------------------------
  console.log(req.body);
  //-------------------------------------
  let input = req.body;
  let output = {};
  let itemlist = [];
  // let inslist = [];
  let itemobject = {};
  // let dataobject = {};
  let dataolist = [];
  let RESULTFORMATitem = {};
  let SPECIFICATIONve = {};


  if (input['MATCP'] != undefined && input['STARTyear'] != undefined && input['STARTmonth'] != undefined && input['STARTday'] != undefined && input['ENDyear'] != undefined && input['ENDmonth'] != undefined && input['ENDday'] != undefined&& input['DB'] != undefined) {

    let inMAINDB = input['DB'] 

    if(inMAINDB === ''){

      inMAINDB = 'MAIN';
    }

    let d = new Date();
    d.setFullYear(input['STARTyear'], `${parseInt(input['STARTmonth']) - 1}`, input['STARTday']);

    let dc = new Date();
    dc.setFullYear(input['ENDyear'], `${parseInt(input['ENDmonth']) - 1}`, input['ENDday']);

    // console.log(d)
    // console.log(dc)

    let date = {
      "$gte": d,
      "$lt": dc
    }

    let findITEMs = await mongodb.find(master_FN, ITEMs, {});
    let findMATCP = await mongodb.find(MAIN_DATA, inMAINDB, { "MATCP": input['MATCP'], "ALL_DONE": "DONE", "dateG": date });
    // let findMATCP = await mongodb.find(MAIN_DATA, MAIN, { "MATCP": input['MATCP'] });
    let findPATTERN = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['MATCP'] });




    if (findPATTERN.length > 0) {
      let data = findPATTERN[0]['FINAL'];
      for (let i = 0; i < data.length; i++) {
        itemlist.push(data[i]['ITEMs']);

        SPECIFICATIONve[data[i]['ITEMs']] = data[i]['SPECIFICATIONve'] || '{}';

      }


      for (let i = 0; i < itemlist.length; i++) {
        for (let j = 0; j < findITEMs.length; j++) {
          if (itemlist[i] === findITEMs[j]['masterID']) {
            itemobject[itemlist[i]] = findITEMs[j]['ITEMs'];
            RESULTFORMATitem[itemlist[i]] = findITEMs[j]['RESULTFORMAT'];




            //SPECIFICATIONve
            //RESULTFORMATitem
            break;
          }

        }


      }



      if (findMATCP.length > 0) {

        // inslist = Object.keys(findMATCP[0]['FINAL']);

        for (let M = 0; M < findMATCP.length; M++) {
          let inslist = Object.keys(findMATCP[M]['FINAL']);
          let dataobject = {};
          let datamaster = findMATCP[M];
          for (let i = 0; i < inslist.length; i++) {

            for (let j = 0; j < itemlist.length; j++) {

              if (datamaster['FINAL'][inslist[i]] != undefined) {




                if (datamaster['FINAL'][inslist[i]][itemlist[j]] != undefined) {
                  if (RESULTFORMATitem[itemlist[j]] !== 'Text') {

                    //----------------------------------------------------------------------------------------

                    if (RESULTFORMATitem[itemlist[j]] === 'Number') {

                      dataobject['PO'] = datamaster['PO'];
                      dataobject["itemlist"] = itemlist,
                        dataobject["itemobject"] = itemobject,

                        dataobject['MATCP'] = datamaster['MATCP'];
                      dataobject['CUSTOMER'] = datamaster['CUSTOMER'];
                      dataobject['PART'] = datamaster['PART'];
                      dataobject['PARTNAME'] = datamaster['PARTNAME'];
                      dataobject['FG_CHARG'] = datamaster['FG_CHARG'];
                      dataobject['dateG'] = datamaster['dateG'];

                      //FG_CHARG

                      subpicdata = Object.keys(datamaster['FINAL'][inslist[i]][itemlist[j]])
                      let datasetraw = [];
                      if (subpicdata.length > 0) {

                        for (let k = 0; k < subpicdata.length; k++) {
                          let datainside = datamaster['FINAL'][inslist[i]][itemlist[j]][subpicdata[k]];
                          let datasetrawin = [];
                          for (let v = 0; v < datainside.length; v++) {
                            // datasetrawin.push(datainside[v]['PO3'].replace("\n", "").replace("\r", ""));
                            datasetrawin.push(datainside[v]['PO3']);

                            // console.log(datainside)

                          }
                          datasetraw.push(datasetrawin);
                        }
                      }

                      dataobject[itemlist[j]] = {
                        "name": itemobject[itemlist[j]],
                        "itemcode": itemlist[j],
                        'RESULTFORMAT': RESULTFORMATitem[itemlist[j]],
                        'SPECIFICATIONve': SPECIFICATIONve,
                        // "data": datamaster['FINAL'][inslist[i]][itemlist[j]],
                        "data": datasetraw,
                        "data_ans": datamaster['FINAL_ANS'][itemlist[j]],
                      }

                    } else if (RESULTFORMATitem[itemlist[j]] === 'Graph') {

                      dataobject['PO'] = datamaster['PO'];
                      dataobject["itemlist"] = itemlist,

                        dataobject['MATCP'] = datamaster['MATCP'];
                      dataobject['CUSTOMER'] = datamaster['CUSTOMER'];
                      dataobject['PART'] = datamaster['PART'];
                      dataobject['PARTNAME'] = datamaster['PARTNAME'];
                      dataobject['FG_CHARG'] = datamaster['FG_CHARG'];
                      dataobject['dateG'] = datamaster['dateG'];

                      subpicdata = Object.keys(datamaster['FINAL'][inslist[i]][itemlist[j]])
                      let datasetraw = [];
                      if (subpicdata.length > 0) {

                        for (let k = 0; k < subpicdata.length; k++) {
                          let datainside = datamaster['FINAL'][inslist[i]][itemlist[j]][subpicdata[k]];
                          let datasetrawin = [];
                          for (let v = 0; v < datainside.length; v++) {
                            // datasetrawin.push(datainside[v]['PO3'].replace("\n", "").replace("\r", ""));
                            datasetrawin.push(datainside[v]['PO3']);
                            // console.log(datainside)

                          }
                          datasetraw.push(datasetrawin);
                        }
                      }

                      dataobject[itemlist[j]] = {
                        "name": itemobject[itemlist[j]],
                        "itemcode": itemlist[j],
                        'RESULTFORMAT': RESULTFORMATitem[itemlist[j]],
                        "data": datasetraw,
                        "data_ans": datamaster['FINAL_ANS'][itemlist[j] + '_point'],

                      }

                    } else if (RESULTFORMATitem[itemlist[j]] === 'OCR') {

                      dataobject['PO'] = datamaster['PO'];
                      dataobject["itemlist"] = itemlist,

                        dataobject['MATCP'] = datamaster['MATCP'];
                      dataobject['CUSTOMER'] = datamaster['CUSTOMER'];
                      dataobject['PART'] = datamaster['PART'];
                      dataobject['PARTNAME'] = datamaster['PARTNAME'];
                      dataobject['FG_CHARG'] = datamaster['FG_CHARG'];
                      dataobject['dateG'] = datamaster['dateG'];
                      subpicdata = Object.keys(datamaster['FINAL'][inslist[i]][itemlist[j]])

                      let datasetraw = [];
                      if (subpicdata.length > 0) {

                        for (let k = 0; k < subpicdata.length; k++) {
                          let datainside = datamaster['FINAL'][inslist[i]][itemlist[j]];
                          // console.log("--------------")
                          // console.log(datainside['PSC1'])
                          // console.log("--------------")
                          let datasetrawin = [];
                          // // console.log(datainside['PIC1data']);
                          // // console.log(datainside['PIC2data']);
                          // // console.log(datainside['PIC3data']);
                          // // console.log(datainside['PIC4data']);

                          for (let v = 0; v < datainside['PSC1'].length; v++) {
                            // datasetrawin.push(datainside[v]['PO3'].replace("\n", "").replace("\r", ""));
                            datasetrawin.push(datainside['PSC1'][v]['PIC1data']);
                            datasetrawin.push(datainside['PSC1'][v]['PIC2data']);
                            datasetrawin.push(datainside['PSC1'][v]['PIC3data']);
                            datasetrawin.push(datainside['PSC1'][v]['PIC4data']);

                            // console.log(datainside['PSC1'][v]['PIC1data'])

                          }
                          datasetraw.push(datasetrawin);


                        }
                      }

                      dataobject[itemlist[j]] = {
                        "name": itemobject[itemlist[j]],
                        "itemcode": itemlist[j],
                        'RESULTFORMAT': RESULTFORMATitem[itemlist[j]],
                        "data": datasetraw,
                        // "data_ans": datamaster['FINAL_ANS'][itemlist[j] + '_point'],

                      }


                    }



                    //----------------------------------------------------------------------------------------
                  }



                }
              }


            }

          }
          dataolist.push(dataobject)
        }
      }

    }




    console.log(findMATCP.length);
  }

  output = dataolist


  //-------------------------------------
  res.json(output);
});



module.exports = router;
