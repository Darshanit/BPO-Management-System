import { forwardRef } from 'react';

export const Label = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="block font-display font-bold text-sm mb-2">
    {children}
  </label>
);

/**
 * Neo-Brutalism text input. Forwards ref so it works directly with
 * react-hook-form's `register('fieldName')`.
 */
const Input = forwardRef(({ label, error, className = '', id, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <Label htmlFor={id}>{label}</Label>}
      <input ref={ref} id={id} className={`input-brutal ${className}`} {...props} />
      {error && <p className="mt-1 text-sm font-semibold text-brutal-pink">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
