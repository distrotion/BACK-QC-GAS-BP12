const express = require("express");
const router = express.Router();
var mongodb = require('../../function/mongodb');
var mssql = require('./../../function/mssql');
const axios = require("../../function/axios");

//----------------- date

const d = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });;
let day = d;

//----------------- DATABASE

let MAIN_DATA = 'MAIN_DATA';
let MAIN = 'MAIN';

let PATTERN = 'PATTERN';
let PATTERN_01 = 'PATTERN_01';
let master_FN = 'master_FN';
let ITEMs = 'ITEMs';
let METHOD = 'METHOD';
let MACHINE = 'MACHINE';




router.post('/FINISHtoDB', async (req, res) => {
  //-------------------------------------
  console.log('--FINISHtoDB--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = input;
  //-------------------------------------
  let outputs = '';
  let findpo = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
  if (findpo.length === 0) {
    let nameFOR = input['MeasurmentFOR'];
    let nameTool = input['tool'];
    let nameItem = input['inspectionItem'];
    let value = input['value'];
    let Item = {};
    let Tool = {};

    Item[nameItem] = { "PSC1": value };
    Tool[nameTool] = Item;

    output[nameFOR] = Tool;
    output['dateG'] = new Date();
    output['dateGSTR'] = day;

    delete output['MeasurmentFOR'];
    delete output['tool'];
    delete output['inspectionItem'];
    delete output['value'];
    delete output['pieces'];
    //----new
    delete output['INS'];
    delete output['inspectionItemNAME'];
    delete output['ItemPick'];
    delete output['ItemPickcode'];
    delete output['POINTs'];
    delete output['PCS'];
    delete output['PCSleft'];
    delete output['UNIT'];
    delete output['INTERSEC'];
    delete output['preview'];
    delete output['confirmdata'];
    delete output['ITEMleftUNIT'];
    delete output['ITEMleftVALUE'];


    let findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });
    let masterITEMs = await mongodb.find(master_FN, ITEMs, {});
    let MACHINEmaster = await mongodb.find(master_FN, MACHINE, {});

    let ItemPickcodeout = [];
    for (i = 0; i < findcp[0]['FINAL'].length; i++) {
      for (j = 0; j < masterITEMs.length; j++) {
        if (findcp[0]['FINAL'][i]['ITEMs'] === masterITEMs[j]['masterID']) {
          ItemPickcodeout.push({ "key": masterITEMs[j]['masterID'], "value": masterITEMs[j]['ITEMs'], "METHOD": findcp[0]['FINAL'][i]['METHOD'] });
        }
      }
    }

    output['CHECKlist'] = ItemPickcodeout;

    let insertdb = await mongodb.insertMany(MAIN_DATA, MAIN, [output]);

    outputs = 'OK';
  } else {

    console.log("---->");
    let input_S2_1 = findpo[0]; //input1
    let input_S2_2 = output;     //input2
    let objectR = Object.getOwnPropertyNames(input_S2_1)
    let findMF = false;

    for (i = 0; i < objectR.length; i++) {
      if (objectR[i] === input_S2_2['MeasurmentFOR']) {
        findMF = true;
      }
    }
    if (findMF === false) {
      let nameFOR = input_S2_2['MeasurmentFOR'];
      let nameTool = input_S2_2['tool'];
      let nameItem = input_S2_2['inspectionItem'];
      let value = input_S2_2['value'];
      let Item = {};
      let Tool = {};
      let FOR = {};
      Tool[nameTool] = Item;
      FOR[nameFOR] = Tool;
      let out_S2_1 = { "PO": input_S2_2.PO };
      let out_S2_2 = { $set: FOR }
      Item[nameItem] = { PSC1: value };
      // outputs=[out_S2_1,out_S2_2]
      outputs = 'OK'
      let upd = await mongodb.update(MAIN_DATA, MAIN, out_S2_1, out_S2_2);

      //no use
    } else {
      let input_S3_1 = findpo[0]; //input1
      let input_S3_2 = output;    //input2
      // let objectR = Object.getOwnPropertyNames(nput_S3_1)
      let nameMF = "FINAL";


      let nameTool = "";
      let buff = input_S3_1[nameMF];
      let objectB = Object.getOwnPropertyNames(buff)
      for (j = 0; j < objectB.length; j++) {
        if (objectB[j] === input_S3_2['tool']) {
          nameTool = objectB[j];
        }
      }
      if (nameTool !== input_S3_2.tool) {
        let nameFOR = input_S3_2['MeasurmentFOR'];
        let nameTool = input_S3_2['tool'];
        let nameItem = input_S3_2['inspectionItem'];
        let value = input_S3_2['value'];
        let Item = {};
        let Tool = {};
        let FOR = input_S3_1[nameFOR];

        Item[nameItem] = { PSC1: value };
        input_S3_1[nameFOR][nameTool] = Item;
        let out_S3_1 = { PO: input_S3_2.PO };
        let out_S3_2 = { $set: input_S3_1 }

        outputs = 'OK'
        let upd = await mongodb.update(MAIN_DATA, MAIN, out_S3_1, out_S3_2);

      } else {
        let input_S4_1 = findpo[0]; //input1
        let input_S4_2 = output;    //input2
        let nameMF = "FINAL";

        let buff = input_S4_1[nameMF];
        let objectB = Object.getOwnPropertyNames(buff)
        for (j = 0; j < objectB.length; j++) {
          if (objectB[j] === input_S4_2.tool) {
            nameTool = objectB[j];
          }
        }

        let nameItem = "";
        let buff21 = input_S4_1[nameMF];
        let buff2 = buff21[nameTool];
        let objectI = Object.getOwnPropertyNames(buff2)
        for (k = 0; k < objectI.length; k++) {
          if (objectI[k] === input_S4_2.inspectionItem) {
            nameItem = objectI[k];
          }
        }

        if (input_S4_2.inspectionItem !== nameItem) {
          let nameFOR = input_S4_2['MeasurmentFOR'];
          let nameTool = input_S4_2['tool'];
          let nameItem = input_S4_2['inspectionItem'];
          let value = input_S4_2['value'];
          let FOR = input_S4_1[nameFOR];
          let Tool = FOR[nameTool];
          let Item = Tool
          Item[nameItem] = { PSC1: value };
          let out_S4_1 = { PO: input_S4_2.PO };
          let out_S4_2 = { $set: input_S4_1 }

          outputs = 'OK'
          let upd = await mongodb.update(MAIN_DATA, MAIN, out_S4_1, out_S4_2);

        } else {

          let nameFOR = input_S4_2.MeasurmentFOR;
          let nameTool = input_S4_2.tool;
          let nameItem = input_S4_2.inspectionItem;
          let value = input_S4_2.value;

          let FOR = input_S4_1[nameFOR];
          let Tool = FOR[nameTool];
          let Item = Tool

          let nItem = Object.getOwnPropertyNames(Item[nameItem]).length
          let timeStamp = `PSC${nItem + 1}`
          let buff = Item[nameItem];
          buff[timeStamp] = value;
          let out_S4_1 = { PO: input_S4_2.PO };
          let out_S4_2 = { $set: input_S4_1 }
          outputs = 'OK'
          let upd = await mongodb.update(MAIN_DATA, MAIN, out_S4_1, out_S4_2);

        }

      }

    }

  }
  if (input['tool'] != undefined && input['USER'] != undefined) {
    let wherePO = { "PO": input['PO'] }
    //input['tool']
    let nameTool = input['tool'];
    let updateset = {}
    updateset[nameTool] = input['USER']

    let upd = await mongodb.update(MAIN_DATA, MAIN, wherePO, updateset);
  }
  //-------------------------------------
  return res.json(outputs);
});

