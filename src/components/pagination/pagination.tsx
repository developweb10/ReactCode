import { useEffect } from "react";
import styles from "./pagination.module.scss";
import classNames from "classnames";

import MuiPagination from "@material-ui/lab/Pagination";
import ButtonBase from "@material-ui/core/ButtonBase";

interface PaginationNavBtnProps {
  onClick: (event: React.SyntheticEvent<Element, Event>) => void;
  disabled: boolean;
  className?: string;
}

const PaginationNavigationButton: React.FC<PaginationNavBtnProps> = ({
  onClick,
  disabled,
  className,
  children,
}) => {
  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      className={classNames(styles.PaginationItem, className)}
      disableRipple
    >
      {children}
    </ButtonBase>
  );
};

interface PaginationProps {
  currentPage: number;
  pagesCount: number;
  onPagination?: (newPage: number) => void;
}
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pagesCount,
  onPagination,
}) => {
  useEffect(() => {
    if (currentPage > pagesCount && onPagination) {
      onPagination(pagesCount);
    }
  }, [currentPage, pagesCount, onPagination]);
  return (
    <MuiPagination
      siblingCount={1}
      boundaryCount={1}
      page={currentPage}
      onChange={(event: React.ChangeEvent<unknown>, newPage: number) => {
        if (onPagination) {
          onPagination(newPage);
        }
      }}
      count={pagesCount}
      renderItem={(item) => {
        if (item.type === "previous") {
          return (
            <PaginationNavigationButton
              onClick={item.onClick}
              disabled={item.disabled}
            >
              Prev
            </PaginationNavigationButton>
          );
        }
        if (item.type === "next") {
          return (
            <PaginationNavigationButton
              onClick={item.onClick}
              disabled={item.disabled}
            >
              Next
            </PaginationNavigationButton>
          );
        }

        if (item.type === "start-ellipsis" || item.type === "end-ellipsis") {
          return (
            <PaginationNavigationButton {...item}>
              <span className={styles.PageElipsis}></span>
              <span className={styles.PageElipsis}></span>
              <span className={styles.PageElipsis}></span>
            </PaginationNavigationButton>
          );
        }
        return (
          <PaginationNavigationButton
            {...item}
            className={classNames({
              [styles.PageSelected]: item.selected,
            })}
          >
            {item.page}
          </PaginationNavigationButton>
        );
      }}
    />
  );
};
