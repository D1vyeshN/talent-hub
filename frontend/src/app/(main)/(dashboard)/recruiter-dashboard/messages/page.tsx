"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MOCK_MESSAGES, MOCK_RECRUITER } from "@/lib/mockData";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";

export default function MessagesPage() {
  const [messages] = useState(MOCK_MESSAGES);
  const [selected, setSelected] = useState(messages[0]?.id || null);

  // Group messages by conversation
  const conversations = messages.reduce<Record<string, typeof messages>>((acc, m) => {
    const otherId = m.senderId === MOCK_RECRUITER.id ? m.receiverId : m.senderId;
    if (!acc[otherId]) acc[otherId] = [];
    acc[otherId].push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-500 mt-1">
          Chat with candidates about job opportunities
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card padding="none" className="lg:col-span-1">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Conversations</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {Object.keys(conversations).length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No conversations yet. Messages will appear here when candidates reach out.
              </div>
            ) : (
              Object.keys(conversations).map((convId) => {
                const last = conversations[convId][conversations[convId].length - 1];
                const isActive = selected === convId;
                return (
                  <button
                    key={convId}
                    onClick={() => setSelected(convId)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors",
                      isActive && "bg-blue-50",
                    )}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                      {convId.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">Candidate {convId}</p>
                        <span className="text-[11px] text-gray-400">{timeAgo(last.sentAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{last.content}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Message Thread */}
        <Card padding="none" className="lg:col-span-2 flex flex-col min-h-[480px]">
          <CardHeader className="border-b border-gray-100">
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          {selected ? (
            <>
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {conversations[selected]?.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex gap-3 max-w-[80%]",
                      m.senderId === MOCK_RECRUITER.id ? "ml-auto flex-row-reverse" : "",
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0",
                        m.senderId === MOCK_RECRUITER.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600",
                      )}
                    >
                      {m.senderId === MOCK_RECRUITER.id ? "Me" : "C"}
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm",
                        m.senderId === MOCK_RECRUITER.id
                          ? "bg-blue-600 text-white rounded-tr-sm"
                          : "bg-gray-100 text-gray-900 rounded-tl-sm",
                      )}
                    >
                      <p>{m.content}</p>
                      <p
                        className={cn(
                          "text-[10px] mt-1",
                          m.senderId === MOCK_RECRUITER.id
                            ? "text-blue-100"
                            : "text-gray-400",
                        )}
                      >
                        {timeAgo(m.sentAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <Input placeholder="Type a message..." className="flex-1" />
                  <Button variant="primary" icon={<Send className="w-4 h-4" />}>
                    Send
                  </Button>
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
    </div>
  );
}