import "../styles/formField.css";

const FormField = ({ id, label, error, ...inputProps }) => (
  <>
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      {...inputProps}
    />
    {error && (
      <span id={`${id}-error`} className="form-field-error" role="alert">
        {error}
      </span>
    )}
  </>
);

export default FormField;
