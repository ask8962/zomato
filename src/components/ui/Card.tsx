import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	as?: keyof JSX.IntrinsicElements;
}

export const Card: React.FC<CardProps> = ({ as: Tag = 'div', className, children, ...props }) => {
	return (
		<Tag
			className={clsx('card-beautiful p-6 bg-surface', className)}
			{...props}
		>
			{children}
		</Tag>
	);
};

export default Card;