router.post('/FINISHtoDB-apr', async (req, res) => {
  //-------------------------------------
  console.log('--FINISHtoDB--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = input;
  //-------------------------------------
  let outputs = '';
  let findpo = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
  if (findpo.length === 0) {
    let nameFOR = input['MeasurmentFOR'];
    let nameTool = input['tool'];
    let nameItem = input['inspectionItem'];
    let value = input['value'];
    let Item = {};
    let Tool = {};

    console.log(input[`PCS`])

    if (input[`PCS`] === '1' || input[`PCS`] === 1) {
      Item[nameItem] = { "PSC1": value };
    } else if (input[`PCS`] === '5' || input[`PCS`] === 5) {
      Item[nameItem] = { "PSC1": value, "PSC2": value, "PSC3": value, "PSC4": value, "PSC5": value };
    } else if (input[`PCS`] === '10' || input[`PCS`] === 10) {
      Item[nameItem] = { "PSC1": value, "PSC2": value, "PSC3": value, "PSC4": value, "PSC5": value, "PSC6": value, "PSC7": value, "PSC8": value, "PSC9": value, "PSC10": value };
    } else {
      Item[nameItem] = { "PSC1": value };
    }

    // Item[nameItem] = { "PSC1": value,"PSC2": value,"PSC3": value,"PSC4": value,"PSC5": value ,"PSC6": value,"PSC7": value,"PSC8": value,"PSC9": value,"PSC10": value};
    Tool[nameTool] = Item;

    output[nameFOR] = Tool;
    output['dateG'] = new Date();
    output['dateGSTR'] = day;

    delete output['MeasurmentFOR'];
    delete output['tool'];
    delete output['inspectionItem'];
    delete output['value'];
    delete output['pieces'];
    //----new
    delete output['INS'];
    delete output['inspectionItemNAME'];
    delete output['ItemPick'];
    delete output['ItemPickcode'];
    delete output['POINTs'];
    delete output['PCS'];
    delete output['PCSleft'];
    delete output['UNIT'];
    delete output['INTERSEC'];
    delete output['preview'];
    delete output['confirmdata'];
    delete output['ITEMleftUNIT'];
    delete output['ITEMleftVALUE'];


    let findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });
    let masterITEMs = await mongodb.find(master_FN, ITEMs, {});
    let MACHINEmaster = await mongodb.find(master_FN, MACHINE, {});

    let ItemPickcodeout = [];
    for (i = 0; i < findcp[0]['FINAL'].length; i++) {
      for (j = 0; j < masterITEMs.length; j++) {
        if (findcp[0]['FINAL'][i]['ITEMs'] === masterITEMs[j]['masterID']) {
          ItemPickcodeout.push({ "key": masterITEMs[j]['masterID'], "value": masterITEMs[j]['ITEMs'], "METHOD": findcp[0]['FINAL'][i]['METHOD'] });
        }
      }
    }

    output['CHECKlist'] = ItemPickcodeout;

    let insertdb = await mongodb.insertMany(MAIN_DATA, MAIN, [output]);

    outputs = 'OK';
  } else {


    let input_S2_1 = findpo[0]; //input1
    let input_S2_2 = output;     //input2
    let objectR = Object.getOwnPropertyNames(input_S2_1)
    let findMF = false;

    for (i = 0; i < objectR.length; i++) {
      if (objectR[i] === input_S2_2['MeasurmentFOR']) {
        findMF = true;
      }
    }
    if (findMF === false) {
      let nameFOR = input_S2_2['MeasurmentFOR'];
      let nameTool = input_S2_2['tool'];
      let nameItem = input_S2_2['inspectionItem'];
      let value = input_S2_2['value'];
      let Item = {};
      let Tool = {};
      let FOR = {};
      Tool[nameTool] = Item;
      FOR[nameFOR] = Tool;
      let out_S2_1 = { "PO": input_S2_2.PO };
      let out_S2_2 = { $set: FOR }

      if (input[`PCS`] === '1' || input[`PCS`] === 1) {
        Item[nameItem] = { "PSC1": value };
      } else if (input[`PCS`] === '5' || input[`PCS`] === 5) {
        Item[nameItem] = { "PSC1": value, "PSC2": value, "PSC3": value, "PSC4": value, "PSC5": value };
      } else if (input[`PCS`] === '10' || input[`PCS`] === 10) {
        Item[nameItem] = { "PSC1": value, "PSC2": value, "PSC3": value, "PSC4": value, "PSC5": value, "PSC6": value, "PSC7": value, "PSC8": value, "PSC9": value, "PSC10": value };
      } else {
        Item[nameItem] = { "PSC1": value };
      }
      // Item[nameItem] = {  "PSC1": value,"PSC2": value,"PSC3": value,"PSC4": value,"PSC5": value ,"PSC6": value,"PSC7": value,"PSC8": value,"PSC9": value,"PSC10": value};
      // outputs=[out_S2_1,out_S2_2]
      outputs = 'OK'
      let upd = await mongodb.update(MAIN_DATA, MAIN, out_S2_1, out_S2_2);

      //no use
    } else {
      let input_S3_1 = findpo[0]; //input1
      let input_S3_2 = output;    //input2
      // let objectR = Object.getOwnPropertyNames(nput_S3_1)
      let nameMF = "FINAL";


      let nameTool = "";
      let buff = input_S3_1[nameMF];
      let objectB = Object.getOwnPropertyNames(buff)
      for (j = 0; j < objectB.length; j++) {
        if (objectB[j] === input_S3_2['tool']) {
          nameTool = objectB[j];
        }
      }
      if (nameTool !== input_S3_2.tool) {
        let nameFOR = input_S3_2['MeasurmentFOR'];
        let nameTool = input_S3_2['tool'];
        let nameItem = input_S3_2['inspectionItem'];
        let value = input_S3_2['value'];
        let Item = {};
        let Tool = {};
        let FOR = input_S3_1[nameFOR];

        if (input[`PCS`] === '1' || input[`PCS`] === 1) {
          Item[nameItem] = { "PSC1": value };
        } else if (input[`PCS`] === '5' || input[`PCS`] === 5) {
          Item[nameItem] = { "PSC1": value, "PSC2": value, "PSC3": value, "PSC4": value, "PSC5": value };
        } else if (input[`PCS`] === '10' || input[`PCS`] === 10) {
          Item[nameItem] = { "PSC1": value, "PSC2": value, "PSC3": value, "PSC4": value, "PSC5": value, "PSC6": value, "PSC7": value, "PSC8": value, "PSC9": value, "PSC10": value };
        } else {
          Item[nameItem] = { "PSC1": value };
        }

        // Item[nameItem] = {  "PSC1": value,"PSC2": value,"PSC3": value,"PSC4": value,"PSC5": value ,"PSC6": value,"PSC7": value,"PSC8": value,"PSC9": value,"PSC10": value };
        input_S3_1[nameFOR][nameTool] = Item;
        let out_S3_1 = { PO: input_S3_2.PO };
        let out_S3_2 = { $set: input_S3_1 }

        outputs = 'OK'
        let upd = await mongodb.update(MAIN_DATA, MAIN, out_S3_1, out_S3_2);

      } else {
        let input_S4_1 = findpo[0]; //input1
        let input_S4_2 = output;    //input2
        let nameMF = "FINAL";

        let buff = input_S4_1[nameMF];
        let objectB = Object.getOwnPropertyNames(buff)
        for (j = 0; j < objectB.length; j++) {
          if (objectB[j] === input_S4_2.tool) {
            nameTool = objectB[j];
          }
        }

        let nameItem = "";
        let buff21 = input_S4_1[nameMF];
        let buff2 = buff21[nameTool];
        let objectI = Object.getOwnPropertyNames(buff2)
        for (k = 0; k < objectI.length; k++) {
          if (objectI[k] === input_S4_2.inspectionItem) {
            nameItem = objectI[k];
          }
        }

        if (input_S4_2.inspectionItem !== nameItem) {
          let nameFOR = input_S4_2['MeasurmentFOR'];
          let nameTool = input_S4_2['tool'];
          let nameItem = input_S4_2['inspectionItem'];
          let value = input_S4_2['value'];
          let FOR = input_S4_1[nameFOR];
          let Tool = FOR[nameTool];
          let Item = Tool
          if (input[`PCS`] === '1' || input[`PCS`] === 1) {
            Item[nameItem] = { "PSC1": value };
          } else if (input[`PCS`] === '5' || input[`PCS`] === 5) {
            Item[nameItem] = { "PSC1": value, "PSC2": value, "PSC3": value, "PSC4": value, "PSC5": value };
          } else {
            Item[nameItem] = { "PSC1": value, "PSC2": value, "PSC3": value, "PSC4": value, "PSC5": value, "PSC6": value, "PSC7": value, "PSC8": value, "PSC9": value, "PSC10": value };
          }
          // Item[nameItem] = {  "PSC1": value,"PSC2": value,"PSC3": value,"PSC4": value,"PSC5": value ,"PSC6": value,"PSC7": value,"PSC8": value,"PSC9": value,"PSC10": value };
          let out_S4_1 = { PO: input_S4_2.PO };
          let out_S4_2 = { $set: input_S4_1 }

          outputs = 'OK'
          let upd = await mongodb.update(MAIN_DATA, MAIN, out_S4_1, out_S4_2);

        } else {

          let nameFOR = input_S4_2.MeasurmentFOR;
          let nameTool = input_S4_2.tool;
          let nameItem = input_S4_2.inspectionItem;
          let value = input_S4_2.value;

          let FOR = input_S4_1[nameFOR];
          let Tool = FOR[nameTool];
          let Item = Tool

          let nItem = Object.getOwnPropertyNames(Item[nameItem]).length
          let timeStamp = `PSC${nItem + 1}`
          let buff = Item[nameItem];
          buff[timeStamp] = value;
          let out_S4_1 = { PO: input_S4_2.PO };
          let out_S4_2 = { $set: input_S4_1 }
          outputs = 'OK'
          let upd = await mongodb.update(MAIN_DATA, MAIN, out_S4_1, out_S4_2);

        }

      }

    }

  }

  if (input['tool'] != undefined && input['USER'] != undefined) {
    let wherePO = { "PO": input['PO'] }
    //input['tool']
    let nameTool = input['tool'];
    let updateset = {}
    updateset[nameTool] = input['USER']
    console.log(updateset);
    let upd = await mongodb.update(MAIN_DATA, MAIN, wherePO, updateset);
  }
  //-------------------------------------
  return res.json(outputs);
});

