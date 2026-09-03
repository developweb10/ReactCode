import { QueryEntity, combineQueries } from "@datorama/akita";
import { map } from "rxjs/operators";

import {
  timeAttendanceStore,
  TimeAttendanceState,
  TimeAttendanceStore,
} from "./time-attendance.store";

export class TimeAttendanceQuery extends QueryEntity<TimeAttendanceState> {
  loading$ = this.selectLoading();

  timesheetAssignments$ = this.selectAll();

  timesheetAssignmentsCount$ = this.selectCount();

  assignmentTypes$ = this.select("assignmentTypes");

  timeAttendanceStats$ = this.select((state) => ({
    status: state.status,
    workedMinutes: state.workedMinutes,
    contractedMinutes: state.contractedMinutes,
    contractedHourlyRate: state.contractedHourlyRate,
    contractedPay: state.contractedPay,
  }));

  selectDayByAssignmentId = (assignmentId: number, day: string) => {
    return this.selectEntity(assignmentId, (entity) => {
      return entity?.perDays.find((p) => p.date === day);
    });
  };

  getDaysByAssignmentId = (assignmentId: number) => {
    const timesheetAssignments = this.getAll();
    return (
      timesheetAssignments.find((a) => a.id === assignmentId)?.perDays || []
    );
  };

  getTimeAttendanceStats = () => {
    const state = this.getValue();
    return {
      status: state.status,
      workedMinutes: state.workedMinutes,
      contractedMinutes: state.contractedMinutes,
      contractedHourlyRate: state.contractedHourlyRate,
      contractedPay: state.contractedPay,
    };
  };

  getTimesheetAssignmentsWithNames = () => {
    const timesheetAssignments = this.getAll();
    const assignmentTypes = this.getValue().assignmentTypes;
    return timesheetAssignments.map((assignment) => {
      return {
        ...assignment,
        name:
          assignmentTypes.find((type) => type.id === assignment.assigmentTypeId)
            ?.name || "Assignment",
      };
    });
  };

  timesheetAssignmentsWithNames$ = combineQueries([
    this.selectAll(),
    this.select("assignmentTypes"),
  ]).pipe(
    map(([assignments, assignmentTypes]) => {
      return assignments.map((assignment) => {
        return {
          ...assignment,
          name:
            assignmentTypes.find(
              (type) => type.id === assignment.assigmentTypeId
            )?.name || "Assignment",
        };
      });
    })
  );

  getAddRowAssignmentTypes = () => {
    const timesheetAssignments = this.getAll();
    const assignmentTypes = this.getValue().assignmentTypes;
    return assignmentTypes.filter(
      (type) => !timesheetAssignments.find((t) => t.assigmentTypeId === type.id)
    );
  };

  getEditRowAssignmentTypes = (selectedAssigmentTypeId: number) => {
    const timesheetAssignments = this.getAll();
    const assignmentTypes = this.getValue().assignmentTypes;
    return assignmentTypes.filter(
      (type) =>
        !timesheetAssignments.find(
          (t) =>
            type.id !== selectedAssigmentTypeId && t.assigmentTypeId === type.id
        )
    );
  };

  getCurrentAssignments = (idProp: "assigmentTypeId" | "id") => {
    const timesheetAssignments = this.getAll();
    const assignmentTypes = this.getValue().assignmentTypes;
    return timesheetAssignments.map((t) => {
      const typeName = assignmentTypes.find(
        (type) => type.id === t.assigmentTypeId
      );
      return {
        id: t[idProp],
        name: typeName?.name || "Assignment",
      };
    });
  };

  getAssignmentByTypeId(assignmentTypeId: number) {
    return this.getAll().find((a) => a.assigmentTypeId === assignmentTypeId);
  }

  constructor(protected store: TimeAttendanceStore) {
    super(store);
  }
}

export const timeAttendanceQuery = new TimeAttendanceQuery(timeAttendanceStore);
