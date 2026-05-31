"use client"
import { useState } from "react";
import { Send, Search, MoreHorizontal, Phone, Video } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { MOCK_MESSAGES, MOCK_RECRUITER, MOCK_CANDIDATE } from "@/lib/mockData";
import { timeAgo, cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";

const CONVERSATIONS = [
  {
    id: "conv1",
    participant: MOCK_RECRUITER,
    lastMessage: "Would you be open to a 30-min intro call this week?",
    unread: 1,
    time: "11:00 AM",
    jobContext: "Senior Frontend Engineer @ Google",
  },
  {
    id: "conv2",
    participant: { id: "r2", name: "Ankit Gupta", email: "ankit@razorpay.com", role: "recruiter" as const, company: "Razorpay", companyId: "c2", designation: "Technical Recruiter", postedJobs: [], createdAt: "" },
    lastMessage: "We'd love to invite you for a technical interview.",
    unread: 0,
    time: "Yesterday",
    jobContext: "Full Stack Developer @ Razorpay",
  },
  {
    id: "conv3",
    participant: { id: "r3", name: "Shruti Iyer", email: "shruti@swiggy.com", role: "recruiter" as const, company: "Swiggy", companyId: "c3", designation: "HR Manager", postedJobs: [], createdAt: "" },
    lastMessage: "Thank you for your interest in the Data Scientist role.",
    unread: 0,
    time: "Mon",
    jobContext: "Data Scientist @ Swiggy",
  },
];

export default function MessagesPage() {
  const { user } = useAppSelector((s) => s.auth);
  const [activeConv, setActiveConv] = useState(CONVERSATIONS[0].id);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  const sendMessage = () => {
    if (!newMessage.trim() || !user) return;
    const msg = {
      id: `m${Date.now()}`,
      senderId: user.id,
      receiverId: "r1",
      content: newMessage.trim(),
      sentAt: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  const activeConvData = CONVERSATIONS.find((c) => c.id === activeConv);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex gap-6 max-h-[calc(100vh-8rem)]">

        {/* ── Conversation List ──────────────────────────── */}
        <div className="w-80 flex-shrink-0 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {CONVERSATIONS.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv.id)}
                className={cn(
                  "w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0",
                  activeConv === conv.id && "bg-blue-50 border-blue-100"
                )}
              >
                <Avatar name={conv.participant.name} size="md" showStatus status="online" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 truncate">{conv.participant.name}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{conv.time}</span>
                  </div>
                  <p className="text-xs text-blue-500 mt-0.5 truncate">{conv.jobContext}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full text-white text-xs font-bold flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Chat Window ──────────────────────────────── */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden">
          {activeConvData ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Avatar name={activeConvData.participant.name} size="md" showStatus status="online" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{activeConvData.participant.name}</p>
                    <p className="text-xs text-gray-500">
                      {(activeConvData.participant as {designation?: string}).designation} · Re: {activeConvData.jobContext}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Job Context Banner */}
              <div className="px-5 py-2.5 bg-blue-50 border-b border-blue-100">
                <p className="text-xs text-blue-700">
                  💼 Regarding: <strong>{activeConvData.jobContext}</strong>
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                {messages.map((msg) => {
                  const isMine = user ? msg.senderId === user.id : msg.senderId === "u1";
                  const senderName = isMine
                    ? (user?.name || MOCK_CANDIDATE.name)
                    : activeConvData.participant.name;

                  return (
                    <div key={msg.id} className={cn("flex gap-3", isMine && "flex-row-reverse")}>
                      <Avatar name={senderName} size="sm" />
                      <div className={cn("max-w-sm", isMine && "items-end flex flex-col")}>
                        <div
                          className={cn(
                            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                            isMine
                              ? "bg-blue-600 text-white rounded-tr-sm"
                              : "bg-gray-100 text-gray-800 rounded-tl-sm"
                          )}
                        >
                          {msg.content}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{timeAgo(msg.sentAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-4">💬</div>
                <p className="text-base font-semibold text-gray-700">Select a conversation</p>
                <p className="text-sm text-gray-400 mt-1">Choose a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
