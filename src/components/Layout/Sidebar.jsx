import { useState } from 'react';
import TrashIcon from '../icons/TrashIcon';
import EditIcon from '../icons/EditIcon';

export default function Sidebar({ 
  conversations, 
  onSelectConversation, 
  onNewChat, 
  activeId, 
  onOpenSettings,
  onDeleteConversation,
  onEditTitle
}) {
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

  // タイトルを省略して表示する関数を11文字に変更
  const truncateTitle = (title) => {
    if (title.length > 11) {
      return `${title.substring(0, 11)}...`;
    }
    return title;
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
            className={`p-3 hover:bg-gray-700 ${
              activeId === conv.id ? 'bg-gray-700' : ''
            } flex justify-between items-center group`}
          >
            <div 
              onClick={() => onSelectConversation(conv.id)}
              className="flex-1 cursor-pointer"
            >
              <div className="font-medium truncate" title={conv.title}>
                {truncateTitle(conv.title)}
              </div>
              <div className="text-sm text-gray-400">
                {formatDate(conv.timestamp)}
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEditTitle(conv.id)}
                className="p-1 hover:bg-gray-600 rounded"
              >
                <EditIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteConversation(conv.id)}
                className="p-1 hover:bg-gray-600 rounded"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
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