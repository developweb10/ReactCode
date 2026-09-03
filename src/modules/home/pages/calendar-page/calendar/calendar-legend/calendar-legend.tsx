import classNames from "classnames";
import styles from "./calendar-legend.module.scss";
import { ReactComponent as HolidayIcon } from "@assets/images/aeroplane-icon.svg";
import { ReactComponent as SicknessIcon } from "@assets/images/heart-icon.svg";

import Typography from "@material-ui/core/Typography";

export const CalendarLegend = () => {
  return (
    <>
      <div className={styles.LegendItem}>
        <div className={styles.LegendItemGroupedIcons}>
          <div
            className={classNames(
              styles.LegendItemGroupedIcon,
              styles.HolidayIcon
            )}
          >
            <HolidayIcon />
          </div>
          <div
            className={classNames(
              styles.LegendItemGroupedIcon,
              styles.SicknessIcon,
              styles.SicknessPathGray
            )}
          >
            <SicknessIcon />
          </div>
        </div>
        <Typography className={styles.LegendItemText}>Pending</Typography>
      </div>
      <div className={styles.LegendItem}>
        <div className={classNames(styles.LegendItemIcon, styles.HolidayIcon)}>
          <HolidayIcon />
        </div>
        <Typography className={styles.LegendItemText}>Holiday</Typography>
      </div>
      <div className={styles.LegendItem}>
        <div className={classNames(styles.LegendItemIcon, styles.SicknessIcon)}>
          <SicknessIcon />
        </div>
        <Typography className={styles.LegendItemText}>Sickness</Typography>
      </div>
    </>
  );
};
