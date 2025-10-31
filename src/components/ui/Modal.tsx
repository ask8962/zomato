'use client';

import React, { useEffect } from 'react';
import clsx from 'clsx';

export interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') onClose();
		}
		if (isOpen) document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label={title}
			className="fixed inset-0 z-[100] flex items-center justify-center"
		>
			<div className="absolute inset-0 bg-black/40" onClick={onClose} />
			<div className={clsx('relative z-[101] w-full max-w-lg rounded-2xl bg-white p-6 shadow-elev3')}>
				{title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
				{children}
				<button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" aria-label="Close modal">✕</button>
			</div>
		</div>
	);
};

export default Modal;

