'use client';

import React from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	fullWidth?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

const base = 'inline-flex items-center justify-center rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 transition-all ease-standard disabled:opacity-50 disabled:cursor-not-allowed';
const sizes: Record<ButtonSize, string> = {
	sm: 'h-9 px-3 text-sm',
	md: 'h-11 px-4 text-sm',
	lg: 'h-12 px-6 text-base',
};
const variants: Record<ButtonVariant, string> = {
	primary: 'bg-[color:var(--color-brand)] text-white hover:bg-[color:var(--color-brand-600)] shadow-elev2',
	secondary: 'bg-white text-[color:var(--color-brand)] border border-[color:var(--color-brand)] hover:bg-orange-50',
	ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
};

export const Button: React.FC<ButtonProps> = ({
	variant = 'primary',
	size = 'md',
	fullWidth,
	leftIcon,
	rightIcon,
	className,
	children,
	...props
}) => {
	return (
		<button
			className={clsx(base, sizes[size], variants[variant], fullWidth && 'w-full', className)}
			{...props}
		>
			{leftIcon && <span className="mr-2" aria-hidden>{leftIcon}</span>}
			{children}
			{rightIcon && <span className="ml-2" aria-hidden>{rightIcon}</span>}
		</button>
	);
};

export default Button;

