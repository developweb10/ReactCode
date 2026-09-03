import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { User, UserFormData, UserRole } from "./types";
import { userApi } from "./userApi";
import {
  UserPlus,
  Trash2,
  ShieldCheck,
  Briefcase,
  Users,
  X,
} from "lucide-react";
import styles from "./UserManagement.module.scss";
import { NotificationBell } from "@components/notification-bell/notification-bell";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState<UserFormData>({
    firstname: "",
    surname: "",
    email: "",
    password: "",
    role: "ROLE_HR",
    hoursPerWeek: 40,
    hourlyRate: 0,
    salary: 0,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.getUsers({ month: 12, year: 2023 });
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await userApi.createUser(formData);
      setShowModal(false);
      loadUsers();
      // Reset form
      setFormData({
        firstname: "",
        surname: "",
        email: "",
        password: "",
        role: "ROLE_HR",
        hoursPerWeek: 40,
        hourlyRate: 0,
        salary: 0,
      });
    } catch (err) {
      alert("Error creating system user");
    }
  };

  return (
    <div className={styles.container}>
        <div className={styles.user_Management_Box}>
      <header className={styles.header}>
        <div className={styles.user_Management_Content}>
        <img src="/static/media/employees-yellow-icon.c550f19f.svg" alt="Logo" />
       <div className={styles.user_Management_Text}>
           <h2>System User Management</h2>
        </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ color: '#1c1c1e' }}>
            <NotificationBell />
          </div>
          <button onClick={() => setShowModal(true)} className={styles.addButton}>
            <UserPlus size={18} />
            <span>Add New System User</span>
          </button>
        </div>
      </header>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.userTable}>
          <thead className={styles.system_Management_TableHeader}>
            <tr>
              <th>Name</th>
              <th>Email Address</th>
              <th>System Role</th>
              <th>Status</th>
              <th align="right">Actions</th>
            </tr>
          </thead>
          <tbody className={styles.system_Management_TableBody}>
            {loading ? (
              <tr>
                <td colSpan={5}>Fetching users...</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.email}>
                  <td className={styles.userName}>
                    {user.firstname} {user.surname}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[user.role]}`}>
                      {user.role === "ROLE_ADMIN" && <ShieldCheck size={12} />}
                      {user.role === "ROLE_HR" && <Briefcase size={12} />}
                      {user.role === "ROLE_EMPLOYEE" && <Users size={12} />}
                      {user.role.replace("ROLE_", "")}
                    </span>
                  </td>
                  <td>
                    <span className={styles.activeDot}></span> Active
                  </td>
                  <td align="left">
                    <button
                      onClick={() =>
                        userApi.deleteUser(user.email).then(loadUsers)
                      }
                      className={styles.deleteBtn}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.provision_Account_Box}>
            <div className={styles.modalHeader}>
              <div className={styles.provision_Account_Txt}>
                <h3>Provision New Account</h3>
                <p>Fill in the details to create a new system user.</p>
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            </div>
            <div className={styles.provision_Account_form}>
              <form onSubmit={handleCreateUser} className={styles.modalForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>First Name</label>
                    <input
                      name="firstname"
                      placeholder="e.g. John"
                      required
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Surname</label>
                    <input
                      name="surname"
                      placeholder="e.g. Doe"
                      required
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Corporate Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="name@yellowhouse.com"
                    required
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Temporary Password</label>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>System Access Level</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="ROLE_ADMIN">
                      Administrator (Full Access)
                    </option>
                    <option value="ROLE_HR">HR Manager</option>
                    
                  </select>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={styles.btnCancel}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.btnSave}>
                    Create User Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
