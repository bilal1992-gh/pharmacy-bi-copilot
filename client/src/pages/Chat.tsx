import { AppLayout } from "@/components/layout/AppLayout";
import { useState, useRef, useEffect } from "react";
import { useConversations, useCreateConversation, useChatStream, useConversation } from "@/hooks/use-chat";
import { Send, Bot, User, PlusCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Chat() {
  const { data: conversations, isLoading: loadingConvos } = useConversations();
  const createConvoMutation = useCreateConversation();
  
  const [activeConvoId, setActiveConvoId] = useState<number | null>(null);
  
  // Set first conversation as active if none selected
  useEffect(() => {
    if (!activeConvoId && conversations && conversations.length > 0) {
      setActiveConvoId(conversations[0].id);
    }
  }, [conversations, activeConvoId]);

  const { data: activeConvo, isLoading: loadingChat } = useConversation(activeConvoId);
  const { sendMessage, isStreaming, streamingContent } = useChatStream();
  
  const [inputMsg, setInputMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvo?.messages, streamingContent]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || isStreaming) return;
    
    let targetId = activeConvoId;
    
    // Create conversation if none exists
    if (!targetId) {
      try {
        const newConvo = await createConvoMutation.mutateAsync("New Chat");
        targetId = newConvo.id;
        setActiveConvoId(newConvo.id);
      } catch (err) {
        return;
      }
    }

    const content = inputMsg;
    setInputMsg("");
    await sendMessage(targetId!, content);
  };

  const handleNewChat = () => {
    createConvoMutation.mutate("New Analysis Chat", {
      onSuccess: (data) => {
        setActiveConvoId(data.id);
      }
    });
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-120px)] flex gap-6 animate-in fade-in duration-500">
        
        {/* Chat History Sidebar (Internal to page) */}
        <Card className="w-64 flex-none hidden lg:flex flex-col glass-card border-border/50">
          <div className="p-4 border-b border-border/50 flex justify-between items-center bg-white/40 dark:bg-slate-900/40 rounded-t-xl">
            <h3 className="font-display font-semibold text-foreground">Conversations</h3>
            <Button variant="ghost" size="icon" onClick={handleNewChat} disabled={createConvoMutation.isPending} className="h-8 w-8 text-primary hover:bg-primary/10">
              <PlusCircle className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingConvos ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full mb-2" />)
            ) : conversations?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center p-4">No chats yet.</p>
            ) : (
              conversations?.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveConvoId(c.id)}
                  className={`
                    w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3 truncate
                    ${activeConvoId === c.id 
                      ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"}
                  `}
                >
                  <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                  <span className="truncate">{c.title}</span>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col glass-card border-border/50 overflow-hidden relative">
          
          {/* Header */}
          <div className="h-16 border-b border-border/50 flex items-center px-6 bg-white/40 dark:bg-slate-900/40 z-10 backdrop-blur-md">
            <div>
              <h2 className="font-display font-bold text-lg text-foreground">
                {activeConvo ? activeConvo.title : "AI Copilot"}
              </h2>
              <p className="text-xs text-muted-foreground">Ask questions about inventory, sales, and analytics.</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
            {!activeConvoId && !loadingChat ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-2">How can I help today?</h3>
                <p className="text-muted-foreground mb-8">
                  I can analyze your pharmacy's sales data, alert you about low stock, or provide insights into medication trends.
                </p>
                <div className="grid grid-cols-1 gap-2 w-full">
                  <Button variant="outline" className="justify-start h-auto py-3 px-4 text-left" onClick={() => setInputMsg("Show me medications low on stock.")}>
                    "Show me medications low on stock."
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3 px-4 text-left" onClick={() => setInputMsg("What were the total sales this week?")}>
                    "What were the total sales this week?"
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {activeConvo?.messages?.map((msg, i) => (
                  <div key={i} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm
                      ${msg.role === 'user' ? 'bg-gradient-to-tr from-primary to-accent text-white' : 'bg-secondary border border-border'}
                    `}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
                    </div>
                    <div className={`rounded-2xl px-5 py-3.5 shadow-sm
                      ${msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                        : 'bg-white dark:bg-slate-900 border border-border/50 rounded-tl-sm text-foreground prose prose-sm dark:prose-invert max-w-none'
                      }
                    `}>
                      {msg.role === 'user' ? (
                        msg.content
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Streaming Message */}
                {isStreaming && (
                  <div className="flex gap-4 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 shadow-sm">
                      <Bot className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                    <div className="rounded-2xl px-5 py-3.5 bg-white dark:bg-slate-900 border border-border/50 rounded-tl-sm text-foreground shadow-sm min-w-[60px]">
                      {streamingContent ? (
                         <div className="prose prose-sm dark:prose-invert max-w-none">
                           <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
                         </div>
                      ) : (
                        <div className="flex space-x-1.5 h-5 items-center">
                          <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-1" />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-t border-border/50 z-10">
            <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex items-center">
              <Input 
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Message Copilot..." 
                className="pr-12 py-6 rounded-2xl bg-background border-border/50 focus-visible:ring-primary/30 text-base shadow-inner"
                disabled={isStreaming}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!inputMsg.trim() || isStreaming}
                className="absolute right-2 h-9 w-9 rounded-xl bg-primary text-white hover:bg-primary/90 transition-transform active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-center text-[10px] text-muted-foreground mt-2 font-medium">
              AI Copilot can make mistakes. Verify important business data.
            </p>
          </div>

        </Card>
      </div>
    </AppLayout>
  );
}
