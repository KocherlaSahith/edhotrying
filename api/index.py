import json
from flask import Flask, request, jsonify
import sqlite3
import os
from datetime import datetime
from vercel_wsgi import handle_wsgi_event

app = Flask(__name__)

# Database configuration
DATABASE_PATH = os.environ.get('DATABASE_PATH', '/tmp/app.db')

def get_db_connection():
    """Create a connection to the SQLite database"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create posts table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    conn.commit()
    conn.close()

@app.route('/')
def index():
    """Health check endpoint"""
    return jsonify({"message": "Flask API is running!", "status": "healthy"})

# User CRUD operations
@app.route('/users', methods=['GET'])
def get_users():
    """Get all users"""
    conn = get_db_connection()
    users = conn.execute('SELECT * FROM users').fetchall()
    conn.close()
    
    return jsonify([dict(user) for user in users])

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get a specific user by ID"""
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()
    
    if user is None:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(dict(user))

@app.route('/users', methods=['POST'])
def create_user():
    """Create a new user"""
    data = request.get_json()
    
    if not data or not 'username' in data or not 'email' in data:
        return jsonify({"error": "Username and email are required"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO users (username, email) VALUES (?, ?)',
            (data['username'], data['email'])
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            "id": user_id,
            "username": data['username'],
            "email": data['email'],
            "message": "User created successfully"
        }), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username or email already exists"}), 409

@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Update a user"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    
    if user is None:
        conn.close()
        return jsonify({"error": "User not found"}), 404
    
    try:
        username = data.get('username', user['username'])
        email = data.get('email', user['email'])
        
        conn.execute(
            'UPDATE users SET username = ?, email = ? WHERE id = ?',
            (username, email, user_id)
        )
        conn.commit()
        conn.close()
        
        return jsonify({
            "id": user_id,
            "username": username,
            "email": email,
            "message": "User updated successfully"
        })
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "Username or email already exists"}), 409

@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete a user"""
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    
    if user is None:
        conn.close()
        return jsonify({"error": "User not found"}), 404
    
    conn.execute('DELETE FROM users WHERE id = ?', (user_id,))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "User deleted successfully"})

# Post CRUD operations
@app.route('/posts', methods=['GET'])
def get_posts():
    """Get all posts"""
    conn = get_db_connection()
    posts = conn.execute('''
        SELECT p.*, u.username 
        FROM posts p 
        JOIN users u ON p.user_id = u.id
    ''').fetchall()
    conn.close()
    
    return jsonify([dict(post) for post in posts])

@app.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    """Get a specific post by ID"""
    conn = get_db_connection()
    post = conn.execute('''
        SELECT p.*, u.username 
        FROM posts p 
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
    ''', (post_id,)).fetchone()
    conn.close()
    
    if post is None:
        return jsonify({"error": "Post not found"}), 404
    
    return jsonify(dict(post))

@app.route('/posts', methods=['POST'])
def create_post():
    """Create a new post"""
    data = request.get_json()
    
    if not data or not 'title' in data or not 'content' in data or not 'user_id' in data:
        return jsonify({"error": "Title, content, and user_id are required"}), 400
    
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (data['user_id'],)).fetchone()
    
    if user is None:
        conn.close()
        return jsonify({"error": "User not found"}), 404
    
    try:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)',
            (data['title'], data['content'], data['user_id'])
        )
        conn.commit()
        post_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            "id": post_id,
            "title": data['title'],
            "content": data['content'],
            "user_id": data['user_id'],
            "message": "Post created successfully"
        }), 201
    except sqlite3.Error as e:
        conn.close()
        return jsonify({"error": str(e)}), 500

@app.route('/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    """Update a post"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    conn = get_db_connection()
    post = conn.execute('SELECT * FROM posts WHERE id = ?', (post_id,)).fetchone()
    
    if post is None:
        conn.close()
        return jsonify({"error": "Post not found"}), 404
    
    try:
        title = data.get('title', post['title'])
        content = data.get('content', post['content'])
        
        conn.execute(
            'UPDATE posts SET title = ?, content = ? WHERE id = ?',
            (title, content, post_id)
        )
        conn.commit()
        conn.close()
        
        return jsonify({
            "id": post_id,
            "title": title,
            "content": content,
            "user_id": post['user_id'],
            "message": "Post updated successfully"
        })
    except sqlite3.Error as e:
        conn.close()
        return jsonify({"error": str(e)}), 500

@app.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    """Delete a post"""
    conn = get_db_connection()
    post = conn.execute('SELECT * FROM posts WHERE id = ?', (post_id,)).fetchone()
    
    if post is None:
        conn.close()
        return jsonify({"error": "Post not found"}), 404
    
    conn.execute('DELETE FROM posts WHERE id = ?', (post_id,))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Post deleted successfully"})

# Initialize database on first request
@app.before_first_request
def initialize():
    init_db()

# Vercel serverless function handler
def handler(request):
    # Initialize database if it doesn't exist
    if not os.path.exists(DATABASE_PATH):
        init_db()
    
    return handle_wsgi_event(request, app)

# Export for Vercel
app_handler = handler