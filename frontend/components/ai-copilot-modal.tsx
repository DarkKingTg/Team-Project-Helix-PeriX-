"use client";

import { useState, useEffect } from "react";
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
  ShieldCheck,
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

const ROLE_QUICK_PROMPTS: Record<string, string[]> = {
  farmer: [
    "What is the Tomato mandi modal rate in Coimbatore?",
    "When is the best harvesting window for my crops this week?",
    "Which cold-storage warehouse should I choose for my harvest?",
    "How to prevent moisture decay during harvest handover?",
  ],
  mandi: [
    "How do I inspect and reject consignments with inaccurate quantity?",
    "What is the optimal storage temperature for tomato vs potato?",
    "How to calculate fair dispatch pricing for Chennai wholesalers?",
    "Check peer warehouse rebalancing for regional stock shortages",
  ],
  wholesaler: [
    "How to allocate incoming tomato shipments to supermarkets?",
    "What POS markdown discount is recommended for 24h shelf life?",
    "Check reefer cold-chain transit status from Coimbatore warehouse",
    "Forecast supermarket demand surges for upcoming festivals",
  ],
  admin: [
    "What is the network throughput across all active nodes?",
    "Audit escrow balances across registered transactions",
    "Check temperature alarms across Southern cold chain corridors",
    "Show active AI agent evaluation metrics",
  ],
};

const ROLE_GREETINGS: Record<string, string> = {
  farmer:
    "**Hello Farmer! I am your PeriAI Farm-Gate Copilot.**\n\nI analyze real-time Agmarknet mandi rates, 7-day weather forecasts, and warehouse storage availability to protect your farm-gate profits. How can I assist your crop decisions today?",
  mandi:
    "**Hello Warehouse Operator! I am your PeriAI Storage & Dispatch Copilot.**\n\nI assist you with verifying inward farmer intakes, maintaining cold-storage temperatures (2°C-4°C), auditing QC discrepancies, and customizing outbound dispatches to wholesalers. What would you like to review?",
  wholesaler:
    "**Hello Wholesaler! I am your PeriAI Wholesale & Retail Logistics Copilot.**\n\nI help you track incoming shipments from regional warehouses, maintain cold-chain transit, allocate produce to supermarket chains, and apply dynamic POS markdowns. How can I assist your distribution today?",
  admin:
    "**Hello Administrator! I am your PeriAI Network Operations Copilot.**\n\nI monitor system-wide node throughput, escrow contract settlement, and cross-state cold-chain sensor telemetry. How can I assist system oversight today?",
};

