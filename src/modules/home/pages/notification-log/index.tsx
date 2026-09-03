import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Bell, Send, Search, ChevronDown, Trash2, Upload } from "lucide-react";
import { useHistory } from "react-router-dom";
import styles from "./styles/NotificationPage.module.scss";
import DailyMergeModal from "@components/daily-merge-upload/DailyMergeModal";
import ReminderConfigModal from "@components/reminder-config-modal/ReminderConfigModal";
import moment from "moment";
import { NotificationBell } from "@components/notification-bell/notification-bell";
import { HomeRouterNames } from "@modules/home/config/home-router.names";
import {
  buildUpcomingNotifications,
  NotificationScheduleSetting,
} from "../upcoming-notifications-page/upcoming-notifications.model";
import { getUpcomingNotificationSettings } from "../upcoming-notifications-page/upcoming-notifications.api";

// --- Interfaces ---
interface Driver {
  id: number;
  first_name: string;
  surname: string;
  middle_name: string | null;
  email: string;
  avatar_id: string | null;
  join_date: string; // ISO date string
}

interface Event {
  notification_id: number;
  notification_type:
    | "status_update"
    | "admin_broadcast"
    | "system_action"
    | string;
  notification_text: string;
  delivery_status: "Sent" | "Delivered" | "Read" | "Failed" | string;
  delivered_by_id: string;
  send_to_target_display: string;
  sending_time: string;
  driver_id: number | null;
  driver_name?: string;
}

// --- Helper Functions ---
const getFullName = (driver: Driver): string => {
  const middleName = driver.middle_name ? `${driver.middle_name} ` : "";
  return `${driver.first_name} ${middleName}${driver.surname}`;
};

// --- Helper Components ---
const DeliveryStatus: React.FC<{ status: Event["delivery_status"] }> = ({
  status,
}) => {
  const statusConfig: Record<
    NonNullable<Event["delivery_status"]>,
    { text: string }
  > = {
    Sent: { text: "Sent" },
    Delivered: { text: "Delivered" },
    Read: { text: "Read" },
    Failed: { text: "Failed" },
  };
  const config = statusConfig[status] || { text: status };
  return <span className={styles.deliveryStatus}>{config.text}</span>;
};

