const CK = (window as any).CK;
const h = React.createElement;
const { useState } = React;

function LoginPage() {
  const handleLogin = () => {
    CK.store.login();
    window.location.hash = '#/dashboard';
  };
  return h('div', { className: 'login-shell' },
    h('div', { className: 'login-card' },
      h('div', { className: 'login-logo' }, 'CoinKeeper'),
      h('p', { className: 'login-subtitle', dangerouslySetInnerHTML: { __html: 'Учёт личных финансов.<br>Быстро, безопасно, под контролем.' } }),
      h('button', { className: 'yandex-btn', onClick: handleLogin, dangerouslySetInnerHTML: { __html: '<span class="yandex-logo"><span>Я</span></span> Войти с Яндекс ID' } }),
      h('button', { className: 'demo-btn', onClick: handleLogin }, 'Демо-вход'),
      h('p', { className: 'demo-hint' }, 'Временный вход без авторизации'),
      h('div', { className: 'divider' }, 'возможности'),
      h('div', { className: 'features' },
        [['💳','Счета и карты','Карта, наличные, накопительный счёт — всё в одном месте'],
         ['📊','Бюджет и лимиты','Контроль расходов по категориям и безопасная сумма в день'],
         ['📈','Аналитика','Графики расходов, динамика по дням, сравнение периодов']
        ].map(([icon, title, desc], i) =>
          h('div', { key: i, className: 'feature' },
            h('div', { className: 'feature-icon' }, h('span', { style: { fontSize: '14px' } }, icon)),
            h('div', { className: 'feature-text' },
              h('h4', null, title),
              h('p', null, desc)
            )
          )
        )
      )
    )
  );
}

