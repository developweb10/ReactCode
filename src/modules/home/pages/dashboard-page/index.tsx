import styles from "./dashboard-page.module.scss";
import DashboardIcon from "@assets/images/dashboard-yellow-icon.svg";
import { useEffect, useState } from "react";

import { DashboardApi } from "@api/dashboard/dashboard.api";
import { DashboardDto, FleetVehicle } from "@models/dashboard.models";
import { TasksApi } from "@api/tasks/tasks.api";
import { TaskModel, TaskPriority, TaskType } from "@models/tasks.models";

import { PageHeader } from "@components/page-header/page-header";

import { StatSection } from "./stat-section/stat-section";
import { LineChartSection } from "./linechart-section/linechart-section";
import { CasePositionSection } from "./case-position-section/case-position-section";
import {
  GroupNoticeboardSection,
  PositionTypeSection,
} from "./group-noticeboard-section/group-noticeboard-section";
import { CaseAgeSection } from "./case-age-section/case-age-section";

import { Box } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import moment from "moment";
import { getStoredTaskPriorities } from "@utils/task-priority-storage";

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardDto | null>(null);
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>([]);
  const [noticeboardTasks, setNoticeboardTasks] = useState<TaskModel[]>([]);
  const [noticeboardLoading, setNoticeboardLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const result = await DashboardApi.getStats();
      setStats(result.data);

      try {
        const fleetResult = await DashboardApi.getFleetVehicles();
        setFleetVehicles(
          fleetResult.status === 1 ? fleetResult.vehicles || [] : []
        );
      } catch (error) {
        setFleetVehicles([]);
      }

      try {
        setNoticeboardLoading(true);
        const tasksResult = await TasksApi.fetchTasks({
          taskType: TaskType.CREATED_TO_ME,
          date: moment().format("YYYY-MM-DD"),
        });
        const storedPriorities = getStoredTaskPriorities();
        setNoticeboardTasks(
          (tasksResult.data.result || [])
            .filter((task) => task.isNoticeboard)
            .map((task) => ({
              ...task,
              priority:
                storedPriorities[String(task.id)] ||
                task.priority ||
                TaskPriority.MEDIUM,
            }))
        );
      } catch (error) {
        setNoticeboardTasks([]);
      } finally {
        setNoticeboardLoading(false);
      }
    })();
  }, []);

  return (
    <div className={styles.Wrap}>
      <PageHeader title="Dashboard" icon={DashboardIcon} />
      <div className="page-content">
        {stats ? (
          <>
            <StatSection
              employeesNumber={stats.numberOfEmployees}
              tasksNumber={stats.numberOfTasks}
              genders={stats.workforceGenders}
              fleetVehicles={fleetVehicles}
            />
            <PositionTypeSection positions={stats.positionTypes} />
            <LineChartSection
              caseTypes={stats.caseTypes}
              fleetVehicles={fleetVehicles}
            />
            <CaseAgeSection ages={stats.employeeAges} />
            <CasePositionSection />
            <GroupNoticeboardSection
              tasks={noticeboardTasks}
              loading={noticeboardLoading}
            />
          </>
        ) : (
          <>
            <Box
              display="flex"
              justifyContent="space-between"
              marginTop={2}
              style={{
                opacity: 0.4,
              }}
            >
              <Skeleton
                variant="rect"
                height={150}
                className={styles.Skeleton}
              ></Skeleton>
              <Skeleton
                variant="rect"
                height={150}
                className={styles.Skeleton}
              ></Skeleton>
              <Skeleton
                variant="rect"
                height={150}
                className={styles.Skeleton}
              ></Skeleton>
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              marginTop={3}
              style={{
                opacity: 0.4,
              }}
            >
              <Skeleton
                variant="rect"
                height={200}
                className={styles.SkeletonWide}
              ></Skeleton>
              <Skeleton
                variant="rect"
                height={200}
                className={styles.Skeleton}
              ></Skeleton>
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              marginTop={3}
              style={{
                opacity: 0.4,
              }}
            >
              <Skeleton
                variant="rect"
                height={200}
                className={styles.Skeleton}
              ></Skeleton>
              <Skeleton
                variant="rect"
                height={200}
                className={styles.SkeletonWide}
              ></Skeleton>
            </Box>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
