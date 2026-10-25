const RequestError = ({
  message,
  onRetry,
  className = "",
}) => (
  <div className={`request-error ${className}`.trim()} role="alert">
    <p>{message}</p>
    {onRetry && (
      <button type="button" onClick={onRetry}>
        Try Again
      </button>
    )}
  </div>
);

export default RequestError;
