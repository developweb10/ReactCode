// src/components/ReminderConfigModal.tsx
import React, { useState, useEffect } from "react";
import { Clock, Save, X } from "lucide-react";
import styles from "./ReminderConfigModal.module.scss";

interface ReminderConfig {
  confirmationReminderTime: string; // "HH:MM"
  unconfirmedReminderOffset: number; // hours
  finalReminderTime: string; // "HH:MM"
  availabilityReminderTime: string; // "HH:MM"
  availabilityFrequency: "daily" | "weekly" | "custom"; // Add custom logic if needed ...currently custom field is not included
}

const API_BASE_URL =
  process.env.REACT_APP_PHP_BASE_URL || "https://your-api-base-url";

const ReminderConfigModal: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const [config, setConfig] = useState<ReminderConfig>({
    confirmationReminderTime: "18:00",
    unconfirmedReminderOffset: 3,
    finalReminderTime: "19:00",
    availabilityReminderTime: "09:00",
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
            <Clock size={20} /> Configure Reminders
          </h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.formGroup}>
          <label>Confirmation Reminder Time (Day Before)</label>
          <input
            type="time"
            value={config.confirmationReminderTime}
            onChange={(e) =>
              handleChange("confirmationReminderTime", e.target.value)
            }
          />
        </div>
        <div className={styles.formGroup}>
          <label>Unconfirmed Reminder Offset (Hours Before Deadline)</label>
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
          <label>Final Reminder Time (Before Deadline)</label>
          <input
            type="time"
            value={config.finalReminderTime}
            onChange={(e) => handleChange("finalReminderTime", e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Availability Reminder Time</label>
          <input
            type="time"
            value={config.availabilityReminderTime}
            onChange={(e) =>
              handleChange("availabilityReminderTime", e.target.value)
            }
          />
        </div>
        <div className={styles.formGroup}>
          <label>Availability Frequency</label>
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
            {/* <option value="custom">Custom</option> */}
          </select>
        </div>
        <button className={styles.saveButton} onClick={handleSubmit}>
          <Save size={20} /> Save Configurations
        </button>
      </div>
    </div>
  );
};

export default ReminderConfigModal;
