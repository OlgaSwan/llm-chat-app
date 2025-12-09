import { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { useChatStore } from './store/chatStore';

function App() {
  const { threads, createThread } = useChatStore();

  // Create initial thread if none exists
  useEffect(() => {
    if (threads.length === 0) {
      createThread();
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <ChatArea />
    </div>
  );
}

export default App;
