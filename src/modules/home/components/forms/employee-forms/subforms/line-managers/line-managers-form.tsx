import { Input } from "@components/input/input";
import { Controller } from "react-hook-form";
import { Autocomplete } from "@components/autocomplete/autocomplete";
import Divider from "@material-ui/core/Divider";
import { ManagersApi } from "@api/managers/managers.api";

export { lineManagersInfoSchema } from "./validation-schema";

export const LineManagersForm = ({
  control,
  groupName,
  errors,
  withDivider,
  selectedLocation,
  disabled,
}: any) => {
  return (
    <div className="input-group">
      {selectedLocation && (
        <div className="input-wrap">
          <Input
            label="District Manager"
            placeholder="District Manager"
            value={selectedLocation.districtManager?.name}
            disabled
          />
        </div>
      )}
      {selectedLocation && (
        <div className="input-wrap">
          <Input
            label="Regional Manager"
            placeholder="Regional Manager"
            value={selectedLocation.regionalManager?.name}
            disabled
          />
        </div>
      )}
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.primaryLineManager`}
          render={(props) => (
            <Autocomplete
              fetch={ManagersApi.fetchPrimaryLineManagers}
              value={props.value || null}
              onChange={(event: React.ChangeEvent<{}>, value) => {
                props.onChange(value);
              }}
              disabled={disabled}
              inputProps={{
                label: "Primary Line Manager",
                placeholder: "Primary Line Manager",
                errorMessage: errors.primaryLineManagerId?.message,
              }}
              getOptionSelected={(option, value) => option.name === value.name}
              getOptionLabel={(option) => option.name}
            />
          )}
        />
      </div>
      <div className="input-wrap">
        <Controller
          control={control}
          name={`${groupName}.secondaryLineManager`}
          render={(props) => (
            <Autocomplete
              fetch={ManagersApi.fetchSecondaryLineManagers}
              value={props.value || null}
              onChange={(event: React.ChangeEvent<{}>, value) => {
                props.onChange(value);
              }}
              disabled={disabled}
              inputProps={{
                label: "Secondary Line Manager",
                placeholder: "Secondary Line Manager",
                errorMessage: errors.secondaryLineManagerId?.message,
              }}
              getOptionSelected={(option, value) => option.name === value.name}
              getOptionLabel={(option) => option.name}
            />
          )}
        />
      </div>

      {withDivider && <Divider />}
    </div>
  );
};
