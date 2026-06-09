"use client";

import { ArrowLeft, PlayCircle, Plus, StopCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import Loading from "@/app/[lang]/loading";
import ReusableDialog from "@/components/shared/dialog";
import ConfirmDialog from "@/components/shared/dialog/confirm";
import { CustomSelect } from "@/components/shared/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Locale } from "@/i18n-config";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import { useCreateDocumentMutation } from "@/redux/features/documents/documentsApiSlice";
import {
  useCloseControlMutation,
  useGetControlQuery,
  useOpenControlMutation,
} from "@/redux/features/controls/controlsApiSlice";
import {
  useCompleteControlStepMutation,
  useCreateControlStepMutation,
  useGetControlStepsQuery,
} from "@/redux/features/control-steps/controlStepsApiSlice";
import { useGetOrganizationsQuery } from "@/redux/features/organizations/organizationApiSlice";
import { useGetProceduresQuery } from "@/redux/features/procedures/proceduresApiSlice";
import { useGetProcedureStepsQuery } from "@/redux/features/procedureSteps/procedureStepsApiSlice";
import { useGetSectionsQuery } from "@/redux/features/sections/sectionsApiSlice";
import { useGetStepsQuery } from "@/redux/features/steps/stepsApiSlice";
import type { ControlStatus } from "@/types/control";

import { ControlStepCard } from "./control-step-card";

const STATUS_CLASSES: Record<ControlStatus, string> = {
  created: "border-[#86783F] text-[#86783F] bg-[#FFF8E1]",
  opened: "border-[#126D4E] text-[#126D4E] bg-[#E7F0ED]",
  completed: "border-[#0CCE6B] text-[#0CCE6B] bg-[#E8FBF1]",
};

function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

export default function ControlDetail({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const params = useParams<{ id: string; lang: Locale }>();
  const uuid = decodeURIComponent(params.id ?? "");

  const { data: control, isLoading } = useGetControlQuery(uuid, { skip: !uuid });
  const { data: controlStepsData } = useGetControlStepsQuery(
    { control: uuid, ordering: "recorded_at" },
    { skip: !uuid },
  );

  // Resolve UUIDs to display names from the global lookups.
  const { data: orgsData } = useGetOrganizationsQuery({ page: 1 });
  const { data: sectionsData } = useGetSectionsQuery({ page: 1 });
  const { data: proceduresData } = useGetProceduresQuery({ page: 1 });
  const { data: stepsData } = useGetStepsQuery({ page: 1 });

  // For the "add next step" picker — only steps that belong to this control's procedure.
  const { data: procedureStepsData } = useGetProcedureStepsQuery(
    { procedure: control?.procedure, ordering: "order" },
    { skip: !control?.procedure },
  );

  const [openControl, { isLoading: isOpening }] = useOpenControlMutation();
  const [closeControl, { isLoading: isClosing }] = useCloseControlMutation();
  // Backend doesn't yet expose complete_control/ — see BACKEND_MISMATCHES.md §2.
  // const [completeControl, { isLoading: isCompleting }] = useCompleteControlMutation();
  const [createControlStep, { isLoading: isCreatingStep }] = useCreateControlStepMutation();
  const [completeControlStep] = useCompleteControlStepMutation();
  // Backend doesn't yet expose reopen_step/ — see BACKEND_MISMATCHES.md §2.
  // const [reopenControlStep] = useReopenControlStepMutation();
  const [createDocument] = useCreateDocumentMutation();

  const [nextStepUuid, setNextStepUuid] = useState<string>("");
  const [confirmingTransition, setConfirmingTransition] = useState<null | "open" | "close">(null);

  const stepByUuid = useMemo(
    () => new Map((stepsData?.results ?? []).filter((s) => s.uuid).map((s) => [s.uuid!, s])),
    [stepsData],
  );

  const orgName = useMemo(
    () =>
      (orgsData?.results ?? []).find((o) => o.uuid === control?.organization)?.name ??
      dict.controls.list.unknown_org,
    [orgsData, control, dict],
  );
  const sectionName = useMemo(
    () => (sectionsData?.results ?? []).find((s) => s.uuid === control?.section)?.name ?? "—",
    [sectionsData, control],
  );
  const procedureName = useMemo(
    () => (proceduresData?.results ?? []).find((p) => p.uuid === control?.procedure)?.name ?? "—",
    [proceduresData, control],
  );

  const controlSteps = controlStepsData?.results ?? [];
  const usedStepUuids = new Set(controlSteps.map((cs) => cs.step));
  const availableNextSteps = (procedureStepsData?.results ?? [])
    .filter((ps) => !usedStepUuids.has(ps.step))
    .map((ps) => {
      const s = stepByUuid.get(ps.step);
      return { value: ps.step, label: s?.name ?? ps.step };
    });

  const handleTransition = async () => {
    if (!control?.uuid || !confirmingTransition) return;
    try {
      if (confirmingTransition === "open") await openControl({ uuid: control.uuid }).unwrap();
      else await closeControl({ uuid: control.uuid }).unwrap();
      showSuccesToasts(toast, {}, dict.lang, dict.controls.detail.transition_success, dict);
      setConfirmingTransition(null);
    } catch (err) {
      showErrorToasts(err, toast, dict.lang);
    }
  };

  const handleAddStep = async (closeDialog: () => void) => {
    if (!control?.uuid || !nextStepUuid) return;
    try {
      await createControlStep({ control: control.uuid, step: nextStepUuid }).unwrap();
      showSuccesToasts(toast, {}, dict.lang, dict.controls.detail.add_step_success, dict);
      setNextStepUuid("");
      closeDialog();
    } catch (err) {
      showErrorToasts(err, toast, dict.lang);
    }
  };

  /**
   * NOTE: backend exposes `complete_step/` but no `reopen_step/`.
   * See BACKEND_MISMATCHES.md §2. The completed checkbox is one-way until
   * the reopen action lands server-side.
   */
  const handleToggleStep = async (csUuid: string, completed: boolean) => {
    if (completed) return; // backend can't reopen; ignore the click
    try {
      await completeControlStep({ uuid: csUuid }).unwrap();
    } catch (err) {
      showErrorToasts(err, toast, dict.lang);
    }
  };

  const handleStepUpload = async (csUuid: string, files: File[]) => {
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", file.name);
      fd.append("control_step", csUuid);
      try {
        await createDocument(fd).unwrap();
        showSuccesToasts(toast, {}, dict.lang, dict.controls.detail.upload_success, dict);
      } catch (err) {
        showErrorToasts(err, toast, dict.lang);
      }
    }
  };

  if (isLoading) return <Loading />;

  const status = (control?.status ?? "created") as ControlStatus;

  return (
    <section className="mt-2 space-y-6">
      <Link
        href={`/${params.lang}/control`}
        className="inline-flex items-center gap-2 text-sm text-[#585757] hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> {dict.controls.detail.back}
      </Link>

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">{control?.name ?? procedureName}</h1>
            <span
              className={`text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded border ${STATUS_CLASSES[status]}`}
            >
              {dict.controls.status[status]}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-sm text-[#585757]">
            <div>
              <span className="text-gray-500">{dict.controls.fields.organization}:</span>{" "}
              <span className="text-gray-800">{orgName}</span>
            </div>
            <div>
              <span className="text-gray-500">{dict.controls.fields.section}:</span>{" "}
              <span className="text-gray-800">{sectionName}</span>
            </div>
            <div>
              <span className="text-gray-500">{dict.controls.fields.procedure}:</span>{" "}
              <span className="text-gray-800">{procedureName}</span>
            </div>
            <div>
              <span className="text-gray-500">{dict.controls.fields.exercise_year}:</span>{" "}
              <span className="text-gray-800">{control?.exercise_year ?? "—"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === "created" && (
            <Button isLoading={isOpening} onClick={() => setConfirmingTransition("open")}>
              <PlayCircle className="h-4 w-4" /> {dict.controls.detail.open_btn}
            </Button>
          )}
          {status === "opened" && (
            <>
              <Button
                variant="dark"
                isLoading={isClosing}
                onClick={() => setConfirmingTransition("close")}
              >
                <StopCircle className="h-4 w-4" /> {dict.controls.detail.close_btn}
              </Button>
              {/*
                NOTE: backend doesn't yet expose /core/controls/{uuid}/complete_control/.
                See BACKEND_MISMATCHES.md §2. Hide the Complete-control button until
                the action lands server-side.
              */}
            </>
          )}
        </div>
      </div>

      {control?.description && (
        <p className="text-sm text-gray-700 max-w-prose">{control.description}</p>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            {dict.controls.detail.steps_title}
          </h2>
          {status === "opened" && availableNextSteps.length > 0 && (
            <ReusableDialog
              title={dict.controls.detail.add_step_title}
              trigger={
                <Button>
                  <Plus /> {dict.controls.detail.add_step_btn}
                </Button>
              }
              dialogClose={
                <Button variant="dark" size="lg">
                  {dict.common.cancel}
                </Button>
              }
              footer={({ closeDialog }) => (
                <Button
                  isLoading={isCreatingStep}
                  onClick={() => handleAddStep(closeDialog)}
                  size="lg"
                >
                  {dict.controls.detail.add_step_submit}
                </Button>
              )}
            >
              <CustomSelect
                label={dict.controls.detail.next_step_label}
                placeholder={dict.controls.detail.next_step_placeholder}
                value={nextStepUuid}
                onChange={setNextStepUuid}
                options={availableNextSteps}
              />
            </ReusableDialog>
          )}
        </div>

        {controlSteps.length === 0 ? (
          <div className="rounded-md border border-dashed border-[#E7F0ED] bg-[#F8FBF9] p-6 text-sm text-[#585757]">
            {dict.controls.detail.no_steps}
          </div>
        ) : (
          <ol className="space-y-2">
            {controlSteps.map((cs, idx) => (
              <ControlStepCard
                key={cs.uuid}
                index={idx}
                csUuid={cs.uuid}
                stepName={cs.step ? (stepByUuid.get(cs.step)?.name ?? null) : null}
                recordedAt={cs.recorded_at ?? cs.created_at}
                completedAt={cs.completed_at}
                controlOpened={status === "opened"}
                dict={dict}
                onToggle={handleToggleStep}
                onUpload={handleStepUpload}
              />
            ))}
          </ol>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmingTransition}
        onOpenChange={(open) => {
          if (!open) setConfirmingTransition(null);
        }}
        title={
          confirmingTransition === "open"
            ? dict.controls.detail.open_confirm_title
            : dict.controls.detail.close_confirm_title
        }
        description={dict.controls.detail.transition_confirm_description}
        confirmLabel={dict.common.actions.edit /* generic "Confirm" feel */}
        cancelLabel={dict.common.cancel}
        destructive={confirmingTransition === "close"}
        isLoading={isOpening || isClosing}
        onConfirm={handleTransition}
      />
    </section>
  );
}
