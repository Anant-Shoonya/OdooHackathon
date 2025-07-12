import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Navbar from "@/components/navbar";
import SwapRequestModal from "@/components/swap-request-modal";
import { getCurrentUser } from "@/lib/auth";
import { useState } from "react";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  location?: string;
  profilePicture?: string;
  skillsOffered: Array<{ id: number; name: string; type: string }>;
  reviewsReceived: Array<{
    id: number;
    rating: number;
    comment: string;
    reviewer: { name: string };
  }>;
}

export default function OtherProfile() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [showSwapModal, setShowSwapModal] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser,
    retry: false,
  });

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["/api/users", id],
    queryFn: async () => {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) throw new Error("Failed to fetch user profile");
      return response.json();
    },
  });

  const user: UserProfile | undefined = profileData?.user;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">User not found</div>
        </div>
      </div>
    );
  }

  const offeredSkills = user.skillsOffered.filter(s => s.type === 'offered');
  const wantedSkills = user.skillsOffered.filter(s => s.type === 'wanted');

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-slate-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation("/home")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Button>
            <Button onClick={() => setShowSwapModal(true)}>
              Request Swap
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Info */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-start space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="text-xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-slate-800 mb-2">{user.name}</h1>
                  {user.location && (
                    <p className="text-slate-600 mb-4">{user.location}</p>
                  )}
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Skills Offered</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {offeredSkills.map((skill) => (
                        <Badge key={skill.id} className="bg-blue-100 text-blue-700">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {wantedSkills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">Skills Wanted</h3>
                      <div className="flex flex-wrap gap-2">
                        {wantedSkills.map((skill) => (
                          <Badge key={skill.id} className="bg-purple-100 text-purple-700">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              {user.reviewsReceived.length > 0 ? (
                <div className="space-y-6">
                  {user.reviewsReceived.map((review) => (
                    <div key={review.id} className="border-b border-slate-200 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {review.reviewer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-slate-800">
                              {review.reviewer.name}
                            </span>
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <p className="text-slate-600">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600">No reviews yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Swap Request Modal */}
      {showSwapModal && currentUser && (
        <SwapRequestModal
          targetUser={user}
          currentUser={currentUser}
          isOpen={showSwapModal}
          onClose={() => setShowSwapModal(false)}
        />
      )}
    </div>
  );
}
