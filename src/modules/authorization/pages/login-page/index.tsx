import { Button } from "@material-ui/core";
import { useState } from "react";

import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link } from "react-router-dom";
import { AuthRouterNames } from "../../config/auth-router.names";
import { AuthInput } from "@components/auth-input/auth-input";
import { authorizationService } from "@store/authorization/authorization.service";
import { RequestError } from "@api/api-service";
import * as yup from "yup";

type FormValues = {
  email: string;
  password: string;
};

const validationSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Min 6 characters")
    .max(60, "Max 60 characters")
    .required("Password is required"),
});

const LoginPage = () => {
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
      password: "",
    },
    mode: "all",
    resolver: yupResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (formValues) => {
    setApiErrors(null);

    try {
      await authorizationService.signIn(formValues);
    } catch (error) {
      if (error instanceof RequestError) {
        const apiErrors = error.setFormErrors(setError);
        if (apiErrors.length) {
          setApiErrors((state) => [...(state || []), ...apiErrors]);
        }
      }
    }
  };

  return (
    <div className="wrapper">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="form-wrapper login-form"
      >
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
        </div>
        <div className="input-wrapper">
          <AuthInput
            ref={register}
            label="Password"
            id="login-password"
            type="password"
            name="password"
            errorMessage={errors.password?.message}
            valid={!errors.password}
            touched={touched.password}
          />
          <div className="form-link-wrapper">
            <Link
              className="form-link"
              to={`/${AuthRouterNames.FORGOT_PASSWORD}`}
            >
              Forgot password?
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
          Log in now
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
