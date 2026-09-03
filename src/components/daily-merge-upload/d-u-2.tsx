// src/components/daily-merge-upload/DailyMergeUpload.tsx
import React, { useState, useCallback } from "react";
import { Upload, AlertCircle, CheckCircle, Download, Send } from "lucide-react";
import * as XLSX from "xlsx";
import styles from "./DailyMergeUpload.module.scss";

// Fixed Interfaces
interface RoutesRow {
  "Route code": string;
  "Transporter ID"?: string;
  "Driver name": string;
  DSP?: string;
  "Route progress"?: string;
  "Delivery service type"?: string;
  "Route duration"?: string;
  "All stops"?: string;
  "Stops complete"?: string;
  "not started stops"?: string;
  "Assigned Vehicle"?: string; // Add if present in your Routes file
}

interface DispatchRow {
  "Route Code": string;
  "Driver Name"?: string;
  "Holding Lane Arrival Time"?: string;
  "Launch Pad Load Time"?: string;
  "Staging Location"?: string;
}

interface MergedRow {
  name: string;
  routeCode: string;
  stagingLocation: string;
  padArrivalTime: string;
  vehicle: string;
  transporterId: string;
  status: "matched" | "missing_dispatch" | "missing_route" | "name_mismatch";
}

const DailyMergeUpload: React.FC = () => {
  const [routesFile, setRoutesFile] = useState<File | null>(null);
  const [dispatchFile, setDispatchFile] = useState<File | null>(null);
  const [routesData, setRoutesData] = useState<RoutesRow[]>([]);
  const [dispatchData, setDispatchData] = useState<DispatchRow[]>([]);
  const [mergedData, setMergedData] = useState<MergedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Replace this with real fetch from your API later
  const mockDrivers = [
    { id: 101, first_name: "John", surname: "Doe", transporter_id: "TR001" },
    { id: 102, first_name: "Amit", surname: "Sharma", transporter_id: "TR002" },
    {
      id: 103,
      first_name: "Rajesh",
      surname: "Kumar",
      transporter_id: "TR003",
    },
  ];

  const getDriverByName = useCallback((name: string) => {
    if (!name) return null;
    const normalized = name.trim().toLowerCase();
    return mockDrivers.find(
      (d) =>
        `${d.first_name} ${d.surname}`.toLowerCase() === normalized ||
        `${d.surname} ${d.first_name}`.toLowerCase() === normalized
    );
  }, []);

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

      // Auto merge when both files are loaded
      if (routesData.length > 0 && dispatchData.length > 0) {
        performMerge();
      }
    } catch (err) {
      setError("Failed to read Excel file. Make sure it's a valid .xlsx file.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const performMerge = useCallback(() => {
    if (routesData.length === 0 || dispatchData.length === 0) return;

    const merged: MergedRow[] = [];
    const dispatchMap = new Map<string, DispatchRow>();

    // Build map from Dispatch file
    dispatchData.forEach((row) => {
      const code = String(row["Route Code"] || "").trim();
      if (code) dispatchMap.set(code, row);
    });

    // Process each route
    routesData.forEach((routeRow) => {
      const routeCode = String(routeRow["Route code"] || "").trim();
      if (!routeCode) return;

      const driverNameFromRoute = String(routeRow["Driver name"] || "").trim();
      const dispatchRow = dispatchMap.get(routeCode);

      if (!dispatchRow) {
        merged.push({
          name: driverNameFromRoute || "Unknown",
          routeCode,
          stagingLocation: "",
          padArrivalTime: "",
          vehicle: routeRow["Assigned Vehicle"] || "Not Assigned",
          transporterId: "",
          status: "missing_dispatch",
        });
        return;
      }

      // Try to get real driver from DB using name
      const dbDriver = getDriverByName(driverNameFromRoute);
      const finalName = dbDriver
        ? `${dbDriver.first_name} ${dbDriver.surname}`
        : driverNameFromRoute || dispatchRow["Driver Name"] || "Unknown";

      merged.push({
        name: finalName,
        routeCode,
        stagingLocation: String(dispatchRow["Staging Location"] || ""),
        padArrivalTime: String(
          dispatchRow["Launch Pad Load Time"] ||
            dispatchRow["Holding Lane Arrival Time"] ||
            ""
        ),
        vehicle: routeRow["Assigned Vehicle"] || "Not Assigned",
        transporterId: dbDriver?.transporter_id || "",
        status: "matched",
      });

      // Remove from map so we can detect leftovers
      dispatchMap.delete(routeCode);
    });

    // Add any dispatch rows that had no matching route
    dispatchMap.forEach((dispatchRow, code) => {
      merged.push({
        name: String(dispatchRow["Driver Name"] || "Unknown"),
        routeCode: code,
        stagingLocation: String(dispatchRow["Staging Location"] || ""),
        padArrivalTime: String(dispatchRow["Launch Pad Load Time"] || ""),
        vehicle: "Not in Routes",
        transporterId: "",
        status: "missing_route",
      });
    });

    setMergedData(merged);
  }, [routesData, dispatchData, getDriverByName]);

  // Trigger merge when both files are loaded
  React.useEffect(() => {
    if (routesData.length > 0 && dispatchData.length > 0) {
      performMerge();
    }
  }, [routesData, dispatchData, performMerge]);

  const matchedCount = mergedData.filter((r) => r.status === "matched").length;

  const exportToExcel = () => {
    const exportRows = mergedData.map((row) => ({
      NAME: row.name,
      "ROUTE CODE": row.routeCode,
      "STAGING LOCATION": row.stagingLocation,
      "PAD ARRIVAL TIME": row.padArrivalTime,
      VEHICLE: row.vehicle,
      "TRANSPORTER ID": row.transporterId || "Not Found",
      STATUS: row.status.replace(/_/g, " ").toUpperCase(),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportRows);
    XLSX.utils.book_append_sheet(wb, ws, "Merged Data");
    XLSX.writeFile(
      wb,
      `Godfather_Merged_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const sendNotifications = () => {
    const valid = mergedData.filter(
      (r) => r.status === "matched" && r.transporterId
    );
    if (valid.length === 0) {
      alert("No drivers with valid Transporter ID found.");
      return;
    }
    alert(`Success! Sending notifications to ${valid.length} drivers...`);
    console.log("Sending to:", valid);
    // TODO: Connect to your real API
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Daily Routes & Dispatch Merge Tool</h2>

      <div className={styles.uploadGrid}>
        {/* Routes File */}
        <div className={styles.uploadBox}>
          <h3>1. Routes File</h3>
          <label className={styles.uploadLabel}>
            <Upload size={40} />
            <span>
              {routesFile ? routesFile.name : "Drop Routes file here or click"}
            </span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) =>
                handleFileUpload(e.target.files?.[0] || null, "routes")
              }
            />
          </label>
          {routesData.length > 0 && <p>Loaded {routesData.length} routes</p>}
        </div>

        {/* Dispatch File */}
        <div className={styles.uploadBox}>
          <h3>2. Dispatch File</h3>
          <label className={styles.uploadLabel}>
            <Upload size={40} />
            <span>
              {dispatchFile
                ? dispatchFile.name
                : "Drop Dispatch file here or click"}
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
            <p>Loaded {dispatchData.length} dispatch records</p>
          )}
        </div>
      </div>

      {isProcessing && <p>Processing files...</p>}
      {error && (
        <div className={styles.error}>
          <AlertCircle size={20} /> {error}
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
              <Download size={20} /> Export Merged File
            </button>
            <button
              onClick={sendNotifications}
              disabled={matchedCount === 0}
              className={styles.btnSuccess}
            >
              <Send size={20} /> Send Notifications ({matchedCount})
            </button>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>ROUTE CODE</th>
                  <th>STAGING LOCATION</th>
                  <th>PAD ARRIVAL TIME</th>
                  <th>VEHICLE</th>
                  <th>TRANSPORTER ID</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {mergedData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={row.status !== "matched" ? styles.errorRow : ""}
                  >
                    <td>{row.name}</td>
                    <td>{row.routeCode}</td>
                    <td>{row.stagingLocation}</td>
                    <td>{row.padArrivalTime}</td>
                    <td>{row.vehicle}</td>
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
        </>
      )}
    </div>
  );
};

export default DailyMergeUpload;
