import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useHistory } from "react-router-dom";
import styles from "./styles/SchedulingPage.module.scss"; // Import SCSS module
import { HomeRouterNames } from "@modules/home/config/home-router.names";
import ManageShiftsIcon from "@assets/images/your-manage-shifts-icon.png";
import FleetManagementIcon from "@assets/images/your-fleet-icon.png";

import {
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Edit3,
  GripVertical,
  CheckCircle, // Used for confirmed
  AlertCircle, // Used for outstanding/unconfirmed
  Car, // For vehicle icon
  Download, // For download button
  FileText, // For report icon
  ThumbsUp, // For driver availability confirmation
  Bell, // Add this
  User, // Add this
  Info,
  Eye,
  Quote,
  MessageSquareMore,
  Target, // Add this
  Trash2,
  Save,
  // Van
} from "lucide-react";

// --- TYPES ---
import {
  ItemTypes,
  ShiftStatus,
  FilterMode,
  ConfirmationFilter,
  SortKey,
  SortOrder,
  ReportType,
  PreviewSortKey,
  DailyPreviewRow,
  CancellationInfo,
  Shift,
  AssignedVehicle,
  Employee,
  Vehicle,
  VehiclePayload,
  // eslint-disable-next-line
  // @ts-ignore
} from "./tabsforscheduling/types";
import {
  getWeekDates,
  getMonthDates,
  getDayDates,
  getUpcomingSundayWeekDates,
  getDateKeysInRange,
  buildDateChunksFromKeys,
  formatDate,
  downloadFile,
  formatDisplayDate,
  parseBooleanLike,
  parseDriverConfirmedStatus,
  isAvailabilityMarkedAvailable,
  isVehicleInactive,
  validateConsecutiveAvailableDays,
} from "./tabsforscheduling/utils";
import {
  ShiftCard,
  DroppableCell,
  DraggableShift,
  ShiftManagerSidebar,
} from "./tabsforscheduling/ShiftManager";
import {
  VehicleManagerSidebar,
  VehicleAssignmentModal,
} from "./tabsforscheduling/VehicleManager";
import { DailyRosteringTab } from "./tabsforscheduling/DailyRosteringTab";
import { SchedulingApi } from "@api/scheduling.api";
import { NotificationBell } from "@components/notification-bell/notification-bell";
import StickyNote from "./tabsforscheduling/StickyNote";

// --- API Base URL ---
const API_BASE_URL = process.env.REACT_APP_PHP_BASE_URL;

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcess: (
    id: number,
    type: "shift" | "availability",
    action: "accepted" | "rejected",
    note: string,
  ) => void;
  data: {
    id: number;
    type: "shift" | "availability";
    cancel_reason: string;
    shift_date: string;
    start_time?: string;
    first_name: string;
    surname: string;
    middle_name: string;
    shift_name?: string;
    availability_name?: string;
  } | null;
}

const CancellationModal: React.FC<CancellationModalProps> = ({
  isOpen,
  onClose,
  data,
  onProcess,
}) => {
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setAdminNote("");
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose}></div>
      <div className={styles.customModal}>
        <div className={styles.modalHeader}>
          <h3>Cancellation Request</h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.infoSection}>
            <div className={styles.infoRow}>
              <label>Driver:</label>
              <span>
                {data.first_name} {data.surname}
              </span>
            </div>
            <div className={styles.infoRow}>
              <label>Date & Time:</label>
              <span>
                {formatDisplayDate(data?.shift_date)} (
                {data.start_time || "N/A"})
              </span>
            </div>
            <div className={styles.infoRow}>
              <label>Cancellation Reason:</label>
              <div className={styles.reasonBox}>{data.cancel_reason}</div>
            </div>
          </div>

          <div className={styles.inputSection}>
            <label>Admin Reply / Feedback:</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Explain why this was approved or rejected..."
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button
            className={styles.btnSecondary}
            onClick={() => onProcess(data.id, data.type, "rejected", adminNote)}
          >
            Reject Request
          </button>
          <button
            className={styles.btnPrimary}
            onClick={() => onProcess(data.id, data.type, "accepted", adminNote)}
          >
            Approve & Release Shift
          </button>
        </div>
      </div>
    </>
  );
};

interface AvailabilityConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isConfirmed: boolean;
  driverName?: string;
  date?: string;
}

const AvailabilityConfirmModal: React.FC<AvailabilityConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isConfirmed,
  driverName,
  date,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose}></div>
      <div className={styles.customModal} style={{ maxWidth: "420px", width: "90%" }}>
        <div className={styles.modalHeader} style={{ padding: "10px 16px" }}>
          <h3 style={{ fontSize: "16px" }}>{isConfirmed ? "Unconfirm Availability" : "Confirm Availability"}</h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className={styles.modalBody} style={{ padding: "14px 16px" }}>
          <p style={{ margin: 0, fontSize: "13.5px", color: "#334155", lineHeight: "1.4" }}>
            {isConfirmed ? (
              <>
                Are you sure you want to unconfirm driver availability
                {driverName ? (
                  <>
                    {" "}
                    for <strong>{driverName}</strong>
                  </>
                ) : (
                  ""
                )}
                {date ? (
                  <>
                    {" "}
                    on <strong>{formatDisplayDate(date)}</strong>
                  </>
                ) : (
                  ""
                )}
                ?
              </>
            ) : (
              <>
                Are you sure you want to confirm driver availability
                {driverName ? (
                  <>
                    {" "}
                    for <strong>{driverName}</strong>
                  </>
                ) : (
                  ""
                )}
                {date ? (
                  <>
                    {" "}
                    on <strong>{formatDisplayDate(date)}</strong>
                  </>
                ) : (
                  ""
                )}
                ?
              </>
            )}
          </p>
        </div>
        <div className={styles.modalFooter} style={{ padding: "10px 16px" }}>
          <button className={styles.btnSecondary} style={{ padding: "7px 14px", fontSize: "13px" }} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.btnPrimary}
            style={
              isConfirmed
                ? { backgroundColor: "#dc3545", borderColor: "#dc3545", color: "#ffffff", padding: "7px 14px", fontSize: "13px" }
                : { backgroundColor: "#22c55e", borderColor: "#22c55e", color: "#ffffff", padding: "7px 14px", fontSize: "13px" }
            }
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {isConfirmed ? "Yes, Unconfirm" : "Yes, Confirm"}
          </button>
        </div>
      </div>
    </>
  );
};

interface AddDriverAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: Employee[];
  initialDriverId?: number | string;
  initialDate?: string;
  initialShift?: any;
  onSave: (payload: {
    driver_id: number | string;
    availability_status: string;
    availability_name: string;
    availability_start_time: string;
    availability_end_time: string;
    availability_date: string;
  }) => Promise<void>;
  onDelete?: (availabilityId: number | string) => Promise<void>;
}

