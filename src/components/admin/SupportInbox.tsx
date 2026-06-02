"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MessageCircle,
  RefreshCw,
  Send,
  UserRound,
  XCircle,
  ChevronLeft,
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
  created_at: string;
  updated_at?: string;
  last_message_at?: string;
  unread_count?: number;
  last_message?: SupportMessage | null;
  messages?: SupportMessage[];
}

interface SupportInboxProps {
  initialConversations: SupportConversation[];
}

const STATUS_OPTIONS: SupportStatus[] = ["open", "answered", "closed"];

function statusClasses(status: SupportStatus) {
  switch (status) {
    case "open":
      return "bg-blue-100 text-blue-700";
    case "answered":
      return "bg-green-100 text-green-700";
    case "closed":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function formatDateTime(value?: string) {
  if (!value) return "No activity yet";
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SupportInbox({
  initialConversations,
}: SupportInboxProps) {
  const [conversations, setConversations] =
    useState<SupportConversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(
    initialConversations[0]?.id || null,
  );
  const [activeConversation, setActiveConversation] =
    useState<SupportConversation | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | SupportStatus>(
    "all",
  );
  const [reply, setReply] = useState("");
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const sortedMessages = useMemo(() => {
    const messages = activeConversation?.messages || [];
    return [...messages].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }, [activeConversation]);

  const filteredConversations = useMemo(() => {
    if (filterStatus === "all") return conversations;
    return conversations.filter(
      (conversation) => conversation.status === filterStatus,
    );
  }, [conversations, filterStatus]);

  const loadConversations = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/support/conversations", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Unable to fetch support conversations.");
      const data = (await res.json()) as SupportConversation[];
      setConversations(data);
      if (!activeId && data[0]) setActiveId(data[0].id);
    } catch (err) {
      console.error("Support inbox refresh failed:", err);
      setError("Could not refresh support conversations.");
    } finally {
      setRefreshing(false);
    }
  }, [activeId]);

  const loadConversation = useCallback(async (id: string) => {
    try {
      setLoadingConversation(true);
      const res = await fetch(
        `/api/support/conversations/${id}?markRead=admin`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error("Unable to load support conversation.");
      const data = (await res.json()) as SupportConversation;
      setActiveConversation(data);
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === id
            ? {
                ...conversation,
                ...data,
                unread_count: 0,
                last_message:
                  data.messages?.at(-1) || conversation.last_message,
              }
            : conversation,
        ),
      );
      setError("");
    } catch (err) {
      console.error("Support conversation load failed:", err);
      setError("Could not load this conversation.");
    } finally {
      setLoadingConversation(false);
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(loadConversations, 5000);
    return () => window.clearInterval(interval);
  }, [loadConversations]);

  useEffect(() => {
    if (!activeId) {
      setActiveConversation(null);
      return;
    }
    loadConversation(activeId);
  }, [activeId, loadConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [sortedMessages.length, activeId]);

  const handleStatusChange = async (status: SupportStatus) => {
    if (!activeId) return;
    try {
      const res = await fetch(`/api/support/conversations/${activeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Unable to update support status.");
      setActiveConversation((prev) => (prev ? { ...prev, status } : prev));
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === activeId
            ? { ...conversation, status }
            : conversation,
        ),
      );
    } catch (err) {
      console.error("Support status update failed:", err);
      setError("Could not update the conversation status.");
    }
  };

  const handleSendReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeId || !reply.trim()) return;

    const body = reply.trim();
    setReply("");
    setSending(true);
    setError("");

    try {
      const res = await fetch(
        `/api/support/conversations/${activeId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderType: "admin",
            senderName: "Collins Support",
            body,
          }),
        },
      );

      if (!res.ok) throw new Error("Unable to send reply.");
      const message = (await res.json()) as SupportMessage;
      setActiveConversation((prev) =>
        prev
          ? {
              ...prev,
              status: "answered",
              last_message_at: message.created_at,
              messages: [...(prev.messages || []), message],
            }
          : prev,
      );
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === activeId
            ? {
                ...conversation,
                status: "answered",
                last_message_at: message.created_at,
                last_message: message,
              }
            : conversation,
        ),
      );
      window.setTimeout(loadConversations, 350);
    } catch (err) {
      console.error("Support reply send failed:", err);
      setReply(body);
      setError("Reply was not sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-light">
            Status:
          </span>
          <select
            value={filterStatus}
            onChange={(event) =>
              setFilterStatus(event.target.value as "all" | SupportStatus)
            }
            className="rounded-xl border border-sage/20 bg-white px-3 py-2 text-xs font-semibold text-charcoal outline-none focus:border-sage"
          >
            <option value="all">All conversations</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={loadConversations}
          disabled={refreshing}
          className="ml-auto flex items-center gap-2 rounded-xl border border-sage/20 bg-white px-3 py-2 text-xs font-semibold text-charcoal transition-colors hover:border-sage disabled:opacity-60"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid h-screen overflow-auto rounded-3xl border border-sage/10 bg-white shadow-sm lg:grid-cols-[360px_1fr] relative min-w-0">
        <aside className={`border-b border-sage/10 bg-offwhite/60 lg:border-b-0 lg:border-r flex flex-col h-full relative z-10 ${activeId ? 'hidden' : ''} lg:block`}>
          <div className="border-b border-sage/10 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-charcoal-light">
              Inbox
            </p>
            <p className="mt-1 text-sm text-charcoal">
              {filteredConversations.length} conversation
              {filteredConversations.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="max-h-155 overflow-y-auto p-3">
            {filteredConversations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-sage/20 bg-white p-8 text-center text-sm text-charcoal-light">
                No support conversations match this filter.
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const isActive = conversation.id === activeId;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveId(conversation.id)}
                    className={`mb-2 w-full rounded-2xl border p-4 text-left transition-all ${
                      isActive
                        ? "border-sage/40 bg-white shadow-sm"
                        : "border-transparent bg-white/60 hover:border-sage/15 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-charcoal">
                          {conversation.visitor_name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-charcoal-light">
                          {conversation.subject}
                        </p>
                      </div>
                      {(conversation.unread_count || 0) > 0 && (
                        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-clay px-2 text-[10px] font-black text-charcoal">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-charcoal-light">
                      {conversation.last_message?.body || "No messages yet."}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span
                        className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase ${statusClasses(conversation.status)}`}
                      >
                        {conversation.status}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-charcoal-light">
                        <Clock3 className="h-3 w-3" />{" "}
                        {formatDateTime(
                          conversation.last_message_at ||
                            conversation.created_at,
                        )}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="flex flex-col flex-1 overflow-auto relative z-0">
          {!activeId ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-charcoal-light">
              Select a support conversation to read and reply.
            </div>
          ) : loadingConversation && !activeConversation ? (
            <div className="flex flex-1 items-center justify-center gap-3 p-8 text-sm font-semibold text-charcoal">
              <Loader2 className="h-5 w-5 animate-spin text-sage" /> Loading
              conversation...
            </div>
          ) : activeConversation ? (
            <>
              <header className="border-b border-sage/10 px-6 py-5 flex items-center gap-2 lg:gap-0">
                <button
                  type="button"
                  onClick={() => setActiveId(null)}
                  className="lg:hidden flex items-center gap-1 text-sm text-charcoal-light hover:text-sage"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sage-dark">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate font-serif text-xl font-semibold text-charcoal">
                          {activeConversation.subject}
                        </h2>
                        <p className="mt-0.5 text-xs text-charcoal-light">
                          From{" "}
                          <span className="font-semibold text-charcoal">
                            {activeConversation.visitor_name}
                          </span>
                          {activeConversation.visitor_email && (
                            <a
                              className="ml-2 inline-flex items-center gap-1 text-sage-dark hover:underline"
                              href={`mailto:${activeConversation.visitor_email}`}
                            >
                              <Mail className="h-3 w-3" />{" "}
                              {activeConversation.visitor_email}
                            </a>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {STATUS_OPTIONS.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleStatusChange(status)}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold capitalize transition-colors ${
                          activeConversation.status === status
                            ? statusClasses(status)
                            : "border border-sage/15 bg-white text-charcoal-light hover:border-sage/35 hover:text-charcoal"
                        }`}
                      >
                        {status === "answered" ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : status === "closed" ? (
                          <XCircle className="h-3.5 w-3.5" />
                        ) : (
                          <MessageCircle className="h-3.5 w-3.5" />
                        )}
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto bg-offwhite/40 p-6">
                {sortedMessages.map((message) => {
                  const isAdmin = message.sender_type === "admin";
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[72%] rounded-3xl px-5 py-4 text-sm shadow-sm ${
                          isAdmin
                            ? "rounded-br-md bg-sage text-white"
                            : "rounded-bl-md border border-sage/10 bg-white text-charcoal"
                        }`}
                      >
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-65">
                          {message.sender_name ||
                            (isAdmin
                              ? "Collins Support"
                              : activeConversation.visitor_name)}
                        </p>
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {message.body}
                        </p>
                        <span className="mt-2 block text-right text-[10px] opacity-55">
                          {formatDateTime(message.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSendReply}
                className="border-t border-sage/10 bg-white p-5"
              >
                <div className="flex gap-3">
                  <textarea
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Type your admin reply..."
                    rows={3}
                    className="min-w-0 flex-1 resize-none rounded-2xl border border-sage/15 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-light/45 focus:border-sage"
                    maxLength={1600}
                  />
                  <button
                    type="submit"
                    disabled={sending || !reply.trim()}
                    className="flex w-28 shrink-0 items-center justify-center gap-2 rounded-2xl bg-sage px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-sm text-charcoal-light">
              Conversation not found.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
