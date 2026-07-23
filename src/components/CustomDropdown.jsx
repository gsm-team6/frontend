import React, { useEffect, useRef, useState } from 'react';

const CustomDropdown = ({
  value,
  options,
  onChange,
  buttonStyle,
  wrapperStyle,
  buttonClassName,
  menuClassName,
  itemClassName,
  disabled,
  renderLabel,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const selectedOption = options.find((option) => {
    if (typeof option === 'string') return option === value;
    return option.value === value;
  });

  const label = selectedOption
    ? typeof selectedOption === 'string'
      ? selectedOption
      : selectedOption.label
    : String(value || '');

  return (
    <div
      ref={wrapperRef}
      className={`custom-dropdown-wrapper ${open ? 'custom-dropdown-open' : ''} ${buttonClassName || ''}`}
      style={{ position: 'relative', ...wrapperStyle }}
    >
      <button
        type="button"
        className="custom-dropdown-button"
        style={buttonStyle}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
      >
        {renderLabel ? renderLabel(value, label) : label}
      </button>

      {open && (
        <div className={`custom-dropdown-menu ${menuClassName || ''}`}>
          {options.map((option) => {
            const optionValue = typeof option === 'string' ? option : option.value;
            const optionLabel = typeof option === 'string' ? option : option.label;

            return (
              <button
                key={optionValue}
                type="button"
                className={`custom-dropdown-item ${itemClassName || ''}`}
                onClick={() => {
                  setOpen(false);
                  if (onChange) onChange(optionValue);
                }}
              >
                {optionLabel}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
