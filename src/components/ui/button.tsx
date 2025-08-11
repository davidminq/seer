import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ring-offset-gray-900 disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "bg-gray-700 text-white hover:bg-gray-600",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-gray-600 bg-transparent text-white hover:bg-gray-800",
      secondary: "bg-gray-600 text-white hover:bg-gray-500",
      ghost: "text-white hover:bg-gray-800",
      link: "text-blue-500 underline-offset-4 hover:underline",
    } as const

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    }

    return (
      <button
        className={`${baseClasses} ${(variants as any)[variant] || ''} ${sizes[size] || sizes.default} ${className || ''}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }