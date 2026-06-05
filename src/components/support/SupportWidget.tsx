"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import {
  LifeBuoy,
  Loader2,
  MessageCircle,
  Send,
  UserRound,
  X,
} from "lucide-react";

type SenderType = "visitor" | "admin" | "system";
type SupportStatus = "open" | "answered" | "closed";

interface SupportMessage {
  id: string;
  conversation_id: string;
  sender_type: SenderType;
  sender_name?: string | null;
  body: string;
  read_by_admin?: boolean;
  read_by_visitor?: boolean;
  created_at: string;
}

interface SupportConversation {
  id: string;
  session_id: string;
  visitor_name: string;
  visitor_email?: string | null;
  subject: string;
  status: SupportStatus;
  messages?: SupportMessage[];
}

const CONVERSATION_KEY = "collins_support_conversation_id";
const SESSION_KEY = "collins_support_session_id";
const NAME_KEY = "collins_support_visitor_name";
const EMAIL_KEY = "collins_support_visitor_email";

function makeSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `support-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SupportWidget() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [conversation, setConversation] = useState<SupportConversation | null>(
    null,
  );
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [draft, setDraft] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "General support",
    message: "",
  });
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isAdminArea = pathname?.startsWith("/admin");

  useEffect(() => {
    setMounted(true);
    const existingSession =
      window.localStorage.getItem(SESSION_KEY) || makeSessionId();
    window.localStorage.setItem(SESSION_KEY, existingSession);
    setSessionId(existingSession);
    setConversationId(window.localStorage.getItem(CONVERSATION_KEY));
    setForm((prev) => ({
      ...prev,
      name: window.localStorage.getItem(NAME_KEY) || "",
      email: window.localStorage.getItem(EMAIL_KEY) || "",
    }));

    const handleOpenSupport = (e: any) => {
      const convId = e.detail?.conversationId;
      if (convId) {
        setConversationId(convId);
        setForm((prev) => ({
          ...prev,
          name: window.localStorage.getItem(NAME_KEY) || prev.name,
          email: window.localStorage.getItem(EMAIL_KEY) || prev.email,
        }));
        setIsOpen(true);
      }
    };

    window.addEventListener('open-support-chat', handleOpenSupport);
    return () => {
      window.removeEventListener('open-support-chat', handleOpenSupport);
    };
  }, []);

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
    [messages],
  );

  const loadConversation = useCallback(
    async (markRead: boolean) => {
      if (!conversationId) return;
      try {
        const res = await fetch(
          `/api/support/conversations/${conversationId}${markRead ? "?markRead=visitor" : ""}`,
          {
            cache: "no-store",
          },
        );

        if (res.status === 404) {
          window.localStorage.removeItem(CONVERSATION_KEY);
          setConversationId(null);
          setConversation(null);
          setMessages([]);
          setUnreadCount(0);
          return;
        }

        if (!res.ok) throw new Error("Unable to load support conversation.");
        const data = (await res.json()) as SupportConversation;
        const nextMessages = data.messages || [];
        setConversation(data);
        setMessages(nextMessages);
        setUnreadCount(
          nextMessages.filter(
            (message) =>
              message.sender_type === "admin" && !message.read_by_visitor,
          ).length,
        );
      } catch (err) {
        console.error("Support conversation load failed:", err);
      }
    },
    [conversationId],
  );

  useEffect(() => {
    if (!mounted || !conversationId) return;
    loadConversation(isOpen);
    const interval = window.setInterval(
      () => loadConversation(isOpen),
      isOpen ? 3500 : 8000,
    );
    return () => window.clearInterval(interval);
  }, [conversationId, isOpen, loadConversation, mounted]);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [isOpen, sortedMessages.length]);

  const handleStartConversation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please add your name, email, and a message so we can help.");
      return;
    }

    if (!form.email.includes("@") || !form.email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/support/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          visitorName: form.name.trim(),
          visitorEmail: form.email.trim(),
          subject: form.subject.trim() || "General support",
          initialMessage: form.message.trim(),
        }),
      });

      if (!res.ok) throw new Error("Unable to start support conversation.");
      const data = (await res.json()) as SupportConversation;
      window.localStorage.setItem(CONVERSATION_KEY, data.id);
      window.localStorage.setItem(NAME_KEY, form.name.trim());
      if (form.email.trim())
        window.localStorage.setItem(EMAIL_KEY, form.email.trim());
      setConversationId(data.id);
      setConversation(data);
      setMessages(data.messages || []);
      setForm((prev) => ({ ...prev, message: "" }));
      setUnreadCount(0);
    } catch (err) {
      console.error("Support conversation start failed:", err);
      setError(
        "We could not start support right now. Please try again in a moment.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!conversationId || !draft.trim()) return;

    const body = draft.trim();
    setDraft("");
    setSending(true);
    setError("");

    try {
      const res = await fetch(
        `/api/support/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderType: "visitor",
            senderName: conversation?.visitor_name || form.name || "Visitor",
            body,
          }),
        },
      );

      if (!res.ok) throw new Error("Unable to send message.");
      const message = (await res.json()) as SupportMessage;
      setMessages((prev) => [...prev, message]);
      setConversation((prev) => (prev ? { ...prev, status: "open" } : prev));
      window.setTimeout(() => loadConversation(true), 500);
    } catch (err) {
      console.error("Support message send failed:", err);
      setDraft(body);
      setError("Message was not sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (!mounted || isAdminArea) return null;

  return (
    <div className="fixed bottom-5 right-5 z-80 flex flex-col items-end gap-3">
      {isOpen && (
        <section className="w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-3xl border border-sage/15 bg-white shadow-2xl shadow-charcoal/15">
          <div className="bg-charcoal px-5 py-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-sage-light">
                  <LifeBuoy className="h-3.5 w-3.5" /> Collins Support
                </p>
                <h2 className="mt-1 font-serif text-lg font-semibold">
                  How can we help?
                </h2>
                <p className="mt-1 text-xs text-white/55">
                  Replies from the admin dashboard show up here.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close support chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!conversationId ? (
            <form onSubmit={handleStartConversation} className="space-y-3 p-5">
              <div className="grid grid-cols-1 gap-3">
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Your name"
                  className="rounded-2xl border border-sage/15 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-light/50 focus:border-sage"
                  maxLength={80}
                />
                 <input
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="Your email address"
                  type="email"
                  className="rounded-2xl border border-sage/15 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-light/50 focus:border-sage"
                  maxLength={160}
                  required
                />
                <input
                  value={form.subject}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      subject: event.target.value,
                    }))
                  }
                  placeholder="Subject"
                  className="rounded-2xl border border-sage/15 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-light/50 focus:border-sage"
                  maxLength={120}
                />
                <textarea
                  value={form.message}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      message: event.target.value,
                    }))
                  }
                  placeholder="Tell us what you need help with..."
                  rows={4}
                  className="resize-none rounded-2xl border border-sage/15 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-light/50 focus:border-sage"
                  maxLength={1200}
                />
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sage px-4 py-3 text-sm font-bold text-white shadow-lg shadow-sage/20 transition-colors hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
                Start support chat
              </button>
            </form>
          ) : (
            <div className="flex h-130 flex-col">
              <div className="border-b border-sage/10 bg-offwhite/70 px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-charcoal">
                      {conversation?.subject || "Support conversation"}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-charcoal-light">
                      Status:{" "}
                      <span className="font-bold text-sage-dark">
                        {conversation?.status || "open"}
                      </span>
                    </p>
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sage-dark">
                    <UserRound className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-offwhite/45 p-4">
                {sortedMessages.map((message) => {
                  const isVisitor = message.sender_type === "visitor";
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isVisitor ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs shadow-sm ${
                          isVisitor
                            ? "rounded-br-md bg-sage text-white"
                            : "rounded-bl-md border border-sage/10 bg-white text-charcoal"
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {message.body}
                        </p>
                        <span className="mt-1.5 block text-right text-[9px] opacity-55">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {error && (
                <p className="mx-4 mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </p>
              )}

              <form
                onSubmit={handleSendMessage}
                className="flex gap-2 border-t border-sage/10 bg-white p-4"
              >
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={
                    conversation?.status === "closed"
                      ? "This conversation is closed, but you can reopen it."
                      : "Write a message..."
                  }
                  className="min-w-0 flex-1 rounded-2xl border border-sage/15 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-light/45 focus:border-sage"
                  maxLength={1200}
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sage text-white transition-colors hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Send support message"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
            </div>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen && conversationId)
            window.setTimeout(() => loadConversation(true), 50);
        }}
        className="relative flex items-center gap-3 rounded-full bg-charcoal px-5 py-4 text-sm font-bold text-white shadow-2xl shadow-charcoal/25 transition-all hover:-translate-y-0.5 hover:bg-sage-dark"
        aria-label="Open support chat"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage text-white">
          <MessageCircle className="h-4 w-4" />
        </span>
        <span className="hidden sm:inline">Support</span>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-clay px-1.5 text-[10px] font-black text-charcoal ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
