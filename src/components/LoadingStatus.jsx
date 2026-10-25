const LoadingStatus = ({
  className,
  spinnerClassName,
  ariaLabel,
  children,
}) => (
  <div
    className={className}
    role="status"
    aria-live="polite"
    aria-busy="true"
    aria-label={ariaLabel}
  >
    {spinnerClassName && <div className={spinnerClassName} aria-hidden="true" />}
    {children}
  </div>
);

export default LoadingStatus;
