import React, { forwardRef, memo } from "react";
import { AiOutlineDown } from "react-icons/ai";

interface Option
{
	value: string | number;
	label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>
{
	label?: string;
	options: Option[];
	error?: string;
	containerClassName?: string;
	placeholder?: string;
	icon?: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>
(
	(
		{
			label,
			options,
			error,
			containerClassName = "",
			placeholder = "Sélectionner...",
			icon,
			...props
		}, ref
	) =>
	{
		return (
			<div className={`w-full flex flex-col gap-2 ${containerClassName}`}>
				{
					label &&
					(
						<label htmlFor={props.name} className="block font-black text-brand-muted ml-1 text-[11px] uppercase tracking-[0.15em]">
							{label}
						</label>
					)
				}

				<div className="relative group">
					{
						icon &&
						(
							<div className="absolute inset-y-0 left-4 flex items-center text-brand-muted group-focus-within:text-brand-primary transition-colors duration-200 z-10">
								{icon}
							</div>
						)
					}
					<select ref={ref} id={props.name} className={`w-full p-4 ${icon ? "pl-12" : "px-5"} bg-white appearance-none border-2 ${error ? "border-brand-primary" : "border-brand-border"} border-b-4 rounded-2xl font-bold text-brand-text text-sm outline-none focus:border-brand-primary transition-all cursor-pointer disabled:opacity-50`} {...props}>
						<option value="">
							{placeholder}
						</option>
						{
						options.map(
							(option) => 
								(
									<option key={option.value} value={option.value} className="font-sans font-medium">
										{option.label}
									</option>
								)
							)
						}
					</select>
			
					<div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-brand-muted group-focus-within:text-brand-primary transition-colors">
						<AiOutlineDown size={14} className="stroke-[3px]" />
					</div>
				</div>

				{
					error &&
					(
						<span className="text-[10px] text-brand-primary font-black ml-2 uppercase tracking-wide animate-in fade-in slide-in-from-top-1">
							{error}
						</span>
					)
				}
			</div>
		);
	}
);

Select.displayName = "Select";
export default memo(Select);