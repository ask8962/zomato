'use client';

import React from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	helpText?: string;
	error?: string;
	startIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, id, helpText, error, startIcon, className, ...props }) => {
	const inputId = id || React.useId();
	const describedByIds: string[] = [];
	if (helpText) describedByIds.push(`${inputId}-help`);
	if (error) describedByIds.push(`${inputId}-error`);

	return (
		<div className={clsx('w-full', className)}>
			{label && (
				<label htmlFor={inputId} className="block mb-2 text-sm font-medium text-gray-700">
					{label}
				</label>
			)}
			<div className={clsx('relative flex items-center')}> 
				{startIcon && <span className="absolute left-3 text-gray-400" aria-hidden>{startIcon}</span>}
				<input
					id={inputId}
					aria-describedby={describedByIds.join(' ') || undefined}
					className={clsx(
						'input-beautiful',
						startIcon && 'pl-10',
						error && 'border-red-500 focus:ring-red-500 focus:border-red-500'
					)}
					{...props}
				/>
			</div>
			{helpText && (
				<p id={`${inputId}-help`} className="mt-1 text-xs text-gray-500">{helpText}</p>
			)}
			{error && (
				<p id={`${inputId}-error`} className="mt-1 text-xs text-red-600">{error}</p>
			)}
		</div>
	);
};

export default Input;

