"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import ReusableDialog from "@/components/shared/dialog";
import { CustomSelect } from "@/components/shared/select";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/hooks/use-toast";
import type { Dict } from "@/lib/dictionaries";
import { showErrorToasts, showSuccesToasts } from "@/lib/functions";
import { useGetSectionsQuery } from "@/redux/features/sections/sectionsApiSlice";
import { useCreateTeamMutation } from "@/redux/features/team/teamApiSlice";

import { normalizePhone, teamSchema, type TeamFormValues } from "./schema";

export default function CreateTeamDialog({ dict }: { dict: Dict }) {
  const { toast } = useToast();
  const [createTeam, { isLoading }] = useCreateTeamMutation();
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

  const submit = (closeDialog: () => void) =>
    handleSubmit(async (values) => {
      try {
        const res = await createTeam({
          name: values.name,
          team_lead_name: values.team_lead_name,
          team_lead_email: values.team_lead_email,
          team_lead_phone_number: normalizePhone(values.team_lead_phone_number),
          number_of_members: values.number_of_members ?? null,
          section: values.section || undefined,
        }).unwrap();
        showSuccesToasts(toast, res, dict.lang, dict.teams.create.success, dict);
        reset();
        closeDialog();
      } catch (err) {
        showErrorToasts(err, toast, dict.lang);
      }
    });

  return (
    <ReusableDialog
      title={dict.teams.create.title}
      trigger={
        <Button>
          <Plus /> {dict.teams.list.create_btn}
        </Button>
      }
      dialogClose={
        <Button variant="dark" size="lg">
          {dict.common.cancel}
        </Button>
      }
      footer={({ closeDialog }) => (
        <Button isLoading={isLoading} onClick={() => submit(closeDialog)()} size="lg">
          {dict.teams.create.submit}
        </Button>
      )}
    >
      <form className="flex flex-col gap-4">
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
      </form>
    </ReusableDialog>
  );
}
