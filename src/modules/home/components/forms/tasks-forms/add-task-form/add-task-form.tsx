import { useState, forwardRef, useCallback, useRef } from "react";
import styles from "./add-task-form.module.scss";

import { CircularProgress } from "@material-ui/core/";
import { useForm } from "react-hook-form";

import { tasksService } from "@store/tasks/tasks.service";

import { UserAuthModel } from "@models/authorization.models";

import { yupResolver } from "@hookform/resolvers/yup";

import { TaskFormElements } from "../task-form-elements/task-form-elements";
import {
  NOTICEBOARD_ALL_USER,
  NOTICEBOARD_CASE_TYPE,
} from "../task-form-elements/task-form-elements";

import {
  MessagesComponent,
  MessagesComponentRef,
} from "@components/messages/messages";

import { validationSchema } from "../validation-schema";

interface Props {
  authUser: UserAuthModel;
  onCreate: () => void;
}

export const AddTaskForm = forwardRef<HTMLFormElement, Props>(
  ({ authUser, onCreate }, ref) => {
    const [loading, setLoading] = useState(false);
    const [formMessages, setMessages] = useState<
      { message: string; id: number; attachmentIds?: number[] }[]
    >([]);
    const messagesRef = useRef<MessagesComponentRef>(null);

    const {
      register,
      control,
      handleSubmit,
      setValue,
      clearErrors,
      errors,
    } = useForm({
      defaultValues: {
        employee: null,
        hr: null,
        caseEntity: null,
        taskCaseType: 0,
        dueDate: null,
        priority: null,
        note: "",
      },
      shouldUnregister: false,
      resolver: yupResolver(validationSchema),
    });

    const onSubmit = async (formValues: any) => {
      const pendingMessage = await messagesRef.current?.flushPendingMessage();
      const messagesToSubmit = pendingMessage
        ? [
            pendingMessage,
            ...formMessages.filter((message) => message.id !== pendingMessage.id),
          ]
        : formMessages;
      const isNoticeboard = formValues.taskCaseType === NOTICEBOARD_CASE_TYPE;
      const isAllNoticeboard =
        isNoticeboard && formValues.hr?.userId === NOTICEBOARD_ALL_USER.userId;
      const dto = {
        dueDate: formValues.dueDate || null,
        priority: isNoticeboard ? formValues.priority : null,
        note: formValues.note || null,
        hrId: isAllNoticeboard
          ? authUser.userId
          : formValues.hr
          ? formValues.hr.userId
          : null,
        employeeId: formValues.employee ? formValues.employee.id : null,
        caseId: formValues.caseEntity ? formValues.caseEntity.id : null,
        messageDtos: messagesToSubmit.map((m) => ({
          message: m.message,
          attachmentIds: m.attachmentIds,
        })),
        isNoticeboard,
        noticeboardTarget: (isAllNoticeboard ? "ALL" : "INDIVIDUAL") as
          | "ALL"
          | "INDIVIDUAL",
      };

      setLoading(true);
      try {
        await tasksService.createTask(dto);
        setLoading(false);
        onCreate();
      } catch (error) {
        setLoading(false);
      }
    };

    const onMessageAdded = (
      message: string,
      id?: number,
      attachmentIds?: number[]
    ) => {
      if (id) {
        setMessages([{ message, id, attachmentIds }, ...formMessages]);
      }
    };

    const onMessageDeleted = (id: number) => {
      if (id) {
        setMessages(formMessages.filter((m) => m.id !== id));
      }
    };

    const onMessageUpdated = async (id: number, message: string) => {
      setMessages(
        formMessages.map((m) => (m.id === id ? { ...m, message } : m))
      );
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
          id="add-task-form"
          className={styles.Form}
          onSubmit={handleSubmit(onSubmit)}
          ref={ref}
        >
          <TaskFormElements
            register={register}
            control={control}
            setValue={setValue}
            clearErrors={clearErrors}
            errors={errors}
            handleLoading={handleLoading}
            editMode
          />
        </form>

        <div className={styles.MessagesSection}>
          <MessagesComponent
            ref={messagesRef}
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
