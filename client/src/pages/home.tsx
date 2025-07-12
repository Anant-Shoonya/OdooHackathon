import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import UserCard from "@/components/user-card";
import SwapRequestModal from "@/components/swap-request-modal";
import { getCurrentUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser,
    retry: false,
  });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["/api/users", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      
      const response = await fetch(`/api/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const handleAvailabilityClick = () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please login to check availability and request swaps.",
        variant: "destructive",
      });
    }
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span>Availability</span>
              </Button>
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
                {usersData?.users?.map((user: UserWithSkills) => (
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

              {usersData?.users?.length === 0 && (
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
    </div>
  );
}
