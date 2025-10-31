import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';
import Home from '@/app/page';

expect.extend(toHaveNoViolations);

describe('Home a11y', () => {
	it('has no detectable a11y violations', async () => {
		const { container } = render(<Home />);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});

