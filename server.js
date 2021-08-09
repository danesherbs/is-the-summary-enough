const express = require("express");
const exphbs = require("express-handlebars");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const db = new sqlite3.Database("./database.db");

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.get("/", (req, res) => {
  const query = req.query.query || "";

  if (query.length === 0) {
    return res.render("home");
  }

  // TODO: hit Google books API

  const reponse = [
    { id: 0, title: "Stubborn Attachments" },
    { id: 1, title: "The Art of Doing Science and Engineering" },
    { id: 2, title: "Never Split the Difference" },
  ];

  const results = reponse.map((book) => {
    return { ...book, href: `book/${book.id}` };
  });

  res.render("results", {
    query: query,
    count: results.length,
    results: results,
  });
});

app.get("/book/:id", (req, res) => {
  const sql = `SELECT * FROM is_summary_enough WHERE book_id = ${req.params.id}`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }

    if (rows.length !== 1) {
      return res.send("Sorry there was an error retrieving the book id!");
    }

    const [book] = rows;

    res.render("book", {
      book: book,
    });
  });
});

app.listen(process.env.PORT || 3000);
