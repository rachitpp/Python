# Quick Deployment Guide for Dental X-ray Analysis Application

This guide provides the simplest possible deployment path for the Dental X-ray Analysis application.

## 1. Prerequisites

- GitHub account
- Roboflow API key
- OpenAI API key

## 2. Quickest Deployment Path

### Backend: Deploy on Render

1. Fork/upload the project to GitHub
2. Sign up for [Render](https://render.com/) (free tier available)
3. Connect your GitHub repository
4. Create a new Web Service with these settings:
   - **Name**: dental-xray-api
   - **Environment**: Python 3
   - **Root Directory**: backend
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app`
5. Add environment variables:
   - `ROBOFLOW_API_KEY` = your Roboflow API key
   - `OPENAI_API_KEY` = your OpenAI API key
6. Click "Create Web Service"
7. Note the URL of your deployed API (e.g., https://dental-xray-api.onrender.com)

### Frontend: Deploy on Netlify

1. Sign up for [Netlify](https://www.netlify.com/) (free tier available)
2. In the frontend directory, create a `.env.production` file:
   ```
   VITE_API_URL=https://your-backend-url-from-step-7
   ```
3. Create a `netlify.toml` file in the frontend directory:

   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

4. Connect your GitHub repository to Netlify
5. Set the build settings:
   - **Base directory**: frontend
   - **Build command**: npm run build
   - **Publish directory**: dist
6. Click "Deploy site"

## 3. Testing Your Deployment

1. Visit your Netlify URL (e.g., https://dental-xray-app.netlify.app)
2. Upload a DICOM file
3. Verify that pathology detection works
4. Verify that report generation works

## 4. Troubleshooting

- **CORS errors**: Ensure your backend has proper CORS configuration. The current setup allows all origins, which is fine for initial testing.
- **File upload issues**: If file uploads fail, check your Render logs for any errors.
- **API key errors**: Make sure your environment variables are set correctly.

## 5. Local Testing Before Deployment

If you want to test locally before deploying:

1. Start the backend server:

   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```

2. Start the frontend development server:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Visit http://localhost:5173 in your browser

## 6. Important Security Notes

For a production deployment, consider:

1. Implementing user authentication
2. Restricting CORS to your frontend domain only
3. Adding rate limiting to protect your API
4. Setting up proper logging for diagnostics
5. Implementing a cloud storage solution for images instead of local storage
