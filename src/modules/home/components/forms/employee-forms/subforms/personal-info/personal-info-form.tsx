import { useWatch, Controller } from "react-hook-form";
import { Input } from "@components/input/input";
import { Select } from "@components/select/select";
import { Autocomplete } from "@components/autocomplete/autocomplete";
import { DatePicker } from "@material-ui/pickers";
import NumberFormat from "react-number-format";
import Divider from "@material-ui/core/Divider";

import { startWhitespace } from "@utils/regexp";

import { EmployeesApi } from "@api/employees/employees.api";

export { personalInfoSchema } from "./validation-schema";

const GenderInfoInput = ({
  control,
  groupName,
  disabled,
  error,
  setFieldValue,
}: any) => {
  const gender = useWatch({
    control,
    name: `${groupName}.gender`,
  });

  return gender === "Other" ? (
    <div className="input-wrap">
      <Input
        disabled={disabled}
        placeholder="Gender Name"
        id="gendername"
        inputRef={control.register()}
        name={`${groupName}.genderName`}
        label="Gender Name"
        labelRequired
        errorMessage={error}
        onBlur={(e) => {
          setFieldValue(
            `${groupName}.genderName`,
            e.target.value.replace(startWhitespace, "")
          );
        }}
      />
    </div>
  ) : null;
};

export const PersonalInfoForm = ({
  register,
  control,
  trigger,
  setFieldValue,
  groupName,
  errors,
  initialValues,
  withDivider,
  disabled,
  clearErrors,
}: any) => {
  return (
    <div className="input-group">
      <div className="input-wrap">
        <Input
          inputRef={register}
          type="text"
          placeholder="First Name"
          id="firstname"
          name={`${groupName}.firstname`}
          label="First Name"
          labelRequired
          disabled={disabled}
          errorMessage={errors.firstname?.message}
          onBlur={(e) => {
            setFieldValue(
              `${groupName}.firstname`,
              e.target.value.replace(startWhitespace, ""),
              { shouldValidate: true }
            );
          }}
        />
      </div>
      <div className="input-wrap">
        <Input
          inputRef={register}
          type="text"
          placeholder="Middle Name"
          id="middleName"
          name={`${groupName}.middleName`}
          label="Middle Name"
          disabled={disabled}
          errorMessage={errors.middleName?.message}
          onBlur={(e) => {
            setFieldValue(
              `${groupName}.middleName`,
              e.target.value.replace(startWhitespace, ""),
              { shouldValidate: true }
            );
          }}
        />
      </div>
      <div className="input-wrap">
        <Input
          inputRef={register}
          type="text"
          placeholder="Last Name"
          id="surname"
          name={`${groupName}.surname`}
          label="Last Name"
          labelRequired
          disabled={disabled}
          errorMessage={errors.surname?.message}
          onBlur={(e) => {
            setFieldValue(
              `${groupName}.surname`,
              e.target.value.replace(startWhitespace, ""),
              { shouldValidate: true }
            );
          }}
        />
      </div>
      {/* <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.otherId`}
          render={(props) => (
            <NumberFormat
              placeholder="Other ID"
              value={props.value}
              label="Other ID"
              customInput={Input}
              type="text"
              disabled={disabled}
              errorMessage={errors.otherId?.message}
              isNumericString
              decimalScale={0}
              allowNegative={false}
              onValueChange={({ floatValue }) => {
                props.onChange(floatValue || "");
              }}
            />
          )}
        />
      </div> */}
      <div className="input-wrap">
        <Input
          inputRef={register}
          type="text"
          placeholder="Other ID"
          id="otherId"
          name={`${groupName}.otherId`}
          label="Other ID"
          disabled={disabled}
          errorMessage={errors.otherId?.message}
          onBlur={(e) => {
            setFieldValue(
              `${groupName}.otherId`,
              e.target.value.replace(startWhitespace, ""),
              { shouldValidate: true }
            );
          }}
        />
      </div>
      {withDivider && <Divider />}
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.gender`}
          render={(props) => (
            <Select
              inputProps={{
                label: "Gender",
                labelRequired: true,
                errorMessage: errors.gender?.message,
              }}
              value={
                props.value
                  ? props.value === "Male" || props.value === "Female"
                    ? props.value
                    : "Other"
                  : ""
              }
              displayEmpty
              renderValue={() => {
                return props.value || <div>Gender</div>;
              }}
              disabled={disabled}
              options={[
                { name: "Male", value: "Male" },
                { name: "Female", value: "Female" },
                { name: "Other", value: "Other" },
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
      </div>
      <GenderInfoInput
        control={control}
        error={errors.gender?.message}
        groupName={groupName}
        disabled={disabled}
        setFieldValue={setFieldValue}
      />
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.ethnicity`}
          render={(props) => (
            <Autocomplete
              disabled={disabled}
              value={props.value || null}
              fetch={EmployeesApi.getEthnicities}
              onChange={(event: React.ChangeEvent<{}>, value) => {
                props.onChange(value);
              }}
              inputProps={{
                label: "Ethnicity",
                id: "ethnicity",
                placeholder: "Ethnicity",
                errorMessage: errors.ethnicity?.message,
              }}
            />
          )}
        />
      </div>
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.nationality`}
          render={(props) => (
            <Autocomplete
              disabled={disabled}
              value={props.value || null}
              fetch={EmployeesApi.getNationalities}
              onChange={(event: React.ChangeEvent<{}>, value) => {
                props.onChange(value);
              }}
              inputProps={{
                label: "Nationality",
                id: "nationality",
                placeholder: "Nationality",
                errorMessage: errors.nationality?.message,
                labelRequired: true,
              }}
            />
          )}
        />
      </div>
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.dateOfBirth`}
          render={(props) => (
            <DatePicker
              value={props.value || null}
              onChange={(date) => {
                props.onChange(date?.toISOString());
                if (trigger) {
                  trigger(`${groupName}.dateOfBirth`);
                }
              }}
              disableFuture
              disabled={disabled}
              TextFieldComponent={(props) => (
                <Input
                  id="dateOfBirth"
                  label="Date of Birth"
                  labelRequired
                  disabled={props.disabled}
                  placeholder="_ _/_ _/_ _ _ _"
                  value={props.value}
                  onClick={props.onClick}
                  errorMessage={errors.dateOfBirth?.message}
                />
              )}
              format="DD MMM YYYY"
            />
          )}
        />
      </div>
      {withDivider && <Divider />}
      <div className="input-wrap">
        <Input
          placeholder="Known As"
          id="knowAs"
          name={`${groupName}.knowAs`}
          label="Known As"
          disabled={disabled}
          inputRef={register}
          errorMessage={errors.knowAs?.message}
          onBlur={(e) => {
            setFieldValue(
              `${groupName}.knowAs`,
              e.target.value.replace(startWhitespace, ""),
              { shouldValidate: true }
            );
          }}
        />
      </div>
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.smoker`}
          render={(props) => (
            <Select
              inputProps={{
                label: "Smoker",
              }}
              value={props.value}
              displayEmpty
              renderValue={() => {
                return props.value || <div>Smoker</div>;
              }}
              options={[
                { name: "No", value: "No" },
                { name: "Yes", value: "Yes" },
              ]}
              disabled={disabled}
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
      {withDivider && <Divider />}
    </div>
  );
};
