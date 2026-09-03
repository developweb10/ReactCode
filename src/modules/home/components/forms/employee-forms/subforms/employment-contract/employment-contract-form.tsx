import { Input } from "@components/input/input";
import { useWatch } from "react-hook-form";
import { Autocomplete } from "@components/autocomplete/autocomplete";
import { Controller } from "react-hook-form";
import { EmployeesApi } from "@api/employees/employees.api";
import { DatePicker } from "@material-ui/pickers";
import Divider from "@material-ui/core/Divider";
import { howAgoDateDifference } from "@utils/dateUtils";
import moment from "moment";

export { contractInfoSchema } from "./validation-schema";

export const LengthOfServiceInput = ({ control, groupName }: any) => {
  const joinDate = useWatch<string>({
    control,
    name: `jobInfo.joinDate`,
  });
  const leaveDate = useWatch<string>({
    control,
    name: `jobInfo.leaveDate`,
  });

  return (
    <div className="input-wrap">
      <Input
        label="Length Of Service"
        placeholder="Length Of Service"
        disabled
        value={
          howAgoDateDifference(
            moment(joinDate).startOf("day").toDate(),
            moment(leaveDate || new Date())
              .startOf("day")
              .toDate()
          ) || "-"
        }
      />
    </div>
  );
};

export const EmploymentContractForm = ({
  register,
  control,
  setFieldValue,
  groupName,
  errors,
  withDivider,
  disabled,
}: any) => {
  return (
    <div className="input-group">
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.startDate`}
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
                  label="Start Date"
                  placeholder="Start Date"
                  value={props.value}
                  disabled={props.disabled}
                  onClick={props.onClick}
                  errorMessage={errors.startDate?.message}
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
          name={`${groupName}.endDate`}
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
                  label="End Date"
                  placeholder="End Date"
                  disabled={props.disabled}
                  value={props.value}
                  onClick={props.onClick}
                  errorMessage={errors.endDate?.message}
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
          name={`${groupName}.contractDetails`}
          render={(props) => (
            <Autocomplete
              fetch={EmployeesApi.getContractDetails}
              value={props.value || null}
              onChange={(event: React.ChangeEvent<{}>, value) => {
                props.onChange(value);
              }}
              disabled={disabled}
              inputProps={{
                label: "Contract Details",
                id: "contractDetails",
                placeholder: "Contract Details",
                errorMessage: errors.contractDetails?.message,
              }}
            />
          )}
        />
      </div>
      <LengthOfServiceInput control={control} groupName={groupName} />
      {withDivider && <Divider />}
    </div>
  );
};
