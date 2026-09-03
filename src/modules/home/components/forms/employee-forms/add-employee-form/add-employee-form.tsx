import { useState } from "react";
import styles from "./add-employee-form.module.scss";
import { Button, CircularProgress } from "@material-ui/core/";
import * as yup from "yup";
import { removeEmptyStringNullValues } from "@utils/object-clear";
import { EmployeeCreateDto } from "@models/employee.models";
import { StoreModel } from "@models/store.models";
import { employeesService } from "@store/employees/employees.service";
import { useForm } from "react-hook-form";
import {
  PersonalInfoForm,
  personalInfoSchema,
} from "../subforms/personal-info/personal-info-form";
import {
  ContactInfoForm,
  contactInfoSchema,
} from "../subforms/contact-info/contact-info-form";
import {
  EmergencyContactsForm,
  emergencyInfoSchema,
} from "../subforms/emergency-contacts/emergency-contacts-form";
import { JobForm, jobInfoSchema } from "../subforms/job-form/job-form";
import {
  EmploymentContractForm,
  contractInfoSchema,
} from "../subforms/employment-contract/employment-contract-form";
import {
  SalaryDetailsForm,
  salaryInfoSchema,
} from "../subforms/salary-details/salary-details-form";
import {
  LineManagersForm,
  lineManagersInfoSchema,
} from "../subforms/line-managers/line-managers-form";

import { AvatarUpload } from "../avatar-upload/avatar-upload";
import { yupResolver } from "@hookform/resolvers/yup";

const validationSchema = yup.object({
  personalInfo: personalInfoSchema,
  contactInfo: contactInfoSchema,
  emergencyInfo: emergencyInfoSchema,
  jobInfo: jobInfoSchema,
  contractInfo: contractInfoSchema,
  salaryInfo: salaryInfoSchema,
  lineManagersInfo: lineManagersInfoSchema,
});

interface Props {
  handleSuccessSubmit: () => void;
}
export const AddEmployeeForm: React.FC<Props> = ({ handleSuccessSubmit }) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setLocation] = useState<StoreModel | null>(null);
  const handleLocationChange = (newLocation: StoreModel) => {
    setLocation(newLocation);
  };

  const {
    register,
    trigger,
    control,
    handleSubmit,
    setValue,
    getValues,
    clearErrors,
    errors,
  } = useForm({
    defaultValues: {
      personalInfo: {
        firstname: "",
        middlename: "",
        surname: "",
        otherId: "",
        gender: "",
        genderName: "",
        ethnicity: "",
        nationality: "",
        dateOfBirth: null,
        knowAs: "",
        smoker: "",
      },
      contactInfo: {
        address1: "",
        address2: "",
        city: "",
        town: "",
        postCode: "",
        country: "",
        houseNumber: "",
        mobileNumber: "",
        email: "",
        personalEmail: "",
        otherEmail: "",
      },
      emergencyInfo: {
        ecFirstName: "",
        ecLastName: "",
        ecMobile: "",
        ecHomeTelephone: "",
        ecWorkTelephone: "",
        ecRelationship: "",
      },
      jobInfo: {
        jobTitle: "",
        jobSpecifications: "",
        employmentStatus: "",
        function: "",
        joinDate: null,
        leaveDate: null,
        department: "",
        storeId: "",
      },
      contractInfo: {
        startDate: null,
        endDate: null,
        contractDetails: "",
      },
      salaryInfo: {
        hoursPerWeek: "",
        hourlyRate: "",
        salary: "",
      },
      lineManagersInfo: {
        primaryLineManager: null,
        secondaryLineManager: null,
      },
    },
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (formData: any) => {
    setLoading(true);

    let employeeDto: EmployeeCreateDto & { genderName?: string } = {
      firstname: formData.firstname,
      surname: formData.surname,
      email: formData.email,
    };

    for (const key in formData) {
      employeeDto = { ...employeeDto, ...formData[key] };
    }

    // Custom gender name
    if (employeeDto.genderName) {
      employeeDto.gender = employeeDto.genderName;
      delete employeeDto.genderName;
    }

    // LineManagers Value to Id

    if (employeeDto.primaryLineManager) {
      employeeDto.primaryLineManagerId = employeeDto.primaryLineManager.id;
      delete employeeDto.primaryLineManager;
    }

    if (employeeDto.secondaryLineManager) {
      employeeDto.secondaryLineManagerId = employeeDto.secondaryLineManager.id;
      delete employeeDto.secondaryLineManager;
    }

    const employeeDtoWoEmptyStrings: EmployeeCreateDto = removeEmptyStringNullValues(
      employeeDto
    );

    try {
      let avatarData;

      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        avatarData = formData;
      }
      await employeesService.createEmployee(
        employeeDtoWoEmptyStrings,
        avatarData
      );
      setLoading(false);
      handleSuccessSubmit();
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={styles.Form}
      id="add-employee-form"
    >
      <h5>Personal Info</h5>
      <AvatarUpload setAvatarFile={setAvatarFile} />
      <PersonalInfoForm
        trigger={trigger}
        setFieldValue={setValue}
        register={register}
        control={control}
        groupName="personalInfo"
        errors={errors.personalInfo || {}}
        clearErrors={clearErrors}
      />
      <h5>Contact Info</h5>
      <ContactInfoForm
        setFieldValue={setValue}
        register={register}
        control={control}
        groupName="contactInfo"
        errors={errors.contactInfo || {}}
        clearErrors={clearErrors}
      />
      <h5>Emergency Contacts</h5>
      <EmergencyContactsForm
        setFieldValue={setValue}
        register={register}
        control={control}
        groupName="emergencyInfo"
        errors={errors.emergencyInfo || {}}
        clearErrors={clearErrors}
      />
      <h5>Job</h5>
      <JobForm
        setFieldValue={setValue}
        register={register}
        control={control}
        groupName="jobInfo"
        errors={errors.jobInfo || {}}
        onLocationSelect={handleLocationChange}
        selectedLocation={selectedLocation}
        clearErrors={clearErrors}
      />
      <h5>Employment Contract</h5>
      <EmploymentContractForm
        setFieldValue={setValue}
        register={register}
        groupName="contractInfo"
        control={control}
        errors={errors.contractInfo || {}}
      />
      <h5>Salary Details</h5>
      <SalaryDetailsForm
        setFieldValue={setValue}
        groupName="salaryInfo"
        register={register}
        control={control}
        getValues={getValues}
        errors={errors.salaryInfo || {}}
      />
      <h5>Managers</h5>
      <LineManagersForm
        setFieldValue={setValue}
        groupName="lineManagersInfo"
        register={register}
        control={control}
        errors={errors.lineManagersInfo || {}}
        selectedLocation={selectedLocation}
      />
      <div className={styles.ButtonsWrapper}>
        <Button
          disabled={loading}
          disableElevation
          className="button-primary"
          color="primary"
          variant="contained"
          type="submit"
        >
          {loading ? <CircularProgress size={20} /> : "+ Add Employee"}
        </Button>
      </div>
    </form>
  );
};
