import { Input } from "@components/input/input";

import { Autocomplete } from "@components/autocomplete/autocomplete";
import { Controller } from "react-hook-form";
import Divider from "@material-ui/core/Divider";
import { EmployeesApi } from "@api/employees/employees.api";
import { startWhitespace } from "@utils/regexp";

export { emergencyInfoSchema } from "./validation-schema";

export const EmergencyContactsForm = ({
  register,
  setFieldValue,
  groupName,
  errors,
  control,
  withDivider,
  clearErrors,
  disabled,
}: any) => {
  return (
    <div className="input-group">
      <div className="input-wrap">
        <Input
          type="text"
          placeholder="First Name"
          id="ecFirstName"
          name={`${groupName}.ecFirstName`}
          label="First Name"
          inputRef={register}
          errorMessage={errors.ecFirstName?.message}
          labelRequired
          disabled={disabled}
          onBlur={(e) => {
            setFieldValue(
              `${groupName}.ecFirstName`,
              e.target.value.replace(startWhitespace, "")
            );
          }}
        />
      </div>
      <div className="input-wrap">
        <Input
          type="text"
          placeholder="Last Name"
          id="ecLastName"
          name={`${groupName}.ecLastName`}
          label="Last Name"
          inputRef={register}
          errorMessage={errors.ecLastName?.message}
          labelRequired
          disabled={disabled}
          onBlur={(e) => {
            setFieldValue(
              `${groupName}.ecLastName`,
              e.target.value.replace(startWhitespace, "")
            );
          }}
        />
      </div>
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.ecRelationship`}
          render={(props) => (
            <Autocomplete
              value={props.value || null}
              disabled={disabled}
              fetch={EmployeesApi.getRelationships}
              onChange={(event: React.ChangeEvent<{}>, value) => {
                props.onChange(value);
              }}
              inputProps={{
                label: "Relationship",
                id: "ecRelationship",
                placeholder: "Relationship",
                errorMessage: errors.ecRelationship?.message,
              }}
              autoSelect
            />
          )}
        />
      </div>

      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.ecHomeTelephone`}
          render={(props) => (
            <Input
              placeholder="Home Telephone"
              id="ecHomeTelephone"
              label="Home Telephone"
              disabled={disabled}
              value={props.value}
              type="text"
              errorMessage={errors.ecHomeTelephone?.message}
              onChange={(e) => {
                props.onChange(e.target.value);
                if (errors.ecMobile?.message) {
                  clearErrors(`${groupName}.ecMobile`);
                }
              }}
              onBlur={(e) => {
                setFieldValue(
                  `${groupName}.ecHomeTelephone`,
                  e.target.value.replace(startWhitespace, ""),
                  { shouldValidate: true }
                );
              }}
            />
          )}
        />
      </div>
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.ecMobile`}
          render={(props) => (
            <Input
              placeholder="Mobile"
              id="ecMobile"
              label="Mobile"
              labelRequired
              disabled={disabled}
              value={props.value}
              type="text"
              errorMessage={errors.ecMobile?.message}
              onChange={(e) => {
                props.onChange(e.target.value);
                if (errors.ecHomeTelephone?.message) {
                  clearErrors(`${groupName}.ecHomeTelephone`);
                }
              }}
              onBlur={(e) => {
                setFieldValue(
                  `${groupName}.ecMobile`,
                  e.target.value.replace(startWhitespace, ""),
                  { shouldValidate: true }
                );
              }}
            />
          )}
        />
      </div>
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.ecWorkTelephone`}
          render={(props) => (
            <Input
              placeholder="Work Telephone"
              id="ecWorkTelephone"
              label="Work Telephone"
              disabled={disabled}
              value={props.value}
              type="text"
              errorMessage={errors.ecWorkTelephone?.message}
              onChange={(e) => {
                props.onChange(e.target.value);
              }}
              onBlur={(e) => {
                setFieldValue(
                  `${groupName}.ecWorkTelephone`,
                  e.target.value.replace(startWhitespace, ""),
                  { shouldValidate: true }
                );
              }}
            />
          )}
        />
      </div>
      {withDivider && <Divider />}
    </div>
  );
};
