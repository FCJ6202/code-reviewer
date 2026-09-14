import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import HistoryPage from '@/modules/history/HistoryPage';
import { server } from '../../msw/server';
import { renderPage } from '../../utils/render';

describe('HistoryPage', () => {
  it('lists past reviews and opens one', async () => {
    const user = userEvent.setup();
    renderPage(<HistoryPage />, {
      path: '/history',
      extraRoutes: [{ path: '/reviews/:id', element: <p>review detail</p> }],
    });

    expect(await screen.findByText('2 reviews · average 4.5')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /handlers\.go/ }));

    expect(await screen.findByText('review detail')).toBeInTheDocument();
  });

  it('shows an empty state when there are no reviews', async () => {
    server.use(http.get('*/api/reviews', () => HttpResponse.json({ reviews: [] })));
    renderPage(<HistoryPage />, { path: '/history' });

    expect(await screen.findByText('No reviews yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Review your first file' })).toBeInTheDocument();
  });
});
