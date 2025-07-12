import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getCurrentUser, logout } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Navbar() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 
              className="text-2xl font-bold text-slate-800 cursor-pointer"
              onClick={() => setLocation("/home")}
            >
              SKILL SWAP PLATFORM
            </h1>
          </div>
          
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/requests")}
                className="text-slate-600 hover:text-slate-800"
              >
                Swap Requests
              </Button>
              <div 
                className="flex items-center space-x-3 cursor-pointer hover:bg-slate-100 rounded-lg px-3 py-2 transition-colors"
                onClick={() => setLocation("/profile")}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-500 text-white text-sm">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-slate-700 font-medium">{currentUser.name}</span>
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="text-slate-600 hover:text-slate-800"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button onClick={() => setLocation("/login")}>
                Login / Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
