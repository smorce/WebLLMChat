export default function ChatHeader({ title, onEditTitle }) {
  return (
    <div className="border-b dark:border-gray-700 p-4 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">{title}</h1>
        <button
          onClick={onEditTitle}
          className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
      </div>
    </div>
  );
} 