// router.post('/FINISHtoDB-apr', async (req, res) => {
//   //-------------------------------------
//   console.log('--FINISHtoDB-apr--');
//   console.log(req.body);
//   let input = req.body;
//   //-------------------------------------
//   let output = input;
//   //-------------------------------------
//   let outputs = '';
//   let findpo = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
//   if (findpo.length === 0) {
//     let nameFOR = input['MeasurmentFOR'];
//     let nameTool = input['tool'];
//     let nameItem = input['inspectionItem'];
//     let value = input['value'];
//     let Item = {};
//     let Tool = {};

//     Item[nameItem] = { "PSC1": value,"PSC2": value,"PSC3": value,"PSC4": value,"PSC5": value ,"PSC6": value,"PSC7": value,"PSC8": value,"PSC9": value,"PSC10": value};
//     Tool[nameTool] = Item;

//     output[nameFOR] = Tool;
//     output['dateG'] = new Date();
//     output['dateGSTR'] =day;

//     delete output['MeasurmentFOR'];
//     delete output['tool'];
//     delete output['inspectionItem'];
//     delete output['value'];
//     delete output['pieces'];
//     //----new
//     delete output['INS'];
//     delete output['inspectionItemNAME'];
//     delete output['ItemPick'];
//     delete output['ItemPickcode'];
//     delete output['POINTs'];
//     delete output['PCS'];
//     delete output['PCSleft'];
//     delete output['UNIT'];
//     delete output['INTERSEC'];
//     delete output['preview'];
//     delete output['confirmdata'];
//     delete output['ITEMleftUNIT'];
//     delete output['ITEMleftVALUE'];


