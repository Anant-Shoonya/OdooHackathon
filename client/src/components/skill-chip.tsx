import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface SkillChipProps {
  skill: string;
  variant?: "offered" | "wanted";
  removable?: boolean;
  onRemove?: () => void;
}

export default function SkillChip({ 
  skill, 
  variant = "offered", 
  removable = false, 
  onRemove 
}: SkillChipProps) {
  const colorClass = variant === "offered" 
    ? "bg-blue-100 text-blue-700" 
    : "bg-purple-100 text-purple-700";

  return (
    <Badge className={`${colorClass} ${removable ? 'pr-1' : ''}`}>
      {skill}
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-2 hover:opacity-70"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </Badge>
  );
}
