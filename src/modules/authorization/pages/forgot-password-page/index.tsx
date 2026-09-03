import React, { useState } from "react";
import classNames from "classnames";
import styles from "./forgot-password-page.module.scss";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { AuthInput } from "@components/auth-input/auth-input";
import { Link } from "react-router-dom";
import { AuthRouterNames } from "../../config/auth-router.names";
import { Button } from "@material-ui/core";
import { authorizationService } from "@store/authorization/authorization.service";
import { ReactComponent as ForgotPasswordImage } from "@assets/images/forgot-password-image.svg";
import { RequestError } from "@api/api-service";
import Typography from "@material-ui/core/Typography";
import * as yup from "yup";

const ForgotPasswordSuccess = () => {
  return (
    <div className={classNames("wrapper", styles.ForgotSuccessWrap)}>
      <Typography variant="h4" className="form-title">
        Link has been sent
      </Typography>
      <div className={styles.ForgotSuccessImgWrap}>
        <ForgotPasswordImage className={styles.ForgotImg} />
      </div>

      <span className={styles.ForgotSuccessText}>
        <span>A link to reset</span>
        <span>
          password <span className="bold-text">has been sent</span>
        </span>
        <span className="bold-text">to your email</span>
      </span>
    </div>
  );
};

type FormValues = {
  email: string;
};

const validationSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
});

const ForgotPassword = () => {
  const [showSuccess, setShow] = useState(false);
  const [apiErrors, setApiErrors] =
    useState<{ message: string }[] | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    errors,
    formState: { touched, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      email: "",
    },
    mode: "all",
    resolver: yupResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (formValues) => {
    setApiErrors(null);
    try {
      await await authorizationService.forgotPassword(formValues);
      setShow(true);
    } catch (error) {
      if (error instanceof RequestError) {
        const apiErrors = error.setFormErrors(setError);
        if (apiErrors.length) {
          setApiErrors((state) => [...(state || []), ...apiErrors]);
        }
      }
    }
  };

  if (showSuccess) {
    return <ForgotPasswordSuccess />;
  }

  return (
    <div className="wrapper">
      <Typography variant="h4" className="form-title">
        Forgot <span className="white-text">Password?</span>
      </Typography>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="form-wrapper forgot-form"
      >
        <div className={styles.ForgotImgWrap}>
          <ForgotPasswordImage className={styles.ForgotImg} />
        </div>

        <div className="input-wrapper">
          <AuthInput
            ref={register}
            label="Email"
            id="login-email"
            type="email"
            name="email"
            errorMessage={errors.email?.message}
            valid={!errors.email}
            touched={touched.email}
          />
          <div className="form-link-wrapper">
            <Link className="form-link" to={`/${AuthRouterNames.LOGIN}`}>
              Back to Sign in
            </Link>
          </div>
        </div>
        {apiErrors && (
          <div className="form-general-errors">
            {apiErrors.map((error) => (
              <span key={error.message} className="form-general-error">
                {error.message}
              </span>
            ))}
          </div>
        )}
        <Button
          className="button-primary form-submit-btn"
          type="submit"
          variant="contained"
          color="primary"
          disableElevation
          disabled={isSubmitting}
        >
          Submit
        </Button>
      </form>
    </div>
  );
};

export default ForgotPassword;
