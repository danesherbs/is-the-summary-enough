CREATE TABLE IF NOT EXISTS books (
	id INTEGER PRIMARY KEY,
	title TEXT NOT NULL,
	author TEXT NOT NULL,
  votes_yes INTEGER NOT NULL,
  votes_no INTEGER NOT NULL
);

INSERT INTO books VALUES( 0,	"Stubborn Attachments", "Tyler Cowen", 2, 19);
INSERT INTO books VALUES( 1,	"The Art of Doing Science and Engineering", "Richard Hamming", 0, 0);
INSERT INTO books VALUES( 2,	"Never Split the Difference", "Chris Voss", 10, 1);
