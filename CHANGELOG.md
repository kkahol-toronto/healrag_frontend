# Changelog

All notable changes to the HEALRAG Security Assistant Frontend will be documented in this file.

## [1.2.0] - 2025-01-18

### 🎉 Major Features Added

#### AI-Powered Conversation History Titles
- **New Backend Integration**: Added `/title-summarizer` endpoint integration
- **Intelligent Titles**: AI generates 4-word descriptive titles for conversations
- **Fallback System**: Graceful fallback to first 4 words if AI fails
- **Caching**: In-memory cache to avoid redundant API calls
- **Error Handling**: Comprehensive error handling with timeout protection

#### Two-Line History Display
- **New Format**: Date/time on first line, AI title on second line
- **Enhanced Styling**: 
  - Date/Time: Gray text, smaller font (0.875rem)
  - Title: Black text, bold font (1rem)
  - Vertical layout with 2px gap
- **Responsive Design**: Optimized for 350px panel width

#### Improved History Management
- **Fixed Count**: Exactly 10 most recent conversations
- **Session Clearing**: Broom icon now only clears current session (not server history)
- **Individual Deletion**: Trash can icon for deleting specific history entries
- **Removed Infinite Loading**: Fixed 10-item limit for better performance

### 🔧 Technical Improvements

#### API Enhancements
- **New Function**: `titleSummarizerApi()` with 5-second timeout
- **Enhanced Validation**: Response validation for both `title` and `summary` fields
- **Cache Management**: `clearTitleCache()` function for debugging
- **Better Logging**: Comprehensive console logging for debugging

#### Component Updates
- **HistoryPanel**: Updated to 350px width for better title display
- **HistoryItem**: Two-line display with proper styling
- **QuestionInput**: Updated broom icon tooltip to "Clear Current Session"
- **Chat**: Removed developer settings panel for cleaner UI

#### Configuration Changes
- **Temperature**: Set to 0.0 (maximum strictness) by default
- **Removed Settings**: Developer settings panel completely removed
- **Cleaner UI**: Simplified interface focused on end-user experience

### 🐛 Bug Fixes

#### Error Handling
- **Fixed**: `TypeError: Cannot read properties of undefined (reading 'split')`
- **Fixed**: Invalid title response handling
- **Fixed**: Backend response format mismatch (`summary` vs `title` field)
- **Fixed**: Timeout issues with title generation

#### UI/UX Improvements
- **Fixed**: History panel width for better title display
- **Fixed**: Button spacing and alignment for two-line format
- **Fixed**: Tooltip text for session clearing vs history deletion

### 📚 Documentation Updates

#### New Documentation
- **CONVERSATION_HISTORY.md**: Comprehensive guide to conversation history features
- **Updated README.md**: Added new features and troubleshooting
- **Updated HEALRAG_SETUP.md**: Added title summarizer requirements

#### API Documentation
- **Backend Requirements**: Added `/title-summarizer` endpoint requirements
- **Error Handling**: Documented common issues and solutions
- **Configuration**: Updated environment variable documentation

### 🔄 Breaking Changes

#### Removed Features
- **Developer Settings Panel**: Completely removed for cleaner UI
- **Temperature Control**: No longer user-configurable (fixed at 0.0)
- **Infinite History Loading**: Replaced with fixed 10-item limit

#### Changed Behavior
- **Broom Icon**: Now clears current session only (not server history)
- **History Titles**: Now uses AI-generated titles instead of first 4 letters
- **Panel Width**: Increased from 300px to 350px

### 🚀 Performance Improvements

#### Optimization
- **Caching**: In-memory cache reduces API calls
- **Timeout Protection**: 5-second limit prevents hanging
- **Batch Processing**: Parallel title generation for multiple sessions
- **Reduced Network Calls**: Fixed 10-item limit reduces data transfer

#### Memory Management
- **Efficient Caching**: Only caches successful responses
- **Manual Cleanup**: Cache clearing function available
- **Optimized Rendering**: Two-line format reduces DOM complexity

### 🛡️ Security Enhancements

#### Authentication
- **Token Validation**: Enhanced token validation for title summarizer
- **Error Handling**: Secure error messages without sensitive data exposure
- **Timeout Protection**: Prevents resource exhaustion attacks

### 📊 Backend Requirements

#### New Endpoints
- **`POST /title-summarizer`**: Required for AI-powered titles
  - Input: `{ "text": "query", "max_words": 4 }`
  - Output: `{ "success": true, "summary": "Title", "word_count": 4 }`
  - Authentication: Bearer token required
  - Timeout: Should respond within 5 seconds

### 🔍 Debugging Features

#### Console Logging
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

### 🎯 User Experience Improvements

#### Visual Enhancements
- **Cleaner Interface**: Removed developer settings for end-user focus
- **Better Titles**: Meaningful conversation titles instead of truncated text
- **Improved Layout**: Two-line format is easier to scan and read
- **Consistent Styling**: Professional appearance with proper typography

#### Functionality
- **Intuitive Actions**: Clear distinction between session clearing and history deletion
- **Faster Loading**: Fixed item limit improves performance
- **Better Feedback**: Comprehensive error messages and logging
- **Reliable Fallbacks**: System works even when AI service is unavailable

---

## [1.1.0] - 2025-01-15

### Features
- Initial release with basic chat functionality
- Azure AD authentication integration
- RAG-powered document search
- Session management with CosmoDB
- Responsive UI with Fluent UI components

### Technical
- React TypeScript frontend
- Vite build system
- Azure Static Web Apps deployment
- Multi-language support (i18n)

---

## [1.0.0] - 2025-01-10

### Features
- Initial project setup
- Basic chat interface
- Backend integration framework
- Authentication foundation

---

## Version History

- **1.2.0**: AI-powered conversation history with intelligent titles
- **1.1.0**: Basic chat functionality with authentication
- **1.0.0**: Initial project setup

---

## Contributing

When making changes, please:
1. Update this changelog with your changes
2. Follow the existing format and style
3. Include both user-facing and technical changes
4. Add appropriate emojis for better readability
5. Document any breaking changes clearly

---

## Support

For issues or questions about these changes:
1. Check the troubleshooting sections in README.md and CONVERSATION_HISTORY.md
2. Review console logs for debugging information
3. Verify backend endpoint availability
4. Test with simple queries first 