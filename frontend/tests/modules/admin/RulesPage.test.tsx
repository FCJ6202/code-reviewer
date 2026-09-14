import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import RulesPage from '@/modules/admin/RulesPage';
import { server } from '../../msw/server';
import { renderPage } from '../../utils/render';

function chooseCsv() {
  const file = new File(['id,type,description\n21,bug,Close files after reading\n'], 'rules.csv', {
    type: 'text/csv',
  });
  fireEvent.change(screen.getByTestId('rules-file-input'), { target: { files: [file] } });
}

describe('RulesPage', () => {
  it('lists rules and uploads a CSV', async () => {
    const user = userEvent.setup();
    renderPage(<RulesPage />, { path: '/admin/rules' });

    expect(await screen.findByText('Never interpolate raw user input directly into SQL queries')).toBeInTheDocument();
    const upload = screen.getByRole('button', { name: 'Upload' });
    expect(upload).toBeDisabled();

    chooseCsv();
    expect(screen.getByText(/rules\.csv/)).toBeInTheDocument();
    await user.click(upload);

    expect(await screen.findByText('21 rows read · 1 added or updated')).toBeInTheDocument();
  });

  it('shows the validation error from the API', async () => {
    server.use(
      http.post('*/api/rules/ingest', () =>
        HttpResponse.json({ error: 'line 2: type "style" must be one of security, bug' }, { status: 400 }),
      ),
    );
    const user = userEvent.setup();
    renderPage(<RulesPage />, { path: '/admin/rules' });

    await screen.findByText('Never interpolate raw user input directly into SQL queries');
    chooseCsv();
    await user.click(screen.getByRole('button', { name: 'Upload' }));

    expect(await screen.findByText('line 2: type "style" must be one of security, bug')).toBeInTheDocument();
  });
});
