import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Navbar from "@/components/navbar";
import { getCurrentUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface SwapRequest {
  id: number;
  requesterId: number;
  targetId: number;
  offeredSkill: string;
  requestedSkill: string;
  message?: string;
  status: string;
  createdAt: string;
  requester: {
    id: number;
    name: string;
    email: string;
    profilePicture?: string;
  };
}

export default function Requests() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser,
  });

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["/api/swap-requests"],
    queryFn: async () => {
      const response = await fetch("/api/swap-requests", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch requests");
      return response.json();
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: number; status: string }) => {
      return apiRequest("PUT", `/api/swap-requests/${requestId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/swap-requests"] });
      toast({
        title: "Request updated",
        description: "The request has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAcceptRequest = (requestId: number) => {
    updateRequestMutation.mutate({ requestId, status: "accepted" });
  };

  const handleRejectRequest = (requestId: number) => {
    updateRequestMutation.mutate({ requestId, status: "rejected" });
  };

  if (!currentUser) {
    setLocation("/login");
    return null;
  }

  const requests: SwapRequest[] = requestsData?.requests || [];

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesSearch = !searchQuery || 
      request.requester.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.offeredSkill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requestedSkill.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "accepted":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
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
            <h1 className="text-xl font-semibold text-slate-800">Swap Requests</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex-1 max-w-md relative">
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Request Cards */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-slate-600">Loading requests...</div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-600">No requests found.</div>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar>
                        <AvatarFallback>
                          {request.requester.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 mb-1">
                          {request.requester.name}
                        </h3>
                        <div className="text-sm text-slate-600 mb-3">
                          <span>Wants to learn:</span>
                          <Badge className="bg-purple-100 text-purple-700 ml-1 mr-2">
                            {request.requestedSkill}
                          </Badge>
                          <span>•</span>
                          <span className="ml-2">Offers:</span>
                          <Badge className="bg-blue-100 text-blue-700 ml-1">
                            {request.offeredSkill}
                          </Badge>
                        </div>
                        {request.message && (
                          <p className="text-slate-600 text-sm">"{request.message}"</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                      
                      {request.status === "pending" ? (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(request.id)}
                            disabled={updateRequestMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={updateRequestMutation.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500">
                          {formatDate(request.createdAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
