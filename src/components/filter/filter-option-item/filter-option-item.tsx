import classNames from "classnames";
import styles from "./filter-option-item.module.scss";
import { ReactComponent as CheckmarkIcon } from "@assets/images/checkmark-yellow-icon.svg";

interface FilterOptionItemProps {
  onClick: (isSelected: boolean) => void;
  isSelected: boolean;
}
export const FilterOptionItem: React.FC<FilterOptionItemProps> = ({
  children,
  onClick,
  isSelected,
}) => {
  return (
    <div
      onClick={() => onClick(isSelected)}
      className={classNames(styles.OptionItem, {
        [styles.Selected]: isSelected,
      })}
    >
      <span className={styles.OptionLabel}>{children}</span>

      <div className={styles.OptionCheckmark}>
        <CheckmarkIcon />
      </div>
    </div>
  );
};
