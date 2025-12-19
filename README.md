# NoteHub
NoteHub Backend is a REST API for managing personal notes.
Users can create, update, and delete their notes securely.

## Tech Stack
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt
- Celebrate (Joi)

## Features
- User registration and login
- JWT authentication
- CRUD operations for notes
- Access control (users can access only their own notes)
- Input validation and error handling
- Password reset via email

## Environment Variables
Create a `.env` file in the root directory and add:

PORT=3000
NODE_ENV=development

MONGO_URL=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=your_email@example.com

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_DOMAIN=http://localhost:3001

## Installation
Install NoteHub with npm

```bash
  npm install 
  npm start
```
## API Reference

### Auth
- POST /auth/register
- POST /auth/login
- POST /auth/reset-password

### Notes (Protected)
- GET /notes
- POST /notes
- PUT /notes/:id
- DELETE /notes/:id

## What I Learned
- Building REST APIs with Node.js and Express
- JWT authentication and route protection
- MongoDB schema design with Mongoose
- Password reset via email
- Secure handling of environment variables
