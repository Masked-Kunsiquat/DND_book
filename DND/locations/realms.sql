CREATE TABLE [dbo].[realms] (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  continent_id INTEGER,
  tags TEXT,
  FOREIGN KEY(continent_id) REFERENCES continents(id)
);
