import { useLocation, useHistory } from "react-router-dom";

import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { AuthInput } from "@components/auth-input/auth-input";
import { Link } from "react-router-dom";
import { AuthRouterNames } from "../../config/auth-router.names";
import { Button } from "@material-ui/core";
import { authorizationService } from "@store/authorization/authorization.service";
import Typography from "@material-ui/core/Typography";
import * as yup from "yup";
import queryParams from "query-string";

const validationSchema = yup.object({
  password: yup
    .string()
    .min(6, "Min 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

type FormValues = {
  password: string;
  confirmPassword: string;
};

const ResetPassword = () => {
  const location = useLocation();
  const history = useHistory();

  const {
    register,
    handleSubmit,
    errors,
    formState: { touched, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "all",
    resolver: yupResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (formValues) => {
    const query = queryParams.parse(location.search);
    if (query.reset_token && typeof query.reset_token === "string") {
      try {
        await authorizationService.resetPassword({
          newPassword: formValues.password,
          token: query.reset_token,
        });
        history.replace(`/${AuthRouterNames.LOGIN}`);
      } catch (error) {}
    }
  };

  return (
    <div className="wrapper">
      <Typography variant="h4" className="form-title">
        Reset <span className="white-text">your Password</span>
      </Typography>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="form-wrapper reset-form"
      >
        <div className="input-wrapper">
          <AuthInput
            ref={register}
            label="New Password"
            id="reset-password"
            type="password"
            name="password"
            errorMessage={errors.password?.message}
            valid={!errors.password}
            touched={touched.password}
          />
        </div>
        <div className="input-wrapper">
          <AuthInput
            ref={register}
            label="Confirm Password"
            id="confirm-password"
            type="password"
            name="confirmPassword"
            errorMessage={errors.confirmPassword?.message}
            valid={!errors.confirmPassword}
            touched={touched.confirmPassword}
          />
          <div className="form-link-wrapper">
            <Link className="form-link" to={`/${AuthRouterNames.LOGIN}`}>
              Return To Sign In
            </Link>
          </div>
        </div>

        <Button
          className="button-primary form-submit-btn"
          type="submit"
          variant="contained"
          color="primary"
          disableElevation
          disabled={isSubmitting}
        >
          Set Password
        </Button>
      </form>
    </div>
  );
};
export default ResetPassword;
