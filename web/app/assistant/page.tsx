"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Send, Paperclip, User, Loader2, Sparkles } from "lucide-react";
import { initialMessages } from "@/lib/mockData";

const ACCENT = "#1DB954";
const CARD_BG = "#FFFFFF";
const BORDER = "#E5E5E5";
const MUTED = "#888888";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const quickActions = [
  "Analyse ma semaine",
  "Génère un programme",
  "Suggère une recette",
  "Conseils nutrition",
];

function renderMarkdown(text: string) {
  // Tables
  text = text.replace(/\|(.+)\|\n\|[-| ]+\|\n([\s\S]*?)(?=\n\n|\n#|$)/g, (match) => {
    const rows = match.trim().split("\n").filter((r) => r.trim() && !r.match(/^[\s|:-]+$/));
    if (rows.length < 2) return match;
    const headers = rows[0].split("|").filter(Boolean).map((h) => h.trim());
    const body = rows.slice(1);
    return (
      `<table class="w-full text-xs border-collapse my-3">` +
      `<thead><tr>${headers.map((h) => `<th class="text-left px-2 py-1.5 border-b" style="border-color:#E5E5E5;color:#888888">${h}</th>`).join("")}</tr></thead>` +
      `<tbody>${body.map((row) => `<tr>${row.split("|").filter(Boolean).map((c) => `<td class="px-2 py-1 border-b" style="border-color:#E5E5E5;color:#1A1A1A">${c.trim()}</td>`).join("")}</tr>`).join("")}</tbody>` +
      `</table>`
    );
  });
  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
  // Bullet points
  text = text.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc" style="color:#1A1A1A">$1</li>');
  text = text.replace(/(<li.*<\/li>\n?)+/g, '<ul class="space-y-0.5 my-1">$&</ul>');
  // Numbered lists
  text = text.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal" style="color:#1A1A1A">$1</li>');
  // Headers
  text = text.replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold text-gray-900 mt-3 mb-1">$1</h3>');
  text = text.replace(/^## (.+)$/gm, '<h2 class="text-base font-bold text-gray-900 mt-4 mb-1.5">$1</h2>');
  text = text.replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold text-gray-900 mt-4 mb-2">$1</h1>');
  // Line breaks
  text = text.replace(/\n\n/g, '<br/><br/>');
  return text;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || "Désolé, une erreur est survenue." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erreur de connexion. Vérifiez votre clé API dans .env.local" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex flex-col"
      style={{ height: "100vh" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: BORDER, backgroundColor: CARD_BG }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "rgba(29,185,84,0.15)" }}
        >
          <Bot className="w-5 h-5" style={{ color: ACCENT }} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">FitTrack AI</h1>
          <p className="text-xs flex items-center gap-1" style={{ color: ACCENT }}>
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: ACCENT, display: "inline-block" }}
            />
            Coach IA · Powered by Claude
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                backgroundColor:
                  msg.role === "assistant"
                    ? "rgba(29,185,84,0.15)"
                    : "rgba(76,155,232,0.15)",
              }}
            >
              {msg.role === "assistant" ? (
                <Bot className="w-4 h-4" style={{ color: ACCENT }} />
              ) : (
                <User className="w-4 h-4" style={{ color: "#4C9BE8" }} />
              )}
            </div>

            {/* Bubble */}
            <div
              className="max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed"
              style={{
                backgroundColor:
                  msg.role === "assistant" ? "#F5F5F5" : "rgba(76,155,232,0.1)",
                border: `1px solid ${msg.role === "assistant" ? BORDER : "rgba(76,155,232,0.3)"}`,
                color: "#1A1A1A",
              }}
            >
              {msg.role === "assistant" ? (
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(29,185,84,0.15)" }}
            >
              <Bot className="w-4 h-4" style={{ color: ACCENT }} />
            </div>
            <div
              className="rounded-xl px-4 py-3"
              style={{ backgroundColor: "#F5F5F5", border: `1px solid ${BORDER}` }}
            >
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: ACCENT }} />
                <span className="text-sm" style={{ color: MUTED }}>
                  FitTrack AI analyse...
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        className="px-6 pb-6 pt-4 border-t flex-shrink-0"
        style={{ borderColor: BORDER, backgroundColor: "#F5F5F5" }}
      >
        {/* Quick actions */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => sendMessage(action)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50"
              style={{
                backgroundColor: "rgba(29,185,84,0.1)",
                border: `1px solid rgba(29,185,84,0.3)`,
                color: ACCENT,
              }}
            >
              <Sparkles className="w-3 h-3" />
              {action}
            </button>
          ))}
        </div>

        {/* Text input */}
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}
        >
          <button className="hover:opacity-70 transition-opacity">
            <Paperclip className="w-4 h-4" style={{ color: MUTED }} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Pose une question à ton coach IA..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            style={{ color: "#1A1A1A" }}
            disabled={loading}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            size="sm"
            className="h-8 px-3"
            style={{
              backgroundColor: input.trim() && !loading ? ACCENT : "#E5E5E5",
              color: input.trim() && !loading ? "#FFFFFF" : MUTED,
            }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: MUTED }}>
          Propulsé par Claude Sonnet 4.6 · Les réponses sont basées sur vos données d&apos;entraînement
        </p>
      </div>
    </div>
  );
}
