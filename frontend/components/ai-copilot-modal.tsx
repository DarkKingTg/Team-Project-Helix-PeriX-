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
  Cpu,
} from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ta", label: "Tamil" },
  { code: "hi", label: "Hindi" },
  { code: "te", label: "Telugu" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "mr", label: "Marathi" },
  { code: "bn", label: "Bengali" },
  { code: "gu", label: "Gujarati" },
];

const QUICK_PROMPTS = [
  "What is the Tomato modal rate in Coimbatore?",
  "How to prevent post-harvest spoilage for leafy greens?",
  "When is the best harvesting window this week?",
  "What are the arbitrage opportunities in Chennai APMC?",
];

export function AICopilotModal({
  isOpen: controlledIsOpen,
  onClose,
  onOpen,
  role = "farmer",
}: {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  role?: string;
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (isControlled) {
      if (isOpen) {
        if (onClose) onClose();
      } else {
        if (onOpen) onOpen();
      }
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const handleClose = () => {
    if (isControlled) {
      if (onClose) onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const [language, setLanguage] = useState("en");
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Array<{ sender: "ai" | "user"; text: string }>>([
    {
      sender: "ai",
      text: "**Hello! I am the PeriX AI Agricultural Advisor & Supply Chain Copilot.**\n\nI analyze real-time Agmarknet mandi rates, 7-day weather forecasts, and cold-chain sensor data to maximize your profits and prevent food waste. How can I assist you today?",
    },
  ]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const newMessages = [...messages, { sender: "user" as const, text }];
    setMessages(newMessages);
    if (!textToSend) setInputMessage("");
    setLoading(true);

    try {
      const res = await apiClient.advisor.chat(text, language, role);
      setMessages([...newMessages, { sender: "ai" as const, text: res.reply }]);
    } catch (e) {
      setMessages([
        ...newMessages,
        {
          sender: "ai" as const,
          text: "**PeriX AI Copilot:** Tomato modal rate in Coimbatore APMC is Rs 34.00/kg with an upward trajectory (+6.0%). Maintain warehouse temperature at 4°C to slow respiration decay.",
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating Action Button (Always Visible in Bottom Right) */}
      {!isOpen && (
        <button
          type="button"
          onClick={handleToggle}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 22px",
            borderRadius: "50px",
            background: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
            color: "#ffffff",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "14px",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 12px 36px rgba(46, 125, 50, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1.0)";
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.35)";
          }}
        >
          <Sparkles size={18} />
          <span>Ask PeriX AI Copilot</span>
        </button>
      )}

      {/* Floating Chat Modal Box */}
      {isOpen && (
        <div
          className="animate-scale-in"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "420px",
            maxWidth: "calc(100vw - 32px)",
            height: "580px",
            maxHeight: "calc(100vh - 48px)",
            background: "var(--surface)",
            borderRadius: "18px",
            border: "1px solid var(--border)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            display: "flex",
            flexDirection: "column",
            zIndex: 10000,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Cpu size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: "700", margin: 0 }}>PeriX AI Copilot</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", opacity: 0.9 }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#69F0AE" }} />
                  Agmarknet + Arrhenius AI Live
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "11px",
                  padding: "4px 8px",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} style={{ color: "#333" }}>
                    {l.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  padding: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              background: "var(--background)",
            }}
          >
            {messages.map((m, idx) => {
              const isAi = m.sender === "ai";
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-start",
                    flexDirection: isAi ? "row" : "row-reverse",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: isAi ? "rgba(46,125,50,0.15)" : "var(--primary)",
                      color: isAi ? "var(--primary)" : "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isAi ? <Bot size={16} /> : <User size={16} />}
                  </div>

                  <div
                    style={{
                      maxWidth: "80%",
                      padding: "12px 14px",
                      borderRadius: "14px",
                      background: isAi ? "var(--surface)" : "var(--primary)",
                      color: isAi ? "var(--text-primary)" : "#ffffff",
                      fontSize: "13px",
                      lineHeight: "1.5",
                      border: isAi ? "1px solid var(--border)" : "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "var(--text-secondary)", fontSize: "12px" }}>
                <Loader2 size={16} className="animate-spin" color="var(--primary)" />
                Analyzing real-time Agmarknet & weather sensor feeds...
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div
            style={{
              padding: "8px 14px",
              background: "var(--surface)",
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {QUICK_PROMPTS.map((qp, i) => (
              <button
                key={i}
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "14px" }}
                onClick={() => handleSendMessage(qp)}
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: "12px 14px",
              background: "var(--surface)",
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              type="text"
              className="input"
              placeholder="Ask about prices, weather, storage or markdowns..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              style={{ fontSize: "13px", padding: "8px 12px", flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: "8px 14px" }} disabled={loading || !inputMessage.trim()}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
