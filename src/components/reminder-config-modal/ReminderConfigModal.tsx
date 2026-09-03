// src/components/ReminderConfigModal.tsx
import React, { useState, useEffect } from "react";
import { Clock, Save, X, Mail } from "lucide-react";
import styles from "./ReminderConfigModal.module.scss";

interface ReminderConfig {
  confirmationReminderTime: string; // "HH:MM"
  confirmationMessage: string;
  unconfirmedReminderOffset: number; // hours
  unconfirmedMessage: string;
  finalReminderTime: string; // "HH:MM"
  finalMessage: string;
  availabilityReminderTime: string; // "HH:MM"
  availabilityMessage: string;
  availabilityFrequency: "daily" | "weekly" | "custom";
}

const API_BASE_URL =
  process.env.REACT_APP_PHP_BASE_URL || "https://your-api-base-url";

const ReminderConfigModal: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const [config, setConfig] = useState<ReminderConfig>({
    confirmationReminderTime: "18:00",
    confirmationMessage: "Please confirm your shift for tomorrow by 7:00 PM.",
    unconfirmedReminderOffset: 3,
    unconfirmedMessage:
      "Reminder: Confirm your shift soon — deadline is 7:00 PM today.",
    finalReminderTime: "19:00",
    finalMessage: "Final reminder: Shift confirmation deadline is now.",
    availabilityReminderTime: "09:00",
    availabilityMessage:
      "Please submit your working availability for the upcoming week.",
    availabilityFrequency: "daily",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/notification_configs`);
        if (!response.ok) {
          throw new Error("Failed to fetch configs");
        }
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        setError("Failed to load configurations.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (
    field: keyof ReminderConfig,
    value: string | number
  ) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/update_notification_configs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to save configs");
      }
      alert("Configurations saved successfully!");
      onClose();
    } catch (err) {
      setError("Failed to save configurations.");
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>
            <Clock size={20} /> Configure Reminders & Messages
          </h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {error && <div className={styles.error}>{error}</div>}

        {/* Confirmation Reminder */}
        <div className={styles.section}>
          <h3>
            <Mail size={18} /> Confirmation Reminder (Day Before)
          </h3>
          <div className={styles.formGroup}>
            <label>Time</label>
            <input
              type="time"
              value={config.confirmationReminderTime}
              onChange={(e) =>
                handleChange("confirmationReminderTime", e.target.value)
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label>Message Text</label>
            <textarea
              value={config.confirmationMessage}
              onChange={(e) =>
                handleChange("confirmationMessage", e.target.value)
              }
              rows={3}
            />
          </div>
        </div>

        {/* Unconfirmed Reminder */}
        <div className={styles.section}>
          <h3>
            <Mail size={18} /> Unconfirmed Reminder
          </h3>
          <div className={styles.formGroup}>
            <label>Offset (Hours Before Deadline)</label>
            <input
              type="number"
              value={config.unconfirmedReminderOffset}
              onChange={(e) =>
                handleChange(
                  "unconfirmedReminderOffset",
                  parseInt(e.target.value)
                )
              }
              min={1}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Message Text</label>
            <textarea
              value={config.unconfirmedMessage}
              onChange={(e) =>
                handleChange("unconfirmedMessage", e.target.value)
              }
              rows={3}
            />
          </div>
        </div>

        {/* Final Reminder */}
        <div className={styles.section}>
          <h3>
            <Mail size={18} /> Final Reminder
          </h3>
          <div className={styles.formGroup}>
            <label>Time (Before Deadline)</label>
            <input
              type="time"
              value={config.finalReminderTime}
              onChange={(e) =>
                handleChange("finalReminderTime", e.target.value)
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label>Message Text</label>
            <textarea
              value={config.finalMessage}
              onChange={(e) => handleChange("finalMessage", e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Availability Reminder */}
        <div className={styles.section}>
          <h3>
            <Mail size={18} /> Availability Reminder
          </h3>
          <div className={styles.formGroup}>
            <label>Time</label>
            <input
              type="time"
              value={config.availabilityReminderTime}
              onChange={(e) =>
                handleChange("availabilityReminderTime", e.target.value)
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label>Frequency</label>
            <select
              value={config.availabilityFrequency}
              onChange={(e) =>
                handleChange(
                  "availabilityFrequency",
                  e.target.value as "daily" | "weekly" | "custom"
                )
              }
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Message Text</label>
            <textarea
              value={config.availabilityMessage}
              onChange={(e) =>
                handleChange("availabilityMessage", e.target.value)
              }
              rows={3}
            />
          </div>
        </div>

        <button className={styles.saveButton} onClick={handleSubmit}>
          <Save size={20} /> Save Configurations
        </button>
      </div>
    </div>
  );
};

export default ReminderConfigModal;
