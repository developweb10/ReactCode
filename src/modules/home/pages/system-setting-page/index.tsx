// src/pages/SystemSettingsPage.tsx
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  Clock,
  Save,
  Trash2,
  Plus,
  ToggleLeft,
  ToggleRight,
  Mail,
  AlertCircle,
  Settings2,
  Info,
  CheckCircle2,
  X,
  ChevronRight,
} from "lucide-react";
import styles from "./SystemSettingsPage.module.scss";
import { HomeRouterNames } from "@modules/home/config/home-router.names";
import { NotificationScheduleSetting } from "../upcoming-notifications-page/upcoming-notifications.model";
import { NotificationBell } from "@components/notification-bell/notification-bell";

interface NotificationSetting extends NotificationScheduleSetting {}
const API_BASE_URL = process.env.REACT_APP_PHP_BASE_URL;
const FETCH_API_URL = `
  ${API_BASE_URL}/notifcation_settings`;
const UPDATE_API_URL = `${API_BASE_URL}/update_notifcation_settings`;

const SystemSettingsPage: React.FC = () => {
  const history = useHistory();
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Record<number, { title?: string; text?: string; day?: string }>
  >({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(FETCH_API_URL);
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data = await response.json();

      if (data.status === 1 && data.notifcation_settings) {
        setSettings(data.notifcation_settings);
      } else {
        throw new Error(data.message || "Invalid response");
      }
    } catch (err: any) {
      setError(err.message || "Could not load notification settings.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

const updateSetting = (
  id: number,
  field: keyof NotificationSetting,
  value: any
) => {
  setSettings((prev) =>
    prev.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        // DEFAULT LOGIC: When frequency changes to weekly, set day to monday if currently empty
        if (field === "notification_frequency" && value === "weekly") {
          if (!updatedItem.notification_frequency_day) {
            updatedItem.notification_frequency_day = "monday";
          }
        }
        return updatedItem;
      }
      return item;
    })
  );

  // IMMEDIATE VALIDATION: Check for empty values as the user types
  const isError = value.toString().trim() === "";

  setFieldErrors((prev) => {
    const currentErrors = { ...prev[id] };

    if (field === "notification_title") {
      isError
        ? (currentErrors.title = "Title is required")
        : delete currentErrors.title;
    } else if (field === "notification_text") {
      isError
        ? (currentErrors.text = "Message content is required")
        : delete currentErrors.text;
    } else if (field === "notification_frequency_day") {
      isError
        ? (currentErrors.day = "Please select a day")
        : delete currentErrors.day;
    }

    // If no errors left for this ID, remove the key from state entirely
    if (Object.keys(currentErrors).length === 0) {
      const nextFieldErrors = { ...prev };
      delete nextFieldErrors[id];
      return nextFieldErrors;
    }

    return { ...prev, [id]: currentErrors };
  });
};

  const toggleEnabled = (id: number) => {
    setSettings((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              notification_status: item.notification_status === 1 ? 0 : 1,
            }
          : item
      )
    );
  };

  const getTimesArray = (timeString: string | null): string[] => {
    if (!timeString || timeString.trim() === "") return [];
    return timeString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  };

  const addTime = (id: number) => {
    setSettings((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const current = getTimesArray(item.notification_send_time);
        return {
          ...item,
          notification_send_time: [...current, "09:00"].join(", "),
        };
      })
    );
  };

  const removeTime = (id: number, timeIndex: number) => {
    setSettings((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const current = getTimesArray(item.notification_send_time);
        const updated = current.filter((_, i) => i !== timeIndex);
        return {
          ...item,
          notification_send_time: updated.length > 0 ? updated.join(", ") : "",
        };
      })
    );
  };

  const updateTime = (id: number, timeIndex: number, value: string) => {
    setSettings((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const current = getTimesArray(item.notification_send_time);
        current[timeIndex] = value;
        return { ...item, notification_send_time: current.join(", ") };
      })
    );
  };

  const validateSettings = (): boolean => {
    const errors: Record<
      number,
      { title?: string; text?: string; day?: string }
    > = {};

    settings.forEach((s) => {
      const err: { title?: string; text?: string; day?: string } = {};

      if (!s.notification_title.trim()) {
        err.title = "Title is required";
      }
      if (!s.notification_text.trim()) {
        err.text = "Message content is required";
      }
      if (
        s.notification_frequency === "weekly" &&
        !s.notification_frequency_day
      ) {
        err.day = "Please select a day for weekly notifications";
      }

      if (Object.keys(err).length > 0) {
        errors[s.id] = err;
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveAll = async () => {
    if (!validateSettings()) {
      setError("Please fix the errors below before saving.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const payload = {
        configs: settings.map((s) => ({
          notification_type: s.notification_type,
          notification_title: s.notification_title.trim(),
          notification_text: s.notification_text.trim(),
          notification_status: s.notification_status.toString() as "0" | "1",
          notification_send_time:
            s.notification_sending_type === "timed" &&
            s.notification_send_time?.trim()
              ? s.notification_send_time.trim()
              : "",
          notification_frequency: s.notification_frequency,
          notification_sending_type: s.notification_sending_type,
          ...(s.notification_frequency === "weekly" &&
          s.notification_frequency_day
            ? { notification_frequency_day: s.notification_frequency_day }
            : {}),
        })),
      };

      const response = await fetch(UPDATE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save settings");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
          <span>Loading notification settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.pageHeader}>
        <div className={styles.headerTitle}>
          <div className={styles.iconBox}>
            <Settings2 size={28} />
          </div>
          <div>
            <h1>System Notification Setting</h1>
            <p>
              Configure how and when users receive system-generated messages.
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          {success && (
            <div className={styles.successToast}>
              <CheckCircle2 size={18} />
              Settings saved successfully!
            </div>
          )}
          <NotificationBell />
          <button
            onClick={saveAll}
            className={styles.primaryBtn}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className={styles.btnSpinner}></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save All Changes
              </>
            )}
          </button>
        </div>
        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}
      </header>

      {/* 
      {nextNotification && (
        <button
          type="button"
          className={styles.upcomingNotice}
          onClick={openUpcomingNotifications}
        >
          <span className={styles.noticeIcon}>
            <Bell size={22} />
          </span>
          <span className={styles.noticeContent}>
            <strong>Upcoming system notification</strong>
            <span>
              {nextNotification.title} is scheduled for{" "}
              {formatNotificationDateTime(nextNotification.effectiveSendAt)}.
              Users receive a 15-minute advance notice.
            </span>
          </span>
          <span className={styles.noticeAction}>
            View and delay <ChevronRight size={18} />
          </span>
        </button>
      )}
      */}

      {/* Scrollable Content */}
      <div className={styles.scrollableContent}>
        <div className={styles.settingsGrid}>
          {settings.map((setting) => {
            const timesArray = getTimesArray(setting.notification_send_time);
            const isTimed = setting.notification_sending_type === "timed";
            const isWeekly = setting.notification_frequency === "weekly";
            const errors = fieldErrors[setting.id] || {};

            return (
              <div
                key={setting.id}
                className={`${styles.settingCard} ${
                  setting.notification_status === 0 ? styles.disabledCard : ""
                }`}
              >
                <div className={styles.cardTop}>
                  <div className={styles.typeIndicator}>
                    <div className={styles.mailIcon}>
                      <Mail size={20} />
                    </div>
                    <span>{setting.notification_type.replace(/_/g, " ")}</span>
                  </div>

                  <button
                    onClick={() => toggleEnabled(setting.id)}
                    className={`${styles.statusToggle} ${
                      setting.notification_status === 1
                        ? styles.statusActive
                        : ""
                    }`}
                  >
                    {setting.notification_status === 1 ? (
                      <ToggleRight size={26} />
                    ) : (
                      <ToggleLeft size={26} />
                    )}
                    {setting.notification_status === 1 ? "Active" : "Inactive"}
                  </button>
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.inputSection}>
                    <label>Email Subject / Title</label>
                    <input
                      type="text"
                      value={setting.notification_title}
                      onChange={(e) =>
                        updateSetting(
                          setting.id,
                          "notification_title",
                          e.target.value
                        )
                      }
                      disabled={setting.notification_status === 0}
                      className={errors.title ? styles.inputError : ""}
                    />
                    {errors.title && (
                      <span className={styles.fieldError}>{errors.title}</span>
                    )}
                  </div>

                  <div className={styles.inputSection}>
                    <label>Message Content</label>
                    <textarea
                      value={setting.notification_text}
                      onChange={(e) =>
                        updateSetting(
                          setting.id,
                          "notification_text",
                          e.target.value
                        )
                      }
                      rows={4}
                      placeholder="Write your message here... Use {DATE} for shift date"
                      disabled={setting.notification_status === 0}
                      className={errors.text ? styles.inputError : ""}
                    />
                    {errors.text && (
                      <span className={styles.fieldError}>{errors.text}</span>
                    )}
                    <div className={styles.helperText}>
                      <Info size={14} />
                      Available tag: <code>{`{DATE}`}</code>
                    </div>
                  </div>

                  <div className={styles.configDivider}></div>

                  <div className={styles.deliverySection}>
                    <div className={styles.deliveryMeta}>
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Delivery Type</span>
                        <span className={styles.metaValue}>
                          {isTimed ? "Scheduled" : "Event Triggered"}
                        </span>
                      </div>

                      {isTimed && (
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Frequency</span>
                          <select
                            value={setting.notification_frequency}
                            onChange={(e) =>
                              updateSetting(
                                setting.id,
                                "notification_frequency",
                                e.target.value as "daily" | "weekly"
                              )
                            }
                            disabled={setting.notification_status === 0}
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {isTimed ? (
                      <div className={styles.timeSchedule}>
                        <label>
                          <Clock size={14} /> Scheduled Times
                        </label>
                        <div className={styles.timeChips}>
                          {timesArray.length > 0 ? (
                            timesArray.map((time, idx) => (
                              <div key={idx} className={styles.timeChip}>
                                <input
                                  type="time"
                                  value={time}
                                  onChange={(e) =>
                                    updateTime(setting.id, idx, e.target.value)
                                  }
                                  disabled={setting.notification_status === 0}
                                />
                                <button
                                  onClick={() => removeTime(setting.id, idx)}
                                  className={styles.chipRemove}
                                  disabled={setting.notification_status === 0}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))
                          ) : (
                            <span className={styles.noTimesHint}>
                              No times configured
                            </span>
                          )}
                          <button
                            onClick={() => addTime(setting.id)}
                            className={styles.addTimeBtn}
                            disabled={setting.notification_status === 0}
                          >
                            <Plus size={14} /> Add Time
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.triggerAlert}>
                        This message is sent immediately when the corresponding
                        system event occurs.
                      </div>
                    )}

                    {isWeekly && (
                      <div className={styles.inputSection}>
                        <label>Send on Day</label>
                        <select
                          value={setting.notification_frequency_day || ""}
                          onChange={(e) =>
                            updateSetting(
                              setting.id,
                              "notification_frequency_day",
                              e.target.value.toLowerCase()
                            )
                          }
                          disabled={setting.notification_status === 0}
                          className={errors.day ? styles.inputError : ""}
                        >
                          <option value="">Select a day</option>
                          <option value="monday">Monday</option>
                          <option value="tuesday">Tuesday</option>
                          <option value="wednesday">Wednesday</option>
                          <option value="thursday">Thursday</option>
                          <option value="friday">Friday</option>
                          <option value="saturday">Saturday</option>
                          <option value="sunday">Sunday</option>
                        </select>
                        {errors.day && (
                          <span className={styles.fieldError}>
                            {errors.day}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
