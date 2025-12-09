# LLM Chat Application

A standalone chat application to interface with LLM using OpenRouter API. Built with React, TypeScript, Vite, and Tailwind CSS.

## Features

### Required Features
-  **Thread Management**: Create, delete, rename, and switch between conversation threads
- **Streaming Responses**: Real-time streaming of LLM responses
-  **Markdown Formatting**: Properly formatted responses with markdown support
-  **Request Cancellation**: Cancel in-flight requests while streaming
-  **Auto-scrolling**: Automatic scroll with manual override and scroll-to-bottom button
-  **Token Usage**: Display token usage for individual messages and entire threads
-  **Local Persistence**: Threads and messages saved to localStorage

### Bonus Features
-  **Auto-naming Threads**: Automatically generates thread names based on the first user prompt

## Tech Stack

- **Vite**: Build tool and development server
- **TypeScript**: Type-safe JavaScript
- **React 18**: UI framework
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: State management with persistence
- **React Markdown**: Markdown rendering
- **Lucide React** - Icon library
- **OpenRouter API**: LLM interface using `openai/gpt-3.5-turbo` model

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- OpenRouter API key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd testoneiq
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` and add your OpenRouter API key:
```
VITE_OPENROUTER_API_KEY=your_api_key_here
```

## Running the Application

### Development Mode
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production
```bash
npm run build
```
The built files will be in the `dist` directory.

## Usage

### Creating a Thread
1. Click the "New Thread" button in the sidebar
2. A new thread will be created and automatically selected

### Sending Messages
1. Type your message in the input area at the bottom
2. Press Enter to send (Shift+Enter for new line)
3. The response will stream in real-time

### Managing Threads
- **Switch Thread**: Click on any thread in the sidebar
- **Rename Thread**: Hover over a thread and click the edit icon
- **Delete Thread**: Hover over a thread and click the delete icon

### Cancelling Requests
- While a response is streaming, click the red square button to cancel

### Scrolling
- The chat auto-scrolls to the bottom as new messages arrive
- Scroll up manually to view older messages
- Click the arrow button at the bottom-right to scroll back to the bottom

### Token Usage
- Token usage is displayed below each assistant message
- Total token usage for the entire thread is shown in the header

## Design Decisions

### Thread Management
- Auto-naming based on first user message
- Inline renaming with Enter/Escape keyboard shortcuts
- Click-outside-to-save for better UX

### Streaming
- Real-time token-by-token response rendering
- Cancel button appears during streaming
- Automatic token usage tracking

### Smart Scrolling
- Auto-scroll disabled when user scrolls up
- "Scroll to bottom" button appears when not at bottom

### Message Input
- Auto-resizing textarea (up to max height)
- Shift+Enter for multi-line messages
- Character limit (1,000 characters)
- Automatic height reset after sending
- Disabled state when no thread selected

### Third-party Packages
- **react-markdown**: Industry-standard for markdown rendering
- **lucide-react**: Lightweight icon library
- **@tailwindcss/typography**: Beautiful typography for markdown content

## Notes

- No backend - all data stored locally
- No message editing or deletion
- No export/import functionality
- Uses `window.confirm` for delete confirmation (could be improved with custom modal)
- Error handling is basic to maintain proof-of-concept state
- The model used is `openai/gpt-3.5-turbo` via OpenRouter

## License

MIT
