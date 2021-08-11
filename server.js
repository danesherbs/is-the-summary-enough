const express = require("express");
const exphbs = require("express-handlebars");
const sqlite3 = require("sqlite3").verbose();
const cookieParser = require("cookie-parser");
const axios = require("axios");

const app = express();
const db = new sqlite3.Database("./database.db");

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("home");
});

const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

app.get("/search", (req, res) => {
  const query = req.query.query || "";

  if (query.length === 0) {
    return res.render("home");
  }

  const params = new URLSearchParams({
    "intitle:": query,
    maxResults: 30,
    key: apiKey,
  });

  const url = new URL(
    `https://www.googleapis.com/books/v1/volumes?q=${params.toString()}`
  );

  axios
    .get(url.toString())
    .then((books) =>
      (books.data.items || []).map((book) => {
        return {
          id: book.id,
          title: book.volumeInfo.title,
          author: book.volumeInfo.authors
            ? book.volumeInfo.authors.length > 0
              ? book.volumeInfo.authors[0]
              : ""
            : "Miscellaneous",
          pageCount: book.volumeInfo.pageCount,
          href: `book/${book.id}`,
        };
      })
    )
    .then((books) => books.filter((book) => book.pageCount >= 50))
    .then((books) =>
      books.reduce((acc, book) => {
        const titles = acc.map((b) => b.title);

        if (titles.includes(book.title)) {
          return acc;
        }

        return [...acc, book];
      }, [])
    )
    .then((results) => {
      res.render("search", {
        query: query,
        count: results.length,
        results: results,
      });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .send(
          `There was an internal error when retrieving results for "${query}"`
        );
    });
});

app.get("/book/:id", (req, res) => {
  const bookId = req.params.id;
  const hasVoted = req.cookies ? req.cookies[bookId] !== undefined : false;
  const sql = `SELECT * FROM books WHERE id = "${req.params.id}"`;

  const renderBook = (book) => {
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
      totalVotes: totalVotes - 2,
      hasVoted: hasVoted,
    });
  };

  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }

    if (rows.length === 0) {
      const url = new URL(
        `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${apiKey}`
      );

      axios.get(url.toString()).then((book) => {
        const title = book.data.volumeInfo.title;
        const author = book.data.volumeInfo.authors[0];
        const votesYes = 1;
        const votesNo = 1;

        db.run(
          `INSERT INTO books VALUES(
              "${bookId}",
              "${title}",
              "${author}",
              ${votesYes},
              ${votesNo}
          );`
        );

        renderBook({
          id: bookId,
          title: title,
          author: author,
          votes_yes: votesYes,
          votes_no: votesNo,
        });
      });
    } else if (rows.length === 1) {
      renderBook(rows[0]);
    } else {
      console.log("Got multiple results back for book lookup by id:", rows);

      return res
        .status(500)
        .send("Sorry there was an error retrieving the book id!");
    }
  });
});

app.get("/vote/book/:id/yes", (req, res) => {
  const bookId = req.params.id;

  if (bookId) {
    const hasVoted = req.cookies ? req.cookies[bookId] !== undefined : false;

    if (!hasVoted) {
      res.cookie(req.params.id, 1, { httpOnly: true });
      db.run(
        `UPDATE books SET votes_yes = votes_yes + 1 WHERE id = "${bookId}"`
      );
    }
  }

  res.status(200).send();
});

app.get("/vote/book/:id/no", (req, res) => {
  const bookId = req.params.id;

  if (bookId) {
    const hasVoted = req.cookies ? req.cookies[bookId] !== undefined : false;

    if (!hasVoted) {
      res.cookie(req.params.id, 0);
      db.run(`UPDATE books SET votes_no = votes_no + 1 WHERE id = "${bookId}"`);
    }
  }

  res.status(200).send();
});

app.listen(process.env.PORT || 3000);
