---
title: "Notes API"
---

# 📝 Notes API

## **Fetch All Notes**
**Endpoint:** `GET /api/collections/notes/records`
- **Description:** Retrieves all notes in the system.
- **Response:**
  ```json
  {
    "items": [
      { "id": "note1", "content": "Remember to check the map" }
    ]
  }
  ```

## **Fetch Note Details**
**Endpoint:** `GET /api/collections/notes/records/{noteId}`
- **Description:** Retrieves details of a specific note.
- **Response:**
  ```json
  {
    "id": "note1",
    "content": "Remember to check the map"
  }
  ```

