import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import Navbar from "@/components/navbar";
import { getCurrentUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const AVAILABILITY_OPTIONS = [
  "weekday-mornings",
  "weekday-afternoons", 
  "weekday-evenings",
  "weekend-mornings",
  "weekend-afternoons",
  "weekend-evenings"
];

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    skillsOffered: [] as string[],
    skillsWanted: [] as string[],
    availability: [] as string[],
    profilePicture: "",
  });
  
  const [newSkillOffered, setNewSkillOffered] = useState("");
  const [newSkillWanted, setNewSkillWanted] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getCurrentUser,
  });

  useEffect(() => {
    if (currentUser) {
      const offeredSkills = currentUser.skillsOffered?.filter(s => s.type === 'offered').map(s => s.name) || [];
      const wantedSkills = currentUser.skillsOffered?.filter(s => s.type === 'wanted').map(s => s.name) || [];
      const availabilitySlots = currentUser.availability?.map(a => a.timeSlot) || [];
      
      setFormData({
        name: currentUser.name || "",
        location: currentUser.location || "",
        skillsOffered: offeredSkills,
        skillsWanted: wantedSkills,
        availability: availabilitySlots,
        profilePicture: currentUser.profilePicture || "",
      });
    }
  }, [currentUser]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("PUT", "/api/users/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/home");
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addSkillOffered = () => {
    if (newSkillOffered.trim() && !formData.skillsOffered.includes(newSkillOffered.trim())) {
      setFormData({
        ...formData,
        skillsOffered: [...formData.skillsOffered, newSkillOffered.trim()]
      });
      setNewSkillOffered("");
    }
  };

  const addSkillWanted = () => {
    if (newSkillWanted.trim() && !formData.skillsWanted.includes(newSkillWanted.trim())) {
      setFormData({
        ...formData,
        skillsWanted: [...formData.skillsWanted, newSkillWanted.trim()]
      });
      setNewSkillWanted("");
    }
  };

  const removeSkillOffered = (skill: string) => {
    setFormData({
      ...formData,
      skillsOffered: formData.skillsOffered.filter(s => s !== skill)
    });
  };

  const removeSkillWanted = (skill: string) => {
    setFormData({
      ...formData,
      skillsWanted: formData.skillsWanted.filter(s => s !== skill)
    });
  };

  const handleAvailabilityChange = (timeSlot: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        availability: [...formData.availability, timeSlot]
      });
    } else {
      setFormData({
        ...formData,
        availability: formData.availability.filter(slot => slot !== timeSlot)
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simple file size check (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please choose an image under 2MB.",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please choose an image file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, profilePicture: base64String });
        setIsUploading(false);
        toast({
          title: "Image uploaded",
          description: "Profile picture updated successfully.",
        });
      };
      reader.onerror = () => {
        setIsUploading(false);
        toast({
          title: "Upload failed",
          description: "Failed to process the image.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading the image.",
        variant: "destructive",
      });
    }
  };

  if (!currentUser && !isLoading) {
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Profile Picture</Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                      {formData.profilePicture ? (
                        <img
                          src={formData.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-slate-500 text-xs">No Image</div>
                      )}
                    </div>
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="max-w-xs"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {isUploading ? "Uploading..." : "Choose an image under 2MB"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Location (Optional)</Label>
                    <Input
                      id="location"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                {/* Skills Offered */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Skills I Can Offer</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.skillsOffered.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-blue-100 text-blue-700">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkillOffered(skill)}
                          className="ml-2 hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill..."
                      value={newSkillOffered}
                      onChange={(e) => setNewSkillOffered(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillOffered())}
                    />
                    <Button type="button" onClick={addSkillOffered} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Skills Wanted */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Skills I Want to Learn</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.skillsWanted.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-purple-100 text-purple-700">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkillWanted(skill)}
                          className="ml-2 hover:text-purple-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill..."
                      value={newSkillWanted}
                      onChange={(e) => setNewSkillWanted(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillWanted())}
                    />
                    <Button type="button" onClick={addSkillWanted} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Availability</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {AVAILABILITY_OPTIONS.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={option}
                          checked={formData.availability.includes(option)}
                          onCheckedChange={(checked) => 
                            handleAvailabilityChange(option, checked as boolean)
                          }
                        />
                        <Label htmlFor={option} className="text-sm">
                          {option.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
