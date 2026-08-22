"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { CLINIC } from "@/lib/agent/clinic";
import {
  isValidFullName,
  normalizePakistaniPhone,
  isValidPreferred,
  isValidTreatment,
} from "@/lib/agent/validate";

type Step = "idle" | "name" | "phone" | "preferred" | "treatment" | "done";

type Message = {
  id: number;
  role: "agent" | "user";
  text: string;
};

const WELCOME =
  `Assalam o Alaikum! Welcome to ${CLINIC.name}.\n\nI can help with our hours, location, services, or request an appointment for you.\n\nHow can I help today?`;

export function ChatAgent() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "agent", text: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    full_name: "",
    phone: "",
    preferred: "",
    treatment: "",
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(2);          // ← move this up here

  // All hooks must be above this line
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages, loading]);

  // Now it is safe to return early
  if (pathname?.startsWith("/portal")) {
    return null;
  }

  function addMessage(role: "agent" | "user", text: string) {
    const id = nextId.current++;
    setMessages((prev) => [...prev, { id, role, text }]);
  }

  function handleGeneral(text: string): string | null {
    const lower = text.toLowerCase();

    if (/hour|time|open|shift|when/.test(lower)) {
      return `We are open most days:\n• Morning: 12:00–4:00 PM\n• Evening: 7:15–11:00 PM\n\nWould you like to request an appointment?`;
    }
    if (/where|location|address|map|latifabad|hyderabad/.test(lower)) {
      return `We are on Market Road, Latifabad Unit 10, Hyderabad.\n\nYou can also message us on WhatsApp ${CLINIC.whatsapp} for directions.`;
    }
    if (/service|treatment|do you|what do you|offer|provide/.test(lower)) {
      return `We offer:\n${CLINIC.services.map((s) => `• ${s}`).join("\n")}\n\nWould you like to request an appointment?`;
    }
    if (/doctor|dentist|usama|wajeeha|who/.test(lower)) {
      return `Our doctors are Dr. Usama and Dr. Wajeeha.\n\nWould you like to request an appointment?`;
    }
    if (/book|appointment|slot|visit|come|schedule|request/.test(lower)) {
      return null; // trigger booking flow
    }
    if (/price|cost|fee|how much|charge/.test(lower)) {
      return `I cannot give prices here. Please message us directly on WhatsApp ${CLINIC.whatsapp} and the team will help you.`;
    }
    if (/pain|advice|diagnos|medic|should i|treatment for/.test(lower)) {
      return `I cannot give medical advice. Please message the clinic on WhatsApp ${CLINIC.whatsapp} so the doctors can help you properly.`;
    }

    return `I can help with our hours, location, services, or request an appointment.\n\nYou can also message us directly on WhatsApp ${CLINIC.whatsapp}.`;
  }

  async function submitBooking(finalData: typeof data) {
    setLoading(true);
    try {
      const res = await fetch("/api/agent/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      const json = await res.json();

      if (!res.ok) {
        addMessage(
          "agent",
          json.error ||
            `Something went wrong. Please message us on WhatsApp ${CLINIC.whatsapp}.`
        );
        setStep("idle");
        return;
      }

      addMessage(
        "agent",
        `Thank you, ${finalData.full_name}!\n\nWe have noted your request for “${finalData.treatment}” (${finalData.preferred}).\n\nOur team will confirm the exact slot with you on WhatsApp shortly.\n\nYou can also message us anytime at ${CLINIC.whatsapp}. Take care!`
      );
      setStep("done");
    } catch {
      addMessage(
        "agent",
        `Could not send the request. Please message us directly on WhatsApp ${CLINIC.whatsapp}.`
      );
      setStep("idle");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    addMessage("user", text);

    if (step === "done") {
      addMessage(
        "agent",
        `Your request is already with the team. For anything else please message us on WhatsApp ${CLINIC.whatsapp}.`
      );
      return;
    }

    if (step === "idle") {
      const general = handleGeneral(text);
      if (general !== null) {
        addMessage("agent", general);
        return;
      }
      setStep("name");
      addMessage("agent", "I’d be happy to help you request an appointment.\n\nMay I please have your full name?");
      return;
    }

    if (step === "name") {
      if (!isValidFullName(text)) {
        addMessage("agent", "Please enter a valid full name (at least 2 characters).");
        return;
      }
      setData((d) => ({ ...d, full_name: text.trim() }));
      setStep("phone");
      addMessage(
        "agent",
        `Thank you, ${text.trim()}.\n\nPlease share your WhatsApp number (Pakistani mobile, e.g. 03XX XXXXXXX).`
      );
      return;
    }

    if (step === "phone") {
      const phone = normalizePakistaniPhone(text);
      if (!phone) {
        addMessage(
          "agent",
          "That doesn’t look like a valid Pakistani mobile number. Please try again (e.g. 0335 2411106)."
        );
        return;
      }
      setData((d) => ({ ...d, phone }));
      setStep("preferred");
      addMessage(
        "agent",
        "Got it. Which day and shift do you prefer?\n\n(Morning 12:00–4:00 PM or Evening 7:15–11:00 PM)"
      );
      return;
    }

    if (step === "preferred") {
      if (!isValidPreferred(text)) {
        addMessage("agent", "Please tell us a preferred day and shift (morning or evening).");
        return;
      }
      setData((d) => ({ ...d, preferred: text.trim() }));
      setStep("treatment");
      addMessage(
        "agent",
        "Perfect. What treatment do you need, or would you like a checkup?"
      );
      return;
    }

    if (step === "treatment") {
      if (!isValidTreatment(text)) {
        addMessage("agent", "Please tell us the treatment or simply write “checkup”.");
        return;
      }
      const final = { ...data, treatment: text.trim() };
      setData(final);
      await submitBooking(final);
      return;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

function resetChat() {
  setStep("idle");
  setData({ full_name: "", phone: "", preferred: "", treatment: "" });
  nextId.current = 2;
  setMessages([{ id: 1, role: "agent", text: WELCOME }]);
  setInput("");
}
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
        aria-label={open ? "Close chat" : "Open chat with Mehran Dental Care"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[min(520px,70vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between bg-teal-600 px-4 py-3 text-white">
            <div>
              <p className="font-semibold leading-tight">{CLINIC.name}</p>
              <p className="text-xs text-teal-100">Usually replies in a few minutes</p>
            </div>
            <button
              type="button"
              onClick={resetChat}
              className="rounded-md px-2 py-1 text-xs text-teal-100 hover:bg-teal-500"
            >
              Reset
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-3.5 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending your request…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-slate-200 p-3 dark:border-slate-700">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading || step === "done"}
                placeholder={
                  step === "done"
                    ? "Request sent"
                    : step === "name"
                      ? "Your full name…"
                      : step === "phone"
                        ? "03XX XXXXXXX"
                        : step === "preferred"
                          ? "e.g. Tomorrow evening"
                          : step === "treatment"
                            ? "e.g. Scaling or checkup"
                            : "Type a message…"
                }
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || loading || step === "done"}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white transition hover:bg-teal-700 disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-slate-400">
              For medical questions please use WhatsApp {CLINIC.whatsapp}
            </p>
          </div>
        </div>
      )}
    </>
  );
}