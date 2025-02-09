# 🔐 Authentication API

## **Login**
**Endpoint:** `POST /api/collections/users/auth-with-password`
- **Description:** Authenticates a user with email and password.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Response:**
  ```json
  {
    "token": "jwt-token-here",
    "record": {
      "id": "user123",
      "email": "user@example.com"
    }
  }
  ```

## **Logout**
**Endpoint:** `POST /api/auth/logout`
- **Description:** Logs the user out and clears the authentication token.
- **Response:**
  ```json
  {
    "success": true
  }
  ```

