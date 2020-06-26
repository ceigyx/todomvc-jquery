/*jshint esversion:6 */

// init project
var express = require('express');
var app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + `/views/${process.argv[2] || "index"}.html`);
});

// listen for requests :)
var listener = app.listen(1337, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});