//     let findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });
//     let masterITEMs = await mongodb.find(master_FN, ITEMs, {});
//     let MACHINEmaster = await mongodb.find(master_FN, MACHINE, {});

//     let ItemPickcodeout = [];
//     for (i = 0; i < findcp[0]['FINAL'].length; i++) {
//       for (j = 0; j < masterITEMs.length; j++) {
//         if (findcp[0]['FINAL'][i]['ITEMs'] === masterITEMs[j]['masterID']) {
//           ItemPickcodeout.push({ "key": masterITEMs[j]['masterID'], "value": masterITEMs[j]['ITEMs'], "METHOD": findcp[0]['FINAL'][i]['METHOD'] });
//         }
//       }
//     }

//     output['CHECKlist'] = ItemPickcodeout;

//     let insertdb = await mongodb.insertMany(MAIN_DATA, MAIN, [output]);

//     outputs = 'OK';
//   } else {

//     console.log("---->");
//     let input_S2_1 = findpo[0]; //input1
//     let input_S2_2 = output;     //input2
//     let objectR = Object.getOwnPropertyNames(input_S2_1)
//     let findMF = false;

//     for (i = 0; i < objectR.length; i++) {
//       if (objectR[i] === input_S2_2['MeasurmentFOR']) {
//         findMF = true;
//       }
//     }
//     if (findMF === false) {
//       let nameFOR = input_S2_2['MeasurmentFOR'];
//       let nameTool = input_S2_2['tool'];
//       let nameItem = input_S2_2['inspectionItem'];
//       let value = input_S2_2['value'];
//       let Item = {};
//       let Tool = {};
//       let FOR = {};
//       Tool[nameTool] = Item;
//       FOR[nameFOR] = Tool;
//       let out_S2_1 = { "PO": input_S2_2.PO };
//       let out_S2_2 = { $set: FOR }
//       Item[nameItem] = {  "PSC1": value,"PSC2": value,"PSC3": value,"PSC4": value,"PSC5": value ,"PSC6": value,"PSC7": value,"PSC8": value,"PSC9": value,"PSC10": value};
//       // outputs=[out_S2_1,out_S2_2]
//       outputs = 'OK'
//       let upd = await mongodb.update(MAIN_DATA, MAIN, out_S2_1, out_S2_2);

