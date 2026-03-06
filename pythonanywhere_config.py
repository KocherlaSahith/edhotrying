# PythonAnywhere configuration for Flask SQLite API

import os
import sys

# Add the current directory to Python path
project_folder = '/home/yourusername/mysite'  # Update this with your actual path
if project_folder not in sys.path:
    sys.path = [project_folder] + sys.path

# Import the Flask app
from app import app as application

# Set the database path for PythonAnywhere
DATABASE_PATH = os.path.join(project_folder, 'app.db')