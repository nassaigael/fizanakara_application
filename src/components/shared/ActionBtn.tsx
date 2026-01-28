import React, { memo } from "react";
import Button from "./Button";

interface ActionBtnProps {
	icon: React.ReactElement<{ size?: number }>;
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
			variant="secondary"
			title={title}
			aria-label={title}
			onClick={onClick}
			className={`p-2.5! rounded-xl! flex items-center justify-center ${colors[variant]} ${className}`}
		>
			{React.cloneElement(icon, {
				size: icon.props.size || 18,
			})}
		</Button>
	);
};

export default memo(ActionBtn);