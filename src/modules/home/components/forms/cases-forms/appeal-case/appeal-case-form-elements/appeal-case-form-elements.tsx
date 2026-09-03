import styles from "./appeal-case-form-elements.module.scss";

import {
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@material-ui/core";

import { CaseTypeForm } from "../../subforms/case-type-form/case-type-form";
import { SuspensionDate } from "../../subforms/case-suspension-date/case-suspension-date";
import { EmployeesApi } from "@api/employees/employees.api";

import { DateTimePicker } from "@material-ui/pickers";
import { Select } from "@components/select/select";
import { Input } from "@components/input/input";
import { TextArea } from "@components/text-area/text-area";
import { Autocomplete } from "@components/autocomplete/autocomplete";

import { Controller } from "react-hook-form";
import moment from "moment";

export const AppealCaseFormElements = ({
  register,
  setValue,
  watch,
  errors,
  control,
  clearErrors,
  editMode,
  handleLoading,
  caseOutcomesOptions,
  caseData,
}: any) => {
  const hasCloseDate =
    caseData && caseData.statusUpdatedDate && caseData.status === "CLOSED";
  return (
    <>
      <CaseTypeForm
        register={register}
        setFieldValue={setValue}
        errors={errors}
        caseType="Appeal"
        control={control}
        clearErrors={clearErrors}
        setLoading={handleLoading}
        editMode={editMode}
        caseData={caseData}
      />

      <Divider style={{ marginTop: 45, marginBottom: 40 }} />
      <div className="input-area-group">
        <div className="left-group">
          <Controller
            control={control}
            name={`specificDetails.currentIssue`}
            render={(props) => (
              <Select
                disabled={!editMode}
                inputProps={{
                  label: "Current Issue",
                  labelRequired: true,
                }}
                value={props.value}
                options={[
                  { name: "Conduct", value: "Conduct" },
                  { name: "Capability", value: "Capability" },
                ]}
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
          <Autocomplete
            disabled={!editMode}
            browserAutocompleteOff
            fetch={async (search) => {
              const result = await EmployeesApi.fetchEmployees({
                fields: ["id", "firstname", "surname"],
                search,
                sort: "surname,asc",
              });
              return { data: result.data.result };
            }}
            defaultValue={caseData?.specificDetails?.officer || null}
            inputProps={{
              label: "Investigation Officer",
              placeholder: "Investigation Officer",
              inputRef: register({
                name: `specificDetails.officerId`,
                type: "custom",
              }),
              name: `specificDetails.officerId`,
              errorMessage: errors.specificDetails?.officerId?.message,
            }}
            debouncedSearch
            onChange={(event: React.ChangeEvent<{}>, value, reason) => {
              setValue(`specificDetails.officerId`, value?.id || null);
              clearErrors(`specificDetails.officerId`);
            }}
            getOptionSelected={(option, value) => option.id === value.id}
            getOptionLabel={(option) =>
              `${option.id} - ${
                option.name || `${option.firstname} ${option.surname}`
              }`
            }
          />
          <Controller
            control={control}
            name={`specificDetails.appealDate`}
            render={(props) => (
              <DateTimePicker
                ampm={false}
                value={props.value || null}
                disabled={!editMode}
                clearable
                onChange={(date) => {
                  props.onChange(date?.toISOString() || null);
                }}
                TextFieldComponent={(props) => (
                  <Input
                    label="Appeal Date/Time"
                    placeholder="_ _ /_ _ /_ _ _ _ at _ _ : _ _"
                    value={props.value}
                    onClick={props.onClick}
                    disabled={!editMode}
                    errorMessage={errors.specificDetails?.appealDate?.message}
                  />
                )}
                format="DD MMM YYYY [at] h:mm a"
              />
            )}
          />
        </div>
        <div className="right-group">
          <TextArea
            label="Specific Details"
            labelRequired
            rows={hasCloseDate ? 9 : 13}
            placeholder="Specific Details"
            name="details"
            inputRef={register()}
            errorMessage={errors.details?.message}
            disabled={!editMode}
          />
          {hasCloseDate && (
            <div className={styles.TextFieldSection} style={{ marginTop: 10 }}>
              <div className={styles.TextFieldWrapper}>
                <Input
                  label="Closed Date"
                  value={moment(caseData.statusUpdatedDate).format(
                    "DD MMM YYYY"
                  )}
                  disabled
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.SuspendedSection}>
        <div className={styles.SuspendedElementsWrapper}>
          <div className={styles.RadioWrapper}>
            <div className={styles.SuspendedLabel}>
              <span className={styles.LabelAsterix}>*</span>Suspended?
            </div>
            {editMode ? (
              <Controller
                control={control}
                name={`specificDetails.suspended`}
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
              <div className={styles.SuspendedValue}>
                {watch(`specificDetails.suspended`) ? "Yes" : "No"}
              </div>
            )}
          </div>
          <SuspensionDate
            disabled={!editMode}
            control={control}
            className={styles.SuspensionDate}
            error={errors.specificDetails?.suspensionDate?.message}
          />
        </div>
      </div>
      <div className={styles.NoteAreaSection}>
        <TextArea
          label="Note"
          rows={15}
          placeholder="Text Here"
          name="note"
          inputRef={register()}
          disabled={!editMode}
        />
      </div>
      <Divider />
      <div className={styles.OutcomeSection}>
        <h4>Outcome</h4>
        <div className={styles.OutcomeWrapper}>
          <Controller
            control={control}
            name={`outcomeId`}
            render={(props) => (
              <Select
                inputProps={{
                  label: "Select Outcome",
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
        </div>
      </div>
    </>
  );
};
