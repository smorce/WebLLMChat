import { useEffect, useRef } from 'react';
import SystemPrompt from './SystemPrompt';
import CharacterPresets from './CharacterPresets';

export default function SettingsModal({ isOpen, onClose, systemPrompt, onUpdateSystemPrompt }) {
  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[600px] max-h-[80vh] overflow-y-auto"
      >
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h1 className="text-xl font-bold">設定</h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <SystemPrompt
          prompt={systemPrompt}
          onSave={(newPrompt) => {
            onUpdateSystemPrompt(newPrompt);
            onClose();
          }}
        />

        <CharacterPresets
          onSelect={(preset) => {
            onUpdateSystemPrompt(preset.prompt);
            onClose();
          }}
        />
      </div>
    </div>
  );
} 