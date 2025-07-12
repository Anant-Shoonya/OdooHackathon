import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserCardProps {
  user: {
    id: number;
    name: string;
    location?: string;
    skillsOffered: Array<{ id: number; name: string; type: string }>;
  };
  matchScore: number;
  onRequestSwap: () => void;
  onViewProfile: () => void;
  isLoggedIn: boolean;
}

export default function UserCard({ 
  user, 
  matchScore, 
  onRequestSwap, 
  onViewProfile, 
  isLoggedIn 
}: UserCardProps) {
  const offeredSkills = user.skillsOffered.filter(s => s.type === 'offered');
  const wantedSkills = user.skillsOffered.filter(s => s.type === 'wanted');

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div 
            className="flex items-center space-x-4 cursor-pointer flex-1"
            onClick={onViewProfile}
          >
            <Avatar>
              <AvatarFallback className="bg-slate-200">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-slate-800">{user.name}</h3>
              {user.location && (
                <p className="text-sm text-slate-500">{user.location}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">⭐ Your Score</div>
            <div className="font-semibold text-blue-600">{matchScore}</div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-sm font-medium text-slate-700 mb-2">Skills Offered:</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {offeredSkills.slice(0, 3).map((skill) => (
              <Badge key={skill.id} className="bg-blue-100 text-blue-700">
                {skill.name}
              </Badge>
            ))}
            {offeredSkills.length > 3 && (
              <Badge variant="outline">+{offeredSkills.length - 3} more</Badge>
            )}
          </div>
          
          {wantedSkills.length > 0 && (
            <>
              <div className="text-sm font-medium text-slate-700 mb-2">Skills Wanted:</div>
              <div className="flex flex-wrap gap-2">
                {wantedSkills.slice(0, 2).map((skill) => (
                  <Badge key={skill.id} className="bg-purple-100 text-purple-700">
                    {skill.name}
                  </Badge>
                ))}
                {wantedSkills.length > 2 && (
                  <Badge variant="outline">+{wantedSkills.length - 2} more</Badge>
                )}
              </div>
            </>
          )}
        </div>

        <Button
          onClick={onRequestSwap}
          disabled={!isLoggedIn}
          className="w-full"
        >
          Request Swap
        </Button>
      </CardContent>
    </Card>
  );
}
