import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import NewReviewPage from '@/modules/review/NewReviewPage';
import { server } from '../../msw/server';
import { renderPage } from '../../utils/render';

const resultRoute = { path: '/reviews/:id', element: <p>result page</p> };

describe('NewReviewPage', () => {
  it('enables Review code only once code is entered', async () => {
    const user = userEvent.setup();
    renderPage(<NewReviewPage />, { path: '/' });

    const button = screen.getByRole('button', { name: 'Review code' });
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText('Code to review'), 'print(1)');
    expect(button).toBeEnabled();
  });

  it('shows the language detected from the filename', async () => {
    const user = userEvent.setup();
    renderPage(<NewReviewPage />, { path: '/' });

    await user.type(screen.getByLabelText('Filename'), 'app.py');
    expect(screen.getByText('Python · detected from the filename')).toBeInTheDocument();
  });

  it('opens the result page after a successful review', async () => {
    const user = userEvent.setup();
    renderPage(<NewReviewPage />, { path: '/', extraRoutes: [resultRoute] });

    await user.type(screen.getByLabelText('Code to review'), 'print(1)');
    await user.click(screen.getByRole('button', { name: 'Review code' }));

    expect(await screen.findByText('result page')).toBeInTheDocument();
  });

  it('shows the API error and keeps the code when the review fails', async () => {
    server.use(
      http.post('*/api/reviews', () =>
        HttpResponse.json({ error: 'review failed, please try again' }, { status: 502 }),
      ),
    );
    const user = userEvent.setup();
    renderPage(<NewReviewPage />, { path: '/', extraRoutes: [resultRoute] });

    await user.type(screen.getByLabelText('Code to review'), 'print(1)');
    await user.click(screen.getByRole('button', { name: 'Review code' }));

    expect(await screen.findByText('review failed, please try again')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeEnabled();
    expect(screen.getByLabelText('Code to review')).toHaveValue('print(1)');
  });
});
