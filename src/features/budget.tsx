const CK = (window as any).CK;
const h = React.createElement;
const { useState } = React;

function BudgetPage() {
  const state = CK.useStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [topupGoalId, setTopupGoalId] = useState(null as string | null);

  const budgetStats = CK.getBudgetStats(state.transactions, state.budget);
  const budgetBarClass = budgetStats.percent > 100 ? 'over' : budgetStats.percent > 80 ? 'warn' : 'ok';

  return h(CK.AppShell, { activePage: 'budget', state },
    h(CK.PageHeader, { title: 'Бюджет' },
      h(CK.Button, { onClick: () => setShowEditModal(true) }, 'Редактировать'),
      h(CK.Button, { variant: 'primary', onClick: () => setShowGoalModal(true), dangerouslySetInnerHTML: { __html: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Новая цель' })
    ),
    h('div', { className: 'budget-overview' },
      h('div', { className: 'budget-header' },
        h('div', null,
          h('div', { style: { fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' } }, 'Месячный бюджет'),
          h('div', { className: 'budget-amount' }, CK.formatMoney(state.budget.monthly))
        ),
        h('div', { className: 'budget-percent' }, budgetStats.percent + '%')
      ),
      h('div', { className: 'budget-bar' },
        h('div', { className: 'budget-bar-fill ' + budgetBarClass, style: { width: Math.min(100, budgetStats.percent) + '%' } })
      ),
      h('div', { className: 'budget-meta' }, 'Использовано ' + CK.formatMoney(budgetStats.totalExpense) + ' из ' + CK.formatMoney(state.budget.monthly))
    ),
    h('div', { className: 'section-header' },
      h('span', { className: 'section-title' }, 'Лимиты по категориям')
    ),
    h('div', { className: 'limits-list' },
      state.budget.limits.map((limit: any) => {
        const cat = CK.store.getCategoryById(limit.categoryId);
        if (!cat) return null;
        const stats = CK.getLimitStats(state.transactions, limit);
        return h('div', { key: limit.categoryId, className: 'limit-row' },
          h('div', { className: 'limit-icon', style: { background: cat.color } }, cat.emoji),
          h('div', { className: 'limit-info' },
            h('div', { className: 'limit-name' }, cat.name),
            h('div', { className: 'limit-bar' },
              h('div', { className: 'limit-bar-fill', style: { width: stats.percent + '%', background: stats.isOver ? 'var(--danger)' : stats.percent > 85 ? 'var(--accent-secondary)' : 'var(--accent)' } })
            )
          ),
          h('div', { className: 'limit-amounts', dangerouslySetInnerHTML: { __html: '<div style="font-weight:700;color:' + (stats.isOver ? 'var(--danger)' : 'var(--fg)') + '">' + CK.formatMoney(stats.spent) + ' / ' + CK.formatMoney(limit.limit) + '</div><div style="font-size:11px;color:var(--muted)">' + stats.percent + '%</div>' } })
        );
      })
    ),
    h('div', { className: 'section-header' },
      h('span', { className: 'section-title' }, 'Цели накопления')
    ),
    h('div', { className: 'goals-grid' },
      state.goals.length === 0
        ? h(CK.EmptyState, { icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>', title: 'Нет целей накопления', text: 'Создайте первую цель, чтобы отслеживать прогресс' })
        : state.goals.map((goal: any) => {
            const pct = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
            const days = CK.getGoalDaysLeft(goal.deadline);
            return h('div', { key: goal.id, className: 'goal-card' },
              h('div', { className: 'goal-header' },
                h('div', { className: 'goal-icon', style: { background: goal.color } }, goal.emoji),
                h('div', null,
                  h('div', { className: 'goal-name' }, goal.name),
                  h('div', { className: 'goal-deadline' }, days > 0 ? days + ' дн. до цели' : 'Дедлайн прошёл')
                )
              ),
              h('div', { className: 'goal-amounts' },
                h('span', { className: 'goal-current' }, CK.formatMoney(goal.current)),
                h('span', { className: 'goal-target' }, 'из ' + CK.formatMoney(goal.target))
              ),
              h('div', { className: 'goal-bar' },
                h('div', { className: 'goal-bar-fill', style: { width: Math.min(100, pct) + '%' } })
              ),
              h('div', { className: 'goal-actions' },
                h(CK.Button, { size: 'sm', onClick: () => setTopupGoalId(goal.id) }, 'Пополнить'),
                h('span', { style: { fontSize: '12px', color: 'var(--muted)', alignSelf: 'center' } }, pct + '%')
              )
            );
          })
    ),
    showEditModal && h(EditBudgetModal, { onClose: () => setShowEditModal(false) }),
    showGoalModal && h(AddGoalModal, { onClose: () => setShowGoalModal(false) }),
    topupGoalId && h(TopupGoalModal, { goalId: topupGoalId, onClose: () => setTopupGoalId(null) })
  );
}

function EditBudgetModal(props: any) {
  const state = CK.useStore();
  const [monthly, setMonthly] = useState(String(state.budget.monthly));
  const [limits, setLimits] = useState(JSON.parse(JSON.stringify(state.budget.limits)));
  const [showAdd, setShowAdd] = useState(false);
  const [addCatId, setAddCatId] = useState('');
  const [addAmount, setAddAmount] = useState('');

  const handleAddLimit = () => {
    if (!addCatId || !addAmount) return;
    setLimits([...limits, { categoryId: addCatId, limit: CK.parseAmount(addAmount) }]);
    setShowAdd(false);
    setAddCatId('');
    setAddAmount('');
  };

  const handleSave = () => {
    CK.store.updateBudget({ monthly: CK.parseAmount(monthly), limits });
    props.onClose();
  };

  const available = CK.getAvailableCategories(state.categories, limits);

  return h(CK.Modal, { title: 'Редактировать бюджет', onClose: props.onClose, footer: h(React.Fragment, null,
    h(CK.Button, { onClick: props.onClose }, 'Отмена'),
    h(CK.Button, { variant: 'primary', onClick: handleSave }, 'Сохранить')
  )},
    h('div', { className: 'form-group' },
      h('label', { className: 'form-label' }, 'Месячный бюджет'),
      h('input', { type: 'text', className: 'form-input', value: monthly, inputMode: 'numeric', onChange: (e: any) => setMonthly(e.target.value) })
    ),
    h('div', { className: 'form-group' },
      h('label', { className: 'form-label' }, 'Лимиты по категориям'),
      limits.map((limit: any, i: number) => {
        const cat = CK.store.getCategoryById(limit.categoryId);
        return h('div', { key: i, className: 'limit-edit-row' },
          h('span', { className: 'limit-edit-name' }, cat ? cat.emoji + ' ' + cat.name : limit.categoryId),
          h('input', { type: 'text', className: 'limit-edit-input', value: String(limit.limit), inputMode: 'numeric', onInput: (e: any) => {
            const updated = [...limits];
            updated[i] = { ...updated[i], limit: CK.parseAmount(e.target.value) };
            setLimits(updated);
          }})
        );
      }),
      showAdd
        ? h('div', { className: 'add-limit-row' },
            h('select', { className: 'form-select', value: addCatId, onChange: (e: any) => setAddCatId(e.target.value) },
              h('option', { value: '' }, 'Выберите категорию'),
              available.map((c: any) => h('option', { key: c.id, value: c.id }, c.emoji + ' ' + c.name))
            ),
            h('input', { type: 'text', className: 'form-input', placeholder: 'Лимит ₽', inputMode: 'numeric', onInput: (e: any) => setAddAmount(e.target.value) }),
            h('div', { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end' } },
              h(CK.Button, { size: 'sm', onClick: () => setShowAdd(false) }, 'Отмена'),
              h(CK.Button, { size: 'sm', variant: 'primary', onClick: handleAddLimit }, 'Добавить')
            )
          )
        : h(CK.Button, { style: { width: '100%', marginTop: '8px', borderStyle: 'dashed' }, onClick: () => setShowAdd(true), dangerouslySetInnerHTML: { __html: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Добавить категорию' })
    )
  );
}

function AddGoalModal(props: any) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('✈️');
  const [color, setColor] = useState(CK.COLORS[3]);
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSave = () => {
    const t = CK.parseAmount(target);
    if (!name.trim() || t <= 0) return;
    CK.store.addGoal({ name: name.trim(), emoji, color, target: t, current: CK.parseAmount(current), deadline });
    props.onClose();
  };

  return h(CK.Modal, { title: 'Новая цель накопления', onClose: props.onClose, footer: h(React.Fragment, null,
    h(CK.Button, { onClick: props.onClose }, 'Отмена'),
    h(CK.Button, { variant: 'primary', onClick: handleSave }, 'Создать')
  )},
    h('div', { className: 'form-group' },
      h('label', { className: 'form-label' }, 'Название'),
      h('input', { type: 'text', className: 'form-input', placeholder: 'Отпуск в Турции', value: name, onChange: (e: any) => setName(e.target.value) })
    ),
    h('div', { className: 'form-group' },
      h('label', { className: 'form-label' }, 'Эмодзи'),
      h('div', { className: 'emoji-grid' },
        CK.EMOJIS.slice(0, 16).map(e =>
          h('button', { key: e, type: 'button', className: 'emoji-btn' + (emoji === e ? ' selected' : ''), onClick: () => setEmoji(e) }, e)
        )
      )
    ),
    h('div', { className: 'form-group' },
      h('label', { className: 'form-label' }, 'Цвет'),
      h('div', { className: 'color-grid' },
        CK.COLORS.map(c =>
          h('button', { key: c, type: 'button', className: 'color-btn' + (color === c ? ' selected' : ''), style: { background: c }, onClick: () => setColor(c) })
        )
      )
    ),
    h('div', { className: 'form-row' },
      h('div', { className: 'form-group' },
        h('label', { className: 'form-label' }, 'Сумма цели'),
        h('input', { type: 'text', className: 'form-input', placeholder: '150 000', inputMode: 'numeric', value: target, onChange: (e: any) => setTarget(e.target.value) })
      ),
      h('div', { className: 'form-group' },
        h('label', { className: 'form-label' }, 'Уже накоплено'),
        h('input', { type: 'text', className: 'form-input', placeholder: '0', inputMode: 'numeric', value: current, onChange: (e: any) => setCurrent(e.target.value) })
      )
    ),
    h('div', { className: 'form-group' },
      h('label', { className: 'form-label' }, 'Дедлайн'),
      h('input', { type: 'date', className: 'form-input', value: deadline, onChange: (e: any) => setDeadline(e.target.value) })
    )
  );
}

function TopupGoalModal(props: any) {
  const state = CK.useStore();
  const goal = state.goals.find((g: any) => g.id === props.goalId);
  const [preset, setPreset] = useState(null as number | null);
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(state.accounts.filter((a: any) => !a.archived)[0]?.id || '');

  if (!goal) return null;

  const handleTopup = () => {
    const topupAmount = preset || CK.parseAmount(amount);
    if (!topupAmount || topupAmount <= 0) return;
    CK.store.contributeToGoal(props.goalId, topupAmount, accountId);
    props.onClose();
  };

  const presets = [1000, 5000, 10000, 25000];

  return h(CK.Modal, { title: 'Пополнить: ' + goal.name, onClose: props.onClose, footer: h(React.Fragment, null,
    h(CK.Button, { onClick: props.onClose }, 'Отмена'),
    h(CK.Button, { variant: 'primary', onClick: handleTopup }, 'Пополнить')
  )},
    h('div', { style: { marginBottom: '16px', padding: '16px', background: 'var(--surface)', borderRadius: 'var(--radius)' } },
      h('div', { style: { fontSize: '12px', color: 'var(--muted)' } }, 'Осталось'),
      h('div', { style: { fontSize: '20px', fontWeight: '700', fontFamily: 'var(--font-display)' } }, CK.formatMoney(Math.max(0, goal.target - goal.current)))
    ),
    h('div', { className: 'form-group' },
      h('label', { className: 'form-label' }, 'Источник'),
      h('select', { className: 'form-select', value: accountId, onChange: (e: any) => setAccountId(e.target.value) },
        state.accounts.filter((a: any) => !a.archived).map((a: any) =>
          h('option', { key: a.id, value: a.id }, a.name + ' — ' + CK.formatMoney(a.balance))
        )
      )
    ),
    h('div', { className: 'form-group' },
      h('label', { className: 'form-label' }, 'Быстрый выбор'),
      h('div', { className: 'presets' },
        presets.map(p =>
          h('button', { key: p, className: 'preset-btn' + (preset === p ? ' selected' : ''), onClick: () => { setPreset(p); setAmount(''); } }, CK.formatMoney(p))
        )
      )
    ),
    h('div', { className: 'form-group' },
      h('label', { className: 'form-label' }, 'Своя сумма'),
      h('input', { type: 'text', className: 'form-input', placeholder: '0 ₽', inputMode: 'numeric', value: amount, onChange: (e: any) => { setAmount(e.target.value); setPreset(null); } })
    )
  );
}

CK.BudgetPage = BudgetPage;
