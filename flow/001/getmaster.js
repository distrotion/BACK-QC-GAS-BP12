const express = require("express");
const { kill } = require("nodemon/lib/monitor/run");
const router = express.Router();
const axios = require("../../function/axios");
let mongodb = require('../../function/mongodb');

//----------------- DATABASE

let MAIN_DATA = 'MAIN_DATA';
let MAIN = 'MAIN';

let PATTERN = 'PATTERN';
let PATTERN_01 = 'PATTERN_01';
let master_FN = 'master_FN';
let ITEMs = 'ITEMs';
let METHOD = 'METHOD';
let MACHINE = 'MACHINE';

router.post('/getmaster', async (req, res) => {
  //-------------------------------------
  console.log('--getmaster--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';

  if (input['PO'] !== undefined && input['CP'] !== undefined) {

  }
  let data = await axios.post("http://localhost:16180/JUDEMENT",{"PO":"3310268547","CP":"24013199"})


  //-------------------------------------
  res.json(data);
});

router.post('/GETINSset', async (req, res) => {
  //-------------------------------------
  console.log('--GETINSset--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = {};
  let findcp = [];
  let findPO = [];
  let ITEMMETHODlist = [];
  let METHODmaster = [];
  let MACHINEmaster = [];
  let INSLIST = [];
  let INSLISTans = [];


  if (input['CP'] !== undefined && input['PO'] !== undefined) {
    findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });
    findPO = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });


    // if(findcp.length === 0 ){
    //   findcp = await mongodb.find(PATTERN, PATTERN_01, { "FG": input['CP'] });
    // }

  }
  if (findcp.length > 0 && findPO.length === 0) {
    if (findcp[0]['FINAL'] !== undefined && findcp[0]['FINAL'].length > 0) {
      for (i = 0; i < findcp[0]['FINAL'].length; i++) {
        ITEMMETHODlist.push({ "ITEMs": findcp[0]['FINAL'][i]['ITEMs'], "METHOD": findcp[0]['FINAL'][i]['METHOD'] })
      }

      METHODmaster = await mongodb.find(master_FN, METHOD, {});
      MACHINEmaster = await mongodb.find(master_FN, MACHINE, {});

      for (i = 0; i < ITEMMETHODlist.length; i++) {
        for (j = 0; j < METHODmaster.length; j++) {
          if (ITEMMETHODlist[i]['METHOD'] === METHODmaster[j]['METHOD']) {
            for (k = 0; k < MACHINEmaster.length; k++) {
              if (METHODmaster[j]['METHOD'] === MACHINEmaster[k]['masterID']) {
                if (MACHINEmaster[k]['MACHINE'].length > 0) {
                  INSLIST.push(...MACHINEmaster[k]['MACHINE']);
                }
              }
            }
          }
        }
      }
      INSLISTans = [...new Set(INSLIST)];
    }
  } else {
    try {

      let CHECKlist = findPO[0]['CHECKlist'];
      let CHECKlistnew = [];
      MACHINEmaster = await mongodb.find(master_FN, MACHINE, {});

      for (i = 0; i < CHECKlist.length; i++) {
        if (CHECKlist[i]['FINISH'] === undefined) {
          CHECKlistnew.push(CHECKlist[i]);
        }
      }
      // console.log(CHECKlistnew);
      for (i = 0; i < CHECKlistnew.length; i++) {
        for (j = 0; j < MACHINEmaster.length; j++) {
          if (CHECKlistnew[i]['METHOD'] === MACHINEmaster[j]['masterID']) {
            if (MACHINEmaster[j]['MACHINE'].length > 0) {
              INSLIST.push(...MACHINEmaster[j]['MACHINE']);
            }
          }
        }
      }

      INSLISTans = [...new Set(INSLIST)];
      if (INSLISTans.length === 0) {
        let feedbackupdateFINISH = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { "ALL_DONE": "DONE", "PO_judgment": "pass", } });
      }
    }
    catch (errin) {
      if (findcp.length > 0) {
        for (i = 0; i < findcp[0]['FINAL'].length; i++) {
          ITEMMETHODlist.push({ "ITEMs": findcp[0]['FINAL'][i]['ITEMs'], "METHOD": findcp[0]['FINAL'][i]['METHOD'] })
        }

        METHODmaster = await mongodb.find(master_FN, METHOD, {});
        MACHINEmaster = await mongodb.find(master_FN, MACHINE, {});

        for (i = 0; i < ITEMMETHODlist.length; i++) {
          for (j = 0; j < METHODmaster.length; j++) {
            if (ITEMMETHODlist[i]['METHOD'] === METHODmaster[j]['METHOD']) {
              for (k = 0; k < MACHINEmaster.length; k++) {
                if (METHODmaster[j]['METHOD'] === MACHINEmaster[k]['masterID']) {
                  if (MACHINEmaster[k]['MACHINE'].length > 0) {
                    INSLIST.push(...MACHINEmaster[k]['MACHINE']);
                  }
                }
              }
            }
          }
        }
        INSLISTans = [...new Set(INSLIST)];

      } else {
        INSLISTans = [];
      }
    }
  }
  console.log(INSLISTans);

  //-------------------------------------
  res.json(INSLISTans);
});

