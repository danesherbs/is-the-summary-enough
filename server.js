const express = require("express");
const exphbs = require("express-handlebars");
const sqlite3 = require("sqlite3").verbose();
const cookieParser = require("cookie-parser");

const app = express();
const db = new sqlite3.Database("./database.db");

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/search", (req, res) => {
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

  res.render("search", {
    query: query,
    count: results.length,
    results: results,
  });
});

app.get("/book/:id", (req, res) => {
  const bookId = req.params.id;
  const hasVoted = req.cookies ? req.cookies[bookId] !== undefined : false;
  const sql = `SELECT * FROM books WHERE id = ${req.params.id}`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }

    // TODO: create db entry if book doesn't exist

    if (rows.length !== 1) {
      return res.send("Sorry there was an error retrieving the book id!");
    }

    const [book] = rows;
    const totalVotes = book.votes_yes + book.votes_no;
    const percentageYes =
      totalVotes === 0
        ? 0
        : Math.round(
            (100 * book.votes_yes) / (book.votes_yes + book.votes_no),
            0
          );
    const percentageNo = totalVotes === 0 ? 0 : 100 - percentageYes;

    res.render("book", {
      book: book,
      percentageYes: percentageYes,
      percentageNo: percentageNo,
      hasVoted: hasVoted,
    });
  });
});

app.get("/vote/book/:id/yes", (req, res) => {
  const bookId = parseInt(req.params.id);

  if (bookId !== NaN) {
    const hasVoted = req.cookies ? req.cookies[bookId] !== undefined : false;

    if (!hasVoted) {
      res.cookie(req.params.id, 1, { httpOnly: true });
      db.run(`UPDATE books SET votes_yes = votes_yes + 1 WHERE id = ${bookId}`);
    }
  }

  res.send();
});

app.get("/vote/book/:id/no", (req, res) => {
  const bookId = parseInt(req.params.id);

  if (bookId !== NaN) {
    const hasVoted = req.cookies ? req.cookies[bookId] !== undefined : false;

    if (!hasVoted) {
      res.cookie(req.params.id, 0);
      db.run(`UPDATE books SET votes_no = votes_no + 1 WHERE id = ${bookId}`);
    }
  }

  res.send();
});

app.listen(process.env.PORT || 3000);
