import { marked } from "marked";
import DOMPurify from "dompurify";
import ChatHeader from "./Chat/ChatHeader";
import BotIcon from "./icons/BotIcon";
import UserIcon from "./icons/UserIcon";
import "./Chat.css";
import { useEffect } from "react";

// 日付フォーマット関数を詳細な形式に変更
function formatMessageTime(timestamp) {
  if (!timestamp) {
    timestamp = new Date().toISOString();
  }
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

function render(text) {
  return DOMPurify.sanitize(marked.parse(text));
}

export default function Chat({ 
  messages, 
  selectedModel, 
  onModelChange 
}) {
  const empty = messages.length === 0;

  useEffect(() => {
    window.MathJax.typeset();
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        selectedModel={selectedModel} 
        onModelChange={onModelChange} 
      />
      
      <div className={`flex-1 p-6 max-w-[960px] w-full ${
        empty ? "flex flex-col items-center justify-end" : "space-y-6"
      }`}>
        {empty ? (
          <div className="text-xl">Ready!</div>
        ) : (
          messages.map((msg, i) => (
            <div key={`message-${i}`} className="flex items-start space-x-4 relative">
              {msg.role === "assistant" ? (
                <>
                  <BotIcon className="h-6 w-6 min-h-6 min-w-6 my-3 text-gray-500 dark:text-gray-300" />
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 flex-1">
                    <p className="min-h-6 text-gray-800 dark:text-gray-200 overflow-wrap-anywhere">
                      {msg.content.length > 0 ? (
                        <span
                          className="markdown"
                          dangerouslySetInnerHTML={{
                            __html: render(msg.content),
                          }}
                        />
                      ) : (
                        <span className="h-6 flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-gray-600 dark:bg-gray-300 rounded-full animate-pulse"></span>
                          <span className="w-2.5 h-2.5 bg-gray-600 dark:bg-gray-300 rounded-full animate-pulse animation-delay-200"></span>
                          <span className="w-2.5 h-2.5 bg-gray-600 dark:bg-gray-300 rounded-full animate-pulse animation-delay-400"></span>
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="absolute right-0 bottom-0 text-sm text-gray-400 -mb-5">
                    {formatMessageTime(msg.timestamp)}
                  </span>
                </>
              ) : (
                <>
                  <UserIcon className="h-6 w-6 min-h-6 min-w-6 my-3 text-gray-500 dark:text-gray-300" />
                  <div className="bg-blue-500 text-white rounded-lg p-4 flex-1">
                    <p className="min-h-6 overflow-wrap-anywhere">
                      {msg.content}
                    </p>
                  </div>
                  <span className="absolute right-0 bottom-0 text-sm text-gray-400 -mb-5">
                    {formatMessageTime(msg.timestamp)}
                  </span>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