function DashboardPage() {
  const state = CK.useStore();
  const totalBalance = CK.getTotalBalance(state.accounts);
  const totalIncome = CK.getTotalIncome(state.transactions);
  const totalExpense = CK.getTotalExpense(state.transactions);
  const budgetStats = CK.getBudgetStats(state.transactions, state.budget);
  const safeData = CK.getSafePerDay(budgetStats.remaining);
  const expenseByCategory = CK.getExpensesByCategory(state.transactions, state.categories);
  const recurring = CK.getRecurringPayments(state.transactions);
  const pieData = CK.getPieSegments(expenseByCategory, 5);
  const now = new Date();
  const balanceChange = totalIncome - totalExpense;

  return h(CK.AppShell, { activePage: 'dashboard', state },
    h(CK.PageHeader, { title: 'Дашборд' },
      h('button', { className: 'month-selector' }, CK.MONTHS[now.getMonth()] + ' ' + now.getFullYear() + ' ▾')
    ),
    h('div', { className: 'stats-grid' },
      [
        ['Общий баланс', CK.formatMoney(totalBalance), (balanceChange >= 0 ? '+' : '') + CK.formatMoney(Math.abs(balanceChange)) + ' за месяц', balanceChange >= 0 ? 'positive' : 'negative'],
        ['Доходы', CK.formatMoney(totalIncome), '+8 000 vs май', 'positive'],
        ['Расходы', CK.formatMoney(totalExpense), '+14 200 vs май', 'negative'],
        ['Остаток бюджета', CK.formatMoney(Math.max(0, budgetStats.remaining)), budgetStats.percent + '% использовано', budgetStats.percent > 100 ? 'negative' : 'positive']
      ].map(([label, value, change, cls], i) =>
        h('div', { key: i, className: 'stat-card' },
          h('div', { className: 'stat-label' }, label),
          h('div', { className: 'stat-value' }, value),
          h('div', { className: 'stat-change ' + cls }, change)
        )
      )
    ),
    h('div', { className: 'safe-banner' },
      h('div', { className: 'safe-icon', dangerouslySetInnerHTML: { __html: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' } }),
      h('div', { className: 'safe-text' },
        h('div', { className: 'safe-label' }, 'Безопасно тратить в день'),
        h('div', { className: 'safe-value' }, CK.formatMoney(safeData.perDay)),
        h('div', { className: 'safe-note' }, CK.formatMoney(Math.max(0, budgetStats.remaining)) + ' / ' + safeData.daysLeft + ' оставшихся дней')
      )
    ),
    h('div', { className: 'content-grid', style: { marginTop: '24px' } },
      h('div', { className: 'panel' },
        h('div', { className: 'panel-header' },
          h('span', { className: 'panel-title' }, 'Расходы по категориям'),
          h('a', { href: '#/analytics', className: 'panel-link' }, 'Все →')
        ),
        h('div', { className: 'chart-container' },
          h('svg', { className: 'pie-chart', viewBox: '0 0 42 42', role: 'img', 'aria-label': 'Расходы по категориям' },
            h('circle', { cx: 21, cy: 21, r: 15.9, fill: 'none', stroke: 'var(--surface)', strokeWidth: 6 }),
            pieData.segments.map((seg: any, i: number) =>
              h('circle', { key: i, cx: 21, cy: 21, r: 15.9, fill: 'none', stroke: seg.color, strokeWidth: 6, strokeDasharray: seg.pct + ' ' + (100 - seg.pct), strokeDashoffset: seg.offset, strokeLinecap: 'round' })
            )
          ),
          h('div', { className: 'chart-legend' },
            expenseByCategory.slice(0, 5).map((entry: any, i: number) =>
              h('div', { key: i, className: 'legend-item' },
                h('div', { className: 'legend-dot', style: { background: CK.CHART_COLORS[i % CK.CHART_COLORS.length] } }),
                h('span', { className: 'legend-label' }, entry.category.name),
                h('span', { className: 'legend-value' }, CK.formatMoney(entry.amount))
              )
            )
          )
        )
      ),
      h('div', { className: 'panel' },
        h('div', { className: 'panel-header' },
          h('span', { className: 'panel-title' }, 'Топ категорий'),
          h('a', { href: '#/budget', className: 'panel-link' }, 'Лимиты →')
        ),
        h('div', { className: 'category-list' },
          expenseByCategory.slice(0, 4).map((entry: any, i: number) => {
            const limit = state.budget.limits.find((l: any) => l.categoryId === entry.category.id);
            const pct = limit ? Math.min(100, Math.round((entry.amount / limit.limit) * 100)) : 0;
            const isOver = limit && entry.amount > limit.limit;
            return h('div', { key: i, className: 'category-row' },
              h('div', { className: 'category-icon', style: { background: entry.category.color } }, entry.category.emoji),
              h('div', { className: 'category-info' },
                h('div', { className: 'category-name' }, entry.category.name),
                h('div', { className: 'category-bar' },
                  h('div', { className: 'category-bar-fill', style: { width: pct + '%', background: isOver ? 'var(--danger)' : pct > 85 ? 'var(--accent-secondary)' : 'var(--accent)' } })
                )
              ),
              h('div', { className: 'category-amount', dangerouslySetInnerHTML: { __html: CK.formatMoney(entry.amount) + '<br><span style="font-size:11px;color:' + (isOver ? 'var(--danger)' : 'var(--muted)') + ';font-weight:400">' + (limit ? (isOver ? 'превышен' : 'из ' + CK.formatMoney(limit.limit)) : '') + '</span>' } })
            );
          })
        )
      )
    ),
    h('div', { className: 'panel' },
      h('div', { className: 'panel-header' },
        h('span', { className: 'panel-title' }, 'Ближайшие регулярные платежи'),
        h('a', { href: '#/transactions', className: 'panel-link' }, 'Все →')
      ),
      recurring.length === 0
        ? h(CK.EmptyState, { icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>', title: 'Нет регулярных платежей', text: 'Создайте регулярную операцию в транзакциях' })
        : h('div', { className: 'recurring-list' },
            recurring.slice(0, 4).map((tx: any) => {
              const d = new Date(tx.date);
              return h('div', { key: tx.id, className: 'recurring-item' },
                h('div', { className: 'recurring-date' },
                  h('div', { className: 'recurring-day' }, String(d.getDate()).padStart(2, '0')),
                  h('div', { className: 'recurring-month' }, CK.MONTHS[d.getMonth()])
                ),
                h('div', { className: 'recurring-info' },
                  h('div', { className: 'recurring-name' }, tx.description),
                  h('div', { className: 'recurring-period' }, CK.FREQ_LABELS[tx.frequency] || 'Ежемесячно')
                ),
                h('div', { className: 'recurring-amount' }, '-' + CK.formatMoney(tx.amount))
              );
            })
          )
    )
  );
}

CK.LoginPage = LoginPage;
CK.DashboardPage = DashboardPage;
