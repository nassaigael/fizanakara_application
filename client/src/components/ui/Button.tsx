import React, { memo } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "warning";
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const base =
    "px-6 py-4 rounded-2xl font-black uppercase tracking-wide text-sm " +
    "border-2 border-b-4 transition active:translate-y-[1px] flex items-center justify-center " +
    "disabled:opacity-50 disabled:cursor-not-allowed outline-none focus-visible:ring-2 ring-offset-2 ring-brand-primary";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "bg-brand-primary text-white border-brand-primary hover:opacity-90",
    secondary: "bg-white dark:bg-brand-border-dark text-brand-text border-brand-border hover:bg-brand-primary/10",
    danger: "bg-red-500 text-white border-red-600 hover:bg-red-400",
    warning: "bg-orange-500 text-white border-orange-600 hover:bg-orange-400",
  };

  return (
    <button 
      {...props} 
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Chargement...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default memo(Button);