import sharedStyles from "../dashboard-page.module.scss";
import styles from "./linechart-section.module.scss";
import statStyles from "../stat-section/stat-section.module.scss";
import classNames from "classnames";

import { useMemo, useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";

import {
  Typography,
  Box,
  CircularProgress,
  Popover,
  Button,
} from "@material-ui/core";
import {
  FleetVehicle,
  FleetVehiclePayload,
  TypeStatistic,
} from "@models/dashboard.models";
import { DashboardApi } from "@api/dashboard/dashboard.api";

import { PieChart } from "@components/charts/pie-chart/pie-chart";
import { DatePicker, DateState } from "@components/date-picker/date-picker";

import {
  LineChart,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";

import { ReactComponent as ArrowIcon } from "@assets/images/arrow-right-yellow-icon.svg";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";

import moment from "moment";

interface Props {
  caseTypes: TypeStatistic[];
  fleetVehicles: FleetVehicle[];
}

interface LinearChartData {
  date: string;
  cases: number;
}

const COLORS = ["#F9E28A", "#FADA63", "#FDA92B", "#FCA82B", "#EA8F04"];

const isVehicleInactive = (status?: string) => status?.trim() === "0";
const car = `${process.env.PUBLIC_URL}/1.png`;

export const LineChartSection: React.FC<Props> = ({
  caseTypes,
  fleetVehicles,
}) => {
  const data = useMemo(
    () =>
      caseTypes.reduce<TypeStatistic[]>((prev, current, index) => {
        if (current.percentage) {
          return [...prev, { ...current, fill: COLORS[index % COLORS.length] }];
        } else {
          return prev;
        }
      }, []),
    [caseTypes]
  );

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(false);

  const [appliedDateState, setAppliedDateState] = useState({
    from: moment().subtract("1", "month").startOf("day"),
    to: moment().endOf("day"),
  });

  const [previewDateState, setPreviewDateState] = useState<DateState>({
    from: appliedDateState.from.toDate(),
    to: appliedDateState.to.toDate(),
    enteredTo: appliedDateState.to.toDate(),
  });

  const [linearChartData, setLinearChartData] =
    useState<LinearChartData[] | null>(null);
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

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await DashboardApi.getCasesNumber({
          from: appliedDateState.from.clone().utcOffset(0, true).toISOString(),
          to: appliedDateState.to.clone().utcOffset(0, true).toISOString(),
        });

        const data = res.data.labels.map((label, index) => ({
          date: label,
          cases: res.data.data[index],
        }));

        setLinearChartData(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    })();
  }, [appliedDateState.from, appliedDateState.to]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePreviewChange = useCallback(
    (newState: DateState) => setPreviewDateState(newState),
    []
  );
  const handleReset = () => {
    setPreviewDateState({
      from: appliedDateState.from.toDate(),
      to: appliedDateState.to.toDate(),
      enteredTo: appliedDateState.to.toDate(),
    });
  };

  const handleApply = () => {
    const from = moment(previewDateState.from).startOf("day");
    const to = previewDateState.to
      ? moment(previewDateState.to).endOf("day")
      : from;
    setAppliedDateState({
      from,
      to,
    });
    handleClose();
  };

  const renderYearTick = useCallback((tickProps: any) => {
    const { x, y, payload } = tickProps;

    return (
      <>
        <text
          className={styles.Date}
          fill="#ccc"
          x={x}
          y={y + 10}
          textAnchor="middle"
        >
          {payload.value}
        </text>
        ;
      </>
    );
  }, []);

  return (
    <Box className={classNames(sharedStyles.Section, styles.LineChartSection)}>
      <Box className={classNames(sharedStyles.Card, styles.LineChartCard)}>
        <div className={styles.Header}>
          {loading && (
            <div className="overlay-loader with-opacity">
              <CircularProgress
                size="6rem"
                variant="indeterminate"
                disableShrink
              />
            </div>
          )}
          <Typography className={sharedStyles.CardTitle}>
            Total number of cases
          </Typography>
          <div className={styles.SelectWrapper} onClick={handleClick}>
            <Typography className={styles.Period}>
              {appliedDateState.from.format("DD MMM YYYY")} - {""}
              {appliedDateState.to.format("DD MMM YYYY")}
            </Typography>

            <ArrowIcon
              className={classNames(sharedStyles.ArrowIcon, {
                [sharedStyles.ArrowIconOpen]: false,
              })}
            />
          </div>
          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleClose}
            onExited={handleReset}
            disablePortal
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            classes={{
              paper: styles.Paper,
            }}
          >
            <DatePicker
              range={previewDateState}
              onChange={handlePreviewChange}
              disabledFuture
            />
            <div className={styles.PopoverFooter}>
              <div className={styles.ResetWrapper}>
                <Button
                  disableElevation
                  disableRipple
                  className="button-tertiary"
                  onClick={handleReset}
                >
                  <DeleteIcon className={styles.ResetIcon} />
                  <Typography className={styles.ResetText}>
                    Reset All
                  </Typography>
                </Button>
              </div>
              <div>
                <Button
                  disableElevation
                  disableRipple
                  className="button-tertiary"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  className="button-primary"
                  color="primary"
                  variant="contained"
                  disableElevation
                  disableRipple
                  onClick={handleApply}
                >
                  Apply
                </Button>
              </div>
            </div>
          </Popover>
        </div>
        <div className={styles.Chart}>
          {linearChartData && (
            <ResponsiveContainer>
              <LineChart
                data={linearChartData}
                margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="linegradient" x1="0%">
                    <stop offset="0" stopColor="#FDCA0F" />
                    <stop offset="100%" stopColor="#FBF2D4" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#EDF1F7" strokeWidth={1} />
                <XAxis
                  interval="preserveStartEnd"
                  dataKey="date"
                  stroke="#eee"
                  strokeWidth={1}
                  tick={renderYearTick}
                  tickLine={{ stroke: "#CFCFCF" }}
                  tickMargin={10}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#eee"
                  strokeWidth={1}
                  tick={{ fill: "#CFCFCF" }}
                  tickLine={{ stroke: "#CFCFCF" }}
                  tickMargin={10}
                />
                <Tooltip />

                <Line
                  type="natural"
                  dataKey="cases"
                  stroke="url(#linegradient)"
                  strokeWidth={2}
                  dot={{ stroke: "#FFB934", strokeWidth: 2, fill: "#FFB934" }}
                  activeDot={{ strokeWidth: 2, r: 7, fill: "#ffda52" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Box>
      {/* Case type card intentionally retained for reference.
      <Box className={classNames(sharedStyles.Card, styles.CaseTypeCard)}>
        <Typography className={sharedStyles.CardTitle}>Case type</Typography>
        <PieChart data={data} labelKey="type" dataKey="percentage" />
      </Box> */}
      <Box
        className={classNames(
          sharedStyles.Card,
          styles.FleetSummaryCard,
          statStyles.FleetCard
        )}
        onClick={() => setIsFleetDialogOpen(true)}
      >
        <Box className={statStyles.FleetLeft}>
          <img src={car} alt="Fleet" className={statStyles.FleetImage} />
          <Typography className={statStyles.CardTitle}>Fleet Summary</Typography>
        </Box>
        <Box className={styles.FleetSummaryStats}>
          <Typography
            className={classNames(
              statStyles.FleetHighlight,
              styles.FleetSummaryLine
            )}
          >
            Active Vans - {fleetCounts.active}
          </Typography>
          <Typography
            className={classNames(
              statStyles.FleetHighlight,
              styles.FleetSummaryLine
            )}
          >
            VOR - {fleetCounts.vor}
          </Typography>
          <Typography
            className={classNames(
              statStyles.FleetTotal,
              styles.FleetSummaryLine
            )}
          >
            Total Vans - {fleetCounts.total}
          </Typography>
        </Box>
      </Box>
      {isFleetDialogOpen && (
        <>
          <div
            className={statStyles.sidebarOverlay}
            onClick={() => setIsFleetDialogOpen(false)}
          ></div>
          <div className={statStyles.sidebar}>
            <div className={statStyles.sidebarHeader}>
              <h2>Vehicle Management</h2>
              <button
                onClick={() => setIsFleetDialogOpen(false)}
                className={statStyles.closeSidebarButton}
              >
                <X />
              </button>
            </div>
            <div className={statStyles.sidebarBody}>
              <div className={statStyles.fleetSection}>
                <div
                  className={statStyles.requestCard}
                  style={{ marginBottom: "12px" }}
                >
                  <div
                    className={statStyles.cardUser}
                    style={{ marginBottom: 0 }}
                  >
                    <strong>Fleet Summary</strong>
                    <p>Active Vans - {fleetCounts.active}</p>
                    <p>VOR - {fleetCounts.vor}</p>
                    <p>Total Vans - {fleetCounts.total}</p>
                  </div>
                </div>
                <div className={statStyles.fleetHeader}>
                  <h3>Fleet List</h3>
                  <button
                    onClick={clearVehicleForm}
                    className={statStyles.fleetClearButton}
                  >
                    Clear
                  </button>
                </div>

                <div className={statStyles.formGroup}>
                  <label>Van Name</label>
                  <div className={statStyles.inputWrapper}>
                    <input
                      type="text"
                      value={vehicle_name}
                      onChange={(e) => setVehicleName(e.target.value)}
                      className={statStyles.inputField}
                      placeholder="e.g., Ford Transit"
                    />
                  </div>
                </div>

                <div className={statStyles.formGroup}>
                  <label>Registration</label>
                  <div className={statStyles.inputWrapper}>
                    <input
                      type="text"
                      value={vehicle_number}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className={statStyles.inputField}
                      placeholder="e.g., AB12 CDE"
                      disabled={editingVehicleNumber !== null}
                    />
                  </div>
                </div>

                <div className={statStyles.formGroup}>
                  <label>Type</label>
                  <div className={statStyles.inputWrapper}>
                    <input
                      type="text"
                      value={vehicle_type}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className={statStyles.inputField}
                      placeholder="e.g., LWB"
                    />
                  </div>
                </div>

                <div className={statStyles.formGroup}>
                  <label>NoS</label>
                  <div className={statStyles.inputWrapper}>
                    <input
                      type="text"
                      value={vehicle_nos}
                      onChange={(e) => setVehicleNos(e.target.value)}
                      className={statStyles.inputField}
                      placeholder="e.g., 2"
                    />
                  </div>
                </div>

                <div className={statStyles.formGroup}>
                  <label>Status</label>
                  <select
                    value={vehicle_status}
                    onChange={(e) =>
                      setVehicleStatus(e.target.value as "1" | "0")
                    }
                    className={statStyles.fleetStatusSelect}
                  >
                    <option value="1">ACTIVE</option>
                    <option value="0">VOR</option>
                  </select>
                </div>

                <div className={statStyles.formGroup}>
                  <label>Description / Notes</label>
                  <textarea
                    value={vehicle_rph}
                    onChange={(e) => setVehicleRph(e.target.value)}
                    className={statStyles.fleetNotes}
                    placeholder="e.g., Mechanic booking 15/03 or flat tyre at depot"
                    rows={2}
                  />
                </div>

                <div className={statStyles.formActions}>
                  <button
                    className={statStyles.publishButton}
                    onClick={handleVehicleSubmit}
                  >
                    {editingVehicleNumber ? "Update Van" : "Add Van"}
                  </button>
                </div>

                <div className={statStyles.fleetList}>
                  {sortedVehicles.map((vehicle) => {
                    const isVor = isVehicleInactive(vehicle.vehicle_status);
                    return (
                      <div
                        key={vehicle.id}
                        className={`${statStyles.fleetItem} ${
                          isVor ? statStyles.fleetItemVor : ""
                        }`}
                      >
                        <div
                          className={statStyles.fleetItemMain}
                          title={vehicle.vehicle_rph || "No notes"}
                        >
                          <span className={statStyles.fleetRegistration}>
                            {vehicle.vehicle_number}
                          </span>
                          <span>{vehicle.vehicle_name}</span>
                          <span
                            className={`${statStyles.fleetStatus} ${
                              isVor
                                ? statStyles.statusVor
                                : statStyles.statusActive
                            }`}
                          >
                            {isVor ? "VOR" : "ACTIVE"}
                          </span>
                        </div>
                        <div className={statStyles.fleetActions}>
                          <button
                            className={statStyles.editFleetButton}
                            onClick={() => handleEditVehicle(vehicle)}
                          >
                            Edit
                          </button>
                          {!isVor && (
                            <button
                              className={statStyles.deleteFleetButton}
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
                    <Typography className={statStyles.FleetEmpty}>
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
