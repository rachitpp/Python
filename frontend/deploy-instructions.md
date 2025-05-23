# Frontend Deployment Instructions

## 1. Build for Production

First, create a production build of your React application:

```bash
# Install dependencies
npm install

# Create production build
npm run build
```

This will create a `dist` folder containing static files that can be served by any web server.

## 2. Environment Configuration

Before building, create a `.env.production` file with your backend API URL:

```
VITE_API_URL=https://your-backend-domain.com
```

Replace `https://your-backend-domain.com` with the actual URL of your deployed backend API.

## 3. Deployment Options

### Option A: Netlify

1. Create a `netlify.toml` file in your project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Deploy with Netlify CLI or connect your GitHub repository through the Netlify dashboard.

### Option B: Vercel

1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel` and follow the prompts
3. For production: `vercel --prod`

### Option C: GitHub Pages

1. Add to package.json: `"homepage": "https://yourusername.github.io/your-repo-name"`
2. Install gh-pages: `npm install --save-dev gh-pages`
3. Add to scripts in package.json: `"deploy": "gh-pages -d dist"`
4. Run: `npm run build && npm run deploy`

### Option D: Traditional Web Hosting

1. Upload the contents of the `dist` folder to your web hosting provider (via FTP, SSH, etc.)
2. Configure your web server (Apache, Nginx) to serve the static files and handle the SPA routing

#### Apache .htaccess example:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### Nginx configuration example:

```nginx
server {
  listen 80;
  server_name your-domain.com;
  root /path/to/dist;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## 4. Testing Your Deployment

After deploying, verify that:

1. The application loads correctly
2. API requests to your backend succeed
3. All features (file uploads, pathology detection, reports) work as expected

If you encounter CORS issues, ensure your backend has proper CORS configuration for your frontend domain.
