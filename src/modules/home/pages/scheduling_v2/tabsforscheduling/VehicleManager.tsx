import React, { useState, useMemo, useEffect } from "react";
import { X } from "lucide-react";
import styles from "../styles/SchedulingPage.module.scss";
import { Vehicle, VehiclePayload, AssignedVehicle } from "./types";
import { isVehicleInactive } from "./utils";

export const VehicleManagerSidebar = ({
  isOpen,
  onClose,
  availableVehicles,
  onAddVehicle,
  onUpdateVehicle,
  onDeactivateVehicle,
}: {
  isOpen: boolean;
  onClose: () => void;
  availableVehicles: Vehicle[];
  onAddVehicle: (vehicle: VehiclePayload) => void;
  onUpdateVehicle: (vehicle: VehiclePayload) => void;
  onDeactivateVehicle: (vehicleNumber: string) => void;
}) => {
  const [vehicle_name, setVehicleName] = useState("");
  const [vehicle_number, setVehicleNumber] = useState("");
  const [vehicle_type, setVehicleType] = useState("");
  const [vehicle_nos, setVehicleNos] = useState("");
  const [vehicle_status, setVehicleStatus] = useState<"1" | "0">("1");
  const [vehicle_rph, setVehicleRph] = useState("");
  const [editingVehicleNumber, setEditingVehicleNumber] = useState<
    string | null
  >(null);

  const fleetCounts = useMemo(() => {
    const total = availableVehicles.length;
    const vor = availableVehicles.filter((vehicle) =>
      isVehicleInactive(vehicle.vehicle_status),
    ).length;
    const active = total - vor;
    return { active, vor, total };
  }, [availableVehicles]);

  const sortedVehicles = useMemo(() => {
    return [...availableVehicles].sort((a, b) => {
      const aInactive = isVehicleInactive(a.vehicle_status) ? 1 : 0;
      const bInactive = isVehicleInactive(b.vehicle_status) ? 1 : 0;
      if (aInactive !== bInactive) {
        return aInactive - bInactive; // ACTIVE first, then VOR
      }

      const nameCompare = a.vehicle_name.localeCompare(
        b.vehicle_name,
        undefined,
        {
          sensitivity: "base",
        },
      );
      if (nameCompare !== 0) {
        return nameCompare;
      }

      return a.vehicle_number.localeCompare(b.vehicle_number, undefined, {
        sensitivity: "base",
      });
    });
  }, [availableVehicles]);

  const clearVehicleForm = () => {
    setVehicleName("");
    setVehicleNumber("");
    setVehicleType("");
    setVehicleNos("");
    setVehicleStatus("1");
    setVehicleRph("");
    setEditingVehicleNumber(null);
  };

  const handleVehicleSubmit = () => {
    if (!vehicle_name || !vehicle_number || !vehicle_type || !vehicle_nos) {
      alert("Please fill in all van details.");
      return;
    }

    const payload: VehiclePayload = {
      vehicle_name: vehicle_name?.trim(),
      vehicle_number: vehicle_number?.trim(),
      vehicle_type: vehicle_type?.trim(),
      vehicle_nos: vehicle_nos?.trim(),
      vehicle_status,
      vehicle_rph: vehicle_rph?.trim(),
    };

    if (editingVehicleNumber) {
      onUpdateVehicle({
        ...payload,
        vehicle_number: editingVehicleNumber,
      });
    } else {
      onAddVehicle(payload);
    }
    clearVehicleForm();
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setVehicleName(vehicle.vehicle_name);
    setVehicleNumber(vehicle.vehicle_number);
    setVehicleType(vehicle.vehicle_type);
    setVehicleNos(vehicle.vehicle_nos);
    setVehicleStatus(isVehicleInactive(vehicle.vehicle_status) ? "0" : "1");
    setVehicleRph(vehicle.vehicle_rph || "");
    setEditingVehicleNumber(vehicle.vehicle_number);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.sidebarOverlay} onClick={onClose}></div>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Vehicle Management</h2>
          <button onClick={onClose} className={styles.closeSidebarButton}>
            <X />
          </button>
        </div>
        <div className={styles.sidebarBody}>
          <div className={styles.fleetSection}>
            <div
              className={styles.requestCard}
              style={{ marginBottom: "12px" }}
            >
              <div className={styles.cardUser} style={{ marginBottom: 0 }}>
                <strong>Fleet Summary</strong>
                <p>Active Vans - {fleetCounts.active}</p>
                <p>VOR - {fleetCounts.vor}</p>
                <p>Total Vans - {fleetCounts.total}</p>
              </div>
            </div>
            <div className={styles.fleetHeader}>
              <h3>Fleet List</h3>
              <button
                onClick={clearVehicleForm}
                className={styles.fleetClearButton}
              >
                Clear
              </button>
            </div>

            <div className={styles.formGroup}>
              <label>Van Name</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  value={vehicle_name}
                  onChange={(e) => setVehicleName(e.target.value)}
                  className={styles.inputField}
                  placeholder="e.g., Ford Transit"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Registration</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  value={vehicle_number}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className={styles.inputField}
                  placeholder="e.g., AB12 CDE"
                  disabled={editingVehicleNumber !== null}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Type</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  value={vehicle_type}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className={styles.inputField}
                  placeholder="e.g., LWB"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>NoS</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  value={vehicle_nos}
                  onChange={(e) => setVehicleNos(e.target.value)}
                  className={styles.inputField}
                  placeholder="e.g., 2"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Status</label>
              <select
                value={vehicle_status}
                onChange={(e) => setVehicleStatus(e.target.value as "1" | "0")}
                className={styles.fleetStatusSelect}
              >
                <option value="1">ACTIVE</option>
                <option value="0">VOR</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Description / Notes</label>
              <textarea
                value={vehicle_rph}
                onChange={(e) => setVehicleRph(e.target.value)}
                className={styles.fleetNotes}
                placeholder="e.g., Mechanic booking 15/03 or flat tyre at depot"
                rows={2}
              />
            </div>

            <div className={styles.formActions}>
              <button
                className={styles.publishButton}
                onClick={handleVehicleSubmit}
              >
                {editingVehicleNumber ? "Update Van" : "Add Van"}
              </button>
            </div>

            <div className={styles.fleetList}>
              {sortedVehicles.map((vehicle) => {
                const isVor = isVehicleInactive(vehicle.vehicle_status);
                return (
                  <div
                    key={vehicle.id}
                    className={`${styles.fleetItem} ${isVor ? styles.fleetItemVor : ""
                      }`}
                  >
                    <div
                      className={styles.fleetItemMain}
                      title={vehicle.vehicle_rph || "No notes"}
                    >
                      <span className={styles.fleetRegistration}>
                        {vehicle.vehicle_number}
                      </span>
                      <span>{vehicle.vehicle_name}</span>
                      <span
                        className={`${styles.fleetStatus} ${isVor ? styles.statusVor : styles.statusActive
                          }`}
                      >
                        {isVor ? "VOR" : "ACTIVE"}
                      </span>
                    </div>
                    <div className={styles.fleetActions}>
                      <button
                        className={styles.editFleetButton}
                        onClick={() => handleEditVehicle(vehicle)}
                      >
                        Edit
                      </button>
                      {!isVor && (
                        <button
                          className={styles.deleteFleetButton}
                          onClick={() =>
                            onDeactivateVehicle(vehicle.vehicle_number?.trim())
                          }
                        >
                          Inactivate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export interface VehicleAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (vehicle: AssignedVehicle | null) => void; // Now accepts null for unassign
  currentVehicle: AssignedVehicle | null; // Now expects AssignedVehicle object
  availableVehicles: Vehicle[];
  allocatedVehiclesForDate: AssignedVehicle[]; // Now a list of AssignedVehicle objects
}

export const VehicleAssignmentModal: React.FC<VehicleAssignmentModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  currentVehicle,
  availableVehicles,
  allocatedVehiclesForDate,
}) => {
  // Always initialize to null or empty string to show "Select a vehicle"
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null,
  );

  // Use effect to reset selectedVehicleId when modal opens, if currentVehicle is null
  useEffect(() => {
    if (isOpen) {
      setSelectedVehicleId(currentVehicle?.id || null);
    }
  }, [isOpen, currentVehicle]);

  if (!isOpen) return null;

  const handleAssignClick = () => {
    if (selectedVehicleId === null) {
      // User selected "-- Select a vehicle --"
      onAssign(null); // Unassign the vehicle
    } else {
      const selectedVehicle = availableVehicles.find(
        (v) => v.id === selectedVehicleId,
      );
      if (selectedVehicle) {
        onAssign({
          id: selectedVehicle.id,
          name: selectedVehicle.vehicle_name?.trim(),
          number: selectedVehicle.vehicle_number?.trim(),
          notes: selectedVehicle.vehicle_rph?.trim() || "",
          // assigned_vehicle_id will be populated after API call in parent
        });
      }
    }
    onClose();
  };

  return (
    <>
      <div className={styles.sidebarOverlay} onClick={onClose}></div>
      <div className={styles.vehicleModal}>
        <div className={styles.vehicleModalHeader}>
          <h2>Assign Vehicle</h2>
          <button onClick={onClose} className={styles.closeModalButton}>
            <X />
          </button>
        </div>
        <div className={styles.vehicleModalBody}>
          <div className={styles.formGroup}>
            <label htmlFor="vehicleSelect">Select Vehicle:</label>
            <select
              id="vehicleSelect"
              value={selectedVehicleId === null ? "" : selectedVehicleId} // Use "" for null to match option value
              onChange={(e) =>
                setSelectedVehicleId(
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
              className={styles.vehicleSelect}
            >
              <option value="">-- Select a vehicle --</option>{" "}
              {/* Always show this option */}
              {availableVehicles.map((vehicle) => {
                // Check if this vehicle (by its id) is already allocated on this date, excluding the current one being edited
                const isAllocated = allocatedVehiclesForDate.some(
                  (av) => av.id === vehicle.id && av.id !== currentVehicle?.id,
                );
                return (
                  <option
                    key={vehicle.id}
                    value={vehicle.id}
                    disabled={
                      isAllocated || isVehicleInactive(vehicle.vehicle_status)
                    } // Disable if allocated or VOR
                    className={
                      isAllocated || isVehicleInactive(vehicle.vehicle_status)
                        ? styles.disabledOption
                        : ""
                    }
                  >
                    {`${vehicle.vehicle_name?.trim()} (${vehicle.vehicle_number?.trim()})`}
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
            onClick={handleAssignClick}
            disabled={selectedVehicleId === undefined} // Disable if no selection has been made (initial state)
            className={styles.assignButton}
          >
            Assign
          </button>
        </div>
      </div>
    </>
  );
};
