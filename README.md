# Flask SQLite API

A simple Flask backend application with SQLite3 database that supports CRUD operations for users and posts. This application is designed to be deployed on Railway.

## Features

- RESTful API with full CRUD operations
- SQLite3 database with two tables: users and posts
- Railway deployment ready
- JSON responses for all endpoints

## API Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| GET | `/users/<id>` | Get a specific user by ID |
| POST | `/users` | Create a new user |
| PUT | `/users/<id>` | Update a user |
| DELETE | `/users/<id>` | Delete a user |

#### Create User Example
```json
POST /users
{
  "username": "john_doe",
  "email": "john@example.com"
}
```

### Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts` | Get all posts with user information |
| GET | `/posts/<id>` | Get a specific post by ID |
| POST | `/posts` | Create a new post |
| PUT | `/posts/<id>` | Update a post |
| DELETE | `/posts/<id>` | Delete a post |

#### Create Post Example
```json
POST /posts
{
  "title": "My First Post",
  "content": "This is the content of my first post",
  "user_id": 1
}
```

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check endpoint |

## Local Development

1. Clone this repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the application:
   ```bash
   python app.py
   ```
4. The API will be available at `http://localhost:5000`

## Railway Deployment

1. Create a new project on Railway
2. Connect this repository to your Railway project
3. Railway will automatically detect the Python application and deploy it
4. The application will be available at the provided Railway URL

## Database

The application uses SQLite3 with two tables:

### Users Table
- id (INTEGER, PRIMARY KEY)
- username (TEXT, UNIQUE, NOT NULL)
- email (TEXT, UNIQUE, NOT NULL)
- created_at (TIMESTAMP)

### Posts Table
- id (INTEGER, PRIMARY KEY)
- title (TEXT, NOT NULL)
- content (TEXT, NOT NULL)
- user_id (INTEGER, FOREIGN KEY)
- created_at (TIMESTAMP)

The database is automatically initialized when the application starts.