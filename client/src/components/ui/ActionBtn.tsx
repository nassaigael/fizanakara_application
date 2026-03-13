import React, { memo } from "react";
import Button from "./Button";

interface ActionBtnProps {
    icon: React.ReactElement;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    variant?: "edit" | "delete" | "view";
    title: string;
    className?: string;
}

const ActionBtn: React.FC<ActionBtnProps> = ({
    icon,
    onClick,
    variant = "view",
    title,
    className = "",
}) => {
    const colors: Record<"view" | "edit" | "delete", string> = {
        view: "hover:text-blue-500 hover:border-blue-500/30 text-blue-400",
        edit: "hover:text-brand-primary hover:border-brand-primary/30 text-brand-muted",
        delete: "hover:text-red-500 hover:border-red-500/30 text-red-400",
    };

    return (
        <Button
            variant="ghost"
            title={title}
            aria-label={title}
            onClick={onClick}
            className={`
                p-2 sm:p-2.5 
                rounded-lg sm:rounded-xl 
                ${colors[variant]} 
                ${className}
            `}
        >
            {React.cloneElement(icon)}
        </Button>
    );
};

export default memo(ActionBtn);