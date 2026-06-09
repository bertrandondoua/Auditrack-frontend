"use client";

import { CheckCircle2 } from "lucide-react";

import FileDropzone from "@/components/shared/FileDropzone";
import { Button } from "@/components/ui/button";
import type { Dict } from "@/lib/dictionaries";
import { useGetDocumentsQuery } from "@/redux/features/documents/documentsApiSlice";

function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

export interface ControlStepCardProps {
  index: number;
  csUuid?: string;
  stepName: string | null;
  recordedAt?: string;
  controlOpened: boolean;
  dict: Dict;
  /**
   * Fires the backend `complete_step/` action. The ControlStep serializer
   * exposes no completion field, so completion state is not reflected back
   * in the UI — the action is one-way (see BACKEND_MISMATCHES.md).
   */
  onComplete: (csUuid: string) => Promise<void>;
  onUpload: (csUuid: string, files: File[]) => Promise<void>;
}

/**
 * Single timeline row on the control workflow page.
 *
 * NOTE on the documents query: this component currently issues one
 * `useGetDocumentsQuery({ control_step })` per step → N+1 calls. The
 * backend documents list filter only takes `control_step`, so batching
 * requires either a `?control=<uuid>` filter or a `?control_step__in=`
 * filter server-side. See BACKEND_MISMATCHES.md §4 — the backend ticket
 * for that. When it lands, lift the query to the parent and pass a
 * `Map<csUuid, AuditDocument[]>` in as a prop.
 */
export function ControlStepCard({
  index,
  csUuid,
  stepName,
  recordedAt,
  controlOpened,
  dict,
  onComplete,
  onUpload,
}: ControlStepCardProps) {
  const { data: documentsData } = useGetDocumentsQuery(
    { control_step: csUuid, page: 1 },
    { skip: !csUuid },
  );
  const documents = documentsData?.results ?? [];

  return (
    <li className="rounded-md border border-[#E7F0ED] bg-white p-4 space-y-3">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <div className="font-medium text-gray-800">
              <span className="text-gray-400 mr-2">#{index + 1}</span>
              {stepName ?? dict.controls.detail.unknown_step}
            </div>
            <div className="text-xs text-gray-500">{formatDateTime(recordedAt)}</div>
          </div>
        </div>
        {controlOpened && csUuid && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onComplete(csUuid)}
            aria-label={dict.controls.detail.complete_step}
          >
            <CheckCircle2 className="h-4 w-4" /> {dict.controls.detail.complete_step}
          </Button>
        )}
      </div>

      {documents.length > 0 && (
        <ul className="space-y-1 pl-9">
          {documents.map((doc) => (
            <li key={doc.uuid} className="flex items-center gap-2 text-sm">
              <a
                href={doc.file}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                {doc.name}
              </a>
            </li>
          ))}
        </ul>
      )}

      {controlOpened && csUuid && (
        <div className="pl-9">
          <FileDropzone
            dropHint={dict.controls.detail.upload_hint}
            selectLabel={dict.controls.detail.upload_select}
            uploadLabel={dict.controls.detail.upload_submit}
            uploadingLabel={dict.controls.detail.upload_uploading}
            maxSizeLabel={(formatted) => `${dict.controls.detail.upload_max_size}: ${formatted}`}
            errorTooLarge={dict.controls.detail.upload_too_large}
            errorBadType={dict.controls.detail.upload_bad_type}
            onUpload={(files) => onUpload(csUuid, files)}
          />
        </div>
      )}
    </li>
  );
}
