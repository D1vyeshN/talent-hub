"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  markAsRead,
  setCurrentConversation,
} from "@/features/message/store/messageSlice";
import { Avatar } from "@/components/ui/Avatar";
import { useSearchParams } from "next/navigation";
import { getSocket } from "@/shared/lib/socket";

export default function MessagesPage() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { user } = useAppSelector((s) => s.auth);
  const {
    conversations,
    tempConversation,
    messages,
    currentConversationId,
    isLoading,
  } = useAppSelector((s) => s.message);
  const [selected, setSelected] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const selectedConversation = conversations.find((c) => c._id === selected);

  const candidateId =
    tempConversation?.participants.find(
      (el) => el.role === "candidate"
    )?._id || searchParams.get("candidateId");
  const jobId = tempConversation?.jobContext?._id || searchParams.get("jobId");

  // Fetch conversations on mount
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Handle starting a new conversation from query params
  useEffect(() => {
    if (candidateId && jobId && conversations.length > 0) {
      // Check if conversation already exists with this candidate for this job
      const existingConv = conversations.find((conv) => {
        const hasCandidate = conv.participants.some((p) => p._id === candidateId);
        const hasJobContext = conv.jobContext?._id === jobId;
        return hasCandidate && hasJobContext;
      });

      if (existingConv) {
        // Use setTimeout to avoid synchronous setState
        const timer = setTimeout(() => {
          setSelected(existingConv._id);
        }, 0);
        return () => clearTimeout(timer);
      } else {
        // Check if there's any conversation with this candidate (different job)
        const anyConvWithCandidate = conversations.find((conv) => {
          return conv.participants.some((p) => p._id === candidateId);
        });
        console.log("anyConvWithCandidate", anyConvWithCandidate);
        if (anyConvWithCandidate) {
          // Select the existing conversation with this candidate
          const timer = setTimeout(() => {
            setSelected(anyConvWithCandidate._id);
          }, 0);
          return () => clearTimeout(timer);
        } else {
          // No conversation exists with this candidate at all
          // Set to "temp_conversation" to indicate we want to start a new conversation
          const timer = setTimeout(() => {
            setSelected("temp_conversation");
          }, 0);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [candidateId, jobId, conversations]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (selected && selected !== "temp_conversation") {
      dispatch(setCurrentConversation(selected));
      dispatch(fetchMessages({ conversationId: selected }));
      dispatch(markAsRead(selected));
    }
  }, [selected, dispatch]);

  useEffect(() => {
  const socket = getSocket();

  socket.emit("user:activity", {
    conversationId: selected,
  });

  return () => {
    socket.emit("user:activity", {
      conversationId: null,
    });
  };
}, [selected]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !user) return;

    // Handle temp_conversation conversation case
    if (selected === "temp_conversation" && candidateId && jobId) {
      try {
        await dispatch(
          sendMessage({
            receiverId: candidateId,
            content: newMessage.trim(),
            jobContext: jobId,
          })
        ).unwrap();
        setNewMessage("");
        // After sending first message, the conversation will be created
        // and we'll need to refresh conversations and select the temp_conversation one
        dispatch(fetchConversations());
      } catch (err) {
        console.error("Failed to send message:", err);
      }
      return;
    }

    // Handle existing conversation case
    if (!currentConversationId) return;

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
  }, [newMessage, user, selected, candidateId, jobId, currentConversationId, conversations, dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-500 mt-1">
          Chat with candidates about job opportunities
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12.5rem)]">
        {/* Conversations List */}
        <Card padding="none" className="lg:col-span-1">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Candidates</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {isLoading && conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No conversations yet. Messages will appear here when candidates reach out.
              </div>
            ) : (
              conversations.map((conv) => {
                const otherParticipant = conv.participants.find((p) => p._id !== user?._id);
                if (!otherParticipant) return null;

                const isActive = selected === conv._id;
                return (
                  <button
                    key={conv._id}
                    onClick={() => setSelected(conv._id)}
                    className={cn(
                      "relative w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors",
                      isActive && "bg-blue-50",
                    )}
                  >
                    <Avatar src={otherParticipant.avatar} name={otherParticipant.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{otherParticipant.name}</p>
                        {(conv?.createdAt || conv?.updatedAt) && <span className="text-[11px] text-gray-400">{timeAgo(((conv?.updatedAt || conv?.createdAt) ?? "") as string)}</span>}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
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
        </Card>

        {/* Message Thread */}
        <Card padding="none" className="lg:col-span-2 flex flex-col min-h-[480px]">

          {selected ? (
            <>
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const otherParticipant = selectedConversation?.participants.find((p) => p._id !== user?._id);
                      return (
                        <>
                          <Avatar src={otherParticipant?.avatar} name={otherParticipant?.name || "Unknown"} size="md" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{otherParticipant?.name || "Unknown"}</p>
                            <p className="text-xs text-gray-500">
                              {(otherParticipant as any)?.designation || otherParticipant?.role} · Re: {selectedConversation?.jobContext?.title || "General"} ({selectedConversation?.jobContext?._id})
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </CardHeader>
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {isLoading && messages.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm">No messages yet. Start the conversation!</div>
                ) : (
                  messages.map((m) => {
                    const isMine = user ? m.senderId === user._id : false;
                    const otherParticipant = selectedConversation?.participants.find((p) => p._id !== user?._id);

                    return (
                      <div
                        key={m._id}
                        className={cn(
                          "flex gap-3 max-w-[80%]",
                          isMine ? "ml-auto flex-row-reverse" : "",
                        )}
                      >
                        <Avatar
                          src={isMine ? user?.avatar : otherParticipant?.avatar}
                          name={(isMine ? user?.name : otherParticipant?.name) || "Candidate"}
                          size="sm"
                        />
                        <div className={cn("max-w-sm", isMine && "items-end flex flex-col")}>
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-sm",
                            isMine
                              ? "bg-blue-600 text-white rounded-tr-sm"
                              : "bg-gray-100 text-gray-900 rounded-tl-sm",
                          )}
                        >
                          <p>{m.content}</p>
                        </div>
                        <p
                          className={cn(
                            "text-[10px] mt-1",
                            "text-gray-400",
                          )}
                        >
                          {timeAgo(m.sentAt)}
                        </p>
                                                </div>
                      </div>

                    );
                  })
                )}
              </div>
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
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              Select a conversation to start messaging
            </div>
          )}
        </Card>
      </div>
    </div >
  );
}