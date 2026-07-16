import { MdSearch } from 'react-icons/md';

/** Search input + slot for extra filter controls (selects, etc.) passed as children. */
export default function SearchBar({ value, onChange, placeholder = 'Search...', children }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
      <div className="relative flex-1">
        <MdSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-brutal pl-10"
        />
      </div>
      {children}
    </div>
  );
}
