import React, { useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Calendar,
  Check,
  Clock,
  TimerReset,
} from "lucide-react";
import { HomeRouterNames } from "@modules/home/config/home-router.names";
import styles from "./UpcomingNotificationsPage.module.scss";
import {
  buildUpcomingNotifications,
  formatNotificationDateTime,
  getMinutesUntil,
  NotificationDelayMap,
  NotificationScheduleSetting,
} from "./upcoming-notifications.model";
import {
  addNotificationDelay,
  getUpcomingNotificationSettings,
} from "./upcoming-notifications.api";
import { NotificationBell } from "@components/notification-bell/notification-bell";

interface UpcomingNotificationsLocationState {
  settings?: NotificationScheduleSetting[];
}

type PageFilter = "all" | "scheduled" | "delayed";

const DELAY_OPTIONS = [5, 10, 15, 30];

const formatCountdown = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 24 * 60) {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
  }
  const days = Math.floor(minutes / (24 * 60));
  return `${days} day${days === 1 ? "" : "s"}`;
};

const UpcomingNotificationsPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation<UpcomingNotificationsLocationState>();
  const passedSettings = location.state && location.state.settings;
  const [settings, setSettings] = useState<NotificationScheduleSetting[]>(
    passedSettings || []
  );
  const [delays, setDelays] = useState<NotificationDelayMap>({});
  const [filter, setFilter] = useState<PageFilter>("all");
  const [loading, setLoading] = useState(!passedSettings);
  const [error, setError] = useState<string | null>(null);
  const [delayRequestId, setDelayRequestId] = useState<string | null>(null);
  const [lockedDelays, setLockedDelays] = useState<Record<string, boolean>>({});
  const [delayFeedback, setDelayFeedback] = useState<
    Record<string, { type: "success" | "error"; message: string }>
  >({});
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchUpcomingNotifications = async () => {
      try {
        if (!passedSettings) setLoading(true);
        const upcoming = await getUpcomingNotificationSettings();
        setSettings(upcoming);
        setError(null);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not load upcoming notifications"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingNotifications();
  }, [passedSettings]);

  const notifications = useMemo(
    () => buildUpcomingNotifications(settings, delays, now),
    [settings, delays, now]
  );

  const visibleNotifications = useMemo(() => {
    if (filter === "delayed") {
      return notifications.filter((notification) => notification.delayMinutes > 0);
    }
    if (filter === "scheduled") {
      return notifications.filter((notification) => notification.delayMinutes === 0);
    }
    return notifications;
  }, [filter, notifications]);

  const delayedCount = notifications.filter(
    (notification) => notification.delayMinutes > 0
  ).length;

  const applyDelay = async (
    notificationId: string,
    settingId: number,
    minutes: number
  ) => {
    setDelayRequestId(notificationId);
    setDelayFeedback((current) => {
      const next = { ...current };
      delete next[notificationId];
      return next;
    });

    try {
      const response = await addNotificationDelay(settingId, minutes);
      const appliedMinutes =
        Number(response.delay_minutes ?? response.delay) || minutes;
      setDelays((current) => ({
        ...current,
        [notificationId]: appliedMinutes,
      }));
      setLockedDelays((current) => ({ ...current, [notificationId]: true }));
      setDelayFeedback((current) => ({
        ...current,
        [notificationId]: {
          type: "success",
          message: response.message || `Notification delayed by ${appliedMinutes} minutes.`,
        },
      }));
    } catch (delayError) {
      setDelayFeedback((current) => ({
        ...current,
        [notificationId]: {
          type: "error",
          message:
            delayError instanceof Error
              ? delayError.message
              : "Could not delay the notification",
        },
      }));
    } finally {
      setDelayRequestId(null);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.pageHeader}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => history.push(`/${HomeRouterNames.NOTIFICATION_LOGS}`)}
          >
            <ArrowLeft size={18} /> Back to Notifications & Messages
          </button>
          <NotificationBell />
        </div>

        <div className={styles.titleRow}>
          <div className={styles.titleIcon}>
            <Bell size={27} />
          </div>
          <div>
            <h1>Upcoming Notifications</h1>
            <p>
              Review scheduled system messages and choose a 5, 10, 15 or
              30-minute delay.
            </p>
          </div>
        </div>
      </header>

      {/* 
      <div className={styles.previewNotice}>
        <Check size={19} />
        <span>
          Upcoming notifications are loaded from the scheduling service. A delay
          selection is submitted immediately and can only be changed if the API
          allows another request.
        </span>
      </div>
      */}

      <section className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}><Calendar size={20} /></span>
          <div><strong>{notifications.length}</strong><span>Upcoming</span></div>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}><TimerReset size={20} /></span>
          <div><strong>{delayedCount}</strong><span>Delayed</span></div>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryIcon}><Clock size={20} /></span>
          <div><strong>15 min</strong><span>Advance notice</span></div>
        </div>
      </section>

      <div className={styles.toolbar}>
        <div className={styles.filters} aria-label="Notification filters">
          {(["all", "scheduled", "delayed"] as PageFilter[]).map((value) => (
            <button
              key={value}
              type="button"
              className={filter === value ? styles.activeFilter : ""}
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
        <span className={styles.resultCount}>
          {visibleNotifications.length} notification
          {visibleNotifications.length === 1 ? "" : "s"}
        </span>
      </div>

      {loading ? (
        <div className={styles.statePanel}>Loading upcoming notifications...</div>
      ) : error ? (
        <div className={`${styles.statePanel} ${styles.errorState}`}>
          <AlertCircle size={22} /> {error}
        </div>
      ) : visibleNotifications.length === 0 ? (
        <div className={styles.statePanel}>
          <Bell size={28} />
          <strong>No notifications in this view</strong>
          <span>Active scheduled notifications will appear here.</span>
        </div>
      ) : (
        <div className={styles.notificationList}>
          {visibleNotifications.map((notification) => {
            const remainingMinutes = getMinutesUntil(
              notification.effectiveSendAt,
              now
            );

            return (
              <article key={notification.id} className={styles.notificationCard}>
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.typeLabel}>
                      {notification.type.replace(/_/g, " ")}
                    </span>
                    <h2>{notification.title}</h2>
                  </div>
                  <span
                    className={`${styles.statusBadge} ${
                      notification.delayMinutes ? styles.delayedBadge : ""
                    }`}
                  >
                    {notification.delayMinutes ? "Delayed" : "Scheduled"}
                  </span>
                </div>

                <p className={styles.messagePreview}>{notification.message}</p>

                <div className={styles.deliveryDetails}>
                  <div>
                    <span>Original time</span>
                    <strong>
                      {formatNotificationDateTime(notification.originalSendAt)}
                    </strong>
                  </div>
                  <div>
                    <span>Delivery time</span>
                    <strong>
                      {formatNotificationDateTime(notification.effectiveSendAt)}
                    </strong>
                  </div>
                  <div>
                    <span>Time remaining</span>
                    <strong>{formatCountdown(remainingMinutes)}</strong>
                  </div>
                </div>

                <div className={styles.delaySection}>
                  <div>
                    <strong>Delay this notification</strong>
                    <span>Select one delivery delay</span>
                  </div>
                  <div className={styles.delayActions}>
                    {DELAY_OPTIONS.map((minutes) => (
                      <button
                        key={minutes}
                        type="button"
                        className={
                          notification.delayMinutes === minutes
                            ? styles.selectedDelay
                            : ""
                        }
                        onClick={() =>
                          applyDelay(
                            notification.id,
                            notification.settingId,
                            minutes
                          )
                        }
                        disabled={
                          delayRequestId === notification.id ||
                          Boolean(lockedDelays[notification.id]) ||
                          notification.delayMinutes > 0
                        }
                        aria-pressed={notification.delayMinutes === minutes}
                      >
                        {notification.delayMinutes === minutes && <Check size={14} />}
                        {delayRequestId === notification.id
                          ? "Saving..."
                          : `+${minutes} min`}
                      </button>
                    ))}
                  </div>
                </div>
                {delayFeedback[notification.id] && (
                  <div
                    className={`${styles.delayFeedback} ${
                      delayFeedback[notification.id].type === "error"
                        ? styles.delayFeedbackError
                        : ""
                    }`}
                  >
                    {delayFeedback[notification.id].type === "error" ? (
                      <AlertCircle size={15} />
                    ) : (
                      <Check size={15} />
                    )}
                    {delayFeedback[notification.id].message}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpcomingNotificationsPage;
