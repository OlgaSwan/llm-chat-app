import ReactMarkdown from 'react-markdown';
import { Message as MessageType } from '../types';
import { User, Bot } from 'lucide-react';

interface MessageProps {
  message: MessageType;
}

export const Message = ({ message }: MessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-4 p-6 ${
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
    </div>
  );
};
