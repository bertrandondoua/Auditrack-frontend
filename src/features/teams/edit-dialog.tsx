"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { CustomSelect } from "@/components/shared/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/hooks/use-toast";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import { useGetSectionsQuery } from "@/redux/features/sections/sectionsApiSlice";
import { usePartialUpdateTeamMutation } from "@/redux/features/team/teamApiSlice";
import type { Team } from "@/types/team";

import { normalizePhone, teamSchema, type TeamFormValues } from "./schema";

export interface EditTeamDialogProps {
  dict: Dict;
  team: Team | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditTeamDialog({ dict, team, open, onOpenChange }: EditTeamDialogProps) {
  const { toast } = useToast();
  const [partialUpdate, { isLoading }] = usePartialUpdateTeamMutation();
  const f = dict.teams.fields;

  const { data: sectionsData } = useGetSectionsQuery({ page: 1 });
  const sectionOptions = (sectionsData?.results ?? [])
    .filter((s) => s.uuid)
    .map((s) => ({ value: s.uuid!, label: s.name }));

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      team_lead_name: "",
      team_lead_email: "",
      team_lead_phone_number: "",
      number_of_members: null,
      section: "",
    },
  });

  useEffect(() => {
    if (team) {
      reset({
        name: team.name,
        team_lead_name: team.team_lead_name,
        team_lead_email: team.team_lead_email,
        team_lead_phone_number: team.team_lead_phone_number,
        number_of_members: team.number_of_members ?? null,
        section: team.section ?? "",
      });
    }
  }, [team, reset]);

  const submit = handleSubmit(async (values) => {
    if (!team?.uuid) return;
    try {
      const res = await partialUpdate({
        uuid: team.uuid,
        data: {
          name: values.name,
          team_lead_name: values.team_lead_name,
          team_lead_email: values.team_lead_email,
          team_lead_phone_number: normalizePhone(values.team_lead_phone_number),
          number_of_members: values.number_of_members ?? null,
          section: values.section,
        },
      }).unwrap();
      showSuccesToasts(toast, res, dict.lang, dict.teams.edit.success, dict);
      onOpenChange(false);
    } catch (err) {
      showErrorToasts(err, toast, dict.lang);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[50%]">
        <DialogHeader>
          <DialogTitle>{dict.teams.edit.title}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <FormField
            label={f.name}
            placeholder={f.name_placeholder}
            error={errors.name?.message}
            inputProps={register("name")}
          />
          <Controller
            control={control}
            name="section"
            render={({ field }) => (
              <CustomSelect
                label={f.section}
                placeholder={f.section_placeholder}
                value={field.value ?? ""}
                onChange={field.onChange}
                options={sectionOptions}
              />
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label={f.team_lead_name}
              placeholder={f.team_lead_name_placeholder}
              error={errors.team_lead_name?.message}
              inputProps={register("team_lead_name")}
            />
            <FormField
              label={f.team_lead_email}
              type="email"
              placeholder={f.team_lead_email_placeholder}
              error={errors.team_lead_email?.message}
              inputProps={register("team_lead_email")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label={f.team_lead_phone}
              placeholder={f.team_lead_phone_placeholder}
              error={errors.team_lead_phone_number?.message}
              inputProps={register("team_lead_phone_number")}
            />
            <FormField
              label={f.number_of_members}
              type="number"
              placeholder={f.number_of_members_placeholder}
              inputProps={register("number_of_members")}
            />
          </div>
          <DialogFooter className="self-end h-fit">
            <Button
              type="button"
              variant="dark"
              size="lg"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {dict.common.cancel}
            </Button>
            <Button type="submit" size="lg" isLoading={isLoading}>
              {dict.teams.edit.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
