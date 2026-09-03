import React, { useState, useRef } from "react";
import classNames from "classnames";
import Typography from "@material-ui/core/Typography";
import styles from "./upload-employees.module.scss";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import { employeesService } from "@store/employees/employees.service";
import { isOfType } from "@utils/typeUtils";
import CircularProgress from "@material-ui/core/CircularProgress";

const allowedTypes = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/vnd.ms-excel",
];

interface UploadEmployeeProps {
  onUpload: () => void;
}

export const UploadEmployee: React.FC<UploadEmployeeProps> = ({ onUpload }) => {
  const [loading, setLoading] = useState(false);
  const [dropHover, setDropHover] = useState(false);
  const inputEl = useRef<HTMLInputElement>(null);

  const dragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const dragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropHover(true);
  };

  const dragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropHover(false);
  };

  const onFileUpload = async (
    event: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>
  ) => {
    if (loading) return;
    let file: File | null = null;
    if (isOfType<React.DragEvent<HTMLDivElement>>(event, "dataTransfer")) {
      event.preventDefault();
      file = event.dataTransfer.files[0];
    } else {
      file = event.target.files && event.target.files[0];
    }

    if (file) {
      if (file && allowedTypes.indexOf(file.type) !== -1) {
        setLoading(true);
        setDropHover(false);
        const formData = new FormData();
        formData.append("file", file);
        await employeesService.uploadEmployees(formData);
        if (inputEl.current) {
          inputEl.current.value = "";
        }
        setLoading(false);
        if (onUpload) {
          onUpload();
        }
      }
    }
  };

  return (
    <div className={styles.Wrapper}>
      <div
        className={classNames(styles.dropContainer, {
          [styles.dropBorder]: dropHover,
        })}
        onDragOver={dragOver}
        onDragEnter={dragEnter}
        onDragLeave={dragLeave}
        onDrop={onFileUpload}
      >
        {loading ? (
          <CircularProgress />
        ) : (
          <React.Fragment>
            <Typography className={styles.dropText}>
              Drag and Drop CSV file here
            </Typography>
            <Typography className={styles.dropText}>or</Typography>
            <Typography className={styles.dropText}>
              click button to upload
            </Typography>
          </React.Fragment>
        )}
      </div>
      <input
        accept="text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className={styles.file_input}
        type="file"
        ref={inputEl}
        onChange={onFileUpload}
      />
      <label htmlFor="outlined-button-file" className={styles.uploadButton}>
        <Button
          disabled={loading}
          disableElevation
          className="button-primary"
          color="primary"
          variant="contained"
          onClick={() => {
            inputEl.current?.click();
          }}
          startIcon={<AddIcon fontSize="small" />}
        >
          <Typography variant="button">Upload CSV file</Typography>
        </Button>
      </label>
    </div>
  );
};
