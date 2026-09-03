import { CircularProgress } from "@material-ui/core";

export const Loader = () => {
  return (
    <div className="overlay-loader with-opacity">
      <CircularProgress size="6rem" variant="indeterminate" disableShrink />
    </div>
  );
};
