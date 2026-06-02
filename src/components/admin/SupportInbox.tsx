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
  ChevronLeft,
  Clock3,
  Loader2,
  Mail,
  MessageCircle,
  MoreVertical,
  RefreshCw,
  Send,
  UserRound,
  XCircle,
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
      return "bg-emerald-100 text-emerald-700";
    case "closed":
      return "bg-gray-100 text-gray-500";
    default:
      return "bg-gray-100 text-gray-500";
  }
}

function statusDot(status: SupportStatus) {
  switch (status) {
    case "open":
      return "bg-blue-500";
    case "answered":
      return "bg-emerald-500";
    case "closed":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
}

function avatarInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

function formatTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatDateTime(value?: string) {
  if (!value) return "";
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
  // On mobile, start with null so the list is shown first
  const [activeId, setActiveId] = useState<string | null>(null);
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
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
    } catch (err) {
      console.error("Support inbox refresh failed:", err);
      setError("Could not refresh conversations.");
    } finally {
      setRefreshing(false);
    }
  }, []);

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

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReply(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleStatusChange = async (status: SupportStatus) => {
    if (!activeId) return;
    setShowStatusMenu(false);
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
    if (textareaRef.current) textareaRef.current.style.height = "auto";
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

  const handleOpenConversation = (id: string) => {
    setActiveId(id);
  };

  const handleBack = () => {
    setActiveId(null);
    setShowStatusMenu(false);
  };

  // ─── INBOX LIST PANEL ────────────────────────────────────────────────────────
  const InboxPanel = (
    <div
      className={`
        absolute inset-0 flex flex-col bg-offwhite
        transition-transform duration-300 ease-in-out
        ${activeId ? "-translate-x-full lg:translate-x-0" : "translate-x-0"}
        lg:relative lg:flex lg:w-[340px] xl:w-[380px] lg:shrink-0
        lg:border-r lg:border-sage/10 lg:bg-white
      `}
    >
      {/* Inbox header */}
      <div className="flex items-center justify-between border-b border-sage/10 bg-white px-4 py-3.5 lg:px-5 lg:py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-charcoal-light">
            Inbox
          </p>
          <p className="mt-0.5 text-base font-semibold text-charcoal">
            {filteredConversations.length}{" "}
            {filteredConversations.length === 1
              ? "conversation"
              : "conversations"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as "all" | SupportStatus)
            }
            className="rounded-xl border border-sage/20 bg-offwhite px-2.5 py-1.5 text-xs font-semibold text-charcoal outline-none focus:border-sage"
          >
            <option value="all">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {/* Refresh */}
          <button
            type="button"
            onClick={loadConversations}
            disabled={refreshing}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-sage/20 bg-white text-charcoal-light transition-colors hover:border-sage hover:text-sage disabled:opacity-50"
            aria-label="Refresh inbox"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && !activeId && (
        <div className="mx-3 mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage/10">
              <MessageCircle className="h-6 w-6 text-sage/60" />
            </div>
            <p className="text-sm text-charcoal-light">
              No conversations here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-sage/5">
            {filteredConversations.map((conversation) => {
              const isActive = conversation.id === activeId;
              const hasUnread = (conversation.unread_count || 0) > 0;
              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => handleOpenConversation(conversation.id)}
                  className={`w-full px-4 py-4 text-left transition-colors active:bg-sage/5 lg:px-5 ${
                    isActive
                      ? "bg-sage/8 border-l-[3px] border-sage"
                      : "border-l-[3px] border-transparent hover:bg-sage/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        hasUnread
                          ? "bg-sage text-white"
                          : "bg-sage/15 text-sage-dark"
                      }`}
                    >
                      {avatarInitial(conversation.visitor_name)}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`truncate text-sm ${hasUnread ? "font-bold text-charcoal" : "font-semibold text-charcoal"}`}
                        >
                          {conversation.visitor_name}
                        </p>
                        <span className="shrink-0 text-[10px] text-charcoal-light">
                          {formatTime(
                            conversation.last_message_at ||
                              conversation.created_at,
                          )}
                        </span>
                      </div>

                      <p className="mt-0.5 truncate text-xs font-medium text-charcoal-light">
                        {conversation.subject}
                      </p>

                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <p
                          className={`truncate text-xs ${hasUnread ? "font-semibold text-charcoal" : "text-charcoal-light"}`}
                        >
                          {conversation.last_message?.body || "No messages yet."}
                        </p>
                        {hasUnread ? (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-sage px-1.5 text-[10px] font-black text-white">
                            {conversation.unread_count}
                          </span>
                        ) : (
                          <span
                            className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${statusClasses(conversation.status)}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${statusDot(conversation.status)}`}
                            />
                            {conversation.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ─── CHAT PANEL ──────────────────────────────────────────────────────────────
  const ChatPanel = (
    <div
      className={`
        absolute inset-0 flex flex-col bg-white
        transition-transform duration-300 ease-in-out
        ${activeId ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        lg:relative lg:flex lg:flex-1
      `}
    >
      {!activeId ? (
        // Empty state – desktop only (mobile stays on inbox list)
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center gap-4 text-center p-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sage/8">
            <MessageCircle className="h-8 w-8 text-sage/50" />
          </div>
          <div>
            <p className="font-serif text-xl font-semibold text-charcoal">
              Select a conversation
            </p>
            <p className="mt-1 text-sm text-charcoal-light">
              Choose a support thread from the inbox to read and reply.
            </p>
          </div>
        </div>
      ) : loadingConversation && !activeConversation ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-sage" />
          <p className="text-sm text-charcoal-light">Loading conversation…</p>
        </div>
      ) : activeConversation ? (
        <>
          {/* Chat header */}
          <header className="flex shrink-0 items-center gap-3 border-b border-sage/10 bg-white px-3 py-3 lg:px-5 lg:py-4">
            {/* Back button (mobile) */}
            <button
              type="button"
              onClick={handleBack}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-charcoal-light transition-colors hover:bg-sage/10 hover:text-sage lg:hidden"
              aria-label="Back to inbox"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Avatar */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sm font-bold text-sage-dark">
              {avatarInitial(activeConversation.visitor_name)}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-charcoal">
                {activeConversation.visitor_name}
              </p>
              <p className="truncate text-xs text-charcoal-light">
                {activeConversation.subject}
              </p>
            </div>

            {/* Status badge */}
            <span
              className={`hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase sm:flex ${statusClasses(activeConversation.status)}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${statusDot(activeConversation.status)}`}
              />
              {activeConversation.status}
            </span>

            {/* Email button */}
            {activeConversation.visitor_email && (
              <a
                href={`mailto:${activeConversation.visitor_email}?subject=Re: ${activeConversation.subject}`}
                className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sage/20 text-charcoal-light transition-colors hover:border-sage hover:text-sage sm:flex"
                title={`Email ${activeConversation.visitor_email}`}
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
            )}

            {/* Status menu toggle */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowStatusMenu((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal-light transition-colors hover:bg-sage/10 hover:text-sage"
                aria-label="Change status"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {showStatusMenu && (
                <div className="absolute right-0 top-10 z-30 min-w-[170px] rounded-2xl border border-sage/10 bg-white shadow-xl">
                  <p className="border-b border-sage/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-charcoal-light">
                    Set status
                  </p>
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatusChange(status)}
                      className={`flex w-full items-center gap-2.5 px-4 py-3 text-sm transition-colors hover:bg-sage/5 ${
                        activeConversation.status === status
                          ? "font-bold text-sage-dark"
                          : "text-charcoal"
                      }`}
                    >
                      {status === "answered" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : status === "closed" ? (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      ) : (
                        <MessageCircle className="h-4 w-4 text-blue-500" />
                      )}
                      <span className="capitalize">{status}</span>
                      {activeConversation.status === status && (
                        <span className="ml-auto text-xs text-sage">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* Error banner */}
          {error && activeId && (
            <div className="mx-3 mt-2 shrink-0 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-offwhite/50 px-3 py-4 lg:px-5 lg:py-5">
            {sortedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <UserRound className="h-8 w-8 text-charcoal-light/40" />
                <p className="text-sm text-charcoal-light">
                  No messages yet. Send the first reply below.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedMessages.map((message, i) => {
                  const isAdmin = message.sender_type === "admin";
                  const prevMessage = sortedMessages[i - 1];
                  const isSameSender =
                    prevMessage &&
                    prevMessage.sender_type === message.sender_type;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isAdmin ? "justify-end" : "justify-start"} ${isSameSender ? "mt-1" : "mt-3"}`}
                    >
                      {/* Visitor avatar for first message in a run */}
                      {!isAdmin && !isSameSender && (
                        <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center self-end rounded-full bg-sage/15 text-[10px] font-bold text-sage-dark">
                          {avatarInitial(activeConversation.visitor_name)}
                        </div>
                      )}
                      {!isAdmin && isSameSender && (
                        <div className="mr-2 w-7 shrink-0" />
                      )}

                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                          isAdmin
                            ? "rounded-br-sm bg-sage text-white"
                            : "rounded-bl-sm border border-sage/10 bg-white text-charcoal"
                        }`}
                      >
                        {!isSameSender && (
                          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider opacity-60">
                            {message.sender_name ||
                              (isAdmin
                                ? "Collins Support"
                                : activeConversation.visitor_name)}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {message.body}
                        </p>
                        <span className="mt-1.5 block text-right text-[10px] opacity-50">
                          {formatDateTime(message.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} className="h-2" />
              </div>
            )}
          </div>

          {/* Reply bar */}
          <form
            onSubmit={handleSendReply}
            className="shrink-0 border-t border-sage/10 bg-white px-3 py-3 lg:px-4 lg:py-4"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-sage/20 bg-offwhite/60 px-3 py-2 focus-within:border-sage transition-colors">
              <textarea
                ref={textareaRef}
                value={reply}
                onChange={handleTextareaChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (reply.trim()) {
                      e.currentTarget.form?.requestSubmit();
                    }
                  }
                }}
                placeholder="Reply to this conversation…"
                rows={1}
                className="min-w-0 flex-1 resize-none bg-transparent text-sm text-charcoal placeholder:text-charcoal-light/50 outline-none"
                style={{ maxHeight: "120px" }}
                maxLength={1600}
              />
              <button
                type="submit"
                disabled={sending || !reply.trim()}
                className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sage text-white transition-all hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send reply"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-charcoal-light/60">
              Press Enter to send · Shift+Enter for new line
            </p>
          </form>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center p-8 text-sm text-charcoal-light">
          Conversation not found.
        </div>
      )}
    </div>
  );

  return (
    // Outer wrapper — fills viewport height on mobile using dvh, fixed height on desktop
    <div
      className="relative flex overflow-hidden rounded-none bg-white
                  lg:h-[calc(100vh-9rem)] lg:rounded-3xl lg:border lg:border-sage/10 lg:shadow-sm"
      style={{ height: "calc(100dvh - 8rem)" }}
    >
      {InboxPanel}
      {ChatPanel}
    </div>
  );
}
