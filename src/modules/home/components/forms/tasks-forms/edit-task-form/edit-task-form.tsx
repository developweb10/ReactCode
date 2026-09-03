import { useState, forwardRef, useCallback, useRef } from "react";
import styles from "./edit-task-form.module.scss";
import classNames from "classnames";

import { CircularProgress } from "@material-ui/core/";
import { useForm } from "react-hook-form";

import { tasksService } from "@store/tasks/tasks.service";

import { UserAuthModel } from "@models/authorization.models";
import { TaskModel, TaskPriority } from "@models/tasks.models";

import { yupResolver } from "@hookform/resolvers/yup";

import { TaskFormElements } from "../task-form-elements/task-form-elements";
import { NOTICEBOARD_CASE_TYPE } from "../task-form-elements/task-form-elements";
import {
  MessagesComponent,
  MessagesComponentRef,
} from "@components/messages/messages";

import { validationSchema } from "../validation-schema";

interface Props {
  authUser: UserAuthModel;
  taskData: TaskModel;
  onCreate: () => void;
  editMode: boolean;
  noPadding?: boolean;
}

export const EditTaskForm = forwardRef<HTMLFormElement, Props>(
  ({ authUser, onCreate, editMode, taskData, noPadding }, ref) => {
    const [loading, setLoading] = useState(false);

    const [taskEntity, setTaskEntity] = useState(taskData);
    const messagesRef = useRef<MessagesComponentRef>(null);

    const getTaskFormValues = useCallback((taskInfo: TaskModel) => {
      return {
        employee: taskInfo.employee || null,
        hr: taskInfo.to,
        caseEntity: taskInfo.trackerCase || null,
        taskCaseType: taskInfo.isNoticeboard ? NOTICEBOARD_CASE_TYPE : 0,
        dueDate: taskInfo.dueDate || null,
        priority: taskInfo.priority || TaskPriority.MEDIUM,
        note: taskInfo.note || "",
      };
    }, []);

    const {
      register,
      control,
      handleSubmit,
      setValue,
      getValues,
      clearErrors,
      watch,
      reset,
      errors,
    } = useForm({
      defaultValues: getTaskFormValues(taskEntity),
      shouldUnregister: false,
      resolver: yupResolver(validationSchema),
    });

    const onSubmit = async (formValues: any) => {
      await messagesRef.current?.flushPendingMessage();
      const isNoticeboard = formValues.taskCaseType === NOTICEBOARD_CASE_TYPE;

      const dto = {
        dueDate: formValues.dueDate || null,
        priority: isNoticeboard ? formValues.priority : null,
        note: formValues.note || null,
        hrId: formValues.hr ? formValues.hr.userId : null,
        employeeId: formValues.employee ? formValues.employee.id : null,
        caseId: formValues.caseEntity ? formValues.caseEntity.id : null,
        isNoticeboard,
        noticeboardTarget:
          isNoticeboard
            ? ("INDIVIDUAL" as const)
            : undefined,
      };

      setLoading(true);
      try {
        const updatedTask = await tasksService.updateTask(dto, taskEntity.id);
        setLoading(false);
        onCreate();
        if (updatedTask) {
          setTaskEntity(updatedTask);
          reset(getTaskFormValues(updatedTask));
        }
      } catch (error) {
        setLoading(false);
      }
    };

    const onMessageAdded = async (
      message: string,
      _id?: number,
      attachmentIds?: number[]
    ) => {
      setLoading(true);
      try {
        const newMessage = await tasksService.addMessage(taskEntity.id, {
          message,
          attachmentIds,
        });

        if (newMessage) {
          setTaskEntity({
            ...taskEntity,
            messages: [newMessage, ...(taskEntity.messages || [])],
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
        await tasksService.deleteMessage(id, taskEntity.id);

        setTaskEntity({
          ...taskEntity,
          messages: taskEntity.messages.filter((m) => m.id !== id),
        });

        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    const onMessageUpdated = async (id: number, message: string) => {
      setLoading(true);
      try {
        const updatedMessage = await tasksService.updateMessage(
          id,
          message,
          taskEntity.id
        );

        if (updatedMessage) {
          setTaskEntity({
            ...taskEntity,
            messages: taskEntity.messages.map((m) =>
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
          id="add-task-form"
          className={styles.Form}
          onSubmit={handleSubmit(onSubmit)}
          ref={ref}
        >
          <TaskFormElements
            register={register}
            control={control}
            setValue={setValue}
            getValues={getValues}
            clearErrors={clearErrors}
            watch={watch}
            errors={errors}
            handleLoading={handleLoading}
            editMode={editMode}
          />
        </form>

        <div className={styles.MessagesSection}>
          <MessagesComponent
            ref={messagesRef}
            showNew
            authUser={authUser}
            onMessageAdded={onMessageAdded}
            onMessageDeleted={onMessageDeleted}
            onMessageUpdated={onMessageUpdated}
            initialMessages={taskEntity.messages || []}
          />
        </div>
      </div>
    );
  }
);
