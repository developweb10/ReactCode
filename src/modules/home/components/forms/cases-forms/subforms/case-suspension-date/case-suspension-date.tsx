import { DateTimePicker } from "@material-ui/pickers";
import { useWatch } from "react-hook-form";
import { Input } from "@components/input/input";
import { Controller } from "react-hook-form";

export const SuspensionDate = ({
  control,
  disabled,
  error,
  className,
}: any) => {
  const suspendedSelected = useWatch({
    control,
    name: `specificDetails.suspended`,
  });

  if (!suspendedSelected) return null;
  return (
    <div className={className}>
      <Controller
        control={control}
        name={`specificDetails.suspensionDate`}
        render={(props) => (
          <DateTimePicker
            ampm={false}
            value={props.value || null}
            onChange={(date) => {
              props.onChange(date?.toISOString());
            }}
            disabled={disabled}
            TextFieldComponent={(props) => (
              <Input
                label="Suspension Date and Time"
                labelRequired
                disabled={disabled}
                placeholder="_ _ /_ _ /_ _ _ _ at _ _ : _ _"
                value={props.value}
                onClick={props.onClick}
                errorMessage={error}
              />
            )}
            format="DD MMM YYYY [at] h:mm a"
          />
        )}
      />
    </div>
  );
};
