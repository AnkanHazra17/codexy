import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

function AppUserAvatar({
  userName,
  imageUrl,
  className,
}: {
  userName: string;
  imageUrl?: string;
  className?: string;
}) {
  const initials = useMemo(() => {
    if (!userName) return "?";
    const names = userName.trim().split(" ").filter(Boolean);
    if (names.length === 0) return "?";
    if (names.length === 1) return names[0][0]?.toUpperCase() || "?";
    return (names[0][0] + names[names.length - 1][0])
      .toUpperCase()
      .slice(0, 2);
  }, [userName]);

  const avatarSrc = useMemo(() => {
    if (imageUrl) return imageUrl;
    const encodedName = encodeURIComponent(userName || "User");
    return `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=128`;
  }, [userName, imageUrl]);

  const altText = useMemo(() => {
    return `${userName || "User"}'s avatar`;
  }, [userName]);

  return (
    <Avatar className={cn("border", className)}>
      <AvatarImage src={avatarSrc} alt={altText} />
      <AvatarFallback className="text-xs font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export default AppUserAvatar;
