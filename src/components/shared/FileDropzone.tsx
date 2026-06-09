"use client";

import { Loader2, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { type FileRejection, type FileWithPath, useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FileDropzoneProps {
  /** Called with the selected file(s). Promise resolution clears the file. */
  onUpload: (files: FileWithPath[]) => Promise<void> | void;
  /** Override accept patterns (default: PDF + images + Word). */
  accept?: Record<string, string[]>;
  /** Max file size in bytes (default: 25 MB). */
  maxSize?: number;
  /** Allow multi-file selection (default false). */
  multiple?: boolean;
  /** Localised "Drop files here" hint. */
  dropHint: string;
  /** Localised "Select" button label. */
  selectLabel: string;
  /** Localised "Upload" button label. */
  uploadLabel: string;
  /** Localised "Uploading..." status. */
  uploadingLabel: string;
  /** Localised "Max size" hint with the formatted size embedded. */
  maxSizeLabel: (formatted: string) => string;
  /** Localised "Reject" reason — file too large. */
  errorTooLarge: string;
  /** Localised "Reject" reason — wrong type. */
  errorBadType: string;
  className?: string;
}

const DEFAULT_ACCEPT: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "image/*": [".png", ".jpg", ".jpeg", ".webp"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
};

const DEFAULT_MAX_SIZE = 25 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileDropzone({
  onUpload,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  multiple = false,
  dropHint,
  selectLabel,
  uploadLabel,
  uploadingLabel,
  maxSizeLabel,
  errorTooLarge,
  errorBadType,
  className,
}: FileDropzoneProps) {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const onDrop = useCallback(
    (accepted: FileWithPath[], rejected: FileRejection[]) => {
      setFiles(multiple ? [...files, ...accepted] : accepted.slice(0, 1));
      const messages = rejected.flatMap((r) =>
        r.errors.map((e) => {
          if (e.code === "file-too-large") return errorTooLarge;
          if (e.code === "file-invalid-type") return errorBadType;
          return e.code;
        }),
      );
      setErrorMessages(messages);
    },
    [files, multiple, errorTooLarge, errorBadType],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      await onUpload(files);
      setFiles([]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-[#E7F0ED] bg-[#F8FBF9] py-6 px-4 text-sm cursor-pointer transition-colors",
          isDragActive && "border-primary bg-[#E7F0ED]",
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-6 w-6 text-primary" />
        <p className="text-[#585757] text-center">{dropHint}</p>
        <p className="text-xs text-gray-400">{maxSizeLabel(formatBytes(maxSize))}</p>
        <Button type="button" variant="ghost" size="sm">
          {selectLabel}
        </Button>
      </div>

      {errorMessages.length > 0 && (
        <ul className="text-sm text-destructive space-y-0.5">
          {errorMessages.map((m, i) => (
            <li key={i}>• {m}</li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((file, idx) => (
            <li
              key={`${file.name}-${idx}`}
              className="flex items-center justify-between gap-2 rounded-md border border-[#E7F0ED] bg-white px-3 py-2 text-sm"
            >
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium text-gray-800">{file.name}</div>
                <div className="text-xs text-gray-500">{formatBytes(file.size)}</div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                aria-label="Remove"
                disabled={isUploading}
                className="text-gray-400 hover:text-destructive disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleUpload} isLoading={isUploading} disabled={isUploading}>
            {isUploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> {uploadingLabel}
              </span>
            ) : (
              uploadLabel
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
