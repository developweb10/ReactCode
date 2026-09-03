import React, { useState, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import {
  X,
  Edit3,
  GripVertical,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  HelpCircle,
} from "lucide-react";
import styles from "../styles/SchedulingPage.module.scss";
import { Shift, ItemTypes } from "./types";
import { formatDate, parseDriverConfirmedStatus, isAvailabilityMarkedAvailable } from "./utils";

/**
 * Renders a single shift card with its details and status styling.
 * Includes a button to confirm the shift if it's for the current day and not yet confirmed.
 */
export const ShiftCard = ({
  shift,
  dateKey,
  onConfirmShift,
  onRemoveShift, // Added for removing assigned shifts
  onRemoveAvailability, // Added for removing availability
  onDriverConfirmAvailability, // NEW: For driver availability confirmation
  employeeId, // Pass employeeId for driver confirmation
}: {
  shift: Shift;
  dateKey: string;
  onConfirmShift: (
    employeeId: number,
    date: string,
    assignedShiftId: number,
  ) => void;
  onRemoveShift: (
    employeeId: number,
    date: string,
    assignedShiftId: number,
  ) => void;
  onRemoveAvailability?: (
    employeeId: number,
    date: string,
    availabilityId: number,
  ) => void;
  onDriverConfirmAvailability?: (
    employeeId: number,
    date: string,
    shiftId: number,
  ) => void; // Optional for availability
  employeeId: number;
}) => {
  const isCancellationRequested = shift.cancellation_status === "pending";
  // Determine status class based on shift status
  const statusClass =
    styles[shift.shift_status.toLowerCase().replace(" ", "")] || "";

  const cancellationClass = isCancellationRequested
    ? styles.cancellationRequested
    : "";
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayKey = formatDate(today, "key");
  const tomorrowKey = formatDate(tomorrow, "key");

  const isTodayOrTomorrow = dateKey === todayKey || dateKey === tomorrowKey;

  // Manager confirmation logic remains the same (client-side only)
  const needsManagerConfirmation =
    shift.shift_type === "assigned" && !shift.isConfirmedByManager; // Assuming isConfirmedByManager is client-side

  const isDriverConfirmedBoolean =
    parseDriverConfirmedStatus(shift?.is_driver_confirmed) === true;
  // const isCancellationRequested = shift.cancellation_status === "pending";

  const availabilityId = shift.id || (shift as any).availability_id;

  return (
    <div className={`${styles.shiftCard} ${statusClass} ${cancellationClass}`}>
      <p className={styles.shift_name}>
        {isCancellationRequested && "⚠️ "}
        {/* {shift.shift_name} */}
        {shift.shift_name
          ? shift.shift_name.charAt(0).toUpperCase() + shift.shift_name.slice(1)
          : ""}
      </p>
      <p
        className={styles.shiftTimesInfo}
      >{`${shift.start_time} - ${shift.end_time}`}</p>

      {/* Remove Assigned Shift Button (Top Right) */}
      {shift.shift_type === "assigned" && shift.assigned_shift_id && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveShift(employeeId, dateKey, shift.assigned_shift_id!);
          }}
          className={styles.removeShiftButton}
          title="Remove Assigned Shift"
        >
          <X className={styles.removeIcon} />
        </button>
      )}

      {/* Remove Availability Button (Top Right) */}
      {shift.shift_type === "availability" && onRemoveAvailability && availabilityId && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveAvailability(employeeId, dateKey, availabilityId);
          }}
          className={styles.removeShiftButton}
          title="Remove Availability"
        >
          <X className={styles.removeIcon} />
        </button>
      )}

      {/* Manager Outstanding Confirmation (Top Left) */}
      {needsManagerConfirmation && shift.assigned_shift_id && (
        <button
          onClick={() =>
            onConfirmShift(employeeId, dateKey, shift.assigned_shift_id!)
          }
          className={styles.confirmShiftButton}
          title="Confirm Work (Manager)"
        >
          <AlertCircle className={styles.confirmIcon} />
        </button>
      )}

      {/* Manager Confirmed Indicator (Bottom Right) */}
      {shift.isConfirmedByManager && (
        <div
          className={styles.confirmedIndicator}
          title="Work Confirmed (Manager)"
        >
          <CheckCircle className={styles.confirmedIcon} />
        </div>
      )}

      {/* Driver Availability Status */}
      {shift.shift_type === "availability" && isAvailabilityMarkedAvailable(shift) && (
        <>
          {/* Driver Confirmed Indicator (Bottom Right) */}
          {isDriverConfirmedBoolean ? (
            <div
              className={styles.driverConfirmedIndicator}
              title="Driver Confirmed Availability - Click to unconfirm"
              onClick={(e) => {
                e.stopPropagation();
                if (onDriverConfirmAvailability && availabilityId) {
                  onDriverConfirmAvailability(employeeId, dateKey, availabilityId);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <ThumbsUp className={styles.driverConfirmedIcon} />
            </div>
          ) : (
            /* Driver Unconfirmed Indicator (Bottom Right) with ? icon */
            <div
              className={styles.driverUnconfirmedIndicator}
              title="Driver Unconfirmed Availability - Click to confirm"
              onClick={(e) => {
                e.stopPropagation();
                if (onDriverConfirmAvailability && availabilityId) {
                  onDriverConfirmAvailability(employeeId, dateKey, availabilityId);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <HelpCircle className={styles.driverUnconfirmedIcon} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * A droppable cell in the scheduling grid where shifts can be placed.
 */
export const DroppableCell = ({
  employeeId,
  date,
  onDropShift,
  children,
}: {
  employeeId: number;
  date: string;
  onDropShift: (
    employeeId: number,
    date: string,
    shift: Shift,
    sourceEmployeeId?: number,
    sourceDate?: string,
  ) => void;
  children: React.ReactNode;
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.SHIFT,
    drop: (item: {
      shift: Shift;
      sourceEmployeeId?: number;
      sourceDate?: string;
    }) =>
      onDropShift(
        employeeId,
        date,
        item.shift,
        item.sourceEmployeeId,
        item.sourceDate,
      ),
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  return (
    <td
      ref={drop}
      className={`${styles.shiftCell} ${isOver ? styles.isOver : ""}`}
    >
      {children}
    </td>
  );
};

/**
 * A draggable shift item, used both in the sidebar and within the grid.
 */
export const DraggableShift = ({
  shift,
  sourceEmployeeId,
  sourceDate,
  onDragStart,
  onDragEnd,
  onDeleteShift, // This prop is now optional for sidebar shifts
}: {
  shift: Shift;
  sourceEmployeeId?: number;
  sourceDate?: string;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDeleteShift?: (
    shiftId: number,
    employeeId?: number,
    date?: string,
    type?: "shift" | "vehicle",
  ) => void; // Made optional
}) => {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: ItemTypes.SHIFT,
    item: { shift, sourceEmployeeId, sourceDate },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    end: () => onDragEnd(), // Call onDragEnd when drag operation finishes
  }));

  // Call onDragStart when drag begins
  useEffect(() => {
    if (isDragging) {
      onDragStart();
    }
  }, [isDragging, onDragStart]);

  return (
    <div
      ref={preview}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={styles.draggableShiftWrapper}
    >
      <div ref={drag} className={styles.draggableShift}>
        <GripVertical className={styles.dragHandle} />
        <div className={styles.draggableShiftInfo}>
          <p>{shift.shift_name}</p>
          <p
            className={styles.shiftTimes}
          >{`${shift.start_time} - ${shift.end_time}`}</p>
        </div>
        {/* Only show delete button if onDeleteShift is provided (i.e., not for initial available shifts) */}
        {onDeleteShift && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent drag from starting when deleting
              onDeleteShift(shift.id, sourceEmployeeId, sourceDate, "shift"); // Specify type as 'shift'
            }}
            className={styles.deleteShiftButton}
          >
            <X className={styles.deleteIcon} />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Sidebar component for managing available shifts and creating new ones.
 */
export const ShiftManagerSidebar = ({
  isOpen,
  isDragging = false,
  onClose,
  availableShifts,
  onAddShift,
  onDeleteShift, // This is for deleting newly published shifts
  onDragStart,
  onDragEnd,
}: {
  isOpen: boolean;
  isDragging?: boolean;
  onClose: () => void;
  availableShifts: Shift[];
  onAddShift: (
    shift: Omit<
      Shift,
      | "id"
      | "is_driver_confirmed"
      | "isConfirmedByManager"
      | "assigned_shift_id"
    >,
  ) => void; // Omit id for new shifts
  onDeleteShift: (
    shiftId: number,
    employeeId?: number,
    date?: string,
    type?: "shift" | "vehicle",
  ) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) => {
  const [shift_name, setShiftName] = useState(""); // Default to blank
  const [start_time, setStartTime] = useState(""); // Default to blank
  const [end_time, setEndTime] = useState(""); // Default to blank

  const handlePublish = () => {
    if (!shift_name || !start_time || !end_time) {
      alert("Please fill in all shift details."); // Using alert for simplicity, consider a custom modal
      return;
    }
    onAddShift({
      shift_name,
      start_time,
      end_time,
      shift_status: "Assigned", // Default to assigned for new shifts
      shift_type: "assigned", // New shifts created here are "assigned" type
    });
    handleClear();
  };

  const handleClear = () => {
    setShiftName("");
    setStartTime("");
    setEndTime("");
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className={styles.sidebarOverlay}
        onClick={onClose}
        style={isDragging ? { display: "none" } : undefined}
      ></div>
      <div
        className={styles.sidebar}
        style={isDragging ? { display: "none" } : undefined}
      >
        <div className={styles.sidebarHeader}>
          <h2>Available Shifts</h2>
          <button onClick={onClose} className={styles.closeSidebarButton}>
            <X />
          </button>
        </div>
        <div className={styles.sidebarBody}>
          {availableShifts.length === 0 && (
            <p className={styles.noShiftsMessage}>
              No available shifts. Create one below!
            </p>
          )}
          {availableShifts.map((shift) => (
            <DraggableShift
              key={shift.id}
              shift={shift}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              // All shifts in sidebar are deletable
              onDeleteShift={onDeleteShift}
            />
          ))}
        </div>
        <div className={styles.sidebarFooter}>
          <div className={styles.createShiftHeader}>
            <h3>Create Shift</h3>
            <button onClick={handleClear} className={styles.clearButton}>
              Clear
            </button>
          </div>
          <div className={styles.formGroup}>
            <label>Shift Name</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                value={shift_name}
                onChange={(e) => setShiftName(e.target.value)}
                className={styles.inputField}
                placeholder="e.g., Morning Shift"
              />
              <Edit3 className={styles.inputIcon} />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Shift Start Timing</label>
            <div className={styles.inputWrapper}>
              <input
                type="time"
                value={start_time}
                onChange={(e) => setStartTime(e.target.value)}
                className={styles.inputField}
              />
              <Edit3 className={styles.inputIcon} />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Shift End Timing</label>
            <div className={styles.inputWrapper}>
              <input
                type="time"
                value={end_time}
                onChange={(e) => setEndTime(e.target.value)}
                className={styles.inputField}
              />
              <Edit3 className={styles.inputIcon} />
            </div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.publishButton} onClick={handlePublish}>
              Publish
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
