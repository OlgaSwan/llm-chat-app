import { useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { PlusCircle, MessageSquare, Edit2, Trash2, Check, X } from 'lucide-react';

export const Sidebar = () => {
  const { threads, activeThreadId, createThread, deleteThread, renameThread, setActiveThread } =
    useChatStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreateThread = () => {
    createThread();
  };

  const handleRename = (threadId: string, currentName: string) => {
    setEditingId(threadId);
    setEditName(currentName);
  };

  const handleSaveRename = (threadId: string) => {
    if (editName.trim()) {
      renameThread(threadId, editName.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
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
        {threads.map((thread) => (
          <div
            key={thread.id}
            className={`group relative mb-1 rounded-lg transition-colors ${
              thread.id === activeThreadId
                ? 'bg-gray-700'
                : 'hover:bg-gray-800'
            }`}
          >
            {editingId === thread.id ? (
              <div className="flex items-center gap-1 p-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename(thread.id);
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  className="flex-1 bg-gray-600 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveRename(thread.id)}
                  className="p-1 hover:bg-gray-600 rounded"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 hover:bg-gray-600 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setActiveThread(thread.id)}
                  className="w-full text-left p-3 flex items-start gap-2"
                >
                  <MessageSquare size={16} className="mt-0.5 flex-shrink-0" />
                  <span className="text-sm truncate flex-1">{thread.name}</span>
                </button>
                <div className="absolute right-2 top-2 hidden group-hover:flex gap-1">
                  <button
                    onClick={() => handleRename(thread.id, thread.name)}
                    className="p-1 hover:bg-gray-600 rounded"
                    title="Rename"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this thread?')) {
                        deleteThread(thread.id);
                      }
                    }}
                    className="p-1 hover:bg-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
