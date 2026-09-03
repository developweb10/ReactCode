import { Input } from "@components/input/input";
import { Controller } from "react-hook-form";
import { Autocomplete } from "@components/autocomplete/autocomplete";
import Divider from "@material-ui/core/Divider";
import { EmployeesApi } from "@api/employees/employees.api";
import { startWhitespace } from "@utils/regexp";

export { contactInfoSchema } from "./validation-schema";

export const ContactInfoForm = ({
  register,
  setFieldValue,
  groupName,
  errors,

  withDivider,
  control,
  clearErrors,
  disabled,
}: any) => {
  return (
    <div className="input-group">
      <div className="input-wrap">
        <Input
          inputRef={register}
          type="text"
          placeholder="Address Street 1"
          id="address1"
          name={`${groupName}.address1`}
          label="Address Street 1"
          labelRequired
          disabled={disabled}
          errorMessage={errors.address1?.message}
          onBlur={(e) => {
            setFieldValue(
              `${groupName}.address1`,
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
          placeholder="Address Street 2"
          id="address2"
          name={`${groupName}.address2`}
          label="Address Street 2"
          disabled={disabled}
          errorMessage={errors.address2?.message}
          onBlur={(e) => {
            setFieldValue(
              `${groupName}.address2`,
              e.target.value.replace(startWhitespace, "")
            );
          }}
        />
      </div>
      <div className="input-wrap">
        <Input
          type="text"
          placeholder="City"
          id="city"
          name={`${groupName}.city`}
          label="City"
          inputRef={register}
          disabled={disabled}
          errorMessage={errors.city?.message}
          onBlur={(e) => {
            setFieldValue(
              `${groupName}.city`,
              e.target.value.replace(startWhitespace, "")
            );
          }}
        />
      </div>

      <div className="input-wrap">
        <Input
          type="text"
          placeholder="Town"
          id="town"
          name={`${groupName}.town`}
          label="Town"
          disabled={disabled}
          errorMessage={errors.town?.message}
          inputRef={register}
          onBlur={(e) => {
            setFieldValue(
              `${groupName}.town`,
              e.target.value.replace(startWhitespace, "")
            );
          }}
        />
      </div>
      <div className="input-wrap">
        <Input
          type="text"
          placeholder="Post Code"
          id="postCode"
          disabled={disabled}
          name={`${groupName}.postCode`}
          label="Post Code"
          labelRequired
          inputRef={register}
          errorMessage={errors.postCode?.message}
          onBlur={(e) => {
            setFieldValue(
              `${groupName}.postCode`,
              e.target.value.replace(startWhitespace, ""),
              { shouldValidate: true }
            );
          }}
        />
      </div>

      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.country`}
          render={(props) => (
            <Autocomplete
              disabled={disabled}
              value={props.value || null}
              fetch={EmployeesApi.getCountries}
              onChange={(event: React.ChangeEvent<{}>, value) => {
                props.onChange(value);
              }}
              inputProps={{
                label: "Country",
                id: "country",
                placeholder: "Country",
                errorMessage: errors.country?.message,
              }}
              autoSelect
            />
          )}
        />
      </div>
      {withDivider && <Divider />}
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.houseNumber`}
          render={(props) => (
            <Input
              placeholder="Home Telephone"
              id="houseNumber"
              disabled={disabled}
              label="Home Telephone"
              value={props.value}
              type="text"
              errorMessage={errors.houseNumber?.message}
              onChange={(e) => {
                props.onChange(e.target.value);
                if (errors.mobileNumber?.message) {
                  clearErrors(`${groupName}.mobileNumber`);
                }
              }}
              onBlur={(e) => {
                setFieldValue(
                  `${groupName}.houseNumber`,
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
          name={`${groupName}.mobileNumber`}
          render={(props) => (
            <Input
              placeholder="Mobile"
              id="mobileNumber"
              disabled={disabled}
              labelRequired
              label="Mobile"
              value={props.value}
              type="text"
              errorMessage={errors.mobileNumber?.message}
              onChange={(e) => {
                props.onChange(e.target.value);
                if (errors.houseNumber?.message) {
                  clearErrors(`${groupName}.houseNumber`);
                }
              }}
              onBlur={(e) => {
                setFieldValue(
                  `${groupName}.mobileNumber`,
                  e.target.value.replace(startWhitespace, ""),
                  { shouldValidate: true }
                );
              }}
            />
          )}
        />
      </div>
      <div className="input-wrap">
        <Input
          type="text"
          placeholder="Email"
          id="email"
          disabled={disabled}
          name={`${groupName}.email`}
          label="Email"
          labelRequired
          inputRef={register}
          errorMessage={errors.email?.message}
          onBlur={(e) => {
            setFieldValue(
              `${groupName}.email`,
              e.target.value.replace(startWhitespace, ""),
              { shouldValidate: true }
            );
          }}
        />
      </div>
      {withDivider && <Divider />}
      <div className="input-wrap">
        <Input
          type="text"
          placeholder="Personal Email"
          id="personalEmail"
          disabled={disabled}
          name={`${groupName}.personalEmail`}
          label="Personal Email"
          inputRef={register}
          errorMessage={errors.personalEmail?.message}
          onBlur={(e) => {
            setFieldValue(
              `${groupName}.personalEmail`,
              e.target.value.replace(startWhitespace, "")
            );
          }}
        />
      </div>
      <div className="input-wrap">
        <Input
          type="text"
          placeholder="Other Email"
          id="otherEmail"
          disabled={disabled}
          name={`${groupName}.otherEmail`}
          label="Other Email"
          inputRef={register}
          onBlur={(e) => {
            setFieldValue(
              `${groupName}.otherEmail`,
              e.target.value.replace(startWhitespace, "")
            );
          }}
          errorMessage={errors.otherEmail?.message}
        />
      </div>
      {withDivider && <Divider />}
    </div>
  );
};
