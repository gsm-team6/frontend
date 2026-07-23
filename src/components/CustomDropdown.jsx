import React, { useCallback, useEffect, useRef, useState } from 'react';

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
  onOpenChange,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const setDropdownOpen = useCallback((nextOpen) => {
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, setDropdownOpen]);

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
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="custom-dropdown-button"
        style={buttonStyle}
        onClick={() => {
          if (!disabled) setDropdownOpen(!open);
        }}
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
                  setDropdownOpen(false);
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