//       //no use
//     } else {
//       let input_S3_1 = findpo[0]; //input1
//       let input_S3_2 = output;    //input2
//       // let objectR = Object.getOwnPropertyNames(nput_S3_1)
//       let nameMF = "FINAL";


//       let nameTool = "";
//       let buff = input_S3_1[nameMF];
//       let objectB = Object.getOwnPropertyNames(buff)
//       for (j = 0; j < objectB.length; j++) {
//         if (objectB[j] === input_S3_2['tool']) {
//           nameTool = objectB[j];
//         }
//       }
//       if (nameTool !== input_S3_2.tool) {
//         let nameFOR = input_S3_2['MeasurmentFOR'];
//         let nameTool = input_S3_2['tool'];
//         let nameItem = input_S3_2['inspectionItem'];
//         let value = input_S3_2['value'];
//         let Item = {};
//         let Tool = {};
//         let FOR = input_S3_1[nameFOR];

//         Item[nameItem] = {  "PSC1": value,"PSC2": value,"PSC3": value,"PSC4": value,"PSC5": value ,"PSC6": value,"PSC7": value,"PSC8": value,"PSC9": value,"PSC10": value };
//         input_S3_1[nameFOR][nameTool] = Item;
//         let out_S3_1 = { PO: input_S3_2.PO };
//         let out_S3_2 = { $set: input_S3_1 }

