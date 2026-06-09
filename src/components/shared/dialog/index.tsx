"use client";

import { useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { DialogProps } from "@/lib/types";

export default function ReusableDialog({
  children,
  title,
  trigger,
  description,
  footer,
  dialogClose,
  className,
}: DialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeDialog = () => setIsOpen(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={`min-w-[50%] min-h-[60%] ${className ?? ""}`}>
        <DialogHeader className="h-fit">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter className="self-end h-fit">
          <DialogClose asChild>{dialogClose}</DialogClose>
          {typeof footer === "function" ? footer({ closeDialog }) : footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
