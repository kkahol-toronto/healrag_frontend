# HEALRAG Frontend Setup Guide

This is the frontend application for the HEALRAG Security Assistant system. It connects to your HEALRAG backend deployed at `https://healrag-security.azurewebsites.net`.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (check with `node --version`)
- npm (comes with Node.js)

### Installation & Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

## 🔧 Configuration

### Azure AD App Registration (Required)

Before running the application, you need to create an Azure AD app registration for the frontend:

1. **Go to Azure Portal → Azure Active Directory → App registrations**

2. **Click "New registration"** and configure:
   - **Name**: `healrag-frontend` (or your preferred name)
   - **Supported account types**: Choose based on your needs (likely "Accounts in this organizational directory only")
   - **Redirect URI**: 
     - Type: `Single-page application (SPA)`
     - URI: `http://localhost:3000`

3. **After creation, copy the Application (client) ID**

4. **Go to Authentication section** and ensure:
   - `http://localhost:3000` is listed under SPA redirect URIs
   - Enable "Access tokens" and "ID tokens" under Implicit grant
   - For production, add your production domain URL

### Environment Configuration

5. **Create a `.env` file** in the project root with your Azure AD client ID:

```env
# Required: Azure AD Client ID (from step 3 above)
VITE_AZURE_CLIENT_ID=your-azure-ad-client-id-here

# Optional: Override backend URL
VITE_HEALRAG_BACKEND_URL=https://healrag-security.azurewebsites.net

# Optional: App customization
VITE_APP_TITLE="HEALRAG Security Assistant"
VITE_DEBUG_MODE=false
```

> **Important**: Replace `your-azure-ad-client-id-here` with the actual client ID from your Azure AD app registration.

## 🔐 Authentication Flow

The frontend integrates with your Azure AD authentication:

1. **Login**: User clicks login → redirected to Azure AD via your backend
2. **Callback**: Backend handles Azure AD callback and returns token
3. **API Calls**: Frontend uses Bearer token for all HEALRAG API requests
4. **Session Management**: Each chat creates a unique session ID for history tracking

## 🎯 Key Features

### ✅ Implemented & Working
- **Azure AD Authentication** via HEALRAG backend
- **RAG Chat Interface** with streaming responses
- **Session Management** with automatic session ID generation
- **AI-Powered Chat History** with intelligent titles via `/title-summarizer`
- **Two-Line History Display** with date/time and AI-generated titles
- **Document Search** through HEALRAG search API
- **Responsive UI** with Fluent UI components
- **Multi-language Support** (i18n ready)
- **Maximum Strictness Mode** for consistent AI responses

### ⚙️ Backend Integration
- **RAG Queries**: `/rag/query` and `/rag/stream` endpoints
- **Session History**: `/sessions/history` and `/sessions/user` endpoints
- **Title Summarization**: `/title-summarizer` endpoint for AI-powered titles
- **Authentication**: `/auth/login`, `/auth/callback`, `/auth/me` endpoints
- **Configuration**: `/config` endpoint for system settings

## 📝 Available Scripts

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code formatting
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript check without building
npm test:backend     # Test if HEALRAG backend is available
npm run clean        # Clean build artifacts
```

## 🌐 Usage Instructions

### For End Users:
1. **Open**: Navigate to the frontend URL
2. **Login**: Click "Login" to authenticate via Azure AD
3. **Chat**: Start asking questions about security policies
4. **History**: View previous conversations with AI-generated titles in the sidebar
5. **Session Management**: 
   - Broom icon: Clear current session (keeps history)
   - Trash icon: Delete specific history entries
6. **Sessions**: Each browser tab creates a new chat session

### For Developers:
1. **Development**: Use `npm run dev` for hot-reload development
2. **Production**: Use `npm run build` to create optimized build
3. **API Integration**: All backend calls are in `src/api/api.ts`
4. **Authentication**: Handled in `src/authConfig.ts`
5. **Configuration**: Settings in `src/config.ts`

## 🔗 API Integration Details

### Session Management
- Frontend generates unique session IDs: `session_${timestamp}_${random}`
- Backend automatically stores chat history with session ID
- History retrieved via session ID for context

### Request Flow
```
Frontend → HEALRAG Backend → Azure OpenAI + Azure Search → Response
```

### Authentication Headers
```typescript
{
  "Authorization": "Bearer <azure_ad_token>",
  "Content-Type": "application/json"
}
```

## 🐛 Troubleshooting

### Common Issues:

**Build Errors**: Ensure Node.js 20+ is installed
```bash
node --version  # Should be 20.x.x or higher
npm install     # Reinstall dependencies
```

**Backend Connection**: Check if backend is running
```bash
npm run test:backend
# or manually:
curl https://healrag-security.azurewebsites.net/health
```

**Authentication Issues**: 
- **"Application with identifier 'healrag-frontend' was not found"**: You need to create the Azure AD app registration (see Configuration section above) and set `VITE_AZURE_CLIENT_ID` in your `.env` file
- **Backend auth errors**: Check backend logs for auth callback errors
- **Redirect URI errors**: Ensure frontend URL is in Azure AD redirect URIs for both frontend and backend app registrations

**CORS Errors**: Backend should include frontend URL in CORS settings
```python
# In your backend main.py
allow_origins=[
    "https://healrag-security.azurewebsites.net",
    "http://localhost:3000",  # Add this for development
    # Add your production frontend URL
]
```

**Title Summarizer Issues**: 
- **"Invalid title response"**: Ensure `/title-summarizer` endpoint returns `summary` field
- **"Failed to generate AI title"**: Check backend logs for title generation errors
- **Timeout errors**: Backend should respond within 5 seconds

## 📁 Project Structure

```
src/
├── api/              # HEALRAG backend integration
│   ├── api.ts       # API functions and session management
│   └── models.ts    # TypeScript interfaces
├── components/       # React UI components
├── pages/           # Main page components (Chat, Ask)
├── authConfig.ts    # Azure AD authentication setup
├── config.ts        # App configuration
└── index.tsx        # App entry point
```

## 🔄 Deployment Options

### Option 1: Static Hosting (Recommended)
```bash
npm run build
# Deploy 'dist' folder to:
# - Azure Static Web Apps
# - Netlify
# - Vercel
# - GitHub Pages
```

### Option 2: Docker Container
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📞 Support

- **Backend Issues**: Check HEALRAG backend logs and health endpoint
- **Frontend Issues**: Check browser console for errors
- **Authentication**: Verify Azure AD configuration in backend
- **API Errors**: Monitor network tab in browser dev tools

---

🎉 **You're all set!** The frontend is now ready to work with your HEALRAG backend for secure, AI-powered conversations. 