import React, { memo } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "warning";
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const base =
    "px-6 py-4 rounded-2xl font-black uppercase tracking-wide text-sm " +
    "border-2 border-b-4 transition active:translate-y-[1px] " +
    "disabled:opacity-50 disabled:cursor-not-allowed outline-none focus-visible:ring-2 ring-offset-2 ring-brand-primary";

  // Typage strict basé sur les clés de ButtonProps
  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "bg-brand-primary text-white border-brand-primary hover:opacity-90",
    secondary: "bg-white dark:bg-brand-border-dark text-brand-text border-brand-border hover:bg-brand-primary/10",
    danger: "bg-red-500 text-white border-red-600 hover:bg-red-400",
    warning: "bg-orange-500 text-white border-orange-600 hover:bg-orange-400",
  };

  return (
    <button 
      {...props} 
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Utilisation de memo pour éviter les re-rendus inutiles
export default memo(Button);