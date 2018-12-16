var express = require('express');
var app = express();


var swaggerUi = require('swagger-ui-express');
var swaggerDocument = require('./swagger.json');


var TFBCController = require('./TFBCController');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/tfbc', TFBCController);

app.use("/tests", express.static(__dirname + '/tests'));
app.use("/", express.static(__dirname));


module.exports = app;
