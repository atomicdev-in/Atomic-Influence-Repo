import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BrandDashboardLayout } from "@/components/BrandDashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquare,
  Send,
  Search,
  CheckCheck,
  Check,
  Clock,
  ArrowLeft,
  Info,
  Paperclip,
  Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCampaignMessages, useConversations, MessageStatus } from "@/hooks/useCampaignMessages";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

const BrandMessages = () => {
  const { user } = useAuth();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileViewingChat, setIsMobileViewingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { conversations, isLoading: conversationsLoading, refetch: refetchConversations } = useConversations('brand');
  const { 
    messages, 
    isLoading: messagesLoading, 
    isSending, 
    sendMessage, 
    markAllAsRead 
  } = useCampaignMessages({ 
    campaignId: selectedCampaignId || undefined, 
    userRole: 'brand' 
  });

  const selectedConversation = conversations.find(c => c.campaign_id === selectedCampaignId);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.campaign_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.brand_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when opening a conversation
  useEffect(() => {
    if (selectedCampaignId) {
      markAllAsRead();
    }
  }, [selectedCampaignId, markAllAsRead]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCampaignId) return;
    
    await sendMessage(newMessage);
    setNewMessage("");
    refetchConversations();
  };

  const handleSelectConversation = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setIsMobileViewingChat(true);
  };

  const handleBackToList = () => {
    setIsMobileViewingChat(false);
  };

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'read':
        return <CheckCheck className="h-3 w-3 text-cyan" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-white/50" />;
      case 'sent':
        return <Check className="h-3 w-3 text-white/50" />;
      default:
        return <Clock className="h-3 w-3 text-white/50" />;
    }
  };

  return (
    <BrandDashboardLayout>
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
              "w-full md:w-80 lg:w-96 glass rounded-l-2xl border-r border-white/10 flex flex-col",
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
                  <p className="text-xs text-muted-foreground">Creator communications</p>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 rounded-xl"
                />
              </div>
            </div>

            {/* Conversations */}
            <ScrollArea className="flex-1">
              <div className="p-2">
                {conversationsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.campaign_id}
                      onClick={() => handleSelectConversation(conv.campaign_id)}
                      className={cn(
                        "w-full p-3 rounded-xl text-left transition-all duration-200 mb-1",
                        selectedCampaignId === conv.campaign_id
                          ? "bg-primary/20 border border-primary/30"
                          : "hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12 rounded-xl">
                          <AvatarImage src={conv.brand_logo} />
                          <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary/20 to-pink/20">
                            {conv.campaign_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-foreground truncate">
                              {conv.campaign_name}
                            </span>
                            {conv.last_message_time && (
                              <span className="text-xs text-muted-foreground shrink-0">
                                {formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: false })}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-foreground/70 truncate">
                              {conv.last_message || "No messages yet"}
                            </p>
                            {conv.unread_count > 0 && (
                              <Badge className="gradient-primary text-white border-0 text-xs px-2 ml-2 shrink-0">
                                {conv.unread_count}
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
                          {conv.status === "active" ? "In Progress" : conv.status === "completed" ? "Concluded" : "Paused"}
                        </Badge>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No active campaigns with creators</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Messaging becomes available when creators accept campaign invitations
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div
            className={cn(
              "flex-1 glass rounded-r-2xl flex flex-col",
              !isMobileViewingChat ? "hidden md:flex" : "flex",
              !selectedCampaignId && "hidden md:flex"
            )}
          >
            {selectedConversation ? (
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
                    <Avatar className="h-10 w-10 rounded-xl">
                      <AvatarImage src={selectedConversation.brand_logo} />
                      <AvatarFallback className="rounded-xl">
                        {selectedConversation.campaign_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold text-foreground">
                        {selectedConversation.campaign_name}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Creator communication channel
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        "text-xs hidden sm:flex",
                        selectedConversation.status === "active"
                          ? "bg-success/20 text-success border-success/30"
                          : "bg-muted text-muted-foreground border-white/10"
                      )}
                    >
                      {selectedConversation.status === "active" ? "In Progress" : "Concluded"}
                    </Badge>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <Info className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mb-3 opacity-50" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation with your creator</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex",
                            msg.sender_role === "brand" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] rounded-2xl px-4 py-3",
                              msg.sender_role === "brand"
                                ? "gradient-primary text-white rounded-br-md"
                                : "bg-white/5 text-foreground rounded-bl-md"
                            )}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <div
                              className={cn(
                                "flex items-center gap-1 mt-1",
                                msg.sender_role === "brand" ? "justify-end" : "justify-start"
                              )}
                            >
                              <span className={cn(
                                "text-xs",
                                msg.sender_role === "brand" ? "text-white/70" : "text-muted-foreground"
                              )}>
                                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                              </span>
                              {msg.sender_role === "brand" && getStatusIcon(msg.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                {selectedConversation.status === "active" ? (
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
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                        className="flex-1 bg-white/5 border-white/10 rounded-xl"
                        disabled={isSending}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSending}
                        className="gradient-primary text-white rounded-xl"
                      >
                        {isSending ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-t border-white/10 bg-muted/20">
                    <p className="text-center text-sm text-muted-foreground">
                      This campaign has concluded. Messaging is no longer available.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">Campaign Communications</h3>
                <p className="text-sm text-center max-w-sm">
                  Select a campaign to view and send messages to assigned creators.
                  All communications are scoped to their respective campaign context.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </PageTransition>
    </BrandDashboardLayout>
  );
};

export default BrandMessages;
