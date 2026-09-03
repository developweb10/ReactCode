import { useState, useEffect, forwardRef, useCallback } from "react";
import styles from "./edit-performance-case-form.module.scss";
import classNames from "classnames";
import { CircularProgress } from "@material-ui/core/";
import { useForm } from "react-hook-form";

import { CasesApi } from "@api/cases/cases.api";
import { casesService } from "@store/cases/cases.service";

import { UserAuthModel } from "@models/authorization.models";
import { CaseType, CaseTableModel } from "@models/cases.models";

import { yupResolver } from "@hookform/resolvers/yup";
import { SelectOption } from "@components/select/select";

import { PerformanceCaseFormElements } from "../performance-case-form-elements/performance-case-form-elements";
import { MessagesComponent } from "@components/messages/messages";

import { validationSchema } from "../validation-schema";

interface Props {
  authUser: UserAuthModel;
  caseData: CaseTableModel;
  onCreate: () => void;
  editMode: boolean;
  noPadding?: boolean;
}

export const EditPerformanceCaseForm = forwardRef<HTMLFormElement, Props>(
  ({ authUser, onCreate, editMode, caseData, noPadding }, ref) => {
    const [loading, setLoading] = useState(true);
    const [caseOutcomesOptions, setOutcomes] = useState<SelectOption[]>([]);
    const [caseEntity, setCaseEntity] = useState(caseData);

    const getCaseFormValues = useCallback((caseInfo: CaseTableModel) => {
      return {
        employeeId: caseInfo.employee.id,
        hrId: caseInfo.hrUser?.userId || "",
        outcomeId: caseInfo.outcome.id,
        specificDetails: {
          improvementOverview:
            caseInfo.specificDetails.improvementOverview || "",
          reviewFrom: caseInfo.specificDetails.reviewFrom || null,
          reviewTo: caseInfo.specificDetails.reviewTo || null,
          finalComment: caseInfo.specificDetails.finalComment || "",
          finalScore: caseInfo.specificDetails.finalScore || "",
          appeal: caseInfo.specificDetails.appeal || false,
          completionDate: caseInfo.specificDetails.completionDate || null,
          evaluations: caseInfo.specificDetails.evaluations || [],
        },
      };
    }, []);

    const {
      register,
      control,
      trigger,
      handleSubmit,
      setValue,
      getValues,
      clearErrors,
      watch,
      errors,
      reset,
    } = useForm({
      defaultValues: getCaseFormValues(caseEntity),
      resolver: yupResolver(validationSchema),
    });

    useEffect(() => {
      (async () => {
        const response = await CasesApi.getCaseOutcomes(CaseType.Performance);
        const outcomes = response.data.result;
        setOutcomes(outcomes.map((o) => ({ name: o.name, value: o.id })));

        setLoading(false);
      })();
    }, [setValue]);

    const onSubmit = async (formValues: any) => {
      const dto = {
        ...formValues,
        caseTypeId: CaseType.Performance,
        specificDetails: {
          ...formValues.specificDetails,
          caseTypeId: CaseType.Performance,
        },
      };

      setLoading(true);
      try {
        const updatedCase = await casesService.updateCase(dto, caseEntity.id);
        setLoading(false);
        onCreate();
        if (updatedCase) {
          setCaseEntity(updatedCase);
          reset(getCaseFormValues(updatedCase));
        }
      } catch (error) {
        setLoading(false);
      }
    };

    const onMessageAdded = async (message: string) => {
      setLoading(true);
      try {
        const newMessage = await casesService.addMessage(caseEntity.id, {
          message,
        });
        if (newMessage) {
          setCaseEntity({
            ...caseEntity,
            messageDtos: [newMessage, ...caseEntity.messageDtos],
          });
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    const onMessageDeleted = async (id: number) => {
      setLoading(true);
      try {
        await casesService.deleteMessage(id, caseEntity.id);

        setCaseEntity({
          ...caseEntity,
          messageDtos: caseEntity.messageDtos.filter((m) => m.id !== id),
        });

        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    const onMessageUpdated = async (id: number, message: string) => {
      setLoading(true);
      try {
        const updatedMessage = await casesService.updateMessage(
          id,
          message,
          caseEntity.id
        );

        if (updatedMessage) {
          setCaseEntity({
            ...caseEntity,
            messageDtos: caseEntity.messageDtos.map((m) =>
              m.id === id ? updatedMessage : m
            ),
          });
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      }
    };

    const handleLoading = useCallback((newLoading: boolean) => {
      setLoading(newLoading);
    }, []);

    return (
      <div
        className={classNames(styles.Wrap, { [styles.NoPadding]: !!noPadding })}
      >
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
          <PerformanceCaseFormElements
            register={register}
            trigger={trigger}
            control={control}
            setValue={setValue}
            getValues={getValues}
            clearErrors={clearErrors}
            watch={watch}
            errors={errors}
            handleLoading={handleLoading}
            caseOutcomesOptions={caseOutcomesOptions}
            editMode={editMode}
            caseData={caseEntity}
          />
        </form>
        <div className={styles.MessagesSection}>
          <MessagesComponent
            authUser={authUser}
            onMessageAdded={onMessageAdded}
            onMessageDeleted={onMessageDeleted}
            onMessageUpdated={onMessageUpdated}
            initialMessages={caseEntity.messageDtos}
          />
        </div>
      </div>
    );
  }
);
