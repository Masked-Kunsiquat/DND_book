CREATE TABLE [dbo].[landmarks]
(
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  locale_id INTEGER,
  tags TEXT,
  FOREIGN KEY(locale_id) REFERENCES locales(id)
);
