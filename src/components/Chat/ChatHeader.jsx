import { useState } from 'react';

const MODELS = [
  { id: 'gemma-2-2b-jpn-it', name: 'Gemma 2B Japanese' },
  { id: 'SmolLM2-135M-Instruct', name: 'SmolLM2 135M' },
  { id: 'Qwen2.5-0.5B-Instruct', name: 'Qwen2.5 0.5B' }
];

export default function ChatHeader({ selectedModel, onModelChange }) {
  return (
    <div className="border-b dark:border-gray-700 p-4">
      <div className="max-w-[800px] mx-auto flex items-center justify-between">
        <h1 className="text-xl font-semibold">Chat</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">モデル:</span>
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="bg-gray-100 dark:bg-gray-700 rounded px-3 py-1"
          >
            {MODELS.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
} 