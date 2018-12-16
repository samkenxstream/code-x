var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var TFBC = require("./FabricHelper")


// Request LC
router.post('/requestLC', function (req, res) {

TFBC.requestLC(req, res);

});

// Issue LC
router.post('/issueLC', function (req, res) {

    TFBC.issueLC(req, res);

});

// Accept LC
router.post('/acceptLC', function (req, res) {

    TFBC.acceptLC(req, res);

});

// Request Trade
router.post('/requestTrade', function (req, res) {

    TFBC.requestTrade(req, res);

});

// Accept Trade
router.post('/acceptTrade', function (req, res) {

    TFBC.acceptTrade(req, res);

});

// Send Shipment
router.post('/sendShipment', function (req, res) {

    TFBC.sendShipment(req, res);

});

// Receive Shipment
router.post('/receiveShipment', function (req, res) {

    TFBC.receiveShipment(req, res);

});

// Request Payment
router.post('/requestPayment', function (req, res) {

    TFBC.requestPayment(req, res);

});

// Make Payment
router.post('/makePayment', function (req, res) {

    TFBC.makePayment(req, res);

});

// Get LC
router.post('/getLC', function (req, res) {

    TFBC.getLC(req, res);

});

// Get LC history
router.post('/getLCHistory', function (req, res) {

    TFBC.getLCHistory(req, res);

});

// Get TA
router.post('/getTA', function (req, res) {

    TFBC.getTA(req, res);

});

// Get TA history
router.post('/getTAHistory', function (req, res) {

    TFBC.getTAHistory(req, res);

});


module.exports = router;
