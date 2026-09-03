export interface NotificationScheduleSetting {
  id: number;
  notification_type: string;
  notification_title: string;
  notification_text: string;
  notification_status: 1 | 0;
  notification_send_time: string | null;
  notification_frequency: "daily" | "weekly";
  notification_frequency_day?: string;
  notification_sending_type: "timed" | "trigger";
  notification_delay?: boolean;
  delay?: number | string | null;
}

export interface UpcomingSystemNotification {
  id: string;
  settingId: number;
  type: string;
  title: string;
  message: string;
  originalSendAt: string;
  effectiveSendAt: string;
  delayMinutes: number;
  frequency: "daily" | "weekly";
}

export type NotificationDelayMap = Record<string, number>;

const WEEKDAYS: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const getNextOccurrence = (
  time: string,
  frequency: "daily" | "weekly",
  frequencyDay: string | undefined,
  now: Date
): Date | null => {
  const [hours, minutes] = time.split(":").map(Number);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  const next = new Date(now);
  next.setSeconds(0, 0);
  next.setHours(hours, minutes, 0, 0);

  if (frequency === "daily") {
    if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
    return next;
  }

  const targetDay = WEEKDAYS[(frequencyDay || "").toLowerCase()];
  if (targetDay === undefined) return null;

  let daysUntilTarget = (targetDay - now.getDay() + 7) % 7;
  if (daysUntilTarget === 0 && next.getTime() <= now.getTime()) {
    daysUntilTarget = 7;
  }
  next.setDate(next.getDate() + daysUntilTarget);
  return next;
};

export const buildUpcomingNotifications = (
  settings: NotificationScheduleSetting[],
  delays: NotificationDelayMap = {},
  now = new Date()
): UpcomingSystemNotification[] => {
  const upcoming: UpcomingSystemNotification[] = [];

  settings.forEach((setting) => {
    if (
      Number(setting.notification_status) !== 1 ||
      setting.notification_sending_type !== "timed"
    ) {
      return;
    }

    const times = (setting.notification_send_time || "")
      .split(",")
      .map((time) => time.trim())
      .filter(Boolean);

    times.forEach((time) => {
      const occurrence = getNextOccurrence(
        time,
        setting.notification_frequency,
        setting.notification_frequency_day,
        now
      );
      if (!occurrence) return;

      const occurrenceKey = occurrence.toISOString().slice(0, 10);
      const id = `${setting.id}-${occurrenceKey}-${time.replace(":", "")}`;
      const savedDelay = setting.notification_delay
        ? Number(setting.delay) || 0
        : 0;
      const delayMinutes = delays[id] ?? savedDelay;
      const effectiveSendAt = new Date(
        occurrence.getTime() + delayMinutes * 60 * 1000
      );

      upcoming.push({
        id,
        settingId: setting.id,
        type: setting.notification_type,
        title: setting.notification_title,
        message: setting.notification_text,
        originalSendAt: occurrence.toISOString(),
        effectiveSendAt: effectiveSendAt.toISOString(),
        delayMinutes,
        frequency: setting.notification_frequency,
      });
    });
  });

  return upcoming.sort(
    (first, second) =>
      new Date(first.effectiveSendAt).getTime() -
      new Date(second.effectiveSendAt).getTime()
  );
};

export const formatNotificationDateTime = (value: string): string =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export const getMinutesUntil = (value: string, now = new Date()): number =>
  Math.max(
    0,
    Math.ceil((new Date(value).getTime() - now.getTime()) / (60 * 1000))
  );
