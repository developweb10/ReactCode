import { TaskPriority } from "@models/tasks.models";

const NOTICEBOARD_PRIORITY_STORAGE_KEY = "noticeboardTaskPriorities";

export const getStoredTaskPriorities = (): Record<string, TaskPriority> => {
  try {
    return JSON.parse(
      localStorage.getItem(NOTICEBOARD_PRIORITY_STORAGE_KEY) || "{}"
    );
  } catch (error) {
    return {};
  }
};

export const storeTaskPriority = (
  taskId: number,
  priority?: TaskPriority | null
) => {
  if (!priority) return;

  const priorities = getStoredTaskPriorities();
  localStorage.setItem(
    NOTICEBOARD_PRIORITY_STORAGE_KEY,
    JSON.stringify({ ...priorities, [taskId]: priority })
  );
};
