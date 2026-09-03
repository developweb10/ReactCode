import { useState, useMemo } from "react";
import styles from "./contact-info.module.scss";
import { EmployeeModel } from "@models/employee.models";

import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  ContactInfoForm,
  contactInfoSchema,
} from "@home/components/forms/employee-forms/subforms/contact-info/contact-info-form";

import { FormFooter } from "../form-footer/form-footer";

interface Props {
  employee: EmployeeModel;
  onSubmit: (formData: any) => void;
}

export const ContactInfoTabForm: React.FC<Props> = ({ employee, onSubmit }) => {
  const [editMode, setEditMode] = useState(false);

  const initialValues = useMemo(
    () => ({
      contactInfo: {
        address1: employee.address1,
        address2: employee.address2 || "",
        city: employee.city || "",
        town: employee.town || "",
        postCode: employee.postCode,
        country: employee.country || "",
        houseNumber: employee.houseNumber || "",
        mobileNumber: employee.mobileNumber || "",
        email: employee.email || "",
        personalEmail: employee.personalEmail,
        otherEmail: employee.otherEmail,
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

    mode: "onChange",
    resolver: yupResolver(
      yup.object({
        contactInfo: contactInfoSchema,
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
      <ContactInfoForm
        setFieldValue={setValue}
        register={register}
        control={control}
        groupName="contactInfo"
        errors={errors.contactInfo || {}}
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
