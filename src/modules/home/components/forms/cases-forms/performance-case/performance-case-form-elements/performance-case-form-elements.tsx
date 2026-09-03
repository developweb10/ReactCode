import styles from "./performance-case-form-elements.module.scss";

import { Divider, Typography } from "@material-ui/core";

import { EmployeeSelectionForm } from "./employee-selection-form/employee-selection-form";
import { EvaluationTable } from "./evaluation-table/evaluation-table";
import { CaseAppealRadio } from "../../subforms/case-appeal-radio/case-appeal-radio";
import NumberFormat from "react-number-format";

import { DatePicker } from "@material-ui/pickers";
import { Select } from "@components/select/select";
import { Input } from "@components/input/input";
import { TextArea } from "@components/text-area/text-area";
import { ValidIcon } from "@components/valid-icon/valid-icon";

import { CaseOutcomeDto } from "@models/cases.models";

import { Controller } from "react-hook-form";
import moment from "moment";

const OutcomeValue = ({ outcome }: { outcome: CaseOutcomeDto }) => {
  let icon = null;

  switch (outcome.name) {
    case "Fail":
      icon = <ValidIcon variant="cross" className={styles.ValidIcon} />;
      break;
    case "Pass":
      icon = <ValidIcon variant="check" className={styles.ValidIcon} />;
      break;
    default:
      break;
  }
  return (
    <div className={styles.OutcomeWrapper}>
      {icon}
      <Typography style={{ marginLeft: !!icon ? 5 : 0 }}>
        {outcome.name}
      </Typography>
    </div>
  );
};

export const PerformanceCaseFormElements = ({
  register,
  setValue,
  watch,
  errors,
  trigger,
  control,
  clearErrors,
  editMode,
  handleLoading,
  caseOutcomesOptions,
  caseData,
}: any) => {
  return (
    <>
      <EmployeeSelectionForm
        register={register}
        setFieldValue={setValue}
        errors={errors}
        control={control}
        clearErrors={clearErrors}
        setLoading={handleLoading}
        editMode={editMode}
        caseData={caseData}
      />

      <Divider
        style={{
          marginTop: 45,
          marginBottom: 40,
          backgroundColor: "#EBEBEB",
          height: 1,
        }}
      />

      <EvaluationTable
        control={control}
        register={register}
        errors={errors}
        trigger={trigger}
        editMode={editMode}
      />
      <Divider
        style={{
          marginTop: 45,
          marginBottom: 40,
          backgroundColor: "#EBEBEB",
          height: 1,
        }}
      />
      <div className={styles.TextFieldSection}>
        <Typography className={styles.Label}>Final Comment</Typography>
        <div className={styles.TextFieldWrapper}>
          {!editMode ? (
            <Typography>
              {caseData.specificDetails?.finalComment || "-"}
            </Typography>
          ) : (
            <TextArea
              rows={8}
              placeholder="Add Comment"
              name="specificDetails.finalComment"
              errorMessage={errors.specificDetails?.finalComment?.message}
              inputRef={register()}
              className={styles.TextArea}
            />
          )}
        </div>
      </div>
      <div className={styles.TextFieldSection}>
        <Typography className={styles.Label}>Final Score</Typography>
        <div className={styles.TextFieldWrapper}>
          {!editMode ? (
            <Typography>
              {caseData.specificDetails?.finalScore || "-"}
            </Typography>
          ) : (
            <Controller
              control={control}
              name={`specificDetails.finalScore`}
              render={(props) => (
                <NumberFormat
                  id="finalScore"
                  inputClassname={styles.TextField}
                  placeholder="Add Score"
                  value={props.value}
                  customInput={Input}
                  type="text"
                  errorMessage={errors.specificDetails?.finalScore?.message}
                  isNumericString
                  decimalScale={2}
                  allowNegative={false}
                  onValueChange={({ floatValue }) => {
                    props.onChange(floatValue || null);
                  }}
                />
              )}
            />
          )}
        </div>
      </div>
      <div className={styles.TextFieldSection}>
        <Typography className={styles.Label}>Outcome</Typography>
        <div className={styles.TextFieldWrapper}>
          {!editMode ? (
            <OutcomeValue outcome={caseData.outcome} />
          ) : (
            <Controller
              control={control}
              name={`outcomeId`}
              render={(props) => (
                <Select
                  inputProps={{
                    inputClassname: styles.TextField,
                  }}
                  disabled={!editMode}
                  value={props.value}
                  options={caseOutcomesOptions}
                  onChange={(
                    event: React.ChangeEvent<{
                      name?: string | undefined;
                      value: unknown;
                    }>
                  ) => {
                    props.onChange(event.target.value);
                  }}
                />
              )}
            />
          )}
        </div>
      </div>

      <div className={styles.TextFieldSection}>
        <Typography className={styles.Label}>Completion Date</Typography>
        <div className={styles.TextFieldWrapper}>
          {!editMode ? (
            <Typography>
              {caseData.specificDetails.completionDate
                ? moment(caseData.specificDetails.completionDate).format(
                    "DD MMM YYYY"
                  )
                : "-"}
            </Typography>
          ) : (
            <Controller
              control={control}
              name={`specificDetails.completionDate`}
              render={(props) => (
                <DatePicker
                  value={props.value || null}
                  clearable
                  onChange={(date) => {
                    props.onChange(date?.toISOString() || null);
                  }}
                  disabled={!editMode}
                  TextFieldComponent={(props) => (
                    <Input
                      inputClassname={styles.TextField}
                      disabled={!editMode}
                      placeholder="_ _ /_ _ /_ _ _ _ "
                      value={props.value}
                      onClick={props.onClick}
                      errorMessage={
                        errors.specificDetails?.completionDate?.message
                      }
                    />
                  )}
                  format="DD MMM YYYY"
                />
              )}
            />
          )}
        </div>
      </div>
      {caseData && caseData.statusUpdatedDate && caseData.status === "CLOSED" && (
        <div className={styles.TextFieldSection}>
          <Typography className={styles.Label}>Closed Date</Typography>
          <div className={styles.TextFieldWrapper}>
            <Typography>
              {moment(caseData.statusUpdatedDate).format("DD MMM YYYY")}
            </Typography>
          </div>
        </div>
      )}
      <div className={styles.AppealWrapper}>
        <CaseAppealRadio editMode={editMode} control={control} />
      </div>
    </>
  );
};
