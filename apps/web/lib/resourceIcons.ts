import { FileText, Link2, Image as ImageIcon, File, type LucideIcon } from "lucide-react";
import type { ResourceType } from "@mogoj/shared";

export const RESOURCE_TYPE_ICONS: Record<ResourceType, LucideIcon> = {
  note: FileText,
  pdf: File,
  link: Link2,
  image: ImageIcon,
};
