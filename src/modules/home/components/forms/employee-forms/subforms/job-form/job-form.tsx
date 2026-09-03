import { Input } from "@components/input/input";

import { Autocomplete } from "@components/autocomplete/autocomplete";
import { Controller } from "react-hook-form";
import { DatePicker } from "@material-ui/pickers";
import Divider from "@material-ui/core/Divider";

import { EmployeesApi } from "@api/employees/employees.api";
import { StoresApi } from "@api/stores/stores.api";

export { jobInfoSchema } from "./validation-schema";

export const JobForm = ({
  control,
  setFieldValue,
  groupName,
  errors,
  withDivider,
  selectedLocation,
  onLocationSelect,
  clearErrors,
  disabled,
}: any) => {
  return (
    <div className="input-group">
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.jobTitle`}
          render={(props) => (
            <Autocomplete
              fetch={EmployeesApi.getJobTitle}
              onChange={(event: React.ChangeEvent<{}>, value) => {
                props.onChange(value);
              }}
              disabled={disabled}
              value={props.value || null}
              inputProps={{
                label: "Job Title",
                labelRequired: true,
                id: "jobTitle",
                placeholder: "Job Title",
                errorMessage: errors.jobTitle?.message,
              }}
            />
          )}
        />
      </div>
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.jobSpecifications`}
          render={(props) => (
            <Autocomplete
              fetch={EmployeesApi.getJobSpecifications}
              value={props.value || null}
              onChange={(event: React.ChangeEvent<{}>, value) => {
                props.onChange(value);
              }}
              disabled={disabled}
              inputProps={{
                label: "Job Specifications",
                id: "jobSpecifications",
                placeholder: "Job Specifications",
                errorMessage: errors.jobSpecifications?.message,
              }}
            />
          )}
        />
      </div>
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.employmentStatus`}
          render={(props) => (
            <Autocomplete
              fetch={EmployeesApi.getEmploymentStatuses}
              value={props.value || null}
              onChange={(event: React.ChangeEvent<{}>, value) => {
                props.onChange(value);
              }}
              disabled={disabled}
              inputProps={{
                label: "Employment Status",
                labelRequired: true,
                id: "employmentStatus",
                placeholder: "Employment Status",
                errorMessage: errors.employmentStatus?.message,
              }}
            />
          )}
        />
      </div>
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.function`}
          render={(props) => (
            <Autocomplete
              fetch={EmployeesApi.getFunctions}
              value={props.value || null}
              onChange={(event: React.ChangeEvent<{}>, value) => {
                props.onChange(value);
              }}
              disabled={disabled}
              inputProps={{
                label: "Function",
                labelRequired: true,
                id: "function",
                placeholder: "Function",
                errorMessage: errors.function?.message,
              }}
            />
          )}
        />
      </div>
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.joinDate`}
          render={(props) => (
            <DatePicker
              value={props.value || null}
              onChange={(date) => {
                props.onChange(date?.toISOString());
              }}
              disabled={disabled}
              disableFuture
              TextFieldComponent={(props) => (
                <Input
                  label="Joined Date"
                  labelRequired
                  disabled={props.disabled}
                  placeholder="Joined Date"
                  value={props.value}
                  onClick={props.onClick}
                  errorMessage={errors.joinDate?.message}
                />
              )}
              format="DD MMM YYYY"
            />
          )}
        />
      </div>
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.leaveDate`}
          render={(props) => (
            <DatePicker
              clearable
              value={props.value || null}
              onChange={(date) => {
                props.onChange(date?.toISOString() || null);
              }}
              disabled={disabled}
              TextFieldComponent={(props) => (
                <Input
                  label="Leave Date"
                  disabled={props.disabled}
                  placeholder="Leave Date"
                  value={props.value}
                  onClick={props.onClick}
                  errorMessage={errors.leaveDate?.message}
                />
              )}
              format="DD MMM YYYY"
            />
          )}
        />
      </div>
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.department`}
          render={(props) => (
            <Autocomplete
              fetch={EmployeesApi.getDepartments}
              value={props.value || null}
              disabled={disabled}
              onChange={(event: React.ChangeEvent<{}>, value) => {
                props.onChange(value);
              }}
              inputProps={{
                label: "Department",
                labelRequired: true,
                id: "department",
                placeholder: "Department",
                errorMessage: errors.department?.message,
              }}
            />
          )}
        />
      </div>
      <div className="input-wrap">
        <Autocomplete
          fetch={async (search) => {
            const result = await StoresApi.fetchStores({
              search,
              sort: "name,asc",
            });
            return { data: result.data.result };
          }}
          disabled={disabled}
          value={selectedLocation}
          inputProps={{
            label: "Location",
            labelRequired: true,
            id: "location",
            placeholder: "Location",
            errorMessage: errors.storeId?.message,
          }}
          debouncedSearch
          onChange={(event: React.ChangeEvent<{}>, value) => {
            if (value) {
              clearErrors(`${groupName}.storeId`);
            }

            setFieldValue(`${groupName}.storeId`, value?.id || "");

            if (onLocationSelect) {
              onLocationSelect(value);
            }
          }}
          getOptionSelected={(option, value) => option.name === value.name}
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option.name
          }
        />
      </div>
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.storeId`}
          render={(props) => (
            <Input
              placeholder="Location Number"
              id="storeId"
              label="Location Number"
              value={props.value}
              disabled
            />
          )}
        />
      </div>
      {withDivider && <Divider />}
    </div>
  );
};
