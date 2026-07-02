import { useEffect, useState } from 'react';
import {
  HandWavingIcon, BooksIcon, BookOpenIcon, UsersIcon, ArrowsClockwiseIcon, WarningIcon,
  CheckCircleIcon, ConfettiIcon,
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { reportService, loanService } from '../api/services';
import { getApiError } from '../api/client';
import {
  Page, Card, DataTable, StatCard, Badge, Spinner, Alert,
} from '../components/ui';
import { LOAN_STATUS_LABELS, formatDate } from '../utils/labels';

const booksTitles = (loan) => (loan.books || []).map((b) => b.title).join(', ');

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isStaff = hasRole('admin', 'librarian');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (isStaff) {
          const [s, o] = await Promise.all([reportService.summary(), loanService.overdue()]);
          if (!active) return;
          setSummary(s.data.data);
          setLoans(o.data.data);
        } else {
          const mine = await loanService.list();
          if (!active) return;
          setLoans(mine.data.data);
        }
      } catch (err) {
        if (active) setError(getApiError(err));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [isStaff]);

  if (loading) return <Spinner />;

  return (
    <Page>
      <Page.Header
        title={<>Olá, {user?.name?.split(' ')[0]} <HandWavingIcon weight="fill" /></>}
        subtitle="Bem-vindo ao painel da biblioteca."
      />

      <Alert onClose={() => setError('')}>{error}</Alert>

      {isStaff && summary && (
        <>
          <div className="stats-grid">
            <StatCard icon={<BooksIcon />} accent="blue" label="Títulos cadastrados" value={summary.books.total} />
            <StatCard icon={<BookOpenIcon />} accent="green" label="Exemplares disponíveis" value={summary.books.availableCopies} />
            <StatCard icon={<UsersIcon />} accent="purple" label="Leitores ativos" value={summary.readers.active} />
            <StatCard icon={<ArrowsClockwiseIcon />} accent="orange" label="Empréstimos em aberto" value={summary.loans.open} />
            <StatCard icon={<WarningIcon />} accent="red" label="Empréstimos atrasados" value={summary.loans.late} />
            <StatCard icon={<CheckCircleIcon />} accent="teal" label="Devolvidos" value={summary.loans.returned} />
          </div>

          <Card>
            <Card.Header>
              <Card.Title>Empréstimos atrasados</Card.Title>
            </Card.Header>
            <DataTable items={loans} rowKey="id" empty={<p className="muted">Nenhum empréstimo atrasado. <ConfettiIcon weight="fill" /></p>}>
              <DataTable.Column header="#" field="id" />
              <DataTable.Column header="Leitor" render={(l) => l.reader?.name} />
              <DataTable.Column header="Livros" render={booksTitles} />
              <DataTable.Column header="Devolução prevista" render={(l) => formatDate(l.dueDate)} />
              <DataTable.Column header="Status" render={() => <Badge kind="late">Atrasado</Badge>} />
            </DataTable>
          </Card>
        </>
      )}

      {!isStaff && (
        <Card>
          <Card.Header>
            <Card.Title>Meus empréstimos</Card.Title>
          </Card.Header>
          <DataTable items={loans} rowKey="id" empty={<p className="muted">Você ainda não possui empréstimos.</p>}>
            <DataTable.Column header="#" field="id" />
            <DataTable.Column header="Livros" render={booksTitles} />
            <DataTable.Column header="Empréstimo" render={(l) => formatDate(l.loanDate)} />
            <DataTable.Column header="Devolução prevista" render={(l) => formatDate(l.dueDate)} />
            <DataTable.Column header="Status" render={(l) => <Badge kind={l.status}>{LOAN_STATUS_LABELS[l.status]}</Badge>} />
          </DataTable>
        </Card>
      )}
    </Page>
  );
}
