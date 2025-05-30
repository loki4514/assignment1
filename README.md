# Identity Reconciliation API

## Overview
This API consolidates user contact information by merging records based on email and phone number. It ensures that duplicate or fragmented contact records are unified into a single, comprehensive profile.

## Endpoint
### POST /identify

**Request Body:**
```json
{
  "email": "user@example.com",
  "phoneNumber": 1234567890
}
```

**Response:**
```json
{
  "status": 200,
  "success": true,
  "message": "Contact found or created",
  "data": {
    "contact": {
      "primaryContactId": 1,
      "emails": ["user@example.com"],
      "phoneNumbers": ["1234567890"],
      "secondaryContactIds": [2, 3]
    }
  }
}
```

---

## Features
- **Primary Contact Identification:** Determines the primary contact based on existing records.
- **Secondary Contact Linking:** Associates secondary contacts to the primary contact.
- **Data Normalization:** Ensures consistent formatting for email and phone number fields.
- **Error Handling:** Provides clear error messages for invalid or incomplete data.

---

## Prerequisites

- Node.js (v16+ recommended)
- PostgreSQL database

---

## Setup and Installation

1. Clone the repository:
```bash
git clone https://github.com/loki4514/assignment1.git
cd assignment1
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:

Create a `.env` file in the project root with the following variables:

```env
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name
```

Replace `username`, `password`, and `your_database_name` with your Postgres credentials and database name.

4. Initialize and migrate the database schema (using Prisma):
```bash
npx prisma migrate dev --name init
```

5. Start the application:
```bash
npm run start
```

The server will run on `http://localhost:3000` or the port specified in `.env`.

---

## Database

This project uses **PostgreSQL** to store contact information.

- The database schema is managed with **Prisma ORM**.
- The main `contact` table holds:
  - `id`
  - `email`
  - `phoneNumber`
  - `linkPrecedence` (PRIMARY or SECONDARY)
  - `linkedId` (links SECONDARY contacts to their PRIMARY)
  - `createdAt`, `updatedAt`, and `deletedAt` timestamps

---
## Example Scenarios

### Scenario 1: New Contact
```json
POST /identify
{
  "email": "lorraine@hillvalley.edu",
  "phoneNumber": "123456"
}
```

Creates:
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": []
  }
}
```

### Scenario 2: Secondary Contact
```json
POST /identify
{
  "email": "mcfly@hillvalley.edu",
  "phoneNumber": "123456"
}
```

Creates a secondary row:

```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [23]
  }
}
```

---

## More Sample Requests That Yield the Same Response:

```json
{
  "email": null,
  "phoneNumber": "123456"
}
```

```json
{
  "email": "lorraine@hillvalley.edu",
  "phoneNumber": null
}
```

```json
{
  "email": "mcfly@hillvalley.edu",
  "phoneNumber": null
}
```

---

## Can Primary Turn Into Secondary?

Yes.

### Example:

Initial Records:

```json
[
  {
    "id": 11,
    "email": "george@hillvalley.edu",
    "phoneNumber": "919191",
    "linkedId": null,
    "linkPrecedence": "primary"
  },
  {
    "id": 27,
    "email": "biffsucks@hillvalley.edu",
    "phoneNumber": "717171",
    "linkedId": null,
    "linkPrecedence": "primary"
  }
]
```

### Incoming Request:
```json
{
  "email": "george@hillvalley.edu",
  "phoneNumber": "717171"
}
```

### Updated State:
```json
[
  {
    "id": 11,
    "email": "george@hillvalley.edu",
    "phoneNumber": "919191",
    "linkedId": null,
    "linkPrecedence": "primary"
  },
  {
    "id": 27,
    "email": "biffsucks@hillvalley.edu",
    "phoneNumber": "717171",
    "linkedId": 11,
    "linkPrecedence": "secondary"
  }
]
```

### Response:
```json
{
  "contact": {
    "primaryContatctId": 11,
    "emails": ["george@hillvalley.edu", "biffsucks@hillvalley.edu"],
    "phoneNumbers": ["919191", "717171"],
    "secondaryContactIds": [27]
  }
}
```

## Testing the API

Use tools like Postman or curl to test the `/identify` POST endpoint:

```bash
curl -X POST http://localhost:3000/identify \
-H "Content-Type: application/json" \
-d '{"email":"user@example.com","phoneNumber":1234567890}'
```

---

## Error Handling

- Returns HTTP 400 if both email and phoneNumber are missing.
- Returns HTTP 500 for internal server errors with appropriate messages.

---

## License

MIT License
