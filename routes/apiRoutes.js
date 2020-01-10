// NoteTaker server - API route handling
// supports CRUD for notes file db.json.

const fs    = require('fs');
const path  = require('path');
const debug = require('../server.js');

// wrapper function to allow invocation from server.js
module.exports = (app) => {

    // path to db.json; resolve once as 'dbFile' for later readability
    const dbFile = path.join(__dirname,'../db/db.json');

    // make debug logging less conspicuous in route handling.
    // requires global definition of 'notesArr' file buffer.
    let notesArr = [];
    const notesLog = () => {if (debug) {console.log( notesArr             );}}
    const log   = (str) => {if (debug) {console.log(`${Date.now()} ${str}`);}}

    //* GET `/api/notes` - reads the `db.json` file and returns all saved notes as JSON.
    app.get('/api/notes', (req, res) => {log('get: db.json'); res.sendFile(dbFile);});
    
    //* POST `/api/notes` - receives a new note in the request body, adds it
    // to the `db.json` file, and then returns the new note to the client.
    app.post('/api/notes', (req, res) => {
        // read the notes file
        let data = '';
        fs.readFile(dbFile, (err,data) => {
            if (err) {
                log(err); 
                res.send('post failed');
            }
            else { 
                // convert the note file string and store in the notes array.
                // do this before assigning the new Note, because the array
                // length is used in assigning the new ID.
                if (data) {notesArr = JSON.parse(data);}
                // bring in the new note
                let newNote = {
                    id: (notesArr.length == 0 ? 0 : notesArr[notesArr.length-1].id + 1),
                    title: req.body.title,
                    text: req.body.text
                };
                // append the new note
                notesArr.push(newNote);
                // and write the new array, over-writing db.json
                fs.writeFile(dbFile, JSON.stringify(notesArr), (err) => {if (err) log(err)});
                // acknowledge success to the client
                res.send(newNote);
                notesLog();
            }
        });
    });

    //* DELETE `/api/notes/:id` - receives a query parameter containing 
    //the id of a note to delete. 
    app.delete('/api/notes/:id', (req, res) => {
        // get the id of the note to be removed
        let delId = req.params.id;
        log(`request: delete id ${delId}`);
        // read the notes file
        let data = '';
        fs.readFile(dbFile, (err, data) => {
            if (err || !data) {
                if (err) log(err); 
                res.send('delete failed');
            } 
            else {
                // convert the note file string and store in the notes array
                notesArr = JSON.parse(data);
                // find the index of the element to be deleted
                let matchIndex = notesArr.findIndex((elt) => Number(elt.id) == Number(delId));
                // if not found...
                if (matchIndex == -1) {
                    res.send('delete failed');
                    log(`${delId} not in list`);
                }
                else {
                    // got it. perform note-ectomy.
                    notesArr.splice(matchIndex,1);
                    // and write the altered array, over-writing db.json
                    fs.writeFile(dbFile,JSON.stringify(notesArr),(err) => {if (err) log(err)});
                    notesLog();
                    // tell the client the operation was a success
                    res.send('success');
                }
            }
        }); //fs.readfile callback
    }); // app.delete

}; // wrapper function

