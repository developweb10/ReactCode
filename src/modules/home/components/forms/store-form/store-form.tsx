import styles from "./store-form.module.scss";
import { CircularProgress, Button } from "@material-ui/core/";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";

import { Input } from "@components/input/input";
import { Autocomplete } from "@components/autocomplete/autocomplete";
import { ManagersApi } from "@api/managers/managers.api";
import { StoreModel } from "@models/store.models";

import { validationSchema } from "./validation-schema";

interface Props {
  onHandleSubmit: (value: any) => void;
  initialValuesProps?: StoreModel;
  loading?: boolean;
  textButton: string;
}

export const StoreForm: React.FC<Props> = ({
  onHandleSubmit,
  initialValuesProps = {},
  loading = false,
  textButton = "",
}) => {
  const initialValues = {
    name: initialValuesProps?.name || "",
    mobileNumber: initialValuesProps?.mobileNumber || "",
    regionalManagerId: initialValuesProps?.regionalManager?.id || null,
    districtManagerId: initialValuesProps?.districtManager?.id || null,
    hrManagerId: initialValuesProps?.hrManager?.id || null,
    contactInfo: initialValuesProps?.contactInfo || "",
  };

  const { register, control, handleSubmit, errors } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = handleSubmit(onHandleSubmit);
  return (
    <form onSubmit={onSubmit} className={styles.Form}>
      {loading && (
        <div className="overlay-loader with-opacity">
          <CircularProgress size="6rem" variant="indeterminate" disableShrink />
        </div>
      )}
      <div className={styles.InputGroup}>
        <div className={styles.InputWrap}>
          <Input
            label="Location Name"
            labelRequired
            id="store-name"
            type="text"
            name="name"
            placeholder="Location Name"
            inputRef={register}
            errorMessage={errors?.name?.message}
          />
        </div>
        <div className={styles.InputWrap}>
          <Input
            label="Location Contact Info"
            id="store-contact"
            type="text"
            name="contactInfo"
            placeholder="Location Contact Info"
            inputRef={register}
            errorMessage={errors?.contactInfo?.message}
          />
        </div>
        <div className={styles.InputWrap}>
          <Input
            label="Location Phone"
            id="store-phone"
            type="text"
            name="mobileNumber"
            placeholder="Location Phone"
            inputRef={register}
            errorMessage={errors?.mobileNumber?.message}
          />
        </div>
        <div className={styles.InputWrap}>
          <Controller
            control={control}
            name="districtManagerId"
            render={(props) => (
              <Autocomplete
                fetch={ManagersApi.fetchDistrictManagers}
                onChange={(event: React.ChangeEvent<{}>, value) => {
                  props.onChange(value?.id);
                }}
                inputProps={{
                  label: "District Manager",
                  labelRequired: true,
                  id: "district-manager",
                  placeholder: "District Manager",
                  errorMessage: errors.districtManagerId?.message,
                }}
                defaultValue={
                  initialValuesProps?.districtManager
                    ? {
                        id: initialValuesProps?.districtManager?.id,
                        name: initialValuesProps?.districtManager?.name,
                      }
                    : null
                }
                getOptionSelected={(option, value) =>
                  option.name === value.name
                }
                getOptionLabel={(option) => option.name}
              />
            )}
          />
        </div>
        <div className={styles.InputWrap}>
          <Controller
            control={control}
            name="regionalManagerId"
            render={(props) => (
              <Autocomplete
                fetch={ManagersApi.fetchRegionalManagers}
                onChange={(event: React.ChangeEvent<{}>, value) => {
                  props.onChange(value?.id);
                }}
                inputProps={{
                  label: "Regional Manager",
                  labelRequired: true,
                  id: "regional-manager",
                  placeholder: "Regional Manager",
                  errorMessage: errors.regionalManagerId?.message,
                }}
                defaultValue={
                  initialValuesProps?.regionalManager
                    ? {
                        id: initialValuesProps?.regionalManager?.id,
                        name: initialValuesProps?.regionalManager?.name,
                      }
                    : null
                }
                getOptionSelected={(option, value) =>
                  option.name === value.name
                }
                getOptionLabel={(option) => option.name}
              />
            )}
          />
        </div>
        <div className={styles.InputWrap}>
          <Controller
            control={control}
            name="hrManagerId"
            render={(props) => (
              <Autocomplete
                fetch={ManagersApi.fetchHrManagers}
                onChange={(event: React.ChangeEvent<{}>, value) => {
                  props.onChange(value?.id);
                }}
                inputProps={{
                  label: "HR User",
                  labelRequired: true,
                  id: "hr-manager",
                  placeholder: "HR User",
                  errorMessage: errors.hrManagerId?.message,
                }}
                defaultValue={
                  initialValuesProps?.hrManager
                    ? {
                        id: initialValuesProps?.hrManager?.id,
                        name: initialValuesProps?.hrManager?.name,
                      }
                    : null
                }
                getOptionSelected={(option, value) =>
                  option.name === value.name
                }
                getOptionLabel={(option) => option.name}
              />
            )}
          />
        </div>
      </div>
      <div className={styles.ButtonsWrapper}>
        <Button
          disabled={loading}
          disableElevation
          className="button-primary"
          color="primary"
          variant="contained"
          type="submit"
        >
          {textButton}
        </Button>
      </div>
    </form>
  );
};
