import styles from "./comments-sidebar.module.scss";
import { Typography, CircularProgress } from "@material-ui/core/";
import { MessagesComponent } from "@components/messages/messages";
import { Select } from "@components/select/select";
import moment from "moment";

import { UserAuthModel } from "@models/authorization.models";
import { useState, useMemo } from "react";
import { useObservableState } from "observable-hooks";

import { timeAttendanceQuery } from "@store/time-attendance/time-attendance.query";
import { timeAttendanceService } from "@store/time-attendance/time-attendance.service";

import _get from "lodash.get";

interface Props {
  drawerInitialData: {
    initialDay: string;
    initialAssignmentId: number;
  };
  currentUser: UserAuthModel;
}

export const CommentsSidebarBody: React.FC<Props> = ({
  currentUser,
  drawerInitialData,
}) => {
  const [selectedDay, setDay] = useState(drawerInitialData.initialDay);
  const [selectedAssignmentId, setAssignmentId] = useState(
    drawerInitialData.initialAssignmentId
  );
  const [loading, setLoading] = useState(false);

  const dayData = useObservableState(
    timeAttendanceQuery.selectDayByAssignmentId(
      selectedAssignmentId,
      selectedDay
    )
  );

  const daysOptions = useMemo(() => {
    const perDays = timeAttendanceQuery.getDaysByAssignmentId(
      selectedAssignmentId
    );

    const dayExist = perDays.find((d) => d.date === selectedDay);
    if (!dayExist) {
      setDay(_get(perDays, "[0].date", ""));
    }

    return perDays.map((d) => ({
      name: moment(d.date, "YYYY-MM-DD").format("ddd[.] D MMM YYYY"),
      value: d.date,
    }));
  }, [selectedAssignmentId, selectedDay]);

  const assignmentOptions = useMemo(() => {
    return timeAttendanceQuery.getCurrentAssignments("id").map((o) => ({
      name: o.name,
      value: o.id,
    }));
  }, []);

  const onMessageAdded = async (message: string) => {
    setLoading(true);
    try {
      await timeAttendanceService.addDayComment(
        dayData!.id,
        selectedAssignmentId,
        message
      );

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const onMessageDeleted = async (id: number) => {
    setLoading(true);
    try {
      await timeAttendanceService.deleteDayComment(
        dayData!.id,
        selectedAssignmentId,
        id
      );

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const onMessageUpdated = async (id: number, message: string) => {
    setLoading(true);
    try {
      await timeAttendanceService.updateDayComment(
        dayData!.id,
        selectedAssignmentId,
        message,
        id
      );

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <div className={styles.DrawerBody}>
      {loading && (
        <div className="overlay-loader with-opacity">
          <CircularProgress size="6rem" variant="indeterminate" disableShrink />
        </div>
      )}
      <div className={styles.InputWrapper}>
        <Typography className={styles.InputLabel}>Selected Day:</Typography>
        <Select
          value={selectedDay}
          options={daysOptions}
          onChange={(
            event: React.ChangeEvent<{
              name?: string | undefined;
              value: unknown;
            }>
          ) => {
            setDay(event.target.value as string);
          }}
        />
      </div>
      <div className={styles.InputWrapper}>
        <Typography className={styles.InputLabel}>
          Selected Assignment:
        </Typography>
        <Select
          value={selectedAssignmentId}
          options={assignmentOptions}
          onChange={(
            event: React.ChangeEvent<{
              name?: string | undefined;
              value: unknown;
            }>
          ) => {
            setAssignmentId(event.target.value as number);
          }}
        />
      </div>

      <MessagesComponent
        initialMessages={dayData?.messages || []}
        isComment
        authUser={currentUser}
        onMessageAdded={onMessageAdded}
        onMessageDeleted={onMessageDeleted}
        onMessageUpdated={onMessageUpdated}
      />
    </div>
  );
};
