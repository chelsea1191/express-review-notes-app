const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const db = require("./db");
let uuid = require("uuid/v4");

const pathToNotes = path.join(__dirname, "notes.json");
app.use(bodyParser.json());
app.use(express.static("assets"));

app.get("/", (req, res, next) =>
  res.sendFile(path.join(__dirname, "index.html"))
);

app.get("/api/notes", (req, res, next) => {
  db.readJSON(pathToNotes)
    .then(notes => res.send(notes))
    .catch(next);
});

app.post("/api/notes", (req, res, next) => {
  db.readJSON(pathToNotes)
    .then(notes => {
      notes.push({
        id: uuid(),
        text: req.body.text,
        archived: false
      });
      db.writeJSON(pathToNotes, notes);
    })
    .then(notes => res.send(notes))
    .catch(next);
});

app.put("/api/notes/:id", (req, res, next) => {
  const bool = req.body.archived;
  const id = req.params.id;
  db.readJSON(pathToNotes)
    .then(notes => {
      notes.forEach(note => {
        if (note.id == id) {
          note.archived = bool;
        }
      });
      return notes;
    })
    .then(finalNotes => {
      db.writeJSON(pathToNotes, finalNotes);
    })
    .then(notes => res.send(notes))
    .catch(next);
});

app.delete("/api/notes/:id", (req, res, next) => {
  const id = req.params.id;
  db.readJSON(pathToNotes)
    .then(notes => {
      const remainingNotes = notes.filter(note => note.id != id);
      return remainingNotes;
    })
    .then(leftoverNotes => {
      return db.writeJSON(pathToNotes, leftoverNotes);
    })
    .then(() => res.status(204).send())
    .catch(next);
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}`));
