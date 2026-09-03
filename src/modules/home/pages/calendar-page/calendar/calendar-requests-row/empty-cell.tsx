import styles from "./calendar-requests-row.module.scss";
import {
  dialogManagerService,
  DialogType,
} from "@store/dialog-manager/dialog.service";
import AddIcon from "@material-ui/icons/Add";
import { ButtonBase } from "@material-ui/core";

interface EmptyCellProps {
  isWeekEndCell: boolean;
  fullDate: string;
  canCreateRequest: boolean;
}
export const EmptyCell: React.FC<EmptyCellProps> = ({
  isWeekEndCell,
  fullDate,
  canCreateRequest,
}) => {
  if (!canCreateRequest) {
    return <div></div>;
  }

  return isWeekEndCell ? (
    <div className={styles.WeekCell}></div>
  ) : (
    <ButtonBase
      className={styles.EmptyCell}
      disableRipple
      onClick={() => {
        dialogManagerService.openDialog(DialogType.CREATE_REQUEST, {
          startDate: fullDate,
        });
      }}
    >
      <div className={styles.EmptyIconWrapper}>
        <AddIcon className={styles.EmptyIcon} />
      </div>
    </ButtonBase>
  );
};
