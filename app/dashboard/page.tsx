"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { InboxChatPanel } from "@/components/inbox-chat-panel";
import {
  Archive,
  ArrowDownUp,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Command,
  Inbox,
  ListFilter,
  Mail,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Settings2,
  Sparkles,
  Star,
  UserRound,
  X,
} from "lucide-react";
import { apiConfigured, useThreads } from "@/lib/store";
import { overdueDays, timeAgo } from "@/lib/radar";
import { classificationStyle, confidenceBarStyle } from "@/lib/classification";
import type { Thread } from "@/lib/types";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  summary: string;
  time: string;
  classification: string;
  segment: string;
  confidence: number;
  initials: string;
  color: string;
  unread?: boolean;
  starred?: boolean;
  avatar?: string;
  archived?: boolean;
  needsReview?: boolean;
  handledBy?: string | null;
  handledAt?: string;
  overdue?: number | null;
  lastAt?: number;
};

function toMessage(thread: Thread): Message {
  const lastMsg = thread.messages[thread.messages.length - 1];
  const time = new Date(lastMsg.sentAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const isToday = new Date(lastMsg.sentAt).toDateString() === new Date().toDateString();
  const displayTime = isToday ? time : new Date(lastMsg.sentAt).toLocaleDateString("en-US", { weekday: "short" });

  const sender = thread.participants.find(
    (p) => p.email !== "jordan@postmark.in" && p.email !== "jordan@personal.in"
  );
  const senderName = sender?.name || "Unknown";
  const senderEmail = sender?.email || "";
  const initials = senderName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return {
    id: thread.id,
    name: senderName,
    email: senderEmail,
    subject: thread.subject,
    summary: thread.summary,
    time: displayTime,
    classification: thread.classification,
    segment: thread.segment,
    confidence: thread.confidence,
    initials,
    unread: !thread.isRead,
    starred: thread.isImportant,
    archived: thread.isArchived,
    needsReview: thread.needsReview,
    handledBy: thread.handledBy,
    handledAt: thread.handledAt,
    overdue: overdueDays(thread),
    lastAt: new Date(lastMsg.sentAt).getTime(),
  };
}
const sections = [
  {
    label: "WORKSPACE",
    items: [
      { name: "Inbox", icon: Inbox },
      { name: "Assistant to Reply", icon: Send },
      { name: "Client to Reply", icon: Mail },
      { name: "No Reply Needed", icon: Check },
      { name: "Action Required", icon: ListFilter },
      { name: "Waiting for Response", icon: Clock3 },
      { name: "Meetings", icon: CalendarDays },
    ],
  },
  {
    label: "PERSONAL",
    items: [
      { name: "Important", icon: Star },
      { name: "Archived", icon: Archive },
    ],
  },
];
function buildStats(messages: Message[]) {
  const live = messages.filter((m) => !m.archived);
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const unread = live.filter((m) => m.unread).length;
  const action = live.filter((m) => !m.handledBy && ["Assistant to Reply", "Action Required"].includes(m.classification)).length;
  const client = live.filter((m) => !m.handledBy && m.classification === "Client to Reply").length;
  const review = live.filter((m) => m.needsReview).length;
  return [
    { label: "Total emails", value: String(live.length), change: `${live.filter((m) => (m.lastAt ?? 0) > dayAgo).length} in the last 24h`, icon: Inbox, tone: "text-slate-500", mark: "bg-slate-100" },
    { label: "Unread", value: String(unread), change: unread ? "Waiting to be opened" : "Inbox is read", icon: Mail, tone: "text-indigo-600", mark: "bg-indigo-50" },
    { label: "Needs action", value: String(action), change: review ? `${review} flagged for review` : "AI is confident", icon: ListFilter, tone: "text-amber-600", mark: "bg-amber-50" },
    { label: "Client attention", value: String(client), change: client ? (live.some((m) => m.overdue) ? `${live.filter((m) => m.overdue).length} overdue — nudge them` : "Waiting on the client") : "All handled", icon: Bell, tone: "text-emerald-600", mark: "bg-emerald-50" },
  ];
}

export default function DashboardPage() {
  const [activeFolder, setActiveFolder] = useState("Inbox");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All mail");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [sortRecent, setSortRecent] = useState(true);
  const [toast, setToast] = useState("");
  const { threads, error, mode, loading, refresh, simulateEmail } = useThreads();
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const messages = useMemo(
    () => threads.map(toMessage).sort((a, b) => (b.lastAt ?? 0) - (a.lastAt ?? 0)),
    [threads],
  );
  const stats = useMemo(() => buildStats(messages), [messages]);
  const counts = useMemo(() => {
    const live = messages.filter((m) => !m.archived);
    const c: Record<string, number> = { Inbox: live.length, Important: live.filter((m) => m.starred).length, Archived: messages.length - live.length };
    live.forEach((m) => { c[m.classification] = (c[m.classification] ?? 0) + 1; });
    return c;
  }, [messages]);
  const shownMessages = useMemo(() => {
    let result = messages.filter((m) => {
      if (activeFolder === "Archived") return m.archived;
      if (m.archived) return false;
      return (
        activeFolder === "Inbox" ||
        m.classification === activeFolder ||
        (activeFolder === "Important" && m.starred)
      );
    });
    if (filter === "Unread") result = result.filter((m) => m.unread);
    if (filter === "Starred") result = result.filter((m) => m.starred);
    if (filter === "Needs review") result = result.filter((m) => m.needsReview);
    if (query.trim())
      result = result.filter((m) =>
        `${m.name} ${m.email} ${m.subject} ${m.summary}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      );
    return sortRecent ? result : [...result].reverse();
  }, [messages, activeFolder, filter, query, sortRecent]);

  async function handleSimulate() {
    const created = await simulateEmail();
    if (created) {
      setToast(`New email received — AI classified it as ${created.classification}`);
      window.setTimeout(() => setToast(""), 3200);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f8fa] text-slate-900 antialiased">
      <div
        inert={chatOpen}
        className="mx-auto flex min-h-screen max-w-[1600px] overflow-x-hidden"
      >
        {mobileNav && (
          <button
            aria-label="Close navigation"
            onClick={() => setMobileNav(false)}
            className="fixed inset-0 z-20 bg-slate-950/20 lg:hidden"
          />
        )}
        <aside
          className={`fixed inset-y-0 left-0 z-30 flex w-[260px] flex-col border-r border-slate-200/80 bg-[#fbfcfd] transition-transform lg:static lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex h-[76px] items-center justify-between px-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5"
              aria-label="Postmark home"
            >
              <span className="grid size-8 place-items-center rounded-[10px] bg-indigo-600 text-white shadow-sm shadow-indigo-200">
                <Mail className="size-[17px]" strokeWidth={2.4} />
              </span>
              <span className="text-[16px] font-semibold tracking-[-0.04em]">
                postmark<span className="text-indigo-600">.</span>
              </span>
            </Link>
            <button
              aria-label="Close navigation"
              onClick={() => setMobileNav(false)}
              className="rounded-md p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="mx-4 mb-5 flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-[13px] font-semibold text-indigo-700">
              JD
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                Jordan Davis
              </p>
              <p className="truncate text-[13px] text-slate-500">
                Personal workspace
              </p>
            </div>
            <ChevronDown className="size-3.5 text-slate-400" />
          </div>
          <nav
            aria-label="Email folders"
            className="flex-1 overflow-y-auto px-3 pb-5"
          >
            {sections.map((section) => (
              <div key={section.label} className="mb-6">
                <p className="mb-2 px-3 text-[13px] font-bold tracking-[0.14em] text-slate-400">
                  {section.label}
                </p>
                <ul className="flex flex-col gap-0.5">
                  {section.items.map(({ name, icon: Icon }) => (
                    <li key={name}>
                      <button
                        onClick={() => {
                          setActiveFolder(name);
                          setMobileNav(false);
                        }}
                        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${activeFolder === name ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"}`}
                      >
                        <Icon
                          className={`size-[15px] shrink-0 ${activeFolder === name ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}
                          strokeWidth={1.8}
                        />
                        <span
                          className={`flex-1 ${activeFolder === name ? "font-semibold" : "font-medium"}`}
                        >
                          {name}
                        </span>
                        {counts[name] > 0 && (
                          <span
                            className={`text-xs tabular-nums ${activeFolder === name ? "font-semibold text-indigo-600" : "text-slate-400"}`}
                          >
                            {counts[name]}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <div className="border-t border-slate-200/80 p-3">
            <Link
              href="/settings/accounts"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              <Settings2 className="size-4 text-slate-400" />
              Settings{" "}
              <span className="ml-auto">
                <Command className="size-3.5" />
              </span>
              <span className="-ml-2 text-xs">,</span>
            </Link>
            <div className="mt-2 flex items-center justify-between px-3 text-xs text-slate-400">
              <span>Free plan</span>
              <button className="font-semibold text-indigo-600 hover:text-indigo-700">
                Upgrade plan <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-[70px] items-center gap-2 border-b border-slate-200/80 bg-white/90 px-3 backdrop-blur-md sm:gap-3 sm:px-7 lg:px-9">
            <button
              aria-label="Open navigation"
              onClick={() => setMobileNav(true)}
              className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 lg:hidden"
            >
              <Menu className="size-4" />
            </button>
            <div className="relative flex min-w-0 flex-1 items-center sm:max-w-[440px]">
              <Search className="pointer-events-none absolute left-3 size-4 text-slate-400 sm:left-3.5" />
              <input
                ref={searchRef}
                aria-label="Search email"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search emails..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50 sm:h-10 sm:pl-10 sm:pr-14"
              />
              <kbd className="absolute right-2.5 hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-400 shadow-[0_1px_1px_rgba(15,23,42,0.04)] sm:inline-block">
                ⌘ K
              </kbd>
            </div>
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleSimulate}
                className="hidden h-9 items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 text-[13px] font-semibold text-indigo-700 transition hover:bg-indigo-100 sm:inline-flex"
              >
                <Sparkles className="size-3.5" />
                <span className="hidden md:inline">Simulate new email</span>
                <span className="md:hidden">Simulate</span>
              </button>
              <Link
                href="/client"
                className="hidden h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[13px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 sm:inline-flex sm:px-3"
              >
                <UserRound className="size-3.5 text-slate-400" />
                <span className="hidden sm:inline">Switch to client view</span>
                <span className="sm:hidden">Client</span>
              </Link>
              <button
                onClick={() =>
                  setFilter(
                    filter === "All mail"
                      ? "Unread"
                      : filter === "Unread"
                        ? "Starred"
                        : filter === "Starred"
                          ? "Needs review"
                          : "All mail",
                  )
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[13px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:gap-2 sm:px-3"
              >
                <ListFilter className="size-3.5 text-slate-400" />
                <span className="hidden sm:inline">
                  {filter === "All mail" ? "Filters" : filter}
                </span>
                <span className="text-xs text-slate-600 sm:hidden">
                  {filter === "All mail" ? "Filter" : filter}
                </span>
                <ChevronDown className="hidden size-3 text-slate-400 sm:block" />
              </button>
              <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />
              <button
                onClick={() => setChatOpen(true)}
                aria-label="Ask your inbox"
                className="grid size-9 shrink-0 place-items-center rounded-lg border border-indigo-100 bg-indigo-50/70 text-indigo-700 transition hover:border-indigo-200 hover:bg-indigo-50 sm:inline-flex sm:h-9 sm:w-auto sm:gap-1.5 sm:px-3 sm:text-xs sm:font-semibold"
              >
                <Sparkles className="size-3.5" />
                <span className="hidden sm:inline">Ask inbox</span>
              </button>
              <button
                aria-label="Notifications"
                className="relative hidden size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 sm:grid"
              >
                <Bell className="size-[17px]" />
                <span className="absolute right-[9px] top-[8px] size-1.5 rounded-full bg-indigo-500 ring-2 ring-white" />
              </button>
              <div className="ml-1 grid size-8 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 ring-2 ring-white">
                JD
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1320px] px-4 pb-8 pt-8 sm:px-7 sm:pt-9 lg:px-10 lg:pt-10">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <span>Workspace</span>
                  <ChevronRight className="size-3" />
                  <span className="text-slate-600">{activeFolder}</span>
                </div>
                <h1 className="text-[25px] font-semibold tracking-[-0.045em] text-slate-900 sm:text-[28px]">
                  {activeFolder}
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  Your inbox, thoughtfully organized.
                </p>
              </div>
              <button
                onClick={() => {
                  setQuery("");
                  setFilter("All mail");
                  setActiveFolder("Inbox");
                }}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-3.5 text-[13px] font-semibold text-white shadow-sm shadow-indigo-200/70 transition hover:bg-indigo-700"
              >
                <Plus className="size-3.5" />
                Compose email
              </button>
            </div>
            {mode === "demo" && error && (
              <p className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
                <span>{error}</span>
                {apiConfigured && <button onClick={() => refresh()} className="font-semibold underline underline-offset-2">Retry</button>}
              </p>
            )}
            <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              {stats.map(({ label, value, change, icon: Icon, tone, mark }) => (
                <article
                  key={label}
                  className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] sm:p-[18px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-slate-500">
                      {label}
                    </span>
                    <span
                      className={`grid size-7 place-items-center rounded-lg ${mark}`}
                    >
                      <Icon
                        className={`size-[14px] ${tone}`}
                        strokeWidth={1.8}
                      />
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-[25px] font-semibold tracking-[-0.05em] text-slate-900">
                      {value}
                    </span>
                    <span className="hidden text-xs text-slate-400 sm:inline">
                      emails
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{change}</p>
                </article>
              ))}
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.025)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setFilter("All mail")}
                    className={`min-h-[44px] rounded-md px-2.5 py-1.5 text-[13px] font-semibold ${filter === "All mail" ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:bg-slate-50"}`}
                  >
                    All mail{" "}
                    <span className="ml-1 text-xs text-slate-400">
                      {messages.filter((m) => !m.archived).length}
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      setFilter(filter === "Unread" ? "All mail" : "Unread")
                    }
                    className={`min-h-[44px] rounded-md px-2.5 py-1.5 text-[13px] font-medium ${filter === "Unread" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50"}`}
                  >
                    Unread{" "}
                    <span className="ml-1 text-xs text-slate-400">
                      {messages.filter((m) => !m.archived && m.unread).length}
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      setFilter(filter === "Starred" ? "All mail" : "Starred")
                    }
                    className={`min-h-[44px] rounded-md px-2.5 py-1.5 text-[13px] font-medium ${filter === "Starred" ? "bg-amber-50 text-amber-700" : "text-slate-500 hover:bg-slate-50"}`}
                  >
                    Starred
                  </button>
                </div>
                <button
                  onClick={() => setSortRecent(!sortRecent)}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
                >
                  <ArrowDownUp className="size-3" />
                  Newest first <ChevronDown className="size-3" />
                </button>
              </div>
              <div className="hidden grid-cols-[minmax(190px,0.82fr)_minmax(240px,1.1fr)_minmax(260px,1.35fr)_minmax(140px,0.65fr)_minmax(130px,0.65fr)] items-center gap-4 border-b border-slate-100 bg-slate-50/45 px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-400 md:grid">
                <span>Sender</span>
                <span>Subject</span>
                <span>AI summary</span>
                <span>Classification</span>
                <span className="text-right">Received</span>
              </div>
              {loading && apiConfigured && (
                <div aria-label="Loading emails" className="divide-y divide-slate-100">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="animate-pulse px-5 py-4">
                      <div className="h-3 w-40 rounded bg-slate-100" />
                      <div className="mt-3 h-3 w-3/4 rounded bg-slate-100" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              )}
              {shownMessages.length === 0 && !(loading && apiConfigured) && (
                <div className="px-6 py-16 text-center">
                  <p className="text-sm font-semibold text-slate-700">Nothing here yet</p>
                  <p className="mt-1 text-[13px] text-slate-500">No conversations match this view. Try another folder or clear the search.</p>
                </div>
              )}
              <div role="list" aria-label="Email messages">
                {shownMessages.map((message) => (
                  <div
                    role="listitem"
                    key={message.id}
                    onClick={() =>
                      setSelectedId(
                        selectedId === message.id ? null : message.id,
                      )
                    }
                    className={`group flex w-full cursor-pointer flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 text-left transition hover:bg-slate-50/70 md:grid md:grid-cols-[minmax(190px,0.82fr)_minmax(240px,1.1fr)_minmax(260px,1.35fr)_minmax(140px,0.65fr)_minmax(130px,0.65fr)] md:items-center md:gap-4 md:border-b md:border-slate-100/90 md:rounded-none md:px-5 md:py-4 ${message.unread ? "bg-indigo-50/15" : ""}`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div
                        className={`relative grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${message.color}`}
                      >
                        {message.initials}
                        {message.unread && (
                          <span className="absolute -left-1 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-indigo-500 ring-2 ring-white" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`truncate text-[13px] ${message.unread ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}
                        >
                          {message.name}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {message.email}
                        </p>
                      </div>
                    </div>
                    <div className="min-w-0 md:col-span-2">
                      <p
                        className={`truncate text-[13px] ${message.unread ? "font-semibold text-slate-800" : "font-medium text-slate-700"}`}
                      >
                        {message.subject}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-slate-500 md:hidden">
                        {message.summary}
                      </p>
                    </div>
                    <p className="hidden truncate text-xs leading-relaxed text-slate-500 md:block">
                      {message.summary}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 md:contents">
                      {(() => {
                        const { chip, dot } = classificationStyle(message.classification);
                        return (
                          <span className={chip}>
                            <span className={dot} aria-hidden="true" />
                            {message.classification}
                          </span>
                        );
                      })()}
                      {message.needsReview && (
                        <span className="inline-flex rounded-md bg-amber-50 px-1.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">Needs review</span>
                      )}
                      {message.overdue ? (
                        <span className="inline-flex rounded-md bg-orange-50 px-1.5 py-1 text-[11px] font-semibold text-orange-700 ring-1 ring-inset ring-orange-200" title="Reply Radar: the client has not replied yet">Client quiet for {message.overdue} days</span>
                      ) : null}
                      {message.handledBy && (
                        <span className="inline-flex rounded-md bg-emerald-50 px-1.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">Handled by {message.handledBy}{message.handledAt ? ` · ${timeAgo(message.handledAt)}` : ""}</span>
                      )}
                      <div className="flex items-center gap-1 text-[13px] text-slate-400">
                        <span className="h-[3px] w-[48px] overflow-hidden rounded-full bg-slate-100">
                          <span
                            className={`${confidenceBarStyle(message.confidence)} block h-full rounded-full`}
                            style={{ width: `${message.confidence}%` }}
                          />
                        </span>
                        <span className="text-xs tabular-nums text-slate-500">{message.confidence}%</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between gap-2 self-start md:contents">
                      <div className="flex items-center gap-2">
                        {message.starred && (
                          <Star
                            className="size-3 text-amber-400"
                            fill="currentColor"
                            strokeWidth={1.5}
                          />
                        )}
                        <span className="whitespace-nowrap text-xs text-slate-400">
                          {message.time}
                        </span>
                      </div>
                      <Link
                        href={`/conversation/${message.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex min-h-[44px] items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                        aria-label={`Open conversation with ${message.name}`}
                      >
                        Open
                        <ArrowUpRight className="size-3" />
                      </Link>
                      <MoreHorizontal className="hidden size-4 text-slate-300 group-hover:block md:hidden" />
                    </div>
                    {/* Removed inline message preview box on row click */}
                  </div>
                ))}
              </div>
              {shownMessages.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto grid size-10 place-items-center rounded-xl bg-slate-100">
                    <Search className="size-4 text-slate-400" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No emails found
                  </p>
                  <p className="mt-1 text-[13px] text-slate-500">
                    Try another search or choose a different filter.
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/40 px-4 py-3 sm:px-5">
                <span className="text-xs text-slate-400">
                  Showing{" "}
                  <span className="font-medium text-slate-600">
                    {shownMessages.length ? 1 : 0}–{shownMessages.length}
                  </span>{" "}
                  of 128 emails
                </span>
                <div className="flex items-center gap-1">
                  <button
                    aria-label="Previous page"
                    className="grid size-7 place-items-center rounded-md border border-slate-200 bg-white text-slate-400 hover:text-slate-700"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>
                  <span className="px-2 text-xs text-slate-500">
                    Page <span className="font-semibold text-slate-700">1</span>{" "}
                    of 11
                  </span>
                  <button
                    aria-label="Next page"
                    className="grid size-7 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-slate-800"
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-slate-400">
              AI classifications are suggestions and may not always be accurate.
            </p>
          </div>
        </section>
      </div>
      <div aria-live="polite" className={`fixed bottom-5 left-1/2 z-30 flex max-w-[92vw] -translate-x-1/2 items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-[13px] font-medium text-white shadow-xl transition ${toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}>
        <Sparkles className="size-3.5 text-indigo-300" />{toast}
      </div>
      <InboxChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        onOpenEmail={(id) => {
          const found = messages.find((m) => m.id === id);
          if (found) setSelectedId(found.id);
          setChatOpen(false);
        }}
      />
    </main>
  );
}
