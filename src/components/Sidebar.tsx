import { useChatStore } from '../store/chatStore';
import { PlusCircle, MessageCircle } from 'lucide-react';
import { ThreadItem } from './ThreadItem';

export const Sidebar = () => {
  const { threads, activeThreadId, createThread, deleteThread, renameThread, setActiveThread } =
    useChatStore();

  const handleCreateThread = () => {
    createThread();
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen">
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={handleCreateThread}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
        >
          <PlusCircle size={20} />
          <span>New Thread</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 px-4 text-center">
            <MessageCircle size={48} className="mb-4 opacity-50" />
            <p className="text-sm">No threads yet</p>
            <p className="text-xs mt-2 text-gray-600">
              Click "New Thread" to start a conversation
            </p>
          </div>
        ) : (
          threads.map((thread) => (
            <ThreadItem
              key={thread.id}
              thread={thread}
              isActive={thread.id === activeThreadId}
              onSelect={setActiveThread}
              onRename={renameThread}
              onDelete={deleteThread}
            />
          ))
        )}
      </div>
    </div>
  );
};
