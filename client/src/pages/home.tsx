import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, Calendar, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Navbar from "@/components/navbar";
import UserCard from "@/components/user-card";
import SwapRequestModal from "@/components/swap-request-modal";
import Chatbot from "@/components/chatbot";
import { getCurrentUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const AVAILABILITY_OPTIONS = [
  { value: "weekday-mornings", label: "Weekday Mornings" },
  { value: "weekday-afternoons", label: "Weekday Afternoons" },
  { value: "weekday-evenings", label: "Weekday Evenings" },
  { value: "weekend-mornings", label: "Weekend Mornings" },
  { value: "weekend-afternoons", label: "Weekend Afternoons" },
  { value: "weekend-evenings", label: "Weekend Evenings" }
];

interface UserWithSkills {
  id: number;
  name: string;
  email: string;
  location?: string;
  profilePicture?: string;
  skillsOffered: Array<{ id: number; name: string; type: string }>;
  reviewsReceived: Array<{ rating: number; comment: string }>;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithSkills | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser,
    retry: false,
  });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["/api/users", searchQuery, selectedAvailability],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedAvailability.length > 0) {
        selectedAvailability.forEach(availability => {
          params.append("availability", availability);
        });
      }
      
      const response = await fetch(`/api/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const handleAvailabilityClick = () => {
    setShowAvailabilityModal(true);
  };

  const handleAvailabilityChange = (value: string, checked: boolean) => {
    if (checked) {
      setSelectedAvailability([...selectedAvailability, value]);
    } else {
      setSelectedAvailability(selectedAvailability.filter(item => item !== value));
    }
  };

  const clearAvailabilityFilter = () => {
    setSelectedAvailability([]);
  };

  const handleRequestSwap = (user: UserWithSkills) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please login to request swaps.",
        variant: "destructive",
      });
      return;
    }
    setSelectedUser(user);
    setShowSwapModal(true);
  };

  const calculateMatchScore = (user: UserWithSkills) => {
    // Simple scoring algorithm - can be enhanced with actual API
    const baseScore = 70;
    const skillBonus = Math.min(user.skillsOffered.length * 5, 20);
    const reviewBonus = user.reviewsReceived.length > 0 
      ? Math.min(user.reviewsReceived.reduce((acc, review) => acc + review.rating, 0) / user.reviewsReceived.length * 2, 10)
      : 0;
    
    return Math.min(baseScore + skillBonus + reviewBonus, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Filters Section */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleAvailabilityClick}
                className="flex items-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Availability</span>
                {selectedAvailability.length > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 ml-2">
                    {selectedAvailability.length}
                  </span>
                )}
              </Button>
              {selectedAvailability.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAvailabilityFilter}
                  className="flex items-center space-x-1 text-slate-600 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                  <span>Clear Filter</span>
                </Button>
              )}
            </div>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search skills (e.g., Excel, Photoshop)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Profile Cards Grid */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-slate-600">Loading users...</div>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {usersData?.users
                  ?.filter((user: UserWithSkills) => user.id !== currentUser?.id)
                  ?.map((user: UserWithSkills) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      matchScore={calculateMatchScore(user)}
                      onRequestSwap={() => handleRequestSwap(user)}
                      onViewProfile={() => setLocation(`/profile/${user.id}`)}
                      isLoggedIn={!!currentUser}
                    />
                  ))}
              </div>

              {usersData?.users?.filter((user: UserWithSkills) => user.id !== currentUser?.id)?.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-slate-600">No users found matching your search.</div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Swap Request Modal */}
      {showSwapModal && selectedUser && currentUser && (
        <SwapRequestModal
          targetUser={selectedUser}
          currentUser={currentUser}
          isOpen={showSwapModal}
          onClose={() => setShowSwapModal(false)}
        />
      )}

      {/* Availability Modal */}
      <Dialog open={showAvailabilityModal} onOpenChange={setShowAvailabilityModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter by Availability</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 mb-4">
              Filter users by their available time slots for skill swaps.
            </p>
            <div className="space-y-3">
              <div className="text-sm font-medium text-slate-700">Select time slots:</div>
              <div className="space-y-2">
                {AVAILABILITY_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={selectedAvailability.includes(option.value)}
                      onCheckedChange={(checked) => 
                        handleAvailabilityChange(option.value, checked as boolean)
                      }
                    />
                    <label 
                      htmlFor={option.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <Button 
                variant="outline" 
                onClick={clearAvailabilityFilter}
                disabled={selectedAvailability.length === 0}
              >
                Clear All
              </Button>
              <Button onClick={() => setShowAvailabilityModal(false)}>
                Apply Filter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
