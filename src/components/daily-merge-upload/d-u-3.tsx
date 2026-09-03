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
  "Assigned Vehicle"?: string;
  [key: string]: any;
}

interface DispatchRow {
  "Route Code": string;
  "Driver Name"?: string;
  "Holding Lane Arrival Time"?: string;
  "Launch Pad Load Time"?: string;
  "Staging Location"?: string;
  [key: string]: any;
}

interface MergedRow {
  name: string;
  routeCode: string;
  stagingLocation: string;
  holdingLaneArrivalTime: string;
  launchPadLoadTime: string;
  assignedVehicle: string;
  transporterId: string;
  status: "matched" | "missing_dispatch" | "missing_route";
}

interface Vehicle {
  id: string;
  registration: string;
  isAvailable: boolean;
}

const DailyMergeUpload: React.FC = () => {
  const [routesFile, setRoutesFile] = useState<File | null>(null);
  const [dispatchFile, setDispatchFile] = useState<File | null>(null);
  const [routesData, setRoutesData] = useState<RoutesRow[]>([]);
  const [dispatchData, setDispatchData] = useState<DispatchRow[]>([]);
  const [mergedData, setMergedData] = useState<MergedRow[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock vehicles — replace with real API call
  const mockVehicles: Vehicle[] = [
    { id: "V001", registration: "ABC123", isAvailable: true },
    { id: "V002", registration: "XYZ789", isAvailable: true },
    { id: "V003", registration: "LMN456", isAvailable: true },
  ];

  useEffect(() => {
    setVehicles(mockVehicles);
  }, []);

  const normalizeName = (name: string = "") =>
    name.trim().toLowerCase().replace(/\s+/g, " ");

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
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
      const data = await readExcelFile(file);

      if (type === "routes") {
        setRoutesFile(file);
        setRoutesData(data as RoutesRow[]);
      } else {
        setDispatchFile(file);
        setDispatchData(data as DispatchRow[]);
      }
    } catch (err) {
      setError("Failed to read file. Please ensure it's a valid Excel file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const performMerge = useCallback(() => {
    if (routesData.length === 0 || dispatchData.length === 0) return;

    const dispatchMap = new Map<string, DispatchRow>();
    dispatchData.forEach((row) => {
      const code = String(row["Route Code"] || "").trim();
      if (code) dispatchMap.set(code, row);
    });

    const merged: MergedRow[] = [];
    const usedVehicles = new Set<string>();

    routesData.forEach((routeRow) => {
      const routeCode = String(routeRow["Route code"] || "").trim();
      if (!routeCode) return;

      const driverName = normalizeName(routeRow["Driver name"]);
      const dispatchRow = dispatchMap.get(routeCode);

      if (!dispatchRow) {
        merged.push({
          name: routeRow["Driver name"] || "Unknown",
          routeCode,
          stagingLocation: "",
          holdingLaneArrivalTime: "",
          launchPadLoadTime: "",
          assignedVehicle: "Not Assigned",
          transporterId: "",
          status: "missing_dispatch",
        });
        return;
      }

      // Flexible driver name matching
      const dispatchDriverName = normalizeName(dispatchRow["Driver Name"]);
      const nameMatch =
        driverName &&
        dispatchDriverName &&
        (driverName.includes(dispatchDriverName.split(" ")[0]) ||
          dispatchDriverName.includes(driverName.split(" ")[0]));

      const finalName = nameMatch
        ? dispatchRow["Driver Name"] || routeRow["Driver name"]
        : routeRow["Driver name"];

      // Assign vehicle (first available)
      let assignedVehicle = "Not Assigned";
      if (vehicles.length > 0) {
        const available = vehicles.find(
          (v) => v.isAvailable && !usedVehicles.has(v.id)
        );
        if (available) {
          assignedVehicle = available.registration;
          usedVehicles.add(available.id);
        }
      }

      merged.push({
        name: finalName || "Unknown",
        routeCode,
        stagingLocation: String(dispatchRow["Staging Location"] || ""),
        holdingLaneArrivalTime: String(
          dispatchRow["Holding Lane Arrival Time"] || ""
        ),
        launchPadLoadTime: String(dispatchRow["Launch Pad Load Time"] || ""),
        assignedVehicle,
        transporterId: "", // Will be added from DB later
        status: "matched",
      });

      dispatchMap.delete(routeCode);
    });

    // Add unmatched dispatch rows
    dispatchMap.forEach((row, code) => {
      merged.push({
        name: row["Driver Name"] || "Unknown",
        routeCode: code,
        stagingLocation: String(row["Staging Location"] || ""),
        holdingLaneArrivalTime: String(row["Holding Lane Arrival Time"] || ""),
        launchPadLoadTime: String(row["Launch Pad Load Time"] || ""),
        assignedVehicle: "Not in Routes",
        transporterId: "",
        status: "missing_route",
      });
    });

    // Sort by Holding Lane Arrival Time (earliest first)
    merged.sort((a, b) => {
      const timeA = a.holdingLaneArrivalTime || "";
      const timeB = b.holdingLaneArrivalTime || "";
      return timeA.localeCompare(timeB);
    });

    setMergedData(merged);
  }, [routesData, dispatchData, vehicles]);

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

  const sendToCoreSystem = () => {
    const valid = mergedData.filter((r) => r.status === "matched");
    if (valid.length === 0) {
      alert("No matched drivers to send.");
      return;
    }
    alert(
      `Success! Posting Sheet with ${valid.length} drivers sent to CORE system.`
    );
    console.log("Sending to CORE:", valid);
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
                    <td>{row.stagingLocation}</td>
                    <td>{row.holdingLaneArrivalTime}</td>
                    <td>{row.launchPadLoadTime}</td>
                    <td>
                      <Car size={16} /> {row.assignedVehicle}
                    </td>
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
        </>
      )}
    </div>
  );
};

export default DailyMergeUpload;
