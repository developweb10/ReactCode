import styles from "./evaluation-table.module.scss";
import classNames from "classnames";

import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";

import NumberFormat from "react-number-format";
import { useFieldArray, Controller, Control } from "react-hook-form";

import _get from "lodash.get";

import { EvaluationsTableDto } from "@models/cases.models";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableContainer,
  IconButton,
  ButtonBase,
} from "@material-ui/core";

import { TextArea } from "@components/text-area/text-area";
import { Input } from "@components/input/input";

const TableHeader = () => (
  <TableHead className={styles.TableHead}>
    <TableRow>
      <TableCell align="left" className={styles.AreaCell}>
        Improvement Area
      </TableCell>
      <TableCell align="center" className={styles.MinMaxCell}>
        Min
      </TableCell>
      <TableCell align="center" className={styles.MinMaxCell}>
        Max
      </TableCell>
      <TableCell align="center" className={styles.RatingCell}>
        Overall
      </TableCell>
      <TableCell align="left" className={styles.CommentCell}>
        Comment
      </TableCell>
      <TableCell align="center" className={styles.DeleteCell}></TableCell>
    </TableRow>
  </TableHead>
);

interface Props {
  control: Control;
  register: any;
  errors: any;
  trigger: any;
  editMode: boolean;
}

export const EvaluationTable: React.FC<Props> = ({
  control,
  register,
  errors,
  trigger,
  editMode,
}) => {
  const { fields, append, remove } = useFieldArray<EvaluationsTableDto>({
    control,
    name: "specificDetails.evaluations",
  });

  return (
    <div className={styles.Wrapper}>
      <div className={styles.Header}>
        <Typography className={styles.HeadingText}>Evaluation</Typography>
      </div>
      <div className={styles.Body}>
        <TableContainer>
          <Table className={styles.Table}>
            <TableHeader />
            <TableBody>
              {fields.map((field, index) => {
                return (
                  <TableRow key={field.id} className={styles.TableBodyRow}>
                    <TableCell align="left" className={styles.AreaCell}>
                      {!editMode ? (
                        <Typography>{field.improvementArea}</Typography>
                      ) : (
                        <Input
                          name={`specificDetails.evaluations.${index}.improvementArea`}
                          inputRef={register()}
                          inputClassname={classNames(styles.TextField, {
                            [styles.FieldError]: _get(
                              errors,
                              `specificDetails.evaluations.${index}.improvementArea.message`,
                              false
                            ),
                          })}
                          defaultValue={field.improvementArea}
                          placeholder="Add Improvement Area"
                        />
                      )}
                    </TableCell>
                    <TableCell align="center" className={styles.MinMaxCell}>
                      {!editMode ? (
                        <Typography>{field.min}</Typography>
                      ) : (
                        <Controller
                          control={control}
                          name={`specificDetails.evaluations.${index}.min`}
                          defaultValue={field.min}
                          render={(props) => (
                            <NumberFormat
                              decimalScale={0}
                              placeholder="Min"
                              value={props.value}
                              inputClassname={classNames(styles.TextField, {
                                [styles.FieldError]: _get(
                                  errors,
                                  `specificDetails.evaluations.${index}.min.message`,
                                  false
                                ),
                              })}
                              customInput={Input}
                              type="text"
                              isNumericString
                              allowNegative={false}
                              onValueChange={({ floatValue }) => {
                                props.onChange(floatValue);
                              }}
                            />
                          )}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center" className={styles.MinMaxCell}>
                      {!editMode ? (
                        <Typography>{field.max}</Typography>
                      ) : (
                        <Controller
                          control={control}
                          name={`specificDetails.evaluations.${index}.max`}
                          defaultValue={field.max}
                          render={(props) => (
                            <NumberFormat
                              placeholder="Max"
                              decimalScale={0}
                              value={props.value}
                              inputClassname={classNames(styles.TextField, {
                                [styles.FieldError]: _get(
                                  errors,
                                  `specificDetails.evaluations.${index}.max.message`,
                                  false
                                ),
                              })}
                              customInput={Input}
                              type="text"
                              isNumericString
                              allowNegative={false}
                              onValueChange={({ floatValue }) => {
                                props.onChange(floatValue);
                              }}
                            />
                          )}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center" className={styles.RatingCell}>
                      {!editMode ? (
                        <Typography>{field.rating}</Typography>
                      ) : (
                        <Controller
                          control={control}
                          name={`specificDetails.evaluations.${index}.rating`}
                          defaultValue={field.rating}
                          render={(props) => (
                            <NumberFormat
                              placeholder="Add Rating"
                              decimalScale={0}
                              inputClassname={styles.TextField}
                              value={props.value}
                              customInput={Input}
                              defaultValue={field.rating}
                              type="text"
                              errorMessage={_get(
                                errors,
                                `specificDetails.evaluations.${index}.rating.message`,
                                null
                              )}
                              isNumericString
                              allowNegative={false}
                              onValueChange={({ floatValue }) => {
                                props.onChange(floatValue);
                              }}
                            />
                          )}
                        />
                      )}
                    </TableCell>
                    <TableCell align="left" className={styles.CommentCell}>
                      {!editMode ? (
                        <Typography>{field.comment}</Typography>
                      ) : (
                        <Input
                          inputClassname={styles.TextField}
                          name={`specificDetails.evaluations.${index}.comment`}
                          inputRef={register()}
                          placeholder="Add Comment"
                          defaultValue={field.comment}
                          errorMessage={_get(
                            errors,
                            `specificDetails.evaluations.${index}.comment.message`,
                            null
                          )}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center" className={styles.DeleteCell}>
                      {!!editMode && (
                        <IconButton
                          className={styles.DeleteBtn}
                          onClick={() => {
                            remove(index);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <div className={styles.Footer}>
        {editMode && (
          <div className={styles.BtnWrapper}>
            <ButtonBase
              disableRipple
              disableTouchRipple
              onClick={() => {
                append(
                  {
                    improvementArea: "",
                    min: "",
                    max: "",
                    rating: "",
                    comment: "",
                  },
                  false
                );
              }}
              className={styles.AddBtn}
            >
              <Typography className={styles.AddText}>
                + Add Evaluation
              </Typography>
            </ButtonBase>
            <Typography className={styles.TableError}>
              {_get(errors, `specificDetails.evaluations.message`, null)}
            </Typography>
          </div>
        )}
        <TextArea
          className={styles.TextArea}
          rows={8}
          placeholder="Add Comment"
          label="Performance Improvement Overview"
          labelRequired
          name="specificDetails.improvementOverview"
          errorMessage={errors.specificDetails?.improvementOverview?.message}
          inputRef={register()}
          disabled={!editMode}
        />
      </div>
    </div>
  );
};
