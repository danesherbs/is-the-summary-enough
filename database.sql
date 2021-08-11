CREATE TABLE IF NOT EXISTS books (
	id TEXT PRIMARY KEY,
	title TEXT NOT NULL,
	author TEXT NOT NULL,
  votes_yes INTEGER NOT NULL,
  votes_no INTEGER NOT NULL
);

INSERT INTO books VALUES( "k8csuh",	"Stubborn Attachments", "Tyler Cowen", 2, 19);
INSERT INTO books VALUES( "s8fwhq",	"The Art of Doing Science and Engineering", "Richard Hamming", 0, 0);
INSERT INTO books VALUES( "cv9wdb",	"Never Split the Difference", "Chris Voss", 10, 1);
