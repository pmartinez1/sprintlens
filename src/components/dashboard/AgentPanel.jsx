import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, Send, X, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

const AGENT_NAME = 'sprint_analyst';

export default function AgentPanel({ open, onClose }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Start a conversation when panel opens
  useEffect(() => {
    if (!open) return;
    if (conversation) return;
    async function startConversation() {
      const conv = await base44.agents.createConversation({ agent_name: AGENT_NAME });
      setConversation(conv);
      setMessages(conv.messages || []);
    }
    startConversation();
  }, [open]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return unsubscribe;
  }, [conversation?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !conversation || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    await base44.agents.addMessage(conversation, { role: 'user', content: text });
    setSending(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const visibleMessages = messages.filter(m => m.role === 'user' || (m.role === 'assistant' && m.content));

  if (!open) return null;

  return (
    <div className="fixed right-0 top-14 bottom-0 w-96 bg-slate-900 border-l border-slate-800 flex flex-col z-30 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 flex-shrink-0">
        <div className="h-7 w-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <Bot className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Sprint Analyst</p>
          <p className="text-xs text-slate-500">AI-powered sprint insights</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {visibleMessages.length === 0 && !sending && (
          <div className="text-center py-8">
            <Bot className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Ask me about velocity trends, blockers, or phase progress.</p>
            <div className="mt-4 space-y-2">
              {[
                'What are the current blockers?',
                'How is velocity trending?',
                'Which phase has the most unplanned work?',
              ].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors w-full text-left"
                >
                  <ChevronRight className="w-3 h-3 flex-shrink-0" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {visibleMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-200 border border-slate-700'
            }`}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-slate-800">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your sprint data…"
            rows={1}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || sending || !conversation}
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 w-9 flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
        <p className="text-xs text-slate-600 mt-1.5">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}