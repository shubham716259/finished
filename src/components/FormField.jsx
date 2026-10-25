import { useId } from "react";
import "../styles/formField.css";

const FormField = ({
  id,
  label,
  error,
  inputWrapperClassName,
  inputPrefix,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...inputProps
}) => {
  const generatedId = useId();
  const inputId = id || `form-field-${generatedId}`;
  const errorId = `${inputId}-error`;
  const describedBy = [ariaDescribedBy, error ? errorId : null]
    .filter(Boolean)
    .join(" ") || undefined;

  const input = (
    <>
      {inputPrefix}
      <input
        {...inputProps}
        id={inputId}
        aria-invalid={error ? true : ariaInvalid}
        aria-describedby={describedBy}
      />
    </>
  );

  return (
    <>
      {label && <label htmlFor={inputId}>{label}</label>}
      {inputWrapperClassName ? (
        <div className={inputWrapperClassName}>{input}</div>
      ) : (
        input
      )}
      {error && (
        <span id={errorId} className="form-field-error" role="alert">
          {error}
        </span>
      )}
    </>
  );
};

export default FormField;
