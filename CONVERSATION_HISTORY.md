# Conversation History Features

This document describes the conversation history functionality in the HEALRAG Security Assistant frontend.

## Overview

The conversation history system provides users with intelligent, AI-powered titles for their chat sessions, making it easy to find and navigate previous conversations.

## Features

### 🧠 AI-Powered Titles

#### Backend Integration
- **Endpoint**: `POST /title-summarizer`
- **Authentication**: Requires Bearer token
- **Input**: First query from each conversation
- **Output**: 4-word intelligent title

#### Request Format
```json
{
  "text": "what should i do if my laptop is lost",
  "max_words": 4
}
```

#### Response Format
```json
{
  "success": true,
  "summary": "Lost Laptop Recovery Steps",
  "word_count": 4,
  "original_text": "what should i do if my laptop is lost",
  "error": null
}
```

#### Fallback System
If AI title generation fails, the system falls back to:
1. First 4 words of the original query
2. "Chat" if no query is available

### 📅 Two-Line Display Format

#### Visual Layout
```
7/18/2025 3:45 PM
Lost Laptop Recovery Steps
```

#### Styling
- **Date/Time**: Gray text, smaller font (0.875rem)
- **Title**: Black text, bold font (1rem)
- **Layout**: Vertical flex with 2px gap
- **Panel Width**: 350px optimized

### 🗂️ History Management

#### Session Display
- **Count**: Exactly 10 most recent conversations
- **Grouping**: By date (Today, Yesterday, Last 7 days, Last 30 days)
- **Loading**: Automatic when panel opens
- **No Infinite Scroll**: Fixed 10-item limit

#### Actions
- **Clear Current Session**: Broom icon (left side of input)
- **Delete History Entry**: Trash can icon (next to each entry)
- **Load Conversation**: Click on any history entry

## Technical Implementation

### API Functions

#### `titleSummarizerApi(text, maxWords, idToken)`
```typescript
export async function titleSummarizerApi(
  text: string, 
  maxWords: number = 4, 
  idToken: string
): Promise<{ title: string }>
```

**Features:**
- 5-second timeout protection
- In-memory caching
- Error handling with fallback
- Response validation

#### `getChatHistoryListApi(count, continuationToken, idToken)`
```typescript
export async function getChatHistoryListApi(
  count: number, 
  continuationToken: string | undefined, 
  idToken: string
): Promise<{ sessions: any[]; continuation_token?: string }>
```

**Features:**
- Retrieves last 10 sessions
- Generates AI titles for each session
- Formats two-line display
- Handles missing queries gracefully

### Component Architecture

#### HistoryPanel
- **Location**: `src/components/HistoryPanel/HistoryPanel.tsx`
- **Width**: 350px
- **Features**: Session loading, grouping, deletion

#### HistoryItem
- **Location**: `src/components/HistoryItem/HistoryItem.tsx`
- **Features**: Two-line display, click handling, delete modal

#### Styling
- **Location**: `src/components/HistoryItem/HistoryItem.module.css`
- **Features**: Responsive layout, hover effects, delete button

### Caching System

#### In-Memory Cache
```typescript
const titleCache = new Map<string, string>();
```

**Benefits:**
- Avoids redundant API calls
- Improves performance
- Reduces backend load

#### Cache Management
```typescript
export function clearTitleCache(): void
```

**Usage:**
- Clear cache when needed
- Debugging purposes
- Memory management

## Error Handling

### Common Issues

#### 1. Title Generation Failures
- **Cause**: Backend endpoint unavailable or invalid response
- **Solution**: Automatic fallback to first 4 words
- **Logging**: Console warnings with session ID

#### 2. Invalid Response Format
- **Cause**: Backend returns unexpected structure
- **Solution**: Response validation and error throwing
- **Detection**: Type checking and field validation

#### 3. Timeout Issues
- **Cause**: Backend takes too long to respond
- **Solution**: 5-second timeout with AbortController
- **Fallback**: Immediate fallback to word-based titles

### Debug Information

#### Console Logs
```
🔍 Generating AI title for query: "what should i do if my laptop..."
✅ Generated AI title: "Lost Laptop Recovery Steps" (4 words)
🔄 Using fallback title: "what should i do if" (4 words)
⚠️ Failed to generate AI title for session session_123: Error message
```

#### Error Types
- **API Errors**: Network failures, invalid responses
- **Validation Errors**: Missing or malformed data
- **Timeout Errors**: Request taking too long

## Configuration

### Environment Variables
No additional environment variables required. Uses existing:
- `VITE_HEALRAG_BACKEND_URL`
- Authentication token from Azure AD

### Backend Requirements
- `/title-summarizer` endpoint must be available
- Must return `summary` field in response
- Must support Bearer token authentication
- Should respond within 5 seconds

## Performance Considerations

### Optimization Strategies
1. **Caching**: In-memory cache for repeated queries
2. **Timeout**: 5-second limit to prevent hanging
3. **Fallback**: Immediate fallback on failure
4. **Batch Loading**: Load all titles in parallel

### Memory Usage
- **Cache Size**: Limited by number of unique queries
- **Cleanup**: Manual cache clearing available
- **Efficiency**: Only caches successful responses

## Future Enhancements

### Potential Improvements
1. **Persistent Cache**: Store cache in localStorage
2. **Batch Processing**: Generate titles in background
3. **Custom Prompts**: User-configurable title styles
4. **Analytics**: Track title generation success rates

### Backend Integration
1. **Rate Limiting**: Implement proper rate limiting
2. **Caching**: Backend-side caching for common queries
3. **Monitoring**: Track endpoint usage and performance
4. **Fallback Models**: Multiple AI models for redundancy

## Troubleshooting

### Debug Checklist
- [ ] Backend `/title-summarizer` endpoint is accessible
- [ ] Authentication token is valid
- [ ] Backend returns `summary` field in response
- [ ] Network connectivity is stable
- [ ] Console shows no JavaScript errors

### Common Solutions
1. **Check Backend Logs**: Verify endpoint is working
2. **Clear Browser Cache**: Refresh page and try again
3. **Check Network Tab**: Look for failed API calls
4. **Verify Authentication**: Ensure user is logged in
5. **Test Endpoint Directly**: Use Postman or curl

## Support

For issues related to conversation history:
1. Check browser console for error messages
2. Verify backend endpoint availability
3. Test with simple queries first
4. Check authentication status
5. Review network requests in DevTools 