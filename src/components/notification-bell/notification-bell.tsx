import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import {
  IconButton,
  Badge,
  Snackbar,
  SnackbarContent,
} from "@material-ui/core";
import NotificationsIcon from "@material-ui/icons/Notifications";
import { useInterval } from "@hooks/useInterval";
import { HomeRouterNames } from "@modules/home/config/home-router.names";

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [displayCount, setDisplayCount] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const history = useHistory();

  const fetchNotifications = useCallback(async () => {
    try {
      const baseUrl = process.env.REACT_APP_PHP_BASE_URL;
      const response = await axios.get(`${baseUrl}/soket_notification`);

      let newNotifs: any[] = [];

      if (Array.isArray(response.data)) {
        newNotifs = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        Array.isArray(response.data.data)
      ) {
        newNotifs = response.data.data;
      }

      const lastSeen = parseInt(
        localStorage.getItem("notificationLastSeenLength") || "0",
        10
      );

      setNotifications(newNotifs);

      if (newNotifs.length < lastSeen) {
        localStorage.setItem(
          "notificationLastSeenLength",
          newNotifs.length.toString()
        );
        setDisplayCount(0);
      } else {
        const newCount = newNotifs.length - lastSeen;
        setDisplayCount(newCount);

        // Show popup only when new notifications arrive
        if (newCount > 0) {
          setShowSnackbar(true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useInterval(() => {
    fetchNotifications();
  }, 30000);

  const handleClick = () => {
    localStorage.setItem(
      "notificationLastSeenLength",
      notifications.length.toString()
    );
    setDisplayCount(0);
    setShowSnackbar(false);

    history.push(`/${HomeRouterNames.UPCOMING_NOTIFICATIONS}`);
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={displayCount} color="secondary">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={50000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
		onClick={handleClick}
      >
        <SnackbarContent
		 style={{
			  width: "50vw",      // 70% of viewport width
			  maxWidth: "50vw",
			  marginLeft: "auto", // Pushes it to the right
			  marginRight: "15%", // Pushes it to the right
			}}	
          message={`You have ${displayCount} new notification${
            displayCount > 1 ? "s" : ""
          }`}
        />
      </Snackbar>
    </>
  );
};