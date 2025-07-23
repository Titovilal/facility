"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  CreditCard,
  Database,
  Edit,
  Info,
  Lock,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  UnlockIcon,
  WrapText,
} from "lucide-react";
import { useAIChat } from "./use-ai-chat";

export default function AIChatPage() {
  const {
    apiKey,
    setApiKey,
    showApiKeyInput,
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
    clearChat,
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
  } = useAIChat();

  // Available documentation sections
  const docSections = [
    {
      id: "auth",
      name: "Auth Setup",
      icon: <Lock className="h-3.5 w-3.5" />,
      color: "text-green-600",
    },
    {
      id: "database",
      name: "Database",
      icon: <Database className="h-3.5 w-3.5" />,
      color: "text-red-600",
    },
    {
      id: "routes",
      name: "Routes",
      icon: <Lock className="h-3.5 w-3.5" />,
      color: "text-yellow-600",
    },
    {
      id: "tables",
      name: "Tables",
      icon: <Database className="h-3.5 w-3.5" />,
      color: "text-blue-600",
    },
    {
      id: "utils",
      name: "Utils",
      icon: <WrapText className="h-3.5 w-3.5" />,
      color: "text-purple-600",
    },
    {
      id: "stripe",
      name: "Stripe",
      icon: <CreditCard className="h-3.5 w-3.5" />,
      color: "text-green-600",
    },
  ];

  return (
    <div className="container mx-auto flex h-[calc(100vh-2rem)] max-w-4xl flex-col px-4 py-4">
      {isInitializing ? (
        // Show loading indicator while initializing
        <div className="flex h-full items-center justify-center">
          <div className="animate-pulse text-center">
            <p className="text-muted-foreground mb-2">Loading AI Chat...</p>
            <div className="flex justify-center">
              <div className="bg-primary/20 h-2 w-24 rounded"></div>
            </div>
          </div>
        </div>
      ) : showApiKeyInput && !process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ? (
        <div className="bg-background my-auto rounded-lg border p-6 shadow">
          <div className="mb-4">
            <h3 className="text-xl font-medium">Enter your OpenRouter API Key</h3>
          </div>
          <div>
            <p className="mb-4">
              To use the AI chat feature, you need an OpenRouter API key. You can get one at{" "}
              <a
                href="https://openrouter.ai"
                className="text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                openrouter.ai
              </a>
              .
            </p>

            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription className="ml-2">
                If you choose to remember your API key, it will be stored encrypted in your
                browser&apos;s local storage. This is convenient but less secure than entering it
                each time.
              </AlertDescription>
            </Alert>

            <Alert className="mb-4 border-amber-600 bg-amber-500/10 text-amber-600">
              <Info className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <strong>Important Security Notice:</strong> Remember to set a spending limit on your
                OpenRouter API key to protect yourself in case your browser data is compromised. You
                can set limits in your OpenRouter dashboard.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleApiKeySubmit} className="space-y-4">
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your OpenRouter API Key"
                className="flex-1"
                required
              />

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-key"
                  checked={rememberApiKey}
                  onCheckedChange={toggleRememberApiKey}
                />
                <label
                  htmlFor="remember-key"
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember my API key
                </label>
              </div>

              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          {/* Combine title, model selection and API key button in a single row */}
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">AI Chat</h1>
            <div className="flex items-center gap-4">
              {/* Clear chat button at the top */}
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                disabled={messages.length === 0}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Clear Chat
              </Button>
              <Select value={selectedModel.id} onValueChange={handleModelSelect}>
                <SelectTrigger variant="transparent">
                  <SelectValue placeholder="Select a model" />
                  <ChevronDown className="h-4 w-4" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-muted-foreground text-xs whitespace-nowrap">
                <span className="font-bold">Input:</span> ${selectedModel.inputPrice.toFixed(2)}/M |
                <span className="font-bold"> Output:</span> ${selectedModel.outputPrice.toFixed(2)}
                /M
              </div>
              <Button
                variant="outline"
                size="icon"
                className="flex h-8 w-8 items-center justify-center p-0"
                onClick={() => setShowAddModelForm(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              {!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY && (
                <Button variant="outline" size="sm" onClick={clearStoredApiKey}>
                  <UnlockIcon className="mr-1 h-4 w-4" />
                  Clear API Key
                </Button>
              )}
            </div>
          </div>

          <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent mb-4 flex-1 overflow-y-auto pr-1">
            <div className="h-full w-full max-w-[calc(100%-16px)]">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground text-center">
                    Start a conversation with the AI assistant.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 py-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "rounded-lg p-3",
                        message.role === "user"
                          ? "bg-primary/5 mr-1 ml-auto w-fit"
                          : "mr-auto ml-1 max-w-[80%]"
                      )}
                    >
                      <div className="prose flex-1">{message.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-background/95 border-t pt-4 shadow-md">
            <div className="mb-3">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <p className="text-muted-foreground text-xs font-medium">Documentation:</p>

                <div className="flex flex-wrap gap-1.5">
                  {docSections.map((doc) => {
                    const isActive = !!attachedDocs.find((d) => d.id === doc.id);
                    return (
                      <Badge
                        key={doc.id}
                        variant={isActive ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-colors duration-200",
                          isActive ? "bg-primary hover:bg-primary/80" : "hover:bg-accent"
                        )}
                        onClick={() => handleAttachDoc(doc)}
                      >
                        <span className={isActive ? "text-primary-foreground" : doc.color}>
                          {doc.icon}
                        </span>
                        <span
                          className={cn("ml-1.5", isActive ? "text-primary-foreground" : doc.color)}
                        >
                          {doc.name}
                        </span>
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex items-end gap-3">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about Terturions... (Press Enter to send)"
                  className="max-h-[120px] w-full resize-none"
                  disabled={
                    isLoading ||
                    (showApiKeyInput && !apiKey && !process.env.NEXT_PUBLIC_OPENROUTER_API_KEY)
                  }
                />
                <div className="flex flex-col gap-2">
                  {/* Clear chat button next to send */}
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={clearChat}
                    disabled={messages.length === 0}
                    title="Clear chat"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Clear chat</span>
                  </Button>
                  <Button
                    type="submit"
                    size="icon"
                    className={cn(isLoading && "animate-pulse")}
                    disabled={
                      isLoading ||
                      (showApiKeyInput && !apiKey && !process.env.NEXT_PUBLIC_OPENROUTER_API_KEY)
                    }
                  >
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Custom Model Dialog */}
          <Dialog open={showAddModelForm} onOpenChange={setShowAddModelForm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingModelId ? "Edit Custom Model" : "Add Custom Model"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="model-name">Model Name</Label>
                  <Input
                    id="model-name"
                    value={customModelName}
                    onChange={(e) => setCustomModelName(e.target.value)}
                    placeholder="e.g., My Custom GPT-4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model-id">Model ID</Label>
                  <Input
                    id="model-id"
                    value={customModelId}
                    onChange={(e) => setCustomModelId(e.target.value)}
                    placeholder="e.g., openai/gpt-4-turbo"
                  />
                  <p className="text-muted-foreground text-xs">
                    This should be the model ID as required by OpenRouter.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="input-price">Input Price ($/M tokens)</Label>
                    <Input
                      id="input-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={customModelInputPrice}
                      onChange={(e) => setCustomModelInputPrice(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="output-price">Output Price ($/M tokens)</Label>
                    <Input
                      id="output-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={customModelOutputPrice}
                      onChange={(e) => setCustomModelOutputPrice(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={cancelAddCustomModel}>
                  Cancel
                </Button>
                <Button onClick={handleAddCustomModel}>
                  {editingModelId ? "Update" : "Add"} Model
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Custom Models Management */}
          <Dialog>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Manage Custom Models</DialogTitle>
              </DialogHeader>
              <div className="max-h-[60vh] space-y-2 overflow-y-auto">
                {availableModels.filter((model) => model.isCustom).length === 0 ? (
                  <p className="text-muted-foreground py-4 text-center">
                    No custom models yet. Add one to get started.
                  </p>
                ) : (
                  availableModels
                    .filter((model) => model.isCustom)
                    .map((model) => (
                      <div
                        key={model.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div>
                          <p className="font-medium">{model.name}</p>
                          <p className="text-muted-foreground text-xs">{model.id}</p>
                          <p className="text-xs">
                            Input: ${model.inputPrice.toFixed(2)}/M | Output: $
                            {model.outputPrice.toFixed(2)}/M
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCustomModel(model)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCustomModel(model.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