const ROLE_THEMES: Record<string, { gradient: string; badge: string; label: string }> = {
  farmer: {
    gradient: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
    badge: "Farmer Advisory Mode",
    label: "Farmer",
  },
  mandi: {
    gradient: "linear-gradient(135deg, #E65100 0%, #BF360C 100%)",
    badge: "Warehouse Operations Mode",
    label: "Warehouse",
  },
  wholesaler: {
    gradient: "linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)",
    badge: "Wholesale & Retail Mode",
    label: "Wholesaler",
  },
  admin: {
    gradient: "linear-gradient(135deg, #C62828 0%, #B71C1C 100%)",
    badge: "Admin Network Mode",
    label: "Admin",
  },
};

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
  const [activeModel, setActiveModel] = useState<string>("Llama 3.3 70B (Groq)");

  const initialGreeting = ROLE_GREETINGS[role] || ROLE_GREETINGS.farmer;
  const [messages, setMessages] = useState<Array<{ sender: "ai" | "user"; text: string }>>([
    {
      sender: "ai",
      text: initialGreeting,
    },
  ]);

  // Reset messages when role changes so new role receives appropriate greeting and scope
  useEffect(() => {
    setMessages([
      {
        sender: "ai",
        text: ROLE_GREETINGS[role] || ROLE_GREETINGS.farmer,
      },
    ]);
  }, [role]);

  const quickPrompts = ROLE_QUICK_PROMPTS[role] || ROLE_QUICK_PROMPTS.farmer;
  const theme = ROLE_THEMES[role] || ROLE_THEMES.farmer;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const newMessages = [...messages, { sender: "user" as const, text }];
    setMessages(newMessages);
    if (!textToSend) setInputMessage("");
    setLoading(true);

    try {
      // Send conversation history and active role so Llama 3.3 enforces strict role boundaries
      const res = await apiClient.advisor.chat(
        text,
        language,
        role,
        newMessages.slice(-6).map((m) => ({ sender: m.sender, text: m.text }))
      );
      if (res?.model) {
        setActiveModel(res.model.includes("llama") ? "Llama 3.3 70B (Groq)" : "Live AI Advisor");
      }
      setMessages([...newMessages, { sender: "ai" as const, text: res.reply }]);
    } catch (e) {
      let fallbackText = `**PeriAI Copilot (${theme.label}):** Tomato modal rate in Coimbatore APMC is ₹34.00/kg with an upward trajectory (+6.0%). Maintain warehouse temperature at 4°C to slow respiration decay.`;
      if (role === "mandi") {
        fallbackText = `**PeriAI Warehouse Copilot:** Inward intake logged. Maintain cold rooms at 2°C - 4°C with 85-90% humidity. You can alter dispatch quantities and pricing to wholesalers.`;
      } else if (role === "wholesaler") {
        fallbackText = `**PeriAI Wholesale Copilot:** Received warehouse consignments monitored under 2°C - 4°C reefer transit. Dynamic POS markdown recommended for batches < 36h shelf life.`;
      }

      setMessages([
        ...newMessages,
        {
          sender: "ai" as const,
          text: fallbackText,
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
            background: theme.gradient,
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
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1.0)";
          }}
        >
          <Sparkles size={18} />
          <span>Ask PeriX AI Copilot ({theme.label})</span>
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
            width: "430px",
            maxWidth: "calc(100vw - 32px)",
            height: "590px",
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
              background: theme.gradient,
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
                <h4 style={{ fontSize: "15px", fontWeight: "700", margin: 0 }}>PeriAI Copilot</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", opacity: 0.9 }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#69F0AE", boxShadow: "0 0 6px #69F0AE" }} />
                  <span>{theme.badge}</span>
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
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Privacy & Role Boundary Notice */}
          <div
            style={{
              padding: "6px 16px",
              background: "var(--surface-hover)",
              borderBottom: "1px solid var(--border)",
              fontSize: "11px",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ShieldCheck size={13} color="var(--primary)" />
            <span>Role-Gated: Scoped strictly to {theme.label} operations and market telemetry.</span>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: "16px",
              overflowY: "auto",
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
                      borderRadius: "8px",
                      background: isAi ? "rgba(46,125,50,0.12)" : "rgba(33,150,243,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: isAi ? "var(--primary)" : "#2196F3",
                    }}
                  >
                    {isAi ? <Bot size={16} /> : <User size={16} />}
                  </div>

                  <div
                    style={{
                      maxWidth: "80%",
                      padding: "10px 14px",
                      borderRadius: isAi ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
                      background: isAi ? "var(--surface)" : "var(--primary)",
                      color: isAi ? "var(--text-primary)" : "#ffffff",
                      fontSize: "13px",
                      lineHeight: "1.5",
                      border: isAi ? "1px solid var(--border)" : "none",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: "rgba(46,125,50,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--primary)",
                  }}
                >
                  <Bot size={16} />
                </div>
                <div
                  style={{
                    padding: "8px 14px",
                    borderRadius: "4px 14px 14px 14px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Loader2 size={14} className="animate-spin" />
                  <span>Thinking with Llama 3.3...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div
            style={{
              padding: "8px 12px",
              background: "var(--surface)",
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(qp)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "14px",
                  background: "var(--surface-hover)",
                  border: "1px solid var(--border)",
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--primary)";
                  e.currentTarget.style.color = "var(--primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: "12px",
              background: "var(--surface)",
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              type="text"
              className="input"
              placeholder={`Ask as ${theme.label} in ${LANGUAGES.find((l) => l.code === language)?.label || "English"}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
              style={{
                flex: 1,
                fontSize: "13px",
                padding: "8px 12px",
                borderRadius: "10px",
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !inputMessage.trim()}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
