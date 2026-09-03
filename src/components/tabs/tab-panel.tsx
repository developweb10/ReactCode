interface TabPanelProps {
  selectedValue: any;
  tabValue: any;
  children: React.ReactNode;
}

export const TabPanel = ({
  children,
  selectedValue,
  tabValue,
}: TabPanelProps) => {
  return selectedValue === tabValue ? <>{children}</> : null;
};
