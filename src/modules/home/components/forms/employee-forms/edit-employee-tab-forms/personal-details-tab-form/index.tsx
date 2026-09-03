import { useState, useMemo } from "react";
import styles from "./personal-details.module.scss";
import { EmployeeModel } from "@models/employee.models";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  PersonalInfoForm,
  personalInfoSchema,
} from "@home/components/forms/employee-forms/subforms/personal-info/personal-info-form";

import { FormFooter } from "../form-footer/form-footer";

interface Props {
  employee: EmployeeModel;
  onSubmit: (formData: any) => void;
}

export const PersonalDetailsTabForm: React.FC<Props> = ({
  employee,
  onSubmit,
}) => {
  const [editMode, setEditMode] = useState(false);

  const defaultGender = useMemo(() => {
    if (!employee.gender) return "";
    if (!["Male", "Female"].includes(employee.gender)) {
      return "Other";
    } else {
      return employee.gender;
    }
  }, [employee]);

  const initialValues = useMemo(
    () => ({
      personalInfo: {
        firstname: employee.firstname,
        middleName: employee.middleName || "",
        surname: employee.surname,
        otherId: employee.otherId || "",
        gender: defaultGender,
        genderName: employee.gender
          ? !["Male", "Female"].includes(employee.gender)
            ? employee.gender
            : ""
          : "",
        ethnicity: employee.ethnicity || "",
        nationality: employee.nationality,
        dateOfBirth: employee.dateOfBirth,
        knowAs: employee.knowAs || "",
        smoker: employee.smoker || "",
      },
    }),
    [employee, defaultGender]
  );

  const {
    register,
    trigger,
    control,
    handleSubmit,
    setValue,
    errors,
    clearErrors,
    reset,
  } = useForm({
    defaultValues: initialValues,
    mode: "onChange",
    resolver: yupResolver(
      yup.object({
        personalInfo: personalInfoSchema,
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
      <PersonalInfoForm
        trigger={trigger}
        setFieldValue={setValue}
        register={register}
        control={control}
        groupName="personalInfo"
        errors={errors.personalInfo || {}}
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
