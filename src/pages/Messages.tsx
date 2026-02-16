import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { PageErrorBoundary, SectionErrorBoundary } from "@/components/PageErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  Search,
  CheckCheck,
  Clock,
  Image,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  campaignId: string;
  campaignName: string;
  brandName: string;
  brandLogo: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isActive: boolean;
  status: "active" | "completed" | "pending";
  messages: Message[];
}

// Loading skeleton for messages page
const MessagesSkeleton = () => (
  <div className="h-[calc(100vh-2rem)] m-4 flex overflow-hidden">
    {/* Conversation list skeleton */}
    <div className="w-full md:w-80 lg:w-96 glass rounded-l-2xl border-r border-white/10 flex flex-col">
      <div className="p-4 border-b border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
      <div className="flex-1 p-2 space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3 rounded-xl space-y-2">
            <div className="flex items-start gap-3">
              <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    {/* Chat area skeleton */}
    <div className="hidden md:flex flex-1 glass rounded-r-2xl flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <Skeleton className={`h-16 rounded-2xl ${i % 2 === 0 ? 'w-2/3' : 'w-1/2'}`} />
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-white/10">
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  </div>
);

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileViewingChat, setIsMobileViewingChat] = useState(false);

  // Mock conversations - only shows campaigns user is assigned to
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "conv-1",
      campaignId: "summer-skincare",
      campaignName: "Summer Skincare Collection",
      brandName: "GlowSkin Co.",
      brandLogo: "🧴",
      lastMessage: "Great! We'll send you the products by Friday.",
      lastMessageTime: "2 min ago",
      unreadCount: 2,
      isActive: true,
      status: "active",
      messages: [
        {
          id: "msg-1",
          senderId: "brand",
          content: "Hi! We're so excited to have you on board for our Summer Skincare Collection campaign! 🎉",
          timestamp: "Yesterday, 10:30 AM",
          isRead: true,
        },
        {
          id: "msg-2",
          senderId: "user",
          content: "Thank you! I'm really excited to work with GlowSkin Co. The products look amazing!",
          timestamp: "Yesterday, 11:15 AM",
          isRead: true,
        },
        {
          id: "msg-3",
          senderId: "brand",
          content: "We'll be sending you our new serum, moisturizer, and SPF. Could you confirm your shipping address?",
          timestamp: "Yesterday, 2:00 PM",
          isRead: true,
        },
        {
          id: "msg-4",
          senderId: "user",
          content: "Of course! It's 123 Creator Street, London, UK, W1A 1AA",
          timestamp: "Yesterday, 2:30 PM",
          isRead: true,
        },
        {
          id: "msg-5",
          senderId: "brand",
          content: "Perfect! We've noted that down.",
          timestamp: "Today, 9:00 AM",
          isRead: true,
        },
        {
          id: "msg-6",
          senderId: "brand",
          content: "Great! We'll send you the products by Friday.",
          timestamp: "Today, 9:02 AM",
          isRead: false,
        },
      ],
    },
    {
      id: "conv-2",
      campaignId: "tech-review",
      campaignName: "Smart Home Essentials",
      brandName: "TechFlow",
      brandLogo: "🏠",
      lastMessage: "The video looks fantastic! Just a few minor tweaks...",
      lastMessageTime: "1 hour ago",
      unreadCount: 0,
      isActive: true,
      status: "active",
      messages: [
        {
          id: "msg-1",
          senderId: "brand",
          content: "You have been assigned to the Smart Home Essentials campaign. Review the brief and confirm your participation.",
          timestamp: "3 days ago",
          isRead: true,
        },
        {
          id: "msg-2",
          senderId: "user",
          content: "Thanks! I've received the smart hub and it's really impressive. Planning to start filming tomorrow.",
          timestamp: "3 days ago",
          isRead: true,
        },
        {
          id: "msg-3",
          senderId: "brand",
          content: "That's great to hear! Here are some key features we'd love you to highlight...",
          timestamp: "2 days ago",
          isRead: true,
        },
        {
          id: "msg-4",
          senderId: "user",
          content: "Got it! I've finished the first draft of the video. Here's a preview link for your review.",
          timestamp: "Yesterday",
          isRead: true,
        },
        {
          id: "msg-5",
          senderId: "brand",
          content: "The video looks fantastic! Just a few minor tweaks...",
          timestamp: "1 hour ago",
          isRead: true,
        },
      ],
    },
    {
      id: "conv-3",
      campaignId: "streetwear",
      campaignName: "Streetwear Spring Drop",
      brandName: "Urban Threads",
      brandLogo: "👕",
      lastMessage: "Congratulations on completing the campaign! 🎊",
      lastMessageTime: "2 days ago",
      unreadCount: 0,
      isActive: false,
      status: "completed",
      messages: [
        {
          id: "msg-1",
          senderId: "brand",
          content: "Hey! Thanks for joining our Streetwear Spring Drop campaign!",
          timestamp: "2 weeks ago",
          isRead: true,
        },
        {
          id: "msg-2",
          senderId: "user",
          content: "Excited to be part of this! The collection looks fire 🔥",
          timestamp: "2 weeks ago",
          isRead: true,
        },
        {
          id: "msg-3",
          senderId: "brand",
          content: "Your content has been performing amazingly! Great engagement.",
          timestamp: "5 days ago",
          isRead: true,
        },
        {
          id: "msg-4",
          senderId: "brand",
          content: "Congratulations on completing the campaign! 🎊",
          timestamp: "2 days ago",
          isRead: true,
        },
      ],
    },
  ]);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.brandName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConversation = conversations.find((c) => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const updatedConversations = conversations.map((conv) => {
      if (conv.id === selectedConversation) {
        const newMsg: Message = {
          id: `msg-${Date.now()}`,
          senderId: "user",
          content: newMessage,
          timestamp: "Just now",
          isRead: true,
        };
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessage: newMessage,
          lastMessageTime: "Just now",
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setNewMessage("");
  };

  const handleSelectConversation = (convId: string) => {
    setSelectedConversation(convId);
    setIsMobileViewingChat(true);
    
    // Mark messages as read
    setConversations(prev => prev.map(conv => {
      if (conv.id === convId) {
        return {
          ...conv,
          unreadCount: 0,
          messages: conv.messages.map(msg => ({ ...msg, isRead: true }))
        };
      }
      return conv;
    }));
  };

  const handleBackToList = () => {
    setIsMobileViewingChat(false);
  };

  return (
    <DashboardLayout>
      <PageErrorBoundary>
        <PageTransition>
          <motion.div 
            className="h-[calc(100vh-2rem)] m-4 flex overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
        {/* Conversation List */}
        <div
          className={cn(
            "w-full md:w-80 lg:w-96 glass rounded-l-2xl md:rounded-l-2xl border-r border-white/10 flex flex-col",
            isMobileViewingChat ? "hidden md:flex" : "flex"
          )}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Campaign Messages</h1>
                <p className="text-xs text-muted-foreground">Communication log</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search communications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 rounded-xl"
              />
            </div>
          </div>

          {/* Conversations */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={cn(
                      "w-full p-3 rounded-xl text-left transition-all duration-200 mb-1",
                      selectedConversation === conv.id
                        ? "bg-primary/20 border border-primary/30"
                        : "hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-pink/20 flex items-center justify-center text-2xl shrink-0">
                        {conv.brandLogo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-foreground truncate">
                            {conv.brandName}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {conv.lastMessageTime}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mb-1">
                          {conv.campaignName}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-foreground/70 truncate">
                            {conv.lastMessage}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge className="gradient-primary text-white border-0 text-xs px-2 ml-2 shrink-0">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge
                        className={cn(
                          "text-xs",
                          conv.status === "active"
                            ? "bg-success/20 text-success border-success/30"
                            : conv.status === "completed"
                            ? "bg-muted text-muted-foreground border-white/10"
                            : "bg-orange/20 text-orange border-orange/30"
                        )}
                      >
                        {conv.status === "active" ? "Active" : conv.status === "completed" ? "Concluded" : "Pending Review"}
                      </Badge>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No communications found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div
          className={cn(
            "flex-1 glass rounded-r-2xl md:rounded-r-2xl flex flex-col",
            !isMobileViewingChat ? "hidden md:flex" : "flex",
            !selectedConversation && "hidden md:flex"
          )}
        >
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={handleBackToList}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-pink/20 flex items-center justify-center text-xl">
                    {activeConversation.brandLogo}
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      {activeConversation.brandName}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {activeConversation.campaignName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      "text-xs hidden sm:flex",
                      activeConversation.status === "active"
                        ? "bg-success/20 text-success border-success/30"
                        : "bg-muted text-muted-foreground border-white/10"
                    )}
                  >
                    {activeConversation.status === "active" ? "In Progress" : "Concluded"}
                  </Badge>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Info className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {activeConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.senderId === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-3",
                          msg.senderId === "user"
                            ? "gradient-primary text-white rounded-br-md"
                            : "bg-white/5 text-foreground rounded-bl-md"
                        )}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <div
                          className={cn(
                            "flex items-center gap-1 mt-1",
                            msg.senderId === "user" ? "justify-end" : "justify-start"
                          )}
                        >
                          <span className={cn(
                            "text-xs",
                            msg.senderId === "user" ? "text-white/70" : "text-muted-foreground"
                          )}>
                            {msg.timestamp}
                          </span>
                          {msg.senderId === "user" && (
                            <CheckCheck className={cn(
                              "h-3 w-3",
                              msg.isRead ? "text-cyan" : "text-white/50"
                            )} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              {activeConversation.status === "active" ? (
                <div className="p-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0">
                      <Image className="h-5 w-5" />
                    </Button>
                    <Input
                      placeholder="Compose message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1 bg-white/5 border-white/10 rounded-xl"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="gradient-primary text-white rounded-xl shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-t border-white/10 text-center">
                  <p className="text-muted-foreground text-sm">
                    This campaign has been completed. Messages are read-only.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Select a conversation
                </h3>
                <p className="text-muted-foreground max-w-xs">
                  Choose a campaign conversation from the list to start messaging with brands
                </p>
              </div>
            </div>
          )}
        </div>
        </motion.div>
      </PageTransition>
      </PageErrorBoundary>
    </DashboardLayout>
  );
};

export default Messages;
