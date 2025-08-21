# CMS Node.js Template Server

A modern, scalable Node.js backend server designed for a Content Management System (CMS) with integrated cPanel file management capabilities. This server provides a robust API for managing website content, templates, and static files with real-time synchronization to cPanel hosting.

## 🚀 Features

- **Real-time Content Management**: Edit and save website content with immediate updates
- **cPanel Integration**: Direct file operations on cPanel hosting via secure API
- **Template System**: Dynamic template rendering with customizable placeholders
- **RESTful API**: Clean, intuitive endpoints for all operations
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **Comprehensive Logging**: Detailed request/response logging for debugging
- **Error Handling**: Robust error handling with informative messages
- **Environment Configuration**: Secure environment variable management

## 📁 Project Structure

```
CMS-nodeJs-template-server/
├── backend/
│   ├── server.js              # Main server application
│   ├── package.json           # Backend dependencies
│   ├── .gitignore            # Git ignore rules
│   └── templates/
│       └── about.html        # Sample template file
├── package-lock.json         # Root package lock
└── README.md                # This file
```

## 🛠️ Technology Stack

- **Runtime**: Node.js (CommonJS)
- **Framework**: Express.js
- **HTTP Client**: Axios, node-fetch
- **Environment Management**: dotenv
- **CORS**: cors middleware
- **File Operations**: fs/promises
- **API Integration**: cPanel API v2

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- cPanel hosting account with API access

### 1. Clone the Repository
```bash
git clone [repository-url]
cd CMS-nodeJs-template-server
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=3000

# cPanel Configuration
CPANEL_USERNAME=your_cpanel_username
CPANEL_PASSWORD=your_cpanel_password
CPANEL_HOST=https://your-domain.com:2083
```

### 4. Start the Server
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### Content Management

#### Save Content
```http
POST /save
Content-Type: application/json

{
  "file": "about.html",
  "content": "<h1>Welcome to our site</h1><p>New content here...</p>",
  "test": false
}
```

#### Get Content for Editing
```http
GET /edit/:filename
```

#### Test cPanel Connection
```http
GET /test-cpanel
```

### Response Format
All endpoints return JSON responses with consistent structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {...}
}
```

## 🎯 Template System

### Template Variables
Templates support dynamic variable substitution:

- `{{TITLE}}`: Page title
- `{{CONTENT}}`: Main content area
- `{{META_DESCRIPTION}}`: SEO meta description
- `{{KEYWORDS}}`: SEO keywords

### CSS Mapping
The server automatically maps CSS files based on page slugs:

```javascript
const pageCssMap = {
  'about': ['/assets/css/about.css', '/assets/css/styles.css'],
  'services': ['/assets/css/services.css', '/assets/css/styles.css'],
  // ... more mappings
};
```

## 🔐 Security Features

- **Environment Variables**: Sensitive credentials stored in `.env`
- **Input Validation**: Filename validation and sanitization
- **CORS Protection**: Configurable cross-origin policies
- **Error Handling**: Secure error messages without exposing internals

## 🐛 Debugging & Testing

### Test cPanel Connection
Access `http://localhost:3000/test-cpanel` to verify:
- cPanel API connectivity
- Authentication credentials
- File permissions
- Directory structure

### Request Logging
All requests are logged with:
- Timestamp
- HTTP method and URL
- Request body (for POST requests)
- Response status

## 📊 Performance Optimizations

- **Efficient File Operations**: Batch file reads/writes
- **Caching Strategy**: Template compilation caching
- **Connection Pooling**: Reused HTTP connections
- **Timeout Handling**: 15-second API timeout limits

## 🔄 Deployment

### Production Deployment
1. Set production environment variables
2. Configure reverse proxy (nginx/Apache)
3. Enable HTTPS/SSL
4. Set up process manager (PM2)

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

No Contributions are allowed.

## 🆘 Support

For support, email [bokangkgabale33889@gmail] or create an issue in the GitHub repository.

## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] Image upload functionality
- [ ] Version control integration
- [ ] Real-time collaboration
- [ ] Advanced SEO tools
- [ ] Analytics integration
- [ ] Mobile app support

---

**Built with ❤️ using Node.js and Express**
