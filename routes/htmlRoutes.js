// NoteTaker server - HTML route handling
// supports delivery of home and notes pages.

const path = require("path");

// wrapper function to allow invocation from server.js
module.exports = (app) => {

    //* GET `/notes` - send the `notes.html` file
    app.get("/notes", (req, res) => {res.sendFile(path.join(__dirname,'../public/notes.html'));});

    //* GET `*` - send the `index.html` file
    app.get("*"     , (req, res) => {res.sendFile(path.join(__dirname,'../public/index.html'));});

};