//         outputs = 'OK'
//         let upd = await mongodb.update(MAIN_DATA, MAIN, out_S3_1, out_S3_2);

//       } else {
//         let input_S4_1 = findpo[0]; //input1
//         let input_S4_2 = output;    //input2
//         let nameMF = "FINAL";

//         let buff = input_S4_1[nameMF];
//         let objectB = Object.getOwnPropertyNames(buff)
//         for (j = 0; j < objectB.length; j++) {
//           if (objectB[j] === input_S4_2.tool) {
//             nameTool = objectB[j];
//           }
//         }

//         let nameItem = "";
//         let buff21 = input_S4_1[nameMF];
//         let buff2 = buff21[nameTool];
//         let objectI = Object.getOwnPropertyNames(buff2)
//         for (k = 0; k < objectI.length; k++) {
//           if (objectI[k] === input_S4_2.inspectionItem) {
//             nameItem = objectI[k];
//           }
//         }

//         if (input_S4_2.inspectionItem !== nameItem) {
//           let nameFOR = input_S4_2['MeasurmentFOR'];
//           let nameTool = input_S4_2['tool'];
//           let nameItem = input_S4_2['inspectionItem'];
//           let value = input_S4_2['value'];
//           let FOR = input_S4_1[nameFOR];
//           let Tool = FOR[nameTool];
//           let Item = Tool
//           Item[nameItem] = {  "PSC1": value,"PSC2": value,"PSC3": value,"PSC4": value,"PSC5": value ,"PSC6": value,"PSC7": value,"PSC8": value,"PSC9": value,"PSC10": value };
//           let out_S4_1 = { PO: input_S4_2.PO };
//           let out_S4_2 = { $set: input_S4_1 }

//           outputs = 'OK'
//           let upd = await mongodb.update(MAIN_DATA, MAIN, out_S4_1, out_S4_2);

//         } else {

//           let nameFOR = input_S4_2.MeasurmentFOR;
//           let nameTool = input_S4_2.tool;
//           let nameItem = input_S4_2.inspectionItem;
//           let value = input_S4_2.value;

//           let FOR = input_S4_1[nameFOR];
//           let Tool = FOR[nameTool];
//           let Item = Tool

//           let nItem = Object.getOwnPropertyNames(Item[nameItem]).length
//           let timeStamp = `PSC${nItem + 1}`
//           let buff = Item[nameItem];
//           buff[timeStamp] = value;
//           let out_S4_1 = { PO: input_S4_2.PO };
//           let out_S4_2 = { $set: input_S4_1 }
//           outputs = 'OK'
//           let upd = await mongodb.update(MAIN_DATA, MAIN, out_S4_1, out_S4_2);

//         }

//       }

//     }

//   }
//   //-------------------------------------
//   return  res.json(outputs);
// });

