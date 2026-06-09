import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AvatarDemo({
  fallback,
  img,
  fallbackClassName,
  avatarClassName,
}: {
  img?: string | null;
  fallback?: string;
  fallbackClassName?: string;
  avatarClassName?: string;
}) {
  return (
    <Avatar className={avatarClassName}>
      <AvatarImage src={img ?? ""} alt={fallback} />
      <AvatarFallback className={fallbackClassName}>{fallback}</AvatarFallback>
    </Avatar>
  );
}
