// rguthrie Server - generic Express/Node server
//
// Payload html, css, and js files are expected to be
// in subdirectory 'public'.
//
// Route handling is expected to be in files apiRoutes.js
// and htmlRoutes.js, both located in subdirectory 'routes'.

const fs      = require('fs');
const path    = require('path');
const express = require('express');

// Global enablement of console logging.
const debug = (process.argv[2] == '-d');

// Express.js setup
var PORT = process.env.PORT ? process.env.PORT : 8080;
var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Route handling - keep htmlRoutes last so that wildcard match for GET is
// the last route match function.
require("./routes/apiRoutes.js" )(app);
require("./routes/htmlRoutes.js")(app);

// Start listening
app.listen(PORT, () => {console.log( `Serving ${PORT}. ${debug? 'Console logging on.':''} `);});

// Allow route handling js files to see the 'debug' boolean.
module.exports = debug;
