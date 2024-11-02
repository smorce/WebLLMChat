import { useState } from 'react';

export default function Sidebar({ conversations, onSelectConversation, onNewChat, activeId, onOpenSettings }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 日付をフォーマットする関数を単純化
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${month}月${day}日 ${hours}:${minutes}`;
  };

  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onNewChat}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
        >
          <span className="mr-2">+</span>
          新規チャット
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className={`p-3 hover:bg-gray-700 cursor-pointer ${
              activeId === conv.id ? 'bg-gray-700' : ''
            }`}
          >
            <div className="font-medium truncate">{conv.title}</div>
            <div className="text-sm text-gray-400">
              {formatDate(conv.timestamp)}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onOpenSettings}
          className="w-full text-left py-2 px-4 hover:bg-gray-700 rounded"
        >
          設定
        </button>
      </div>
    </div>
  );
} 