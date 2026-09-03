import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import styles from "../styles/DailyRostering.module.scss";
import { CheckCircle, Clock, Trash2, Edit3, Circle, AlertCircle, CheckSquare, Square, ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";
import {
  SchedulingApi,
  SchedulingDriver,
  SchedulingVehicle,
} from "@api/scheduling.api";
import { useDragAutoScroll } from "@hooks/useDragAutoScroll";

interface ServiceTypeStat {
  id: number | string;
  name: string;
  abbrev: string;
  total: number;
}

interface RosterAssignment {
  id: number | string;
  sourceDriverId?: number;
  driverRemoveId?: number;
  vehicleId?: number;
  vehicleRemoveId?: number;
  name: string;
  waveId: number | string;
  van: string;
  service: string;
  time: string;
  confirmed: boolean;
}

interface Driver {
  id: number;
  first_name: string;
  middle_name?: string | null;
  surname: string;
}

const DRIVER_ASSIGNMENTS: RosterAssignment[] = [
  { id: 1, name: "Gerald Dumisani Jeche", waveId: 1, van: "VZ12 TPK", service: "SV", time: "Today, 8:15 AM", confirmed: true },
  { id: 2, name: "Sorin Alin Gorovei", waveId: 1, van: "LK67 RWO", service: "SV", time: "Today, 8:42 AM", confirmed: true },
  { id: 3, name: "Jaden Fattunbi", waveId: 1, van: "VA24 KOE", service: "SV", time: "Today, 8:20 AM", confirmed: true },
  { id: 4, name: "Violeta Aurelia Chiriac", waveId: 2, van: "KS74 YXC", service: "MV", time: "Today, 7:50 AM", confirmed: true },
  { id: 5, name: "Christopher Higgins", waveId: 2, van: "KP27 WDT", service: "MV", time: "Today, 8:10 AM", confirmed: true },
  { id: 6, name: "Harry Johnson", waveId: 2, van: "NU21 TWF", service: "MV", time: "Today, 9:15 AM", confirmed: true },
  { id: 7, name: "Gerald Dumisani Jeche", waveId: 3, van: "VZ12 TPK", service: "LEV", time: "Today, 8:15 AM", confirmed: true }, // dummy repeated name from screenshot
  { id: 8, name: "Gerald Dumisani Jeche", waveId: 3, van: "VZ12 TPK", service: "LEV", time: "Today, 8:42 AM", confirmed: true },
  { id: 9, name: "Gerald Dumisani Jeche", waveId: 3, van: "VZ12 TPK", service: "LEV", time: "Today, 8:15 AM", confirmed: true },
  { id: 10, name: "Gerald Dumisani Jeche", waveId: 4, van: "VZ12 TPK", service: "STD", time: "Today, 8:42 AM", confirmed: true },
  { id: 11, name: "Gerald Dumisani Jeche", waveId: 4, van: "VZ12 TPK", service: "STD", time: "Today, 8:15 AM", confirmed: true },
];

interface WorkforceDriver extends SchedulingDriver {
  confirmed: boolean;
}

const getDriverFullName = (driver: SchedulingDriver) =>
  [driver.first_name, driver.middle_name, driver.surname]
    .filter(Boolean)
    .map((name) => name!.trim())
    .join(" ");

const isConfirmedValue = (value: unknown) =>
  ["true", "1"].includes(String(value).trim().toLowerCase());

const formatConfirmationTime = (rawTimeStr?: string | null): string => {
  if (!rawTimeStr || rawTimeStr === "null" || rawTimeStr === "undefined") return "";
  try {
    const d = new Date(rawTimeStr);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${day}/${month} ${hours}:${minutes} ${ampm}`;
    }
    return "";
  } catch (e) {
    return "";
  }
};

const formatTime12h = (timeStr: string) => {
  if (!timeStr) return "11:00 AM";
  if (timeStr.toLowerCase().includes("am") || timeStr.toLowerCase().includes("pm")) {
    return timeStr;
  }
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return timeStr;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = String(minutes).padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const DailyRosteringTab: React.FC = () => {
  useDragAutoScroll();

  const [drivers, setDrivers] = useState<WorkforceDriver[]>([]);
  const [workforceSearch, setWorkforceSearch] = useState("");
  const [driverDateFilter, setDriverDateFilter] = useState<string>(getTodayDateString());
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  const [driversError, setDriversError] = useState("");
  const [vehicles, setVehicles] = useState<SchedulingVehicle[]>([]);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [allDrivers, setallDrivers] = useState<Driver[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [vehiclesError, setVehiclesError] = useState("");
  const [driverVehicles, setDriverVehicles] = useState<Record<number, { vehicleId: number; van: string; vehicleRemoveId?: number }>>({});
  const [driverAssignments, setDriverAssignments] =
    useState<RosterAssignment[]>([]);
  const [allServiceDetails, setAllServiceDetails] = useState<Record<string | number, any>>({});
  const [selectedDriverIds, setSelectedDriverIds] = useState<Set<number>>(
    new Set(),
  );
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeStat[]>([]);
  const [isLoadingServiceTypes, setIsLoadingServiceTypes] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<number | string | null>(null);
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<any | null>(null);
  const [standbyDrivers, setStandbyDrivers] = useState<{ id: number | string; name: string; service: string; availability_id?: number }[]>([]);
  const [isLoadingStandby, setIsLoadingStandby] = useState(true);
  const [standbyError, setStandbyError] = useState("");
  const [isLoadingServiceDetail, setIsLoadingServiceDetail] = useState(false);
  const [currentStartIndex, setCurrentStartIndex] = useState(0);

  const fetchDriverVehicles = async (dateFilter: string = driverDateFilter, signal?: AbortSignal) => {
    try {
      const targetDate = dateFilter || getTodayDateString();

      const baseUrl = process.env.REACT_APP_PHP_BASE_URL || "https://api-stage-hrs.srul.co.uk/api";
      const response = await fetch(
        `${baseUrl}/drivers_schedule/?start_date=${targetDate}&end_date=${targetDate}`,
        { signal }
      );
      if (!response.ok) throw new Error("Failed to fetch drivers schedule");
      const data = await response.json();
      if (data.status === 1 && Array.isArray(data.drivers)) {
        const vehicleMap: Record<number, { vehicleId: number; van: string; vehicleRemoveId?: number }> = {};
        data.drivers.forEach((driver: any) => {
          const scheduleForDate = driver.schedule?.[targetDate];
          const assignedVehicles = scheduleForDate?.assignedVehicle;
          if (Array.isArray(assignedVehicles) && assignedVehicles.length > 0) {
            const v = assignedVehicles[0];
            if (v && (v.vehicle_number || v.number)) {
              vehicleMap[driver.id] = {
                vehicleId: v.vehicle_id || v.id,
                van: v.vehicle_number || v.number,
                vehicleRemoveId: v.assigned_vehicle_id || v.id,
              };
            }
          }
        });
        setDriverVehicles(vehicleMap);
      }
    } catch (error) {
      console.error("Failed to fetch driver vehicle assignments:", error);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchDriverVehicles(driverDateFilter, controller.signal);
    return () => controller.abort();
  }, [driverDateFilter]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchServiceTypes = async () => {
      try {
        setIsLoadingServiceTypes(true);
        const data = await SchedulingApi.getServiceTypes(controller.signal);
        const rawList = Array.isArray(data)
          ? data
          : data.service_types || data.data || [];

        const formatted: ServiceTypeStat[] = rawList.map(
          (item: any, index: number) => ({
            id: item.id || item.service_id || index + 1,
            name: item.service_name || item.name || "",
            abbrev: item.abbreviation || item.abbrev || "",
            total: parseInt(
              item.no_of_drivers || item.quota || item.total || 0,
              10,
            ),
          }),
        );

        setServiceTypes(formatted);

        // Fetch details for all service types in parallel so rostered counts for all service tabs are known on page refresh
        try {
          const detailResults = await Promise.all(
            formatted.map(async (st) => {
              try {
                const res = await SchedulingApi.getServiceTypeById(st.id, driverDateFilter, controller.signal);
                const detail = res.service_info || res.data || res.service_type || res.service || res;
                return { id: st.id, detail };
              } catch {
                return { id: st.id, detail: null };
              }
            })
          );
          const detailsMap: Record<string | number, any> = {};
          detailResults.forEach((item) => {
            if (item.detail) {
              detailsMap[item.id] = item.detail;
            }
          });
          setAllServiceDetails((prev) => ({ ...prev, ...detailsMap }));
        } catch (err) {
          console.error("Failed to fetch initial service details for all services:", err);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Failed to fetch service types:", error);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingServiceTypes(false);
      }
    };

    fetchServiceTypes();
    return () => controller.abort();
  }, [driverDateFilter]);

  const fetchServiceDetail = async (serviceId: number | string, overrideDate?: string) => {
    const dateToUse = overrideDate || driverDateFilter;
    try {
      setIsLoadingServiceDetail(true);
      const res = await SchedulingApi.getServiceTypeById(serviceId, dateToUse);
      const detail = res.service_info || res.data || res.service_type || res.service || res;
      setSelectedServiceDetail(detail);
      setAllServiceDetails((prev) => ({ ...prev, [serviceId]: detail }));
    } catch (error) {
      console.error("Failed to fetch service type detail by ID:", error);
    } finally {
      setIsLoadingServiceDetail(false);
    }
  };

  const handleSelectService = async (serviceId: number | string | null) => {
    if (selectedServiceId === serviceId) {
      return;
    }

    setSelectedServiceId(serviceId);
    setSelectedServiceDetail(null);

    if (serviceId !== null) {
      await fetchServiceDetail(serviceId);
    }
  };

  const refreshAllServiceDetails = async (overrideDate?: string) => {
    const dateToUse = overrideDate || driverDateFilter;
    try {
      const detailResults = await Promise.all(
        serviceTypes.map(async (st) => {
          try {
            const res = await SchedulingApi.getServiceTypeById(st.id, dateToUse);
            const detail = res.service_info || res.data || res.service_type || res.service || res;
            return { id: st.id, detail };
          } catch {
            return { id: st.id, detail: null };
          }
        })
      );
      const detailsMap: Record<string | number, any> = {};
      detailResults.forEach((item) => {
        if (item.detail) {
          detailsMap[item.id] = item.detail;
        }
      });
      setAllServiceDetails(detailsMap);
    } catch (err) {
      console.error("Failed to refresh service details:", err);
    }
  };

  const serviceStats = useMemo(() => {
    return serviceTypes.map((st) => {
      const rosteredCount = driverAssignments.filter((assignment) => {
        if (!assignment.service) return false;
        const s = assignment.service.trim().toLowerCase();
        return (
          (st.abbrev && s === st.abbrev.trim().toLowerCase()) ||
          (st.name && s === st.name.trim().toLowerCase())
        );
      }).length;

      return {
        ...st,
        rostered: rosteredCount,
      };
    });
  }, [serviceTypes, driverAssignments]);

  const selectedServiceType = useMemo(() => {
    if (selectedServiceId === null) return null;
    return (
      serviceTypes.find(
        (st) => String(st.id) === String(selectedServiceId),
      ) || null
    );
  }, [selectedServiceId, serviceTypes]);

  const displayedWaves = useMemo(() => {
    if (selectedServiceId === null) {
      const waveMap = new Map<string | number, { id: number | string; name: string; time: string }>();

      Object.values(allServiceDetails).forEach((detail: any) => {
        if (!detail) return;
        const wavesObjList =
          detail.wave_list ||
          (Array.isArray(detail.waves) ? detail.waves : null);

        if (Array.isArray(wavesObjList)) {
          wavesObjList.forEach((w: any, idx: number) => {
            const data = w.wavedata || w;
            const id = data.id || data.wave_id || idx + 1;
            if (!waveMap.has(id)) {
              waveMap.set(id, {
                id,
                name: data.shift_name || data.wave_name || data.name || `Wave ${id}`,
                time: formatTime12h(data.start_time || data.wave_time || data.time),
              });
            }
          });
        }
      });

      driverAssignments.forEach((a) => {
        if (a.waveId && !waveMap.has(a.waveId)) {
          waveMap.set(a.waveId, {
            id: a.waveId,
            name: `Wave ${a.waveId}`,
            time: "11:00 AM",
          });
        }
      });

      const allWaves = Array.from(waveMap.values());

      // Filter out waves that have NO driver assigned to them when Rostered is selected
      const wavesWithDrivers = allWaves.filter((wave) => {
        return driverAssignments.some(
          (d) => String(d.waveId) === String(wave.id)
        );
      });

      wavesWithDrivers.sort((a, b) => {
        const numA = parseInt(String(a.id), 10);
        const numB = parseInt(String(b.id), 10);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return String(a.name).localeCompare(String(b.name));
      });

      return wavesWithDrivers;
    }

    if (!selectedServiceDetail) {
      return [];
    }

    const wavesObjList =
      selectedServiceDetail.wave_list ||
      (Array.isArray(selectedServiceDetail.waves)
        ? selectedServiceDetail.waves
        : null);

    if (Array.isArray(wavesObjList) && wavesObjList.length > 0) {
      return wavesObjList.map((w: any, idx: number) => {
        const data = w.wavedata || w;
        return {
          id: data.id || data.wave_id || idx + 1,
          name: data.shift_name || data.wave_name || data.name || `Wave ${data.id || idx + 1}`,
          time: formatTime12h(data.start_time || data.wave_time || data.time),
        };
      });
    }

    return [];
  }, [selectedServiceId, selectedServiceDetail, allServiceDetails, driverAssignments]);

  const visibleWaves = useMemo(() => {
    return displayedWaves.slice(currentStartIndex, currentStartIndex + 4);
  }, [displayedWaves, currentStartIndex]);

  useEffect(() => {
    setCurrentStartIndex(0);
  }, [selectedServiceId]);

  const handlePrevWave = () => {
    setCurrentStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextWave = () => {
    setCurrentStartIndex((prev) =>
      Math.min(displayedWaves.length - 4, prev + 1),
    );
  };

  const displayedAssignments = useMemo(() => {
    if (selectedServiceId === null || !selectedServiceType) {
      return driverAssignments;
    }

    const targetAbbrev = (selectedServiceType.abbrev || "").trim().toLowerCase();
    const targetName = (selectedServiceType.name || "").trim().toLowerCase();

    return driverAssignments.filter((assignment) => {
      if (!assignment.service) return false;
      const s = assignment.service.trim().toLowerCase();
      return (
        (targetAbbrev && s === targetAbbrev) ||
        (targetName && s === targetName)
      );
    });
  }, [selectedServiceId, selectedServiceType, driverAssignments]);

  const totalRosteredCount = useMemo(() => {
    return driverAssignments.length;
  }, [driverAssignments]);

  const totalRequiredTarget = useMemo(() => {
    return serviceStats.reduce((sum, item) => sum + item.total, 0);
  }, [serviceStats]);

  useEffect(() => {
    if (Object.keys(allServiceDetails).length === 0) {
      setDriverAssignments([]);
      return;
    }

    const compiledAssignments: RosterAssignment[] = [];

    serviceTypes.forEach((st) => {
      const detail = allServiceDetails[st.id];
      if (!detail) return;

      const wavesList = detail.wave_list || detail.waves || [];
      if (!Array.isArray(wavesList)) return;

      const targetServiceStr = st.abbrev || st.name || "";

      wavesList.forEach((w: any) => {
        const data = w.wavedata || w;
        const waveId = data.id || data.wave_id;

        // Extract drivers from wavevehicle object, or fall back to wavedrivers/wave_drivers array
        let driverIds: any[] = [];
        const waveVehicleObj = w.wavevehicle;
        if (waveVehicleObj && typeof waveVehicleObj === "object" && !Array.isArray(waveVehicleObj)) {
          driverIds = Object.keys(waveVehicleObj).map(Number);
        } else if (Array.isArray(w.wavedrivers || w.wave_drivers)) {
          driverIds = w.wavedrivers || w.wave_drivers || [];
        }

        if (Array.isArray(driverIds)) {
          driverIds.forEach((driverId: any) => {
            const numericId = Number(driverId);
            const driverObj = drivers.find((d) => d.id === numericId);
           // const alldriverObj = allDrivers.find((d) => d.id === numericId);

            let vehicleIdVal: number | undefined = undefined;
            let driverRemoveIdVal: number | undefined = undefined;
            let vehicleRemoveIdVal: number | undefined = undefined;
            let confirmedTimeVal: string | undefined = undefined;

            if (waveVehicleObj && waveVehicleObj[numericId]) {
              const vInfo = waveVehicleObj[numericId];
              if (vInfo.vehicle_id) vehicleIdVal = Number(vInfo.vehicle_id);
              if (vInfo.driver_remove_id) driverRemoveIdVal = Number(vInfo.driver_remove_id);
              if (vInfo.vehicle_remove_id) vehicleRemoveIdVal = Number(vInfo.vehicle_remove_id);
              if (vInfo.availability_confirmed_time || vInfo.confirmed_time) {
                confirmedTimeVal = vInfo.availability_confirmed_time || vInfo.confirmed_time;
              }
            }

            if (!confirmedTimeVal && driverObj) {
              confirmedTimeVal = (driverObj as any).availability_confirmed_time || (driverObj as any).confirmed_time;
            }

            const formattedTime = confirmedTimeVal
              ? formatConfirmationTime(confirmedTimeVal)
              : "";

            let vanVal = "Unassigned";
            if (vehicleIdVal) {
              const foundVehicle = vehicles.find((v) => v.id === vehicleIdVal);
              if (foundVehicle) {
                vanVal = foundVehicle.vehicle_number;
              }
            }
            if (vanVal === "Unassigned") {
              const vehicleInfo = driverVehicles[numericId];
              vanVal = vehicleInfo ? vehicleInfo.van : "Unassigned";
              if (!vehicleIdVal && vehicleInfo) {
                vehicleIdVal = vehicleInfo.vehicleId;
              }
              if (!vehicleRemoveIdVal && vehicleInfo) {
                vehicleRemoveIdVal = vehicleInfo.vehicleRemoveId;
              }
            }

            if (driverObj) {
              compiledAssignments.push({
                id: `api-driver-${st.id}-${numericId}`,
                sourceDriverId: numericId,
                driverRemoveId: driverRemoveIdVal,
                vehicleRemoveId: vehicleRemoveIdVal,
                name: getDriverFullName(driverObj),
                waveId: Number(waveId),
                van: vanVal,
                vehicleId: vehicleIdVal,
                service: targetServiceStr,
                time: formattedTime,
                confirmed: driverObj.confirmed,
              });
            } else {
			console.log("allDrivers");
			console.log(allDrivers);
			 const alldriverObj = allDrivers.find((d) => d?.id === numericId);
			 let nnnn: string = '#';
			 if(alldriverObj){ console.log("allDrivers======");  console.log(alldriverObj); nnnn= getDriverFullName(alldriverObj);}
			 
              compiledAssignments.push({
                id: `api-driver-${st.id}-${numericId}`,
                sourceDriverId: numericId,
                driverRemoveId: driverRemoveIdVal,
                vehicleRemoveId: vehicleRemoveIdVal,
                name: nnnn,
                waveId: Number(waveId),
                van: vanVal,
                vehicleId: vehicleIdVal,
                service: targetServiceStr,
                time: formattedTime,
                confirmed: false,
              });
            }
          });
        }
      });
    });

    setDriverAssignments(compiledAssignments);
  }, [allServiceDetails, serviceTypes, drivers, driverVehicles, vehicles]);

  const fetchDrivers = useCallback(async (signal?: AbortSignal, silent = false) => {
    try {
      if (!silent) setIsLoadingDrivers(true);
      setDriversError("");

      const data = await SchedulingApi.getAvailableDrivers(driverDateFilter, signal);
      if (data.status !== 1 || !Array.isArray(data.drivers)) {
        throw new Error(data.message || "The drivers response is invalid");
      }

      setDrivers(
        data.drivers
          .filter(
            (driver) => driver && (driver.first_name || driver.surname),
          )
          .map((driver) => ({
            ...driver,
            confirmed: isConfirmedValue(driver.is_driver_confirmed),
          })),
      );
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Failed to fetch drivers:", error);
        setDriversError("Unable to load workforce. Please try again later.");
      }
    } finally {
      if (!silent) setIsLoadingDrivers(false);
    }
  }, [driverDateFilter]);

  useEffect(() => {
    const controller = new AbortController();
    fetchDrivers(controller.signal);
    return () => controller.abort();
  }, [fetchDrivers]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchVehicles = async () => {
      try {
        setIsLoadingVehicles(true);
        setVehiclesError("");

        const data = await SchedulingApi.getVehicles(driverDateFilter, controller.signal);
        if (data.status !== 1 || !Array.isArray(data.vehicles)) {
          throw new Error(data.message || "The vehicles response is invalid");
        }

        setVehicles(data.vehicles);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Failed to fetch vehicles:", error);
          setVehiclesError("Unable to load vans. Please try again later.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingVehicles(false);
      }
    };

    fetchVehicles();
    return () => controller.abort();
  }, [driverDateFilter]);
  
  useEffect(() => {
    const controller = new AbortController();

    const fetchallDrivers = async () => {
      try {
        const data = await SchedulingApi.getAllDrivers(controller.signal);
        if (data.status !== 1 || !Array.isArray(data.drivers)) {
          throw new Error(data.message || "The drivers response is invalid");
        }

        setallDrivers(data.drivers);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Failed to fetch drivers:", error);
        }
      } finally {
      }
    };

    fetchallDrivers();
    return () => controller.abort();
  }, [driverDateFilter]);

  const fetchStandbyDrivers = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoadingStandby(true);
      setStandbyError("");

      const data = (await SchedulingApi.getStandbyDrivers(driverDateFilter, signal)) as any;

      const rawList = Array.isArray(data)
        ? data
        : data.standby_drivers || data.drivers || data.data || [];

      if (!Array.isArray(rawList)) {
        throw new Error("Standby drivers response is invalid");
      }

      setStandbyDrivers(
        rawList
          .filter((driver) => driver && (driver.first_name || driver.surname || driver.name))
          .map((driver) => ({
            id: driver.driver_id || driver.id || driver.availability_id || Math.random().toString(),
            driver_id: driver.driver_id || driver.id,
            name: driver.name || getDriverFullName(driver) || "Unknown Driver",
            service: driver.availability_name || driver.service || driver.service_name || "STD",
            availability_id: driver.availability_id,
          }))
      );
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Failed to fetch standby drivers:", error);
        setStandbyError("Unable to load standby list. Please try again later.");
      }
    } finally {
      setIsLoadingStandby(false);
    }
  }, [driverDateFilter]);

  useEffect(() => {
    const controller = new AbortController();
    fetchStandbyDrivers(controller.signal);
    return () => controller.abort();
  }, [fetchStandbyDrivers]);

  const filteredDrivers = useMemo(() => {
    const query = workforceSearch.trim().toLowerCase();
    const assignedDriverIds = new Set(
      driverAssignments
        .map((assignment) => assignment.sourceDriverId)
        .filter((id): id is number => typeof id === "number" && !isNaN(id)),
    );
    const standbyDriverIds = new Set(
      standbyDrivers.map((s) => Number(s.id)).filter((id) => !isNaN(id)),
    );

    const availableDrivers = drivers.filter(
      (driver) =>
        !assignedDriverIds.has(Number(driver.id)) &&
        !standbyDriverIds.has(Number(driver.id)),
    );

    if (!query) return availableDrivers;

    return availableDrivers.filter((driver) =>
      getDriverFullName(driver)
        .toLowerCase()
        .includes(query),
    );
  }, [driverAssignments, drivers, standbyDrivers, workforceSearch]);

  const availableDriverCount = useMemo(() => {
    const assignedDriverIds = new Set(
      driverAssignments
        .map((assignment) => assignment.sourceDriverId)
        .filter((id): id is number => typeof id === "number"),
    );
    const standbyDriverIds = new Set(
      standbyDrivers.map(s => Number(s.id))
    );
    return drivers.filter((driver) => !assignedDriverIds.has(driver.id) && !standbyDriverIds.has(driver.id)).length;
  }, [driverAssignments, drivers, standbyDrivers]);

  const availableVehicles = useMemo(() => {
    const assignedVehicleIds = new Set(
      driverAssignments
        .map((assignment) => assignment.vehicleId)
        .filter((id): id is number => typeof id === "number"),
    );
    return vehicles.filter((vehicle) => !assignedVehicleIds.has(vehicle.id));
  }, [driverAssignments, vehicles]);

  const filteredVehicles = useMemo(() => {
    const query = vehicleSearch.trim().toLowerCase();
    if (!query) return availableVehicles;

    return availableVehicles.filter((vehicle) =>
      `${vehicle.vehicle_name} ${vehicle.vehicle_number}`
        .toLowerCase()
        .includes(query),
    );
  }, [availableVehicles, vehicleSearch]);

  const handlePrevDate = () => {
    if (!driverDateFilter) return;
    const current = new Date(driverDateFilter + "T00:00:00");
    current.setDate(current.getDate() - 1);
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, "0");
    const dd = String(current.getDate()).padStart(2, "0");
    setDriverDateFilter(`${yyyy}-${mm}-${dd}`);
  };

  const handleNextDate = () => {
    if (!driverDateFilter) return;
    const current = new Date(driverDateFilter + "T00:00:00");
    current.setDate(current.getDate() + 1);
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, "0");
    const dd = String(current.getDate()).padStart(2, "0");
    setDriverDateFilter(`${yyyy}-${mm}-${dd}`);
  };

  const toggleDriverSelection = (driverId: number) => {
    setSelectedDriverIds((current) => {
      const next = new Set(current);
      next.has(driverId) ? next.delete(driverId) : next.add(driverId);
      return next;
    });
  };

  const handleDriverDragStart = (
    event: React.DragEvent<HTMLLIElement>,
    driverId: number,
  ) => {
    const draggedIds = selectedDriverIds.has(driverId)
      ? Array.from(selectedDriverIds)
      : [driverId];

    if (!selectedDriverIds.has(driverId)) {
      setSelectedDriverIds(new Set([driverId]));
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "application/x-workforce-driver-ids",
      JSON.stringify(draggedIds),
    );
  };

  const handleAssignedDriverDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    driver: RosterAssignment,
  ) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "application/x-assigned-driver-payload",
      JSON.stringify(driver),
    );
  };

  const handleStandbyDriverDragStart = (
    event: React.DragEvent<HTMLLIElement>,
    item: { id: number | string; name: string; service: string; availability_id?: number },
  ) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "application/x-standby-driver-payload",
      JSON.stringify(item),
    );
  };

  const handleStandbyDriverDropOnWave = async (
    event: React.DragEvent<HTMLDivElement>,
    targetWaveId: number | string,
  ) => {
    event.preventDefault();
    try {
      const rawData = event.dataTransfer.getData("application/x-standby-driver-payload");
      if (!rawData) return;
      const standbyItem = JSON.parse(rawData);
      const numericDriverId = Number(standbyItem.id);

      let serviceId = selectedServiceId;
      if (serviceId === null || serviceId === undefined) {
        if (serviceTypes.length > 0) serviceId = serviceTypes[0].id;
      }
      if (!serviceId) {
        alert("Please select a service type first.");
        return;
      }

      const response = await SchedulingApi.addServiceTypeWavesDrivers({
        service_id: serviceId,
        wave_id: targetWaveId,
        driver_ids: [numericDriverId],
        service_date: driverDateFilter,
      });

      if (response && (response.status === 1 || response.status === 200 || response.success)) {
        if (standbyItem.availability_id) {
          try {
            await SchedulingApi.removeStandbyDriver(standbyItem.availability_id);
          } catch (err) {
            console.error("Error removing standby driver when assigning to wave:", err);
          }
        }
        setStandbyDrivers((curr) => curr.filter((s) => String(s.id) !== String(standbyItem.id)));

        const driverObj = drivers.find((d) => d.id === numericDriverId);
        const confirmTime = (driverObj as any)?.availability_confirmed_time;
        setDriverAssignments((current) => [
          ...current.filter((a) => a.sourceDriverId !== numericDriverId),
          {
            id: `api-driver-${numericDriverId}`,
            sourceDriverId: numericDriverId,
            name: driverObj ? getDriverFullName(driverObj) : standbyItem.name,
            waveId: Number(targetWaveId),
            van: "Unassigned",
            service: selectedServiceType ? (selectedServiceType.abbrev || selectedServiceType.name) : "—",
            time: confirmTime ? formatConfirmationTime(confirmTime) : "",
            confirmed: driverObj ? driverObj.confirmed : false,
          },
        ]);

        if (selectedServiceId !== null) {
          fetchServiceDetail(selectedServiceId);
        } else {
          refreshAllServiceDetails();
        }
      } else {
        alert(response?.message || "Failed to move standby driver to wave.");
      }
    } catch (error) {
      console.error("Error moving standby driver to wave:", error);
    }
  };

  const handleDriversDrop = async (
    event: React.DragEvent<HTMLDivElement>,
    waveId: number,
  ) => {
    event.preventDefault();

    try {
      const driverIds = JSON.parse(
        event.dataTransfer.getData("application/x-workforce-driver-ids"),
      ) as number[];

      if (driverIds.length === 0) return;

      if (selectedServiceId === null || selectedServiceId === undefined) {
        alert("Please select a service type first.");
        return;
      }

      const response = await SchedulingApi.addServiceTypeWavesDrivers({
        service_id: selectedServiceId,
        wave_id: waveId,
        driver_ids: driverIds,
        service_date: driverDateFilter,
      });

      if (response && (response.status === 1 || response.status === 200 || response.success)) {
        const driverIdSet = new Set(driverIds);
        const droppedDrivers = drivers.filter((driver) =>
          driverIdSet.has(driver.id),
        );

        if (droppedDrivers.length === 0) return;

        // If any dropped driver was in standby, remove them from standby
        for (const driverId of driverIds) {
          const sMatch = standbyDrivers.find((s) => Number(s.id) === Number(driverId));
          if (sMatch && sMatch.availability_id) {
            SchedulingApi.removeStandbyDriver(sMatch.availability_id).catch(console.error);
          }
        }
        setStandbyDrivers((curr) => curr.filter((s) => !driverIdSet.has(Number(s.id))));

        setDriverAssignments((current) => {
          const alreadyAssigned = new Set(
            current
              .map((assignment) => assignment.sourceDriverId)
              .filter((id): id is number => typeof id === "number"),
          );
          const newAssignments = droppedDrivers
            .filter((driver) => !alreadyAssigned.has(driver.id))
            .map<RosterAssignment>((driver) => {
              const confirmTime = (driver as any).availability_confirmed_time;
              return {
                id: `api-driver-${driver.id}`,
                sourceDriverId: driver.id,
                name: getDriverFullName(driver),
                waveId,
                van: "Unassigned",
                service: selectedServiceType ? (selectedServiceType.abbrev || selectedServiceType.name) : "—",
                time: confirmTime ? formatConfirmationTime(confirmTime) : "",
                confirmed: driver.confirmed,
              };
            });

          return [...current, ...newAssignments];
        });
        setSelectedDriverIds(new Set());

        if (selectedServiceId !== null) {
          fetchServiceDetail(selectedServiceId);
        }
      } else {
        alert(response?.message || "Failed to assign driver(s) to wave.");
      }
    } catch (error) {
      console.error("Unable to drop selected drivers:", error);
      alert("An error occurred while assigning driver(s) to wave. Please try again.");
    }
  };

  const handleAssignedDriverDrop = async (
    event: React.DragEvent<HTMLDivElement>,
    targetWaveId: number | string,
  ) => {
    event.preventDefault();

    try {
      const rawData = event.dataTransfer.getData(
        "application/x-assigned-driver-payload",
      );
      if (!rawData) return;
      const assignedDriver = JSON.parse(rawData) as RosterAssignment;

      if (!assignedDriver || !assignedDriver.sourceDriverId) {
        alert("Invalid driver payload.");
        return;
      }

      if (String(assignedDriver.waveId) === String(targetWaveId)) {
        return;
      }

      let serviceId = selectedServiceId;
      if (serviceId === null || serviceId === undefined) {
        const foundSt = serviceTypes.find(
          (st) =>
            (st.abbrev &&
              st.abbrev.trim().toLowerCase() ===
              (assignedDriver.service || "").trim().toLowerCase()) ||
            (st.name &&
              st.name.trim().toLowerCase() ===
              (assignedDriver.service || "").trim().toLowerCase()),
        );
        if (foundSt) {
          serviceId = foundSt.id;
        } else if (serviceTypes.length > 0) {
          serviceId = serviceTypes[0].id;
        }
      }

      if (!serviceId) {
        alert("Could not determine service type for this wave assignment.");
        return;
      }

      const response = await SchedulingApi.addServiceTypeWavesDrivers({
        service_id: serviceId,
        wave_id: targetWaveId,
        driver_ids: [assignedDriver.sourceDriverId],
        service_date: driverDateFilter,
      });

      if (
        response &&
        (response.status === 1 || response.status === 200 || response.success)
      ) {
        setDriverAssignments((current) =>
          current.map((a) => {
            if (
              a.id === assignedDriver.id ||
              (a.sourceDriverId === assignedDriver.sourceDriverId &&
                String(a.waveId) === String(assignedDriver.waveId))
            ) {
              return {
                ...a,
                waveId: Number(targetWaveId),
              };
            }
            return a;
          }),
        );

        if (selectedServiceId !== null) {
          await fetchServiceDetail(selectedServiceId);
        } else {
          await refreshAllServiceDetails();
        }
      } else {
        alert(response?.message || "Failed to move driver to new wave.");
        if (selectedServiceId !== null) {
          fetchServiceDetail(selectedServiceId);
        } else {
          refreshAllServiceDetails();
        }
      }
    } catch (error) {
      console.error("Error moving driver between waves:", error);
      alert(
        "An error occurred while moving the driver to the new wave. Please try again.",
      );
    }
  };

  const handleWaveDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (
      event.dataTransfer.types.includes("application/x-workforce-driver-ids") ||
      event.dataTransfer.types.includes("application/x-assigned-driver-payload") ||
      event.dataTransfer.types.includes("application/x-standby-driver-payload")
    ) {
      event.preventDefault();
    }
  };

  const handleStandbyDragOver = (
    event: React.DragEvent<HTMLUListElement> | React.DragEvent<HTMLDivElement>
  ) => {
    if (
      event.dataTransfer.types.includes(
        "application/x-workforce-driver-ids"
      ) ||
      event.dataTransfer.types.includes(
        "application/x-assigned-driver-payload"
      )
    ) {
      event.preventDefault();
    }
  };

  const handleWorkforceDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.types.includes("application/x-assigned-driver-payload")) {
      try {
        const rawData = event.dataTransfer.getData("application/x-assigned-driver-payload");
        if (!rawData) return;
        const assignedDriver = JSON.parse(rawData) as RosterAssignment;
        if (assignedDriver && assignedDriver.id) {
          await removeDriverAssignment(assignedDriver.id);
          await fetchDrivers(undefined, true);
        }
      } catch (err) {
        console.error("Failed to unassign driver back to workforce:", err);
      }
    } else if (event.dataTransfer.types.includes("application/x-standby-driver-payload")) {
      try {
        const rawData = event.dataTransfer.getData("application/x-standby-driver-payload");
        if (!rawData) return;
        const standbyItem = JSON.parse(rawData);
        setStandbyDrivers((curr) => curr.filter((s) => String(s.id) !== String(standbyItem.id)));
        if (standbyItem && standbyItem.availability_id) {
          await SchedulingApi.removeStandbyDriver(standbyItem.availability_id);
          await fetchDrivers(undefined, true);
        }
      } catch (err) {
        console.error("Failed to unassign standby driver back to workforce:", err);
      }
    }
  };

  const handleStandbyDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (event.dataTransfer.types.includes("application/x-assigned-driver-payload")) {
      try {
        const rawData = event.dataTransfer.getData("application/x-assigned-driver-payload");
        if (rawData) {
          const assignedDriver = JSON.parse(rawData) as RosterAssignment;
          if (assignedDriver && assignedDriver.sourceDriverId) {
            const driverObj = drivers.find((d) => d.id === assignedDriver.sourceDriverId);
            const availabilityId = driverObj?.availability_id;

            // Optimistically add to standby state immediately to prevent temporary flash in driver list
            setStandbyDrivers((curr) => [
              ...curr.filter((s) => String(s.id) !== String(assignedDriver.sourceDriverId)),
              {
                id: assignedDriver.sourceDriverId!,
                name: driverObj ? getDriverFullName(driverObj) : assignedDriver.name,
                service: "STD",
                availability_id: availabilityId,
              },
            ]);

            if (availabilityId) {
              try {
                await SchedulingApi.addStandbyDriver(availabilityId);
              } catch (apiErr) {
                console.error("Failed to add driver to standby via API:", apiErr);
              }
            }

            await removeDriverAssignment(assignedDriver.id);
          }
        }
      } catch (err) {
        console.error("Error moving assigned driver to standby:", err);
      }
      return;
    }

    try {
      const driverIds = JSON.parse(
        event.dataTransfer.getData("application/x-workforce-driver-ids")
      ) as number[];

      if (driverIds.length === 0) return;

      const driverIdSet = new Set(driverIds);
      const droppedDrivers = drivers.filter((driver) => driverIdSet.has(driver.id));

      // Check missing availability IDs first
      for (const driver of droppedDrivers) {
        if (!driver.availability_id) {
          console.error(`Driver ${driver.id} is missing availability_id! Cannot add to standby.`);
          alert(`Driver ${getDriverFullName(driver)} cannot be added (missing availability ID).`);
          return;
        }
      }

      // Optimistically update state immediately
      setStandbyDrivers((current) => {
        const newStandby = droppedDrivers.map((d) => ({
          id: d.id,
          name: [d.first_name, d.middle_name, d.surname].filter(Boolean).join(" "),
          service: "STD",
          availability_id: d.availability_id
        }));

        const existingIds = new Set(current.map(s => String(s.id)));
        const filteredNew = newStandby.filter(s => !existingIds.has(String(s.id)));

        return [...current, ...filteredNew];
      });

      setSelectedDriverIds(new Set());

      // Call API for each dropped driver
      for (const driver of droppedDrivers) {
        try {
          await SchedulingApi.addStandbyDriver(driver.availability_id!);
        } catch (apiError) {
          console.error(`Failed to add driver ${driver.id} to standby via API:`, apiError);
          alert(`Failed to add driver to standby. Please try again.`);
        }
      }
    } catch (error) {
      console.error("Failed to drop drivers to standby:", error);
    }
  };

  const handleWaveDrop = (
    event: React.DragEvent<HTMLDivElement>,
    waveId: number,
  ) => {
    if (
      event.dataTransfer.types.includes("application/x-workforce-driver-ids")
    ) {
      handleDriversDrop(event, waveId);
    } else if (
      event.dataTransfer.types.includes("application/x-assigned-driver-payload")
    ) {
      handleAssignedDriverDrop(event, waveId);
    } else if (
      event.dataTransfer.types.includes("application/x-standby-driver-payload")
    ) {
      handleStandbyDriverDropOnWave(event, waveId);
    }
  };

  const removeDriverAssignment = async (assignmentId: number | string) => {
    const assignment = driverAssignments.find((a) => a.id === assignmentId);
    if (!assignment) return;

    // Use driverRemoveId (the backend's record assignment ID) or fallback to the driver's ID
    const targetId = assignment.driverRemoveId || assignment.sourceDriverId;
    if (!targetId) {
      alert("Cannot remove assignment: Driver ID is missing.");
      return;
    }

    try {
      if (assignment.vehicleRemoveId) {
        try {
          await SchedulingApi.removeDriverVehicle(assignment.vehicleRemoveId);
        } catch (vehError) {
          console.error("Failed to unassign vehicle during driver removal:", vehError);
        }
      }

      const response = await SchedulingApi.removeServiceTypeWavesDriver(targetId);
      if (response && (response.status === 1 || response.status === 200 || response.success)) {
        setDriverVehicles((prev) => {
          const next = { ...prev };
          if (assignment.sourceDriverId) {
            delete next[assignment.sourceDriverId];
          }
          return next;
        });

        setDriverAssignments((current) =>
          current.filter((a) => a.id !== assignmentId),
        );
        fetchDrivers(undefined, true);
        if (selectedServiceId !== null) {
          fetchServiceDetail(selectedServiceId);
        } else {
          refreshAllServiceDetails();
        }
      } else {
        alert(response?.message || "Failed to remove driver from wave.");
      }
    } catch (error) {
      console.error("Error removing driver assignment:", error);
      alert("An error occurred while removing the driver. Please try again.");
    }
  };

  const handleUnassignVehicle = async (assignmentId: number | string) => {
    const assignment = driverAssignments.find((a) => a.id === assignmentId);
    if (!assignment) return;

    const targetId = assignment.vehicleRemoveId;
    if (!targetId) {
      alert("Cannot unassign vehicle: Vehicle assignment ID is missing.");
      return;
    }

    try {
      const response = await SchedulingApi.removeDriverVehicle(targetId);
      if (response && (response.status === 1 || response.status === 200 || response.success)) {
        setDriverVehicles((prev) => {
          const next = { ...prev };
          if (assignment.sourceDriverId) {
            delete next[assignment.sourceDriverId];
          }
          return next;
        });

        setDriverAssignments((current) =>
          current.map((item) =>
            item.id === assignmentId
              ? {
                ...item,
                vehicleId: undefined,
                van: "Unassigned",
                vehicleRemoveId: undefined,
              }
              : item,
          ),
        );

        if (selectedServiceId !== null) {
          fetchServiceDetail(selectedServiceId);
        } else {
          refreshAllServiceDetails();
        }
      } else {
        alert(response?.message || "Failed to unassign vehicle.");
      }
    } catch (error) {
      console.error("Error unassigning vehicle:", error);
      alert("An error occurred while unassigning the vehicle. Please try again.");
    }
  };

  const handleClearRoster = async () => {
    const targetDate = driverDateFilter || getTodayDateString();
    const todayStr = getTodayDateString();

    if (targetDate < todayStr) {
      alert(
        `Roster for past dates (${targetDate}) cannot be cleared. Only today (${todayStr}) and future dates can be cleared.`
      );
      return;
    }

    const confirmClear = window.confirm(
      `Are you sure you want to clear all driver and vehicle roster assignments for ${targetDate}?`
    );
    if (!confirmClear) return;

    try {
      setIsLoadingServiceTypes(true);

      try {
        await SchedulingApi.clearRosterData(targetDate);
      } catch (apiErr) {
        console.warn(
          "Clear daily roster API call warning:",
          apiErr
        );
      }

      // Clear local states
      setDriverAssignments([]);
      setDriverVehicles({});
      setAllServiceDetails({});
      setSelectedServiceDetail(null);
      setSelectedDriverIds(new Set());

      // Refetch drivers, standby drivers, vehicle assignments, and service statistics for the target date
      await fetchDrivers(undefined, true);
      await fetchStandbyDrivers();
      await fetchDriverVehicles(targetDate);
      await refreshAllServiceDetails(targetDate);
      if (selectedServiceId !== null) {
        await fetchServiceDetail(selectedServiceId, targetDate);
      }

      alert(`Successfully cleared roster assignments for ${targetDate}.`);
    } catch (error) {
      console.error("Error clearing roster:", error);
      alert("An error occurred while clearing the roster.");
    } finally {
      setIsLoadingServiceTypes(false);
    }
  };

  // Vehicles use a separate drag payload so they cannot be mistaken for
  // workforce rows when dropped elsewhere on the rostering board.
  const handleVehicleDragStart = (
    event: React.DragEvent<HTMLLIElement>,
    vehicleId: number,
  ) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "application/x-scheduling-vehicle-id",
      String(vehicleId),
    );
  };

  const handleVehicleDrop = async (
    event: React.DragEvent<HTMLDivElement>,
    assignmentId: number | string,
  ) => {
    event.preventDefault();

    const vehicleId = Number(
      event.dataTransfer.getData("application/x-scheduling-vehicle-id"),
    );
    const vehicle = vehicles.find((item) => item.id === vehicleId);
    if (!vehicle) return;

    const assignment = driverAssignments.find((a) => a.id === assignmentId);
    if (!assignment) return;

    const driverId = assignment.sourceDriverId;
    if (!driverId) {
      alert("Cannot assign vehicle: Driver ID is missing.");
      return;
    }

    const assignd_date = driverDateFilter || getTodayDateString();

    try {
      const response = await SchedulingApi.assignDriverVehicle({
        vehicle_id: vehicle.id,
        driver_id: driverId,
        assignd_date,
      });

      if (response && (response.status === 1 || response.status === 200 || response.success)) {
        setDriverVehicles((prev) => ({
          ...prev,
          [driverId]: {
            vehicleId: vehicle.id,
            van: vehicle.vehicle_number,
            vehicleRemoveId: response.assigned_vehicle_id || response.id || response.vehicle_remove_id || (response.data && (response.data.id || response.data.assigned_vehicle_id)),
          },
        }));

        setDriverAssignments((current) =>
          current.map((item) =>
            item.id === assignmentId
              ? {
                ...item,
                vehicleId: vehicle.id,
                van: vehicle.vehicle_number,
              }
              : item,
          ),
        );

        if (selectedServiceId !== null) {
          fetchServiceDetail(selectedServiceId);
        } else {
          refreshAllServiceDetails();
        }
      } else {
        alert(response?.message || "Failed to assign vehicle to driver.");
      }
    } catch (error) {
      console.error("Error assigning vehicle:", error);
      alert("An error occurred while assigning vehicle. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      {/* ───────────────────────────────────────────────────────── */}
      {/* TOP SUMMARY CARDS & DATE FILTER */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className={styles.topCardsRow}>
        <div className={styles.topCards}>
          <div
            className={`${styles.card} ${styles.rosteredCard} ${selectedServiceId === null ? styles.activeRosteredCard : ""
              }`}
            onClick={() => handleSelectService(null)}
            style={{ cursor: "pointer" }}
          >
            <span className={styles.cardTitle}>Rostered</span>
            <span className={styles.cardValue}>
              {totalRosteredCount}/{totalRequiredTarget}
            </span>
            <span className={styles.rosteredCardText}>
              Available Service/
              <br />
              Rostered Drivers
            </span>
          </div>

          {isLoadingServiceTypes ? (
            <div className={styles.card}>
              <span className={styles.cardTitle}>Loading...</span>
            </div>
          ) : (
            serviceStats.map((stat) => {
              const isSelected = String(stat.id) === String(selectedServiceId);
              return (
                <div
                  key={stat.id}
                  className={`${styles.card} ${isSelected ? styles.activeCard : ""}`}
                  onClick={() => handleSelectService(stat.id)}
                  style={{ cursor: "pointer" }}
                >
                  <span className={styles.cardTitle}>{stat.name}</span>
                  <span className={styles.cardValue}>
                    {stat.rostered}/{stat.total}
                  </span>
                  <span className={styles.cardAbbrev}>{stat.abbrev}</span>
                </div>
              );
            })
          )}
        </div>

        <div className={styles.dateFilterWrapper}>
          <div className={styles.topDateFilterPicker}>
            <button
              className={styles.dateNavBtn}
              onClick={handlePrevDate}
              title="Previous Day"
              aria-label="Previous Day"
            >
              <ChevronLeft size={18} />
            </button>

            <div className={styles.datePickerInputWrapper}>
              <Calendar size={18} className={styles.datePickerIcon} />
              <input
                type="date"
                value={driverDateFilter}
                onChange={(e) => setDriverDateFilter(e.target.value)}
                className={styles.topDateInput}
                aria-label="Select date"
              />
            </div>

            <button
              className={styles.dateNavBtn}
              onClick={handleNextDate}
              title="Next Day"
              aria-label="Next Day"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {(() => {
            const targetDate = driverDateFilter || getTodayDateString();
            const isPast = targetDate < getTodayDateString();
            return (
              <button
                type="button"
                className={`${styles.clearDateFilterBtn} ${isPast ? styles.disabled : ""}`}
                onClick={handleClearRoster}
                disabled={isPast}
                title={
                  isPast
                    ? `Roster for past dates (${targetDate}) cannot be cleared`
                    : `Clear driver and vehicle roster assignments for ${targetDate}`
                }
              >
                Clear All
              </button>
            );
          })()}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* MAIN CONTENT AREA */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className={styles.mainContent}>

        {/* WAVES GRID WRAPPER FOR NAVIGATION */}
        <div className={styles.wavesContainerWrapper}>
          {displayedWaves.length > 4 && (
            <button
              className={`${styles.gridNavBtn} ${styles.left}`}
              onClick={handlePrevWave}
              disabled={currentStartIndex === 0}
              title="Previous waves"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <div className={styles.wavesArea} style={{ flex: 1, overflow: "hidden" }}>
            {/* Waves Headers */}
            <div className={styles.wavesHeaderContainer}>
              <div
                className={styles.wavesHeader}
                style={{
                  transform: `translateX(calc(-${currentStartIndex} * (25% + 0.25rem)))`,
                }}
              >
                {displayedWaves.map((wave, idx) => (
                  <div
                    key={wave.id}
                    className={styles.waveTitle}
                    style={
                      displayedWaves.length > 4
                        ? { width: "calc((100% - 3rem) / 4)", flexShrink: 0 }
                        : { flex: 1 }
                    }
                  >
                    <span className={styles.waveName}>{wave.name}</span>
                    <span className={styles.timeIcon}>
                      <Clock size={16} /> {wave.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Waves Columns */}
            <div className={styles.wavesGridContainer}>
              <div
                className={styles.wavesGrid}
                style={{
                  transform: `translateX(calc(-${currentStartIndex} * (25% + 0.25rem)))`,
                }}
              >
                {displayedWaves.map((wave) => {
                  const waveDrivers = displayedAssignments.filter(
                    (d) => String(d.waveId) === String(wave.id),
                  );

                  return (
                    <div
                      key={wave.id}
                      className={styles.waveColumn}
                      onDragOver={handleWaveDragOver}
                      onDrop={(event) => handleWaveDrop(event, wave.id)}
                      style={
                        displayedWaves.length > 4
                          ? { width: "calc((100% - 3rem) / 4)", flexShrink: 0 }
                          : { flex: 1 }
                      }
                    >
                      {waveDrivers.map((driver) => (
                        <div
                          key={driver.id}
                          className={styles.driverCard}
                          draggable
                          onDragStart={(event) =>
                            handleAssignedDriverDragStart(event, driver)
                          }
                          style={{ cursor: "grab" }}
                          onDragOver={(event) => {
                            if (
                              event.dataTransfer.types.includes(
                                "application/x-scheduling-vehicle-id",
                              )
                            ) {
                              event.preventDefault();
                            }
                          }}
                          onDrop={(event) => handleVehicleDrop(event, driver.id)}
                        >
                          <div className={styles.driverCardTop}>
                            <div className={styles.driverCardHeader}>
                              <span className={styles.driverName}>{driver.name}</span>
                            </div>
                            {driver.confirmed ? (
                              <span className={styles.confirmedBadge}>
                                Confirmed <span className={styles.checkMark}>✓</span>
                              </span>
                            ) : (
                              <span className={styles.pendingBadge}>
                                Pending
                              </span>
                            )}
                          </div>

                          <div className={styles.driverCardBottom}>
                            <div className={styles.driverDetails}>
                              {driver.van && driver.van !== "Unassigned" ? (
                                <div className={styles.vanRegContainer}>
                                  <span className={styles.vanReg}>{driver.van}</span>
                                  <span
                                    className={styles.unassignVanIcon}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUnassignVehicle(driver.id);
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    title="Unassign van"
                                  >
                                    &times;
                                  </span>
                                </div>
                              ) : (
                                <span className={styles.vanReg}>{driver.van}</span>
                              )}
                              <span className={styles.serviceBadge}>
                                {driver.service}
                              </span>
                            </div>

                            <div className={styles.driverCardBottomRight}>
                              {driver.time ? <span className={styles.timestamp}>{driver.time}</span> : null}
                              <Trash2
                                className={styles.removeIcon}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeDriverAssignment(driver.id);
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                size={16}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {displayedWaves.length > 4 && (
            <button
              className={`${styles.gridNavBtn} ${styles.right}`}
              onClick={handleNextWave}
              disabled={currentStartIndex + 4 >= displayedWaves.length}
              title="Next waves"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {/* OVERVIEW SIDEBAR */}
        <div className={styles.overviewSidebar}>
          <h3 className={styles.overviewTitle}>All Services Overview</h3>

          <div className={styles.circularChart}>
            <svg className={styles.chartSvg} viewBox="0 0 36 36">
              <path
                className={styles.chartBg}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={styles.chartValue}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className={styles.chartText}>
              <div className={styles.chartNumber}>{totalRequiredTarget}</div>
              <div className={styles.chartLabel}>Required</div>
            </div>
          </div>

          <div className={styles.statsList}>
            <div className={styles.statRow}>
              <span><span className={`${styles.dot} ${styles.green}`}></span> Rostered</span>
              <span className={styles.bold}>{totalRosteredCount}</span>
            </div>
            <div className={styles.statRow}>
              <span><span className={`${styles.dot} ${styles.yellow}`}></span> Remaining</span>
              <span className={styles.bold}>
                {Math.max(0, totalRequiredTarget - totalRosteredCount)}
              </span>
            </div>
            <div className={styles.statRow}>
              <span><span className={`${styles.dot} ${styles.red}`}></span> Exceeding</span>
              <span className={styles.bold}>
                {Math.max(0, totalRosteredCount - totalRequiredTarget)}
              </span>
            </div>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.quotaList}>
            {serviceStats.map((stat) => (
              <div
                key={stat.id}
                className={styles.quotaRow}
                onClick={() => handleSelectService(stat.id)}
                style={{ cursor: "pointer" }}
              >
                <span>
                  {stat.name}
                  {stat.abbrev ? ` (${stat.abbrev})` : ""}
                </span>
                <span>
                  {stat.rostered}/{stat.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* BOTTOM PANELS */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className={styles.bottomPanels}>
        <div
          className={styles.panel}
          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
          onDrop={handleStandbyDrop}
        >
          <div className={`${styles.panelHeader} ${styles.yellow}`}>
            <span className={styles.panelTitle}>
              Standby List <span className={`${styles.countBadge} ${styles.yellow}`}>{standbyDrivers.length}</span>
            </span>
            <span style={{ color: "#6b7280" }}>&#9662;</span>
          </div>
          <ul
            className={styles.panelList}
            style={{ maxHeight: 350, minHeight: 60 }}
          >
            {isLoadingStandby && (
              <li className={styles.panelItem}>Loading standby list...</li>
            )}
            {!isLoadingStandby && standbyError && (
              <li className={styles.panelItem}>{standbyError}</li>
            )}
            {!isLoadingStandby && !standbyError && standbyDrivers.length === 0 && (
              <li className={styles.panelItem}>No standby drivers.</li>
            )}
            {!isLoadingStandby && !standbyError && standbyDrivers.map(item => (
              <li
                key={item.id}
                className={styles.panelItem}
                draggable
                onDragStart={(event) => handleStandbyDriverDragStart(event, item)}
                style={{ cursor: "grab" }}
              >
                <span>{item.name}</span>
                <div className={styles.panelItemRight}>
                  <span className={`${styles.badge} ${styles[item.service.toLowerCase()] || styles.std}`}>{item.service}</span>
                  <span className={styles.thumbIcon}>👍</span>
                  <Trash2
                    className={styles.removeIcon}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!item.availability_id) {
                        alert('Cannot remove driver: missing availability ID.');
                        return;
                      }
                      setStandbyDrivers((curr) => curr.filter((s) => String(s.id) !== String(item.id)));
                      try {
                        await SchedulingApi.removeStandbyDriver(item.availability_id);
                        await fetchDrivers(undefined, true);
                      } catch (err) {
                        console.error('Failed to remove from standby:', err);
                        alert('Failed to remove driver from standby.');
                        fetchStandbyDrivers();
                      }
                    }}
                    size={16}
                    style={{ marginLeft: "8px" }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className={styles.panelFooterLink}>
            View All Standby &rarr;
          </div>
        </div>


        <div
          className={styles.panel}
          onDragOver={(e) => {
            if (
              e.dataTransfer.types.includes("application/x-assigned-driver-payload") ||
              e.dataTransfer.types.includes("application/x-standby-driver-payload")
            ) {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }
          }}
          onDrop={handleWorkforceDrop}
        >
          <div className={`${styles.panelHeader} ${styles.green}`}>
            <span className={styles.panelTitle}>
              Available Workforce <span className={`${styles.countBadge} ${styles.green}`}>{availableDriverCount}</span>
            </span>
            {selectedDriverIds.size > 0 && (
              <span className={styles.selectedCountBadge}>
                {selectedDriverIds.size} Selected
              </span>
            )}
          </div>
          <div className={styles.panelSearch}>
            <input
              type="text"
              placeholder="🔍 Search workforce..."
              value={workforceSearch}
              onChange={(event) => setWorkforceSearch(event.target.value)}
              aria-label="Search workforce"
            />
          </div>
          <ul className={styles.panelList}>
            {isLoadingDrivers && (
              <li className={styles.panelItem}>Loading workforce...</li>
            )}
            {!isLoadingDrivers && driversError && (
              <li className={styles.panelItem}>{driversError}</li>
            )}
            {!isLoadingDrivers && !driversError && filteredDrivers.length === 0 && (
              <li className={styles.panelItem}>No drivers found.</li>
            )}
            {!isLoadingDrivers && !driversError && filteredDrivers.map((driver) => (
              <li
                key={driver.id}
                className={styles.panelItem}
                draggable
                onDragStart={(event) => handleDriverDragStart(event, driver.id)}
                style={{
                  cursor: "grab",
                  backgroundColor: selectedDriverIds.has(driver.id)
                    ? "#ecfdf5"
                    : undefined,
                }}
              >
                <div className={styles.panelItemLeft}>
                  <div
                    role="checkbox"
                    aria-checked={selectedDriverIds.has(driver.id)}
                    aria-label={`Select ${getDriverFullName(driver)}`}
                    tabIndex={0}
                    className={styles.checkboxWrapper}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleDriverSelection(driver.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggleDriverSelection(driver.id);
                      }
                    }}
                  >
                    {selectedDriverIds.has(driver.id) ? (
                      <CheckSquare size={18} className={styles.checkboxChecked} />
                    ) : (
                      <Square size={18} className={styles.checkboxUnchecked} />
                    )}
                  </div>
                  <span className={styles.driverNameText}>
                    {getDriverFullName(driver)}
                  </span>
                </div>
                <div className={styles.panelItemRight}>
                  {driver.confirmed ? (
                    <span className={styles.thumbIcon}>👍</span>
                  ) : (
                    <span className={styles.pendingIcon}>➖</span>
                  )}
                  <span className={`${styles.statusPill} ${driver.confirmed ? styles.confirmed : styles.pending}`}>
                    {driver.confirmed ? 'Confirmed' : 'Pending'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>


        <div className={styles.panel}>
          <div className={`${styles.panelHeader} ${styles.blue}`}>
            <span className={styles.panelTitle}>
              Available Vans <span className={`${styles.countBadge} ${styles.blue}`}>{availableVehicles.length}</span>
            </span>
          </div>
          <div className={styles.panelSearch}>
            <input
              type="text"
              placeholder="🔍 Search van..."
              value={vehicleSearch}
              onChange={(event) => setVehicleSearch(event.target.value)}
              aria-label="Search vans"
            />
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <ul className={styles.panelList} style={{ flex: 1 }}>
              {isLoadingVehicles && (
                <li className={styles.panelItem}>Loading vans...</li>
              )}
              {!isLoadingVehicles && vehiclesError && (
                <li className={styles.panelItem}>{vehiclesError}</li>
              )}
              {!isLoadingVehicles && !vehiclesError && filteredVehicles.length === 0 && (
                <li className={styles.panelItem}>No vans found.</li>
              )}
              {!isLoadingVehicles && !vehiclesError && filteredVehicles.map(vehicle => (
                <li
                  key={vehicle.id}
                  className={styles.panelItem}
                  draggable
                  onDragStart={(event) =>
                    handleVehicleDragStart(event, vehicle.id)
                  }
                  style={{ cursor: "grab" }}
                  title="Drag this van onto a driver card"
                >
                  <div className={styles.vanItem}>
                    <span style={{ fontSize: "1.1rem" }}>🚐</span>
                    {vehicle.vehicle_name} ({vehicle.vehicle_number})
                  </div>
                  <div className={styles.vanAvailable}>
                    <Circle size={10} fill="#10b981" /> Available
                  </div>
                </li>
              ))}
            </ul>
            {/* Van assignment is temporarily hidden. Keeping the markup here
                makes it easy to restore when vehicle assignment is connected. */}
            {/*
              <div style={{flex: 1, display: "flex", flexDirection: "column"}}>
                <div className={styles.vanAssignmentBox}>
                  <div style={{fontSize: "2rem", marginBottom: "0.5rem"}}>🚐</div>
                  Van Assignment
                  <br/>
                  <br/>
                  Select a driver to assign a van
                </div>
              </div>
            */}
          </div>

        </div>

      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* FOOTER */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <span>Last updated: Today, 10:25 AM</span>
          <div className={styles.systemStatus}>
            <span className={`${styles.dot} ${styles.green}`}></span> All systems operational
          </div>
          <div className={styles.footerLegend}>
            <span className={styles.legendConfirmed}>Confirmed</span>
            <span className={styles.legendPending}>Pending</span>
            <span className={styles.legendEdited}>Edited</span>
          </div>
        </div>
        {/* <div className={styles.footerRight}>
          <button className={styles.cancelBtn}>Cancel Changes</button>
          <button className={styles.saveBtn}>Save Changes</button>
        </div> */}
      </div>
    </div>
  );
};
