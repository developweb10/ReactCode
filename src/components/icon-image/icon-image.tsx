import React from "react";
import classNames from "classnames";
import styles from "./icon-image.module.scss";
import Image from "material-ui-image";
interface IconProps {
  path: string;
  filled?: boolean;
  size: "xs" | "sm" | "lg" | "md";
  className?: string;
}

export const IconImage: React.FC<IconProps> = ({
  path,
  filled,
  size,
  className,
}) => {
  return (
    <div
      className={classNames(
        styles["Wrapper"],
        {
          [styles["Filled"]]: filled,
        },
        styles[size],
        className
      )}
    >
      <Image
        className={styles.Img}
        src={path}
        alt="icon"
        disableSpinner
        animationDuration={700}
      />
    </div>
  );
};
