// src/components/daily-merge-upload/DailyMergeModal.tsx
import React from "react";
import { X } from "lucide-react";
import DailyMergeUpload from "./DailyMergeUpload";
import styles from "./DailyMergeModal.module.scss";

interface Props {
  onClose: () => void;
}

const DailyMergeModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Daily Routes & Dispatch Merge</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>
        <div className={styles.body}>
          <DailyMergeUpload />
        </div>
      </div>
    </div>
  );
};

export default DailyMergeModal;
