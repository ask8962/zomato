import React from 'react';

interface RatingStarsProps {
	value: number; // 0-5
	count?: number;
	ariaLabel?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({ value, count, ariaLabel }) => {
	const clamped = Math.max(0, Math.min(5, value));
	return (
		<div className="flex items-center" aria-label={ariaLabel || `Rated ${clamped} out of 5`} role="img">
			{Array.from({ length: 5 }).map((_, i) => {
				const filled = i < clamped;
				return (
					<span key={i} className={filled ? 'text-yellow-400' : 'text-gray-300'} aria-hidden>
						★
					</span>
				);
			})}
			{typeof count === 'number' && (
				<span className="ml-2 text-sm text-gray-500" aria-hidden>
					({count})
				</span>
			)}
		</div>
	);
};

export default RatingStars;

