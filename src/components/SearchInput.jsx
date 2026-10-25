import { FaSearch } from "react-icons/fa";

const SearchInput = ({
  value,
  onChange,
  onClear,
  placeholder,
  wrapperClassName,
  iconClassName,
  ariaLabel,
}) => (
  <div className={wrapperClassName}>
    <FaSearch className={iconClassName} aria-hidden="true" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
    />
    {value && (
      <button
        type="button"
        className="clear-search-btn"
        aria-label="Clear search"
        onClick={onClear}
      >
        ×
      </button>
    )}
  </div>
);

export default SearchInput;
