import styles from "./case-appeal-radio.module.scss";
import { Controller, useWatch, Control } from "react-hook-form";
import { Radio, RadioGroup, FormControlLabel } from "@material-ui/core";

interface Props {
  editMode: boolean;
  control: Control;
}

export const CaseAppealRadio: React.FC<Props> = ({ control, editMode }) => {
  const appeal = useWatch({
    control,
    name: `specificDetails.appeal`,
  });

  const outcomeId = useWatch({
    control,
    name: `outcomeId`,
  });

  // Outcome ID 21 = Ongoing for Performance
  // Outcome ID 13 = Ongoing for Grievance
  // Outcome ID 4 = Ongoing for Disciplinary

  if ([21, 13, 4].findIndex((o) => o === outcomeId) !== -1) {
    return null;
  }
  return (
    <div className={styles.RadioWrapper}>
      <p className={styles.AppealLabel}>Appeal?</p>
      {editMode ? (
        <Controller
          control={control}
          name={`specificDetails.appeal`}
          render={(props) => (
            <RadioGroup
              value={props.value}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                props.onChange(event.target.value === "true");
              }}
            >
              <FormControlLabel
                classes={{
                  label: styles.RadioControlLabel,
                }}
                value={true}
                control={<Radio color="primary" size="small" />}
                label="Yes"
              />
              <FormControlLabel
                value={false}
                classes={{
                  label: styles.RadioControlLabel,
                }}
                control={<Radio color="primary" size="small" />}
                label="No"
              />
            </RadioGroup>
          )}
        />
      ) : (
        <div className={styles.SuspendedValue}>{appeal ? "Yes" : "No"}</div>
      )}
    </div>
  );
};
