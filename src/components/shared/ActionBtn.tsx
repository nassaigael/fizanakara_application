import React, { memo } from "react";

interface ActionBtnProps
{
	icon: React.ReactElement<{ size?: number }>;
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
	variant?: "edit" | "delete" | "view";
	title: string;
	className?: string;
}

const ActionBtn: React.FC<ActionBtnProps> = (
{
	icon,
	onClick,
	variant = "view",
	title,
	className = "",
}) =>
{
	const colors: Record<"view" | "edit" | "delete", string> =
	{
		view: "hover:text-blue-500 hover:border-blue-500/30 text-blue-400",
		edit: "hover:text-brand-primary hover:border-brand-primary/30 text-brand-muted",
		delete: "hover:text-red-500 hover:border-red-500/30 text-red-400",
	};
	return(
		<button type="button" title={title} aria-label={title} onClick={onClick} className={`p-2.5 bg-white dark:bg-brand-border-dark border-2 border-b-4 border-brand-border rounded-xl transition-all active:translate-y-[2px] active:border-b-2 flex items-center justify-center ${colors[variant]} ${className}`}>
			{
				React.cloneElement
				(
					icon,
					{ 
						size: icon.props.size || 18 
					}
				)
			}
		</button>
	);
};

export default memo(ActionBtn);