router.post('/GRAPH-recal', async (req, res) => {
  //-------------------------------------
  console.log('--TPGHMV002-recal--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';

  //-------------------------------------
  if (input["PO"] !== undefined && input["ITEMs"] !== undefined) {
    let feedback = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });

    if (feedback.length > 0 && feedback[0]['FINAL'] != undefined && feedback[0]['FINAL'][input["NAME_INS"]] != undefined && feedback[0]['FINAL'][input["NAME_INS"]][input["ITEMs"]] != undefined) {
      // console.log(Object.keys(feedback[0]['FINAL'][NAME_INS][input["ITEMs"]]));
      let oblist = Object.keys(feedback[0]['FINAL'][input["NAME_INS"]][input["ITEMs"]]);
      let ob = feedback[0]['FINAL'][input["NAME_INS"]][input["ITEMs"]];

      let LISTbuffer = [];
      let ITEMleftVALUEout = [];

      for (i = 0; i < oblist.length; i++) {
        LISTbuffer.push(...ob[oblist[i]])
      }


      if (input["MODE"] == 'CDE') {

        //
        let axis_data = [];
        for (i = 0; i < LISTbuffer.length; i++) {
          if (LISTbuffer[i]['PO1'] !== 'Mean') {
            axis_data.push({ x: parseFloat(LISTbuffer[i].PO8), y: parseFloat(LISTbuffer[i].PO3) });
          }
        }
        //-----------------core

        let core = 0;
        if (input['INTERSEC'] !== '') {
          core = parseFloat(input['INTERSEC'])
        } else {
          if (input['CORE'] != undefined) {
            core = parseFloat(axis_data[axis_data.length - 1]['y']) + parseFloat(input['CORE'])
          } else {
            core = parseFloat(axis_data[axis_data.length - 1]['y']) + 50
          }

        }

        //-----------------core
        let RawPoint = [];
        for (i = 0; i < axis_data.length - 1; i++) {
          if (core <= axis_data[i].y && core >= axis_data[i + 1].y) {
            RawPoint.push({ Point1: axis_data[i], Point2: axis_data[i + 1] });
            break
          }
        }

        try {
          let pointvalue = RawPoint[0].Point2.x - RawPoint[0].Point1.x;
          let data2 = RawPoint[0].Point1.y - core;
          let data3 = RawPoint[0].Point1.y - RawPoint[0].Point2.y;

          let RawData = RawPoint[0].Point1.x + (data2 / data3 * pointvalue);
          let graph_ans_X = parseFloat(RawData.toFixed(2));

          feedback[0]['FINAL_ANS'][input["ITEMs"]] = graph_ans_X;
          feedback[0]['FINAL_ANS'][`${input["ITEMs"]}_point`] = { "x": graph_ans_X, "y": core };

          let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });
        }
        catch (err) {
          // TPGHMV002db[`INTERSEC_ERR`] = 1;
        }
        output = 'OK1';
        //
      } else if (input["MODE"] == 'CDT') {
        let axis_data = [];
        for (i = 0; i < LISTbuffer.length; i++) {
          if (LISTbuffer[i]['PO1'] !== 'Mean') {
            axis_data.push({ x: parseFloat(LISTbuffer[i].PO8), y: parseFloat(LISTbuffer[i].PO3) });
          }
        }

        let d = []
        for (i = 0; i < axis_data.length - 1; i++) {
          d.push((axis_data[i].y - axis_data[i + 1].y) / (axis_data[i + 1].x - axis_data[i].x));
        }

        let def = []

        for (i = 0; i < d.length - 1; i++) {
          if (d[i] > d[i + 1]) {
            def[i] = (d[i] - d[i + 1])
          } else {
            def[i] = (d[i + 1] - d[i])
          }

        }

        for (j = 0; j < def.length; j++) {
          if (def[j] === Math.max(...def)) {
            pos = [j + 1, j + 2]
          }
        }

        let d1 = -d[pos[0] - 1]
        let d2 = -d[pos[1]]


        let c1 = (axis_data[pos[0]].y - d1 * axis_data[pos[0]].x);
        let c2 = (axis_data[pos[1]].y - d2 * axis_data[pos[1]].x);


        let Xans = 0;
        let Yans = 0;
        let x = (c[1] - c[0]) / (d1 - d2);


        if (x >= 0) {
          Xans = x
        } else {
          Xans = -x
        }

        y = d1 * Xans + c[0]
        Yans = y

        let graph_ans_X = parseFloat(Xans.toFixed(2));
        let graph_ans_Y = parseFloat(Yans.toFixed(2));

        feedback[0]['FINAL_ANS'][input["ITEMs"]] = graph_ans_X;
        feedback[0]['FINAL_ANS'][`${input["ITEMs"]}_point`] = { "x": graph_ans_X, "y": graph_ans_Y };

        let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });
        output = 'OK2';

      }

    }

  }

  //-------------------------------------
  return res.json(output);
});

