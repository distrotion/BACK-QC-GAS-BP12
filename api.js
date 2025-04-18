const express = require("express");
const router = express.Router();

router.use(require("./flow/001/sap"))
router.use(require("./flow/001/getmaster"))
router.use(require("./flow/001/upqcdata"))
router.use(require("./flow/001/1-APPGAS12"))
router.use(require("./flow/001/2-GASHMV001"))
router.use(require("./flow/001/3-GASHMV002"))
router.use(require("./flow/001/4-GASHMV003"))
router.use(require("./flow/001/5-GASVIC001"))
router.use(require("./flow/001/6-GASMCS002"))
router.use(require("./flow/001/7-GASRHT001"))
router.use(require("./flow/001/8-GASOHR001"))
router.use(require("./flow/001/INSFINISH"))
router.use(require("./flow/001/cleardata"))
router.use(require("./flow/001/GRAPHMASTER"))
router.use(require("./flow/001/reportlist"))
router.use(require("./flow/001/TOBEREPORT"))
//reportlist
//INSFINISH
// router.use(require("./flow/004/flow004"))TOBEREPORT
// router.use(require("./flow/005/flow005"))
router.use(require("./flow/testflow/testflow"))

module.exports = router;

