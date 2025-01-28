CREATE TABLE [dbo].[locales]
(
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  territory_id INTEGER,
  tags TEXT,
  FOREIGN KEY(territory_id) REFERENCES territories(id)
);
