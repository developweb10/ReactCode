import styles from "./lts-case-form-elements.module.scss";

import { Divider } from "@material-ui/core";

import { CaseTypeForm } from "../../subforms/case-type-form/case-type-form";

import { CasesApi } from "@api/cases/cases.api";

import { DatePicker } from "@material-ui/pickers";
import { Select } from "@components/select/select";
import { Input } from "@components/input/input";
import { TextArea } from "@components/text-area/text-area";
import { Autocomplete } from "@components/autocomplete/autocomplete";

import { Controller, useWatch } from "react-hook-form";
import moment from "moment";
import { howAgoDateDifference } from "@utils/dateUtils";

export const ReturnDate = ({ control, disabled, error }: any) => {
  const outcomeId = useWatch<number>({
    control,
    name: `outcomeId`,
  });

  // OutcomeID 12 = "Returned To Work"
  if (outcomeId !== 12) return null;
  return (
    <div className={styles.ReturnDateSection}>
      <div className={styles.ReturnDate}>
        <Controller
          control={control}
          name={`specificDetails.returnDate`}
          render={(props) => (
            <DatePicker
              value={props.value || null}
              onChange={(date) => {
                props.onChange(date?.toISOString());
              }}
              disabled={disabled}
              TextFieldComponent={(props) => (
                <Input
                  label="Return Date"
                  disabled={disabled}
                  placeholder="_ _ /_ _ /_ _ _ _"
                  value={props.value}
                  onClick={props.onClick}
                  errorMessage={error}
                />
              )}
              format="DD MMM YYYY"
            />
          )}
        />
      </div>
    </div>
  );
};

export const TimeOffSick = ({ control }: any) => {
  const dateOfSickness = useWatch<string>({
    control,
    name: `specificDetails.dateOfSickness`,
  });

  return (
    <div className={styles.TimeOffSick}>
      <div className={styles.TimeOffSickLabel}>Time Off Sick</div>
      <div className={styles.TimeOffSickValue}>
        {howAgoDateDifference(
          moment(dateOfSickness).startOf("day").toDate(),
          moment().startOf("day").toDate()
        ) || "-"}
      </div>
    </div>
  );
};

export const LTSCaseFormElements = ({
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
        caseType="LTS"
        control={control}
        clearErrors={clearErrors}
        setLoading={handleLoading}
        editMode={editMode}
        caseData={caseData}
      />

      <Divider style={{ marginTop: 45, marginBottom: 40 }} />
      <div className="input-area-group">
        <div className="left-group">
          <Autocomplete
            browserAutocompleteOff
            disabled={!editMode}
            fetch={async () => {
              const result = await CasesApi.getCaseAilments();
              return {
                data: result.data.result.sort((a, b) =>
                  a.name.localeCompare(b.name)
                ),
              };
            }}
            defaultValue={caseData?.specificDetails?.ailment || null}
            inputProps={{
              label: "Ailment",
              labelRequired: true,
              placeholder: "Select Ailment",
              inputRef: register({
                name: `specificDetails.ailment`,
                type: "custom",
              }),
              name: `specificDetails.ailment`,
              errorMessage: errors.specificDetails?.ailment?.message,
            }}
            onChange={(event: React.ChangeEvent<{}>, value, reason) => {
              setValue(`specificDetails.ailment`, value?.name || value || null);
              clearErrors(`specificDetails.ailment`);
            }}
            getOptionSelected={(option, value) => {
              const v = typeof value === "string" ? value : value.name;
              return v === option.name;
            }}
            getOptionLabel={(option) =>
              typeof option === "string" ? option : `${option.name}`
            }
          />
          <Controller
            control={control}
            name={`specificDetails.dateOfSickness`}
            render={({ value, ref, onChange }) => (
              <DatePicker
                value={value || null}
                disabled={!editMode}
                onChange={(date) => {
                  onChange(date?.toISOString());
                }}
                TextFieldComponent={(props) => (
                  <Input
                    label="Date Of Sickness"
                    labelRequired
                    withPlaceholderSpace
                    placeholder="__/__/____"
                    value={props.value}
                    onClick={props.onClick}
                    disabled={!editMode}
                    errorMessage={
                      errors.specificDetails?.dateOfSickness?.message
                    }
                  />
                )}
                format="DD MMM YYYY"
              />
            )}
          />
          <Controller
            control={control}
            name={`specificDetails.fitNoteExpiresOn`}
            render={(props) => (
              <DatePicker
                value={props.value || null}
                clearable
                disabled={!editMode}
                onChange={(date) => {
                  props.onChange(date?.toISOString() || null);
                }}
                TextFieldComponent={(props) => (
                  <Input
                    label="Fit Note Expires On"
                    withPlaceholderSpace
                    placeholder="__/__/____"
                    value={props.value}
                    onClick={props.onClick}
                    disabled={!editMode}
                    errorMessage={
                      errors.specificDetails?.fitNoteExpiresOn?.message
                    }
                  />
                )}
                format="DD MMM YYYY"
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
      <TimeOffSick control={control} />
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
      <ReturnDate
        control={control}
        disabled={!editMode}
        error={errors.specificDetails?.returnDate?.message}
      />
    </>
  );
};
