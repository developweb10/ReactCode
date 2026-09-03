// import sharedStyles from "../dashboard-page.module.scss";
// import styles from "./stat-section.module.scss";

// import TasksIcon from "@assets/images/tasks-yellow-icon.svg";
// import GenderIcon from "@assets/images/gender-yellow-icon.svg";
// import EmployeesIcon from "@assets/images/employees-yellow-icon.svg";

// import { IconImage } from "@components/icon-image/icon-image";

// import classNames from "classnames";
// import { Typography, Box } from "@material-ui/core";
// import { WorkforceGender } from "@models/dashboard.models";

// interface Props {
//   employeesNumber: number;
//   tasksNumber: number;
//   genders: WorkforceGender[];
// }
// export const StatSection: React.FC<Props> = ({
//   employeesNumber,
//   tasksNumber,
//   genders,
// }) => {
//   return (
//     <Box className={classNames(sharedStyles.Section, styles.StatSection)}>
//       <Box className={classNames(sharedStyles.Card, styles.StatCard)}>
//         <IconImage
//           path={EmployeesIcon}
//           size="md"
//           filled
//           className={styles.Icon}
//         />
//         <Typography className={styles.CardTitle}>
//           Total number of employees
//         </Typography>
//         <Typography variant="h4" className={styles.CardData}>
//           {employeesNumber} employees
//         </Typography>
//       </Box>
//       <Box className={classNames(sharedStyles.Card, styles.StatCard)}>
//         <IconImage path={TasksIcon} size="md" filled className={styles.Icon} />
//         <Typography className={styles.CardTitle}>Number of my tasks</Typography>
//         <Typography variant="h4" className={styles.CardData}>
//           {tasksNumber} {tasksNumber === 1 ? "task" : "tasks"}
//         </Typography>
//       </Box>
//       <Box className={classNames(sharedStyles.Card, styles.StatCard)}>
//         <IconImage path={GenderIcon} size="md" filled className={styles.Icon} />
//         <Typography className={styles.CardTitle}>Workforce gender</Typography>
//         <Box display="flex" justifyContent="space-between" marginTop={1}>
//           {[...genders]
//             .sort((a, b) => (a.percentage > b.percentage ? -1 : 1))
//             .map((g) => (
//               <Box className={styles.GenderWrapper} key={g.gender}>
//                 <Typography className={styles.GenderPercent}>
//                   {g.percentage}%
//                 </Typography>
//                 <Typography>{g.gender}</Typography>
//               </Box>
//             ))}
//         </Box>
//       </Box>
//     </Box>
//   );
// };



import sharedStyles from "../dashboard-page.module.scss";
import styles from "./stat-section.module.scss";

import TasksIcon from "@assets/images/tasks-yellow-icon.svg";
import GenderIcon from "@assets/images/gender-yellow-icon.svg";
import EmployeesIcon from "@assets/images/employees-yellow-icon.svg";

import { IconImage } from "@components/icon-image/icon-image";

import classNames from "classnames";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Typography, Box } from "@material-ui/core";
import {
  FleetVehicle,
  FleetVehiclePayload,
  WorkforceGender,
} from "@models/dashboard.models";
import { DashboardApi } from "@api/dashboard/dashboard.api";

const car = `${process.env.PUBLIC_URL}/1.png`;
const genderOrder = ["Male", "Female", "Other"];

