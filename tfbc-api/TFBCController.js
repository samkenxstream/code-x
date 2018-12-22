var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var TFBC = require("./FabricHelper")



// Request LC
router.post('/requestLC', function (req, res) {
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

TFBC.requestLC(req, res);

});

// Issue LC
router.post('/issueLC', function (req, res) {
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    TFBC.issueLC(req, res);

});

// Accept LC
router.post('/acceptLC', function (req, res) {
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    TFBC.acceptLC(req, res);

});

// Request Trade
router.post('/requestTrade', function (req, res) {
res.header("Access-Control-Allow-Origin", "*");

res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

console.log ("calling request trade");

    TFBC.requestTrade(req, res);

});

// Accept Trade
router.post('/acceptTrade', function (req, res) {
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    TFBC.acceptTrade(req, res);

});

// Send Shipment
router.post('/sendShipment', function (req, res) {
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    TFBC.sendShipment(req, res);

});

// Receive Shipment
router.post('/receiveShipment', function (req, res) {
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    TFBC.receiveShipment(req, res);

});

// Request Payment
router.post('/requestPayment', function (req, res) {
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    TFBC.requestPayment(req, res);

});

// Make Payment
router.post('/makePayment', function (req, res) {
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    TFBC.makePayment(req, res);

});

// Get LC
router.post('/getLC', function (req, res) {
res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    TFBC.getLC(req, res);

});

// Get LC history
router.post('/getLCHistory', function (req, res) {
res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    TFBC.getLCHistory(req, res);

});

// Get TA
router.post('/getTA', function (req, res) {
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    TFBC.getTA(req, res);

});

// Get TA history
router.post('/getTAHistory', function (req, res) {
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    TFBC.getTAHistory(req, res);

});


module.exports = router;
