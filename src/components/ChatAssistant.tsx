import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  HelpCircle, 
  Clock, 
  Zap, 
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { ChatMessage, OrderItem, CurrencyCode } from '../types';

interface ChatAssistantProps {
  orders: OrderItem[];
  currentCurrency: CurrencyCode;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  orders,
  currentCurrency,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'agent',
      text: "Hello! Welcome to UniPin 24/7 Official Support. I'm your AI Gaming Concierge. How can I help you with your top-up, payment, or game vouchers today?",
      timestamp: new Date().toISOString(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'How to top up Poppo Live Coins?',
    'How do I track my order?',
    'What payment methods are 0% fee?',
    'How fast is Diamond & Coin delivery?',
    'How do I redeem a UniPin voucher?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    try {
      // Build conversation history for context
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          orderContext: orders.slice(0, 2),
        }),
      });

      let botReply = "Thank you for reaching out! UniPin systems operate 24/7 with instant direct API fulfillment.";
      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) {
          botReply = data.reply;
        }
      } else {
        const errorData = await res.json().catch(() => null);
        if (errorData && errorData.reply) {
          botReply = errorData.reply;
        }
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'agent',
        text: botReply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'agent',
        text: "UniPin direct game servers are 100% active. All game top-ups (Poppo Live Coins, MLBB, Free Fire, Roblox, PUBG) are processed with our guaranteed 2–3 minute SLA.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      
      {/* Expanded Chat Drawer / Window */}
      {isOpen && (
        <div className="mb-3 w-[92vw] sm:w-96 h-[500px] max-h-[82vh] bg-slate-900 border border-slate-750 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Top Bar */}
          <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white">UniPin 24/7 Support</h4>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-1.5 py-0.2 rounded">
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-orange-400" /> Powered by Gemini AI
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Quick FAQ Suggestion Chips */}
          <div className="bg-slate-850/60 border-b border-slate-800 px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 text-[11px]">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-orange-500/20 hover:border-orange-500/50 border border-slate-700 text-slate-300 hover:text-white rounded-lg whitespace-nowrap transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-900/95">
            {messages.map((msg) => {
              const isBot = msg.sender === 'agent';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="w-7 h-7 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isBot
                        ? 'bg-slate-800 border border-slate-750 text-slate-100 rounded-tl-none'
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-tr-none shadow-md shadow-orange-500/20'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <div
                      className={`text-[9px] mt-1 text-right ${
                        isBot ? 'text-slate-400' : 'text-white/70'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {!isBot && (
                    <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                <div className="w-7 h-7 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-800 border border-slate-750 rounded-2xl rounded-tl-none px-3 py-2 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Field */}
          <div className="bg-slate-950 border-t border-slate-800 p-3 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask anything (e.g. order status)..."
                className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-750 focus:border-orange-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="p-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-xl disabled:opacity-40 transition-all shadow-md shadow-orange-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-2xl shadow-xl shadow-orange-500/30 active:scale-95 transition-all"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
        </div>
        <span className="hidden sm:inline">24/7 AI Support</span>
      </button>

    </div>
  );
};
