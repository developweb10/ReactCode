import React, { useState, useEffect, useMemo, useRef } from "react";
import styles from "./styles/candidates_page.module.scss";
import axios from "axios";
import * as XLSX from "xlsx";
import { NotificationBell } from "@components/notification-bell/notification-bell";

// Updated interface to match the API response fields, including new status
interface Candidate {
  id: number;
  other_id: number | null;
  first_name: string;
  surname: string;
  middle_name: string | null;
  know_as: string | null;
  smoker: string | null;
  gender: string | null;
  avatar_id: number | null;
  address_1: string | null;
  address_2: string | null;
  city: string | null;
  town: string | null;
  country: string | null;
  post_code: string | null;
  mobile_number: string | null;
  house_number: string | null;
  date_of_birth: string | null;
  email: string | null;
  personal_email: string | null;
  other_email: string | null;
  start_date: string | null;
  join_date: string | null;
  leave_date: string | null;
  length_of_service: number | null;
  ec_first_name: string | null;
  ec_last_name: string | null;
  ec_mobile: string | null;
  ec_home_telephone: string | null;
  ec_work_telephone: string | null;
  ec_relationship: string | null;
  hours_per_week: number | null;
  hourly_rate: number | null;
  salary: number | null;
  job_title: string | null;
  job_specifications: string | null;
  employment_status: string | null;
  function: string | null;
  department: string | null;
  primary_line_manager_id: number | null;
  secondary_line_manager_id: number | null;
  ethnicity: string | null;
  nationality: string | null;
  contract_details: string | null;
  store_id: number | null;
  is_editable: boolean;
  end_date: string | null;
  type: string | null;
  uk_work_right: string | null;
  uk_driving_licence: string | null;
  proof_of_address: string | null;
  license_penalty_points: string | null;
  ability_to_lift_parcel: string | null;
  candidate_status:
    | "in progress"
    | "hold"
    | "unsuccessful"
    | "successful"
    | string;
}

// Map API status to a user-friendly format for UI
type CandidateStatus =
  | "In Progress"
  | "On Hold"
  | "Unsuccessful"
  | "Successful";

interface CandidateRowProps {
  candidate: Candidate;
  onUpdateStatus: (
    id: number,
    newStatus: "hold" | "unsuccessful" | "successful"
  ) => Promise<void>;
  onViewCV: (url: string) => void;
  onSelectForExcel: (id: number, isSelected: boolean) => void;
  isSelected?: boolean;
  activeTab: CandidateStatus;
}

