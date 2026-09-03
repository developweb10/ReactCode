import styles from "./employee-type-badge.module.scss";
import classNames from "classnames";
import { Badge } from "@components/badge/badge";
import { EmployeeType } from "@models/employee.models";

interface Props {
  type?: EmployeeType;
}
export const EmployeeTypeBadge: React.FC<Props> = ({ type }) => {
  switch (type) {
    case EmployeeType.EMPLOYEED:
      return (
        <Badge
          variant="success"
          title="Employed"
          className={classNames(styles.Badge, styles.BadgeSuccess)}
        />
      );
    case EmployeeType.LEAVER:
      return <Badge variant="error" title="Leaver" className={styles.Badge} />;
    case EmployeeType.SICK:
      return <Badge variant="warning" title="Sick" className={styles.Badge} />;

    default:
      return (
        <Badge
          variant="success"
          title="Employed"
          className={classNames(styles.Badge, styles.BadgeSuccess)}
        />
      );
  }
};
