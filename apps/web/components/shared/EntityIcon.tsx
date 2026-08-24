import { Folder, type LucideIcon } from "lucide-react";
import { ICON_LIBRARY, isImageIcon, isLucideIconName } from "@/lib/iconRegistry";
import { cn } from "@/lib/utils";

interface EntityIconProps {
  icon?: string | null;
  color?: string | null;
  size?: number;
  className?: string;
  /** Render a colored rounded-square chip behind the icon, for detail-page-sized use. */
  background?: boolean;
  /** Icon to render when no icon is set. Defaults to Folder (areas); pass FolderKanban for projects. */
  fallback?: LucideIcon;
}

export function EntityIcon({ icon, color, size = 16, className, background = false, fallback: Fallback = Folder }: EntityIconProps) {
  const tint = color || "#525252";
  const isImage = Boolean(icon && isImageIcon(icon));

  if (isImage && background) {
    const bgSize = Math.round(size * 2.2);
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={icon!}
        alt=""
        style={{ width: bgSize, height: bgSize }}
        className={cn("shrink-0 rounded-lg object-cover", className)}
      />
    );
  }

  let content: React.ReactNode;
  if (isImage) {
    content = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={icon!}
        alt=""
        style={{ width: size, height: size }}
        className="shrink-0 rounded-[inherit] object-cover"
      />
    );
  } else if (icon && isLucideIconName(icon)) {
    const Icon = ICON_LIBRARY[icon]!;
    content = <Icon style={{ width: size, height: size, color: tint }} className="shrink-0" />;
  } else if (icon) {
    content = (
      <span className="shrink-0 leading-none" style={{ fontSize: size }}>
        {icon}
      </span>
    );
  } else {
    content = <Fallback style={{ width: size, height: size, color: tint }} className="shrink-0" />;
  }

  if (!background) {
    return <span className={cn("inline-flex shrink-0 items-center justify-center", className)}>{content}</span>;
  }

  const bgSize = Math.round(size * 2.2);
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-lg", className)}
      style={{ width: bgSize, height: bgSize, backgroundColor: `${tint}1a` }}
    >
      {content}
    </span>
  );
}
