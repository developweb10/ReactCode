import styles from "./salary-details.module.scss";
import { useState, useMemo } from "react";
import { EmployeeModel } from "@models/employee.models";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  SalaryDetailsForm,
  salaryInfoSchema,
} from "@home/components/forms/employee-forms/subforms/salary-details/salary-details-form";
import { FormFooter } from "../form-footer/form-footer";

interface Props {
  employee: EmployeeModel;
  onSubmit: (formData: any) => void;
}

export const SalaryDetailsTabForm: React.FC<Props> = ({
  employee,
  onSubmit,
}) => {
  const [editMode, setEditMode] = useState(false);

  const initialValues = useMemo(
    () => ({
      salaryInfo: {
        hoursPerWeek: employee.hoursPerWeek || "",
        hourlyRate: employee.hourlyRate || "",
        salary: employee.salary || "",
      },
    }),
    [employee]
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    errors,
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: initialValues,
    resolver: yupResolver(
      yup.object({
        salaryInfo: salaryInfoSchema,
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
      <SalaryDetailsForm
        setFieldValue={setValue}
        register={register}
        control={control}
        groupName="salaryInfo"
        getValues={getValues}
        errors={errors.salaryInfo || {}}
        initialValues={initialValues}
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
