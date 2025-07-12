import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface SwapRequestModalProps {
  targetUser: {
    id: number;
    name: string;
    skillsOffered: Array<{ id: number; name: string; type: string }>;
  };
  currentUser: {
    id: number;
    name: string;
    skillsOffered?: Array<{ id: number; name: string; type: string }>;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function SwapRequestModal({ 
  targetUser, 
  currentUser, 
  isOpen, 
  onClose 
}: SwapRequestModalProps) {
  const [formData, setFormData] = useState({
    offeredSkill: "",
    requestedSkill: "",
    message: "",
  });
  const { toast } = useToast();

  const myOfferedSkills = currentUser.skillsOffered?.filter(s => s.type === 'offered') || [];
  const theirOfferedSkills = targetUser.skillsOffered.filter(s => s.type === 'offered');

  const createRequestMutation = useMutation({
    mutationFn: async (data: { 
      targetId: number; 
      offeredSkill: string; 
      requestedSkill: string; 
      message?: string;
    }) => {
      return apiRequest("POST", "/api/swap-requests", data);
    },
    onSuccess: () => {
      toast({
        title: "Request sent!",
        description: "Your swap request has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/swap-requests"] });
      onClose();
      setFormData({ offeredSkill: "", requestedSkill: "", message: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Request failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.offeredSkill || !formData.requestedSkill) {
      toast({
        title: "Missing information",
        description: "Please select both skills for the swap.",
        variant: "destructive",
      });
      return;
    }

    createRequestMutation.mutate({
      targetId: targetUser.id,
      offeredSkill: formData.offeredSkill,
      requestedSkill: formData.requestedSkill,
      message: formData.message || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Skill Swap with {targetUser.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="offered-skill">Choose One of Your Skills to Offer</Label>
            <Select value={formData.offeredSkill} onValueChange={(value) => 
              setFormData({ ...formData, offeredSkill: value })
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill..." />
              </SelectTrigger>
              <SelectContent>
                {myOfferedSkills.map((skill) => (
                  <SelectItem key={skill.id} value={skill.name}>
                    {skill.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="requested-skill">Choose One of Their Skills You Want</Label>
            <Select value={formData.requestedSkill} onValueChange={(value) => 
              setFormData({ ...formData, requestedSkill: value })
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill..." />
              </SelectTrigger>
              <SelectContent>
                {theirOfferedSkills.map((skill) => (
                  <SelectItem key={skill.id} value={skill.name}>
                    {skill.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Tell them why you'd like to swap skills..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createRequestMutation.isPending}
              className="flex-1"
            >
              {createRequestMutation.isPending ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
