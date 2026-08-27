"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
type Message = { id: number; role: "agent" | "user"; text: string };

const WELCOME =
  `Assalam o Alaikum! 👋 Welcome to ${CLINIC.name}.\n\nI can help with our hours, location, services, or book an appointment for you.\n\nHow can I help today?`;

// ─── Fuzzy helpers ────────────────────────────────────────────────────────────

/** Normalise a string: lowercase, collapse whitespace, strip punctuation */
function norm(s: string) {
  return s.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

/** True if any of the keywords (or close variants) appear in the text */
function fuzzy(text: string, keywords: string[]): boolean {
  const t = norm(text);
  return keywords.some((kw) => {
    // exact match first
    if (t.includes(kw)) return true;
    // stem: match if text contains the stem of the keyword (min 4 chars)
    const stem = kw.slice(0, Math.max(4, kw.length - 2));
    if (stem.length >= 4 && t.includes(stem)) return true;
    // split into words and check each word with simple edit-distance ≤ 1
    return t.split(" ").some((word) => levenshtein(word, kw) <= 1 && kw.length > 3);
  });
}

/** Levenshtein distance (capped at 2 for performance) */
function levenshtein(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 99;
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[a.length][b.length];
}

// ─── General intent handler ───────────────────────────────────────────────────

function handleGeneral(text: string): string | null {
  const t = norm(text);

  // Greetings — including Urdu/Pakistani variants
  const greetings = [
    "hi","hello","hey","helo","hii","salam","salaam",
    "assalam","aoa","walaikum","walaykum","assalamu",
    "alaikum","alaykom","peace","good morning","good evening",
    "good afternoon","goodmorning","goodevening",
  ];
  if (fuzzy(t, greetings)) {
    return WELCOME;
  }

  // Hours / timing
  if (fuzzy(t, ["hour","hours","time","open","close","shift","when","timing","schedule","work"])) {
    return `We are open most days:\n• Morning: 12:00–4:00 PM\n• Evening: 7:15–11:00 PM\n\nWould you like to request an appointment?`;
  }

  // Location
  if (fuzzy(t, ["where","location","address","map","direction","latifabad","hyderabad","find","come","how to reach"])) {
    return `We are on Market Road, Latifabad Unit 10, Hyderabad.\n\nYou can also message us on WhatsApp ${CLINIC.whatsapp} for directions.`;
  }

  // Services
  if (fuzzy(t, ["service","treatment","offer","provide","what do you","do you do","procedure","capability"])) {
    return `We offer:\n${CLINIC.services.map((s) => `• ${s}`).join("\n")}\n\nWould you like to request an appointment?`;
  }

  // Doctors
  if (fuzzy(t, ["doctor","dentist","usama","wajeeha","dr","staff","who","specialist"])) {
    return `Our doctors are Dr. Usama and Dr. Wajeeha.\n\nWould you like to request an appointment?`;
  }

  // Booking intent
  if (fuzzy(t, ["book","appointment","slot","visit","come","schedule","request","fix","reserve","consult"])) {
    return null; // trigger booking flow
  }

  // Price
  if (fuzzy(t, ["price","cost","fee","charge","how much","rate","expensive","cheap","afford"])) {
    return `I can't give prices here. Please message us directly on WhatsApp ${CLINIC.whatsapp} and the team will help you.`;
  }

  // Medical advice
  if (fuzzy(t, ["pain","advice","diagnos","medic","should i","treatment for","hurts","hurt","ache","bleed","swell"])) {
    return `I can't give medical advice. Please message the clinic on WhatsApp ${CLINIC.whatsapp} so the doctors can help you properly.`;
  }

  // Fallback
  return `I can help with our hours, location, services, or book an appointment.\n\nYou can also message us directly on WhatsApp ${CLINIC.whatsapp}.`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChatAgent() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "agent", text: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ full_name: "", phone: "", preferred: "", treatment: "" });

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages, loading]);

  // Close on click/touch outside the chat window
  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (chatRef.current && !chatRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    // Small delay so the open-button click doesn't immediately close it
    const t = setTimeout(() => {
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("touchstart", handleOutside);
    }, 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open]);

  if (pathname?.startsWith("/portal")) return null;

  function addMessage(role: "agent" | "user", text: string) {
    const id = nextId.current++;
    setMessages((prev) => [...prev, { id, role, text }]);
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
        addMessage("agent", json.error || `Something went wrong. Please message us on WhatsApp ${CLINIC.whatsapp}.`);
        setStep("idle");
        return;
      }
      addMessage(
        "agent",
        `Thank you, ${finalData.full_name}! ✅\n\nWe've noted your request for "${finalData.treatment}" (${finalData.preferred}).\n\nOur team will confirm the exact slot with you on WhatsApp shortly.\n\nYou can also message us anytime at ${CLINIC.whatsapp}. Take care!`
      );
      setStep("done");
    } catch {
      addMessage("agent", `Could not send the request. Please message us directly on WhatsApp ${CLINIC.whatsapp}.`);
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
      addMessage("agent", `Your request is already with the team. For anything else please message us on WhatsApp ${CLINIC.whatsapp}.`);
      return;
    }

    if (step === "idle") {
      const general = handleGeneral(text);
      if (general !== null) {
        addMessage("agent", general);
        return;
      }
      setStep("name");
      addMessage("agent", "I'd be happy to help you request an appointment. 😊\n\nMay I please have your full name?");
      return;
    }

    if (step === "name") {
      if (!isValidFullName(text)) {
        addMessage("agent", "I need your name to proceed — please share your full name (at least 2 characters).");
        return;
      }
      setData((d) => ({ ...d, full_name: text.trim() }));
      setStep("phone");
      addMessage("agent", `Thank you, ${text.trim()}. 👍\n\nPlease share your WhatsApp number so we can confirm your slot.\n(Pakistani mobile, e.g. 0335 2411106)`);
      return;
    }

    if (step === "phone") {
      const phone = normalizePakistaniPhone(text);
      if (!phone) {
        addMessage("agent", "I didn't quite catch that number. Please share a valid Pakistani mobile number — e.g. 0335 2411106 or +923352411106.");
        return;
      }
      setData((d) => ({ ...d, phone }));
      setStep("preferred");
      addMessage("agent", "Got it! 📅 Which day and time works best for you?\n\n• Morning: 12:00–4:00 PM\n• Evening: 7:15–11:00 PM\n\n(e.g. \"Tomorrow evening\" or \"Saturday morning\")");
      return;
    }

    if (step === "preferred") {
      if (!isValidPreferred(text)) {
        addMessage("agent", "Could you clarify when you'd like to come? For example: \"Tomorrow evening\" or \"Friday morning\".");
        return;
      }
      setData((d) => ({ ...d, preferred: text.trim() }));
      setStep("treatment");
      addMessage("agent", "Almost there! 🦷 What treatment do you need, or would you like a general checkup?");
      return;
    }

    if (step === "treatment") {
      if (!isValidTreatment(text)) {
        addMessage("agent", "Could you tell us what treatment you need? Even just \"checkup\" or \"cleaning\" works fine.");
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
    // Wrap both the button and the window so outside-click works correctly
    <div ref={chatRef} className="fixed bottom-5 right-5 z-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
        aria-label={open ? "Close chat" : "Open chat with Mehran Dental Care"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="absolute bottom-16 right-0 flex h-[min(520px,70vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
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
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
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
                  step === "done" ? "Request sent ✓" :
                  step === "name" ? "Your full name…" :
                  step === "phone" ? "03XX XXXXXXX" :
                  step === "preferred" ? "e.g. Tomorrow evening" :
                  step === "treatment" ? "e.g. Scaling or checkup" :
                  "Type a message…"
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
    </div>
  );
}
