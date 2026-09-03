import { useState, useMemo } from "react";
import styles from "./job-tab.module.scss";

import { EmployeeModel } from "@models/employee.models";
import { StoreModel } from "@models/store.models";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  JobForm,
  jobInfoSchema,
} from "@home/components/forms/employee-forms/subforms/job-form/job-form";
import {
  LineManagersForm,
  lineManagersInfoSchema,
} from "@home/components/forms/employee-forms/subforms/line-managers/line-managers-form";
import {
  EmploymentContractForm,
  contractInfoSchema,
} from "@home/components/forms/employee-forms/subforms/employment-contract/employment-contract-form";

import { FormFooter } from "../form-footer/form-footer";

interface Props {
  employee: EmployeeModel;
  onSubmit: (formData: any) => void;
}

export const JobTabForm: React.FC<Props> = ({ employee, onSubmit }) => {
  const [selectedLocation, setLocation] = useState(employee?.store || null);
  const [editMode, setEditMode] = useState(false);

  const initialValues = useMemo(
    () => ({
      jobInfo: {
        jobTitle: employee.jobTitle || "",
        jobSpecifications: employee.jobSpecifications || "",
        employmentStatus: employee.employmentStatus || "",
        function: employee.function || "",
        joinDate: employee.joinDate || null,
        leaveDate: employee.leaveDate || null,
        department: employee.department || "",
        storeId: employee.store?.id || "",
      },
      contractInfo: {
        startDate: employee.startDate || null,
        endDate: employee.endDate || null,
        contractDetails: employee.contractDetails || "",
      },
      lineManagersInfo: {
        primaryLineManager: employee.primaryLineManager || null,
        secondaryLineManager: employee.secondaryLineManager || null,
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
        jobInfo: jobInfoSchema,
        contractInfo: contractInfoSchema,
        lineManagersInfo: lineManagersInfoSchema,
      })
    ),
  });

  const handleCancel = () => {
    reset(initialValues);
    setLocation(employee?.store || null);
  };

  const handleLocationChange = (newLocation: StoreModel) => {
    setLocation(newLocation);
  };

  const handleEditModeChange = (newEditmode: boolean) => {
    setEditMode(newEditmode);
  };

  return (
    <form className={styles.Wrap} onSubmit={handleSubmit(onSubmit)}>
      <JobForm
        setFieldValue={setValue}
        register={register}
        control={control}
        groupName="jobInfo"
        errors={errors.jobInfo || {}}
        selectedLocation={selectedLocation}
        withDivider
        onLocationSelect={handleLocationChange}
        clearErrors={clearErrors}
        disabled={!editMode}
      />
      <EmploymentContractForm
        setFieldValue={setValue}
        register={register}
        control={control}
        groupName="contractInfo"
        errors={errors.contractInfo || {}}
        withDivider
        clearErrors={clearErrors}
        disabled={!editMode}
      />
      <LineManagersForm
        setFieldValue={setValue}
        register={register}
        control={control}
        groupName="lineManagersInfo"
        errors={errors.lineManagersInfo || {}}
        withDivider
        selectedLocation={selectedLocation}
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
