import React, { useState, useRef, useEffect } from "react";
import { CaseReport, CrossExamMessage } from "../types";
import { Send, Sparkles, Scale, AlertCircle, Loader2 } from "lucide-react";
import { playTypewriterClack, playGavel } from "../utils/audio";

interface CrossExaminationProps {
  report: CaseReport;
}

const PRESET_OBJECTIONS = [
  "How is looking this good against the law?",
  "I was only squinting because the light was too bright!",
  "Wait a minute, you're a goose! Can you even be a real lawyer?",
  "Can you drop the charges if I give you some breadcrumbs?",
  "Since when is a small smile forbidden by law?",
];

export const CrossExamination: React.FC<CrossExaminationProps> = ({ report }) => {
  const [messages, setMessages] = useState<CrossExamMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const scrollBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript when new tokens arrive
  useEffect(() => {
    scrollBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Initial greeting from Goose Lawyer when opened
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-1",
          role: "lawyer",
          content: `State your argument, human! But be warned: questioning my legal skills will only make you look more guilty in this court!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [report.case_number]);

  const handleSend = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isStreaming) return;

    setErrorNotice(null);
    setInputQuestion("");
    playGavel();

    const userMsgId = `user-${Date.now()}`;
    const lawyerMsgId = `lawyer-${Date.now()}`;

    const userMessage: CrossExamMessage = {
      id: userMsgId,
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const initialLawyerMessage: CrossExamMessage = {
      id: lawyerMsgId,
      role: "lawyer",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Update state with user message and empty lawyer message
    setMessages((prev) => [...prev, userMessage, initialLawyerMessage]);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/cross-examine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          caseReport: report,
          chatHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Goose lawyer refused to speak.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let tokenCounter = 0;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        tokenCounter++;

        if (tokenCounter % 2 === 0) {
          playTypewriterClack();
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === lawyerMsgId ? { ...msg, content: accumulatedText } : msg
          )
        );
      }
    } catch (err) {
      console.error("Cross exam stream error:", err);
      setErrorNotice(
        "HONK! The goose lawyer flew off to the pond for a moment. Please try asking again."
      );
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === lawyerMsgId
            ? {
                ...msg,
                content:
                  "*HONK!* [Flaps wings loudly and demands a short snack break before replying.]",
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handlePresetClick = (preset: string) => {
    handleSend(preset);
  };

  return (
    <section
      id="cross-examination-section"
      className="mt-6 bg-[#E3D7B8] border-2 border-[#1C1A15] p-5 sm:p-7 shadow-lg relative"
    >
      {/* Header */}
      <div className="border-b border-[#1C1A15]/20 pb-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#A5321F]" />
          <h3 className="font-serif-heading font-black text-lg sm:text-xl text-[#26402F] m-0">
            Argue with {report.lawyer_name}
          </h3>
        </div>
        <span className="text-[10px] font-mono-legal bg-[#1C1A15] text-[#EFE6D2] px-2 py-0.5 uppercase tracking-wider font-bold">
          LIVE CHAT
        </span>
      </div>

      <p className="text-xs font-mono-legal text-[#6b6553] italic mb-3.5">
        Think you&apos;re innocent? Argue with the goose lawyer and hear what he has to say back!
      </p>

      {/* Suggested Objections */}
      <div className="mb-4">
        <span className="text-[11px] font-mono-legal font-bold text-[#A5321F] uppercase tracking-wider block mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#D9A441]" />
          Quick Things to Say:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_OBJECTIONS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetClick(preset)}
              disabled={isStreaming}
              className="text-[11px] font-mono-legal text-[#1C1A15] bg-white/70 hover:bg-white disabled:opacity-50 border border-[#1C1A15]/25 px-2.5 py-1 text-left transition-all hover:border-[#A5321F] cursor-pointer"
            >
              &ldquo;{preset}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Stenographer's Transcript Box */}
      <div className="bg-[#EFE6D2] border border-[#1C1A15]/30 p-4 max-h-[360px] overflow-y-auto space-y-4 mb-4 shadow-inner">
        <div className="text-[10px] font-mono-legal text-center text-[#6b6553] uppercase tracking-widest border-b border-[#1C1A15]/15 pb-1">
          --- LIVE COURT CHAT RECORD ---
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`font-mono-legal text-xs sm:text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-white/60 border-l-3 border-[#A5321F] p-2.5"
                : "bg-[#E3D7B8]/70 border-l-3 border-[#26402F] p-2.5"
            }`}
          >
            <div className="flex items-baseline justify-between mb-1">
              <span
                className={`font-bold text-[11px] uppercase tracking-wider ${
                  msg.role === "user" ? "text-[#A5321F]" : "text-[#26402F]"
                }`}
              >
                {msg.role === "user" ? "[YOU]" : `[GOOSE LAWYER: ${report.lawyer_name.toUpperCase()}]`}
              </span>
              <span className="text-[10px] text-[#6b6553]">{msg.timestamp}</span>
            </div>
            <div className="text-[#1C1A15] whitespace-pre-wrap">
              {msg.content}
              {msg.role === "lawyer" && isStreaming && msg.content === "" && (
                <span className="italic text-[#6b6553] flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Goose lawyer is thinking of a reply...
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={scrollBottomRef} />
      </div>

      {errorNotice && (
        <div className="text-xs font-mono-legal text-[#A5321F] bg-[#A5321F]/10 p-2 border border-[#A5321F]/30 mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputQuestion);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder="Type your question or argue back..."
          disabled={isStreaming}
          className="flex-1 bg-white border border-[#1C1A15]/40 px-3 py-2.5 font-mono-legal text-xs sm:text-sm text-[#1C1A15] placeholder:text-[#6b6553]/70 focus:outline-none focus:border-[#26402F] focus:ring-1 focus:ring-[#26402F]"
        />
        <button
          type="submit"
          disabled={!inputQuestion.trim() || isStreaming}
          className="bg-[#26402F] hover:bg-[#17281D] disabled:bg-[#b8ab8c] text-[#EFE6D2] px-4 py-2.5 font-mono-legal font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Send Objection</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </section>
  );
};
