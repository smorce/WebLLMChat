import { useState } from 'react';

export default function SystemPrompt({ prompt, onSave }) {
  const [editingPrompt, setEditingPrompt] = useState(prompt);
  
  return (
    <div className="p-4 border-b dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">システムプロンプト</h2>
        <button
          onClick={() => onSave(editingPrompt)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          保存
        </button>
      </div>
      <textarea
        value={editingPrompt}
        onChange={(e) => setEditingPrompt(e.target.value)}
        className="w-full h-32 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        placeholder="システムプロンプトを入力..."
      />
    </div>
  );
} 