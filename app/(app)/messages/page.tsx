"use client";

import * as React from "react";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Send,
  Trash2,
  VolumeX,
  Check,
  CheckCheck,
  Loader2,
  MessageCircle,
  Users,
  X,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context";
import useChat from "@/hooks/use-chat"; // Use the new useChat hook for individual conversations
import useMessages from "@/hooks/use-messages"; // Use the new useMessages hook for conversation list
import { LoadingSpinner } from "@/components/loading-spinner";
import { toDate } from "@/lib/firebase-services";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchParams, useRouter } from "next/navigation";
import {
  doc,
  setDoc,
  onSnapshot,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ConversationType {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: Date | { toDate?: () => Date };
  updatedAt?: Date;
  author?: {
    id: string;
    username: string;
    displayName?: string;
    photoURL?: string;
  };
}

// New ChatListItem component (inline for now, can be moved to components/ later)
function ChatListItem({
  conversation,
  isSelected,
  onSelect,
  onDelete,
  onMute,
  dbUserId,
}: {
  conversation: ConversationType;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMute: () => void;
  dbUserId: string;
}) {
  const displayUser = conversation.author;
  const unreadCount =
    conversation.receiverId === dbUserId && !conversation.isRead ? 1 : 0;
  const lastMessageTime = conversation.updatedAt
    ? new Date(conversation.updatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  
  // Check if message is recent (within last 5 minutes) for real-time indicator
  const isRecent = conversation.updatedAt && 
    (new Date().getTime() - new Date(conversation.updatedAt).getTime()) < 5 * 60 * 1000;

  return (
    <div
      className={`group flex items-center space-x-3 p-3 rounded-xl w-full text-left transition-all duration-200 relative cursor-pointer shadow-md ${
        isSelected
          ? "bg-orange-600/30 border border-orange-500"
          : "hover:bg-gray-900/80"
      }`}
      onClick={onSelect}
      tabIndex={0}
      aria-selected={isSelected}
      role="button"
    >
      <div className="relative">
        <Avatar className="h-11 w-11 border-2 border-orange-500 shadow-orange-500/30 shadow-md">
          <AvatarImage
            src={displayUser?.photoURL || "/placeholder.svg"}
            alt={displayUser?.username}
          />
          <AvatarFallback>
            {displayUser?.username?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        {/* Online indicator - you can implement actual online status later */}
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-white truncate text-base">
            {displayUser?.displayName || "Unknown User"}
          </span>
          {isRecent && (
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          )}
        </div>
        <span className="text-sm text-gray-400 truncate max-w-[180px]">
          {conversation.content}
        </span>
      </div>
      <div className="flex flex-col items-end ml-2 min-w-[48px]">
        <span className="text-xs text-gray-500 mb-1">{lastMessageTime}</span>
        {unreadCount > 0 && (
          <span className="bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-orange-500/40 shadow animate-pulse">
            {unreadCount}
          </span>
        )}
      </div>
      {/* Quick actions: show on hover or always on mobile */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <button
          className="p-1 rounded-full bg-gray-800 hover:bg-orange-600 text-gray-400 hover:text-white focus:outline-none"
          title="Mute"
          onClick={(e) => {
            e.stopPropagation();
            onMute();
          }}
        >
          <VolumeX className="h-4 w-4" />
        </button>
        <button
          className="p-1 rounded-full bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white focus:outline-none"
          title="Delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Add deleteChat function
async function deleteChat(currentUserId: string, otherUserId: string) {
  if (
    !window.confirm(
      "Are you sure you want to delete this chat? This cannot be undone.",
    )
  )
    return;
  const conversationId = [currentUserId, otherUserId].sort().join("_");
  const messagesQuery = query(
    collection(db, "messages"),
    where("conversationId", "==", conversationId),
  );
  const snapshot = await getDocs(messagesQuery);
  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

export default function MessagesPage() {
  const { dbUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatWith = searchParams.get("chatWith");
  const [selectedConversation, setSelectedConversation] = useState<ConversationType | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use the new hooks
  const { conversations, isLoading: isLoadingConversations, isError: isErrorConversations } = useMessages(dbUser?.id || "");
  const { messages, isLoadingMessages, isErrorMessages, sendMessage } = useChat(
    dbUser?.id || "",
    chatWith || ""
  );

  // Add typing indicator state
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  // Add mobile state
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const [showInboxMobile, setShowInboxMobile] = useState(true);

  // Move handleInput function outside of useEffect to avoid scoping issues
  const handleInput = (typing: boolean) => {
    if (!dbUser?.id || !chatWith) return;
    
    const typingDocId = [dbUser.id, chatWith].sort().join("_");
    const typingDocRef = doc(db, "typingStatus", typingDocId);
    
    setIsTyping(typing);
    if (typing) {
      setDoc(typingDocRef, { typing: dbUser.id });
    } else {
      deleteDoc(typingDocRef);
    }
  };

  // Typing indicator Firestore logic
  useEffect(() => {
    if (!dbUser?.id || !chatWith) return;
    const typingDocId = [dbUser.id, chatWith].sort().join("_");
    const typingDocRef = doc(db, "typingStatus", typingDocId);

    const typingTimeout: NodeJS.Timeout | null = null;

    // Listen for typing status from the other user
    const unsubscribe = onSnapshot(typingDocRef, (docSnap) => {
      const data = docSnap.data();
      setOtherUserTyping(Boolean(data && data.typing && data.typing !== dbUser.id));
    });

    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
      unsubscribe();
      deleteDoc(typingDocRef);
    };
  }, [dbUser?.id, chatWith]);

  // Find the selected chat user from conversations
  const selectedChatUser =
    conversations.find(
      (conv) =>
        conv.senderId === chatWith ||
        conv.receiverId === chatWith,
    )?.author || null; // Fallback to null if not found

  // Add robust null check and error fallback for selectedChatUser
  const chatUserError =
    chatWith && !selectedChatUser
      ? "This conversation cannot be loaded. The user may no longer exist."
      : null;

  useEffect(() => {
    if (chatWith && chatWith !== selectedConversation?.id) {
      setSelectedConversation(null); // Clear selected conversation if chatWith changes
    }
  }, [chatWith, selectedConversation?.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark messages as read when a chat is selected and messages load
  // This logic is now handled internally by useChat or a separate markMessagesAsRead hook if needed.
  // The previous markMessagesAsRead was part of use-messages.ts, which is now the inbox hook.
  // I'll add a direct call to firebase-services.ts for markMessagesAsRead here for the active chat.
  useEffect(() => {
    if (dbUser && chatWith && messages && messages.length > 0) {
      // Only mark messages sent by the other user as read
      const unreadMessagesFromOtherUser = messages.filter(
        (msg) => msg.senderId === chatWith && !msg.isRead,
      );
      if (unreadMessagesFromOtherUser.length > 0) {
        // Call the service directly or create a specific mutation for it
        // For simplicity, I'll call the service directly here.
        // In a larger app, this might be a dedicated mutation.
        import("@/lib/firebase-services").then(({ markMessagesAsRead }) => {
          markMessagesAsRead(chatWith, dbUser.id);
        });
      }
    }
  }, [dbUser, chatWith, messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUser || !chatWith || !messageInput.trim()) return;

    sendMessage(
      {
        senderId: dbUser.id,
        receiverId: chatWith,
        content: messageInput.trim(),
      },
      {
        onSuccess: () => {
          setMessageInput("");
        },
      },
    );
  };

  // Mobile interaction effect
  useEffect(() => {
    if (chatWith && isMobile) {
      setShowInboxMobile(false);
    }
  }, [chatWith, isMobile]);

  if (!dbUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white max-w-4xl mx-auto p-4 md:p-6">
        <div className="glass-card p-8 rounded-lg shadow-md text-center max-w-md">
          <MessageCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Start Connecting</h2>
          <p className="text-gray-400 mb-6">Log in to start chatting with your adventure community and plan your next expedition together.</p>
          <Link href="/login">
            <Button className="bg-orange-600 hover:bg-orange-700">Login to Continue</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Helper function to convert Firestore timestamp to Date
  const getDateFromTimestamp = (timestamp: any): Date => {
    if (!timestamp) return new Date(0);
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    return new Date(timestamp);
  };

  // Sort conversations: unread first, then by latest message timestamp (if available)
  const sortedConversations = [...conversations].sort((a, b) => {
    const aUnread = a.receiverId === dbUser.id && !a.isRead ? 1 : 0;
    const bUnread = b.receiverId === dbUser.id && !b.isRead ? 1 : 0;
    if (aUnread !== bUnread) return bUnread - aUnread;
    // Sort by createdAt instead of updatedAt since it doesn't exist on Message type
    if (a.createdAt && b.createdAt) {
      const aTime = getDateFromTimestamp(a.createdAt);
      const bTime = getDateFromTimestamp(b.createdAt);
      return bTime.getTime() - aTime.getTime();
    }
    return 0;
  });

  const handleBackToInbox = () => {
    setSelectedConversation(null);
    router.replace("/messages");
    if (isMobile) setShowInboxMobile(true);
  };

  const handleDeleteChat = async (conversationId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this chat? This cannot be undone.",
      )
    )
      return;
    await deleteChat(dbUser?.id || "", conversationId);
    setSelectedConversation(null); // Clear selected conversation after deletion
    router.replace("/messages");
    if (isMobile) setShowInboxMobile(true);
  };

  const handleMuteChat = (conversationId: string) => {
    alert("Mute chat coming soon!");
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="glass-card rounded-lg shadow-md flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">Messages</h1>
          {chatWith && (
            <Button
              variant="ghost"
              onClick={handleBackToInbox}
              className="text-gray-400 hover:text-orange-500"
            >
              ← Back to Inbox
            </Button>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Conversation List */}
          <div className={`${chatWith ? "hidden md:block" : "block"} w-full md:w-1/3 border-r border-gray-700`}>
            <ScrollArea className="h-full">
              {isLoadingConversations ? (
                <div className="flex justify-center items-center h-32">
                  <div className="text-center">
                    <LoadingSpinner className="mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Loading conversations...</p>
                  </div>
                </div>
              ) : isErrorConversations ? (
                <div className="p-4 text-center">
                  <X className="h-12 w-12 text-red-500 mx-auto mb-3" />
                  <p className="text-red-500 mb-3">Failed to load conversations.</p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Try Again
                  </Button>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="relative mb-4">
                    <MessageCircle className="h-16 w-16 text-gray-500 mx-auto" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No Conversations Yet</h3>
                  <p className="text-gray-400 mb-4 text-sm">
                    Start connecting with other adventurers! Your conversations will appear here in real-time.
                  </p>
                  <div className="space-y-2 text-xs text-gray-500 mb-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Users className="h-3 w-3 text-green-500" />
                      <span>Follow other users to start chatting</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <MessageCircle className="h-3 w-3 text-blue-500" />
                      <span>Join plans to message participants</span>
                    </div>
                  </div>
                  <Link href="/explore">
                    <Button size="sm" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
                      Explore Users
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {conversations.map((conversation) => (
                    <ChatListItem
                      key={conversation.id}
                      conversation={conversation}
                      isSelected={conversation.id === selectedConversation?.id}
                      onSelect={() => setSelectedConversation(conversation)}
                      onDelete={() => handleDeleteChat(conversation.id)}
                      onMute={() => handleMuteChat(conversation.id)}
                      dbUserId={dbUser.id}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className={`${chatWith ? "block" : "hidden md:block"} flex-1 flex flex-col`}>
            {chatUserError ? (
              <div className="flex flex-col items-center justify-center h-full text-red-500">
                <X className="h-16 w-16 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Conversation Error</h3>
                <p className="text-center mb-4 max-w-md">{chatUserError}</p>
                <button
                  className="mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                  onClick={() => {
                    setSelectedConversation(null);
                    router.replace("/messages");
                  }}
                >
                  Back to Inbox
                </button>
              </div>
            ) : selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation.author?.photoURL || "/placeholder.svg"} alt={selectedConversation.author?.username || "User"} />
                      <AvatarFallback>{selectedConversation.author?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-white">{selectedConversation.author?.displayName || "Unknown User"}</h3>
                      <p className="text-sm text-gray-400">@{selectedConversation.author?.username || "unknown"}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="text-center">
                        <LoadingSpinner className="mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Loading messages...</p>
                      </div>
                    </div>
                  ) : isErrorMessages ? (
                    <div className="text-center">
                      <X className="h-12 w-12 text-red-500 mx-auto mb-3" />
                      <p className="text-red-500 mb-3">Failed to load messages.</p>
                      <Button 
                        onClick={() => window.location.reload()} 
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="relative mb-4">
                        <MessageCircle className="h-16 w-16 text-gray-500" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Start a Conversation!</h3>
                      <p className="text-gray-400 mb-4 max-w-sm">
                        Send the first message to begin your adventure together. Your messages will appear here in real-time.
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        <span>Ready to chat</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.senderId === dbUser.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                              message.senderId === dbUser.id
                                ? "bg-orange-600 text-white"
                                : "bg-gray-700 text-white"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {getDateFromTimestamp(message.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <Input
                      ref={inputRef}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-orange-500"
                      onFocus={() => handleInput(true)}
                      onBlur={() => handleInput(false)}
                    />
                    <Button type="submit" disabled={!messageInput.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Select a Conversation</h3>
                  <p className="text-gray-400">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
