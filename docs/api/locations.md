---
title: "Locations API"
---

# 🌍 Locations API

## **Fetch All Locations**
**Endpoint:** `GET /api/collections/locations/records`
- **Description:** Retrieves a list of all locations.
- **Response:**
  ```json
  {
    "items": [
      { "id": "loc1", "name": "Rivendell" },
      { "id": "loc2", "name": "Mordor" }
    ]
  }
  ```

## **Fetch Location Details**
**Endpoint:** `GET /api/collections/locations/records/{locationId}`
- **Description:** Retrieves details of a specific location.
- **Response:**
  ```json
  {
    "id": "loc1",
    "name": "Rivendell",
    "description": "Elven sanctuary"
  }
  ```

