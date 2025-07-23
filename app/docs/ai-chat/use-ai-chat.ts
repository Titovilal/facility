import OpenAI from "openai";
import { JSX, useEffect, useRef, useState } from "react";
import { decrypt, encrypt } from "./encryption-utils";

// Define types for messages and document sections
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type DocSection = {
  id: string;
  name: string;
  icon: JSX.Element;
  color: string;
};

// New type for model information
type Model = {
  id: string;
  name: string;
  inputPrice: number; // Price per million tokens for input
  outputPrice: number; // Price per million tokens for output
  isCustom?: boolean;
};

// LocalStorage keys
const API_KEY_STORAGE_KEY = "terturions_openrouter_api_key";
const CUSTOM_MODELS_STORAGE_KEY = "terturions_custom_models";
const SELECTED_MODEL_STORAGE_KEY = "terturions_selected_model";

// Predefined models
const DEFAULT_MODELS: Model[] = [
  {
    id: "deepseek/deepseek-chat-v3-0324:free",
    name: "DeepSeek V3 Free",
    inputPrice: 0,
    outputPrice: 0,
  },
  {
    id: "google/gemini-2.5-flash-preview-05-20",
    name: "Gemini Flash 2.5",
    inputPrice: 0.15,
    outputPrice: 0.6,
  },
  {
    id: "google/gemini-2.5-flash-preview-05-20",
    name: "Gemini Flash 2.5",
    inputPrice: 0.15,
    outputPrice: 0.6,
  },
  { id: "openai/o4-mini", name: "O4 Mini", inputPrice: 1.1, outputPrice: 4.4 },
];

