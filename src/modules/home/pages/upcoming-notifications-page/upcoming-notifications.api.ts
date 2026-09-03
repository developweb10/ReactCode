import { NotificationScheduleSetting } from "./upcoming-notifications.model";

const API_BASE_URL = process.env.REACT_APP_PHP_BASE_URL;
const UPCOMING_NOTIFICATIONS_URL = `${API_BASE_URL}/get_upcoming_notifications`;
const ADD_NOTIFICATION_DELAY_URL = `${API_BASE_URL}/add_notification_delay`;

interface UpcomingNotificationsResponse {
  status: number;
  message?: string;
  upcoming_notifications?: NotificationScheduleSetting[];
}

export interface AddNotificationDelayResponse {
  status: number;
  message?: string;
  delay_minutes?: number;
  delay?: number;
  effective_send_at?: string;
}

const readJsonResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json().catch(() => null);
  if (!data) throw new Error("The notification service returned invalid data");
  return data as T;
};

export const getUpcomingNotificationSettings = async (): Promise<
  NotificationScheduleSetting[]
> => {
  const response = await fetch(UPCOMING_NOTIFICATIONS_URL);
  const data = await readJsonResponse<UpcomingNotificationsResponse>(response);

  if (
    !response.ok ||
    Number(data.status) !== 1 ||
    !Array.isArray(data.upcoming_notifications)
  ) {
    throw new Error(data.message || "Could not load upcoming notifications");
  }

  return data.upcoming_notifications;
};

export const addNotificationDelay = async (
  notificationId: number,
  delayMinutes: number
): Promise<AddNotificationDelayResponse> => {
  const payload = new URLSearchParams();
  payload.set("notification_id", String(notificationId));
  payload.set("delay", String(delayMinutes));

  const response = await fetch(ADD_NOTIFICATION_DELAY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload,
  });
  const data = await readJsonResponse<AddNotificationDelayResponse>(response);

  if (!response.ok || Number(data.status) !== 1) {
    throw new Error(data.message || "Could not delay the notification");
  }

  return data;
};
