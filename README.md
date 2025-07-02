# RAG Chat Frontend Application

This is a React TypeScript frontend application for a RAG (Retrieval Augmented Generation) chat interface. It provides a modern, responsive user interface for interacting with AI-powered chat services.

## Features

- **Modern React Frontend**: Built with React 18 and TypeScript
- **Chat Interface**: Multi-turn conversation support with message history
- **Component Library**: Comprehensive set of reusable UI components
- **Responsive Design**: Mobile-friendly interface with modern UI/UX
- **Internationalization**: Multi-language support with i18n
- **Authentication**: User authentication integration support
- **Settings Panel**: Configurable chat settings and preferences
- **File Upload**: Support for document and media uploads
- **Citation Display**: Shows sources and references for AI responses
- **Analysis Panel**: Detailed analysis and insights display

## Project Structure

```
├── src/
│   ├── api/              # API integration layer
│   ├── assets/           # Static assets (images, icons)
│   ├── components/       # Reusable React components
│   │   ├── Answer/       # Answer display components
│   │   ├── AnalysisPanel/# Analysis and insights
│   │   ├── Example/      # Example queries
│   │   ├── HistoryPanel/ # Chat history management
│   │   ├── QuestionInput/# User input components
│   │   ├── Settings/     # Configuration panels
│   │   └── ...           # Other UI components
│   ├── i18n/            # Internationalization setup
│   ├── locales/         # Translation files
│   ├── pages/           # Page components
│   └── index.tsx        # Application entry point
├── public/              # Public assets
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite build configuration
└── index.html           # HTML template
```

## Getting Started

### Prerequisites

- Node.js 20+ (see `.nvmrc` for exact version)
- npm (comes with Node.js)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Configuration

### Environment Setup

Create a `.env.local` file in the root directory for local development:

```env
# API Configuration
VITE_API_BASE_URL=your_api_endpoint
VITE_AUTH_CLIENT_ID=your_auth_client_id
```

### Build Configuration

The application uses Vite for fast development and optimized production builds. Configuration can be found in `vite.config.ts`.

## Components Overview

### Core Components

- **Answer**: Displays AI responses with citations and sources
- **QuestionInput**: Handles user input with file upload support
- **HistoryPanel**: Manages conversation history
- **AnalysisPanel**: Shows detailed analysis and insights
- **Settings**: Configuration panel for chat behavior

### UI Components

- **ClearChatButton**: Clears current conversation
- **SettingsButton**: Opens settings panel
- **LoginButton**: Handles user authentication
- **MarkdownViewer**: Renders markdown content

## Styling

The application uses modern CSS with:
- CSS Modules for component-scoped styles
- Responsive design principles
- Accessibility-first approach
- Dark/light theme support

## Development

### Code Style

- TypeScript for type safety
- ESLint and Prettier for code formatting
- Consistent component structure
- Props interfaces for all components

### Adding New Components

1. Create component directory in `src/components/`
2. Include TypeScript interfaces
3. Add corresponding styles
4. Export from component index

## Backend Integration

This frontend is designed to work with a compatible RAG backend API. The API layer in `src/api/` handles:

- Chat message sending/receiving
- File uploads
- User authentication
- Settings management

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Include unit tests for new components
4. Update documentation as needed

## License

This project is licensed under the MIT License - see the LICENSE file for details.
