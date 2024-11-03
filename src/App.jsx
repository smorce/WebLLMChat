import { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';

import Chat from "./components/Chat";
import Sidebar from "./components/Layout/Sidebar";
import SettingsModal from "./components/Settings/SettingsModal";
import ArrowRightIcon from "./components/icons/ArrowRightIcon";
import StopIcon from "./components/icons/StopIcon";
import Progress from "./components/Progress";

const IS_WEBGPU_AVAILABLE = !!navigator.gpu;
const STICKY_SCROLL_THRESHOLD = 120;
const DEFAULT_SYSTEM_PROMPT = "あなたは親切で知的なAIアシスタントです。";

function App() {
  // Worker reference
  const worker = useRef(null);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Model loading and progress
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [progressItems, setProgressItems] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  // Chat state
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Input and generation state
  const [input, setInput] = useState("");
  const [tps, setTps] = useState(null);
  const [numTokens, setNumTokens] = useState(null);

  // New state
  const [selectedModel, setSelectedModel] = useState('gemma-2-2b-jpn-it');

  // Get active conversation
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  // Create new chat
  function createNewChat() {
    const newId = uuidv4();
    const newConversation = {
      id: newId,
      title: "新規チャット",
      messages: [],
      timestamp: new Date().toISOString(),
    };
    setConversations(prev => [...prev, newConversation]);
    setActiveConversationId(newId);
  }

  // Update conversation messages
  function updateConversationMessages(conversationId, newMessages) {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: newMessages,
          timestamp: new Date().toISOString(),
        };
      }
      return conv;
    }));
  }

  // Handle message submission
  function onEnter(message) {
    if (!activeConversationId) {
      createNewChat();
    }
    
    const newMessages = [...messages, { role: "user", content: message }];
    updateConversationMessages(activeConversationId, newMessages);
    
    setTps(null);
    setIsRunning(true);
    setInput("");
  }

  function onInterrupt() {
    worker.current.postMessage({ type: "interrupt" });
  }

  // Textarea auto-resize
  useEffect(() => {
    resizeInput();
  }, [input]);

  function resizeInput() {
    if (!textareaRef.current) return;
    const target = textareaRef.current;
    target.style.height = "auto";
    const newHeight = Math.min(Math.max(target.scrollHeight, 24), 200);
    target.style.height = `${newHeight}px`;
  }

  // Worker setup
  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL("./worker.js", import.meta.url), {
        type: "module",
      });
      worker.current.postMessage({ type: "check" });
    }

    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case "loading":
          setStatus("loading");
          setLoadingMessage(e.data.data);
          break;

        case "initiate":
          setProgressItems(prev => [...prev, e.data]);
          break;

        case "progress":
          setProgressItems(prev =>
            prev.map(item => {
              if (item.file === e.data.file) {
                return { ...item, ...e.data };
              }
              return item;
            }),
          );
          break;

        case "done":
          setProgressItems(prev =>
            prev.filter(item => item.file !== e.data.file),
          );
          break;

        case "ready":
          setStatus("ready");
          createNewChat(); // Create initial chat
          break;

        case "start":
          {
            const newMessages = [...messages, { role: "assistant", content: "" }];
            updateConversationMessages(activeConversationId, newMessages);
          }
          break;

        case "update":
          {
            const { output, tps, numTokens } = e.data;
            setTps(tps);
            setNumTokens(numTokens);
            
            const newMessages = [...messages];
            const last = newMessages[newMessages.length - 1];
            newMessages[newMessages.length - 1] = {
              ...last,
              content: last.content + output,
            };
            updateConversationMessages(activeConversationId, newMessages);
          }
          break;

        case "complete":
          setIsRunning(false);
          break;

        case "error":
          setError(e.data.data);
          break;
      }
    };

    worker.current.addEventListener("message", onMessageReceived);
    return () => worker.current.removeEventListener("message", onMessageReceived);
  }, [messages, activeConversationId]);

  // Send messages to worker
  useEffect(() => {
    if (messages.filter(x => x.role === "user").length === 0) return;
    if (messages.at(-1).role === "assistant") return;
    
    setTps(null);
    worker.current.postMessage({ 
      type: "generate", 
      data: [
        { role: "system", content: systemPrompt },
        ...messages
      ] 
    });
  }, [messages, isRunning, systemPrompt]);

  // Auto-scroll
  useEffect(() => {
    if (!chatContainerRef.current || !isRunning) return;
    const element = chatContainerRef.current;
    if (
      element.scrollHeight - element.scrollTop - element.clientHeight <
      STICKY_SCROLL_THRESHOLD
    ) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages, isRunning]);

  // Delete conversation
  function handleDeleteConversation(id) {
    if (confirm('このチャットを削除してもよろしいですか？')) {
      setConversations(prev => prev.filter(conv => conv.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    }
  }

  // Edit title
  function handleEditTitle(id) {
    const conversation = conversations.find(c => c.id === id);
    const newTitle = prompt('新しいタイトルを入力してください:', conversation.title);
    if (newTitle) {
      setConversations(prev => prev.map(conv => {
        if (conv.id === id) {
          return { ...conv, title: newTitle };
        }
        return conv;
      }));
    }
  }

  // Change model
  function handleModelChange(modelId) {
    setSelectedModel(modelId);
    // 必要に応じてworkerに新しいモデルを通知
  }

  return IS_WEBGPU_AVAILABLE ? (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      {status === "ready" && (
        <Sidebar
          conversations={conversations}
          activeId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNewChat={createNewChat}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onDeleteConversation={handleDeleteConversation}
          onEditTitle={handleEditTitle}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen text-gray-800 dark:text-gray-200">
        {status === null && messages.length === 0 && (
          <div className="h-full flex justify-center items-center flex-col">
            <div className="flex flex-col items-center mb-8 max-w-[340px] text-center">
              <img src="logo.png" width="75%" height="auto" className="block mb-4" />
              <h1 className="text-4xl font-bold mb-2">Gemma 2 JPN WebGPU</h1>
              <h2 className="font-semibold">
                Gemma-2-JPN running locally in your browser on WebGPU
              </h2>
            </div>

            <div className="px-4 max-w-[514px] text-center">
              <p className="mb-4">
                You are about to load{" "}
                <a
                  href="https://huggingface.co/onnx-community/gemma-2-2b-jpn-it"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline"
                >
                  gemma-2-2b-jpn-it
                </a>
                , a 2.61 billion parameter LLM optimized for inference on the web.
              </p>

              {error && (
                <div className="text-red-500 mb-4">
                  <p className="mb-1">Unable to load model:</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <button
                className="border px-4 py-2 rounded-lg bg-blue-400 text-white hover:bg-blue-500 disabled:bg-blue-100 disabled:cursor-not-allowed"
                onClick={() => {
                  worker.current.postMessage({ type: "load" });
                  setStatus("loading");
                }}
                disabled={status !== null || error !== null}
              >
                Load model
              </button>
            </div>
          </div>
        )}

        {status === "loading" && (
          <div className="h-full flex justify-center items-center">
            <div className="w-full max-w-[500px] p-4">
              <p className="text-center mb-4">{loadingMessage}</p>
              {progressItems.map(({ file, progress, total }, i) => (
                <Progress
                  key={i}
                  text={file}
                  percentage={progress}
                  total={total}
                />
              ))}
            </div>
          </div>
        )}

        {status === "ready" && (
          <>
            {activeConversation && (
              <div className="flex-1 overflow-hidden flex flex-col">
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto scrollbar-thin"
                >
                  <Chat messages={messages} selectedModel={selectedModel} onModelChange={handleModelChange} />
                </div>

                <div className="p-4 border-t dark:border-gray-700">
                  <div className="relative max-w-[800px] mx-auto">
                    <textarea
                      ref={textareaRef}
                      className="w-full pr-10 pl-3 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 resize-none"
                      placeholder="メッセージを入力..."
                      value={input}
                      disabled={isRunning}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (input.length > 0 && !isRunning && e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          onEnter(input);
                        }
                      }}
                    />
                    
                    {isRunning ? (
                      <button
                        onClick={onInterrupt}
                        className="absolute right-2 bottom-2 p-1"
                      >
                        <StopIcon className="w-6 h-6 text-gray-500" />
                      </button>
                    ) : (
                      <button
                        onClick={() => input.length > 0 && onEnter(input)}
                        disabled={input.length === 0}
                        className="absolute right-2 bottom-2 p-1"
                      >
                        <ArrowRightIcon className={`w-6 h-6 ${
                          input.length > 0 
                            ? "text-blue-500" 
                            : "text-gray-300"
                        }`} />
                      </button>
                    )}
                  </div>

                  {tps && (
                    <p className="text-center text-sm text-gray-500 mt-2">
                      {!isRunning && `Generated ${numTokens} tokens in ${(numTokens / tps).toFixed(2)} seconds (`}
                      <span className="font-medium">{tps.toFixed(2)}</span> tokens/second
                      {!isRunning && ")"}
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        systemPrompt={systemPrompt}
        onUpdateSystemPrompt={setSystemPrompt}
      />
    </div>
  ) : (
    <div className="fixed inset-0 bg-black bg-opacity-90 text-white text-2xl font-semibold flex justify-center items-center text-center">
      WebGPU is not supported by this browser
    </div>
  );
}

export default App;
