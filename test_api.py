import requests
import json

# Base URL - change this to your deployed Railway URL or localhost:5000 for local testing
BASE_URL = "http://localhost:5000"

def test_health_check():
    """Test the health check endpoint"""
    response = requests.get(f"{BASE_URL}/")
    print(f"Health Check: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_user_operations():
    """Test user CRUD operations"""
    # Create a user
    user_data = {
        "username": "testuser",
        "email": "test@example.com"
    }
    response = requests.post(f"{BASE_URL}/users", json=user_data)
    print(f"Create User: {response.status_code}")
    user = response.json()
    print(f"Response: {user}")
    user_id = user.get('id')
    print()
    
    # Get all users
    response = requests.get(f"{BASE_URL}/users")
    print(f"Get All Users: {response.status_code}")
    print(f"Response: {response.json()}")
    print()
    
    # Get specific user
    response = requests.get(f"{BASE_URL}/users/{user_id}")
    print(f"Get User: {response.status_code}")
    print(f"Response: {response.json()}")
    print()
    
    # Update user
    update_data = {
        "username": "updateduser",
        "email": "updated@example.com"
    }
    response = requests.put(f"{BASE_URL}/users/{user_id}", json=update_data)
    print(f"Update User: {response.status_code}")
    print(f"Response: {response.json()}")
    print()
    
    return user_id

def test_post_operations(user_id):
    """Test post CRUD operations"""
    # Create a post
    post_data = {
        "title": "Test Post",
        "content": "This is a test post content",
        "user_id": user_id
    }
    response = requests.post(f"{BASE_URL}/posts", json=post_data)
    print(f"Create Post: {response.status_code}")
    post = response.json()
    print(f"Response: {post}")
    post_id = post.get('id')
    print()
    
    # Get all posts
    response = requests.get(f"{BASE_URL}/posts")
    print(f"Get All Posts: {response.status_code}")
    print(f"Response: {response.json()}")
    print()
    
    # Get specific post
    response = requests.get(f"{BASE_URL}/posts/{post_id}")
    print(f"Get Post: {response.status_code}")
    print(f"Response: {response.json()}")
    print()
    
    # Update post
    update_data = {
        "title": "Updated Test Post",
        "content": "This is updated test post content"
    }
    response = requests.put(f"{BASE_URL}/posts/{post_id}", json=update_data)
    print(f"Update Post: {response.status_code}")
    print(f"Response: {response.json()}")
    print()
    
    return post_id

def cleanup(user_id, post_id):
    """Clean up test data"""
    # Delete post
    response = requests.delete(f"{BASE_URL}/posts/{post_id}")
    print(f"Delete Post: {response.status_code}")
    print(f"Response: {response.json()}")
    print()
    
    # Delete user
    response = requests.delete(f"{BASE_URL}/users/{user_id}")
    print(f"Delete User: {response.status_code}")
    print(f"Response: {response.json()}")

if __name__ == "__main__":
    print("Testing Flask SQLite API")
    print("=" * 40)
    
    try:
        # Test health check
        test_health_check()
        
        # Test user operations
        user_id = test_user_operations()
        
        # Test post operations
        post_id = test_post_operations(user_id)
        
        # Clean up
        cleanup(user_id, post_id)
        
        print("All tests completed successfully!")
    except requests.exceptions.ConnectionError:
        print("Connection error. Make sure the Flask app is running.")
    except Exception as e:
        print(f"An error occurred: {str(e)}")