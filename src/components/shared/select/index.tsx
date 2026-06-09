"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import {
  Select as SelectParent,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomSelectProps } from "@/lib/types";
import { cn } from "@/lib/utils";

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  placeholder = "Select an option",
  label,
  className,
  onChange,
  readOnly,
  value,
}) => {
  return (
    <Label className="flex flex-col gap-1 w-full">
      {label}
      <SelectParent onValueChange={onChange} disabled={readOnly} value={value}>
        <SelectTrigger
          className={cn("w-full h-11 bg-[#F3F3F3]", className, readOnly ? "bg-white" : "")}
        >
          <SelectValue className="!text-[#5E5E5E] !opacity-50" placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-44">
          <SelectGroup>
            {options.map((option) => (
              <SelectItem
                className="focus:bg-[#e7f0ED]"
                key={option.value}
                value={option.value}
                disabled={readOnly}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </SelectParent>
    </Label>
  );
};
