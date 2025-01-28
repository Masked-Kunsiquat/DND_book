CREATE TABLE [dbo].[provinces]
(
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  realm_id INTEGER,
  tags TEXT,
  FOREIGN KEY(realm_id) REFERENCES realms(id)
);