const AddDriverAvailabilityModal: React.FC<AddDriverAvailabilityModalProps> = ({
  isOpen,
  onClose,
  drivers,
  initialDriverId,
  initialDate,
  initialShift,
  onSave,
  onDelete,
}) => {
  const [driverId, setDriverId] = useState<string | number>("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [dateInput, setDateInput] = useState("");
  const [calendarViewMonth, setCalendarViewMonth] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("21:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      setIsSubmitting(false);
      const dId = initialDriverId || (drivers.length > 0 ? drivers[0].id : "");
      setDriverId(dId);

      const initD = initialDate || new Date().toISOString().split("T")[0];
      setSelectedDates([initD]);
      setDateInput("");
      setCalendarViewMonth(new Date(initD));

      if (initialShift) {
        setStartTime(
          initialShift.start_time ? initialShift.start_time.slice(0, 5) : "09:00",
        );
        setEndTime(
          initialShift.end_time ? initialShift.end_time.slice(0, 5) : "21:00",
        );
      } else {
        setStartTime("09:00");
        setEndTime("21:00");
      }
    }
  }, [isOpen, initialDriverId, initialDate, initialShift, drivers]);

  if (!isOpen) return null;

  const getExistingAvailableDates = (dId: string | number) => {
    const emp = drivers.find((d) => String(d.id) === String(dId));
    const dates: string[] = [];
    if (emp && emp.schedule) {
      Object.entries(emp.schedule).forEach(([dateKey, dayData]) => {
        if (isAvailabilityMarkedAvailable(dayData?.availability)) {
          dates.push(dateKey);
        }
      });
    }
    return dates;
  };

  const handleAddDate = (dStr: string) => {
    if (!dStr) return;
    if (selectedDates.includes(dStr)) {
      setDateInput("");
      return;
    }
    const updatedDates = [...selectedDates, dStr].sort();

    const existing = getExistingAvailableDates(driverId);
    const combined = Array.from(new Set([...existing, ...updatedDates]));
    const validation = validateConsecutiveAvailableDays(combined, 6);

    if (!validation.isValid) {
      setErrorMsg(
        validation.message ||
        "Driver cannot be available for more than 6 consecutive days. At least 1 day break is required.",
      );
      setDateInput("");
      return;
    }

    setErrorMsg("");
    setSelectedDates(updatedDates);
    setDateInput("");
  };

  const handleRemoveDate = (dStr: string) => {
    if (selectedDates.length > 1) {
      const updatedDates = selectedDates.filter((item) => item !== dStr);
      setSelectedDates(updatedDates);

      const existing = getExistingAvailableDates(driverId);
      const combined = Array.from(new Set([...existing, ...updatedDates]));
      const validation = validateConsecutiveAvailableDays(combined, 6);

      if (validation.isValid) {
        setErrorMsg("");
      }
    }
  };

  const handleToggleDate = (dStr: string) => {
    if (!dStr) return;
    if (selectedDates.includes(dStr)) {
      if (selectedDates.length > 1) {
        handleRemoveDate(dStr);
      } else {
        setErrorMsg("At least one date must be selected.");
      }
    } else {
      handleAddDate(dStr);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverId) {
      setErrorMsg("Driver not identified.");
      return;
    }
    if (selectedDates.length === 0) {
      setErrorMsg("Please select at least one date.");
      return;
    }
    if (!startTime || !endTime) {
      setErrorMsg("Please select both start and end times.");
      return;
    }

    const existing = getExistingAvailableDates(driverId);
    const combined = Array.from(new Set([...existing, ...selectedDates]));
    const validation = validateConsecutiveAvailableDays(combined, 6);

    if (!validation.isValid) {
      setErrorMsg(
        validation.message ||
        "Driver cannot be available for more than 6 consecutive days. At least 1 day break is required.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");
      const formattedStartTime =
        startTime.length === 5 ? `${startTime}:00` : startTime;
      const formattedEndTime =
        endTime.length === 5 ? `${endTime}:00` : endTime;

      const payload = {
        driver_id: driverId,
        availability_status: "Available",
        availability_name: "Available",
        availability_start_time: formattedStartTime,
        availability_end_time: formattedEndTime,
        availability_date: selectedDates.join(","),
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save availability.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calendar Grid Calculations
  const year = calendarViewMonth.getFullYear();
  const month = calendarViewMonth.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const existingAvailableDates = getExistingAvailableDates(driverId);



  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose}></div>
      <div className={styles.customModal} style={{ maxWidth: "440px", maxHeight: "85vh", overflowY: "auto" }}>
        <div className={styles.modalHeader} style={{ padding: "10px 16px" }}>
          <h3 style={{ fontSize: "16px" }}>Add Availability</h3>
          <button onClick={onClose} disabled={isSubmitting}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody} style={{ padding: "12px 16px" }}>
            {errorMsg && (
              <div
                style={{
                  color: "#ef4444",
                  marginBottom: "8px",
                  fontSize: "13px",
                  fontWeight: 500,
                  backgroundColor: "#fef2f2",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "1px solid #fca5a5",
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* Interactive Calendar for Multiple Selection */}
            <div className={styles.inputSection} style={{ marginBottom: "8px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              >
                Select Date(s) (Click dates on calendar)
              </label>

              {/* Month Calendar Component */}
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "8px",
                  backgroundColor: "#ffffff",
                  marginBottom: "6px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}
              >
                {/* Calendar Header Navigation */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setCalendarViewMonth(
                        new Date(year, month - 1, 1),
                      )
                    }
                    style={{
                      background: "#f1f5f9",
                      border: "none",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "13.5px",
                      color: "#1e293b",
                    }}
                  >
                    {calendarViewMonth.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCalendarViewMonth(
                        new Date(year, month + 1, 1),
                      )
                    }
                    style={{
                      background: "#f1f5f9",
                      border: "none",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Day Headers */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "11px",
                    color: "#64748b",
                    marginBottom: "4px",
                  }}
                >
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day}>{day}</div>
                  ))}
                </div>

                {/* Days Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "3px",
                  }}
                >
                  {/* Empty cells before month start */}
                  {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                    <div key={`empty-${idx}`} />
                  ))}

                  {/* Days of Month */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const dStr = `${year}-${String(month + 1).padStart(
                      2,
                      "0",
                    )}-${String(dayNum).padStart(2, "0")}`;
                    const isSelected = selectedDates.includes(dStr);
                    const isExisting = existingAvailableDates.includes(dStr);

                    return (
                      <button
                        key={dStr}
                        type="button"
                        onClick={() => handleToggleDate(dStr)}
                        style={{
                          height: "28px",
                          border: isSelected
                            ? "none"
                            : isExisting
                              ? "1px dashed #3b82f6"
                              : "1px solid #f1f5f9",
                          borderRadius: "4px",
                          backgroundColor: isSelected
                            ? "#3b82f6"
                            : isExisting
                              ? "#eff6ff"
                              : "#ffffff",
                          color: isSelected ? "#ffffff" : "#1e293b",
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: "12px",
                          cursor: "pointer",
                          position: "relative",
                          transition: "all 0.15s ease",
                        }}
                        title={
                          isSelected
                            ? `${dStr} (Selected)`
                            : isExisting
                              ? `${dStr} (Already available)`
                              : dStr
                        }
                      >
                        {dayNum}
                        {isExisting && !isSelected && (
                          <span
                            style={{
                              position: "absolute",
                              bottom: "2px",
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: "3px",
                              height: "3px",
                              borderRadius: "50%",
                              backgroundColor: "#3b82f6",
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Input Fallback & Chips */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                <input
                  type="date"
                  className={styles.modalInput}
                  style={{ padding: "4px 8px", fontSize: "12px", height: "30px" }}
                  value={dateInput}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddDate(e.target.value);
                      setCalendarViewMonth(new Date(e.target.value));
                    }
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                  minHeight: "28px",
                  padding: "4px 6px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  alignItems: "center",
                }}
              >
                {selectedDates.map((d) => (
                  <span
                    key={d}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#3b82f6",
                      color: "#ffffff",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    {d}
                    {selectedDates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDate(d)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ffffff",
                          cursor: "pointer",
                          padding: 0,
                          fontSize: "12px",
                          lineHeight: 1,
                          fontWeight: 700,
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginTop: "4px",
              }}
            >
              <div className={styles.inputSection} style={{ marginTop: 0 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "2px",
                    fontWeight: 600,
                    fontSize: "13px",
                  }}
                >
                  Start Time
                </label>
                <input
                  type="time"
                  className={styles.modalInput}
                  style={{ padding: "4px 8px", fontSize: "13px", height: "32px" }}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputSection} style={{ marginTop: 0 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "2px",
                    fontWeight: 600,
                    fontSize: "13px",
                  }}
                >
                  End Time
                </label>
                <input
                  type="time"
                  className={styles.modalInput}
                  style={{ padding: "4px 8px", fontSize: "13px", height: "32px" }}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.modalFooter} style={{ padding: "10px 16px" }}>
            <button
              type="button"
              className={styles.btnSecondary}
              style={{ padding: "7px 14px", fontSize: "13px" }}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              style={{ padding: "7px 14px", fontSize: "13px" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Availability"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

// --- COMPONENTS ---

/**
 * NEW: Modal for downloading reports.
 */
interface DownloadReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (reportType: ReportType) => void;
}

const DownloadReportsModal: React.FC<DownloadReportsModalProps> = ({
  isOpen,
  onClose,
  onDownload,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className={styles.sidebarOverlay} onClick={onClose}></div>
      <div className={styles.downloadModal}>
        <div className={styles.downloadModalHeader}>
          <h2>Download Reports</h2>
          <button onClick={onClose} className={styles.closeModalButton}>
            <X />
          </button>
        </div>
        <div className={styles.downloadModalBody}>
          <button
            onClick={() => onDownload("daySummary")}
            className={styles.reportButton}
          >
            <FileText /> Day Summary
          </button>
          <button
            onClick={() => onDownload("weekSummary")}
            className={styles.reportButton}
          >
            <FileText /> Week Summary
          </button>
          <button
            onClick={() => onDownload("monthSummary")}
            className={styles.reportButton}
          >
            <FileText /> Month Summary
          </button>
          <button
            onClick={() => onDownload("assignedVehicleDaySummary")}
            className={styles.reportButton}
          >
            <FileText /> Assigned Vehicle Day Summary
          </button>
          <button
            onClick={() => onDownload("assignedVehicleWeekSummary")}
            className={styles.reportButton}
          >
            <FileText /> Assigned Vehicle Week Summary
          </button>
          <button
            onClick={() => onDownload("assignedVehicleMonthSummary")}
            className={styles.reportButton}
          >
            <FileText /> Assigned Vehicle Month Summary
          </button>
          <button
            onClick={() => onDownload("workingDriversRoster")}
            className={styles.reportButton}
          >
            <FileText /> Working Drivers Roster
          </button>
        </div>
      </div>
    </>
  );
};

interface DailyExcelPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateLabel: string;
  rows: DailyPreviewRow[];
  isLoading: boolean;
  errorMessage: string | null;
  sortKey: PreviewSortKey;
  sortOrder: SortOrder;
  onSortKeyChange: (key: PreviewSortKey) => void;
  onSortOrderChange: (order: SortOrder) => void;
  targetDate?: string;
  onDateChange?: (dateStr: string) => void;
   // existing props...
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
}

const DailyExcelPreviewModal: React.FC<DailyExcelPreviewModalProps> = ({
  isOpen,
  onClose,
  dateLabel,
  rows,
  isLoading,
  errorMessage,
  sortKey,
  sortOrder,
  onSortKeyChange,
  onSortOrderChange,
  targetDate,
  onDateChange,
  notes,
  setNotes,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSaveStatus(null);
    }
  }, [isOpen]);

  const handleSaveRoster = async () => {
    if (isSaving) return;
    if (!rows || rows.length === 0) {
      setSaveStatus({
        type: "error",
        message: "Cannot save roster when driver data is empty.",
      });
      return;
    }
    setIsSaving(true);
    setSaveStatus(null);
    const effectiveDate =
      targetDate || formatDate(new Date(), "key");
    const baseUrl = API_BASE_URL || "https://api-stage-hrs.srul.co.uk/api";
    const saveUrl = `${baseUrl}/save_roster_data/${effectiveDate}`;

    try {
		const response = await fetch(
		  saveUrl,
		  {
			method: "POST",
			headers: {
			  "Content-Type": "application/json",
			},
			 body: JSON.stringify({
          date: effectiveDate,
          shift_date: effectiveDate,
          target_date: effectiveDate,
		  roster_notes: notes,
        }),
		  },
		);
		const data = await response.json();
	
      if (
        response.ok ||
        data?.status === 1 ||
        data?.status === "success" ||
        data?.success
      ) {
        let message = data?.message || "Roster saved successfully!";

        const effectiveDateToUse = effectiveDate || targetDate;
        if (effectiveDateToUse && onDateChange) {
          const [year, month, day] = effectiveDateToUse.split("-").map(Number);
          const current = new Date(year, month - 1, day);
          current.setDate(current.getDate() + 1);
          const nextDateStr = formatDate(current, "key");
          try {
            localStorage.setItem("lastSavedRosterNextDate", nextDateStr);
          } catch (e) {
            console.error("Failed to save next roster date to localStorage:", e);
          }
          message =
            data?.message ||
            `Roster for ${effectiveDateToUse} saved successfully! Switched to next date (${nextDateStr}).`;
          onDateChange(nextDateStr);
        }

        setSaveStatus({
          type: "success",
          message,
        });
      } else {
        setSaveStatus({
          type: "error",
          message: data?.message || "Failed to save roster data.",
        });
      }
    } catch (err: any) {
      console.error("Save roster error:", err);
      setSaveStatus({
        type: "error",
        message: err?.message || "An error occurred while saving roster data.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toMinutes = (value: string) => {
    if (!value || value === "-") return Number.POSITIVE_INFINITY;
    const [hours, minutes] = value.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return Number.POSITIVE_INFINITY;
    }
    return hours * 60 + minutes;
  };

  const getWaveNumber = (value: string) => {
    if (!value || value === "-") return Number.POSITIVE_INFINITY;
    const match = value.match(/\d+/);
    if (!match) return Number.POSITIVE_INFINITY;
    return Number(match[0]);
  };

  const sortedRows = useMemo(() => {
    const factor = sortOrder === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      let diff = 0;
      if (sortKey === "arrival_time") {
        diff = toMinutes(a.arrivalTime) - toMinutes(b.arrivalTime);
      } else if (sortKey === "wave") {
        diff = getWaveNumber(a.wave) - getWaveNumber(b.wave);
        if (diff === 0) {
          diff = toMinutes(a.arrivalTime) - toMinutes(b.arrivalTime);
        }
      } else if (sortKey === "van_registration") {
        diff = a.vanRegistration.localeCompare(b.vanRegistration);
      }

      if (diff === 0) {
        diff = a.name.localeCompare(b.name);
      }
      return diff * factor;
    });
  }, [rows, sortKey, sortOrder]);

  const groupedRows = useMemo(() => {
    const map = new Map<string, DailyPreviewRow[]>();
    sortedRows.forEach((row) => {
      const key = `${row.wave}__${row.arrivalTime}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(row);
    });

    return Array.from(map.entries()).map(([key, value], index) => ({
      key,
      rows: value,
      bandColor:
        index % 4 === 0
          ? "#ffe4f1"
          : index % 4 === 1
            ? "#dcf8ff"
            : index % 4 === 2
              ? "#fff2d6"
              : "#e9fbe5",
    }));
  }, [sortedRows]);

  const handleDownloadPreviewExcel = () => {
    if (!sortedRows || sortedRows.length === 0) return;
    const dateStr = targetDate || dateLabel || "preview";
    const filename = `Daily_Excel_Preview_${dateStr}.csv`;

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      "Driver Name",
      "Wave",
      "Arrival Time",
      "Van Registration",
      "Loading Pad",
      "Route Code",
      "Staging Location",
    ];

    let csvContent = headers.map(escapeCsv).join(",") + "\n";

    sortedRows.forEach((row) => {
      const rowData = [
        row.name,
        row.wave || "-",
        row.arrivalTime || "-",
        row.vanRegistration || "-",
        row.loadingPad || "-",
        row.routeCode || "-",
        row.stagingLocation || "-",
      ];
      csvContent += rowData.map(escapeCsv).join(",") + "\n";
    });
	//setNotes('sdsdsdas');
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.sidebarOverlay} onClick={onClose}></div>
      <div className={styles.dailyPreviewModal}>
        <div className={styles.dailyPreviewHeader}>
          <div>
            <h2>Daily Excel Preview</h2>
            <p>{dateLabel}</p>
          </div>
		 
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
			<StickyNote
			  notes={notes}
			  setNotes={setNotes}
			/>
            <button
              onClick={handleSaveRoster}
              disabled={isSaving || !rows || rows.length === 0}
              className={`${styles.manageShiftsButton} ${styles.saveRosterButton}`}
              title={!rows || rows.length === 0 ? "Cannot save preview when data is empty" : "Save Roster"}
              style={!rows || rows.length === 0 ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
            >
              <Save size={20} />
            </button>
            <button
              onClick={handleDownloadPreviewExcel}
              disabled={!rows || rows.length === 0}
              className={`${styles.manageShiftsButton} ${styles.downloadButton}`}
              title={!rows || rows.length === 0 ? "No data to download" : "Download Excel Preview"}
              style={!rows || rows.length === 0 ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
            >
              <Download />
            </button>
            <button onClick={onClose} className={styles.closeModalButton}>
              <X />
            </button>
          </div>
        </div>
        <div className={styles.dailyPreviewControls}>
          <label htmlFor="dailyPreviewDate">Date</label>
          <input
            type="date"
            id="dailyPreviewDate"
            value={targetDate || ""}
            onChange={(e) => {
              if (onDateChange) {
                onDateChange(e.target.value);
              }
            }}
            className={styles.sortSelectPreview}
          />
          <label htmlFor="dailyPreviewSortKey">Sort By</label>
          <select
            id="dailyPreviewSortKey"
            value={sortKey}
            onChange={(e) => onSortKeyChange(e.target.value as PreviewSortKey)}
            className={styles.sortSelectPreview}
          >
            <option value="arrival_time">Arrival Time</option>
            <option value="wave">Wave</option>
            <option value="van_registration">Van Registration</option>
          </select>
          <label htmlFor="dailyPreviewSortOrder">Order</label>
          <select
            id="dailyPreviewSortOrder"
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
            className={styles.sortSelectPreview}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div className={styles.dailyPreviewSummary}>
          <span className={styles.dailyPreviewBadge}>
            Total Drivers: {rows.length}
          </span>
          <span className={styles.dailyPreviewBadge}>
            Groups: {groupedRows.length}
          </span>
        </div>
        <div className={styles.dailyPreviewBody}>
          {saveStatus ? (
            <p
              className={styles.dailyPreviewNotice}
              style={{
                backgroundColor: saveStatus.type === "success" ? "#dcfce7" : "#fee2e2",
                color: saveStatus.type === "success" ? "#166534" : "#991b1b",
                border: `1px solid ${saveStatus.type === "success" ? "#86efac" : "#fca5a5"}`,
              }}
            >
              {saveStatus.message}
            </p>
          ) : null}
          {isLoading && rows.length === 0 ? (
            <p className={styles.unconfirmedEmpty}>Loading preview...</p>
          ) : errorMessage && rows.length === 0 ? (
            <p className={styles.unconfirmedEmpty}>{errorMessage}</p>
          ) : groupedRows.length === 0 ? (
            <p className={styles.unconfirmedEmpty}>
              No assigned driver allocations found for this day.
            </p>
          ) : (
            <>
              {errorMessage ? (
                <p className={styles.dailyPreviewNotice}>{errorMessage}</p>
              ) : null}
              {groupedRows.map((group) => (
                <div
                  key={group.key}
                  className={styles.dailyPreviewGroup}
                  style={{ backgroundColor: group.bandColor }}
                >
                  <div className={styles.dailyPreviewGroupTitle}>
                    {group.rows[0]?.wave || "-"} |{" "}
                    {group.rows[0]?.arrivalTime || "-"}
                  </div>
                  <table className={styles.dailyPreviewTable}>
                    <thead>
                      <tr>
                        <th>NAME</th>
                        <th>ARRIVAL TIME</th>
                        <th>WAVE</th>
                        <th>VAN REGISTRATION</th>
                        <th>LOADING PAD</th>
                        <th>ROUTE CODE</th>
                        <th>STAGING LOCATION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.rows.map((row, index) => (
                        <tr key={`${group.key}-${row.name}-${index}`}>
                          <td>{row.name}</td>
                          <td>{row.arrivalTime}</td>
                          <td>{row.wave}</td>
                          <td>{row.vanRegistration}</td>
                          <td>{row.loadingPad}</td>
                          <td>{row.routeCode}</td>
                          <td>{row.stagingLocation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};

interface ServiceTypeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (serviceId: number | string) => void;
  serviceTypes: any[];
  employees: Employee[];
  targetDate: string;
}

const ServiceTypeSelectModal: React.FC<ServiceTypeSelectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  serviceTypes,
  employees,
  targetDate,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<number | string>("");

  useEffect(() => {
    if (isOpen && serviceTypes.length > 0) {
      setSelectedServiceId(serviceTypes[0].service_id || serviceTypes[0].id || "");
    }
  }, [isOpen, serviceTypes]);

  if (!isOpen) return null;

  const handleConfirmClick = () => {
    if (selectedServiceId !== "") {
      onConfirm(selectedServiceId);
    }
  };

  return (
    <>
      <div className={styles.sidebarOverlay} onClick={onClose}></div>
      <div className={styles.vehicleModal}>
        <div className={styles.vehicleModalHeader}>
          <h2>Select Service Type</h2>
          <button onClick={onClose} className={styles.closeModalButton}>
            <X />
          </button>
        </div>
        <div className={styles.vehicleModalBody}>
          <div className={styles.formGroup}>
            <label htmlFor="serviceTypeSelect">Choose Service Type:</label>
            <select
              id="serviceTypeSelect"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className={styles.vehicleSelect}
            >
              {serviceTypes.map((st) => {
                const serviceId = st.service_id || st.id;
                // Calculate allocated count for this service type on targetDate
                const allocatedCount = employees.filter((emp) => {
                  const assigned = emp.schedule[targetDate]?.assigned;
                  return assigned && String(assigned.service_id) === String(serviceId);
                }).length;

                return (
                  <option key={serviceId} value={serviceId}>
                    {`${st.name || st.abbrev} (Required: ${st.quota}, Allocated: ${allocatedCount})`}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <div className={styles.vehicleModalFooter}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button
            onClick={handleConfirmClick}
            disabled={!selectedServiceId}
            className={styles.assignButton}
          >
            Confirm
          </button>
        </div>
      </div>
    </>
  );
};

/**
 * Header component for the scheduling page, including view switching and date navigation.
 */
interface HeaderProps {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onManageShifts: () => void;
  onManageVehicles: () => void;
  onOpenPreviewModal: () => void;
  onOpenUnconfirmedInfoPanel: () => void;
  onOpenDownloadModal: () => void; // NEW: For opening download modal
  viewMode: "day" | "week" | "month";
  onViewModeChange: (mode: "day" | "week" | "month") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterMode: FilterMode;
  onFilterChange: (mode: FilterMode) => void;
  confirmationFilter: ConfirmationFilter;
  onConfirmationFilterChange: (filter: ConfirmationFilter) => void;
  sortKey: SortKey;
  onSortKeyChange: (key: SortKey) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
  pendingCount: number;
  onOpenInbox: () => void;
  onOpenCancelPanel: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentDate,
  onPrev,
  onNext,
  onManageShifts,
  onManageVehicles,
  onOpenPreviewModal,
  onOpenUnconfirmedInfoPanel,
  onOpenDownloadModal,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  filterMode,
  onFilterChange,
  confirmationFilter,
  onConfirmationFilterChange,
  sortKey,
  onSortKeyChange,
  sortOrder,
  onSortOrderChange,
  pendingCount, // Add this
  onOpenInbox, // Add this
  onOpenCancelPanel, // Add this
}) => {
  const getLabelForView = (date: Date, mode: string) => {
    if (mode === "day") {
      return formatDate(date, "full");
    } else if (mode === "week") {
      const weekDates = getWeekDates(date);
      return `${formatDate(weekDates[0], "long")} - ${formatDate(
        weekDates[weekDates.length - 1],
        "long",
      )}`;
    } else if (mode === "month") {
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
    return "";
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <h1>Scheduling</h1>
        <button
          onClick={onOpenCancelPanel}
          className={`${styles.manageShiftsButton} ${styles.cancellationButton
            } ${pendingCount > 0 ? styles.hasPending : ""}`}
        >
          {/* <AlertCircle size={18} /> */}
          {pendingCount > 0 && (
            <span className={styles.Cancel_Content_box}>{pendingCount}</span>
          )}
          <span className={styles.warningIcon}>⚠️</span>
        </button>
        <div className={styles.viewSwitcher}>
          <button
            onClick={() => onViewModeChange("day")}
            className={viewMode === "day" ? styles.active : ""}
          >
            Day
          </button>
          <button
            onClick={() => onViewModeChange("week")}
            className={viewMode === "week" ? styles.active : ""}
          >
            Week
          </button>
          <button
            onClick={() => onViewModeChange("month")}
            className={viewMode === "month" ? styles.active : ""}
          >
            Monthly
          </button>
        </div>
        <div className={styles.headerControls}>
          <div className={styles.weekNavigator}>
            <ChevronLeft onClick={onPrev} className={styles.navIcon} />
            <Calendar className={styles.calendarIcon} />
            <span>{getLabelForView(currentDate, viewMode)}</span>
            <ChevronRight onClick={onNext} className={styles.navIcon} />
          </div>
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search workforce..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>
      <div className={styles.headerBottom}>
        {/* Filter Options */}
        <div className={styles.filterOptions}>
          <button
            onClick={() => onFilterChange("all")}
            className={filterMode === "all" ? styles.activeFilter : ""}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange("availability")}
            className={filterMode === "availability" ? styles.activeFilter : ""}
          >
            Driver Availability
          </button>
          <button
            onClick={() => onFilterChange("assigned")}
            className={filterMode === "assigned" ? styles.activeFilter : ""}
          >
            Shift Assigned
          </button>
          <button
            onClick={() => onFilterChange("vehicle")}
            className={filterMode === "vehicle" ? styles.activeFilter : ""}
          >
            Assigned Vehicle
          </button>
        </div>

        {/* NEW: Confirmation Filter (Dropdown) */}
        <div className={styles.confirmationFilter}>
          <label htmlFor="confirmationFilterSelect">Confirmation:</label>
          <select
            id="confirmationFilterSelect"
            value={confirmationFilter}
            onChange={(e) =>
              onConfirmationFilterChange(e.target.value as ConfirmationFilter)
            }
            className={styles.sortSelect}
          >
            <option value="all">All Shifts</option>
            <option value="confirmed_manager">Manager Confirmed</option>
            <option value="outstanding_manager">Manager Outstanding</option>
            <option value="confirmed_driver">Driver Confirmed</option>
            <option value="unconfirmed_driver">Driver Unconfirmed</option>
            <option value="availability_submitted">
              Availability Submitted
            </option>
            <option value="hasVehicle">Vehicle Assigned</option>
            <option value="cancellation_requests">Cancellation Requests</option>
          </select>
        </div>

        {/* NEW: Sorting Options */}
        <div className={styles.sortOptions}>
          <label htmlFor="sortKey">Sort By:</label>
          <select
            id="sortKey"
            value={sortKey}
            onChange={(e) => onSortKeyChange(e.target.value as SortKey)}
            className={styles.sortSelect}
          >
            <option value="name">Name</option>
            <option value="earliestShift">Earliest Shift</option>
            <option value="latestShift">Latest Shift</option>
          </select>

          <label htmlFor="sortOrder">Order:</label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
            className={styles.sortSelect}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <button
          onClick={onOpenDownloadModal}
          className={`${styles.manageShiftsButton} ${styles.downloadButton}`}
          title="Download Reports"
        >
          <Download />
        </button>
      </div>
    </header>
  );
};

/**
 * The main scheduling grid displaying employees and their shifts.
 */
interface SchedulingGridProps {
  currentDate: Date;
  employees: Employee[];
  allEmployees: Employee[];
  onDropShift: (
    employeeId: number,
    date: string,
    shift: Shift,
    sourceEmployeeId?: number,
    sourceDate?: string,
  ) => void;
  viewMode: "day" | "week" | "month";
  onConfirmShift: (
    employeeId: number,
    date: string,
    assignedShiftId: number,
  ) => void;
  onOpenVehicleModal: (
    employeeId: number,
    date: string,
    currentVehicle: AssignedVehicle | null,
    allocatedVehiclesForDate: AssignedVehicle[],
  ) => void; // Updated type
  onRemoveAssignedVehicle: (
    employeeId: number,
    date: string,
    assignedVehicleId: number,
  ) => void;
  onRemoveAssignedShift: (
    employeeId: number,
    date: string,
    assignedShiftId: number,
  ) => void;
  filterMode: FilterMode;
  dailyShiftCounts: {
    [dateKey: string]: {
      confirmed: number;
      outstanding: number;
      driverConfirmed: number;
      driverUnconfirmed: number;
      availabilitySubmitted: number;
      nonResponders: number;
      cancellationRequests: number;
    };
  }; // NEW: Shift counts for each displayed day
  onDriverConfirmAvailability: (
    employeeId: number,
    date: string,
    shiftId: number,
  ) => void; // NEW
  onDaySummaryIconClick: (filter: ConfirmationFilter, date: Date) => void; // To make icons clickable and navigate to the day
  availableVehicles: Vehicle[]; // Pass available vehicles to grid to get names
  dailyTargets: Record<string, string>;
  dailyTargetIds: Record<string, number>;
  onDailyTargetChange: (dateKey: string, value: string) => void;
  onDailyTargetSave: (dateKey: string, value: string) => void;
  onOpenAvailabilityModal?: (
    driverId?: number | string,
    date?: string,
    shift?: any,
  ) => void;
  onRemoveAvailability?: (
    employeeId: number,
    date: string,
    availabilityId: number,
  ) => void;
}

const SchedulingGrid: React.FC<SchedulingGridProps> = ({
  currentDate,
  employees,
  allEmployees,
  onDropShift,
  viewMode,
  onConfirmShift,
  onOpenVehicleModal,
  onRemoveAssignedVehicle,
  onRemoveAssignedShift,
  filterMode,
  dailyShiftCounts,
  onDriverConfirmAvailability,
  onDaySummaryIconClick, // Destructure the new prop
  availableVehicles,
  dailyTargets,
  dailyTargetIds,
  onDailyTargetChange,
  onDailyTargetSave,
  onOpenAvailabilityModal,
  onRemoveAvailability,
}) => {
  const [expandedTargetDates, setExpandedTargetDates] = useState<Set<string>>(new Set());
  const getDatesToDisplay = useCallback(() => {
    if (viewMode === "day") return getDayDates(currentDate);
    if (viewMode === "week") return getWeekDates(currentDate);
    if (viewMode === "month") return getMonthDates(currentDate);
    return [];
  }, [currentDate, viewMode]);

  const datesToDisplay = getDatesToDisplay();
  const todayKey = formatDate(new Date(), "key");

  return (
    <div className={styles.gridContainer}>
      <table className={styles.schedulingGrid}>
        <thead>
          <tr>
            <th className={styles.employeeHeader}>
              <div className={styles.employeeHeaderContent}>
                View By Workforce
              </div>
            </th>
            {datesToDisplay.map((date) => {
              const dateKey = formatDate(date, "key");
              const isCurrentDay = dateKey === todayKey;
              const counts = dailyShiftCounts[dateKey] || {
                confirmed: 0,
                outstanding: 0,
                driverConfirmed: 0,
                driverUnconfirmed: 0,
                availabilitySubmitted: 0,
                nonResponders: 0,
                cancellationRequests: 0,
              };
              return (
                <th
                  key={date.toString()}
                  className={`${styles.dateHeader} ${isCurrentDay ? styles.currentDayHighlight : ""
                    }`}
                >
                  {/* Wrap date content in a div for flex centering */}
                  <div className={styles.dateHeaderContent}>
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                      }}
                    >
                      {counts.cancellationRequests > 0 && (
                        <span
                          title="Cancellation Requests"
                          onClick={() =>
                            onDaySummaryIconClick("cancellation_requests", date)
                          }
                          style={{
                            position: "absolute",
                            left: "0",
                            cursor: "pointer",
                            color: "#ffcc00",
                            display: "flex",
                            alignItems: "center",
                            fontSize: "18px",
                            height: "20px",
                          }}
                        >
                          ⚠️
                        </span>
                      )}
                      <span className={styles.dateNumber}>
                        {formatDate(date, "day-date")}
                      </span>
                    </div>
                    <div className={styles.availabilityQuickActions}>
                      {(() => {
                        const targetStr = dailyTargets[dateKey];
                        const targetNum = parseInt(targetStr, 10);
                        const hasTarget = !isNaN(targetNum) && targetStr?.trim() !== "";

                        let bubbleClass = styles.availabilityCountBubble;
                        if (hasTarget) {
                          if (counts.availabilitySubmitted >= targetNum) {
                            bubbleClass += ` ${styles.targetMet}`;
                          } else {
                            bubbleClass += ` ${styles.targetMissed}`;
                          }
                        }

                        return (
                          <div className={styles.bubbleWrapper}>
                            <button
                              className={bubbleClass}
                              title="Availability Submitted"
                              onClick={() =>
                                onDaySummaryIconClick("availability_submitted", date)
                              }
                            >
                              {counts.availabilitySubmitted}
                            </button>
                            <div
                              className={`${styles.dailyTargetPill} ${expandedTargetDates.has(dateKey) ? styles.dailyTargetPillExpanded : ""}`}
                              title={expandedTargetDates.has(dateKey) ? undefined : `Target${hasTarget ? ": " + targetStr : " (click to set)"}`}
                            >
                              <button
                                className={styles.targetIconBtn}
                                onClick={() =>
                                  setExpandedTargetDates((prev) => {
                                    const next = new Set(prev);
                                    next.add(dateKey);
                                    setTimeout(() => {
                                      const el = document.getElementById(`target-input-${dateKey}`);
                                      if (el) (el as HTMLInputElement).focus();
                                    }, 40);
                                    return next;
                                  })
                                }
                                aria-label="Set daily target"
                              >
                                <img src="/1 copy.png" alt="Target" className={styles.targetEmoji} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                              </button>
                              {expandedTargetDates.has(dateKey) && (
                                <input
                                  id={`target-input-${dateKey}`}
                                  type="number"
                                  min={0}
                                  step={1}
                                  value={targetStr || ""}
                                  onChange={(e) => {
                                    const intVal = e.target.value.replace(/[^0-9]/g, '');
                                    onDailyTargetChange(dateKey, intVal);
                                  }}
                                  onBlur={() => {
                                    setExpandedTargetDates((prev) => {
                                      const next = new Set(prev);
                                      next.delete(dateKey);
                                      return next;
                                    });
                                    onDailyTargetSave(dateKey, targetStr || "");
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === "Escape") {
                                      (e.target as HTMLInputElement).blur();
                                    }
                                  }}
                                  placeholder="0"
                                />
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    {/* Bigger date */}
                    <div className={styles.dailySummaryIcons}>
                      <span
                        title="Driver Unconfirmed"
                        onClick={() =>
                          onDaySummaryIconClick("unconfirmed_driver", date)
                        }
                      >
                        {counts.driverUnconfirmed}❓
                      </span>
                      <span
                        title="Driver Confirmed"
                        onClick={() =>
                          onDaySummaryIconClick("confirmed_driver", date)
                        }
                      >
                        👍 {counts.driverConfirmed}
                      </span>
                      <span className={styles.separator}></span>{" "}
                      {/* Separator line */}
                      <span
                        title="Manager Outstanding"
                        onClick={() =>
                          onDaySummaryIconClick("outstanding_manager", date)
                        }
                      >
                        {counts.outstanding}❗
                      </span>
                      <span
                        title="Manager Confirmed"
                        onClick={() =>
                          onDaySummaryIconClick("confirmed_manager", date)
                        }
                      >
                        ✅ {counts.confirmed}
                      </span>
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {employees.map((employee: Employee) => (
            <tr key={employee.id} className={styles.employeeRow}>
              <td className={styles.employeeCell}>
                <div className={styles.employeeContentWrapper}>
                  <img
                    src={
                      employee.avatar_id ||
                      "https://placehold.co/40x40/cccccc/ffffff?text=U"
                    }
                    alt={employee.first_name}
                    className={styles.employeeAvatar}
                  />
                  <span>{employee.first_name}</span>
                </div>
              </td>
              {datesToDisplay.map((date) => {
                const dateKey = formatDate(date, "key");
                const daySchedule = employee.schedule[dateKey] || {};

                // Get all vehicles allocated for this specific date across all employees
                const allocatedVehiclesForThisDate = allEmployees.flatMap(
                  (emp) => {
                    const scheduleForDate = emp.schedule[dateKey];
                    return scheduleForDate?.assignedVehicle
                      ? [scheduleForDate.assignedVehicle]
                      : [];
                  },
                );

                return (
                  <DroppableCell
                    key={dateKey}
                    employeeId={employee.id}
                    date={dateKey}
                    onDropShift={onDropShift}
                  >
                    {/* Driver Availability Section */}
                    {(filterMode === "all" ||
                      filterMode === "availability") && (
                        <div
                          className={styles.availabilityBox}
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            onOpenAvailabilityModal &&
                            onOpenAvailabilityModal(
                              employee.id,
                              dateKey,
                              daySchedule.availability,
                            )
                          }
                          title="Click to add/edit availability"
                        >
                          {daySchedule.availability ? (
                            <ShiftCard
                              shift={daySchedule.availability}
                              dateKey={dateKey}
                              onConfirmShift={(empId, dt, assignedShiftId) =>
                                onConfirmShift(employee.id, dt, assignedShiftId)
                              }
                              onRemoveShift={() => {
                                /* No remove for availability */
                              }}
                              onRemoveAvailability={(empId, dt, availId) => {
                                if (onRemoveAvailability) {
                                  onRemoveAvailability(employee.id, dt, availId);
                                }
                              }}
                              onDriverConfirmAvailability={(empId, dt, shiftId) =>
                                onDriverConfirmAvailability(
                                  employee.id,
                                  dt,
                                  shiftId,
                                )
                              }
                              employeeId={employee.id}
                            />
                          ) : (
                            <div className={styles.emptyBox}>Availability</div>
                          )}
                        </div>
                      )}

                    {/* Assigned Shift Section */}
                    {(filterMode === "all" || filterMode === "assigned") && (
                      <div className={styles.assignedShiftBox}>
                        {daySchedule.assigned ? (
                          <ShiftCard
                            shift={daySchedule.assigned}
                            dateKey={dateKey}
                            onConfirmShift={(empId, dt, assignedShiftId) =>
                              onConfirmShift(employee.id, dt, assignedShiftId)
                            }
                            onRemoveShift={(empId, dt, assignedShiftId) =>
                              onRemoveAssignedShift(
                                employee.id,
                                dt,
                                assignedShiftId,
                              )
                            }
                            employeeId={employee.id}
                          />
                        ) : (
                          <div className={styles.emptyBox}>Assigned Shift</div>
                        )}
                      </div>
                    )}

                    {/* Assigned Vehicle Section */}
                    {(filterMode === "all" || filterMode === "vehicle") && (
                      <div className={styles.assignedVehicleBox}>
                        {daySchedule.assignedVehicle ? (
                          <div className={styles.vehicleAssigned}>
                            <Car className={styles.vehicleIcon} />
                            <span
                              title={
                                daySchedule.assignedVehicle.notes || "No notes"
                              }
                            >{`${daySchedule.assignedVehicle.name} (${daySchedule.assignedVehicle.number})`}</span>{" "}
                            {/* Display name and number */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent opening modal when removing
                                if (
                                  daySchedule.assignedVehicle
                                    ?.assigned_vehicle_id
                                ) {
                                  onRemoveAssignedVehicle(
                                    employee.id,
                                    dateKey,
                                    daySchedule.assignedVehicle
                                      .assigned_vehicle_id,
                                  );
                                } else {
                                  console.error(
                                    "Assigned vehicle ID not found for removal.",
                                  );
                                }
                              }}
                              className={styles.removeVehicleButton}
                              title="Remove Vehicle"
                            >
                              <X className={styles.removeIcon} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              onOpenVehicleModal(
                                employee.id,
                                dateKey,
                                daySchedule.assignedVehicle ?? null,
                                allocatedVehiclesForThisDate,
                              )
                            }
                            className={styles.assignVehicleButton} // New class for the button
                          >
                            Assign Vehicle
                          </button>
                        )}
                      </div>
                    )}
                  </DroppableCell>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const NotificationInbox = ({
  requests,
  onAction,
}: {
  requests: any[];
  onAction: (req: any) => void;
}) => (
  <div className={styles.notificationInbox}>
    <div className={styles.inboxHeader}>
      <Bell size={16} />
      <h4>Pending Requests</h4>
    </div>
    <div className={styles.inboxList}>
      {requests.length === 0 ? (
        <div className={styles.emptyInbox}>All caught up! 🎉</div>
      ) : (
        requests.map((req, i) => (
          <div
            key={i}
            className={styles.inboxItem}
            onClick={() => onAction(req)}
          >
            <div className={styles.inboxIcon}>
              <User size={14} />
            </div>
            <div className={styles.inboxContent}>
              <p>
                <strong>
                  {req.first_name} {req.surname}
                </strong>{" "}
                requested cancellation
              </p>
              <span>
                {req.shift_date} • {req.type === "shift" ? "Shift" : "Avail."}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const CancellationPanel = ({ isOpen, requests, onClose, onProcess }: any) => {
  if (!isOpen) return null;
  return (
    <>
      <div className={styles.sidebarOverlay} onClick={onClose}></div>
      <div className={`${styles.sidebar} ${styles.rightSidebar}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarHeader_Txt}>
            <h2>Cancellation Request</h2>
            <p>{requests.length} pending review</p>
          </div>
          <button onClick={onClose} className={styles.closeSidebarButton}>
            <X />
          </button>
        </div>
        <div className={styles.sidebarBody}>
          {requests.map((req: any) => (
            <div key={`${req.type}-${req.id}`} className={styles.requestCard}>
              <div className={styles.cardHeader}>
                <span
                  className={
                    req.type === "shift" ? styles.shiftTag : styles.availTag
                  }
                >
                  {req.type === "shift" ? "SHIFT" : "AVAILABILITY"}
                </span>
                <span className={styles.cardDate}>
                  {formatDisplayDate(req?.shift_date)}
                </span>
              </div>

              <div className={styles.cardUser}>
                <strong>
                  {req.first_name} {req.surname}
                </strong>
                <p>
                  {req.type === "shift"
                    ? req.shift_name
                    : req.availability_name}
                </p>
                {req.start_time && (
                  <small>
                    {req.start_time} - {req.end_time}
                  </small>
                )}
              </div>

              <div className={styles.cardReason}>
                <p>{req.cancel_reason}</p>
              </div>

              <button
                onClick={() => onProcess(req)}
                className={styles.reviewBtn}
              >
                Review & Process
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const UnconfirmedAvailabilityPanel = ({
  isOpen,
  rangeLabel,
  rows,
  isSyncing,
  onClose,
}: {
  isOpen: boolean;
  rangeLabel: string;
  rows: { name: string }[];
  isSyncing: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className={styles.sidebarOverlay} onClick={onClose}></div>
      <div className={`${styles.sidebar} ${styles.rightSidebar}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarHeader_Txt}>
            <h2>Availability Outstanding</h2>
            <p className={styles.availabilityRangeText}>{rangeLabel}</p>
          </div>
          <button onClick={onClose} className={styles.closeSidebarButton}>
            <X />
          </button>
        </div>
        <div className={styles.sidebarBody}>
          <div className={styles.unconfirmedPanelCard}>
            <h3>Drivers With No Submission This Week</h3>
            <div className={styles.unconfirmedPanelCount}>{rows.length}</div>
            <div className={styles.unconfirmedPanelList}>
              {isSyncing ? (
                <p className={styles.unconfirmedEmpty}>
                  Syncing upcoming week availability...
                </p>
              ) : rows.length === 0 ? (
                <p className={styles.unconfirmedEmpty}>
                  Every driver has submitted at least once this week.
                </p>
              ) : (
                rows.map((row, index) => (
                  <div
                    key={`${row.name}-${index}`}
                    className={styles.unconfirmedRow}
                  >
                    <p className={styles.unconfirmedName}>{row.name}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Pagination component for navigating through employee lists.
 */
interface PaginationProps {
  employeesPerPage: number;
  totalEmployees: number;
  currentPage: number;
  paginate: (pageNumber: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

const Pagination: React.FC<PaginationProps> = ({
  employeesPerPage,
  totalEmployees,
  currentPage,
  paginate,
  nextPage,
  prevPage,
}) => {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalEmployees / employeesPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className={styles.paginationNav}>
      <ul className={styles.paginationList}>
        <li>
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            Previous
          </button>
        </li>
        {pageNumbers.map((number) => (
          <li key={number}>
            <button
              onClick={() => paginate(number)}
              className={`${styles.paginationButton} ${currentPage === number ? styles.highlightedButton : ""
                }`}
            >
              {number}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={nextPage}
            disabled={
              pageNumbers.length === 0 || currentPage === pageNumbers.length
            }
            className={styles.paginationButton}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};


// --- STATIC TAB COMPONENTS (API integration to be added later) ---

// ─────────────────────────────────────────────────────────
// ROSTERING OVERVIEW TAB – static scaffold
// ─────────────────────────────────────────────────────────
const STATIC_WAVES = [
  { id: 1, name: "Wave A", time: "06:00 - 14:00" },
  { id: 2, name: "Wave B", time: "14:00 - 22:00" },
];

const STATIC_SERVICE_TYPES = [
  {
    id: 1,
    name: "Small Van",
    abbrev: "SV",
    quota: 5,
    color: "#FDE047",
    colorText: "#854d0e",
    waves: [1],
    assigned: [
      { id: 101, name: "Gerald Commanel Jeche", waveId: 1, van: "AB12 CDE", confirmed: true },
      { id: 102, name: "Sorn Ain Gronve", waveId: 1, van: null, confirmed: true },
    ],
  },
  {
    id: 2,
    name: "Medium Van",
    abbrev: "MV",
    quota: 3,
    color: "#86efac",
    colorText: "#166534",
    waves: [2],
    assigned: [
      { id: 201, name: "Jadoie Fattahdi", waveId: 2, van: "XY65 ZZZ", confirmed: false },
    ],
  },
  {
    id: 3,
    name: "Standard",
    abbrev: "STD",
    quota: 4,
    color: "#93c5fd",
    colorText: "#1e40af",
    waves: [1, 2],
    assigned: [
      { id: 301, name: "Sorn Ain Gronve", waveId: 1, van: null, confirmed: true },
      { id: 302, name: "Mansoor Khalid", waveId: 2, van: null, confirmed: false },
    ],
  },
];

const STANDBY_LIST = [
  "Ali Omran", "Anthony Elliott", "Cassian Langfield",
  "Isaac Godlonline", "Mohammed Hossyn", "Thierry Alan Walker",
  "Mary Johnson", "Priya Ohnali",
];

const AVAILABLE_DRIVERS = [
  { id: 1, name: "Vieira Kamina Chaise", van: null },
  { id: 2, name: "Christopher Higgins", van: null },
];

const RosteringOverviewTab: React.FC<{ currentDate: Date }> = ({ currentDate }) => {
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const dateLabel = currentDate.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const displayServices = selectedService === null
    ? STATIC_SERVICE_TYPES
    : STATIC_SERVICE_TYPES.filter((s) => s.id === selectedService);

  return (
    <div className={styles.rosterTab}>
      {/* Date Bar */}
      <div className={styles.rosterDateBar}>
        <span className={styles.rosterDateLabel}>📅 {dateLabel}</span>
      </div>

      {/* Service Filter Pills */}
      <div className={styles.rosterServicePills}>
        <button
          className={`${styles.serviceFilterPill} ${selectedService === null ? styles.serviceFilterPillActive : ""}`}
          onClick={() => setSelectedService(null)}
          style={selectedService === null ? { background: "#1c1c1e", color: "#fff" } : {}}
        >
          All Services
        </button>
        {STATIC_SERVICE_TYPES.map((st) => (
          <button
            key={st.id}
            className={`${styles.serviceFilterPill} ${selectedService === st.id ? styles.serviceFilterPillActive : ""}`}
            onClick={() => setSelectedService(selectedService === st.id ? null : st.id)}
            style={selectedService === st.id ? { background: st.color, color: st.colorText, borderColor: st.color } : {}}
          >
            {st.name} <span className={styles.pillAbbrev}>{st.abbrev}</span>
          </button>
        ))}
      </div>

      {/* Main Layout */}
      <div className={styles.rosterLayout}>
        {/* ── Swimlanes (right area in spec, primary area here) ── */}
        <div className={styles.rosterSwimlanes}>
          {displayServices.map((service) => {
            const assignedCount = service.assigned.length;
            const pct = Math.min((assignedCount / service.quota) * 100, 100);
            const over = assignedCount > service.quota;

            return (
              <div key={service.id} className={styles.swimlane}>
                {/* Swimlane Header */}
                <div className={styles.swimlaneHeader}>
                  <div className={styles.swimlaneTitle}>
                    <span
                      className={styles.swimlaneAbbrev}
                      style={{ background: service.color, color: service.colorText }}
                    >
                      {service.abbrev}
                    </span>
                    <span className={styles.swimlaneName}>{service.name}</span>
                  </div>
                  <div className={styles.swimlaneQuota}>
                    <span className={over ? styles.quotaOver : ""}>
                      {assignedCount} / {service.quota} Assigned
                    </span>
                    <div className={styles.quotaBar}>
                      <div
                        className={`${styles.quotaBarFill} ${over ? styles.quotaBarOver : ""}`}
                        style={{ width: `${pct}%`, background: over ? "#f87171" : service.color }}
                      />
                    </div>
                  </div>
                </div>

                {/* Wave Groups */}
                {STATIC_WAVES.filter((w) => service.waves.includes(w.id)).map((wave) => {
                  const waveDrivers = service.assigned.filter((a) => a.waveId === wave.id);
                  return (
                    <div key={wave.id} className={styles.waveGroup}>
                      <div className={styles.waveGroupHeader}>
                        <span className={styles.waveTag}>{wave.name}</span>
                        <span className={styles.waveTime}>{wave.time}</span>
                      </div>
                      <div className={styles.driverCards}>
                        {waveDrivers.length === 0 ? (
                          <div className={styles.emptyWaveSlot}>
                            No drivers assigned — drag drivers here
                          </div>
                        ) : (
                          waveDrivers.map((driver) => (
                            <div key={driver.id} className={styles.driverCard}>
                              <div className={styles.driverCardLeft}>
                                <span
                                  className={styles.driverBadge}
                                  style={{ background: service.color, color: service.colorText }}
                                >
                                  {service.abbrev}
                                </span>
                                <div className={styles.driverCardInfo}>
                                  <span className={styles.driverCardName}>{driver.name}</span>
                                  {driver.confirmed && (
                                    <span className={styles.driverConfirmedBadge}>✓ Confirmed</span>
                                  )}
                                </div>
                              </div>
                              <div className={styles.driverCardRight}>
                                {driver.van ? (
                                  <span className={styles.vanAssigned}>{driver.van}</span>
                                ) : (
                                  <select className={styles.vanSelect} defaultValue="">
                                    <option value="" disabled>Select Van</option>
                                    <option>AB12 CDE</option>
                                    <option>XY65 ZZZ</option>
                                  </select>
                                )}
                                <button className={styles.removeDriverBtn} title="Remove driver">✕</button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* ── Standby / Available Panel (right side) ── */}
        <div className={styles.rosterSidePanels}>
          {/* Standby List */}
          <div className={styles.rosterSideCard}>
            <h3 className={styles.rosterSideCardTitle}>
              <span className={styles.rosterSideDot} style={{ background: "#FDE047" }} />
              Standby List
            </h3>
            <ul className={styles.rosterSideList}>
              {STANDBY_LIST.map((name) => (
                <li key={name} className={styles.rosterSideListItem}>
                  <span className={styles.rosterSideAvatar}>{name[0]}</span>
                  {name}
                </li>
              ))}
            </ul>
          </div>

          {/* Available Drivers */}
          <div className={styles.rosterSideCard}>
            <h3 className={styles.rosterSideCardTitle}>
              <span className={styles.rosterSideDot} style={{ background: "#86efac" }} />
              Available Drivers
            </h3>
            <div className={styles.availableDriversCount}>
              {AVAILABLE_DRIVERS.length} drivers available today
            </div>
            <ul className={styles.rosterSideList}>
              {AVAILABLE_DRIVERS.map((d) => (
                <li key={d.id} className={styles.rosterSideListItem}>
                  <span className={styles.rosterSideAvatar}>{d.name[0]}</span>
                  {d.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// SERVICE CONFIGURATIONS TAB
// ─────────────────────────────────────────────────────────


interface ServiceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: { id: number; name: string; abbrev: string; quota: number; waves: number[]; color: string; colorText: string } | null;
  availableShifts: Shift[];
  onSave: (data: { name: string; abbrev: string; quota: number; waves: number[] }) => void;
}
const ServiceConfigModal: React.FC<ServiceConfigModalProps> = ({
  isOpen,
  onClose,
  initialData,
  availableShifts,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [abbrev, setAbbrev] = useState("");
  const [quota, setQuota] = useState(5);
  const [selectedWaves, setSelectedWaves] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name ?? "");
      setAbbrev(initialData?.abbrev ?? "");
      setQuota(initialData?.quota ?? 5);
      setSelectedWaves(initialData?.waves ?? []);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleWaveToggle = (waveId: number) => {
    setSelectedWaves((prev) =>
      prev.includes(waveId)
        ? prev.filter((id) => id !== waveId)
        : [...prev, waveId]
    );
  };

  const handleSave = () => {
    onSave({
      name,
      abbrev,
      quota,
      waves: selectedWaves,
    });
    onClose();
  };

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose} />
      <div className={`${styles.customModal} ${styles.serviceConfigModal}`}>
        <div className={styles.modalHeader}>
          <h3>{initialData ? "Edit Service Type" : "Create new service type"}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>Service name</label>
            <input
              className={styles.modalInput}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Small Van"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Abbreviation (2-3 characters)</label>
            <input
              className={styles.modalInput}
              type="text"
              value={abbrev}
              onChange={(e) => setAbbrev(e.target.value)}
              placeholder="e.g. SV"
              maxLength={3}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Driver count required</label>
            <input
              className={styles.modalInput}
              type="number"
              value={quota}
              onChange={(e) => setQuota(parseInt(e.target.value) || 0)}
              min={1}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Linked waves</label>
            <div className={styles.waveChecklist}>
              {availableShifts.map((shift) => (
                <label key={shift.id} className={styles.waveCheckItem}>
                  <input
                    type="checkbox"
                    checked={selectedWaves.includes(shift.id)}
                    onChange={() => handleWaveToggle(shift.id)}
                  />
                  <span>{shift.shift_name} ({shift.start_time})</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancel</button>
          <button className={styles.btnPrimary} onClick={handleSave}>
            {initialData ? "Save Changes" : "Create"}
          </button>
        </div>
      </div>
    </>
  );
};

const colors = [
  { color: "#FDE047", colorText: "#854d0e" },
  { color: "#86efac", colorText: "#166534" },
  { color: "#93c5fd", colorText: "#1e40af" },
  { color: "#f9a8d4", colorText: "#9d174d" },
  { color: "#6ee7b7", colorText: "#065f46" },
  { color: "#c4b5fd", colorText: "#4c1d95" },
];

interface ServiceConfigurationsTabProps {
  availableShifts: Shift[];
}
const ServiceConfigurationsTab: React.FC<ServiceConfigurationsTabProps> = ({ availableShifts }) => {
  const [configs, setConfigs] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any | null>(null);

  const fetchServiceTypes = useCallback(async () => {
    try {
      const data = await SchedulingApi.getServiceTypes();

      const serviceTypesList = Array.isArray(data)
        ? data
        : (data.service_types || data.data || []);

      const mappedConfigs = serviceTypesList.map((item: any, index: number) => {
        const colorScheme = colors[index % colors.length];

        let wavesArray: number[] = [];
        if (item.wave_ids) {
          if (typeof item.wave_ids === 'string') {
            wavesArray = item.wave_ids
              .split(",")
              .map((id: string) => parseInt(id.trim(), 10))
              .filter((id: number) => !isNaN(id));
          } else if (Array.isArray(item.wave_ids)) {
            wavesArray = item.wave_ids.map((id: any) => Number(id)).filter((id: number) => !isNaN(id));
          }
        }

        return {
          id: item.id || item.service_id || index + 1,
          service_id: item.service_id || item.id,
          name: item.service_name || item.name || "",
          abbrev: item.abbreviation || item.abbrev || "",
          quota: parseInt(item.no_of_drivers || item.quota || 0, 10),
          waves: wavesArray,
          color: item.color || colorScheme.color,
          colorText: item.colorText || colorScheme.colorText,
        };
      });

      mappedConfigs.sort((a: any, b: any) => Number(a.id || 0) - Number(b.id || 0));
      setConfigs(mappedConfigs);
    } catch (error) {
      console.error("Error fetching service types:", error);
    }
  }, []);

  useEffect(() => {
    fetchServiceTypes();
  }, [fetchServiceTypes]);

  const openCreate = () => { setEditingConfig(null); setIsModalOpen(true); };
  const openEdit = (cfg: any) => { setEditingConfig(cfg); setIsModalOpen(true); };

  const handleSaveConfig = async (data: { name: string; abbrev: string; quota: number; waves: number[] }) => {
    if (editingConfig) {
      try {
        const serviceId = editingConfig.service_id || editingConfig.id;
        const resData = await SchedulingApi.updateServiceType({
          service_id: serviceId,
          service_name: data.name,
          no_of_drivers: data.quota,
          wave_ids: data.waves.join(","),
          abbreviation: data.abbrev,
        });

        if (
          resData.status === 1 ||
          resData.status === true ||
          resData.success ||
          resData.status === "success"
        ) {
          setConfigs((prev) =>
            prev.map((c) =>
              c.id === editingConfig.id || c.service_id === editingConfig.service_id
                ? {
                  ...c,
                  name: data.name,
                  abbrev: data.abbrev,
                  quota: data.quota,
                  waves: data.waves,
                }
                : c
            )
          );
          await fetchServiceTypes();
          alert("Service type updated successfully!");
        } else {
          alert(resData.message || "Failed to update service type.");
        }
      } catch (error) {
        console.error("Error updating service type:", error);
        alert("An error occurred while updating the service type.");
      }
    } else {
      try {
        const resData = await SchedulingApi.addServiceType({
          service_name: data.name,
          no_of_drivers: data.quota,
          wave_ids: data.waves.join(","),
          abbreviation: data.abbrev,
        });

        if (
          resData.status === 1 ||
          resData.status === true ||
          resData.success ||
          resData.status === "success"
        ) {
          await fetchServiceTypes();
          alert("Service type created successfully!");
        } else {
          alert(resData.message || "Failed to create service type.");
        }
      } catch (error) {
        console.error("Error creating service type:", error);
        alert("An error occurred while creating the service type.");
      }
    }
  };

  const handleDeleteConfig = async (cfg: any) => {
    if (!window.confirm(`Are you sure you want to delete "${cfg.name}"?`)) {
      return;
    }

    try {
      const serviceId = cfg.service_id || cfg.id;
      const resData = await SchedulingApi.deleteServiceType(serviceId);

      if (
        resData.status === 1 ||
        resData.status === true ||
        resData.success ||
        resData.status === "success"
      ) {
        setConfigs((prev) =>
          prev.filter(
            (c) => c.id !== cfg.id && c.service_id !== cfg.service_id
          )
        );
        alert("Service type deleted successfully!");
      } else {
        alert(resData.message || "Failed to delete service type.");
      }
    } catch (error) {
      console.error("Error deleting service type:", error);
      alert("An error occurred while deleting the service type.");
    }
  };


  return (
    <div className={styles.serviceConfigTab}>
      {/* Top bar */}
      <div className={styles.serviceConfigTopBar}>
        <div className={styles.serviceConfigCount}>
          <Target size={18} />
          <span>{configs.length} service type(s)</span>
        </div>
        <button className={styles.createServiceBtn} onClick={openCreate}>
          + Create new service type
        </button>
      </div>

      {/* Table */}
      <div className={styles.serviceConfigTableWrap}>
        <table className={styles.serviceConfigTable}>
          <thead>
            <tr>
              <th>SERVICE NAME</th>
              <th>CODE.</th>
              <th>QUOTA</th>
              <th>LINKED WAVES</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {configs.map((cfg) => (
              <tr key={cfg.id} className={styles.serviceConfigRow}>
                <td>
                  <span
                    className={styles.serviceNameDot}
                    style={{ background: cfg.color }}
                  />
                  {cfg.name}
                </td>
                <td>
                  <span
                    className={styles.abbrevBadge}
                    style={{ background: cfg.color, color: cfg.colorText }}
                  >
                    {cfg.abbrev}
                  </span>
                </td>
                <td>{cfg.quota}</td>
                <td>
                  <div className={styles.linkedWavesRow}>
                    {availableShifts.map((shift) => (
                      <span
                        key={shift.id}
                        className={`${styles.linkedWaveChip} ${cfg.waves.includes(shift.id) ? styles.linkedWaveChipActive : styles.linkedWaveChipInactive}`}
                      >
                        {shift.shift_name} ({shift.start_time})
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className={styles.tableActionBtns}>
                    <button
                      className={styles.editRowBtn}
                      onClick={() => openEdit(cfg)}
                      title="Edit"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      className={styles.deleteRowBtn}
                      onClick={() => handleDeleteConfig(cfg)}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ServiceConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingConfig}
        availableShifts={availableShifts}
        onSave={handleSaveConfig}
      />
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const SchedulingPage = () => {
  const history = useHistory();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [availableShifts, setAvailableShifts] = useState<Shift[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]); // Store fetched vehicles
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isVehicleSidebarOpen, setVehicleSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'scheduling' | 'rostering' | 'service-config'>('scheduling');
  const [currentDate, setCurrentDate] = useState(new Date()); // Default to current day
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week"); // Default to week
  const [isDraggingShift, setIsDraggingShift] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [confirmationFilter, setConfirmationFilter] =
    useState<ConfirmationFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [dailyTargets, setDailyTargets] = useState<Record<string, string>>({});
  const [dailyTargetIds, setDailyTargetIds] = useState<Record<string, number>>({});
  
  const [notes, setNotes] = useState("");

  const handleDailyTargetChange = useCallback((dateKey: string, value: string) => {
    setDailyTargets(prev => ({ ...prev, [dateKey]: value }));
  }, []);

  const handleManageShifts = () => {
    setVehicleSidebarOpen(false);
    setIsDraggingShift(false);
    setSidebarOpen((prev) => !prev);
  };
  const handleManageVehicles = () => {
    setSidebarOpen(false);
    setVehicleSidebarOpen((prev) => !prev);
  };
  const handleOpenPreviewModal = () => {
    handleOpenDailyPreview();
    setIsDailyPreviewModalOpen(true);
  };

  const handleOpenUnconfirmedInfoPanel = () => {
    handleOpenUnconfirmedInfo();
  };

  const handleonOpenInbox = () => {
    history.push(`/${HomeRouterNames.NOTIFICATION_LOGS}`)
  };

  const handleDailyTargetSave = useCallback(async (dateKey: string, value: string) => {
    if (!value || value.trim() === "") return;
    try {
      const response = await fetch(`${API_BASE_URL}/update_target`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_date: dateKey, target: value }),
      });
      const data = await response.json();
      const returnedId = data?.target_id ?? data?.data?.target_id ?? data?.data?.id ?? data?.id;
      if (returnedId) {
        setDailyTargetIds(prev => ({ ...prev, [dateKey]: returnedId }));
      }
    } catch (err) {
      console.error("Failed to save daily target:", err);
    }
  }, []);

  // State for Vehicle Assignment Modal
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [selectedEmployeeForVehicle, setSelectedEmployeeForVehicle] = useState<
    number | null
  >(null);
  const [selectedDateForVehicle, setSelectedDateForVehicle] = useState<
    string | null
  >(null);
  const [currentVehicleInModal, setCurrentVehicleInModal] =
    useState<AssignedVehicle | null>(null);
  const [allocatedVehiclesForModalDate, setAllocatedVehiclesForModalDate] =
    useState<AssignedVehicle[]>([]);

  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isCancelPanelOpen, setIsCancelPanelOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isUnconfirmedPanelOpen, setIsUnconfirmedPanelOpen] = useState(false);
  const [selectedCancelRequest, setSelectedCancelRequest] = useState<any>(null);
  const [globalCancelRequests, setGlobalCancelRequests] = useState<any[]>([]);
  

  // State for Download Reports Modal
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDailyPreviewModalOpen, setIsDailyPreviewModalOpen] = useState(false);
  const [dailyPreviewRows, setDailyPreviewRows] = useState<DailyPreviewRow[]>(
    [],
  );
  const [isDailyPreviewLoading, setIsDailyPreviewLoading] = useState(false);
  const [dailyPreviewError, setDailyPreviewError] = useState<string | null>(
    null,
  );
  const [dailyPreviewSortKey, setDailyPreviewSortKey] =
    useState<PreviewSortKey>("arrival_time");
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [pendingAssignment, setPendingAssignment] = useState<{
    targetEmployeeId: number;
    targetDate: string;
    droppedShift: Shift;
    sourceEmployeeId?: number;
    sourceDate?: string;
  } | null>(null);
  const [dailyPreviewSortOrder, setDailyPreviewSortOrder] =
    useState<SortOrder>("asc");

  // State for Add Driver Availability Modal
  const [confirmAvailabilityModal, setConfirmAvailabilityModal] = useState<{
    isOpen: boolean;
    employeeId: number;
    date: string;
    availabilityId: number;
    isConfirmed: boolean;
    driverName?: string;
  } | null>(null);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [selectedAvailabilityDriverId, setSelectedAvailabilityDriverId] =
    useState<number | string | undefined>(undefined);
  const [selectedAvailabilityDate, setSelectedAvailabilityDate] =
    useState<string | undefined>(undefined);
  const [selectedAvailabilityShift, setSelectedAvailabilityShift] =
    useState<any>(undefined);

  const handleOpenAvailabilityModal = (
    driverId?: number | string,
    date?: string,
    shift?: any,
  ) => {
    setSelectedAvailabilityDriverId(driverId);
    setSelectedAvailabilityDate(date);
    setSelectedAvailabilityShift(shift);
    setIsAvailabilityModalOpen(true);
  };

  const handleSaveAvailability = async (payload: {
    driver_id: number | string;
    availability_status: string;
    availability_name: string;
    availability_start_time: string;
    availability_end_time: string;
    availability_date: string;
  }) => {
    await SchedulingApi.addDriverAvailability(payload);
    cachedEmployeeData.current = {};
    setLoadedDateKeys(new Set());
    const dates = getDatesToDisplay();
    if (dates.length > 0) {
      const rangeStart = formatDate(dates[0], "key");
      const rangeEnd = formatDate(dates[dates.length - 1], "key");
      fetchDriversSchedule(rangeStart, rangeEnd);
    }
  };

  // Detect mobile for conditional UI adjustments
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Cache for fetched employee schedule data by month - now using useRef
  const cachedEmployeeData = useRef<{ [monthYear: string]: Employee[] }>({});
  const isSchedulePollingInFlight = useRef(false);
  const inFlightRangeRequests = useRef<Set<string>>(new Set());
  const [loadedDateKeys, setLoadedDateKeys] = useState<Set<string>>(new Set());

  // Inside SchedulingPage
  const getDatesToDisplay = useCallback(() => {
    if (viewMode === "day") return getDayDates(currentDate);
    if (viewMode === "week") return getWeekDates(currentDate);
    if (viewMode === "month") return getMonthDates(currentDate);
    return [];
  }, [currentDate, viewMode]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- API Fetching Functions ---

  /**
   * Removes an assigned vehicle from an employee for a specific date via API.
   */
  const handleRemoveAssignedVehicle = useCallback(
    async (employeeId: number, date: string, assignedVehicleId: number) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/removed_driver_vehicle/${assignedVehicleId}`,
          {
            method: "DELETE",
          },
        );
        const data = await response.json();
        if (data.status === 1) {
          console.log("Vehicle removed successfully:", data.message);
          // Update local state
          setEmployees((prevEmployees) =>
            prevEmployees.map((emp) => {
              if (emp.id === employeeId) {
                const newSchedule = { ...emp.schedule };
                if (newSchedule[date]) {
                  newSchedule[date] = {
                    ...newSchedule[date],
                    assignedVehicle: null,
                  };
                }
                return { ...emp, schedule: newSchedule };
              }
              return emp;
            }),
          );
          // Clear cache after successful removal
          cachedEmployeeData.current = {};
        } else {
          console.error("Failed to remove vehicle:", data.message);
          alert(`Failed to remove vehicle: ${data.message}`);
        }
      } catch (error) {
        console.error("Error removing vehicle:", error);
        alert("Error removing vehicle. Please try again.");
      }
    },
    [],
  ); // No dependencies that would cause re-creation issues

  const fetchDriversSchedule = useCallback(
    async (startDate: string, endDate: string) => {
      const requestKey = `${startDate}__${endDate}`;
      if (inFlightRangeRequests.current.has(requestKey)) return;
      inFlightRangeRequests.current.add(requestKey);

      try {
        const fetchScheduleWithRetry = async (attempt = 1): Promise<any> => {
          const timeoutController = new AbortController();
          const timeoutId = setTimeout(() => timeoutController.abort(), 12000);
          try {
            const response = await fetch(
              `${API_BASE_URL}/drivers_schedule/?start_date=${startDate}&end_date=${endDate}`,
              { signal: timeoutController.signal },
            );
            if (!response.ok) {
              throw new Error(
                `drivers_schedule failed with ${response.status}`,
              );
            }
            return response.json();
          } catch (error) {
            if (attempt < 2) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              return fetchScheduleWithRetry(attempt + 1);
            }
            throw error;
          } finally {
            clearTimeout(timeoutId);
          }
        };

        const data = await fetchScheduleWithRetry();
        if (data.status === 1) {
          const fetchedDateKeys = getDateKeysInRange(
            new Date(startDate),
            new Date(endDate),
          );

          // Map API response to local Employee structure
          const mappedEmployees: Employee[] = data.drivers.map(
            (driver: any) => ({
              id: driver.id,
              first_name: driver.first_name?.trim(),
              only_first_name: driver.only_first_name?.trim(),
              middle_name: driver.middle_name?.trim(),
              surname: driver.surname?.trim(),
              email: driver.email?.trim(),
              avatar_id: driver.avatar_id,
              join_date: driver.join_date,
              schedule: Object.keys(driver.schedule).reduce(
                (acc: any, dateKey: string) => {
                  const apiSchedule = driver.schedule[dateKey];
                  acc[dateKey] = {
                    availability:
                      apiSchedule.availability &&
                        apiSchedule.availability.length > 0
                        ? {
                          id: apiSchedule.availability[0].id,
                          shift_name:
                            apiSchedule.availability[0].availability_name?.trim(),
                          start_time:
                            apiSchedule.availability[0].availability_start_time?.trim(),
                          end_time:
                            apiSchedule.availability[0].availability_end_time?.trim(),
                          shift_status:
                            apiSchedule.availability[0].availability_status?.trim(),
                          shift_type: apiSchedule.availability[0].type?.trim(), // This maps 'type' from API to 'shift_type'
                          is_driver_confirmed:
                            apiSchedule.availability[0].is_driver_confirmed?.trim(),
                          cancellation_status:
                            apiSchedule.availability[0].cancellation_status,
                          cancel_reason:
                            apiSchedule.availability[0].cancel_reason,
                          admin_reply:
                            apiSchedule.availability[0].admin_reply,
                        }
                        : null,
                    assigned:
                      apiSchedule.assigned &&
                        apiSchedule.assigned.length > 0 &&
                        apiSchedule.assigned[0].shift_name
                        ? {
                          id: apiSchedule.assigned[0].shift_id,
                          assigned_shift_id:
                            apiSchedule.assigned[0].assigned_shift_id,
                          shift_name:
                            apiSchedule.assigned[0].shift_name?.trim(),
                          start_time:
                            apiSchedule.assigned[0].start_time?.trim(),
                          end_time: apiSchedule.assigned[0].end_time?.trim(),
                          shift_status:
                            apiSchedule.assigned[0].shift_status?.trim(),
                          shift_type:
                            apiSchedule.assigned[0].shift_type?.trim() ||
                            "assigned", // Handle null shift_type
                          isConfirmedByManager: parseBooleanLike(
                            apiSchedule.assigned[0].is_confirmed_by_manager ??
                            apiSchedule.assigned[0].is_manager_confirmed ??
                            apiSchedule.assigned[0].manager_confirmed ??
                            apiSchedule.assigned[0].manager_confirmation,
                          ),
                          cancellation_status:
                            apiSchedule.assigned[0].cancellation_status,
                          cancel_reason:
                            apiSchedule.assigned[0].cancel_reason,
                          cancelled_by_driver:
                            apiSchedule.assigned[0].cancelled_by_driver,
                          admin_reply: apiSchedule.assigned[0].admin_reply,
                          service_id: apiSchedule.assigned[0].service_id,
                        }
                        : null,
                    assignedVehicle:
                      apiSchedule.assignedVehicle &&
                        apiSchedule.assignedVehicle.length > 0
                        ? {
                          id: apiSchedule.assignedVehicle[0].vehicle_id, // Original vehicle ID
                          name: apiSchedule.assignedVehicle[0].vehicle_name?.trim(),
                          number:
                            apiSchedule.assignedVehicle[0].vehicle_number?.trim(),
                          notes:
                            apiSchedule.assignedVehicle[0].vehicle_rph?.trim() ||
                            "",
                          assigned_vehicle_id:
                            apiSchedule.assignedVehicle[0]
                              .assigned_vehicle_id, // The ID for deletion
                        }
                        : null,
                  };
                  return acc;
                },
                {},
              ),
            }),
          );

          setEmployees((prevEmployees) => {
            const previousConfirmationState = new Map<string, boolean>();
            prevEmployees.forEach((emp) => {
              Object.entries(emp.schedule).forEach(([dateKey, daySchedule]) => {
                const assigned = daySchedule.assigned;
                if (!assigned) return;
                const shiftIdentity = assigned.assigned_shift_id ?? assigned.id;
                previousConfirmationState.set(
                  `${emp.id}_${dateKey}_${shiftIdentity}`,
                  assigned.isConfirmedByManager === true,
                );
              });
            });

            const prevEmployeeMap = new Map(
              prevEmployees.map((emp) => [emp.id, emp]),
            );

            const mergedEmployees = mappedEmployees.map((emp) => {
              const previousEmployee = prevEmployeeMap.get(emp.id);
              const mergedSchedule = { ...(previousEmployee?.schedule || {}) };

              Object.entries(emp.schedule).forEach(([dateKey, daySchedule]) => {
                const assigned = daySchedule.assigned;
                if (!assigned) {
                  mergedSchedule[dateKey] = daySchedule;
                  return;
                }

                const shiftIdentity = assigned.assigned_shift_id ?? assigned.id;
                const previousValue = previousConfirmationState.get(
                  `${emp.id}_${dateKey}_${shiftIdentity}`,
                );
                mergedSchedule[dateKey] = {
                  ...daySchedule,
                  assigned: {
                    ...assigned,
                    isConfirmedByManager:
                      assigned.isConfirmedByManager ?? previousValue ?? false,
                  },
                };
              });

              return {
                ...(previousEmployee || {}),
                ...emp,
                schedule: mergedSchedule,
              };
            });

            prevEmployees.forEach((prevEmp) => {
              if (!mappedEmployees.some((emp) => emp.id === prevEmp.id)) {
                mergedEmployees.push(prevEmp);
              }
            });

            return mergedEmployees;
          });

          setLoadedDateKeys((prev) => {
            const next = new Set(prev);
            fetchedDateKeys.forEach((key) => next.add(key));
            return next;
          });
        } else {
          console.error("Failed to fetch drivers schedule:", data.message);
        }
      } catch (error) {
        console.error("Error fetching drivers schedule:", error);
      } finally {
        inFlightRangeRequests.current.delete(requestKey);
      }
    },
    [],
  );
	
const refreshDriversSchedule = useCallback(() => {
  cachedEmployeeData.current = {};
  setLoadedDateKeys(new Set());

  const dates = getDatesToDisplay();

  if (dates.length > 0) {
    const rangeStart = formatDate(dates[0], "key");
    const rangeEnd = formatDate(dates[dates.length - 1], "key");

    fetchDriversSchedule(rangeStart, rangeEnd);
  }
}, [fetchDriversSchedule, getDatesToDisplay]);	
	
  const handleRemoveAvailability = useCallback(
    async (
      employeeId: number,
      date: string,
      availabilityId: number | string,
    ) => {
      try {
        const data = await SchedulingApi.deleteDriverAvailability(
          availabilityId,
        );
        if (
          data.status === 1 ||
          data.status === 200 ||
          data.status === "success" ||
          data.success
        ) {
          console.log("Availability deleted successfully:", data.message);
          setEmployees((prevEmployees) =>
            prevEmployees.map((emp) => {
              if (emp.id === employeeId) {
                const newSchedule = { ...emp.schedule };
                if (newSchedule[date]) {
                  newSchedule[date] = {
                    ...newSchedule[date],
                    availability: null,
                  };
                }
                return { ...emp, schedule: newSchedule };
              }
              return emp;
            }),
          );
          cachedEmployeeData.current = {};
          setLoadedDateKeys(new Set());
          const dates = getDatesToDisplay();
          if (dates.length > 0) {
            const rangeStart = formatDate(dates[0], "key");
            const rangeEnd = formatDate(dates[dates.length - 1], "key");
            fetchDriversSchedule(rangeStart, rangeEnd);
          }
        } else {
          console.error("Failed to delete availability:", data.message);
          alert(`Failed to delete availability: ${data.message || "Unknown error"}`);
        }
      } catch (error: any) {
        console.error("Error deleting availability:", error);
        alert(error.message || "Error deleting availability. Please try again.");
      }
    },
    [getDatesToDisplay, fetchDriversSchedule],
  );

  const fetchAvailableShifts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_shifts`);
      const data = await response.json();
      if (data.status === 1) {
        const mappedShifts: Shift[] = data.driver_shifts.map((shift: any) => ({
          id: shift.id,
          shift_name: shift.shift_name?.trim(),
          start_time: shift.start_time?.trim(),
          end_time: shift.end_time?.trim(),
          shift_status: shift.shift_status?.trim(),
          shift_type: shift.shift_type?.trim(),
        }));
        setAvailableShifts(mappedShifts);
      } else {
        console.error("Failed to fetch available shifts:", data.message);
      }
    } catch (error) {
      console.error("Error fetching available shifts:", error);
    }
  }, []);

  const fetchVehiclesList = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin_vehicles_list`);
      const data = await response.json();
      if (data.status === 1) {
        const mappedVehicles: Vehicle[] = data.vehicles.map((vehicle: any) => ({
          id: vehicle.id,
          vehicle_name: vehicle.vehicle_name?.trim(),
          vehicle_number: vehicle.vehicle_number?.trim(),
          vehicle_type: vehicle.vehicle_type?.trim(),
          vehicle_rph: vehicle.vehicle_rph?.trim(),
          vehicle_nos: vehicle.vehicle_nos?.trim(),
          vehicle_status: vehicle.vehicle_status?.trim(),
        }));
        setAvailableVehicles(mappedVehicles);
      } else {
        console.error("Failed to fetch vehicles list:", data.message);
      }
    } catch (error) {
      console.error("Error fetching vehicles list:", error);
    }
  }, []);

  const fetchServiceTypes = useCallback(async () => {
    try {
      const data = await SchedulingApi.getServiceTypes();
      const serviceTypesList = Array.isArray(data)
        ? data
        : (data.service_types || data.data || []);

      const mapped = serviceTypesList.map((item: any, index: number) => ({
        id: item.id || item.service_id || index + 1,
        service_id: item.service_id || item.id,
        name: item.service_name || item.name || "",
        abbrev: item.abbreviation || item.abbrev || "",
        quota: parseInt(item.no_of_drivers || item.quota || 0, 10),
      }));
      setServiceTypes(mapped);
    } catch (error) {
      console.error("Error fetching service types in main page:", error);
    }
  }, []);

  const handleAddVehicle = useCallback(
    async (vehicleData: VehiclePayload) => {
      try {
        const addResponse = await fetch(`${API_BASE_URL}/add_vehicle`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vehicle_name: vehicleData.vehicle_name,
            vehicle_number: vehicleData.vehicle_number,
            vehicle_type: vehicleData.vehicle_type,
            vehicle_nos: vehicleData.vehicle_nos,
            vehicle_status: vehicleData.vehicle_status,
          }),
        });

        const addResult = await addResponse.json();
        if (addResult.status !== 1) {
          alert(addResult.message || "Failed to add van.");
          return;
        }

        if (vehicleData.vehicle_rph) {
          const updateResponse = await fetch(`${API_BASE_URL}/update_vehicle`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              vehicle_name: vehicleData.vehicle_name,
              vehicle_number: vehicleData.vehicle_number,
              vehicle_type: vehicleData.vehicle_type,
              vehicle_nos: vehicleData.vehicle_nos,
              vehicle_status: vehicleData.vehicle_status,
              vehicle_rph: vehicleData.vehicle_rph,
            }),
          });
          await updateResponse.json();
        }

        await fetchVehiclesList();
      } catch (error) {
        console.error("Error adding van:", error);
        alert("Error adding van. Please try again.");
      }
    },
    [fetchVehiclesList],
  );

  const handleUpdateVehicle = useCallback(
    async (vehicleData: VehiclePayload) => {
      try {
        const response = await fetch(`${API_BASE_URL}/update_vehicle`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vehicle_name: vehicleData.vehicle_name,
            vehicle_number: vehicleData.vehicle_number,
            vehicle_type: vehicleData.vehicle_type,
            vehicle_nos: vehicleData.vehicle_nos,
            vehicle_status: vehicleData.vehicle_status,
            vehicle_rph: vehicleData.vehicle_rph,
          }),
        });
        const data = await response.json();
        if (data.status === 1) {
          await fetchVehiclesList();
        } else {
          alert(data.message || "Failed to update van.");
        }
      } catch (error) {
        console.error("Error updating van:", error);
        alert("Error updating van. Please try again.");
      }
    },
    [fetchVehiclesList],
  );

  const handleDeactivateVehicle = useCallback(
    async (vehicleNumber: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/delete_vehicle`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vehicle_number: vehicleNumber,
          }),
        });
        const data = await response.json();
        if (data.status === 1) {
          await fetchVehiclesList();
        } else {
          alert(data.message || "Failed to inactivate van.");
        }
      } catch (error) {
        console.error("Error inactivating van:", error);
        alert("Error inactivating van. Please try again.");
      }
    },
    [fetchVehiclesList],
  );

  // Helper to get dates for current view
  const getDatesForCurrentView = useCallback(() => {
    if (viewMode === "day") return getDayDates(currentDate);
    if (viewMode === "week") return getWeekDates(currentDate);
    if (viewMode === "month") return getMonthDates(currentDate);
    return [];
  }, [currentDate, viewMode]);

  const fetchDailyTargets = useCallback(
    async (startDate: string) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/daily_targets?start_date=${startDate}`,
        );
        if (!response.ok) return;
        const data = await response.json();
        if (data.status !== 1 || !data.daily_targets) return;
        // API returns {"M/D/YY": "value"} — convert to "YYYY-MM-DD"
        const targetsMap: Record<string, string> = {};
        Object.entries(data.daily_targets as Record<string, string>).forEach(([apiDate, val]) => {
          const parts = apiDate.split("/");
          if (parts.length === 3) {
            const [m, d, y] = parts;
            const fullYear = parseInt(y) < 100 ? `20${y.padStart(2, "0")}` : y;
            const dateKey = `${fullYear}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
            targetsMap[dateKey] = String(val);
          }
        });
        if (Object.keys(targetsMap).length > 0) {
          setDailyTargets(prev => ({ ...prev, ...targetsMap }));
        }
      } catch (err) {
        console.warn("fetchDailyTargets failed:", err);
      }
    },
    [setDailyTargets],
  );

  const ensureScheduleDataForDates = useCallback(
    async (dates: Date[], forceRefresh = false) => {
      if (dates.length === 0) return;

      const targetKeys = dates.map((date) => formatDate(date, "key"));
      const missingKeys = forceRefresh
        ? targetKeys
        : targetKeys.filter((key) => !loadedDateKeys.has(key));

      if (missingKeys.length === 0) return;

      const chunks = buildDateChunksFromKeys(missingKeys, 7);
      for (const chunk of chunks) {
        await fetchDriversSchedule(chunk.start, chunk.end);
        fetchDailyTargets(chunk.start); // fire-and-forget — no await needed
      }
    },
    [fetchDriversSchedule, fetchDailyTargets, loadedDateKeys],
  );

  const mapPreviewRowsFromDrivers = useCallback(
    (drivers: any[]): DailyPreviewRow[] => {
      return drivers
        .map((driver: any) => {
          const assigned = driver?.schedule?.assigned;
          if (!assigned) return null;

          const assignedVehicle = driver?.schedule?.assignedVehicle;
          const rawName = [driver?.first_name, driver?.surname]
            .filter(Boolean)
            .join(" ");

          return {
            name: `${rawName?.trim() || "Driver"} (${driver?.other_id ?? "N/A"})`,
            arrivalTime:
              assigned?.holding_lane_arrival_time?.trim() ||
              assigned?.start_time?.trim() ||
              "-",
            wave: assigned?.shift_name?.trim() || "-",
            vanRegistration:
              assignedVehicle?.vehicle_number?.trim() ||
              assignedVehicle?.number?.trim() ||
              "-",
            loadingPad: assigned?.launch_padload_time?.trim() || "-",
            routeCode: assigned?.route_code?.trim() || "-",
            stagingLocation: assigned?.staging_location?.trim() || "-",
          };
        })
        .filter((row): row is DailyPreviewRow => row !== null);
    },
    [],
  );

  const fetchDailyPreviewData = useCallback(
    async (date?: Date | null, options?: { silent?: boolean }) => {
      const silentRefresh = options?.silent === true;
      let targetDate = date;

      try {
        // If no date is supplied, get the next preview date from the backend
        if (!targetDate) {
          const preview = await SchedulingApi.getExcelPreviewDate();

          if (preview?.status === 1 && preview?.preview_date) {
            const [y, m, d] = preview.preview_date.split("-").map(Number);

            targetDate = new Date(y, m - 1, d);

            setDailyPreviewTargetDate(targetDate);
            setCurrentDate(targetDate);
          }
        }

        // Final fallback
        targetDate = targetDate ?? currentDate ?? new Date();

        const dateKey = formatDate(targetDate, "key");

        if (!silentRefresh) {
          setIsDailyPreviewLoading(true);
          setDailyPreviewError(null);
        }

        const response = await fetch(
          `${API_BASE_URL}/admin_driver_schedule?date=${dateKey}`
        );

        const data = await response.json();

        if (
          response.ok &&
          data?.status === 1 &&
          Array.isArray(data.drivers)
        ) {
          setDailyPreviewRows(mapPreviewRowsFromDrivers(data.drivers));
		  setNotes(data?.roster_notes ?? localStorage.getItem("rostering_notes") ?? "");
        } else {
          throw new Error("Unable to fetch driver schedule.");
        }
      } catch (error) {
        console.error(error);
        setDailyPreviewError("Failed to load daily preview.");
      } finally {
        if (!silentRefresh) {
          setIsDailyPreviewLoading(false);
        }
      }
    },
    [currentDate, mapPreviewRowsFromDrivers]
  );

  // Initial data load
  useEffect(() => {
    const initializeData = async () => {
      await fetchVehiclesList();
      await fetchAvailableShifts();
      await fetchServiceTypes();

      const today = new Date();
      const nextThirteenDays = new Date(today);
      nextThirteenDays.setDate(today.getDate() + 13);
      const initialKeys = getDateKeysInRange(today, nextThirteenDays);
      const initialChunks = buildDateChunksFromKeys(initialKeys, 7);

      for (const chunk of initialChunks) {
        await fetchDriversSchedule(chunk.start, chunk.end);
      }
    };
    initializeData();
  }, [fetchVehiclesList, fetchAvailableShifts, fetchServiceTypes, fetchDriversSchedule]);

  const datesToDisplayKeys = getDatesForCurrentView().map((date) =>
    formatDate(date, "key"),
  );

  useEffect(() => {
    ensureScheduleDataForDates(getDatesForCurrentView());
  }, [
    currentDate,
    viewMode,
    getDatesForCurrentView,
    ensureScheduleDataForDates,
  ]);

  useEffect(() => {
    const upcomingWeekDates = getUpcomingSundayWeekDates(new Date());
    ensureScheduleDataForDates(upcomingWeekDates);
  }, [ensureScheduleDataForDates]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const pollScheduleData = async () => {
      if (document.visibilityState !== "visible") return;
      if (isSchedulePollingInFlight.current) return;

      const visibleDates = getDatesForCurrentView();
      const liveViewDates =
        viewMode === "month" ? getWeekDates(currentDate) : visibleDates;
      const upcomingWeekDates = getUpcomingSundayWeekDates(new Date());
      const pollingDates = [...liveViewDates, ...upcomingWeekDates];

      isSchedulePollingInFlight.current = true;
      try {
        await ensureScheduleDataForDates(pollingDates, true);
      } finally {
        isSchedulePollingInFlight.current = false;
      }
    };

    intervalId = setInterval(pollScheduleData, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        pollScheduleData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    currentDate,
    viewMode,
    getDatesForCurrentView,
    ensureScheduleDataForDates,
  ]);

  // Calculate daily shift counts (confirmed/outstanding for assigned, confirmed/unconfirmed for availability)
  const dailyShiftCounts = useMemo(() => {
    const counts: {
      [dateKey: string]: {
        confirmed: number;
        outstanding: number;
        driverConfirmed: number;
        driverUnconfirmed: number;
        availabilitySubmitted: number;
        nonResponders: number;
        cancellationRequests: number;
      };
    } = {};

    // Initialize counts for all dates in the current view
    datesToDisplayKeys.forEach((dateKey) => {
      counts[dateKey] = {
        confirmed: 0,
        outstanding: 0,
        driverConfirmed: 0,
        driverUnconfirmed: 0,
        availabilitySubmitted: 0,
        nonResponders: 0,
        cancellationRequests: 0,
      };
    });

    datesToDisplayKeys.forEach((dateKey) => {
      let responders = 0;
      employees.forEach((employee) => {
        const daySchedule = employee.schedule[dateKey];
        if (daySchedule) {
          if (daySchedule.assigned) {
            // Manager confirmation is client-side
            if (daySchedule.assigned.isConfirmedByManager) {
              counts[dateKey].confirmed++;
            } else {
              counts[dateKey].outstanding++;
            }
          }
          if (daySchedule.availability) {
            responders++;
            if (isAvailabilityMarkedAvailable(daySchedule.availability)) {
              // Only include drivers who marked themselves available.
              const driverConfirmedStatus = parseDriverConfirmedStatus(
                daySchedule.availability?.is_driver_confirmed,
              );
              if (driverConfirmedStatus === true) {
                counts[dateKey].driverConfirmed++;
              } else if (driverConfirmedStatus === false) {
                counts[dateKey].driverUnconfirmed++;
              }
              counts[dateKey].availabilitySubmitted++;
            }
          }
          // 3. Logic for NEW Cancellation Requests
          // Check BOTH assigned shifts and availability shifts for 'pending' status
          const isAssignedPending =
            daySchedule?.assigned?.cancellation_status === "pending";
          const isAvailPending =
            daySchedule?.availability?.cancellation_status === "pending";

          if (isAssignedPending || isAvailPending) {
            counts[dateKey].cancellationRequests++;
          }
        }
      });

      counts[dateKey].nonResponders = loadedDateKeys.has(dateKey)
        ? Math.max(employees.length - responders, 0)
        : 0;
    });
    return counts;
  }, [employees, datesToDisplayKeys, loadedDateKeys]);

  // Memoized filtered and sorted employees
  const filteredAndSortedEmployees = useMemo(() => {
    let tempEmployees = employees.filter((employee) =>
      employee.first_name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Apply confirmation filter across all dates in the current view
    if (confirmationFilter !== "all") {
      tempEmployees = tempEmployees.filter((employee) => {
        // Check if the employee has at least one matching shift/vehicle within the current view's dates
        return datesToDisplayKeys.some((dateKey) => {
          const daySchedule = employee.schedule[dateKey];
          if (!daySchedule) return false;

          switch (confirmationFilter) {
            case "confirmed_manager":
              return daySchedule.assigned?.isConfirmedByManager === true;
            case "outstanding_manager":
              return (
                daySchedule.assigned &&
                daySchedule.assigned.isConfirmedByManager === false
              );
            case "hasVehicle":
              return daySchedule.assignedVehicle !== null;
            case "confirmed_driver":
              return (
                isAvailabilityMarkedAvailable(daySchedule.availability) &&
                parseDriverConfirmedStatus(
                  daySchedule.availability?.is_driver_confirmed,
                ) === true
              );
            case "unconfirmed_driver":
              return (
                isAvailabilityMarkedAvailable(daySchedule.availability) &&
                parseDriverConfirmedStatus(
                  daySchedule.availability?.is_driver_confirmed,
                ) === false
              );
            case "availability_submitted":
              return isAvailabilityMarkedAvailable(daySchedule.availability);
            case "cancellation_requests":
              // THE FIX: Return true if EITHER assigned or availability is pending cancellation
              return (
                daySchedule?.assigned?.cancellation_status === "pending" ||
                daySchedule?.availability?.cancellation_status === "pending"
              );
            default:
              return true;
          }
        });
      });
    }

    // Apply sorting
    tempEmployees.sort((a, b) => {
      if (sortKey === "name") {
        return sortOrder === "asc"
          ? a.first_name.localeCompare(b.first_name)
          : b.first_name.localeCompare(a.first_name);
      } else if (sortKey === "earliestShift" || sortKey === "latestShift") {
        const getShiftTime = (emp: Employee, type: "earliest" | "latest") => {
          let targetTime: Date | null = null;

          for (const dateKey of datesToDisplayKeys) {
            const assignedShift = emp.schedule[dateKey]?.assigned;
            if (assignedShift) {
              const [hours, minutes] = assignedShift.start_time
                .split(":")
                .map(Number);
              const shiftDate = new Date(dateKey);
              shiftDate.setHours(hours, minutes, 0, 0);

              if (targetTime === null) {
                targetTime = shiftDate;
              } else if (
                type === "earliest" &&
                shiftDate.getTime() < targetTime.getTime()
              ) {
                targetTime = shiftDate;
              } else if (
                type === "latest" &&
                shiftDate.getTime() > targetTime.getTime()
              ) {
                targetTime = shiftDate;
              }
            }
          }
          return targetTime
            ? targetTime.getTime()
            : type === "earliest"
              ? Infinity
              : -Infinity;
        };

        const timeA = getShiftTime(
          a,
          sortKey === "earliestShift" ? "earliest" : "latest",
        );
        const timeB = getShiftTime(
          b,
          sortKey === "earliestShift" ? "earliest" : "latest",
        );

        if (timeA === Infinity && timeB === Infinity) return 0; // Both no shifts
        if (timeA === Infinity) return 1; // A has no shifts, B does
        if (timeB === Infinity) return -1; // B has no shifts, A does

        if (timeA === -Infinity && timeB === -Infinity) return 0; // Both no shifts
        if (timeA === -Infinity) return 1; // A has no shifts, B does
        if (timeB === -Infinity) return -1; // B has no shifts, A does

        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      }
      return 0;
    });

    return tempEmployees;
  }, [
    employees,
    searchQuery,
    confirmationFilter,
    sortKey,
    sortOrder,
    datesToDisplayKeys,
  ]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 35; // Changed to 35 employees per page

  // Get current employees for pagination
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredAndSortedEmployees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee,
  );

  // Reset page to 1 when search query or filters/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    filteredAndSortedEmployees.length,
    confirmationFilter,
    sortKey,
    sortOrder,
  ]);

  const fetchGlobalCancelRequests = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/drivers_cancel_requests`);
      const data = await response.json();
      if (data.status === 1) {
        // 1. Map Shifts (add type 'shift')
        const shifts = (data.driverShifts || [])
          .filter((s: any) => s.cancellation_status === "pending")
          .map((s: any) => ({ ...s, type: "shift", id: s.assigned_shift_id }));

        // 2. Map Availability (add type 'availability')
        const availability = (data.driverAvailability || [])
          .filter((a: any) => a.cancellation_status === "pending")
          .map((a: any) => ({
            ...a,
            type: "availability",
            id: a.availability_id,
          }));

        // 3. Combine and Apply De-duplication Rule:
        // "If shift and availability exist for same date and driver, show only shift"
        const combinedMap = new Map();

        // We process Availability first, then Shifts will overwrite them if the key matches
        [...availability, ...shifts].forEach((item) => {
          const driverName = `${item.first_name}_${item.surname}`;
          const key = `${driverName}_${item.shift_date}`;

          const existing = combinedMap.get(key);

          // If nothing exists, or if the new item is a 'shift', we store/overwrite it
          // This ensures 'shift' always wins over 'availability' for the same driver/date
          if (!existing || item.type === "shift") {
            combinedMap.set(key, item);
          }
        });

        // 4. Convert back to array and Sort Date-wise (Earliest first)
        const finalRequests = Array.from(combinedMap.values()).sort((a, b) => {
          return (
            new Date(a.shift_date).getTime() - new Date(b.shift_date).getTime()
          );
        });

        setGlobalCancelRequests(finalRequests);
      }
    } catch (error) {
      console.error("Error fetching global cancellations:", error);
    }
  }, [API_BASE_URL]);

  // 3. Initial fetch on mount
  useEffect(() => {
    fetchGlobalCancelRequests();
  }, [fetchGlobalCancelRequests]);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) =>
      Math.min(
        prev + 1,
        Math.max(
          1,
          Math.ceil(filteredAndSortedEmployees.length / employeesPerPage),
        ),
      ),
    );
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  /**
   * Handles dropping a shift onto an employee's schedule cell.
   * @param targetEmployeeId The ID of the employee the shift is dropped on.
   * @param targetDate The date the shift is dropped on.
   * @param droppedShift The shift object being dropped.
   * @param sourceEmployeeId The original employee ID if the shift was moved from the grid.
   * @param sourceDate The original date if the shift was moved from the grid.
   */
  const executeDropShift = useCallback(
    async (serviceId: number | string) => {
      if (!pendingAssignment) return;
      const {
        targetEmployeeId,
        targetDate,
        droppedShift,
        sourceEmployeeId,
        sourceDate,
      } = pendingAssignment;

      try {
        const response = await fetch(`${API_BASE_URL}/assigne_driver_shift`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shift_id: droppedShift.id, // Ensure shift_id is sent
            driver_id: targetEmployeeId,
            shift_date: targetDate,
            service_id: serviceId,
          }),
        });
        const data = await response.json();
        if (data.status === 1) {
          console.log("Shift assigned successfully:", data.message);
          // Update local state after successful API call
          setEmployees((prevEmployees) => {
            const newEmployees = prevEmployees.map((emp) => {
              const newSchedule = { ...emp.schedule };

              // If the shift was moved from another cell within the grid, clear the old slot
              if (
                sourceEmployeeId &&
                sourceDate &&
                emp.id === sourceEmployeeId
              ) {
                newSchedule[sourceDate] = {
                  ...newSchedule[sourceDate],
                  assigned: null, // Assuming only assigned shifts are moved this way
                };
              }
              return { ...emp, schedule: newSchedule };
            });

            // Add the shift to the new target position using droppedShift's data
            return newEmployees.map((emp) => {
              if (emp.id === targetEmployeeId) {
                const currentDaySchedule = emp.schedule[targetDate] || {};
                return {
                  ...emp,
                  schedule: {
                    ...emp.schedule,
                    [targetDate]: {
                      ...currentDaySchedule,
                      assigned: {
                        id: droppedShift.id, // Original shift ID
                        shift_name: droppedShift.shift_name,
                        start_time: droppedShift.start_time,
                        end_time: droppedShift.end_time,
                        shift_status: droppedShift.shift_status,
                        shift_type: droppedShift.shift_type,
                        assigned_shift_id: data.assigned_shift_id, // Crucial ID from API response
                        isConfirmedByManager: false, // Default client-side state
                        service_id: serviceId,
                      },
                    },
                  },
                };
              }
              return emp;
            });
          });
          // Clear cache after successful assignment
          cachedEmployeeData.current = {};
          // Refresh daily preview data
          fetchDailyPreviewData(new Date(targetDate), { silent: true });
        } else {
          console.error("Failed to assign shift:", data.message);
          alert(`Failed to assign shift: ${data.message}`); // Provide user feedback
        }
      } catch (error) {
        console.error("Error assigning shift:", error);
        alert("Error assigning shift. Please try again.");
      } finally {
        setIsServiceModalOpen(false);
        setPendingAssignment(null);
      }
    },
    [pendingAssignment, fetchDailyPreviewData],
  );

  const handleDropShift = useCallback(
    (
      targetEmployeeId: number,
      targetDate: string,
      droppedShift: Shift,
      sourceEmployeeId?: number,
      sourceDate?: string,
    ) => {
      setPendingAssignment({
        targetEmployeeId,
        targetDate,
        droppedShift,
        sourceEmployeeId,
        sourceDate,
      });
      setIsServiceModalOpen(true);
    },
    [],
  );

  /**
   * Adds a new shift to the list of available shifts via API.
   * @param shift The new shift to add.
   */
  const handleAddShift = useCallback(
    async (
      newShiftData: Omit<
        Shift,
        | "id"
        | "is_driver_confirmed"
        | "isConfirmedByManager"
        | "assigned_shift_id"
      >,
    ) => {
      try {
        const response = await fetch(`${API_BASE_URL}/add_driver_shift`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shift_name: newShiftData.shift_name,
            start_time: newShiftData.start_time,
            end_time: newShiftData.end_time,
            shift_status: newShiftData.shift_status,
            shift_type: newShiftData.shift_type,
          }),
        });
        const data = await response.json();
        if (data.status === 1) {
          console.log("Shift added successfully:", data.message);
          // Add the new shift to local state with the ID from API
          setAvailableShifts((prev) => [
            ...prev,
            { ...newShiftData, id: data.shift_info.id },
          ]); // Use data.shift_info.id
          // Clear cache after adding a new shift (as it might affect schedule views)
          cachedEmployeeData.current = {};
        } else {
          console.error("Failed to add shift:", data.message);
          alert(`Failed to add shift: ${data.message}`);
        }
      } catch (error) {
        console.error("Error adding shift:", error);
        alert("Error adding shift. Please try again.");
      }
    },
    [],
  );

  /**
   * Deletes a shift from either available shifts or an employee's schedule via API.
   * @param shiftId The ID of the shift to delete.
   * @param employeeId Optional: The employee ID if deleting from a schedule.
   * @param date Optional: The date if deleting from a schedule.
   * @param type Optional: 'shift' or 'vehicle' to specify what to remove from grid.
   */
  const handleDeleteShift = useCallback(
    async (
      shiftId: number,
      employeeId?: number,
      date?: string,
      type?: "shift" | "vehicle",
    ) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/delete_driver_shift/${shiftId}`,
          {
            method: "DELETE",
          },
        );
        const data = await response.json();
        if (data.status === 1) {
          console.log("Shift deleted successfully:", data.message);
          // Update local state after successful API call
          setEmployees((prevEmployees) =>
            prevEmployees.map((emp) => {
              if (emp.id === employeeId && date) {
                const newSchedule = { ...emp.schedule };
                if (newSchedule[date]) {
                  if (
                    type === "shift" &&
                    newSchedule[date].assigned?.id === shiftId
                  ) {
                    newSchedule[date] = {
                      ...newSchedule[date],
                      assigned: null,
                    };
                  }
                }
                return { ...emp, schedule: newSchedule };
              }
              return emp;
            }),
          );

          setAvailableShifts((prevShifts) =>
            prevShifts.filter((s) => s.id !== shiftId),
          );
          // Clear cache after deleting a shift
          cachedEmployeeData.current = {};
        } else {
          console.error("Failed to delete shift:", data.message);
          alert(`Failed to delete shift: ${data.message}`);
        }
      } catch (error) {
        console.error("Error deleting shift:", error);
        alert("Error deleting shift. Please try again.");
      }
    },
    [],
  );

  /**
   * Toggles the manager confirmation status for an assigned shift via API.
   * @param employeeId The ID of the employee whose shift is being confirmed.
   * @param date The date of the shift.
   * @param assignedShiftId The assigned_shift_id of the shift to confirm.
   */
  const handleConfirmShift = useCallback(
    async (employeeId: number, date: string, assignedShiftId: number) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/manager_confirmed_driver_shift/${assignedShiftId}`,
          {
            method: "PUT", // Assuming PUT for updating status
            headers: {
              "Content-Type": "application/json",
            },
            // No body needed if the API just toggles status based on ID
          },
        );
        const data = await response.json();
        if (data.status === 1) {
          console.log("Shift confirmation updated:", data.message);
          setEmployees((prevEmployees) =>
            prevEmployees.map((emp) => {
              if (emp.id === employeeId) {
                const newSchedule = { ...emp.schedule };
                if (
                  newSchedule[date]?.assigned?.assigned_shift_id ===
                  assignedShiftId
                ) {
                  newSchedule[date] = {
                    ...newSchedule[date],
                    assigned: {
                      ...newSchedule[date].assigned!,
                      isConfirmedByManager:
                        !newSchedule[date].assigned?.isConfirmedByManager, // Toggle client-side state
                    },
                  };
                }
                return { ...emp, schedule: newSchedule };
              }
              return emp;
            }),
          );
          // Clear cache after confirming a shift
          cachedEmployeeData.current = {};
        } else {
          console.error("Failed to confirm shift:", data.message);
          alert(`Failed to confirm shift: ${data.message}`);
        }
      } catch (error) {
        console.error("Error confirming shift:", error);
        alert("Error confirming shift. Please try again.");
      }
    },
    [],
  );

  /**
   * Triggers the confirmation modal when driver availability status is clicked.
   * @param employeeId The ID of the employee whose availability status is being changed.
   * @param date The date key of the availability.
   * @param availabilityId The ID of the driver availability.
   */
  const handleDriverConfirmAvailability = useCallback(
    (employeeId: number, date: string, availabilityId: number) => {
      if (!availabilityId) return;

      const employee = employees.find((emp) => emp.id === employeeId);
      const currentAvailability = employee?.schedule?.[date]?.availability;
      if (!isAvailabilityMarkedAvailable(currentAvailability)) return;

      const isCurrentlyConfirmed =
        parseDriverConfirmedStatus(currentAvailability?.is_driver_confirmed) === true;
      const driverName = employee ? `${employee.first_name} ${employee.surname}`.trim() : "";

      setConfirmAvailabilityModal({
        isOpen: true,
        employeeId,
        date,
        availabilityId,
        isConfirmed: isCurrentlyConfirmed,
        driverName,
      });
    },
    [employees],
  );

  /**
   * Executes the API call and state update when confirmed in the modal.
   */
  const handleExecuteDriverAvailabilityToggle = useCallback(async () => {
    if (!confirmAvailabilityModal) return;
    const { employeeId, date, availabilityId, isConfirmed } = confirmAvailabilityModal;

    try {
      if (isConfirmed) {
        await SchedulingApi.unconfirmDriverAvailability(availabilityId);
      } else {
        await SchedulingApi.confirmDriverAvailability(availabilityId);
      }

      const newIsConfirmed = isConfirmed ? "0" : "1";

      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) => {
          if (emp.id === employeeId && emp.schedule?.[date]) {
            const currentDaySched = emp.schedule[date];
            return {
              ...emp,
              schedule: {
                ...emp.schedule,
                [date]: {
                  ...currentDaySched,
                  availability: currentDaySched.availability
                    ? {
                      ...currentDaySched.availability,
                      is_driver_confirmed: newIsConfirmed,
                    }
                    : null,
                },
              },
            };
          }
          return emp;
        }),
      );
    } catch (err: any) {
      console.error("Error toggling driver availability confirmation:", err);
      alert(err.message || "Failed to update driver availability confirmation.");
    } finally {
      setConfirmAvailabilityModal(null);
    }
  }, [confirmAvailabilityModal]);

  /**
   * Opens the vehicle assignment modal.
   * @param employeeId The ID of the employee for whom the vehicle is being assigned.
   * @param date The date for which the vehicle is being assigned.
   * @param currentVehicle The currently assigned vehicle for this employee and date.
   * @param allocatedVehiclesForDate A list of all vehicles already allocated on this specific date across all employees.
   */
  const handleOpenVehicleModal = useCallback(
    (
      employeeId: number,
      date: string,
      currentVehicle: AssignedVehicle | null,
      allocatedVehiclesForDate: AssignedVehicle[],
    ) => {
      setSelectedEmployeeForVehicle(employeeId);
      setSelectedDateForVehicle(date);
      setCurrentVehicleInModal(currentVehicle);
      setAllocatedVehiclesForModalDate(allocatedVehiclesForDate); // Pass allocated vehicles
      setIsVehicleModalOpen(true);
    },
    [],
  );

  /**
   * Assigns a vehicle to an employee for a specific date via API.
   */
  const handleAssignVehicle = useCallback(
    async (vehicle: AssignedVehicle | null) => {
      if (selectedEmployeeForVehicle && selectedDateForVehicle) {
        if (vehicle === null) {
          // Unassign vehicle
          const employee = employees.find(
            (e) => e.id === selectedEmployeeForVehicle,
          );
          const assignedVehicleId =
            employee?.schedule[selectedDateForVehicle]?.assignedVehicle
              ?.assigned_vehicle_id;
          if (assignedVehicleId) {
            await handleRemoveAssignedVehicle(
              selectedEmployeeForVehicle,
              selectedDateForVehicle,
              assignedVehicleId,
            );
          }
        } else {
          try {
            const response = await fetch(
              `${API_BASE_URL}/assign_driver_vehicle`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  vehicle_id: vehicle.id,
                  driver_id: selectedEmployeeForVehicle,
                  assignd_date: selectedDateForVehicle,
                }),
              },
            );
            const data = await response.json();
            if (data.status === 1) {
              console.log(
                "Vehicle assigned successfully:",
                data.message,
                "Assigned Vehicle ID:",
                data.assigned_vehicle_id,
              ); // Log the ID
              setEmployees((prevEmployees) =>
                prevEmployees.map((emp) => {
                  if (emp.id === selectedEmployeeForVehicle) {
                    const currentDaySchedule =
                      emp.schedule[selectedDateForVehicle] || {};
                    const newAssignedVehicle = vehicle ? { ...vehicle } : null; // Create a fresh object
                    if (
                      newAssignedVehicle &&
                      typeof data.assigned_vehicle_id === "number"
                    ) {
                      // Ensure it's a number
                      newAssignedVehicle.assigned_vehicle_id =
                        data.assigned_vehicle_id;
                    }
                    return {
                      ...emp,
                      schedule: {
                        ...emp.schedule,
                        [selectedDateForVehicle]: {
                          ...currentDaySchedule,
                          assignedVehicle: newAssignedVehicle,
                        },
                      },
                    };
                  }
                  return emp;
                }),
              );
              // Clear cache after successful vehicle assignment
              cachedEmployeeData.current = {};
            } else {
              console.error("Failed to assign vehicle:", data.message);
              alert(`Failed to assign vehicle: ${data.message}`);
            }
          } catch (error) {
            console.error("Error assigning vehicle:", error);
            alert("Error assigning vehicle. Please try again.");
          }
        }
      }
      setIsVehicleModalOpen(false);
      setSelectedEmployeeForVehicle(null);
      setSelectedDateForVehicle(null);
      setCurrentVehicleInModal(null);
      setAllocatedVehiclesForModalDate([]);
    },
    [
      selectedEmployeeForVehicle,
      selectedDateForVehicle,
      employees,
      handleRemoveAssignedVehicle,
    ],
  ); // Added handleRemoveAssignedVehicle to dependency array

  /**
   * Removes an assigned shift from an employee for a specific date via API.
   * This is a separate handler for clarity, though `handleDeleteShift` could be adapted.
   */
  const handleRemoveAssignedShift = useCallback(
    async (employeeId: number, date: string, assignedShiftId: number) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/removed_driver_shift/${assignedShiftId}`,
          {
            method: "DELETE",
          },
        );
        const data = await response.json();
        if (data.status === 1) {
          console.log("Assigned shift removed successfully:", data.message);
          setEmployees((prevEmployees) =>
            prevEmployees.map((emp) => {
              if (emp.id === employeeId) {
                const newSchedule = { ...emp.schedule };
                if (
                  newSchedule[date]?.assigned?.assigned_shift_id ===
                  assignedShiftId
                ) {
                  newSchedule[date] = { ...newSchedule[date], assigned: null };
                }
                return { ...emp, schedule: newSchedule };
              }
              return emp;
            }),
          );
          // Clear cache after removing an assigned shift
          cachedEmployeeData.current = {};
          // Refresh daily preview data
          fetchDailyPreviewData(new Date(date), { silent: true });
        } else {
          console.error("Failed to remove assigned shift:", data.message);
          alert(`Failed to remove assigned shift: ${data.message}`);
        }
      } catch (error) {
        console.error("Error removing assigned shift:", error);
        alert("Error removing assigned shift. Please try again.");
      }
    },
    [fetchDailyPreviewData],
  );

  const handleViewModeChange = useCallback(
    (mode: "day" | "week" | "month") => {
      const targetDate = mode === "day" ? new Date() : new Date(currentDate);

      if (mode === "day") {
        setCurrentDate(targetDate);
      }

      setViewMode(mode);

      const targetDates =
        mode === "day"
          ? getDayDates(targetDate)
          : mode === "week"
            ? getWeekDates(targetDate)
            : getMonthDates(targetDate);

      ensureScheduleDataForDates(targetDates);
    },
    [currentDate, ensureScheduleDataForDates],
  );

  const handleDaySummaryIconClick = useCallback(
    (filter: ConfirmationFilter, date: Date) => {
      const clickedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      setConfirmationFilter(filter);
      setCurrentDate(clickedDate);
      setViewMode("day");
    },
    [],
  );

  const handleOpenUnconfirmedInfo = useCallback(() => {
    const weekDates = getUpcomingSundayWeekDates(new Date());
    ensureScheduleDataForDates(weekDates);
    setIsUnconfirmedPanelOpen(true);
  }, [ensureScheduleDataForDates]);

  const [dailyPreviewTargetDate, setDailyPreviewTargetDate] = useState<Date | null>(
    () => {
      try {
        const savedNextDate = localStorage.getItem("lastSavedRosterNextDate");
        if (savedNextDate) {
          const [y, m, d] = savedNextDate.split("-").map(Number);
          if (y && m && d) {
            return new Date(y, m - 1, d);
          }
        }
      } catch (e) { }
      return null;
    },
  );

  const handleOpenDailyPreview = useCallback(async () => {
    setIsDailyPreviewLoading(true);
    setDailyPreviewError(null);
    setIsDailyPreviewModalOpen(true);

    let targetDateObj: Date | null = null;
    try {
      const res = await SchedulingApi.getExcelPreviewDate();
      if (res && res.preview_date) {
        const [y, m, d] = res.preview_date.split("-").map(Number);
        if (y && m && d) {
          targetDateObj = new Date(y, m - 1, d);
        }
      }
    } catch (e) {
      console.error("Failed to fetch excel preview date:", e);
    }

    if (!targetDateObj) {
      try {
        const savedNextDate = localStorage.getItem("lastSavedRosterNextDate");
        if (savedNextDate) {
          const [y, m, d] = savedNextDate.split("-").map(Number);
          if (y && m && d) {
            targetDateObj = new Date(y, m - 1, d);
          }
        }
      } catch (e) { }
    }

    const finalDate = targetDateObj || currentDate || new Date();
    setDailyPreviewTargetDate(finalDate);
    setCurrentDate(finalDate);
    fetchDailyPreviewData(finalDate);
  }, [currentDate, fetchDailyPreviewData]);

  const handleDailyPreviewDateChange = useCallback((dateStr: string) => {
    if (!dateStr) {
      setDailyPreviewTargetDate(null);
      return;
    }
    const [y, m, d] = dateStr.split("-").map(Number);
    if (y && m && d) {
      const nextDate = new Date(y, m - 1, d);
      setDailyPreviewTargetDate(nextDate);
      setCurrentDate(nextDate);
    }
  }, []);

  useEffect(() => {
    if (!isDailyPreviewModalOpen) return;
    fetchDailyPreviewData(dailyPreviewTargetDate);
  }, [isDailyPreviewModalOpen, dailyPreviewTargetDate, fetchDailyPreviewData]);

  useEffect(() => {
    if (!isDailyPreviewModalOpen) return;
    const intervalId = setInterval(() => {
      fetchDailyPreviewData(dailyPreviewTargetDate, { silent: true });
    }, 30000);

    return () => clearInterval(intervalId);
  }, [isDailyPreviewModalOpen, dailyPreviewTargetDate, fetchDailyPreviewData]);

  /**
   * Navigates to the previous time period based on the current view mode.
   */
  const handlePrev = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (viewMode === "day") {
        newDate.setDate(newDate.getDate() - 1);
      } else if (viewMode === "week") {
        newDate.setDate(newDate.getDate() - 7);
      } else if (viewMode === "month") {
        newDate.setMonth(newDate.getMonth() - 1);
      }

      // Fetch data for the new range if not cached
      const newRangeDates =
        viewMode === "day"
          ? getDayDates(newDate)
          : viewMode === "week"
            ? getWeekDates(newDate)
            : getMonthDates(newDate);
      ensureScheduleDataForDates(newRangeDates);

      return newDate;
    });
  };

  /**
   * Navigates to the next time period based on the current view mode.
   */
  const handleNext = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (viewMode === "day") {
        newDate.setDate(newDate.getDate() + 1);
      } else if (viewMode === "week") {
        newDate.setDate(newDate.getDate() + 7);
      } else if (viewMode === "month") {
        newDate.setMonth(newDate.getMonth() + 1);
      }

      // Fetch data for the new range if not cached
      const newRangeDates =
        viewMode === "day"
          ? getDayDates(newDate)
          : viewMode === "week"
            ? getWeekDates(newDate)
            : getMonthDates(newDate);
      ensureScheduleDataForDates(newRangeDates);

      return newDate;
    });
  };

  // Callback to set dragging state (memoized for performance)
  const handleDragStart = useCallback(() => setIsDraggingShift(true), []);
  const handleDragEnd = useCallback(() => setIsDraggingShift(false), []);

  /**
   * Handles downloading various reports as CSV.
   */
  const handleDownloadReport = useCallback(
    (reportType: ReportType) => {
      let content = "";
      let filename = "";
      const mimeType = "text/csv"; // Changed to CSV MIME type

      const escapeCsv = (value: any) => {
        if (value === null || value === undefined) return "";
        let stringValue = String(value);
        // If the string contains a comma, double quote, or newline, enclose it in double quotes and escape existing double quotes
        if (
          stringValue.includes(",") ||
          stringValue.includes('"') ||
          stringValue.includes("\n")
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const getReportDatesForDownload = (type: ReportType, baseDate: Date) => {
        if (type === "daySummary" || type === "assignedVehicleDaySummary") {
          return getDayDates(baseDate);
        }
        if (type === "weekSummary" || type === "assignedVehicleWeekSummary") {
          return getWeekDates(baseDate);
        }
        if (type === "monthSummary" || type === "assignedVehicleMonthSummary") {
          return getMonthDates(baseDate);
        }
        return [];
      };

      // Use currentDate as the base for report date range, not the entire cached month
      const reportDates = getReportDatesForDownload(reportType, currentDate);
      const dateHeaders = reportDates.map((d) => formatDate(d, "key"));

      if (reportType.includes("Summary")) {
        if (reportType.includes("assignedVehicle")) {
          // Assigned Vehicle Day/Week/Month Summary
          const title = `Assigned Vehicle ${reportType
            .replace("assignedVehicle", "")
            .replace("Summary", "")} Summary`;
          filename = `${title.replace(/\s/g, "_")}_${formatDate(
            currentDate,
            "key",
          )}.csv`;

          const header = [
            "Employee Name",
            ...dateHeaders.map((d) => `${d} (Assigned Vehicle)`),
          ];
          content += header.map(escapeCsv).join(",") + "\n";

          filteredAndSortedEmployees.forEach((employee) => {
            const row = [escapeCsv(employee.first_name)];
            let hasAnyValidVehicleOrAvailableDay = false;
            reportDates.forEach((date) => {
              const dateKey = formatDate(date, "key");
              const daySchedule = employee.schedule[dateKey] || {};

              const isOffOrUnavailable =
                daySchedule?.availability?.shift_status?.trim().toLowerCase() === "unavailable" ||
                daySchedule?.availability?.shift_status?.trim().toLowerCase() === "on leave";

              let cellValue = "N/A";
              if (isOffOrUnavailable) {
                cellValue = daySchedule.availability?.shift_status?.trim() || "Unavailable";
              } else if (daySchedule.assignedVehicle) {
                cellValue = `${daySchedule.assignedVehicle.name} (${daySchedule.assignedVehicle.number})`;
                hasAnyValidVehicleOrAvailableDay = true;
              } else {
                hasAnyValidVehicleOrAvailableDay = true;
              }
              row.push(escapeCsv(cellValue));
            });

            // If we are filtering by availability_submitted, and the driver has no available/working days in this range, exclude the row entirely!
            if (confirmationFilter === "availability_submitted" && !hasAnyValidVehicleOrAvailableDay) {
              return;
            }

            content += row.join(",") + "\n";
          });
        } else {
          // Day/Week/Month Summary (full) - Fixed to include all details
          const title = `${reportType.replace("Summary", "")} Summary`;
          filename = `${title.replace(/\s/g, "_")}_${formatDate(
            currentDate,
            "key",
          )}.csv`;

          // Updated header for comprehensive data
          const header = [
            "Employee Name",
            "Date",
            "Assigned Vehicle",
            "Manager Confirmed",
            "Shift Name",
            "Shift Start Time",
            "Shift End Time",
          ];
          content += header.map(escapeCsv).join(",") + "\n";

          filteredAndSortedEmployees.forEach((employee) => {
            reportDates.forEach((date) => {
              const dateKey = formatDate(date, "key");
              const daySchedule = employee.schedule[dateKey];

              if (!daySchedule) return;

              const isOffOrUnavailable =
                daySchedule?.availability?.shift_status?.trim().toLowerCase() === "unavailable" ||
                daySchedule?.availability?.shift_status?.trim().toLowerCase() === "on leave";

              if (isOffOrUnavailable) {
                return; // Skip this date for this employee if they submitted off/unavailable
              }

              // Only add a row if there's an assigned shift or assigned vehicle for this day
              if (daySchedule?.assigned || daySchedule?.assignedVehicle) {
                const rowParts = [
                  escapeCsv(employee.first_name),
                  escapeCsv(dateKey),
                  escapeCsv(
                    daySchedule.assignedVehicle
                      ? `${daySchedule.assignedVehicle.name} (${daySchedule.assignedVehicle.number})`
                      : "N/A",
                  ),
                  // Manager confirmation is client-side
                  escapeCsv(
                    daySchedule.assigned?.isConfirmedByManager ? "Yes" : "No",
                  ),
                  escapeCsv(daySchedule.assigned?.shift_name || "N/A"),
                  escapeCsv(daySchedule.assigned?.start_time || "N/A"),
                  escapeCsv(daySchedule.assigned?.end_time || "N/A"),
                ];
                content += rowParts.join(",") + "\n";
              }
            });
          });
        }
      } else if (reportType === "workingDriversRoster") {
        // Working Drivers Roster (Workforce Roster)
        // This report lists all employees who have any assigned shift, assigned vehicle, or availability for the current day.
        const title = "Working Drivers Roster";
        filename = `${title.replace(/\s/g, "_")}_${formatDate(
          currentDate,
          "key",
        )}.csv`;

        const header = [
          "Employee Name",
          "Assigned Vehicle",
          "Assigned Shift (Today)",
          "Manager Confirmed",
          "Driver Confirmed Availability",
        ];
        content += header.map(escapeCsv).join(",") + "\n";
        const todayKey = formatDate(currentDate, "key");

        filteredAndSortedEmployees.forEach((employee) => {
          const daySchedule = employee.schedule[todayKey];
          if (!daySchedule) return;

          const isOffOrUnavailable =
            daySchedule?.availability?.shift_status?.trim().toLowerCase() === "unavailable" ||
            daySchedule?.availability?.shift_status?.trim().toLowerCase() === "on leave";

          if (isOffOrUnavailable) {
            return; // Skip this driver if they are unavailable or off-duty today
          }

          if (
            daySchedule?.assigned ||
            daySchedule?.assignedVehicle ||
            isAvailabilityMarkedAvailable(daySchedule?.availability)
          ) {
            const assignedShift = daySchedule.assigned
              ? `${daySchedule.assigned.shift_name} ${daySchedule.assigned.start_time}-${daySchedule.assigned.end_time}`
              : "N/A";
            const managerConfirmed = daySchedule.assigned?.isConfirmedByManager
              ? "Yes"
              : "No";
            // Access properties from AssignedVehicle object
            const assignedVehicle = daySchedule.assignedVehicle
              ? `${daySchedule.assignedVehicle.name} (${daySchedule.assignedVehicle.number})`
              : "N/A";
            const driverConfirmedAvailability =
              parseDriverConfirmedStatus(
                daySchedule.availability?.is_driver_confirmed,
              ) === true
                ? "Yes"
                : "No";
            content += `${escapeCsv(employee.first_name)},${escapeCsv(
              assignedVehicle,
            )},${escapeCsv(assignedShift)},${escapeCsv(
              managerConfirmed,
            )},${escapeCsv(driverConfirmedAvailability)}\n`;
          }
        });
      }

      downloadFile(filename, content, mimeType);
      setIsDownloadModalOpen(false); // Close modal after download
    },
    [filteredAndSortedEmployees, currentDate, viewMode, availableVehicles, confirmationFilter],
  );

  // Inside SchedulingPage component
  const pendingCancellations = useMemo(() => {
    const requests: any[] = [];
    console.log("Checking employees for cancellations:", employees); // DEBUG LOG

    employees.forEach((emp) => {
      if (!emp.schedule) return;

      Object.entries(emp.schedule).forEach(([date, dayData]) => {
        // Check assigned shifts
        if (dayData.assigned?.cancellation_status === "pending") {
          requests.push({
            ...dayData.assigned,
            driver_name: emp.first_name,
            driver_id: emp.id,
            date,
            type: "shift",
          });
        }
        // Check availability
        if (dayData.availability?.cancellation_status === "pending") {
          requests.push({
            ...dayData.availability,
            driver_name: emp.first_name,
            driver_id: emp.id,
            date,
            type: "availability",
          });
        }
      });
    });

    console.log("Found requests:", requests.length); // DEBUG LOG
    return requests;
  }, [employees]);

  const unconfirmedWeekAnchor = formatDate(new Date(), "key");
  const unconfirmedRangeDates = useMemo(() => {
    return getUpcomingSundayWeekDates(new Date());
  }, [unconfirmedWeekAnchor]);

  const unconfirmedRangeLabel = useMemo(
    () =>
      `${formatDate(unconfirmedRangeDates[0], "full")} - ${formatDate(
        unconfirmedRangeDates[unconfirmedRangeDates.length - 1],
        "full",
      )}`,
    [unconfirmedRangeDates],
  );

  const isUnconfirmedRangeLoaded = useMemo(() => {
    const dateKeys = unconfirmedRangeDates.map((date) =>
      formatDate(date, "key"),
    );
    return dateKeys.every((key) => loadedDateKeys.has(key));
  }, [unconfirmedRangeDates, loadedDateKeys]);

  const unconfirmedRowsForRange = useMemo(() => {
    if (!isUnconfirmedRangeLoaded) return [];
    const dateKeys = unconfirmedRangeDates.map((date) =>
      formatDate(date, "key"),
    );

    return employees
      .map((emp) => {
        const submissionCount = dateKeys.reduce((count, key) => {
          if (emp.schedule[key]?.availability) return count + 1;
          return count;
        }, 0);

        // const fullName = [emp?.only_first_name, emp?.surname]
        //   .filter(Boolean)
        //   .join(" ");
        // console.log('fullName',fullName);
        return {
          name: `${emp?.only_first_name} ${emp?.surname}`,
          submissionCount,
        };
        // return { name: fullName || `Driver #${emp.id}`, submissionCount };
      })
      .filter((entry) => entry.submissionCount === 0)
      .map((entry) => ({ name: entry.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [employees, isUnconfirmedRangeLoaded, unconfirmedRangeDates]);

  const handleProcessCancellation = useCallback(
    async (
      id: number,
      type: "shift" | "availability",
      action: "accepted" | "rejected",
      note: string,
    ) => {
      try {
        // Map internal 'id' back to the specific API keys
        const payload: any = {
          cancellation_status: action, // 'accepted' or 'rejected'
          admin_reply: note,
        };

        if (type === "shift") {
          payload.assigned_shift_id = id;
        } else {
          payload.availability_id = id;
        }

        const response = await fetch(
          `${API_BASE_URL}/update_driver_cancel_request_status`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        const result = await response.json();

        if (result.status === 1) {
          // 1. Close Modal and Panel
          setIsCancelModalOpen(false);
          setSelectedCancelRequest(null);

          // 2. Refresh the global list (Badge count and Sidebar)
          fetchGlobalCancelRequests();

          // 3. Refresh the grid data
          // (Optional: Clear cache first if you use a caching mechanism)
          const dates = getDatesToDisplay();
          fetchDriversSchedule(
            formatDate(dates[0], "key"),
            formatDate(dates[dates.length - 1], "key"),
          );

          alert(`Request ${action} successfully.`);
        } else {
          alert(result.message || "Failed to update request status.");
        }
      } catch (error) {
        console.error("Error updating cancellation:", error);
      }
    },
    [fetchGlobalCancelRequests, fetchDriversSchedule, getDatesToDisplay],
  );

  const handleOpenCancelModal = (req: any) => {
    console.log("req", req);
    setSelectedCancelRequest({
      id: req.id,
      type: req.type,
      cancel_reason: req.cancel_reason, // Use cancel_reason here
      shift_date: req.shift_date,
      start_time: req.start_time || req.availability_start_time,
      first_name: req.first_name,
      middle_name: req.middle_name,
      surname: req.surname,
      shift_name: req.shift_name,
      availability_name: req.availability_name,
    });
    setIsCancelModalOpen(true);
  };

  // --- Debugging Logs ---
  console.log("--- Component Render Cycle ---");
  console.log("1. employees state:", employees);
  console.log("2. searchQuery:", searchQuery);
  console.log("3. confirmationFilter:", confirmationFilter);
  console.log("4. datesToDisplayKeys:", datesToDisplayKeys);
  console.log("5. filteredAndSortedEmployees:", filteredAndSortedEmployees);

  console.log("6. currentPage:", currentPage);
  console.log("7. employeesPerPage:", employeesPerPage);
  console.log("8. currentEmployees (sliced for display):", currentEmployees);
  console.log("----------------------------");

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={`${styles.schedulingPage} ${(isSidebarOpen || isVehicleSidebarOpen || isUnconfirmedPanelOpen) &&
          isMobile
          ? styles.sidebarOpen
          : ""
          }`}
      >
        <div className={styles.container}>
          {/* ── TAB NAVIGATION ── */}
          <nav className={styles.pageTabNav} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', width: '33.33%' }}>
              <button
                className={`${styles.pageTabBtn} ${activeTab === 'scheduling' ? styles.pageTabActive : ''} text-xl `}
                 onClick={() => {
					setActiveTab("scheduling");
					refreshDriversSchedule();
				  }}
              >
                Scheduling Grid
              </button>
              <button
                className={`${styles.pageTabBtn} ${activeTab === 'rostering' ? styles.pageTabActive : ''}`}
                onClick={() => setActiveTab('rostering')}
              >
                Rostering Overview
              </button>
              <button
                className={`${styles.pageTabBtn} ${activeTab === 'service-config' ? styles.pageTabActive : ''}`}
                onClick={() => setActiveTab('service-config')}
              >
                Service Configurations
              </button>
            </div>
            <div style={{ display: 'flex', gap: '30px', width: '33.33%', justifyContent: 'center' }}>
              <button
                onClick={handleManageShifts}
                className={`${styles.manageShiftsButton} ${styles.infoButton}`}
                title="Manage Shifts"
              >
                <img
                  src={ManageShiftsIcon}
                  alt="Manage Shifts"
                  className={styles.actionAssetIcon}
                />
              </button>
              <button
                onClick={handleManageVehicles}
                className={`${styles.manageShiftsButton} ${styles.infoButton}`}
                title="Fleet Management"
              >
                <img
                  src={FleetManagementIcon}
                  alt="Fleet Management"
                  className={styles.actionAssetIcon}
                />
              </button>
              <button
                onClick={handleOpenPreviewModal}
                className={`${styles.manageShiftsButton} ${styles.previewButton} ${styles.headerActionButton}`}
                title="Daily Excel Preview"
              >
                <Eye />
              </button>
              <button
                onClick={handleonOpenInbox}
                className={`${styles.manageShiftsButton} ${styles.infoButton} ${styles.headerActionButton}`}
                title="Notification Logs"
              >
                <MessageSquareMore />
              </button>
              <button
                onClick={handleOpenUnconfirmedInfoPanel}
                className={`${styles.manageShiftsButton} ${styles.infoButton} ${styles.headerActionButton}`}
                title="Availability Outstanding"
              >
                <Info />
              </button>
            </div>
            <div style={{ color: '#1c1c1e', width: '33.33%', textAlign: 'right' }}>
              <NotificationBell />
            </div>
          </nav>
          {/* ── TAB: SCHEDULING GRID (existing) ── */}
          {activeTab === 'scheduling' && (
            <>
              <Header
                currentDate={currentDate}
                onPrev={handlePrev}
                onNext={handleNext}
                onManageShifts={handleManageShifts}
                onManageVehicles={handleManageVehicles}
                onOpenPreviewModal={handleOpenDailyPreview}
                onOpenUnconfirmedInfoPanel={handleOpenUnconfirmedInfo}
                onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterMode={filterMode}
                onFilterChange={setFilterMode}
                confirmationFilter={confirmationFilter}
                onConfirmationFilterChange={setConfirmationFilter}
                sortKey={sortKey}
                onSortKeyChange={setSortKey}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                pendingCount={globalCancelRequests.length}
                onOpenInbox={() =>
                  history.push(`/${HomeRouterNames.NOTIFICATION_LOGS}`)
                }
                onOpenCancelPanel={() => setIsCancelPanelOpen(true)}
              />

              <SchedulingGrid
                currentDate={currentDate}
                employees={currentEmployees}
                allEmployees={employees}
                onDropShift={handleDropShift}
                viewMode={viewMode}
                onConfirmShift={handleConfirmShift}
                onOpenVehicleModal={handleOpenVehicleModal}
                onRemoveAssignedVehicle={handleRemoveAssignedVehicle}
                onRemoveAssignedShift={handleRemoveAssignedShift}
                filterMode={filterMode}
                dailyShiftCounts={dailyShiftCounts}
                onDriverConfirmAvailability={handleDriverConfirmAvailability}
                onDaySummaryIconClick={handleDaySummaryIconClick}
                availableVehicles={availableVehicles}
                dailyTargets={dailyTargets}
                dailyTargetIds={dailyTargetIds}
                onDailyTargetChange={handleDailyTargetChange}
                onDailyTargetSave={handleDailyTargetSave}
                onOpenAvailabilityModal={handleOpenAvailabilityModal}
                onRemoveAvailability={handleRemoveAvailability}
              />
              <Pagination
                employeesPerPage={employeesPerPage}
                totalEmployees={filteredAndSortedEmployees.length}
                currentPage={currentPage}
                paginate={paginate}
                nextPage={nextPage}
                prevPage={prevPage}
              />
            </>
          )}

          {/* ── TAB: ROSTERING OVERVIEW ── */}
          {activeTab === 'rostering' && <DailyRosteringTab />}

          {/* ── TAB: SERVICE CONFIGURATIONS ── */}
          {activeTab === 'service-config' && <ServiceConfigurationsTab availableShifts={availableShifts} />}
        </div>
        {/* 2. Primary Cancellation Panel (The "Central Place") */}
        <CancellationPanel
          isOpen={isCancelPanelOpen}
          requests={globalCancelRequests}
          onClose={() => setIsCancelPanelOpen(false)}
          onProcess={handleOpenCancelModal}
        // onProcess={handleProcessCancellation}
        />
        <UnconfirmedAvailabilityPanel
          isOpen={isUnconfirmedPanelOpen}
          rangeLabel={unconfirmedRangeLabel}
          rows={unconfirmedRowsForRange}
          isSyncing={!isUnconfirmedRangeLoaded}
          onClose={() => setIsUnconfirmedPanelOpen(false)}
        />
        {/* 3. Secondary Lightweight Inbox (Floating/Pop-over) */}
        {isInboxOpen && (
          <NotificationInbox
            requests={globalCancelRequests.slice(0, 5)}
            onAction={(req) => {
              // 1. Jump the calendar to the date of the request
              setCurrentDate(new Date(req.shift_date));

              // 2. Open the specific modal for this request
              setSelectedCancelRequest({
                id: req.id,
                type: req.type,
                cancel_reason: req.cancel_reason, // Use cancel_reason here
                shift_date: req.shift_date,
                start_time: req.start_time || req.availability_start_time,
                first_name: req.first_name,
                middle_name: req.middle_name,
                surname: req.surname,
                shift_name: req.shift_name,
                availability_name: req.availability_name,
              });
              setIsCancelModalOpen(true);

              // 3. Close the notification dropdown
              setIsInboxOpen(false);
            }}
          />
        )}
        {/* Sidebar is conditionally rendered and hidden during drag */}
        <ShiftManagerSidebar
          isOpen={isSidebarOpen}
          isDragging={isDraggingShift}
          onClose={() => setSidebarOpen(false)}
          availableShifts={availableShifts}
          onAddShift={handleAddShift}
          onDeleteShift={handleDeleteShift}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
        <VehicleManagerSidebar
          isOpen={isVehicleSidebarOpen}
          onClose={() => setVehicleSidebarOpen(false)}
          availableVehicles={availableVehicles}
          onAddVehicle={handleAddVehicle}
          onUpdateVehicle={handleUpdateVehicle}
          onDeactivateVehicle={handleDeactivateVehicle}
        />
        {/* Vehicle Assignment Modal */}
        <VehicleAssignmentModal
          isOpen={isVehicleModalOpen}
          onClose={() => setIsVehicleModalOpen(false)}
          onAssign={handleAssignVehicle}
          currentVehicle={currentVehicleInModal}
          availableVehicles={availableVehicles} // Pass the full vehicle objects
          allocatedVehiclesForDate={allocatedVehiclesForModalDate}
        />
        {/* Service Type Selection Modal */}
        <ServiceTypeSelectModal
          isOpen={isServiceModalOpen}
          onClose={() => {
            setIsServiceModalOpen(false);
            setPendingAssignment(null);
          }}
          onConfirm={executeDropShift}
          serviceTypes={serviceTypes}
          employees={employees}
          targetDate={pendingAssignment?.targetDate || ""}
        />
        {/* NEW: Download Reports Modal */}
        <DailyExcelPreviewModal
          isOpen={isDailyPreviewModalOpen}
          onClose={() => setIsDailyPreviewModalOpen(false)}
          dateLabel={
            dailyPreviewTargetDate
              ? formatDate(dailyPreviewTargetDate, "full")
              : formatDate(currentDate || new Date(), "full")
          }
          targetDate={
            formatDate(dailyPreviewTargetDate || currentDate || new Date(), "key")
          }
          onDateChange={handleDailyPreviewDateChange}
          rows={dailyPreviewRows}
          isLoading={isDailyPreviewLoading}
          errorMessage={dailyPreviewError}
          sortKey={dailyPreviewSortKey}
          sortOrder={dailyPreviewSortOrder}
          onSortKeyChange={setDailyPreviewSortKey}
          onSortOrderChange={setDailyPreviewSortOrder}
		  notes={notes}
		  setNotes={setNotes}
        />
        <DownloadReportsModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          onDownload={handleDownloadReport}
        />
        <CancellationModal
          isOpen={isCancelModalOpen}
          onClose={() => {
            setIsCancelModalOpen(false);
            setSelectedCancelRequest(null);
          }}
          data={selectedCancelRequest}
          onProcess={handleProcessCancellation} // This function handles the API logic
        />
        {confirmAvailabilityModal && (
          <AvailabilityConfirmModal
            isOpen={confirmAvailabilityModal.isOpen}
            isConfirmed={confirmAvailabilityModal.isConfirmed}
            driverName={confirmAvailabilityModal.driverName}
            date={confirmAvailabilityModal.date}
            onClose={() => setConfirmAvailabilityModal(null)}
            onConfirm={handleExecuteDriverAvailabilityToggle}
          />
        )}
        <AddDriverAvailabilityModal
          isOpen={isAvailabilityModalOpen}
          onClose={() => setIsAvailabilityModalOpen(false)}
          drivers={employees}
          initialDriverId={selectedAvailabilityDriverId}
          initialDate={selectedAvailabilityDate}
          initialShift={selectedAvailabilityShift}
          onSave={handleSaveAvailability}
          onDelete={async (availId) => {
            if (selectedAvailabilityDriverId && selectedAvailabilityDate) {
              await handleRemoveAvailability(
                Number(selectedAvailabilityDriverId),
                selectedAvailabilityDate,
                availId,
              );
            }
          }}
        />
      </div>
    </DndProvider>
  );
};

export default SchedulingPage;
