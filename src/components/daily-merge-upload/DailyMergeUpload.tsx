// src/components/daily-merge-upload/DailyMergeUpload.tsx
import React, { useState, useCallback, useEffect } from "react";
import {
  Upload,
  AlertCircle,
  CheckCircle,
  Download,
  Send,
  Car,
} from "lucide-react";
import * as XLSX from "xlsx";
import styles from "./DailyMergeUpload.module.scss";

interface RoutesRow {
  "Route code": string;
  "Driver name": string;
  "Transporter ID"?: string;
  "Assigned Vehicle"?: string;
  [key: string]: any;
}

interface DispatchRow {
  "Route Code": string;
  "Driver Name"?: string;
  "Holding Lane Arrival Time"?: string | number;
  "Launch Pad Load Time"?: string | number;
  "Staging Location"?: string;
  [key: string]: any;
}

interface MergedRow {
  name: string;
  routeCode: string;
  stagingLocation: string;
  holdingLaneArrivalTime: string | number;
  launchPadLoadTime: string | number;
  assignedVehicle: string;
  transporterId: string;
  status: "matched" | "missing_dispatch" | "missing_route";
}

interface VehicleApiDriverRow {
  name: string;
  routeCode: string;
  stagingLocation: string;
  holdingLaneArrivalTime: string | number;
  launchPadLoadTime: string | number;
  assignedVehicle: string;
  transporterId: string;
  vehicle_id?: number;
  vehicle_name?: string;
}

const API_BASE_URL =
  process.env.REACT_APP_PHP_BASE_URL || "https://your-api-base-url"; // Adjust as needed

