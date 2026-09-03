import styles from "./form-footer.module.scss";
import classNames from "classnames";
import Button from "@material-ui/core/Button";

interface FormFooterProps {
  onEditModeChange: (editMode: boolean) => void;
  onCancel: () => void;
  editMode: boolean;
}
export const FormFooter: React.FC<FormFooterProps> = ({
  onEditModeChange,
  onCancel,
  editMode,
}) => {
  return (
    <div className={styles.Footer}>
      <div className={styles.Annotation}>
        <span className="yellow-text">*</span>Required field
      </div>
      <div className={styles.ButtonWrap}>
        {editMode && (
          <>
            <Button
              key="submit"
              className={classNames("button-primary", styles.SubmitButton)}
              color="primary"
              variant="contained"
              disableElevation
              type="submit"
            >
              Save
            </Button>
            <Button
              key="cancel"
              className="button-primary"
              color="secondary"
              variant="contained"
              type="button"
              disableElevation
              onClick={() => {
                onEditModeChange(false);
                onCancel();
              }}
            >
              Cancel
            </Button>
          </>
        )}
        {!editMode && (
          <Button
            key="edit"
            className="button-primary"
            color="secondary"
            variant="contained"
            type="button"
            disableElevation
            onClick={() => {
              onEditModeChange(true);
            }}
          >
            Edit
          </Button>
        )}
      </div>
    </div>
  );
};