//         "PO": "",
//         "CP": "",
//         "QTY": "",
//         "PROCESS": "",
//         "CUSLOT": "",
//         "TPKLOT": "",
//         "FG": "",
//         "CUSTOMER": "",
//         "PART": "",
//         "PARTNAME": "",
//         "MATERIAL": "",

router.post('/JUDEMENT', async (req, res) => {
  //-------------------------------------
  console.log('--JUDEMENT--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = [];
  if (input['PO'] !== undefined && input['CP'] !== undefined) {
    findPO = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
    findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });

    if (findPO.length > 0 && findcp.length > 0) {
      // console.log(findcp[0]['FINAL']);
      let specList = []
      for (let i = 0; i < findcp[0]['FINAL'].length; i++) {
        specList.push({ "ITEMs": findcp[0]['FINAL'][i][`ITEMs`], "SPECIFICATIONve": findcp[0]['FINAL'][i][`SPECIFICATIONve`] });
      }
      // console.log(specList);
      // console.log(findPO[0]['FINAL']);
      // console.log(Object.getOwnPropertyNames(findPO[0]['FINAL']));
      let ListEQP = Object.getOwnPropertyNames(findPO[0]['FINAL']);
      let LisDATA = [];
      for (let i = 0; i < ListEQP.length; i++) {
        // console.log(findPO[0]['FINAL'][ListEQP[i]].length);
        // LisDATA.push(findPO[0]['FINAL'][ListEQP[i]]);
        let ListDATAsub = Object.getOwnPropertyNames(findPO[0]['FINAL'][ListEQP[i]]);
        if (ListDATAsub.length == 1) {
          LisDATA.push(findPO[0]['FINAL'][ListEQP[i]]);
        } else if (ListDATAsub.length > 1) {
          for (let j = 0; j < ListDATAsub.length; j++) {
            let buffer = {};
            buffer[ListDATAsub[j]] = findPO[0]['FINAL'][ListEQP[i]][ListDATAsub[j]]
            LisDATA.push(buffer);
          }
        }
      }

      // console.log(LisDATA);
      // console.log(specList);

      for (i = 0; i < specList.length; i++) {
        if (specList.length) {
          // console.log( specList[i][`ITEMs`]) 
          // console.log(typeof specList[i][`SPECIFICATIONve`]) 
          if (typeof specList[i][`SPECIFICATIONve`] === 'string') {
            // console.log(specList[i][`ITEMs`]) ;
            // console.log(LisDATA) ;
            for (j = 0; j < LisDATA.length; j++) {
              if (LisDATA[j][specList[i][`ITEMs`]] !== undefined) {
                // console.log(LisDATA[j][specList[i][`ITEMs`]]) ;
                let bufferDATA = Object.getOwnPropertyNames(LisDATA[j][specList[i][`ITEMs`]]);
                // console.log(bufferDATA);
                let ITEMid = Object.getOwnPropertyNames(LisDATA[j])
                if (ITEMid.length > 0) {
                  console.log(Object.getOwnPropertyNames(LisDATA[j])[0])
                  for (let k = 0; k < bufferDATA.length; k++) {
                    console.log(specList[i][`SPECIFICATIONve`])
                    console.log(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]]['PO2'])
                    if (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]]['PO2'] === "Good") {
                      output.push({ "ITEMs": ITEMid, "NO": k + 1, "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]]['PO2'], "result": "OK" })
                    } else {
                      output.push({ "ITEMs": ITEMid, "NO": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]]['PO2'], "result": "NOK" })
                    }
                    console.log("-----------------------")
                  }
                }

              }

            }

          } else if (typeof specList[i][`SPECIFICATIONve`] === 'object') {
            // console.log(specList[i][`ITEMs`]) ;
            // console.log(LisDATA[0][specList[i][`ITEMs`]]) ;
            for (j = 0; j < LisDATA.length; j++) {
              if (LisDATA[j][specList[i][`ITEMs`]] !== undefined) {
                // console.log(LisDATA[j][specList[i][`ITEMs`]]) ;
                let bufferDATA = Object.getOwnPropertyNames(LisDATA[j][specList[i][`ITEMs`]]);
                let ITEMid = Object.getOwnPropertyNames(LisDATA[j])
                if (ITEMid.length > 0) {
                  console.log(Object.getOwnPropertyNames(LisDATA[j])[0])
                  // console.log(bufferDATA);
                  for (let k = 0; k < bufferDATA.length; k++) {

                    // console.log(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]])


                    if (specList[i][`SPECIFICATIONve`]['condition'] === 'LOL(<)') {

                      for (let p = 0; p < LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]].length; p++) {
                        // console.log( specList[i][`SPECIFICATIONve`]) 
                        if (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data'] === undefined) {
                          if (parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3']) <= parseFloat(specList[i][`SPECIFICATIONve`]['LOL_H'])) {
                            // console.log(parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3']))
                            output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3'], "result": "OK" })
                          } else {
                            output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3'], "result": "NOK" })
                          }
                        } else {
                          if ((LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data']) !== '' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data']) !== '0' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data']) !== 0) {
                            if (parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data']) <= parseFloat(specList[i][`SPECIFICATIONve`]['LOL_H'])) {
                              // console.log(parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3']))
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data'], "result": "OK" })
                            } else {
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data'], "result": "NOK" })
                            }
                          }

                          if ((LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC2data']) !== '' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC2data']) !== '0' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC2data']) !== 0) {
                            if (parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC2data']) <= parseFloat(specList[i][`SPECIFICATIONve`]['LOL_H'])) {
                              // console.log(parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3']))
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC2data'], "result": "OK" })
                            } else {
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC2data'], "result": "NOK" })
                            }
                          }

                          if ((LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC3data']) !== '' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC3data']) !== '0' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC3data']) !== 0) {
                            if (parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC3data']) <= parseFloat(specList[i][`SPECIFICATIONve`]['LOL_H'])) {
                              // console.log(parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3']))
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC3data'], "result": "OK" })
                            } else {
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC3data'], "result": "NOK" })
                            }
                          }

                          if ((LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC4data']) !== '' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC4data']) !== '0' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC4data']) !== 0) {
                            if (parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC4data']) <= parseFloat(specList[i][`SPECIFICATIONve`]['LOL_H'])) {
                              // console.log(parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3']))
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC4data'], "result": "OK" })
                            } else {
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC4data'], "result": "NOK" })
                            }
                          }
                        }

                      }

                    } else if (specList[i][`SPECIFICATIONve`]['condition'] === 'HIM(>)') {

                      for (let p = 0; p < LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]].length; p++) {
                        // console.log( LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data']) 

                        if (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data'] === undefined) {

                          if (parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3']) >= parseFloat(specList[i][`SPECIFICATIONve`]['HIM_L'])) {
                            // console.log(parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3']))
                            output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3'], "result": "OK" })
                          } else {
                            output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3'], "result": "NOK" })
                          }
                        } else {
                          if ((LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data']) !== '' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data']) !== '0' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data']) !== 0) {
                            if (parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data']) >= parseFloat(specList[i][`SPECIFICATIONve`]['HIM_L'])) {
                              // console.log(parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3']))
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data'], "result": "OK" })
                            } else {

                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data'], "result": "NOK" })
                            }
                          }

                          if ((LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC2data']) !== '' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC2data']) !== '0' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC2data']) !== 0) {
                            if (parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC2data']) >= parseFloat(specList[i][`SPECIFICATIONve`]['HIM_L'])) {
                              // console.log(parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3']))
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC2data'], "result": "OK" })
                            } else {
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC2data'], "result": "NOK" })
                            }
                          }

                          if ((LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC3data']) !== '' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC3data']) !== '0' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC3data']) !== 0) {
                            if (parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC3data']) >= parseFloat(specList[i][`SPECIFICATIONve`]['HIM_L'])) {
                              // console.log(parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3']))
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC3data'], "result": "OK" })
                            } else {
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC3data'], "result": "NOK" })
                            }
                          }

                          if ((LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC4data']) !== '' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC4data']) !== '0' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC4data']) !== 0) {
                            if (parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC4data']) >= parseFloat(specList[i][`SPECIFICATIONve`]['HIM_L'])) {
                              // console.log(parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3']))
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC4data'], "result": "OK" })
                            } else {
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC4data'], "result": "NOK" })
                            }
                          }
                        }

                      }

                    } else if (specList[i][`SPECIFICATIONve`]['condition'] === 'BTW') {
                      
                      for (let p = 0; p < LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]].length; p++) {
                        // console.log( LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data']) 

                        if (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data'] === undefined) {

                          if ((parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3']) >= parseFloat(specList[i][`SPECIFICATIONve`]['BTW_LOW'])) && (parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3']) <= parseFloat(specList[i][`SPECIFICATIONve`]['BTW_HI']))) {
                            // console.log(parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3']))
                            output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3'], "result": "OK" })
                          } else {
                            output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3'], "result": "NOK" })
                          }
                        } else {
                          if ((LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data']) !== '' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data']) !== '0' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data']) !== 0) {
                            if ((parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data']) >= parseFloat(specList[i][`SPECIFICATIONve`]['BTW_LOW'])) && (parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data']) <= parseFloat(specList[i][`SPECIFICATIONve`]['BTW_HI']))) {
                              // console.log(parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3']))
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data'], "result": "OK" })
                            } else {

                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC1data'], "result": "NOK" })
                            }
                          }

                          if ((LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC2data']) !== '' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC2data']) !== '0' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC2data']) !== 0) {
                            if ((parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC2data']) >= parseFloat(specList[i][`SPECIFICATIONve`]['BTW_LOW']))&& (parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC2data']) <= parseFloat(specList[i][`SPECIFICATIONve`]['BTW_HI']))) {
                              // console.log(parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3']))
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC2data'], "result": "OK" })
                            } else {
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC2data'], "result": "NOK" })
                            }
                          }

                          if ((LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC3data']) !== '' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC3data']) !== '0' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC3data']) !== 0) {
                            if ((parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC3data']) >= parseFloat(specList[i][`SPECIFICATIONve`]['BTW_LOW']))&& (parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC3data']) <= parseFloat(specList[i][`SPECIFICATIONve`]['BTW_HI']))) {
                              // console.log(parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3']))
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC3data'], "result": "OK" })
                            } else {
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC3data'], "result": "NOK" })
                            }
                          }

                          if ((LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC4data']) !== '' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC4data']) !== '0' && (LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC4data']) !== 0) {
                            if ((parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC4data']) >= parseFloat(specList[i][`SPECIFICATIONve`]['BTW_LOW']))&& (parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC4data']) <= parseFloat(specList[i][`SPECIFICATIONve`]['BTW_HI']))) {
                              // console.log(parseFloat(LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3']))
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC4data'], "result": "OK" })
                            } else {
                              output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PIC4data'], "result": "NOK" })
                            }
                          }
                        }

                      }

                    } else if (specList[i][`SPECIFICATIONve`]['condition'] === "Actual") {
                      for (let p = 0; p < LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]].length; p++) {
                      output.push({ "ITEMs": ITEMid, "NO": k + 1, "SPECIFICATIONve": specList[i][`SPECIFICATIONve`], "value": LisDATA[j][specList[i][`ITEMs`]][bufferDATA[k]][p]['PO3'], "result": "OK" })
                      }
                    }

                    console.log("-----------------------")
                  }
                }
              }

            }
          }

        }
      }

    }
  }


  res.json(output);
});


router.post('/GETfg', async (req, res) => {
  //-------------------------------------
  console.log('--GETfg--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = {};
  let findfg = [];
  let findPO = [];
  let ITEMMETHODlist = [];
  let METHODmaster = [];
  let MACHINEmaster = [];
  let INSLIST = [];
  let INSLISTans = [];


  if (input['FG'] !== undefined ) {
    findfg = await mongodb.find(PATTERN, PATTERN_01, { "FG": input['FG'] });
  
    INSLISTans = findfg

    // if(findcp.length === 0 ){
    //   findcp = await mongodb.find(PATTERN, PATTERN_01, { "FG": input['CP'] });
    // }

  }

  console.log(INSLISTans);

  //-------------------------------------
  res.json(INSLISTans);
});

module.exports = router;