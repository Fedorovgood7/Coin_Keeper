import { useState, useMemo } from 'react';
import { useStore } from '@/shared/store';
import { formatMoney, formatDate, groupTransactionsByDate } from '@/shared/lib/utils';
import { Link } from 'react-router-dom';
import type { TimePeriod } from '@/entities/types';
import { EditTransactionModal } from './EditTransactionModal';

type SortType = 'date' | 'amount' | 'category';

export function TransactionsPage() {
  const { transactions, categories, accounts, updateTransaction, deleteTransaction } = useStore();
  const [period, setPeriod] = useState<TimePeriod>('week');
  const [filterType, setFilterType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [filterCategoryId, setFilterCategoryId] = useState<string | null>(null);
  const [filterAccountId, setFilterAccountId] = useState<string | null>(null);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [sortType, setSortType] = useState<SortType>('date');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingTx, setEditingTx] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const periods: TimePeriod[] = ['day', 'week', 'month', 'year', 'period'];

  // Calculate date range based on period
  const getDateRange = useMemo(() => {
    const now = selectedDate;
    let from: Date;
    let to: Date;

    switch (period) {
      case 'day':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        from = new Date(now.setDate(diff));
        to = new Date(from);
        to.setDate(to.getDate() + 6);
        to.setHours(23, 59, 59);
        break;
      case 'month':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'year':
        from = new Date(now.getFullYear(), 0, 1);
        to = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
      default:
        from = dateFrom ? new Date(dateFrom) : new Date('2020-01-01');
        to = dateTo ? new Date(dateTo) : new Date('2030-12-31');
    }

    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    };
  }, [period, selectedDate, dateFrom, dateTo]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by type
    if (filterType === 'transfer') {
      filtered = filtered.filter((t) => t.type === 'transfer');
    } else {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    // Filter by category
    if (filterCategoryId) {
      filtered = filtered.filter((t) => t.categoryId === filterCategoryId);
    }

    // Filter by account
    if (filterAccountId) {
      filtered = filtered.filter((t) => t.accountId === filterAccountId || t.toAccountId === filterAccountId);
    }

    // Filter by date range
    filtered = filtered.filter((t) => t.date >= getDateRange.from && t.date <= getDateRange.to);

    // Sort
    if (sortType === 'amount') {
      filtered = [...filtered].sort((a, b) => b.amount - a.amount);
    } else if (sortType === 'category') {
      filtered = [...filtered].sort((a, b) => {
        const catA = categories.find((c) => c.id === a.categoryId)?.name || '';
        const catB = categories.find((c) => c.id === b.categoryId)?.name || '';
        return catA.localeCompare(catB);
      });
    } else {
      filtered = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return filtered;
  }, [transactions, filterType, filterCategoryId, filterAccountId, sortType, getDateRange, categories]);

  const grouped = groupTransactionsByDate(filteredTransactions);
  const total = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleExportCSV = () => {
    const headers = 'Дата,Тип,Категория,Счёт,Сумма,Описание\n';
    const rows = filteredTransactions
      .map((tx) => {
        const cat = categories.find((c) => c.id === tx.categoryId);
        const acc = accounts.find((a) => a.id === tx.accountId);
        return `${tx.date},${tx.type},${cat?.name || ''},${acc?.name || ''},${tx.amount},"${tx.description || ''}"`;
      })
      .join('\n');
    const csv = headers + rows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const navigatePeriod = (direction: number) => {
    const newDate = new Date(selectedDate);
    switch (period) {
      case 'day':
        newDate.setDate(newDate.getDate() + direction);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + direction * 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + direction);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + direction);
        break;
    }
    setSelectedDate(newDate);
  };

  const formatPeriodLabel = () => {
    const now = selectedDate;
    switch (period) {
      case 'day':
        return now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
      case 'week':
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const weekStart = new Date(now.setDate(diff));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${weekStart.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} – ${weekEnd.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      case 'month':
        return now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
      case 'year':
        return `${now.getFullYear()} год`;
      case 'period':
        if (dateFrom && dateTo) {
          return `${new Date(dateFrom).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} – ${new Date(dateTo).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}`;
        }
        return 'Выберите период';
      default:
        return '';
    }
  };

  const handlePeriodChange = (p: TimePeriod) => {
    setPeriod(p);
    if (p === 'period') {
      const now = new Date();
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      setDateFrom(monthAgo.toISOString().split('T')[0]);
      setDateTo(now.toISOString().split('T')[0]);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Link to="/dashboard" style={{ color: 'white', fontSize: 20, textDecoration: 'none' }}>‹</Link>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Операции</div>
            <button
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'white',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {filterAccountId ? accounts.find((a) => a.id === filterAccountId)?.icon : '💳'}{' '}
              {filterAccountId ? accounts.find((a) => a.id === filterAccountId)?.name : 'Все карты'} ▾
            </button>

            {/* Account dropdown */}
            {showAccountDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: 8,
                  background: 'white',
                  borderRadius: 12,
                  padding: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 100,
                  minWidth: 200,
                }}
              >
                <button
                  onClick={() => {
                    setFilterAccountId(null);
                    setShowAccountDropdown(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    textAlign: 'left',
                    background: !filterAccountId ? 'var(--bg)' : 'none',
                    border: 'none',
                    fontSize: 14,
                    borderRadius: 8,
                  }}
                >
                  Все карты
                </button>
                {accounts.filter((a) => !a.isArchived).map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => {
                      setFilterAccountId(acc.id);
                      setShowAccountDropdown(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px 12px',
                      textAlign: 'left',
                      background: filterAccountId === acc.id ? 'var(--bg)' : 'none',
                      border: 'none',
                      fontSize: 14,
                      borderRadius: 8,
                    }}
                  >
                    {acc.icon} {acc.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleExportCSV}
            style={{ color: 'white', fontSize: 20, background: 'none', border: 'none' }}
            title="Экспорт CSV"
          >
            📥
          </button>
        </div>

        <div style={{ display: 'flex', gap: 0 }}>
          {(['expense', 'income', 'transfer'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                flex: 1,
                padding: '12px 0',
                borderBottom: filterType === type ? '2px solid white' : 'none',
                fontWeight: 600,
                opacity: filterType === type ? 1 : 0.5,
                color: 'white',
                background: 'none',
                fontSize: 14,
              }}
            >
              {type === 'expense' ? 'РАСХОДЫ' : type === 'income' ? 'ДОХОДЫ' : 'ПЕРЕВОД'}
            </button>
          ))}
        </div>
      </div>

      {/* Period selector */}
      <div className="tabs" style={{ justifyContent: 'center', padding: '12px 20px' }}>
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className={`tab ${period === p ? 'active' : ''}`}
          >
            {p === 'day' ? 'День' : p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : p === 'year' ? 'Год' : 'Период'}
          </button>
        ))}
      </div>

      {/* Date navigation */}
      {period !== 'period' ? (
        <div className="period-selector">
          <span className="period-nav" onClick={() => navigatePeriod(-1)} style={{ cursor: 'pointer' }}>‹</span>
          <span className="period-label">{formatPeriodLabel()}</span>
          <span className="period-nav" onClick={() => navigatePeriod(1)} style={{ cursor: 'pointer' }}>›</span>
        </div>
      ) : (
        <div style={{ padding: '0 20px 12px', display: 'flex', gap: 12, justifyContent: 'center' }}>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14 }}
          />
          <span style={{ lineHeight: '36px', color: 'var(--text-secondary)' }}>–</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14 }}
          />
        </div>
      )}

      {/* Total and filters */}
      <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Всего: {formatMoney(total)}</div>
        <button
          onClick={() => setShowSortMenu(!showSortMenu)}
          style={{ fontSize: 14, color: 'var(--text-secondary)', background: 'none', border: 'none' }}
        >
          {sortType === 'date' ? 'По дате' : sortType === 'amount' ? 'По сумме' : 'По категории'} 
        </button>
      </div>

      {/* Sort menu */}
      {showSortMenu && (
        <div style={{ padding: '0 20px', marginBottom: 12 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {(['date', 'amount', 'category'] as SortType[]).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSortType(s);
                  setShowSortMenu(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 12px',
                  textAlign: 'left',
                  background: sortType === s ? 'var(--bg)' : 'none',
                  border: 'none',
                  fontSize: 14,
                  borderRadius: 8,
                }}
              >
                {s === 'date' ? 'По дате' : s === 'amount' ? 'По сумме' : 'По категории'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category filter */}
      <div style={{ padding: '0 20px', marginBottom: 12, display: 'flex', gap: 8 }}>
        <button
          onClick={() => setShowCategoryFilter(!showCategoryFilter)}
          style={{
            padding: '8px 16px',
            borderRadius: 20,
            border: '1px solid var(--border)',
            fontSize: 14,
            color: filterCategoryId ? 'var(--accent)' : 'var(--text-secondary)',
            background: 'white',
          }}
        >
          🏷️ {filterCategoryId ? categories.find((c) => c.id === filterCategoryId)?.name : 'Категория'}
        </button>
        <button
          onClick={() => setShowDateFilter(!showDateFilter)}
          style={{
            padding: '8px 16px',
            borderRadius: 20,
            border: '1px solid var(--border)',
            fontSize: 14,
            color: dateFrom || dateTo ? 'var(--accent)' : 'var(--text-secondary)',
            background: 'white',
          }}
        >
          📅 {dateFrom || dateTo ? 'Даты' : 'Период'}
        </button>
        {filterCategoryId && (
          <button
            onClick={() => setFilterCategoryId(null)}
            style={{ padding: '8px 12px', borderRadius: 20, border: '1px solid var(--border)', fontSize: 14, background: 'white' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Category filter dropdown */}
      {showCategoryFilter && (
        <div style={{ padding: '0 20px', marginBottom: 12 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', maxHeight: 300, overflowY: 'auto' }}>
            <button
              onClick={() => {
                setFilterCategoryId(null);
                setShowCategoryFilter(false);
              }}
              style={{ display: 'block', width: '100%', padding: '10px 12px', textAlign: 'left', background: !filterCategoryId ? 'var(--bg)' : 'none', border: 'none', fontSize: 14, borderRadius: 8 }}
            >
              Все категории
            </button>
            {categories
              .filter((c) => c.type === filterType)
              .map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setFilterCategoryId(cat.id);
                    setShowCategoryFilter(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 12px',
                    textAlign: 'left',
                    background: filterCategoryId === cat.id ? 'var(--bg)' : 'none',
                    border: 'none',
                    fontSize: 14,
                    borderRadius: 8,
                  }}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Date filter */}
      {showDateFilter && (
        <div style={{ padding: '0 20px', marginBottom: 12 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>С</label>
              <input type="date" className="form-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>По</label>
              <input type="date" className="form-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
              }}
              style={{ marginTop: 12, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, background: 'white' }}
            >
              Сбросить
            </button>
          </div>
        </div>
      )}

      {/* Transactions list */}
      <div style={{ padding: '0 20px' }}>
        {Object.entries(grouped).map(([date, txs]) => (
          <div key={date}>
            <div className="date-header">{formatDate(date)}</div>
            {txs.map((tx) => {
              const category = categories.find((c) => c.id === tx.categoryId);
              return (
                <div className="transaction-item" key={tx.id}>
                  <div className="category-icon" style={{ background: category?.color || '#999' }}>
                    {category?.icon || ''}
                  </div>
                  <div className="transaction-info">
                    <div className="transaction-name">{category?.name || tx.description || 'Без категории'}</div>
                    {tx.description && tx.description !== category?.name && (
                      <div className="transaction-date">{tx.description}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="transaction-amount">{formatMoney(tx.amount)}</div>
                    <button
                      onClick={() => {
                        setEditingTx(tx.id);
                        setShowEditModal(true);
                      }}
                      style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: '4px 8px' }}
                      title="Редактировать"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Удалить операцию?')) {
                          deleteTransaction(tx.id);
                        }
                      }}
                      style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: '4px 8px', color: 'var(--danger)' }}
                      title="Удалить"
                    >
                      
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        {filteredTransactions.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <div className="empty-title">Нет операций</div>
            <div className="empty-text">Добавьте первую операцию</div>
          </div>
        )}
      </div>

      {/* Edit transaction modal */}
      {showEditModal && editingTx && (
        <EditTransactionModal
          transactionId={editingTx}
          onClose={() => {
            setShowEditModal(false);
            setEditingTx(null);
          }}
        />
      )}

      {/* FAB */}
      <Link to="/transactions/new" className="fab">+</Link>
    </div>
  );
}
