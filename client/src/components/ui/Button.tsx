import React, { memo } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "warning" | "ghost";
    isLoading?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    isLoading = false,
    className = "",
    disabled,
    icon,
    fullWidth = false,
    ...props
}) => {
    const base = `
        px-4 sm:px-6 py-3 sm:py-4 
        rounded-xl sm:rounded-2xl 
        font-black uppercase tracking-wide text-xs sm:text-sm 
        border-2 border-b-4 
        transition-all active:translate-y-[1px] 
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed 
        outline-none focus-visible:ring-2 ring-offset-2 ring-brand-primary
        ${fullWidth ? 'w-full' : ''}
    `;

    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
        primary: "bg-brand-primary text-white border-brand-primary hover:opacity-90",
        secondary: "bg-white text-brand-text border-brand-border hover:bg-brand-primary/10",
        danger: "bg-red-500 text-white border-red-600 hover:bg-red-400",
        warning: "bg-orange-500 text-white border-orange-600 hover:bg-orange-400",
        ghost: "bg-transparent border-transparent text-brand-text hover:bg-gray-100",
    };

    return (
        <button
            {...props}
            disabled={disabled || isLoading}
            className={`${base} ${variants[variant]} ${className}`}
        >
            {isLoading ? (
                <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Chargement...</span>
                </>
            ) : (
                <>
                    {icon}
                    {children}
                </>
            )}
        </button>
    );
};

export default memo(Button);