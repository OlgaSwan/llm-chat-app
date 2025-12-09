import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Edit2, Trash2, Check, X } from 'lucide-react';

interface ThreadItemProps {
  thread: {
    id: string;
    name: string;
  };
  isActive: boolean;
  onSelect: (threadId: string) => void;
  onRename: (threadId: string, newName: string) => void;
  onDelete: (threadId: string) => void;
}

export const ThreadItem = ({ thread, isActive, onSelect, onRename, onDelete }: ThreadItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleCancelEdit();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditName(thread.name);
  };

  const handleSaveEdit = () => {
    const trimmedName = editName.trim();

    if (!trimmedName) {
      handleCancelEdit();
      return;
    }

    if (trimmedName === thread.name) {
      setIsEditing(false);
      return;
    }

    onRename(thread.id, trimmedName);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDelete = () => {
    if (confirm('Delete this thread?')) {
      onDelete(thread.id);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`group relative mb-1 rounded-lg transition-colors ${
        isActive ? 'bg-gray-700' : 'hover:bg-gray-800'
      }`}
    >
      {isEditing ? (
        <div className="flex items-center gap-1 p-2">
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-gray-600 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSaveEdit}
            className="p-1 hover:bg-gray-600 rounded"
            title="Save"
          >
            <Check size={16} />
          </button>
          <button
            onClick={handleCancelEdit}
            className="p-1 hover:bg-gray-600 rounded"
            title="Cancel"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={() => onSelect(thread.id)}
            className="w-full text-left p-3 flex items-start gap-2"
          >
            <MessageSquare size={16} className="mt-0.5 flex-shrink-0" />
            <span className="text-sm truncate flex-1">{thread.name}</span>
          </button>
          <div
            className={` rounded-lg absolute right-0 top-0 h-full hidden group-hover:flex gap-1 items-center pr-2 pl-8 bg-gradient-to-l ${
              isActive ? 'from-gray-700 via-gray-700/90' : 'from-gray-800 via-gray-800/90'
            } to-transparent`}
          >
            <button
              onClick={handleStartEdit}
              className="p-1 bg-gray-600 hover:bg-gray-500 rounded shadow-sm"
              title="Rename"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 bg-gray-600 hover:bg-red-600 rounded shadow-sm"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
