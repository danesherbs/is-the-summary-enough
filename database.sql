CREATE TABLE IF NOT EXISTS is_summary_enough (
	book_id INTEGER PRIMARY KEY,
  votes_yes INTEGER NOT NULL,
  votes_no INTEGER NOT NULL
);