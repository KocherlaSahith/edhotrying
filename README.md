# Flask SQLite API

A simple Flask backend application with SQLite3 database that supports CRUD operations for users and posts. This application supports multiple deployment options including free hosting platforms.

## Hosting Platform Comparison

| Platform | Free Tier | SQLite Support | Ease of Deployment | Persistence |
|----------|-----------|----------------|-------------------|-------------|
| **Render** | ✅ Yes | ✅ Full read/write | Easy | ✅ Persistent |
| **Vercel** | ✅ Yes | ⚠️ Limited (serverless) | Easy | ❌ Ephemeral |
| **PythonAnywhere** | ✅ Yes | ✅ Full read/write | Moderate | ✅ Persistent |
| **Railway** | ❌ Expired | ✅ Full read/write | Easy | ✅ Persistent |

**Recommended for SQLite with full read/write:** Render or PythonAnywhere (both have free tiers)

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

## Deployment Options

### Railway (Paid)

1. Create a new project on Railway
2. Connect this repository to your Railway project
3. Railway will automatically detect the Python application and deploy it
4. The application will be available at the provided Railway URL

### Render (Free)

1. Create a new account on [Render](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` configuration
5. Deploy with the free tier
6. Your API will be available at `https://your-app-name.onrender.com`

### Vercel (Free)

1. Create a new account on [Vercel](https://vercel.com)
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel` in your project directory
4. Vercel will automatically detect the `vercel.json` configuration
5. Your API will be deployed as serverless functions
6. Your API will be available at `https://your-project-name.vercel.app`

### PythonAnywhere (Free Tier)

1. Create a new account on [PythonAnywhere](https://www.pythonanywhere.com)
2. Go to the "Web" tab and create a new web app
3. Choose "Flask" as the framework
4. In the "Source code" section, upload your files or clone from GitHub
5. Update the `pythonanywhere_config.py` file with your actual project path
6. In the "WSGI configuration file" section, point to `pythonanywhere_config.py`
7. Install requirements: `pip install -r requirements.txt`
8. Initialize the database by running: `python app.py` once
9. Reload your web app
10. Your API will be available at `https://yourusername.pythonanywhere.com`

### Local Development

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