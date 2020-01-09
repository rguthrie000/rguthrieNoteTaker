// * The application should have a `db.json` file on the backend 
//   that will be used to store and retrieve notes using the `fs` module.
const fs      = require("fs");
const path    = require("path");
const express = require("express");

const debug = (process.argv[2] == '-d');

// Express.js setup and Server startup
var PORT = process.env.PORT ? process.env.PORT : 8080;
var app = express();
// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.listen(PORT, function() {
  console.log(`Note Taker listening on ${PORT}.${debug? " Console logging is on.":""}`);
});

let notesArr = [];

const log = (str) => {if (debug) {console.log(`${Date.now()} ${str}`);}}
const notesLog = () => {if (debug) console.log(notesArr);}

// Local paths
const indexFile  = path.join(__dirname + '/public/index.html');
const notesFile  = path.join(__dirname + '/public/notes.html');
const dbFile     = path.join(__dirname + '/db/db.json');

// Routes

//* GET `/notes` - returns the `notes.html` file.
app.get("/notes", (req, res) => {log("get: notes.html"); res.sendFile(notesFile);});

//* GET `/api/notes` - reads the `db.json` file and returns all saved notes as JSON.
app.get("/api/notes", (req, res) => {log('get: db.json'); res.sendFile(dbFile);});
 
//* GET `*` - returns the `index.html` file
app.get("*", (req, res) => {log('get: index.html'); res.sendFile(indexFile);});

//* POST `/api/notes` - receives a new note in the request body, adds it
// to the `db.json` file, and then returns the new note to the client.
app.post("/api/notes", (req, res) => {
  let data = "";
  fs.readFile(dbFile, (err,data) => {
    if (err) log(err); 
    if (data) {notesArr = JSON.parse(data);}
    let newNote = {
      id: (notesArr.length == 0 ? 0 : notesArr[notesArr.length-1].id + 1),
      title: req.body.title,
      text: req.body.text
    };
    notesArr.push(newNote);
    fs.writeFile(dbFile, JSON.stringify(notesArr), (err) => {if (err) log(err)});
    res.send(newNote);
    notesLog();
  });
});

//* DELETE `/api/notes/:id` - receives a query parameter containing 
//the id of a note to delete. 
app.delete("/api/notes/:id", (req, res) => {
  let delId = req.params.id;
  log(`request: delete id ${delId}`);
  let data = "";
  fs.readFile(dbFile, (err,data) => {
    if (err) {
      log(err); 
    }
    else {
      if (!data) {
        res.send("delete failed");
      }
      else {
        notesArr = JSON.parse(data);
        if (notesArr.length == 0) {
          res.send("delete failed");
        }
        else {
          let matchIndex = notesArr.findIndex((elt) => Number(elt.id) == Number(delId));
          if (matchIndex == -1) {
            res.send("delete failed");
            log(`${delId} not in list`);
          }
          else {
            notesArr.splice(matchIndex,1);
            fs.writeFile(dbFile,JSON.stringify(notesArr),(err) => {if (err) log(err)});
            notesLog();
            res.send("success");
          }
        }
      }
    }
  }); 
});

