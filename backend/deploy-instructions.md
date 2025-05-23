# Backend Deployment Instructions

This guide provides step-by-step instructions for deploying the FastAPI backend for the Dental X-ray Analysis application.

## Prerequisites

- Python 3.11 or higher
- pip (Python package manager)
- Git
- API keys for:
  - Roboflow (for pathology detection)
  - OpenAI (for report generation)

## Option 1: Deployment on Render

[Render](https://render.com/) offers a simple way to deploy Python applications with a generous free tier.

1. Sign up for a Render account
2. Create a new Web Service, and connect to your GitHub repository
3. Configure your service:
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app`
4. Set environment variables:
   - `ROBOFLOW_API_KEY`
   - `OPENAI_API_KEY`
5. Deploy your service

## Option 2: PythonAnywhere

1. Create a PythonAnywhere account
2. Upload your code via Git or manually
3. Set up a virtual environment:
   ```bash
   mkvirtualenv dental-env --python=python3.11
   pip install -r requirements.txt
   ```
4. Create a WSGI configuration file:

   ```python
   import sys
   path = '/home/yourusername/dental-xray-app'
   if path not in sys.path:
       sys.path.append(path)

   from main import app as application
   ```

5. Set environment variables in your `.bashrc` or through the dashboard
6. Configure a web app pointing to your WSGI file

## Option 3: Deploy on a VPS (Digital Ocean, AWS EC2, etc.)

1. Provision a server (Ubuntu 20.04 LTS recommended)
2. Install dependencies:
   ```bash
   sudo apt update
   sudo apt install python3-pip python3-dev nginx
   ```
3. Clone your repository:
   ```bash
   git clone https://github.com/yourusername/dental-xray-app.git
   cd dental-xray-app/backend
   ```
4. Set up a virtual environment:
   ```bash
   pip install virtualenv
   python3 -m virtualenv venv
   source venv/bin/activate
   pip install -r requirements.txt
   pip install gunicorn
   ```
5. Create a `.env` file with your API keys:
   ```
   ROBOFLOW_API_KEY=your_key_here
   OPENAI_API_KEY=your_key_here
   ```
6. Create a systemd service file:

   ```bash
   sudo nano /etc/systemd/system/dental-api.service
   ```

   ```
   [Unit]
   Description=Dental X-ray API
   After=network.target

   [Service]
   User=yourusername
   WorkingDirectory=/home/yourusername/dental-xray-app/backend
   ExecStart=/home/yourusername/dental-xray-app/backend/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

7. Start and enable the service:
   ```bash
   sudo systemctl start dental-api
   sudo systemctl enable dental-api
   ```
8. Configure Nginx as a reverse proxy:

   ```bash
   sudo nano /etc/nginx/sites-available/dental-api
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

9. Enable the site and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/dental-api /etc/nginx/sites-enabled/
   sudo systemctl restart nginx
   ```

## Option 4: Heroku Deployment

1. Install Heroku CLI
2. Create a `Procfile` in the backend directory:
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
3. Create a new Heroku app:
   ```bash
   heroku create dental-xray-api
   ```
4. Set your environment variables:
   ```bash
   heroku config:set ROBOFLOW_API_KEY=your_key_here OPENAI_API_KEY=your_key_here
   ```
5. Deploy your application:
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku master
   ```

## Important Notes

1. **Storage**: By default, the application stores uploaded and processed files locally. For production, consider using cloud storage like AWS S3 or Azure Blob Storage.

2. **Security**: Add proper authentication and rate limiting for the API in production.

3. **CORS Configuration**: The backend is currently configured to allow requests from any origin. In production, restrict this to your frontend domain.

4. **API Keys**: Never commit your API keys to the repository. Always use environment variables or secure secret management.

5. **Scaling**: For high-traffic applications, consider implementing a proper queue system for processing images.

## Troubleshooting

- **File permissions**: Ensure the application has write permissions for the `uploads` and `processed` directories.
- **API limits**: Check that you haven't exceeded your Roboflow or OpenAI API limits.
- **Memory issues**: Image processing can be memory-intensive. Ensure your server has adequate resources.
