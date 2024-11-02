import { useState } from 'react';

const DEFAULT_PRESETS = [
  {
    id: 'default',
    name: 'デフォルト',
    prompt: 'あなたは親切で知的なAIアシスタントです。',
  },
  {
    id: 'teacher',
    name: '先生',
    prompt: 'あなたは経験豊富な教師です。わかりやすく丁寧に説明してください。',
  },
  {
    id: 'programmer',
    name: 'プログラマー',
    prompt: 'あなたは熟練したプログラマーです。技術的な質問に答え、コードの例を示してください。',
  },
];

export default function CharacterPresets({ onSelect }) {
  const [presets] = useState(DEFAULT_PRESETS);

  return (
    <div className="p-4 border-b dark:border-gray-700">
      <h2 className="text-lg font-semibold mb-2">キャラクタープリセット</h2>
      <div className="space-y-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset)}
            className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
} 