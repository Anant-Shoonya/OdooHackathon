// Top unchanged imports
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X } from "lucide-react";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  otherUserName: string;
  currentUserId: number;
  swapRequestId: number; // still passed but unused here
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
  otherUserName,
  currentUserId
}: ChatModalProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      senderId: currentUserId,
      message: "Hey! I'm interested in your dancing skills.",
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      senderId: 999, // assume 999 is the other user
      message: "Sure! I can teach you some basic steps.",
      createdAt: new Date().toISOString()
    }
  ]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = newMessage.trim();
    if (!msg) return;

    const newId = messages.length + 1;

    const userMessage: ChatMessage = {
      id: newId,
      senderId: currentUserId,
      message: msg,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");

    // Simulate reply from other user after 2s
    setTimeout(() => {
      const reply: ChatMessage = {
        id: newId + 1,
        senderId: 999,
        message: "Thanks for the message! Let's schedule a session.",
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
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
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.senderId === currentUserId
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.senderId === currentUserId
                          ? "text-blue-100"
                          : "text-slate-500"
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
            />
            <Button
              type="submit"
              disabled={!newMessage.trim()}
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
