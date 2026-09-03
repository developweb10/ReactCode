import { Box, Typography } from "@material-ui/core";
import classNames from "classnames";

import GenderIcon from "@assets/images/gender-yellow-icon.svg";
import { IconImage } from "@components/icon-image/icon-image";
import { WorkforceGender } from "@models/dashboard.models";

import sharedStyles from "../dashboard-page.module.scss";
import styles from "./dashboard-stats-card.module.scss";

interface Props {
  genders: WorkforceGender[];
}

const genderOrder = ["Male", "Female", "Other"];

const genderColors: Record<string, string> = {
  Male: "#F9E28A",
  Female: "#FADA63",
  Other: "#FDA92B",
};

const getOrderedGenders = (genders: WorkforceGender[]) => {
  return [...genders].sort((a, b) => {
    const aIndex = genderOrder.indexOf(a.gender);
    const bIndex = genderOrder.indexOf(b.gender);

    return (
      (aIndex === -1 ? genderOrder.length : aIndex) -
      (bIndex === -1 ? genderOrder.length : bIndex)
    );
  });
};

export const DashboardStatsCard: React.FC<Props> = ({ genders }) => {
  const orderedGenders = getOrderedGenders(genders);

  return (
    <Box className={classNames(sharedStyles.Card, styles.DashboardStatsCard)}>
      <Box className={styles.CardHeader}>
        <Box className={styles.IconWrapper}>
          <IconImage
            path={GenderIcon}
            size="md"
            filled
            className={styles.Icon}
          />
        </Box>
        <Typography className={styles.CardTitle}>Workforce gender</Typography>
      </Box>

      <div className={styles.DistributionBar}>
        {orderedGenders.map((g) => (
          <span
            key={g.gender}
            style={{
              width: `${Math.max(0, Math.min(g.percentage, 100))}%`,
              backgroundColor: genderColors[g.gender] || "#bdbdbd",
            }}
          />
        ))}
      </div>

      <Box className={styles.GenderList}>
        {orderedGenders.map((g) => (
          <Box className={styles.GenderWrapper} key={g.gender}>
            <span
              className={styles.GenderDot}
              style={{ backgroundColor: genderColors[g.gender] || "#bdbdbd" }}
            />
            <Typography className={styles.GenderName}>{g.gender}</Typography>
            <Typography className={styles.GenderPercent}>
              {g.percentage}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
