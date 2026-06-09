"use client";

import { EllipsisVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface RowAction {
  label: string;
  onClick: () => void;
  /** Render as destructive (red) and separate from neutral actions. */
  destructive?: boolean;
  /** Hide this action without altering the items array. */
  hidden?: boolean;
}

export interface RowActionsMenuProps {
  items: RowAction[];
  triggerSrLabel?: string;
}

/**
 * Generic dropdown row-action menu. Per-domain code passes typed click
 * handlers — no `urls` string-routing or hidden-trigger ref hacks.
 *
 * Neutral actions appear first, then a separator, then destructive actions.
 */
export function RowActionsMenu({ items, triggerSrLabel = "Open menu" }: RowActionsMenuProps) {
  const visible = items.filter((i) => !i.hidden);
  if (visible.length === 0) return null;

  const neutral = visible.filter((i) => !i.destructive);
  const destructive = visible.filter((i) => i.destructive);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-right h-8 w-8 p-0 data-[state=open]:bg-muted hover:bg-[#E7F0ED]"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="sr-only">{triggerSrLabel}</span>
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]" onClick={(e) => e.stopPropagation()}>
        {neutral.map((item) => (
          <DropdownMenuItem
            key={item.label}
            className="focus:bg-[#E7F0ED]"
            onClick={(e) => {
              e.stopPropagation();
              item.onClick();
            }}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
        {neutral.length > 0 && destructive.length > 0 && <DropdownMenuSeparator />}
        {destructive.map((item) => (
          <DropdownMenuItem
            key={item.label}
            className={cn("focus:bg-red-50 text-destructive focus:text-destructive")}
            onClick={(e) => {
              e.stopPropagation();
              item.onClick();
            }}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