const DailyMergeUpload: React.FC = () => {
  const [routesFile, setRoutesFile] = useState<File | null>(null);
  const [dispatchFile, setDispatchFile] = useState<File | null>(null);
  const [routesData, setRoutesData] = useState<RoutesRow[]>([]);
  const [dispatchData, setDispatchData] = useState<DispatchRow[]>([]);
  const [mergedData, setMergedData] = useState<MergedRow[]>([]);
  const [vehicleRows, setVehicleRows] = useState<VehicleApiDriverRow[]>([]);
  const [isVehicleLoading, setIsVehicleLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedDate, setParsedDate] = useState<string>("");
  const [dateMessage, setDateMessage] = useState<string | null>(null);

  const normalizeName = (name: string = "") =>
    name.trim().toLowerCase().replace(/\s+/g, " ");

  const decimalToTime = (value: string | number): string => {
    const decimal = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(decimal) || decimal <= 0) return "";
    const hours = Math.floor(decimal * 24);
    const minutes = Math.floor((decimal * 24 - hours) * 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const formatDateForDisplay = (isoDate: string): string => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}.${month}.${year}`; // → 29.12.2025
    // Alternative: return `${day}/${month}/${year}`; // → 29/12/2025
  };
  const parseDispatchSheet = (
    worksheet: XLSX.WorkSheet,
    fileName: string
  ): any[] => {
    const fileNameLower = fileName.toLowerCase();
    const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
      raw: false,
    });

    if (!rows || rows.length === 0) return [];

    // Inspect top 10 rows for content
    const topRowsText = rows
      .slice(0, 10)
      .map((r) => (Array.isArray(r) ? r.join(" ") : ""))
      .join(" ")
      .toUpperCase();

    // 1. Explicit Check for Old Format Header Signatures
    const hasOldFormatHeaders =
      topRowsText.includes("HOLDING LANE ARRIVAL TIME") ||
      topRowsText.includes("LAUNCH PAD LOAD TIME") ||
      topRowsText.includes("LAUNCH PAD");

    // 2. Explicit Check for New Format Section/Header Signatures
    const hasNewFormatIdentifiers =
      topRowsText.includes("DISPATCH PLAN") ||
      /DISPATCH:\s*[0-9]{1,2}:[0-9]{2}/i.test(topRowsText) ||
      topRowsText.includes("SITE ARRIVAL");

    let isNewFormat = false;
    let isOldFormat = false;

    if (hasOldFormatHeaders && !hasNewFormatIdentifiers) {
      isOldFormat = true;
      isNewFormat = false;
    } else if (hasNewFormatIdentifiers) {
      isNewFormat = true;
      isOldFormat = false;
    }

    // 3. Fallback: Explicit Filename Key Detection
    if (!isNewFormat && !isOldFormat) {
      if (
        fileNameLower.includes("oldformat") ||
        fileNameLower.includes("old_format") ||
        fileNameLower.includes("legacy")
      ) {
        isOldFormat = true;
      } else if (
        fileNameLower.includes("newformat") ||
        fileNameLower.includes("new_format") ||
        fileNameLower.includes("shus") ||
        fileNameLower.includes("dispatch_plan")
      ) {
        isNewFormat = true;
      }
    }

    // Default fallback to Old Format if undetermined
    if (!isNewFormat && !isOldFormat) {
      isOldFormat = true;
    }

    // --- OLD FORMAT PARSER ---
    if (isOldFormat && !isNewFormat) {
      // Dynamically locate the header row (searching rows 0 to 5)
      let headerRow = 1; // Default to row 2 (0-based index 1)
      for (let r = 0; r < Math.min(rows.length, 6); r++) {
        const rowStr = (rows[r] || []).map((c) => String(c || "")).join(" ").toUpperCase();
        if (
          rowStr.includes("ROUTE CODE") ||
          rowStr.includes("STAGING LOCATION") ||
          rowStr.includes("HOLDING LANE") ||
          rowStr.includes("LAUNCH PAD")
        ) {
          headerRow = r;
          break;
        }
      }

      const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
      const headers: string[] = [];

      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({
          r: headerRow,
          c: C,
        });
        const cell = worksheet[cellAddress];
        headers.push(cell ? String(cell.v || "").trim() : `__EMPTY_${C}`);
      }

      return XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        raw: false,
        header: headers,
        range: headerRow + 1,
      });
    }

    // --- NEW FORMAT PARSER (Block / Wave Structured) ---
    const parsedData: any[] = [];
    let currentWave = "";
    let currentDispatchTime = "";
    let columnMap = {
      siteArrival: -1,
      routeCode: -1,
      stagingLocation: -1,
      carts: -1,
      driverId: -1,
      launchPad: -1,
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!Array.isArray(row) || row.length === 0) continue;

      const rowStr = row.map((c) => String(c || "").trim()).join(" ");
      const rowUpper = rowStr.toUpperCase();

      // Detect Wave Section Header (e.g., "WAVE 5", "Dispatch: 11:40")
      if (rowUpper.includes("WAVE") || rowUpper.includes("DISPATCH:")) {
        for (const cell of row) {
          const cellStr = String(cell || "").trim();
          if (/^WAVE\s*\d+/i.test(cellStr) || (cellStr.toUpperCase().startsWith("WAVE") && cellStr.length < 15)) {
            currentWave = cellStr;
          }
          if (/Dispatch:\s*([0-9]{1,2}:[0-9]{2})/i.test(cellStr)) {
            const match = cellStr.match(/Dispatch:\s*([0-9]{1,2}:[0-9]{2})/i);
            if (match) currentDispatchTime = match[1];
          } else if (cellStr.toLowerCase().includes("dispatch:") && !currentDispatchTime) {
            const parts = cellStr.split(":");
            if (parts.length >= 2) {
              currentDispatchTime = parts.slice(1).join(":").trim();
            }
          }
        }
        continue;
      }

      // Detect Sub-Header Row (e.g., "Site Arrival", "Route Code", "Staging Location", "Carts", "Driver ID")
      if (
        rowUpper.includes("ROUTE CODE") ||
        rowUpper.includes("SITE ARRIVAL") ||
        rowUpper.includes("STAGING LOCATION")
      ) {
        columnMap = {
          siteArrival: -1,
          routeCode: -1,
          stagingLocation: -1,
          carts: -1,
          driverId: -1,
          launchPad: -1,
        };

        row.forEach((cell: any, colIdx: number) => {
          const cText = String(cell || "").trim().toLowerCase();
          if (cText.includes("site arrival") || cText.includes("holding")) {
            columnMap.siteArrival = colIdx;
          } else if (cText.includes("route code")) {
            columnMap.routeCode = colIdx;
          } else if (cText.includes("staging location") || cText.includes("staging")) {
            columnMap.stagingLocation = colIdx;
          } else if (cText.includes("carts")) {
            columnMap.carts = colIdx;
          } else if (cText.includes("launch pad") || cText.includes("dispatch")) {
            columnMap.launchPad = colIdx;
          } else if (cText.includes("driver id") || cText.includes("driver name") || cText.includes("driver")) {
            columnMap.driverId = colIdx;
          }
        });
        continue;
      }

      // Extract Data Row if routeCode column index is valid
      if (columnMap.routeCode !== -1) {
        const routeCodeVal = String(row[columnMap.routeCode] || "").trim();

        // Skip header rows, block headers, or empty entries
        if (
          !routeCodeVal ||
          routeCodeVal.toUpperCase().includes("ROUTE CODE") ||
          routeCodeVal.toUpperCase().startsWith("WAVE") ||
          routeCodeVal.toUpperCase().includes("SITE ARRIVAL")
        ) {
          continue;
        }

        const siteArrival = columnMap.siteArrival !== -1 ? String(row[columnMap.siteArrival] || "").trim() : "";
        const stagingLocation = columnMap.stagingLocation !== -1 ? String(row[columnMap.stagingLocation] || "").trim() : "";
        const carts = columnMap.carts !== -1 ? String(row[columnMap.carts] || "").trim() : "";
        const driverId = columnMap.driverId !== -1 ? String(row[columnMap.driverId] || "").trim() : "";

        let launchPadTime = currentDispatchTime;
        if (!launchPadTime && columnMap.launchPad !== -1) {
          launchPadTime = String(row[columnMap.launchPad] || "").trim();
        }

        parsedData.push({
          "Route Code": routeCodeVal,
          "Staging Location": stagingLocation,
          "Holding Lane Arrival Time": siteArrival,
          "Launch Pad Load Time": launchPadTime,
          "Driver Name": driverId,
          "Wave": currentWave,
          "Carts": carts,
        });
      }
    }

    return parsedData;
  };

  const readExcelFile = (
    file: File,
    isDispatchFile: boolean = false
  ): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, {
            type: "array",
            cellDates: true,
            raw: false,
          });

          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          let json: any[];

          if (isDispatchFile) {
            json = parseDispatchSheet(worksheet, file.name);
          } else {
            // Normal parsing for Routes file
            json = XLSX.utils.sheet_to_json(worksheet, {
              defval: "",
              raw: false,
            });
          }

          resolve(json);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("File reading failed"));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleDrop = useCallback(
    (e: React.DragEvent, type: "routes" | "dispatch") => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
        handleFileUpload(file, type);
      }
    },
    []
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileUpload = async (
    file: File | null,
    type: "routes" | "dispatch"
  ) => {
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    try {
      const isDispatch = type === "dispatch";
      const data = await readExcelFile(file, isDispatch);

      // Filter out completely empty rows
      const filteredData = data.filter((row: any) =>
        Object.values(row).some(
          (val) =>
            val !== "" &&
            val !== null &&
            val !== undefined &&
            // Ignore common empty decimal placeholders
            !(
              typeof val === "number" &&
              (val === 0 || val === -0.006944444444444444)
            )
        )
      );

      if (type === "routes") {
        setRoutesFile(file);
        setRoutesData(filteredData as RoutesRow[]);
      } else {
        setDispatchFile(file);
        setDispatchData(filteredData as DispatchRow[]);
        console.log("Parsed Dispatch Data:", filteredData); // For debugging
      }
    } catch (err) {
      setError("Failed to read file. Please ensure it's a valid Excel file.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const parseDateFromFilename = (filename: string): string | null => {
    // Regex for YYYY-MM-DD
    const yyyyMmDdMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
    if (yyyyMmDdMatch) {
      return yyyyMmDdMatch[1];
    }

    // Regex for DD.MM.YYYY
    const ddMmYyyyMatch = filename.match(/(\d{2}\.\d{2}\.\d{4})/);
    if (ddMmYyyyMatch) {
      const [dd, mm, yyyy] = ddMmYyyyMatch[1].split(".");
      return `${yyyy}-${mm}-${dd}`;
    }

    return null;
  };

  useEffect(() => {
    if (routesFile || dispatchFile) {
      let dateFound = false;
      let tempDate = "";

      // Priority: Routes file
      if (routesFile) {
        const dateFromRoutes = parseDateFromFilename(routesFile.name);
        if (dateFromRoutes) {
          tempDate = dateFromRoutes;
          dateFound = true;
        }
      }

      // Fallback: Dispatch file
      if (!dateFound && dispatchFile) {
        const dateFromDispatch = parseDateFromFilename(dispatchFile.name);
        if (dateFromDispatch) {
          tempDate = dateFromDispatch;
          dateFound = true;
        }
      }

      // If no date found, use current date
      if (!dateFound) {
        tempDate = new Date().toISOString().slice(0, 10);
        setDateMessage(
          `Filename should consist of date. Using current date: ${formatDateForDisplay(tempDate)}.`
        );
      } else {
        setDateMessage(null);
      }

      setParsedDate(tempDate);
    }
  }, [routesFile, dispatchFile]);

  const fetchVehicleDetailsForMergedData = useCallback(
    async (mergedRows: MergedRow[], mergeDate: string) => {
      const matchedRows = mergedRows.filter((row) => row.status === "matched");
      if (!mergeDate || matchedRows.length === 0) {
        setVehicleRows([]);
        return;
      }

      const payload = {
        date: mergeDate,
        drivers: matchedRows.map((row) => ({
          name: row.name,
          routeCode: row.routeCode,
          stagingLocation: row.stagingLocation,
          holdingLaneArrivalTime: String(row.holdingLaneArrivalTime || ""),
          launchPadLoadTime: String(row.launchPadLoadTime || ""),
          assignedVehicle: row.assignedVehicle || "",
          transporterId: row.transporterId || "",
        })),
      };

      setIsVehicleLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/driver_daily_vehicle_data`,
          {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          },
        );

        if (!response.ok) {
          throw new Error(`Vehicle API failed with status ${response.status}`);
        }

        const result = await response.json();
        const apiDrivers: VehicleApiDriverRow[] =
          result?.drivers_data?.drivers || [];
        setVehicleRows(apiDrivers);

        if (result?.drivers_data?.date) {
          setParsedDate(result.drivers_data.date);
        }

        if (apiDrivers.length === 0) return;

        const rowKey = (row: {
          name?: string;
          routeCode?: string;
          transporterId?: string | null;
        }) =>
          `${normalizeName(row.name || "")}|${String(
            row.routeCode || "",
          ).trim().toUpperCase()}|${String(row.transporterId || "").trim()}`;

        const apiRowsByKey = new Map<string, VehicleApiDriverRow[]>();
        apiDrivers.forEach((apiRow) => {
          const key = rowKey(apiRow);
          const list = apiRowsByKey.get(key) || [];
          list.push(apiRow);
          apiRowsByKey.set(key, list);
        });

        setMergedData((prev) =>
          prev.map((row) => {
            if (row.status !== "matched") return row;
            const key = rowKey(row);
            const matchList = apiRowsByKey.get(key);
            const apiMatch = matchList && matchList.length > 0
              ? matchList.shift()
              : undefined;
            return apiMatch
              ? { ...row, assignedVehicle: apiMatch.assignedVehicle || "TBC" }
              : row;
          }),
        );
      } catch (err) {
        console.error("Failed to fetch vehicle details:", err);
        setVehicleRows([]);
        setError(
          "Vehicle details could not be fetched automatically. Please retry by re-uploading files.",
        );
      } finally {
        setIsVehicleLoading(false);
      }
    },
    [],
  );

  const performMerge = useCallback(async () => {
    if (routesData.length === 0 || dispatchData.length === 0) return;

    const dispatchMap = new Map<string, DispatchRow>();

    // Helper to find key containing substring (case-insensitive)
    const findKey = (row: any, substr: string) =>
      Object.keys(row).find((k) =>
        k.toLowerCase().includes(substr.toLowerCase())
      );

    dispatchData.forEach((row) => {
      const routeCodeKey =
        findKey(row, "Route Code") || findKey(row, "route code");
      const code = String(row[routeCodeKey || ""] || "")
        .trim()
        .toUpperCase();
      if (code && code !== "0" && code !== "") dispatchMap.set(code, row);
    });
    console.log("dispatchData", dispatchData);
    const merged: MergedRow[] = [];

    routesData.forEach((routeRow) => {
      const routeCode = String(routeRow["Route code"] || "")
        .trim()
        .toUpperCase();
      if (!routeCode) return;

      const driverNameFromRoute = normalizeName(routeRow["Driver name"]);
      const dispatchRow = dispatchMap.get(routeCode);

      if (!dispatchRow) {
        merged.push({
          name: routeRow["Driver name"] || "Unknown",
          routeCode,
          stagingLocation: "",
          holdingLaneArrivalTime: "",
          launchPadLoadTime: "",
          assignedVehicle: "Not Assigned",
          transporterId: routeRow["Transporter ID"] || "",
          status: "missing_dispatch",
        });
        return;
      }

      // Flexible key lookup for dispatch row
      const stagingKey = findKey(dispatchRow, "Staging Location");
      const holdingKey = findKey(dispatchRow, "Holding Lane Arrival Time");
      const launchKey = findKey(dispatchRow, "Launch Pad Load Time");
      const driverNameKey = findKey(dispatchRow, "Driver Name");

      const dispatchName = normalizeName(dispatchRow[driverNameKey || ""]);
      const finalName = dispatchName || driverNameFromRoute || "Unknown";

      // Store RAW values
      const rawHolding = dispatchRow[holdingKey || ""] ?? "";
      const rawLaunch = dispatchRow[launchKey || ""] ?? "";

      const assignedVehicle = String(routeRow["Assigned Vehicle"] || "").trim();

      merged.push({
        name: finalName,
        routeCode,
        stagingLocation: String(dispatchRow[stagingKey || ""] || ""),
        holdingLaneArrivalTime: rawHolding,
        launchPadLoadTime: rawLaunch,
        assignedVehicle: assignedVehicle || "TBC",
        transporterId: routeRow["Transporter ID"] || "",
        status: "matched",
      });

      dispatchMap.delete(routeCode);
    });
    // Leftover dispatch rows (missing in routes)
    dispatchMap.forEach((row, code) => {
      const holdingKey = findKey(row, "Holding Lane Arrival Time");
      const launchKey = findKey(row, "Launch Pad Load Time");
      const driverNameKey = findKey(row, "Driver Name");
      const stagingKey = findKey(row, "Staging Location");

      merged.push({
        name: row[driverNameKey || ""] || "Unknown",
        routeCode: code,
        stagingLocation: String(row[stagingKey || ""] || ""),
        holdingLaneArrivalTime: row[holdingKey || ""] ?? '',
        launchPadLoadTime: row[launchKey || ""] ?? '',
        assignedVehicle: "Not in Routes",
        transporterId: "",
        status: "missing_route",
      });
    });

    // Sort by holding time
    merged.sort((a, b) => {
      const timeA = decimalToTime(a.holdingLaneArrivalTime) || "99:99";
      const timeB = decimalToTime(b.holdingLaneArrivalTime) || "99:99";
      return timeA.localeCompare(timeB);
    });

    setMergedData(merged);
    await fetchVehicleDetailsForMergedData(merged, parsedDate);
  }, [routesData, dispatchData, parsedDate, fetchVehicleDetailsForMergedData]);

  useEffect(() => {
    if (routesData.length > 0 && dispatchData.length > 0) {
      performMerge();
    }
  }, [routesData, dispatchData, performMerge]);

  const matchedCount = mergedData.filter((r) => r.status === "matched").length;

  const exportToExcel = () => {
    const exportData = mergedData.map((row) => ({
      NAME: row.name,
      "ROUTE CODE": row.routeCode,
      "STAGING LOCATION": row.stagingLocation,
      "HOLDING LANE ARRIVAL TIME": row.holdingLaneArrivalTime,
      "LAUNCH PAD LOAD TIME": row.launchPadLoadTime,
      "ASSIGNED VEHICLE": row.assignedVehicle,
      "TRANSPORTER ID": row.transporterId || "Pending",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Posting Sheet");
    XLSX.writeFile(
      wb,
      `Posting_Sheet_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const sendToCoreSystem = async () => {
    const valid = mergedData.filter((r) => r.status === "matched");
    if (valid.length === 0) {
      alert("No matched drivers to send.");
      return;
    }

    if (!parsedDate) {
      alert("No date available for assignment.");
      return;
    }

    const payload = {
      date: parsedDate,
      drivers: valid.map((row) => ({
        name: row.name,
        routeCode: row.routeCode,
        stagingLocation: row.stagingLocation,
        holdingLaneArrivalTime: row.holdingLaneArrivalTime,
        launchPadLoadTime: row.launchPadLoadTime,
        assignedVehicle: row.assignedVehicle,
        transporterId: row.transporterId || null,
      })),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/merge_driver_daily_data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert(
        `Success! Posting Sheet with ${
          valid.length
        } drivers sent to CORE system for date ${formatDateForDisplay(
          parsedDate
        )}.`
      );
      console.log("Sent to CORE:", payload);
    } catch (err) {
      alert("Failed to send to CORE system. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.uploadGrid}>
        <div
          className={styles.uploadBox}
          onDrop={(e) => handleDrop(e, "routes")}
          onDragOver={handleDragOver}
        >
          <h3>1. Routes File</h3>
          <label className={styles.uploadLabel}>
            <Upload size={40} />
            <span>
              {routesFile ? routesFile.name : "Drop Routes file or click"}
            </span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) =>
                handleFileUpload(e.target.files?.[0] || null, "routes")
              }
            />
          </label>
          {routesData.length > 0 && <p>{routesData.length} routes loaded</p>}
        </div>

        <div
          className={styles.uploadBox}
          onDrop={(e) => handleDrop(e, "dispatch")}
          onDragOver={handleDragOver}
        >
          <h3>2. Dispatch File</h3>
          <label className={styles.uploadLabel}>
            <Upload size={40} />
            <span>
              {dispatchFile ? dispatchFile.name : "Drop Dispatch file or click"}
            </span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) =>
                handleFileUpload(e.target.files?.[0] || null, "dispatch")
              }
            />
          </label>
          {dispatchData.length > 0 && (
            <p>{dispatchData.length} dispatch records</p>
          )}
        </div>
      </div>

      {isProcessing && <p>Processing...</p>}
      {error && (
        <div className={styles.error}>
          <AlertCircle /> {error}
        </div>
      )}
      {dateMessage && (
        <div className={styles.warning}>
          <AlertCircle /> {dateMessage}
        </div>
      )}

      {mergedData.length > 0 && (
        <>
          <div className={styles.summary}>
            <CheckCircle className={styles.successIcon} />
            <strong>{matchedCount}</strong> matched •{" "}
            <AlertCircle className={styles.warningIcon} />
            <strong>{mergedData.length - matchedCount}</strong> issues
          </div>

          <div className={styles.actions}>
            <button onClick={exportToExcel} className={styles.btnPrimary}>
              <Download /> Export Posting Sheet
            </button>
            <button onClick={sendToCoreSystem} className={styles.btnSuccess}>
              <Send /> Send to CORE System ({matchedCount})
            </button>
          </div>
          {isVehicleLoading && <p>Fetching latest vehicle details...</p>}

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>ROUTE CODE</th>
                  <th>STAGING</th>
                  <th>HOLDING LANE</th>
                  <th>LAUNCH PAD</th>
                  <th>VEHICLE</th>
                  <th>TRANSPORTER ID</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {mergedData.map((row, i) => (
                  <tr
                    key={i}
                    className={row.status !== "matched" ? styles.errorRow : ""}
                  >
                    <td>{row.name}</td>
                    <td>{row.routeCode}</td>
                    <td>{row.stagingLocation || "-"}</td>
                    <td>
                      {row.holdingLaneArrivalTime &&
                      row.holdingLaneArrivalTime !== ""
                        ? row.holdingLaneArrivalTime
                        : "--:--"}
                    </td>
                    <td>
                      {row.launchPadLoadTime && row.launchPadLoadTime !== ""
                        ? row.launchPadLoadTime
                        : "--:--"}
                    </td>
                    <td>
                      <Car size={16} />{" "}
                      {row.assignedVehicle &&
                      row.assignedVehicle !== "Not Assigned" &&
                      row.assignedVehicle !== "Not in Routes"
                        ? row.assignedVehicle
                        : "TBC"}
                    </td>
                    <td>{row.transporterId || "-"}</td>
                    <td>
                      <span
                        className={
                          row.status === "matched"
                            ? styles.statusSuccess
                            : styles.statusError
                        }
                      >
                        {row.status.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* {vehicleRows.length > 0 && (
            <div className={styles.tableContainer} style={{ marginTop: "1rem" }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>ROUTE CODE</th>
                    <th>TRANSPORTER ID</th>
                    <th>VEHICLE ID</th>
                    <th>VEHICLE NAME</th>
                    <th>ASSIGNED VEHICLE</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleRows.map((row, idx) => (
                    <tr key={`${row.routeCode}-${row.transporterId}-${idx}`}>
                      <td>{row.name || "-"}</td>
                      <td>{row.routeCode || "-"}</td>
                      <td>{row.transporterId || "-"}</td>
                      <td>{row.vehicle_id ?? "-"}</td>
                      <td>{row.vehicle_name || "-"}</td>
                      <td>{row.assignedVehicle || "TBC"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )} */}
        </>
      )}
    </div>
  );
};

export default DailyMergeUpload;
