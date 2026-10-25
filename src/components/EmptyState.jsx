const EmptyState = ({
  className = "",
  icon,
  iconClassName = "empty-state-icon",
  title,
  titleAs: Title = "h2",
  description,
  children,
}) => (
  <div className={className}>
    {icon && (
      <div className={iconClassName} aria-hidden="true">
        {icon}
      </div>
    )}
    {title && <Title>{title}</Title>}
    {description && <p>{description}</p>}
    {children}
  </div>
);

export default EmptyState;