router.post('/GETHMVATPOINT', async (req, res) => {
  //-------------------------------------
  console.log('--GETHMVATPOINT--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = "NOK";
  //-------------------------------------

  if (input[`PO`] !== undefined && input[`NAME_INS`] !== undefined && input[`POINT`] !== undefined) {



    let testDB = await mongodb.find(MAIN_DATA, MAIN, { "PO": input[`PO`] });

    try {
      if (testDB.length > 0) {
        // let ob = testDB[0]['FINAL'][input["NAME_INS"]][input["ITEMs"]];
        let ob1 = testDB[0]['FINAL'][input["NAME_INS"]];
        let ob2 = testDB[0]['CHECKlist'];

        // console.log(ob1);
        // console.log(ob2);
        for (let i = 0; i < ob2.length; i++) {
          if (ob1[ob2[i]['key']] != undefined) {
            // console.log(ob1[ob2[i]['key']]['PSC1'][parseInt(input[`POINT`])]);

            output = `${ob1[ob2[i]['key']]['PSC1'][parseInt(input[`POINT`])]['PO3']}`
            let dataCheck = await axios.post("http://localhost:16180/Refgraph-preview", [{ "V1": "ref1", "V2": output }])
          }

        }


      }
    } catch (error) {

    }



  }





  return res.json(output);
});


router.post('/ISNHESreport', async (req, res) => {
  //-------------------------------------
  console.log('--ISNHESreport--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = [];
  //-------------------------------------
  var d = new Date();
  d.setFullYear(d.getFullYear(), d.getMonth(), d.getDate() - 10);

  var dc = new Date();
  dc.setFullYear(dc.getFullYear(), dc.getMonth(), dc.getDate());

  // let day = `${d.getFullYear()}-${(d.getMonth() + 1).pad(2)}-${(d.getDate()).pad(2)}`
  // let dayC = `${dc.getFullYear()}-${(dc.getMonth() + 1).pad(2)}-${(dc.getDate()).pad(2)}`
  // let tim = `${(d.getHours()).pad(2)}:${(d.getMinutes()).pad(2)}:${(d.getSeconds()).pad(2)}`

  let out = {
    "ALL_DONE": 'DONE',
    "dateG":
    {
      "$gte": d,
      "$lt": dc
    },
    // "FINAL_ANS" : { $exists : false },
  }

  output = await mongodb.findproject(MAIN_DATA, MAIN, out, { "PO": 1, "CP": 1, "MATCP": 1, "CUSTOMER": 1, "PART": 1, "PARTNAME": 1, "MATERIAL": 1, "CUSLOTNO": 1, "IDInspected": 1, "IDCheck": 1, "IDApprove": 1 });
  console.log(output)


  //-------------------------------------
  return res.json(output);
});

router.post('/Inspected-sign', async (req, res) => {
  //-------------------------------------
  console.log('--Inspected-sign--');
  // console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK'

  if (input['ID'] != undefined && input['PO'] != undefined) {
    let sign = {
      'dateInspected': `${Date.now()}`,
      'IDInspected': input['ID'],
    }
    let upd = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { $set: sign });
    output = 'OK'
  }

  //-------------------------------------
  return res.json(output);
});


router.post('/Check-sign', async (req, res) => {
  //-------------------------------------
  console.log('--Check-sign--');
  // console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK'

  if (input['ID'] != undefined && input['PO'] != undefined) {
    let sign = {
      'dateCheck': `${Date.now()}`,
      'IDCheck': input['ID'],
    }
    let upd = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { $set: sign });
    output = 'OK'
  }

  //-------------------------------------
  return res.json(output);
});

router.post('/Approve-sign', async (req, res) => {
  //-------------------------------------
  console.log('--Check-sign--');
  // console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK'

  if (input['ID'] != undefined && input['PO'] != undefined) {
    let sign = {
      'dateApprove': `${Date.now()}`,
      'IDApprove': input['ID'],
    }
    let upd = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { $set: sign });
    output = 'OK'
  }

  //-------------------------------------
  return res.json(output);
});


//let objectR = Object.getOwnPropertyNames(input_S2_1)

module.exports = router;