import React, { useState, forwardRef, memo } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>
{
	label?: string;
	icon?: React.ReactNode;
	error?: string;
	containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>
(
	(
		{
			label,
			type = "text",
			icon,
			name,
			error,
			containerClassName = "",
			...props
		},
		ref
	) =>
	{
		const [showPassword, setShowPassword] = useState(false);
		const isPassword = type === "password";
		const currentType = isPassword && showPassword ? "text" : type;

		return (
			<div className={`flex flex-col gap-2 ${containerClassName}`}>
				{
					label &&
					(
						<label htmlFor={name} className="text-[11px] font-black uppercase tracking-[0.15em] text-brand-muted ml-1">
							{label}
						</label>
					)
				}

				<div className="relative group">
					{
						icon &&
						(
							<div className="absolute inset-y-0 left-4 flex items-center text-brand-muted group-focus-within:text-brand-primary">
								{icon}
							</div>
						)
					}

					<input ref={ref} id={name} name={name} type={currentType} className= {`w-full p-4 ${icon ? "pl-12" : "px-5"} bg-white dark:bg-brand-border-dark border-2 border-b-4 rounded-2xl font-bold text-sm text-brand-text outline-none transition ${error ? "border-brand-primary" : "border-brand-border"} focus:border-brand-primary placeholder:text-brand-muted/40 `} {...props} />
					{
						isPassword &&
						(
							<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-4 text-brand-muted hover:text-brand-primary">
								{showPassword ?
									(
										<AiOutlineEyeInvisible size={20} />
									) : (
									<AiOutlineEye size={20} />
									)
								}
							</button>
						)
					}
				</div>
				{
					error &&
					(
						<span className="text-[10px] font-black uppercase tracking-wide text-brand-primary ml-2">
							{error}
						</span>
					)
				}
			</div>
		);
	}
);
Input.displayName = "Input";

export default memo(Input);
