"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Globe,
  Loader2,
  Minimize2,
} from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", label: "മലയാളം (Malayalam)" },
  { code: "mr", label: "मराठी (Marathi)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "gu", label: "ગુજરાતી (Gujarati)" },
];

export function AICopilotModal({ role = "farmer" }: { role?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Array<{ sender: "ai" | "user"; text: string }>>([
    {
      sender: "ai",
      text: "**Hello! I am the PeriX AI Agricultural Advisor.**\n\nI analyze real-time Agmarknet mandi rates, 7-day weather forecasts, and cold-chain sensor data to maximize your profits and prevent spoilage. How can I help you today?",
    },
  ]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const newMessages = [...messages, { sender: "user" as const, text }];
    setMessages(newMessages);
    if (!textToSend) setInputMessage("");
    setLoading(true);

    const res = await apiClient.advisor.chat(text, language, role);
    setMessages([...newMessages, { sender: "ai" as const, text: res.reply }]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 60,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 18px",
          borderRadius: "50px",
          background: "linear-gradient(135deg, var(--primary) 0%, #2E7D32 100%)",
          color: "#fff",
          border: "none",
          boxShadow: "0 8px 24px rgba(46,125,50,0.35)",
          cursor: "pointer",
          fontWeight: "700",
          fontSize: "14px",
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
      >
        <Sparkles size={18} />
        <span>Ask PeriX AI Copilot</span>
      </button>

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div
          className="animate-fade-in"
          style={{
            position: "fixed",
            bottom: "84px",
            right: "24px",
            width: "380px",
            maxWidth: "calc(100vw - 32px)",
            height: "520px",
            maxHeight: "calc(100vh - 120px)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            zIndex: 60,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              background: "var(--primary)",
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Bot size={20} />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: "700", margin: 0 }}>PeriX AI Copilot</h4>
                <p style={{ fontSize: "11px", opacity: 0.9, margin: 0 }}>Live Agmarknet and Waste AI</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  fontSize: "11px",
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "2px 6px",
                }}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} style={{ color: "#000" }}>
                    {l.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsOpen(false)}
                style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Prompts */}
          <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", display: "flex", gap: "6px", overflowX: "auto", background: "var(--surface-hover)" }}>
            <button
              onClick={() => handleSendMessage("What is the best time to harvest my tomato crop?")}
              style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "12px", background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Harvest Timing?
            </button>
            <button
              onClick={() => handleSendMessage("Which mandi has the highest price right now?")}
              style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "12px", background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Mandi Arbitrage?
            </button>
            <button
              onClick={() => handleSendMessage("How do I prevent post-harvest spoilage?")}
              style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "12px", background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Prevent Spoilage?
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: "14px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: "8px",
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "88%",
                }}
              >
                {m.sender === "ai" && (
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--primary)15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Bot size={14} color="var(--primary)" />
                  </div>
                )}
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    lineHeight: "1.4",
                    background: m.sender === "user" ? "var(--primary)" : "var(--surface-hover)",
                    color: m.sender === "user" ? "#fff" : "var(--text-primary)",
                    whiteSpace: "pre-line",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-tertiary)" }}>
                <Loader2 size={14} className="animate-spin" />
                PeriX AI is thinking...
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", display: "flex", gap: "8px" }}>
            <input
              type="text"
              className="input"
              placeholder="Ask anything about prices, harvest, weather..."
              style={{ fontSize: "12px", height: "36px", flex: 1 }}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              className="btn btn-primary btn-icon"
              style={{ width: "36px", height: "36px", borderRadius: "8px" }}
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMessage.trim()}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
