import { useState, useMemo } from "react";
import styles from "./emergency-contacts.module.scss";
import { EmployeeModel } from "@models/employee.models";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  EmergencyContactsForm,
  emergencyInfoSchema,
} from "@home/components/forms/employee-forms/subforms/emergency-contacts/emergency-contacts-form";
import { FormFooter } from "../form-footer/form-footer";

interface Props {
  employee: EmployeeModel;
  onSubmit: (formData: any) => void;
}

export const EmergencyContactsTabForm: React.FC<Props> = ({
  employee,
  onSubmit,
}) => {
  const [editMode, setEditMode] = useState(false);

  const initialValues = useMemo(
    () => ({
      emergencyInfo: {
        ecFirstName: employee.ecFirstName || "",
        ecLastName: employee.ecLastName || "",
        ecMobile: employee.ecMobile || "",
        ecHomeTelephone: employee.ecHomeTelephone || "",
        ecWorkTelephone: employee.ecWorkTelephone || "",
        ecRelationship: employee.ecRelationship || "",
      },
    }),
    [employee]
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    errors,
    clearErrors,
    reset,
  } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(
      yup.object({
        emergencyInfo: emergencyInfoSchema,
      })
    ),
  });

  const handleEditModeChange = (newEditmode: boolean) => {
    setEditMode(newEditmode);
  };

  const handleCancel = () => {
    reset(initialValues);
  };

  return (
    <form className={styles.Wrap} onSubmit={handleSubmit(onSubmit)}>
      <EmergencyContactsForm
        setFieldValue={setValue}
        register={register}
        control={control}
        groupName="emergencyInfo"
        errors={errors.emergencyInfo || {}}
        initialValues={initialValues}
        clearErrors={clearErrors}
        withDivider
        disabled={!editMode}
      />
      {employee.isEditable && (
        <FormFooter
          editMode={editMode}
          onEditModeChange={handleEditModeChange}
          onCancel={handleCancel}
        />
      )}
    </form>
  );
};
