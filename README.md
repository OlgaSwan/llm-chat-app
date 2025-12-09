# LLM Chat Application

A standalone chat application to interface with LLM using OpenRouter API. Built with React, TypeScript, Vite, and Tailwind CSS.

## Features

### Required Features
- ✅ **Thread Management**: Create, delete, rename, and switch between conversation threads
- ✅ **Streaming Responses**: Real-time streaming of LLM responses
- ✅ **Markdown Formatting**: Properly formatted responses with markdown support
- ✅ **Request Cancellation**: Cancel in-flight requests while streaming
- ✅ **Auto-scrolling**: Automatic scroll with manual override and scroll-to-bottom button
- ✅ **Token Usage**: Display token usage for individual messages and entire threads
- ✅ **Local Persistence**: Threads and messages saved to localStorage

### Bonus Features
- ✅ **Auto-naming Threads**: Automatically generates thread names based on the first user prompt

## Tech Stack

- **Vite**: Build tool and development server
- **TypeScript**: Type-safe JavaScript
- **React 18**: UI framework
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: State management with persistence
- **React Markdown**: Markdown rendering
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

### Preview Production Build
```bash
npm run preview
```

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

## Project Structure

```
src/
├── components/
│   ├── ChatArea.tsx      # Main chat interface
│   ├── ChatInput.tsx     # Message input component
│   ├── Message.tsx       # Individual message component
│   └── Sidebar.tsx       # Thread list sidebar
├── store/
│   └── chatStore.ts      # Zustand store with persistence
├── utils/
│   └── autoName.ts       # Thread auto-naming utility
├── types.ts              # TypeScript type definitions
├── App.tsx               # Root component
├── main.tsx              # Entry point
└── index.css             # Global styles
```

## Design Decisions

### State Management
- **Zustand** was chosen for its simplicity and built-in persistence middleware
- State is automatically saved to localStorage for data persistence

### Streaming Implementation
- Direct fetch API with ReadableStream for maximum control
- AbortController for request cancellation
- Real-time UI updates as tokens arrive

### UI/UX
- Clean, minimalist design inspired by modern chat applications
- Responsive layout with fixed sidebar and flexible chat area
- Visual feedback for streaming state and user actions

### Third-party Packages
- **react-markdown**: Industry-standard for markdown rendering
- **lucide-react**: Lightweight icon library
- **@tailwindcss/typography**: Beautiful typography for markdown content

## Notes

- The application uses localStorage for persistence, so data is browser-specific
- No backend is required - all state is managed client-side
- Error handling is basic to maintain proof-of-concept state
- The model used is `openai/gpt-3.5-turbo` via OpenRouter

## License

MIT
