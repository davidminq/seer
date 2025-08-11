import * as React from "react"

interface SelectContextValue {
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

const Select = React.forwardRef<
  HTMLDivElement,
  {
    value?: string
    onValueChange?: (value: string) => void
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(({ value, onValueChange, children, open: controlledOpen, onOpenChange: controlledOnOpenChange }, ref) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const onOpenChange = controlledOnOpenChange || setInternalOpen

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, onOpenChange }}>
      <div ref={ref} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
})
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode
  }
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectTrigger must be used within a Select")

  return (
    <button
      ref={ref}
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-600 bg-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${className || ''}`}
      data-select-trigger
      onClick={() => context.onOpenChange(!context.open)}
      {...props}
    >
      {children}
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`h-4 w-4 text-gray-400 transition-transform ${context.open ? 'rotate-180' : ''}`}
      >
        <path
          d="M4.93179 5.43179L7.5 8L10.0682 5.43179C10.4587 5.04126 11.0919 5.04126 11.4824 5.43179C11.8729 5.82232 11.8729 6.45548 11.4824 6.84601L8.20711 10.1213C7.81658 10.5118 7.18342 10.5118 6.79289 10.1213L3.51761 6.84601C3.12708 6.45548 3.12708 5.82232 3.51761 5.43179C3.90813 5.04126 4.54129 5.04126 4.93179 5.43179Z"
          fill="currentColor"
        />
      </svg>
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    placeholder?: string
  }
>(({ className, placeholder, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectValue must be used within a Select")

  return (
    <span ref={ref} className={className} {...props}>
      {context.value || placeholder}
    </span>
  )
})
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode
  }
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectContent must be used within a Select")

  if (!context.open) return null

  return (
    <div
      ref={ref}
      className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-600 bg-gray-800 text-white p-1 shadow-md animate-in fade-in-0 zoom-in-95 top-full mt-1 max-h-60 overflow-y-auto ${className || ''}`}
      data-select-content
      {...props}
    >
      {children}
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
    children: React.ReactNode
  }
>(({ className, children, value, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectItem must be used within a Select")

  return (
    <div
      ref={ref}
      className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm normal-case outline-none hover:bg-gray-700 focus:bg-gray-700 ${className || ''}`}
      onClick={() => {
        context.onValueChange?.(value)
        context.onOpenChange(false)
      }}
      {...props}
    >
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
}