interface Props {
  employeesNumber: number;
  tasksNumber: number;
  genders: WorkforceGender[];
  fleetVehicles: FleetVehicle[];
}
export const StatSection: React.FC<Props> = ({
  employeesNumber,
  tasksNumber,
  genders,
  fleetVehicles,
}) => {
  const [isFleetDialogOpen, setIsFleetDialogOpen] = useState(false);
  const [localFleetVehicles, setLocalFleetVehicles] = useState<FleetVehicle[]>(
    []
  );
  const [vehicle_name, setVehicleName] = useState("");
  const [vehicle_number, setVehicleNumber] = useState("");
  const [vehicle_type, setVehicleType] = useState("");
  const [vehicle_nos, setVehicleNos] = useState("");
  const [vehicle_status, setVehicleStatus] = useState<"1" | "0">("1");
  const [vehicle_rph, setVehicleRph] = useState("");
  const [editingVehicleNumber, setEditingVehicleNumber] = useState<
    string | null
  >(null);

  useEffect(() => {
    setLocalFleetVehicles(fleetVehicles);
  }, [fleetVehicles]);

  const isVehicleInactive = (status?: string) => status?.trim() === "0";

  const fleetCounts = useMemo(() => {
    const total = localFleetVehicles.length;
    const vor = localFleetVehicles.filter((vehicle) =>
      isVehicleInactive(vehicle.vehicle_status)
    ).length;

    return {
      active: total - vor,
      vor,
      total,
    };
  }, [localFleetVehicles]);

  const sortedVehicles = useMemo(() => {
    return [...localFleetVehicles].sort((a, b) => {
      const aInactive = isVehicleInactive(a.vehicle_status) ? 1 : 0;
      const bInactive = isVehicleInactive(b.vehicle_status) ? 1 : 0;
      if (aInactive !== bInactive) {
        return aInactive - bInactive;
      }

      const nameCompare = a.vehicle_name.localeCompare(
        b.vehicle_name,
        undefined,
        {
          sensitivity: "base",
        }
      );
      if (nameCompare !== 0) {
        return nameCompare;
      }

      return a.vehicle_number.localeCompare(b.vehicle_number, undefined, {
        sensitivity: "base",
      });
    });
  }, [localFleetVehicles]);

  const fetchFleetVehicles = async () => {
    const fleetResult = await DashboardApi.getFleetVehicles();
    setLocalFleetVehicles(
      fleetResult.status === 1 ? fleetResult.vehicles || [] : []
    );
  };

  const clearVehicleForm = () => {
    setVehicleName("");
    setVehicleNumber("");
    setVehicleType("");
    setVehicleNos("");
    setVehicleStatus("1");
    setVehicleRph("");
    setEditingVehicleNumber(null);
  };

  const handleVehicleSubmit = async () => {
    if (!vehicle_name || !vehicle_number || !vehicle_type || !vehicle_nos) {
      alert("Please fill in all van details.");
      return;
    }

    const payload: FleetVehiclePayload = {
      vehicle_name: vehicle_name?.trim(),
      vehicle_number: vehicle_number?.trim(),
      vehicle_type: vehicle_type?.trim(),
      vehicle_nos: vehicle_nos?.trim(),
      vehicle_status,
      vehicle_rph: vehicle_rph?.trim(),
    };

    if (editingVehicleNumber) {
      await DashboardApi.updateFleetVehicle({
        ...payload,
        vehicle_number: editingVehicleNumber,
      });
    } else {
      await DashboardApi.addFleetVehicle(payload);
    }

    clearVehicleForm();
    await fetchFleetVehicles();
  };

  const handleEditVehicle = (vehicle: FleetVehicle) => {
    setVehicleName(vehicle.vehicle_name);
    setVehicleNumber(vehicle.vehicle_number);
    setVehicleType(vehicle.vehicle_type);
    setVehicleNos(vehicle.vehicle_nos);
    setVehicleStatus(isVehicleInactive(vehicle.vehicle_status) ? "0" : "1");
    setVehicleRph(vehicle.vehicle_rph || "");
    setEditingVehicleNumber(vehicle.vehicle_number);
  };

  const handleDeactivateVehicle = async (vehicleNumber: string) => {
    await DashboardApi.deactivateFleetVehicle(vehicleNumber);
    await fetchFleetVehicles();
  };

  return (
    <Box className={classNames(sharedStyles.Section, styles.StatSection)}>
      <Box className={classNames(sharedStyles.Card, styles.StatCard)}>
        <IconImage
          path={EmployeesIcon}
          size="md"
          filled
          className={styles.Icon}
        />
        <Typography className={styles.CardTitle}>
          Total number of employees
        </Typography>
        <Typography variant="h4" className={styles.CardData}>
          {employeesNumber} employees
        </Typography>
      </Box>
      <Box className={classNames(sharedStyles.Card, styles.StatCard)}>
        <IconImage path={TasksIcon} size="md" filled className={styles.Icon} />
        <Typography className={styles.CardTitle}>Number of my tasks</Typography>
        <Typography variant="h4" className={styles.CardData}>
          {tasksNumber} {tasksNumber === 1 ? "task" : "tasks"}
        </Typography>
      </Box>
      <Box className={classNames(sharedStyles.Card, styles.StatCard)}>
        <IconImage path={GenderIcon} size="md" filled className={styles.Icon} />
        <Typography className={styles.CardTitle}>Workforce gender</Typography>
        <Box display="flex" justifyContent="space-between" marginTop={1}>
          {genderOrder
            .map(
              (gender) =>
                genders.find((item) => item.gender === gender) || {
                  gender,
                  percentage: 0,
                }
            )
            .map((g) => (
              <Box className={styles.GenderWrapper} key={g.gender}>
                <Typography className={styles.GenderPercent}>
                  {g.percentage}%
                </Typography>
                <Typography>{g.gender}</Typography>
              </Box>
            ))}
        </Box>
      </Box>
      {/* <Dialog
        open={isFleetDialogOpen}
        headerTitle="Fleet Summary"
        onClose={() => setIsFleetDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent className={styles.FleetDialogContent}>
          <Box className={styles.FleetDialogSummary}>
            <Box>
              <Typography className={styles.FleetDialogLabel}>
                Active Vans
              </Typography>
              <Typography className={styles.FleetDialogValue}>
                {fleetCounts.active}
              </Typography>
            </Box>
            <Box>
              <Typography className={styles.FleetDialogLabel}>VOR</Typography>
              <Typography className={styles.FleetDialogValue}>
                {fleetCounts.vor}
              </Typography>
            </Box>
            <Box>
              <Typography className={styles.FleetDialogLabel}>
                Total Vans
              </Typography>
              <Typography className={styles.FleetDialogValue}>
                {fleetCounts.total}
              </Typography>
            </Box>
          </Box>
          <Box className={styles.FleetList}>
            {fleetVehicles.length ? (
              fleetVehicles.map((vehicle) => {
                const isVor = vehicle.vehicle_status?.trim() === "0";

                return (
                  <Box
                    className={classNames(styles.FleetItem, {
                      [styles.FleetItemVor]: isVor,
                    })}
                    key={vehicle.id}
                  >
                    <Box>
                      <Typography className={styles.FleetVehicleNumber}>
                        {vehicle.vehicle_number || "-"}
                      </Typography>
                      <Typography className={styles.FleetVehicleName}>
                        {vehicle.vehicle_name || "-"}
                      </Typography>
                    </Box>
                    <Typography
                      className={classNames(styles.FleetVehicleStatus, {
                        [styles.FleetVehicleStatusVor]: isVor,
                      })}
                    >
                      {isVor ? "VOR" : "Active"}
                    </Typography>
                  </Box>
                );
              })
            ) : (
              <Typography className={styles.FleetEmpty}>
                No fleet data found.
              </Typography>
            )}
          </Box>
        </DialogContent>
      </Dialog> */}
      {/* <Drawer
        anchor="right"
        open={isFleetDialogOpen}
        onClose={() => setIsFleetDialogOpen(false)}
        classes={{ paper: styles.FleetDrawerPaper }}
      >
        ...
      </Drawer> */}
      {isFleetDialogOpen && (
        <>
          <div
            className={styles.sidebarOverlay}
            onClick={() => setIsFleetDialogOpen(false)}
          ></div>
          <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <h2>Vehicle Management</h2>
              <button
                onClick={() => setIsFleetDialogOpen(false)}
                className={styles.closeSidebarButton}
              >
                <X />
              </button>
            </div>
            <div className={styles.sidebarBody}>
              <div className={styles.fleetSection}>
                <div
                  className={styles.requestCard}
                  style={{ marginBottom: "12px" }}
                >
                  <div className="fleet-summary-box-dashboard"> 
                  <div  className={styles.cardUser} style={{ marginBottom: 0 }}>
                    <strong>Fleet Summary</strong>
                    <p>Active Vans - {fleetCounts.active}</p>
                    <p>VOR - {fleetCounts.vor}</p>
                    <p>Total Vans - {fleetCounts.total}</p>
                  </div>
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
                    onChange={(e) =>
                      setVehicleStatus(e.target.value as "1" | "0")
                    }
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
                        className={`${styles.fleetItem} ${
                          isVor ? styles.fleetItemVor : ""
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
                            className={`${styles.fleetStatus} ${
                              isVor ? styles.statusVor : styles.statusActive
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
                                handleDeactivateVehicle(
                                  vehicle.vehicle_number?.trim()
                                )
                              }
                            >
                              Inactivate
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {!sortedVehicles.length && (
                    <Typography className={styles.FleetEmpty}>
                      No fleet data found.
                    </Typography>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Box>
  );
};
