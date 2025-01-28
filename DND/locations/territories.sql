CREATE TABLE [dbo].[territories]
(
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  province_id INTEGER,
  tags TEXT,
  FOREIGN KEY(province_id) REFERENCES provinces(id)
);
