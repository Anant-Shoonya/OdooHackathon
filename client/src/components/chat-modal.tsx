import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  swapRequestId: number;
  otherUserName: string;
  currentUserId: number;
}

interface ChatMessage {
  id: number;
  senderId: number;
  message: string;
  createdAt: string;
}

export default function ChatModal({
  isOpen,
  onClose,
  swapRequestId,
  otherUserName,
  currentUserId,
}: ChatModalProps) {
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();

  const { data: messagesData, isLoading } = useQuery({
    queryKey: ["/api/chats", swapRequestId],
    queryFn: async () => {
      const response = await fetch(`/api/chats/${swapRequestId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
    enabled: isOpen,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest("POST", "/api/chats", {
        swapRequestId,
        message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats", swapRequestId] });
      setNewMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    sendMessageMutation.mutate(newMessage.trim());
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg h-[600px] flex flex-col p-0">
        <DialogHeader className="bg-blue-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Chat with {otherUserName}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-blue-700 p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-slate-600">Loading messages...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {messagesData?.messages?.map((message: ChatMessage) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.senderId === currentUserId
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.senderId === currentUserId 
                            ? 'text-blue-100' 
                            : 'text-slate-500'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {messagesData?.messages?.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-slate-600">
                      No messages yet. Start the conversation!
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t bg-slate-50 flex space-x-3"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={sendMessageMutation.isPending}
            />
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}