"use client"
import { useState, useEffect, useCallback } from "react";
import { Send, Search} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { timeAgo, cn } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  markAsRead,
  setCurrentConversation,
} from "@/features/message/store/messageSlice";
import { Badge } from "@/components/ui/Badge";

export default function MessagesPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const {
    conversations,
    messages,
    currentConversationId,
    isLoading,
  } = useAppSelector((s) => s.message);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchConvo, setSearchConvo] = useState("");

  // Fetch conversations on mount
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (activeConv) {
      dispatch(setCurrentConversation(activeConv));
      dispatch(fetchMessages({ conversationId: activeConv }));
      dispatch(markAsRead(activeConv));
    }
  }, [activeConv, dispatch]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !user || !currentConversationId) return;

    // Validation: Candidates can only reply to existing conversations
    if (user.role === "candidate" && !conversations.find((c) => c._id === currentConversationId)) {
      console.error("Candidates can only reply to existing conversations");
      return;
    }

    const activeConvData = conversations.find((c) => c._id === currentConversationId);
    if (!activeConvData) return;

    const otherParticipant = activeConvData.participants.find((p) => p._id !== user._id);
    if (!otherParticipant) return;

    try {
      await dispatch(
        sendMessage({
          receiverId: otherParticipant._id,
          content: newMessage.trim(),
          jobContext: activeConvData.jobContext?._id,
        })
      ).unwrap();
      setNewMessage("");
      dispatch(fetchMessages({ conversationId: currentConversationId as string }));
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  }, [newMessage, user, currentConversationId, conversations, dispatch]);

  const activeConvData = conversations.find((c) => c._id === activeConv);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex gap-6 h-[calc(100vh-4rem)]">

      {/* ── Conversation List ──────────────────────────── */}
      <div className="w-80 flex-shrink-0 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchConvo}
              onChange={(e) => setSearchConvo(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No conversations yet</div>
          ) : (
            conversations.filter((conv) => {
              const otherParticipant = conv.participants.find((p) => p._id !== user?._id);
              if (!otherParticipant) return false;
              return otherParticipant.name.toLowerCase().includes(searchConvo.toLowerCase());
            }).map((conv) => {
              const otherParticipant = conv.participants.find((p) => p._id !== user?._id);
              if (!otherParticipant) return null;

              return (
                <button
                  key={conv._id}
                  onClick={() => setActiveConv(conv._id)}
                  className={cn(
                    "relative w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0",
                    activeConv === conv._id && "bg-blue-50 border-blue-100"
                  )}
                >
                  <Avatar src={otherParticipant.avatar} name={otherParticipant.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 truncate">{otherParticipant.name}</p>
                      <span className="text-xs text-gray-400 shrink-0 ml-2">{timeAgo(conv.updatedAt || conv.createdAt || '')}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {conv.lastMessage ? conv.lastMessage.content : "No messages yet"}
                    </p>
                  </div>
                  <div className="absolute bottom-2 right-4">
                    {(conv?.unreadCount && conv.unreadCount !== 0) ? (
                      <Badge variant="info" className="text-xs">
                        {conv?.unreadCount}
                      </Badge>
                    ) : ""}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chat Window ──────────────────────────────── */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden">
        {activeConvData ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {(() => {
                  const otherParticipant = activeConvData.participants.find((p) => p._id !== user?._id);
                  return (
                    <>
                      <Avatar src={otherParticipant?.avatar} name={otherParticipant?.name || "Unknown"} size="md" showStatus status="online" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{otherParticipant?.name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">
                          {(otherParticipant as any)?.designation || otherParticipant?.role} · Re: {activeConvData.jobContext?.title || "General"}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Job Context Banner */}
            {activeConvData.jobContext?.title && (
              <div className="px-5 py-2.5 bg-blue-50 border-b border-blue-100">
                <p className="text-xs text-blue-700">
                  💼 Regarding: <strong>{activeConvData.jobContext.title}</strong>
                </p>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {isLoading && messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm">No messages yet. Start the conversation!</div>
              ) : (
                messages.map((msg) => {
                  const isMine = user ? msg.senderId === user._id : false;
                  const senderName = isMine
                    ? user?.name
                    : activeConvData.participants.find((p) => p._id !== user?._id)?.name;

                  return (
                    <div key={msg._id} className={cn("flex gap-3", isMine && "flex-row-reverse")}>
                      <Avatar src={isMine ? user?.avatar : activeConvData.participants.find((p) => p._id !== user?._id)?.avatar} name={senderName || "Unknown"} size="sm" />
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
                })
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
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
  );
}
