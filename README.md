# Simple MongoDB Atlas Server

A simple Node.js server that connects to MongoDB Atlas with basic read and write endpoints.

## Local Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure your MongoDB Atlas connection:
   - Open the `.env` file
   - Replace `<username>`, `<password>`, and `cluster0.xxxxx` with your actual MongoDB Atlas credentials
   - Replace `<database-name>` with your preferred database name

3. Start the server:
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

## Vercel Deployment

This project is configured to deploy on Vercel as a serverless function.

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project" and import your GitHub repository
4. Add the `MONGODB_URI` environment variable in the Vercel dashboard:
   - Go to Settings > Environment Variables
   - Add a new variable with name `MONGODB_URI` and your MongoDB Atlas connection string as the value
5. Click "Deploy"

### Environment Variables for Vercel

- `MONGODB_URI`: Your MongoDB Atlas connection string
  - Format: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<database-name>?retryWrites=true&w=majority`

## API Endpoints

### Health Check
- **GET** `/api/health`
  - Returns server status

### Read Data
- **GET** `/api/data`
  - Retrieves all documents from the collection
  - Returns an array of documents

### Write Data
- **POST** `/api/data`
  - Inserts a new document into the collection
  - Request body should contain the data to insert
  - Returns the inserted document with its ID

## Example Usage

### Local Development

#### Insert Data
```bash
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "age": 30, "city": "New York"}'
```

#### Get All Data
```bash
curl http://localhost:3000/api/data
```

### After Vercel Deployment

Replace `https://your-app-name.vercel.app` with your actual Vercel deployment URL:

#### Insert Data
```bash
curl -X POST https://your-app-name.vercel.app/api/data \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "age": 30, "city": "New York"}'
```

#### Get All Data
```bash
curl https://your-app-name.vercel.app/api/data
```

## Notes

- The server connects to a database named 'myDatabase' and a collection named 'myCollection' by default
- You can modify these names in the server.js file
- All inserted documents automatically get a 'createdAt' timestamp
- The server includes basic error handling for database operations