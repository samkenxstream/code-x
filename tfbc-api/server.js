var fs = require('fs');
var https = require('https');
var app = require('./app');



var port = process.env.PORT || 443; 


var server = https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app)
.listen(port, function () {
  console.log('Express server listening on port ' + port);
})
