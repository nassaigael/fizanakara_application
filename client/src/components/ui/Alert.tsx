import React, { useEffect, memo } from "react";
import { createPortal } from "react-dom";
import {
	AiOutlineWarning,
	AiOutlineCheckCircle,
	AiOutlineInfoCircle,
} from "react-icons/ai";
import Button from "./Button";

interface AlertProps
{
	isOpen: boolean;
	title: string;
	message: string;
	onClose: () => void;
	onConfirm?: () => void;
	confirmText?: string;
	cancelText?: string;
	variant?: "success" | "danger" | "warning" | "info";
}

const Alert: React.FC<AlertProps> = (
{
    isOpen,
    title,
    message,
    onClose,
    onConfirm,
    confirmText = "Confirmer",
    cancelText = "Annuler",
    variant = "warning",
}) => {
	useEffect(() => 
	{
		if (isOpen)
		{
			document.body.style.overflow = "hidden";
		}
		return () =>
		{
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);
	if (!isOpen) return null;

	const config =
	{
		success: 
		{
			icon: <AiOutlineCheckCircle size={28} />,
			color: "text-green-500",
			bg: "bg-green-50",
			border: "border-green-200",
			btnVariant: "primary" as const,
		},
		danger:
		{
			icon: <AiOutlineWarning size={28} />,
			color: "text-red-500",
			bg: "bg-red-50",
			border: "border-red-200",
			btnVariant: "danger" as const,
		},
		warning:
		{
			icon: <AiOutlineWarning size={28} />,
			color: "text-orange-500",
			bg: "bg-orange-50",
			border: "border-orange-200",
			btnVariant: "warning" as const,
		},
		info:
		{
			icon: <AiOutlineInfoCircle size={28} />,
			color: "text-blue-500",
			bg: "bg-blue-50",
			border: "border-blue-200",
			btnVariant: "primary" as const,
		},
	};
	const current = config[variant];
	const handleConfirm = () =>
	{
		onConfirm?.();
		onClose();
	};

	return createPortal(
	<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
		<div className="w-full max-w-sm bg-white dark:bg-brand-border-dark rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
		<div className="p-8 text-center">
			<div className={`mx-auto w-16 h-16 rounded-3xl border-2 border-b-4 flex items-center justify-center mb-6 ${current.bg} ${current.border} ${current.color}`}>
			{current.icon}
			</div>
			<h2 className="text-xl font-black text-brand-text uppercase mb-2">
			{title}
			</h2>
			<p className="text-sm font-bold text-brand-muted leading-relaxed">
			{message}
			</p>
		</div>
		<div className="p-6 bg-brand-bg dark:bg-brand-bg/10 border-t-2 border-brand-border flex gap-3">
			<Button variant="secondary" onClick={onClose} className="flex-1 py-3 text-xs">
			{cancelText}
			</Button>
			<Button
			variant={current.btnVariant}
			onClick={handleConfirm}
			className="flex-1 py-3 text-xs"
			>
			{confirmText}
			</Button>
		</div>
		</div>
	</div>,
	document.body
	);
};

export default memo(Alert);