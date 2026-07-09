const CK = (window as any).CK;
const h = React.createElement;
const { useState } = React;

function TransactionsPage() {
  const state = CK.useStore();
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null as string | null);

  const filtered = CK.filterTransactions(state.transactions, filterType, filterCategory, filterAccount);
  const dateGroups = CK.groupByDate(filtered);

  const handleExport = () => {
    const csv = CK.exportCSV(filtered, state.categories, state.accounts);
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'transactions.csv';
    a.click();
  };

  return h(CK.AppShell, { activePage: 'transactions', state },
    h(CK.PageHeader, { title: 'Транзакции' },
      h(CK.Button, { onClick: handleExport, dangerouslySetInnerHTML: { __html: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> CSV' }),
      h(CK.Button, { variant: 'primary', onClick: () => setShowModal(true), dangerouslySetInnerHTML: { __html: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Добавить' })
    ),
    h('div', { className: 'filters' },
      h('select', { className: 'filter-select', value: filterAccount, onChange: (e: any) => setFilterAccount(e.target.value) },
        h('option', { value: '' }, 'Все счета'),
        state.accounts.map((a: any) => h('option', { key: a.id, value: a.id }, a.name))
      ),
      h('div', { className: 'filter-separator' }),
      h('div', { className: 'filter-type-tabs' },
        [['all','Все'],['expense','Расход'],['income','Доход'],['transfer','Перевод']].map(([val, label]) =>
          h('button', { key: val, className: 'filter-type-tab' + (filterType === val ? ' active' : ''), onClick: () => { setFilterType(val); setFilterCategory(''); } }, label)
        )
      ),
      h('select', { className: 'filter-select', value: filterCategory, onChange: (e: any) => setFilterCategory(e.target.value) },
        h('option', { value: '' }, 'Все категории'),
        filterType === 'all'
          ? ['expense','income'].map(type => {
              const cats = state.categories.filter((c: any) => c.type === type);
              return h('optgroup', { key: type, label: type === 'expense' ? 'Расход' : 'Доход' },
                cats.map((c: any) => h('option', { key: c.id, value: c.id }, c.emoji + ' ' + c.name))
              );
            })
          : state.categories.filter((c: any) => c.type === filterType).map((c: any) =>
              h('option', { key: c.id, value: c.id }, c.emoji + ' ' + c.name)
            )
      )
    ),
    h('div', { className: 'tx-list' },
      dateGroups.length === 0
        ? h(CK.EmptyState, { icon: '<svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', title: 'Нет операций', text: 'Добавьте первую транзакцию' })
        : dateGroups.map((group: any) => {
            const dayTotal = CK.getDayTotal(group.transactions);
            return h('div', { key: group.date, className: 'tx-date-group' },
              h('div', { className: 'tx-date-header' },
                h('span', null, CK.formatDateFull(group.date)),
                h('span', null, (dayTotal >= 0 ? '+' : '') + CK.formatMoney(dayTotal))
              ),
              group.transactions.map((tx: any) => {
                const cat = CK.store.getCategoryById(tx.categoryId);
                const acc = CK.store.getAccountById(tx.accountId);
                const toAcc = CK.store.getAccountById(tx.toAccountId || '');
                const amountClass = tx.type === 'income' ? 'income' : tx.type === 'transfer' ? 'transfer' : 'expense';
                const prefix = tx.type === 'income' ? '+' : tx.type === 'transfer' ? '' : '-';
                const label = tx.type === 'transfer' ? (acc ? acc.name : '') + ' → ' + (toAcc ? toAcc.name : '') : (cat ? cat.name : '');
                return h('div', { key: tx.id, className: 'tx-item' },
                  h('div', { className: 'tx-icon', style: { background: cat ? cat.color : '#f5f5f5' } }, tx.type === 'transfer' ? '🔄' : (cat ? cat.emoji : '📦')),
                  h('div', { className: 'tx-info' },
                    h('div', { className: 'tx-category' }, label),
                    h('div', { className: 'tx-meta' }, (acc ? acc.name : '') + (tx.description ? ' · ' + tx.description : ''))
                  ),
                  h('div', { className: 'tx-amount ' + amountClass }, prefix + CK.formatMoney(tx.amount)),
                  h('div', { className: 'tx-actions' },
                    h('button', { className: 'tx-action-btn', 'aria-label': 'Удалить', onClick: () => setConfirmDelete(tx.id), dangerouslySetInnerHTML: { __html: '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' } })
                  )
                );
              })
            );
          })
    ),
    showModal && h(AddTransactionModal, { onClose: () => setShowModal(false) }),
    showCatModal && h(AddCategoryModal, { onClose: () => setShowCatModal(false) }),
    confirmDelete && h(CK.ConfirmDialog, {
      title: 'Удалить операцию?',
      text: 'Это действие нельзя отменить.',
      onConfirm: () => CK.store.deleteTransaction(confirmDelete),
      onCancel: () => setConfirmDelete(null)
    })
  );
}

function AddTransactionModal(props: any) {
  const state = CK.useStore();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState(state.accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState('monthly');
  const [error, setError] = useState('');

  const handleSave = () => {
    const parsedAmount = CK.parseAmount(amount);
    const validation = CK.validateTransaction({ amount: parsedAmount, type, categoryId, accountId });
    if (!validation.valid) { setError(validation.error); return; }
    CK.store.addTransaction({
      type, amount: parsedAmount,
      categoryId: type === 'transfer' ? '' : categoryId,
      accountId, toAccountId: type === 'transfer' ? toAccountId : undefined,
      description, date, recurring, frequency: recurring ? frequency : undefined
    });
    props.onClose();
  };

  return h(CK.Modal, { title: 'Новая операция', onClose: props.onClose, footer: h(React.Fragment, null,
    h(CK.Button, { onClick: props.onClose }, 'Отмена'),
    h(CK.Button, { variant: 'primary', onClick: handleSave }, 'Сохранить')
  )},
    h('div', { className: 'type-tabs' },
      [['expense','Расход'],['income','Доход'],['transfer','Перевод']].map(([val, label]) =>
        h('button', { key: val, className: 'type-tab' + (type === val ? ' active' : ''), onClick: () => setType(val) }, label)
      )
    ),
    h('div', { className: 'form-group' },
      h('label', { className: 'form-label' }, 'Сумма'),
      h('input', { type: 'text', className: 'form-input' + (error ? ' error' : ''), placeholder: '0 ₽', inputMode: 'numeric', value: amount, onChange: (e: any) => { setAmount(e.target.value); setError(''); } }),
      error && h('div', { className: 'form-error', role: 'alert' }, error)
    ),
    type !== 'transfer' && h('div', { className: 'form-group' },
      h('label', { className: 'form-label' }, 'Категория'),
      h('div', { className: 'category-row' },
        h('select', { className: 'form-select', value: categoryId, onChange: (e: any) => setCategoryId(e.target.value) },
          h('option', { value: '' }, 'Выберите'),
          state.categories.filter((c: any) => c.type === type).map((c: any) =>
            h('option', { key: c.id, value: c.id }, c.emoji + ' ' + c.name)
          )
        )
      )
    ),
    h('div', { className: 'form-group' },
      h('label', { className: 'form-label' }, 'Счёт'),
      h('select', { className: 'form-select', value: accountId, onChange: (e: any) => setAccountId(e.target.value) },
        state.accounts.map((a: any) => h('option', { key: a.id, value: a.id }, a.name))
      )
    ),
    type === 'transfer' && h('div', { className: 'form-group' },
      h('label', { className: 'form-label' }, 'Счёт назначения'),
      h('select', { className: 'form-select', value: toAccountId, onChange: (e: any) => setToAccountId(e.target.value) },
        state.accounts.map((a: any) => h('option', { key: a.id, value: a.id }, a.name))
      )
    ),
    h('div', { className: 'form-group' },
      h('label', { className: 'form-label' }, recurring ? 'Ближайшая дата списания' : 'Дата'),
      h('input', { type: 'date', className: 'form-input', value: date, onChange: (e: any) => setDate(e.target.value) })
    ),
    h('div', { className: 'form-group' },
      h('label', { className: 'form-label' }, 'Комментарий'),
      h('input', { type: 'text', className: 'form-input', placeholder: 'Необязательно', value: description, onChange: (e: any) => setDescription(e.target.value) })
    ),
    h('div', { className: 'toggle-row' },
      h('span', { className: 'toggle-label' }, 'Регулярный платёж'),
      h(CK.Toggle, { checked: recurring, onChange: setRecurring })
    ),
    recurring && h('div', { className: 'form-group', style: { marginTop: '12px' } },
      h('label', { className: 'form-label' }, 'Частота'),
      h('select', { className: 'form-select', value: frequency, onChange: (e: any) => setFrequency(e.target.value) },
        h('option', { value: 'daily' }, 'Ежедневно'),
        h('option', { value: 'weekly' }, 'Еженедельно'),
        h('option', { value: 'monthly' }, 'Ежемесячно'),
        h('option', { value: 'yearly' }, 'Ежегодно')
      )
    )
  );
}

function AddCategoryModal(props: any) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📦');
  const [color, setColor] = useState(CK.COLORS[0]);

  const handleSave = () => {
    if (!name.trim()) return;
    CK.store.addCategory({ name: name.trim(), emoji, color, type: 'expense' });
    props.onClose();
  };

  return h(CK.Modal, { title: 'Новая категория', onClose: props.onClose, footer: h(React.Fragment, null,
    h(CK.Button, { onClick: props.onClose }, 'Отмена'),
    h(CK.Button, { variant: 'primary', onClick: handleSave }, 'Создать')
  )},
    h('div', { className: 'form-group' },
      h('label', { className: 'form-label' }, 'Название'),
      h('input', { type: 'text', className: 'form-input', placeholder: 'Например: Подписки', value: name, onChange: (e: any) => setName(e.target.value) })
    ),
    h('div', { className: 'form-group' },
      h('label', { className: 'form-label' }, 'Эмодзи'),
      h('div', { className: 'emoji-grid' },
        CK.EMOJIS.map(e =>
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
    )
  );
}

CK.TransactionsPage = TransactionsPage;
