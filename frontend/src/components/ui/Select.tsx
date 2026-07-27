import * as React from "react"
import { cn } from "../../utils/cn"

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string | boolean;
  label?: string;
  options?: SelectOption[];
  leftIcon?: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, options, leftIcon, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center justify-center text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <select
            className={cn(
              "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm appearance-none",
              leftIcon && "pl-10",
              error && "border-danger-500 focus-visible:ring-danger-500",
              className
            )}
            ref={ref}
            {...props}
          >
            {options ? (
              options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            ) : (
              children
            )}
          </select>
          {/* Custom chevron for select */}
          <div className="absolute right-3 flex items-center justify-center text-slate-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
        {error && typeof error === 'string' && (
          <p className="mt-1.5 text-xs text-danger-500 font-medium">{error}</p>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
