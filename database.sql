CREATE TABLE IF NOT EXISTS is_summary_enough (
	book_id INTEGER PRIMARY KEY,
	title TEXT NOT NULL,
	author TEXT NOT NULL,
  votes_yes INTEGER NOT NULL,
  votes_no INTEGER NOT NULL
);

INSERT INTO is_summary_enough VALUES( 0,	"Stubborn Attachments", "Tyler Cowen", 2, 19);
INSERT INTO is_summary_enough VALUES( 1,	"The Art of Doing Science and Engineering", "Richard Hamming", 1, 10);
INSERT INTO is_summary_enough VALUES( 2,	"Never Split the Difference", "Chris Voss", 10, 1);
