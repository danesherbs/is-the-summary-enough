const express = require("express");
const exphbs = require("express-handlebars");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const db = new sqlite3.Database("./database.db");

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/book", (req, res) => {
  const query = req.query.query || "";
  const target = query.replace(/[^a-zA-Z0-9 -]/g, "");

  // TODO: hit Google books API

  const books = [
    { id: 0, title: "Stubborn Attachments" },
    { id: 1, title: "The Art of Doing Science and Engineering" },
    { id: 2, title: "Doing Good Better" },
  ];

  const sql = `SELECT * FROM is_summary_enough WHERE book_id = ${bookId}`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }

    res.render("home", {
      results: books,
    });
  });
});

app.listen(process.env.PORT || 3000);
