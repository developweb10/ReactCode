import styles from "./filter-menu-item.module.scss";
import IconButton from "@material-ui/core/IconButton";
import ArrowIcon from "@assets/images/arrow-right-yellow-icon.svg";

interface FilterMenuItemProps {
  label: string;
  onClick: () => void;
  filtersCount: number;
}
export const FilterMenuItem: React.FC<FilterMenuItemProps> = ({
  label,
  filtersCount,
  onClick,
}) => {
  return (
    <li className={styles.MenuFilterItem} onClick={onClick}>
      <span className={styles.MenuText}>{label}</span>

      <div className={styles.RightSection}>
        {filtersCount > 0 && (
          <div className={styles.FiltersCount}>
            <span>{filtersCount}</span>
          </div>
        )}
        <IconButton
          className={styles.ArrowButton}
          disableRipple
          onClick={onClick}
        >
          <img src={ArrowIcon} alt="Open Filter Field" />
        </IconButton>
      </div>
    </li>
  );
};
