Identity Reconciliation API
Overview
This API consolidates user contact information by merging records based on email and phone number. It ensures that duplicate or fragmented contact records are unified into a single, comprehensive profile.

Endpoint
POST /identify
Request Body:
```json
{
  "email": "user@example.com",
  "phoneNumber": 1234567890
}

```
Response:

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

Features
Primary Contact Identification: Determines the primary contact based on existing records.

Secondary Contact Linking: Associates secondary contacts to the primary contact.

Data Normalization: Ensures consistent formatting for email and phone number fields.

Error Handling: Provides clear error messages for invalid or incomplete data.