const CandidateRow: React.FC<CandidateRowProps> = ({
  candidate,
  onUpdateStatus,
  onViewCV,
  onSelectForExcel,
  isSelected,
  activeTab,
}) => {
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  const handleActionClick = async (
    action: "hold" | "unsuccessful" | "successful"
  ) => {
    await onUpdateStatus(candidate.id, action);
    setShowActions(false);
  };

  const mapStatusToUi = (status: string | undefined): CandidateStatus => {
    switch (status?.toLowerCase()?.trim()) {
      case "in progress":
        return "In Progress";
      case "hold":
        return "On Hold";
      case "unsuccessful":
        return "Unsuccessful";
      case "successful":
        return "Successful";
      default:
        return "In Progress";
    }
  };

  const status = mapStatusToUi(candidate.candidate_status);

  const statusClass =
    status === "On Hold"
      ? styles.statusOnHold
      : status === "Unsuccessful"
      ? styles.statusUnsuccessful
      : status === "Successful"
      ? styles.statusSuccessful
      : styles.statusInProgress;

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionsRef.current &&
        !actionsRef.current.contains(event.target as Node)
      ) {
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <tr className={styles.candidateRow}>
      {activeTab === "Successful" && (
        <td>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelectForExcel(candidate.id, e.target.checked)}
          />
        </td>
      )}
      <td>{candidate.id}</td>
      <td>{candidate.first_name}</td>
      <td>{candidate.surname}</td>
      <td>{candidate.job_title || "N/A"}</td>
      <td>{candidate.city || "N/A"}</td>
      <td>{candidate.mobile_number || "N/A"}</td>
      <td>
        <button
          onClick={() => onViewCV("link-to-cv.pdf")}
          className={styles.viewCvButton}
        >
          View CV
        </button>
      </td>
      <td className={styles.actionsCell}>
        <div className={`${styles.statusPill} ${statusClass}`}>
          <span>{status}</span>
        </div>
        <div className={styles.actionDropdownContainer} ref={actionsRef}>
          <button
            onClick={() => setShowActions((prev) => !prev)}
            className={styles.actionButton}
          >
            Actions
          </button>
          {showActions && (
            <div className={styles.actionDropdown}>
              {candidate.candidate_status?.toLowerCase()?.trim() !==
                "successful" && (
                <div
                  className={styles.actionItem}
                  onClick={() => handleActionClick("successful")}
                >
                  Mark as Successful
                </div>
              )}
              {candidate.candidate_status?.toLowerCase()?.trim() !== "hold" && (
                <div
                  className={styles.actionItem}
                  onClick={() => handleActionClick("hold")}
                >
                  On Hold
                </div>
              )}
              {candidate.candidate_status?.toLowerCase()?.trim() !==
                "unsuccessful" && (
                <div
                  className={styles.actionItem}
                  onClick={() => handleActionClick("unsuccessful")}
                >
                  Reject
                </div>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

const CandidatesDashboard: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CandidateStatus>("In Progress");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);

  const CANDIDATES_API_URL = `${process.env.REACT_APP_PHP_BASE_URL}/candidates`;
  const UPDATE_STATUS_API_URL = `${process.env.REACT_APP_PHP_BASE_URL}/update_candidate_status`;

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(CANDIDATES_API_URL);
      if (response.data.status === 1) {
        setCandidates(response.data.canditates);
        setError(null);
      } else {
        setError(response.data.message || "Failed to fetch candidates.");
      }
    } catch (err) {
      setError(
        "Failed to fetch candidates. Please check the network connection."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleUpdateStatus = async (
    id: number,
    newStatus: "hold" | "unsuccessful" | "successful"
  ) => {
    setLoading(true); // Show loading state during API call
    try {
      const response = await axios.get(
        `${UPDATE_STATUS_API_URL}/${id}/${newStatus}`
      );
      if (response.data.status === 1) {
        alert(
          `Status updated successfully for candidate ${id} to ${newStatus}.`
        );
        fetchCandidates(); // Refetch all candidates to get the latest data
      } else {
        alert(response.data.message || "Failed to update status.");
      }
    } catch (err) {
      alert("Failed to update status. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectCandidate = (id: number, isSelected: boolean) => {
    setSelectedCandidates((prev) =>
      isSelected
        ? [...prev, id]
        : prev.filter((candidateId) => candidateId !== id)
    );
  };

  const generateExcel = () => {
    const selectedData = candidates.filter((c) =>
      selectedCandidates.includes(c.id)
    );

    if (selectedData.length === 0) {
      alert("Please select at least one candidate to generate the Excel file.");
      return;
    }

    const headers = [
      "Employee_ID",
      "First_Name",
      "Surname",
      "Middle Name",
      "Gender",
      "Known As",
      "Smoker",
      "Address 1",
      "Address 2",
      "City",
      "Town",
      "Country",
      "Post Code",
      "Mobile Number",
      "House Number",
      "Date Of Birth",
      "Email address",
      "Personal Email",
      "Other Email",
      "Join_date",
      "Leave_date",
      "Emergency Contact First Name",
      "Emergency Contact Second Name",
      "Emergency Contact Home Telephone",
      "Emergency Contact Mobile",
      "Emergency Contact Relationship",
      "Hours Per Week",
      "Hourly Rate",
      "Salary",
      "Job Title",
      "Function",
      "Department",
      "Employment Status",
      "Store/Site Number",
      "Store/Site Name",
      "Store Address 1",
      "Store Address 2",
      "Store Address 3",
      "Store Postcode",
      "Store / Site Contact No",
      "Store Contact Info",
      "Is Line Manager",
      "Region",
      "Regional Manager",
      "District",
      "District Manager",
      "Store Grade",
      "HR User ID",
      "HR User",
      "Primary Line Manager ID",
      "Primary Line Manager",
      "Secondary Line Manager ID",
      "Secondary Line Manager",
      "Ethnicity",
      "Nationality",
      "Contract Details",
      "Weekly Pay",
      "Monthly Pay",
      "Today",
    ];

    const data = selectedData.map((c) => [
      c.id,
      c.first_name,
      c.surname,
      c.middle_name,
      c.gender,
      c.know_as,
      c.smoker,
      c.address_1,
      c.address_2,
      c.city,
      c.town,
      c.country,
      c.post_code,
      c.mobile_number,
      c.house_number,
      c.date_of_birth ? new Date(c.date_of_birth).toLocaleDateString() : "",
      c.email,
      c.personal_email,
      c.other_email,
      c.join_date ? new Date(c.join_date).toLocaleDateString() : "",
      c?.leave_date,
      c?.ec_first_name,
      c?.ec_last_name,
      c?.ec_home_telephone,
      c?.ec_mobile,
      c?.ec_relationship,
      c.hours_per_week ?? "", // ✅ keep number or empty
      c.hourly_rate ?? "", // ✅ keep number or empty
      c.salary ? `£${c.salary.toFixed(2)}` : "",
      c.job_title,
      c.function,
      c.department,
      c.employment_status,
      c.store_id,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      c.primary_line_manager_id,
      "",
      c.secondary_line_manager_id,
      "",
      c.ethnicity,
      c.nationality,
      c.contract_details,
      c.hours_per_week && c.hourly_rate
        ? `£${(c.hours_per_week * c.hourly_rate).toFixed(2)}`
        : "",
      c.salary ? `£${(c.salary / 12).toFixed(2)}` : "",
      new Date().toLocaleDateString(),
      // c.uk_work_right,
      // c.uk_driving_licence,
      // c.proof_of_address,
      // c.license_penalty_points,
      // c.ability_to_lift_parcel,
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Successful Candidates");
    XLSX.writeFile(workbook, "Successful_Candidates.xlsx");

    setSelectedCandidates([]); // Clear selection after export
  };

  const mapApiStatusToTab = (
    status: string | null | undefined
  ): CandidateStatus => {
    switch (status?.toLowerCase()?.trim()) {
      case "in progress":
        return "In Progress";
      case "hold":
        return "On Hold";
      case "unsuccessful":
        return "Unsuccessful";
      case "successful":
        return "Successful";
      default:
        return "In Progress";
    }
  };

  const filteredCandidates = useMemo(() => {
    let filteredList = candidates?.filter(
      (c) => mapApiStatusToTab(c?.candidate_status?.trim()) === activeTab
    );

    if (!searchTerm) {
      return filteredList;
    }

    return filteredList.filter(
      (c) =>
        c.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toString().includes(searchTerm)
    );
  }, [candidates, activeTab, searchTerm]);

  const totalPages = Math.ceil(filteredCandidates?.length / itemsPerPage);
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCandidates?.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCandidates, currentPage, itemsPerPage]);

  const handlePaginationChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h2>
          <img
            src="/static/media/employees-yellow-icon.c550f19f.svg"
            alt="Candidate Icon"
          />
          Candidates
        </h2>
        <div className={styles.headerActions} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ color: '#1c1c1e' }}>
            <NotificationBell />
          </div>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search anything"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        {["In Progress", "On Hold", "Unsuccessful", "Successful"].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${
              activeTab === tab ? styles.active : ""
            }`}
            onClick={() => {
              setActiveTab(tab as CandidateStatus);
              setCurrentPage(1);
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Successful" && (
        <div className={styles.successfulActions}>
          <span>Selected for export: {selectedCandidates.length}</span>
          <button
            onClick={generateExcel}
            className={styles.generateExcelButton}
            disabled={selectedCandidates.length === 0}
          >
            Generate Excel
          </button>
        </div>
      )}

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <span className={styles.filter}>
            All Candidates: {filteredCandidates.length}
          </span>
          <div className={styles.rowCount}>
            Per Page:
            <select onChange={handleItemsPerPageChange} value={itemsPerPage}>
              <option value={10}>10 Rows</option>
              <option value={20}>20 Rows</option>
              <option value={50}>50 Rows</option>
            </select>
          </div>
        </div>
        <table className={styles.candidatesTable}>
          <thead>
            <tr>
              {activeTab === "Successful" && <th>Select</th>}
              <th>Candidate ID</th>
              <th>First Name</th>
              <th>Surname</th>
              <th>Position</th>
              <th>Location</th>
              <th>Contact No</th>
              <th>CV</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCandidates.length === 0 ? (
              <tr>
                <td
                  colSpan={activeTab === "Successful" ? 9 : 8}
                  className={styles.noData}
                >
                  No candidates found.
                </td>
              </tr>
            ) : (
              paginatedCandidates.map((candidate) => (
                <CandidateRow
                  key={candidate.id}
                  candidate={candidate}
                  onUpdateStatus={handleUpdateStatus}
                  onViewCV={(url) => window.open(url, "_blank")}
                  onSelectForExcel={toggleSelectCandidate}
                  isSelected={selectedCandidates.includes(candidate.id)}
                  activeTab={activeTab}
                />
              ))
            )}
          </tbody>
        </table>
        <div className={styles.pagination}>
          <button
            onClick={() => handlePaginationChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePaginationChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidatesDashboard;
