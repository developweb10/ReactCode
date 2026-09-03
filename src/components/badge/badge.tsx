import styles from "./badge.module.scss";
import classNames from "classnames";

interface BadgeProps {
  title: string;
  variant: "success" | "error" | "warning" | "info";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ title, variant, className }) => {
  return (
    <div
      className={classNames(
        styles.Badge,
        {
          [styles.Success]: variant === "success",
          [styles.Error]: variant === "error",
          [styles.Warning]: variant === "warning",
          [styles.Info]: variant === "info",
        },
        className
      )}
    >
      <span className={styles.BadgeTitle}>{title}</span>
    </div>
  );
};
