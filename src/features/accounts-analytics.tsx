const CK = (window as any).CK;
const h = React.createElement;
const { useState } = React;

function AccountsPage() {
  const state = CK.useStore();
  const [showModal, setShowModal] = useState(false);
  const totalBalance = CK.getTotalBalance(state.accounts);

  return h(CK.AppShell, { activePage: 'accounts', state },
    h(CK.PageHeader, { title: 'Счета' },
      h(CK.Button, { variant: 'primary', onClick: () => setShowModal(true), dangerouslySetInnerHTML: { __html: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Новый счёт' })
    ),
    h('div', { className: 'total-balance' },
      h('div', { className: 'total-label' }, 'Общий баланс'),
      h('div', { className: 'total-value' }, CK.formatMoney(totalBalance))
    ),
    h('div', { className: 'accounts-grid' },
      state.accounts.length === 0
        ? h(CK.EmptyState, { icon: '<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>', title: 'Нет счетов', text: 'Добавьте карту, накопительный счёт или наличные' })
        : state.accounts.map((acc: any) =>
            h('div', { key: acc.id, className: 'account-card' + (acc.archived ? ' archived' : '') },
              h('div', { className: 'account-top' },
                h('span', { className: 'account-type' }, (CK.TYPE_LABELS[acc.type] || acc.type))
              ),
              h('div', { className: 'account-name' }, acc.name),
              h('div', { className: 'account-balance-val' }, CK.formatMoney(acc.balance)),
              h('div', { className: 'account-currency' }, 'Российский рубль'),
              h('div', { className: 'account-actions' },
                h('button', { className: 'account-action', onClick: () => CK.store.toggleArchiveAccount(acc.id) },
                  acc.archived ? 'Разархивировать' : 'Архивировать'
                )
              )
            )
          )
    ),
    showModal && h(AddAccountModal, { onClose: () => setShowModal(false) })
  );
}

function AddAccountModal(props: any) {
  const [accType, setAccType] = useState('card');
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');

  const handleSave = () => {
    CK.store.addAccount({
      name: name || CK.TYPE_LABELS[accType],
      type: accType,
      balance: CK.parseAmount(balance),
      currency: 'RUB',
      archived: false
    });
    props.onClose();
  };

  return h(CK.Modal, { title: 'Новый счёт', onClose: props.onClose, footer: h(React.Fragment, null,
    h(CK.Button, { onClick: props.onClose }, 'Отмена'),
    h(CK.Button, { variant: 'primary', onClick: handleSave }, 'Создать')
  )},
    h('div', { className: 'type-tabs' },
      [['card','Карта'],['cash','Наличные'],['savings','Накопительный']].map(([val, label]) =>
        h('button', { key: val, className: 'type-tab' + (accType === val ? ' active' : ''), onClick: () => setAccType(val) }, label)
      )
    ),
    h('div', { className: 'form-group' },
      h('label', { className: 'form-label' }, 'Название'),
      h('input', { type: 'text', className: 'form-input', placeholder: 'Основная карта', value: name, onChange: (e: any) => setName(e.target.value) })
    ),
    h('div', { className: 'form-group' },
      h('label', { className: 'form-label' }, 'Начальный баланс'),
      h('input', { type: 'text', className: 'form-input', placeholder: '0', inputMode: 'numeric', value: balance, onChange: (e: any) => setBalance(e.target.value) })
    )
  );
}

function AnalyticsPage() {
  const state = CK.useStore();
  const totalExpense = CK.getTotalExpense(state.transactions);
  const totalIncome = CK.getTotalIncome(state.transactions);
  const avgPerDay = CK.getAvgPerDay(totalExpense);
  const expenseByCategory = CK.getExpensesByCategory(state.transactions, state.categories);
  const maxCatAmount = expenseByCategory.length > 0 ? expenseByCategory[0].amount : 1;
  const dailyExpenses = CK.getDailyExpenses(state.transactions);
  const dailyMap: Record<string, number> = {};
  state.transactions.filter((t: any) => t.type === 'expense').forEach((t: any) => {
    dailyMap[t.date] = (dailyMap[t.date] || 0) + t.amount;
  });
  const pathData = CK.getLinePath(dailyExpenses, dailyMap);
  const now = new Date();

  return h(CK.AppShell, { activePage: 'analytics', state },
    h(CK.PageHeader, { title: 'Аналитика' },
      h('button', { className: 'month-selector' }, CK.MONTHS[now.getMonth()] + ' ' + now.getFullYear() + ' ▾')
    ),
    h('div', { className: 'summary-row' },
      [
        ['Расходы за месяц', CK.formatMoney(totalExpense), '+14 200 vs май', 'negative'],
        ['Доходы за месяц', CK.formatMoney(totalIncome), '+8 000 vs май', 'positive'],
        ['Средний расход в день', CK.formatMoney(avgPerDay), '+524 vs май', 'negative']
      ].map(([label, value, sub, cls], i) =>
        h('div', { key: i, className: 'summary-card' },
          h('div', { className: 'summary-label' }, label),
          h('div', { className: 'summary-value' }, value),
          h('div', { className: 'summary-sub ' + cls }, sub)
        )
      )
    ),
    h('div', { className: 'analytics-panel' },
      h('div', { className: 'panel-header' },
        h('span', { className: 'panel-title' }, 'Расходы по категориям')
      ),
      h('div', { className: 'bar-chart' },
        expenseByCategory.map((entry: any, i: number) =>
          h('div', { key: i, className: 'bar-row' },
            h('div', { className: 'bar-label' }, entry.category.name),
            h('div', { className: 'bar-track' },
              h('div', { className: 'bar-fill', style: { width: ((entry.amount / maxCatAmount) * 100) + '%', background: CK.CHART_COLORS[i % CK.CHART_COLORS.length] } })
            ),
            h('div', { className: 'bar-value' }, CK.formatMoney(entry.amount))
          )
        )
      )
    ),
    h('div', { className: 'analytics-panel' },
      h('div', { className: 'panel-header' },
        h('span', { className: 'panel-title' }, 'Динамика расходов по дням')
      ),
      h('div', { className: 'line-chart' },
        h('svg', { viewBox: '0 0 600 200', preserveAspectRatio: 'none', role: 'img', 'aria-label': 'График динамики расходов' },
          h('line', { className: 'chart-grid-line', x1: 0, y1: 50, x2: 600, y2: 50 }),
          h('line', { className: 'chart-grid-line', x1: 0, y1: 100, x2: 600, y2: 100 }),
          h('line', { className: 'chart-grid-line', x1: 0, y1: 150, x2: 600, y2: 150 }),
          pathData.area && h('path', { className: 'chart-area-path', d: pathData.area, fill: 'var(--accent)' }),
          pathData.line && h('path', { className: 'chart-line-path', d: pathData.line, stroke: 'var(--accent)' })
        )
      ),
      h('div', { className: 'chart-labels' },
        dailyExpenses.slice(0, 7).map((d: string) => h('span', null, new Date(d).getDate()))
      )
    ),
    h('div', { className: 'analytics-panel' },
      h('div', { className: 'panel-header' },
        h('span', { className: 'panel-title' }, 'Сравнение месяцев')
      ),
      h('div', { className: 'compare-chart' },
        ['Апр','Май','Июн'].map((month, i) => {
          const heights = [65, 80, 95];
          return h('div', { key: i, className: 'compare-bar-group' },
            h('div', { className: 'compare-bar', style: { height: heights[i] + '%', background: 'var(--border)', maxHeight: '100%' } }),
            h('div', { className: 'compare-bar', style: { height: Math.min(100, heights[i] + 10) + '%', background: 'var(--accent)', maxHeight: '100%' } })
          );
        })
      ),
      h('div', { className: 'compare-legend' },
        h('div', { className: 'compare-legend-item' },
          h('div', { className: 'compare-dot', style: { background: 'var(--border)' } }), 'Доходы'
        ),
        h('div', { className: 'compare-legend-item' },
          h('div', { className: 'compare-dot', style: { background: 'var(--accent)' } }), 'Расходы'
        )
      )
    )
  );
}

CK.AccountsPage = AccountsPage;
CK.AnalyticsPage = AnalyticsPage;