export function useAIChat() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false); // Changed to false initially
  const [showStorageNotice, setShowStorageNotice] = useState(false);
  const [rememberApiKey, setRememberApiKey] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true); // New state for tracking initialization

  // Chat state management
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Document attachment state
  const [attachedDocs, setAttachedDocs] = useState<DocSection[]>([]);

  // Model selection state
  const [availableModels, setAvailableModels] = useState<Model[]>(DEFAULT_MODELS);
  const [selectedModel, setSelectedModel] = useState<Model>(DEFAULT_MODELS[0]);
  const [customModelName, setCustomModelName] = useState("");
  const [customModelId, setCustomModelId] = useState("");
  const [customModelInputPrice, setCustomModelInputPrice] = useState<number>(0);
  const [customModelOutputPrice, setCustomModelOutputPrice] = useState<number>(0);
  const [showAddModelForm, setShowAddModelForm] = useState(false);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);

  // Create OpenAI client configured for OpenRouter
  const openai = useRef<OpenAI | null>(null);

  // --- Mejoras para el Streaming Fluido ---
  const animationFrameId = useRef<number | null>(null);
  const streamBuffer = useRef("");
  const isStreamFinished = useRef(true);
  // --- Fin de las Mejoras ---

  useEffect(() => {
    // Try to load API key from localStorage on component mount
    if (typeof window !== "undefined") {
      setIsInitializing(true); // Start initialization

      const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      if (storedApiKey) {
        const decryptedApiKey = decrypt(storedApiKey);
        if (decryptedApiKey) {
          setApiKey(decryptedApiKey);
          setShowApiKeyInput(false);
        } else {
          setShowApiKeyInput(true);
        }
      } else if (!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
        // Only show API key input if no key is found in localStorage and no env key exists
        setShowApiKeyInput(true);
      }

      // Load custom models from localStorage
      const storedCustomModels = localStorage.getItem(CUSTOM_MODELS_STORAGE_KEY);
      if (storedCustomModels) {
        try {
          const customModels = JSON.parse(storedCustomModels) as Model[];
          setAvailableModels([...DEFAULT_MODELS, ...customModels]);
        } catch (error) {
          console.error("Error parsing custom models:", error);
        }
      }

      // Load selected model from localStorage
      const storedSelectedModelId = localStorage.getItem(SELECTED_MODEL_STORAGE_KEY);
      if (storedSelectedModelId) {
        const combinedModels = [...DEFAULT_MODELS];
        if (storedCustomModels) {
          try {
            const customModels = JSON.parse(storedCustomModels) as Model[];
            combinedModels.push(...customModels);
          } catch (error) {
            console.error("Error parsing custom models for selection:", error);
          }
        }

        const foundModel = combinedModels.find((model) => model.id === storedSelectedModelId);
        if (foundModel) {
          setSelectedModel(foundModel);
        }
      }

      setIsInitializing(false); // End initialization
    }

    // Cleanup animation frame on unmount
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  useEffect(() => {
    // Initialize OpenAI client when API key is available
    if (apiKey || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
      openai.current = new OpenAI({
        dangerouslyAllowBrowser: true,
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: apiKey || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "",
        defaultHeaders: {
          "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
          "X-Title": "Terturions AI Chat",
        },
      });
    }
  }, [apiKey]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // The animation loop function to render text character by character
  const animationLoop = (assistantMessageId: string) => {
    // Check if there's content in the buffer to render
    if (streamBuffer.current.length > 0) {
      const charsToRender = Math.min(2, streamBuffer.current.length); // Render up to 2 chars per frame for speed
      const nextChars = streamBuffer.current.slice(0, charsToRender);
      streamBuffer.current = streamBuffer.current.slice(charsToRender);

      // Update the state by appending the next characters
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, content: msg.content + nextChars } : msg
        )
      );
    }

    // If the stream is done and the buffer is empty, stop the loop.
    if (isStreamFinished.current && streamBuffer.current.length === 0) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      return;
    }

    // Otherwise, request the next frame.
    animationFrameId.current = requestAnimationFrame(() => animationLoop(assistantMessageId));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!input.trim() || isLoading || !openai.current) return;

    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Create assistant message with empty content to start
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage = {
      id: assistantMessageId,
      role: "assistant" as const,
      content: "",
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Reset stream state and start the animation loop
    streamBuffer.current = "";
    isStreamFinished.current = false;
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    animationFrameId.current = requestAnimationFrame(() => animationLoop(assistantMessageId));

    try {
      // Format messages for API
      const apiMessages = [
        {
          role: "system",
          content:
            "You are a helpful assistant who provides information about the Terturions template. Keep answers concise and relevant.",
        },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: userMessage.role, content: userMessage.content },
      ];

      const stream = await openai.current.chat.completions.create({
        model: selectedModel.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages: apiMessages as any[],
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      });

      // Process the streaming response by adding chunks to the buffer
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          streamBuffer.current += content;
        }
      }
    } catch (error) {
      console.error("Error generating response:", error);
      streamBuffer.current += "Sorry, there was an error generating a response. Please try again.";
    } finally {
      // Signal that the stream has finished
      isStreamFinished.current = true;
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Add a function to clear all chat messages
  const clearChat = () => {
    setMessages([]);
  };

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      if (rememberApiKey && typeof window !== "undefined") {
        const encryptedApiKey = encrypt(apiKey);
        localStorage.setItem(API_KEY_STORAGE_KEY, encryptedApiKey);
      }
      setShowApiKeyInput(false);
    }
  };

  const toggleRememberApiKey = () => {
    setRememberApiKey((prev) => !prev);
  };

  const clearStoredApiKey = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
    setApiKey("");
    setShowApiKeyInput(true);
  };

  const handleAttachDoc = (doc: DocSection) => {
    if (attachedDocs.find((item) => item.id === doc.id)) {
      setAttachedDocs((prev) => prev.filter((item) => item.id !== doc.id));
    } else {
      setAttachedDocs((prev) => [...prev, doc]);
    }
  };

  // Model selection handlers
  const handleModelSelect = (modelId: string) => {
    const model = availableModels.find((m) => m.id === modelId);
    if (model) {
      setSelectedModel(model);
      if (typeof window !== "undefined") {
        localStorage.setItem(SELECTED_MODEL_STORAGE_KEY, model.id);
      }
    }
  };

  const handleAddCustomModel = () => {
    if (!customModelName.trim() || !customModelId.trim()) return;

    const newModel: Model = {
      id: customModelId.trim(),
      name: customModelName.trim(),
      inputPrice: customModelInputPrice,
      outputPrice: customModelOutputPrice,
      isCustom: true,
    };

    if (editingModelId) {
      // Update existing model
      const updatedModels = availableModels.map((model) =>
        model.id === editingModelId ? newModel : model
      );
      setAvailableModels(updatedModels);
    } else {
      // Add new model
      setAvailableModels((prev) => [...prev, newModel]);
    }

    // Save to localStorage
    if (typeof window !== "undefined") {
      const customModels = availableModels
        .filter((model) => model.isCustom)
        .map((model) => (model.id === editingModelId ? newModel : model));

      if (!editingModelId) {
        customModels.push(newModel);
      }

      localStorage.setItem(CUSTOM_MODELS_STORAGE_KEY, JSON.stringify(customModels));
    }

    // Reset form
    setCustomModelName("");
    setCustomModelId("");
    setCustomModelInputPrice(0);
    setCustomModelOutputPrice(0);
    setShowAddModelForm(false);
    setEditingModelId(null);
  };

  const handleEditCustomModel = (model: Model) => {
    setCustomModelName(model.name);
    setCustomModelId(model.id);
    setCustomModelInputPrice(model.inputPrice);
    setCustomModelOutputPrice(model.outputPrice);
    setEditingModelId(model.id);
    setShowAddModelForm(true);
  };

  const handleDeleteCustomModel = (modelId: string) => {
    const updatedModels = availableModels.filter((model) => model.id !== modelId);
    setAvailableModels(updatedModels);

    // If the deleted model was selected, select the first available model
    if (selectedModel.id === modelId) {
      setSelectedModel(updatedModels[0]);
      if (typeof window !== "undefined") {
        localStorage.setItem(SELECTED_MODEL_STORAGE_KEY, updatedModels[0].id);
      }
    }

    // Update localStorage
    if (typeof window !== "undefined") {
      const customModels = updatedModels.filter((model) => model.isCustom);
      localStorage.setItem(CUSTOM_MODELS_STORAGE_KEY, JSON.stringify(customModels));
    }
  };

  const cancelAddCustomModel = () => {
    setCustomModelName("");
    setCustomModelId("");
    setCustomModelInputPrice(0);
    setCustomModelOutputPrice(0);
    setShowAddModelForm(false);
    setEditingModelId(null);
  };

  return {
    apiKey,
    setApiKey,
    showApiKeyInput,
    setShowApiKeyInput,
    showStorageNotice,
    setShowStorageNotice,
    rememberApiKey,
    toggleRememberApiKey,
    clearStoredApiKey,
    messages,
    input,
    isLoading,
    isInitializing,
    attachedDocs,
    handleInputChange,
    handleSubmit,
    handleKeyDown,
    handleApiKeySubmit,
    handleAttachDoc,
    clearChat, // Add the clearChat function to the return object
    // Model selection related
    availableModels,
    selectedModel,
    handleModelSelect,
    showAddModelForm,
    setShowAddModelForm,
    customModelName,
    setCustomModelName,
    customModelId,
    setCustomModelId,
    customModelInputPrice,
    setCustomModelInputPrice,
    customModelOutputPrice,
    setCustomModelOutputPrice,
    handleAddCustomModel,
    handleEditCustomModel,
    handleDeleteCustomModel,
    cancelAddCustomModel,
    editingModelId,
  };
}
