import { useState, useEffect, forwardRef, useCallback } from "react";
import styles from "./add-appeal-case-form.module.scss";

import { CircularProgress } from "@material-ui/core/";
import { useForm } from "react-hook-form";

import { CasesApi } from "@api/cases/cases.api";
import { casesService } from "@store/cases/cases.service";

import { UserAuthModel } from "@models/authorization.models";
import { CaseType } from "@models/cases.models";

import { yupResolver } from "@hookform/resolvers/yup";
import { SelectOption } from "@components/select/select";

import { AppealCaseFormElements } from "../appeal-case-form-elements/appeal-case-form-elements";
import { MessagesComponent } from "@components/messages/messages";

import { validationSchema } from "../validation-schema";

interface Props {
  authUser: UserAuthModel;
  onCreate: () => void;
}

export const AddAppealCaseForm = forwardRef<HTMLFormElement, Props>(
  ({ authUser, onCreate }, ref) => {
    const [loading, setLoading] = useState(true);
    const [caseOutcomesOptions, setOutcomes] = useState<SelectOption[]>([]);
    const [formMessages, setMessages] = useState<
      { message: string; id: number }[]
    >([]);

    const {
      register,
      control,
      handleSubmit,
      setValue,
      clearErrors,
      errors,
    } = useForm({
      defaultValues: {
        employeeId: "",
        date: null,
        hrId: "",
        details: "",
        note: "",
        outcomeId: "",
        specificDetails: {
          currentIssue: "Conduct",
          officerId: "",
          suspended: true,
          suspensionDate: null,
          appealDate: null,
        },
      },

      resolver: yupResolver(validationSchema),
    });

    useEffect(() => {
      (async () => {
        const response = await CasesApi.getCaseOutcomes(CaseType.Appeal);
        const outcomes = response.data.result;
        setOutcomes(outcomes.map((o) => ({ name: o.name, value: o.id })));

        const defaultOutcome = outcomes.find((o) => o.isDefault);
        if (defaultOutcome) {
          setValue("outcomeId", defaultOutcome.id);
        }
        setLoading(false);
      })();
    }, [setValue]);

    const onSubmit = async (formValues: any) => {
      const dto = {
        ...formValues,
        messages: formMessages.map((m) => m.message),
        caseTypeId: CaseType.Appeal,
        specificDetails: {
          ...formValues.specificDetails,
          caseTypeId: CaseType.Appeal,
        },
      };

      try {
        await casesService.addCase(dto);
        onCreate();
      } catch (error) {}
    };

    const onMessageAdded = (message: string, id?: number) => {
      if (id) {
        setMessages([{ message, id }, ...formMessages]);
      }
    };

    const onMessageDeleted = (id: number) => {
      if (id) {
        setMessages(formMessages.filter((m) => m.id !== id));
      }
    };

    const onMessageUpdated = async (id: number, message: string) => {
      setMessages(formMessages.map((m) => (m.id === id ? { id, message } : m)));
    };
    const handleLoading = useCallback((newLoading: boolean) => {
      setLoading(newLoading);
    }, []);

    return (
      <div className={styles.Wrap}>
        {loading && (
          <div className="overlay-loader with-opacity">
            <CircularProgress
              size="6rem"
              variant="indeterminate"
              disableShrink
            />
          </div>
        )}
        <form
          id="add-case-form"
          className={styles.Form}
          onSubmit={handleSubmit(onSubmit)}
          ref={ref}
        >
          <AppealCaseFormElements
            register={register}
            control={control}
            setValue={setValue}
            clearErrors={clearErrors}
            errors={errors}
            handleLoading={handleLoading}
            caseOutcomesOptions={caseOutcomesOptions}
            editMode
          />
        </form>

        <div className={styles.MessagesSection}>
          <MessagesComponent
            authUser={authUser}
            onMessageAdded={onMessageAdded}
            onMessageDeleted={onMessageDeleted}
            onMessageUpdated={onMessageUpdated}
            isCreateForm
          />
        </div>
      </div>
    );
  }
);
