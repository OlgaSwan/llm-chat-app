import ReactMarkdown from 'react-markdown';
import { Message as MessageType } from '../types';
import { User, Bot, Save } from 'lucide-react';
import { useState } from 'react';

interface MessageProps {
  message: MessageType;
}

export const Message = ({ message }: MessageProps) => {
  const isUser = message.role === 'user';
  const [isSaved, setIsSaved] = useState(false);

  if (!isUser && !message.content) {
    return null;
  }

  const handleSave = () => {
    navigator.clipboard.writeText(message.content);
    setIsSaved(true);

    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  return (
    <div
      className={`group relative flex gap-4 p-6 ${
        isUser ? 'bg-white' : 'bg-gray-50'
      }`}
    >
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="prose prose-sm max-w-none">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          )}
        </div>
        {message.tokens && (
          <div className="mt-2 text-xs text-gray-500">
            Tokens: {message.tokens.prompt} prompt + {message.tokens.completion} completion ={' '}
            {message.tokens.total} total
          </div>
        )}
      </div>
      <button
        onClick={handleSave}
        className={`absolute top-1 right-2 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
          isSaved
            ? 'bg-green-500 text-white'
            : 'text-gray-700'
        }`}
        title={isSaved ? 'Copied!' : 'Copy to clipboard'}
      >
        <Save size={14} />
      </button>
    </div>
  );
};
