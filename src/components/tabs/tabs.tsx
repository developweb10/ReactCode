import React from "react";
import styles from "./tabs.module.scss";
import {
  withStyles,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core/styles";

import MuiTabs from "@material-ui/core/Tabs";
import MuiTab from "@material-ui/core/Tab";

interface TabProps {
  label: string;
  value: any;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: 7,
      minHeight: 40,
    },
    indicator: {
      backgroundColor: theme.palette.primary.main,
      height: 3,
      borderRadius: 10,
    },
  })
);

const StyledTab = withStyles((theme: Theme) =>
  createStyles({
    root: {
      textTransform: "none",
      minHeight: 35,
      marginRight: theme.spacing(1),
      fontSize: "1.2rem",
      "&:hover": {
        color: theme.palette.primary.main,
        opacity: 1,
      },
      "&$selected": {
        color: theme.palette.primary.main,
        fontFamily: "Sf_Ui_Medium",
      },
      "&:focus": {
        color: theme.palette.primary.main,
      },
    },
    selected: {},
  })
)((props: TabProps) => <MuiTab disableRipple {...props} />);

interface Label {
  label: string;
  path?: string;
  value: any;
}

interface TabsProps {
  value: any;
  onChange: (event: React.ChangeEvent<{}>, newTabValue: any) => void;
  labels: Label[];
}

export const Tabs: React.FC<TabsProps> = ({ labels, value, onChange }) => {
  const classes = useStyles();
  return (
    <MuiTabs
      value={value}
      indicatorColor="primary"
      textColor="primary"
      onChange={onChange}
      aria-label="Tabs"
      classes={{ flexContainer: styles.TabsWrapper, ...classes }}
      variant="scrollable"
      scrollButtons="off"
    >
      {labels.map(({ label, value }) => (
        <StyledTab key={label} label={label} value={value} />
      ))}
    </MuiTabs>
  );
};