const ChatMessage: React.FC<{
  event: Event;
  drivers: Driver[];
  selected: boolean;
  onSelect: (notificationId: number) => void;
  onDelete: (notificationId: number) => void;
}> = ({
  event,
  drivers,
  selected,
  onSelect,
  onDelete,
}) => {
  let senderName: string;
  let senderAvatar: string | undefined;
  let isFromAdminOrSystem = false;

  const deliveredByDriver = drivers.find(
    (d) => d.id === parseInt(event.delivered_by_id, 10)
  );

  if (deliveredByDriver) {
    // Use getFullName to display the full name
    senderName = getFullName(deliveredByDriver);
    senderAvatar = deliveredByDriver.avatar_id
      ? "https://placehold.co/40x40/cccccc/ffffff?text=U"
      : "https://placehold.co/40x40/cccccc/ffffff?text=U";
    isFromAdminOrSystem = false;
  } else if (
    event.delivered_by_id.startsWith("admin") ||
    event.delivered_by_id.startsWith("user")
  ) {
    senderName = event.delivered_by_id === "user123" ? "Admin" : "System Admin";
    isFromAdminOrSystem = true;
  } else if (event.delivered_by_id.startsWith("system")) {
    senderName =
      event.delivered_by_id === "system_bot"
        ? "System Bot"
        : "System Automation";
    isFromAdminOrSystem = true;
  } else {
    senderName = "Unknown Sender";
    isFromAdminOrSystem = true;
  }

  const messageAlignment = isFromAdminOrSystem
    ? styles.alignRight
    : styles.alignLeft;

  if (event.notification_type === "system_action") {
    return (
      <div className={`${styles.messageSystemAction}`}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(event.notification_id)}
          className={styles.notificationCheckbox}
        />
        <p>
          {event.notification_text}{" "}
          <span className={styles.timestampSmall}>
            (Automated -{" "}
            {/* {new Date(event.sending_time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })} */}
            {moment.parseZone(event.sending_time).format("hh:mm A")})
          </span>
        </p>
        <button
          type="button"
          className={styles.deleteNotificationButton}
          onClick={() => onDelete(event.notification_id)}
        >
          <Trash2 size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.chatMessage} ${messageAlignment}`}>
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onSelect(event.notification_id)}
        className={styles.notificationCheckbox}
      />
      <div className={styles.avatarContainer}>
        {isFromAdminOrSystem ? (
          <div className={styles.adminAvatar}>
            <Bell className={styles.bellIcon} />
          </div>
        ) : (
          <img
            className={styles.avatar}
            src={
              senderAvatar || "https://placehold.co/40x40/cccccc/ffffff?text=U"
            }
            alt={senderName}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "https://placehold.co/40x40/cccccc/ffffff?text=U";
            }}
          />
        )}
      </div>
      <div
        className={`${styles.messageContent} ${
          isFromAdminOrSystem
            ? styles.messageAdminBroadcast
            : styles.messageStatusUpdate
        } ${
          event.delivered_by_id
            ? styles[event.delivered_by_id.replace(/\s/g, "")]
            : ""
        }`}
      >
        <div
          className={`${styles.messageHeader} ${
            isFromAdminOrSystem ? styles.alignRight : styles.alignLeft
          }`}
        >
          <p className={styles.senderName}>{event.driver_name || senderName}</p>
          <p className={styles.timestamp}>
            {/* {new Date(event.sending_time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })} */}
            {moment.parseZone(event.sending_time).format("hh:mm A")}
          </p>
        </div>
        {event.send_to_target_display && (
          <div className={styles.sendToDisplay}>
            {event.send_to_target_display}
          </div>
        )}
        <p className={styles.messageText}>{event.notification_text}</p>
        <div className={styles.deliveryStatusContainer}>
          {event.delivery_status && (
            <DeliveryStatus status={event.delivery_status} />
          )}
          <span className={styles.deliveredByFooter}>
            Delivered by {senderName}
          </span>
        </div>
      </div>
      <button
        type="button"
        className={styles.deleteNotificationButton}
        onClick={() => onDelete(event.notification_id)}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

// --- Main App Component ---
const NotificationPage: React.FC = () => {
  const history = useHistory();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [upcomingSettings, setUpcomingSettings] = useState<
    NotificationScheduleSetting[]
  >([]);
  const [message, setMessage] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<number | "all">("all");
  const [showSendToDropdown, setShowSendToDropdown] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const sendToDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedSendToOption, setSelectedSendToOption] =
    useState<string>("allActiveWorkforce");
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  // New state for the search query
  const [searchQuery, setSearchQuery] = useState<string>("");

  const loggedInUserId = "user123";
  const API_BASE_URL = process.env.REACT_APP_PHP_BASE_URL;
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [selectedNotificationIds, setSelectedNotificationIds] = useState<
    number[]
  >([]);

  const upcomingNotifications = useMemo(
    () => buildUpcomingNotifications(upcomingSettings),
    [upcomingSettings]
  );

  const openUpcomingNotifications = () => {
    history.push({
      pathname: `/${HomeRouterNames.UPCOMING_NOTIFICATIONS}`,
      state: { settings: upcomingSettings },
    });
  };

  useEffect(() => {
    const fetchUpcomingNotifications = async () => {
      try {
        const upcoming = await getUpcomingNotificationSettings();
        setUpcomingSettings(upcoming);
      } catch (upcomingError) {
        console.error("Could not load upcoming notifications:", upcomingError);
      }
    };

    fetchUpcomingNotifications();
  }, []);

  // Fetch Drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/drivers`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status === 1 && data.drivers) {
          setDrivers(data.drivers);
        } else {
          console.error("Failed to fetch drivers:", data.message);
        }
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };
    fetchDrivers();
  }, []);

  // Filter drivers based on search query
  const filteredDrivers = useMemo(() => {
    if (!searchQuery) {
      return drivers;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return drivers.filter((driver) => {
      const fullName = getFullName(driver).toLowerCase();
      return fullName.includes(lowercasedQuery);
    });
  }, [drivers, searchQuery]);

  // Fetch Notifications
  const fetchNotifications = useCallback(async () => {
    try {
      let url = `${API_BASE_URL}/notifications`;
      if (selectedFilter !== "all") {
        url = `${API_BASE_URL}/notifications?workforceId=${selectedFilter}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 1 && data.notifications) {
        const formattedNotifications = data.notifications.map((notif: any) => ({
          ...notif,
          notification_id: notif.notification_id,
          // sending_time: new Date(notif.sending_time).toISOString(),
          // sending_time: moment(notif.sending_time).parseZone().format("DD MMM, YYYY | HH:mm:ss"),
          sending_time: moment.parseZone(notif.sending_time).format("YYYY-MM-DDTHH:mm:ss.SSS")
          // sending_time: moment(notif.sending_time).format(
          //   "YYYY-MM-DDTHH:mm:ss.SSS",
          // ),
        }));
        setEvents(formattedNotifications);
      } else {
        console.error("Failed to fetch notifications:", data.message);
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setEvents([]);
    }
  }, [selectedFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sendToDropdownRef.current &&
        !sendToDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSendToDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const lastEvent = events[events.length - 1];
    if (
      lastEvent &&
      lastEvent.notification_type === "admin_broadcast" &&
      lastEvent.delivery_status === "Sent" &&
      lastEvent.delivered_by_id === loggedInUserId
    ) {
      const eventId = lastEvent.notification_id;

      const deliveredTimeout = setTimeout(() => {
        setEvents((currentEvents) =>
          currentEvents.map((e) =>
            e.notification_id === eventId
              ? { ...e, delivery_status: "Delivered" }
              : e
          )
        );
      }, 1500);

      const readTimeout = setTimeout(() => {
        setEvents((currentEvents) =>
          currentEvents.map((e) =>
            e.notification_id === eventId
              ? { ...e, delivery_status: "Read" }
              : e
          )
        );
      }, 3500);

      return () => {
        clearTimeout(deliveredTimeout);
        clearTimeout(readTimeout);
      };
    }
  }, [events, loggedInUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    let recipientDisplayText = "";
    let actualRecipientTarget = "";
    let targetDriverId: number | null = null;
    let targetDriverName: string | undefined = undefined;

    if (selectedFilter === "all") {
      actualRecipientTarget = selectedSendToOption;
      switch (selectedSendToOption) {
        case "allActiveWorkforce":
          recipientDisplayText = "To all active workforce";
          break;
        case "managersConfirmedToday":
          recipientDisplayText = `To all confirmed managers for today`;
          break;
        case "managersAssignedNextDay":
          recipientDisplayText = `To all managers assigned for the next day`;
          break;
        case "unconfirmedToday":
          recipientDisplayText = `To all unconfirmed workforce for today`;
          break;
        case "unconfirmedTomorrow":
          recipientDisplayText = `To all unconfirmed workforce for tomorrow`;
          break;
        default:
          recipientDisplayText = "To all personnel";
      }
    } else {
      const selectedDriver = drivers.find((d) => d.id === selectedFilter);
      recipientDisplayText = selectedDriver
        ? `To individual workforce: ${getFullName(selectedDriver)}`
        : "To selected individual";
      actualRecipientTarget = `individual-${selectedFilter}`;
      targetDriverId = selectedFilter;
      targetDriverName = selectedDriver
        ? getFullName(selectedDriver)
        : undefined;
    }

    const payload = {
      notification_type: "admin_broadcast",
      notification_text: message.trim(),
      delivery_status: "sent",
      delivered_by_id: loggedInUserId,
      sendToTarget: actualRecipientTarget,
      send_to_target_display: recipientDisplayText,
      driver_id: targetDriverId,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/send_notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.status === 1) {
        const newEvent: Event = {
          notification_id: data.notification_id || Date.now(),
          notification_type: payload.notification_type,
          notification_text: payload.notification_text,
          delivery_status: payload.delivery_status,
          delivered_by_id: payload.delivered_by_id,
          send_to_target_display: payload.send_to_target_display,
          sending_time: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"),
          // sending_time: new Date().toISOString(),
          driver_id: payload.driver_id,
          driver_name: targetDriverName,
        };
        setEvents((prevEvents) => [...prevEvents, newEvent]);
        setMessage("");
        setShowSendToDropdown(false);
      } else {
        console.error(
          "Failed to send message:",
          data.message || response.statusText
        );
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error sending message. Check console for details.");
    }
  };

  const deleteNotificationsFromApi = async (notificationIds: number[]) => {
    const response = await fetch(`${API_BASE_URL}/delete_notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notification_ids: notificationIds }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const handleToggleNotificationSelection = (notificationId: number) => {
    setSelectedNotificationIds((current) =>
      current.includes(notificationId)
        ? current.filter((id) => id !== notificationId)
        : [...current, notificationId]
    );
  };

  const handleDeleteNotifications = async (notificationIds: number[]) => {
    if (!notificationIds.length) return;

    try {
      await deleteNotificationsFromApi(notificationIds);
      setEvents((current) =>
        current.filter(
          (event) => !notificationIds.includes(event.notification_id)
        )
      );
      setSelectedNotificationIds((current) =>
        current.filter((id) => !notificationIds.includes(id))
      );
    } catch (error) {
      console.error("Error deleting notifications:", error);
      alert("Error deleting notification(s). Please try again.");
    }
  };

  const handleBulkDelete = () => {
    handleDeleteNotifications(selectedNotificationIds);
  };

  const handleShowAll = () => {
    setSelectedFilter("all");
    // Clear search when showing all
    setSearchQuery("");
  };

  // const groupedEvents = useMemo(() => {
  //   const groups: { date: string; events: Event[] }[] = [];
  //   let lastDate = "";

  //   const sortedEvents = [...events].sort(
  //     (a, b) =>
  //       new Date(a.sending_time).getTime() - new Date(b.sending_time).getTime()
  //   );

  //   sortedEvents.forEach((event) => {
  //     const eventDate = new Date(event.sending_time).toLocaleDateString(
  //       "en-US",
  //       { year: "numeric", month: "long", day: "numeric" }
  //     );
  //     if (eventDate !== lastDate) {
  //       groups.push({ date: eventDate, events: [] });
  //       lastDate = eventDate;
  //     }
  //     groups[groups.length - 1].events.push(event);
  //   });
  //   return groups;
  // }, [events]);

  const groupedEvents = useMemo(() => {
    const groups: { date: string; events: Event[] }[] = [];
    let lastDate = "";

    // 1. Sort using Moment (keeps the relative order correct)
    const sortedEvents = [...events].sort(
      (a, b) => moment(a.sending_time).valueOf() - moment(b.sending_time).valueOf()
    );

    sortedEvents.forEach((event) => {
      // 2. Use parseZone and format to get the date WITHOUT shifting timezones
      const eventDate = moment.parseZone(event.sending_time).format("MMMM D, YYYY");

      if (eventDate !== lastDate) {
        groups.push({ date: eventDate, events: [] });
        lastDate = eventDate;
      }
      groups[groups.length - 1].events.push(event);
    });
    
    return groups;
  }, [events]);

  return (
    <div className={styles.notificationPage}>
      <div className={styles.container}>
        {/* Left Panel */}
        <aside className={styles.sidebar}>
          <header className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Drivers ({drivers.length})</h2>
            {/* <DailyMergeUpload /> */}
            <button
              onClick={() => setIsMergeModalOpen(true)}
              className={styles.mergeUploadButton}
            >
              <Upload size={18} />
              Daily Routes Merge
            </button>
            {/* <button
              className={styles.mergeUploadButton}
              onClick={() => setIsConfigModalOpen(true)}
            >
              <Bell className={styles.bellIcon} />
              Configure Reminders
            </button> */}
            <button className={styles.showAllButton} onClick={handleShowAll}>
              Show All
            </button>
          </header>
          <div className={styles.searchContainer}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search Drivers..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.workforceList}>
            <ul>
              {/* Using filteredDrivers instead of drivers */}
              {filteredDrivers.map((driver) => (
                <li
                  key={driver.id}
                  className={`${styles.workforceItem} ${
                    selectedFilter === driver.id
                      ? styles.workforceItemActive
                      : ""
                  }`}
                  onClick={() => setSelectedFilter(driver.id)}
                >
                  <img
                    src={
                      driver.avatar_id
                        ? "https://placehold.co/40x40/cccccc/ffffff?text=U"
                        : "https://placehold.co/40x40/cccccc/ffffff?text=U"
                    }
                    alt={driver.first_name}
                    className={styles.avatar}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://placehold.co/40x40/cccccc/ffffff?text=U";
                    }}
                  />
                  <div className={styles.workforceInfo}>
                    <p className={styles.workforceName}>
                      {getFullName(driver)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Right Panel */}
        <main className={styles.main}>
          <header className={styles.mainHeader}>
            <div>
              <h2 className={styles.mainTitle}>Notifications & Messages</h2>
            </div>
            <div className={styles.notificationActions}>
              <button
                type="button"
                onClick={openUpcomingNotifications}
                className={styles.upcomingHeaderBtn}
              >
                <Bell size={18} />
                Upcoming
                <span>{upcomingNotifications.length}</span>
              </button>
              <NotificationBell />
              <button
                type="button"
                className={styles.bulkDeleteButton}
                disabled={!selectedNotificationIds.length}
                onClick={handleBulkDelete}
              >
                Delete Selected
              </button>
            </div>
            {/* <DailyMergeUpload /> */}
          </header>

          <div className={styles.chatContainer}>
            {groupedEvents.map((group, groupIndex) => (
              <React.Fragment key={group.date}>
                <div className={styles.dateDivider}>
                  <span>{group.date}</span>
                </div>
                {group.events.map((event) => (
                  <ChatMessage
                    key={event.notification_id}
                    event={event}
                    drivers={drivers}
                    selected={selectedNotificationIds.includes(
                      event.notification_id
                    )}
                    onSelect={handleToggleNotificationSelection}
                    onDelete={(notificationId) =>
                      handleDeleteNotifications([notificationId])
                    }
                  />
                ))}
              </React.Fragment>
            ))}
            <div ref={chatEndRef} />
          </div>

          <footer className={styles.footer}>
            <form onSubmit={handleSendMessage} className={styles.messageForm}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  selectedFilter === "all"
                    ? "Type a manual notification to all personnel..."
                    : "Type your message here..."
                }
                className={styles.messageInput}
              />
              {selectedFilter === "all" && (
                <div
                  className={styles.sendToDropdownContainer}
                  ref={sendToDropdownRef}
                >
                  <button
                    type="button"
                    className={styles.sendToButton}
                    onClick={() => setShowSendToDropdown(!showSendToDropdown)}
                  >
                    Send To <ChevronDown size={16} />
                  </button>
                  {showSendToDropdown && (
                    <div className={styles.dropdownMenu}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSendToOption("allActiveWorkforce");
                          setShowSendToDropdown(false);
                        }}
                      >
                        Send to all Active Workforce
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSendToOption("managersConfirmedToday");
                          setShowSendToDropdown(false);
                        }}
                      >
                        Send to all Manager confirmed for today
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSendToOption("managersAssignedNextDay");
                          setShowSendToDropdown(false);
                        }}
                      >
                        Send to all Manager Assigned for the next day
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSendToOption("unconfirmedToday");
                          setShowSendToDropdown(false);
                        }}
                      >
                        Send to all unconfirmed for today
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSendToOption("unconfirmedTomorrow");
                          setShowSendToDropdown(false);
                        }}
                      >
                        Send to all unconfirmed for tomorrow
                      </button>
                    </div>
                  )}
                </div>
              )}
              <button type="submit" className={styles.sendButton}>
                <Send className={styles.sendIcon} />
              </button>
            </form>
          </footer>
        </main>
        {isMergeModalOpen && (
          <DailyMergeModal onClose={() => setIsMergeModalOpen(false)} />
        )}
        {isConfigModalOpen && (
          <ReminderConfigModal onClose={() => setIsConfigModalOpen(false)} />
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
