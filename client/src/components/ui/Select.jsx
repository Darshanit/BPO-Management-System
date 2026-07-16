import { forwardRef } from 'react';
import { Label } from './Input';

/** Neo-Brutalism select. `options`: [{ value, label }]. Forwards ref for react-hook-form. */
const Select = forwardRef(({ label, error, options = [], placeholder, className = '', id, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <Label htmlFor={id}>{label}</Label>}
      <select ref={ref} id={id} className={`input-brutal ${className}`} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm font-semibold text-brutal-pink">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
