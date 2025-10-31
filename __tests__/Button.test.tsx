import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
	it('renders and triggers click', async () => {
		const user = userEvent.setup();
		const onClick = jest.fn();
		render(<Button onClick={onClick}>Click me</Button>);
		await user.click(screen.getByRole('button', { name: /click me/i }));
		expect(onClick).toHaveBeenCalled();
	});
});

