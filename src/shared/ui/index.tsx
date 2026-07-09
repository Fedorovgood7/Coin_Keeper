const CK = (window as any).CK;
const h = React.createElement;

function Button(props: any) {
  const { variant = 'default', size, icon, children, className = '', ...rest } = props;
  const cls = [
    'btn',
    variant === 'primary' && 'btn-primary',
    variant === 'accent' && 'btn-accent',
    variant === 'danger' && 'btn-danger',
    size === 'sm' && 'btn-sm',
    icon && 'btn-icon',
    className
  ].filter(Boolean).join(' ');
  return h('button', { className: cls, ...rest }, children);
}

function Modal(props: any) {
  const { title, onClose, children, footer } = props;
  return h('div', { className: 'modal-overlay', onClick: (e: any) => { if (e.target === e.currentTarget) onClose(); } },
    h('div', { className: 'modal' },
      h('div', { className: 'modal-header' },
        h('h3', { className: 'modal-title' }, title),
        h('button', { className: 'modal-close', 'aria-label': 'Закрыть', onClick: onClose },
          h('svg', { viewBox: '0 0 24 24' },
            h('line', { x1: 18, y1: 6, x2: 6, y2: 18 }),
            h('line', { x1: 6, y1: 6, x2: 18, y2: 18 })
          )
        )
      ),
      h('div', { className: 'modal-body' }, children),
      footer && h('div', { className: 'modal-footer' }, footer)
    )
  );
}

function Toggle(props: any) {
  const { checked, onChange, label } = props;
  return h('label', { className: 'toggle' },
    h('div', { className: 'toggle-track' + (checked ? ' active' : ''), onClick: () => onChange(!checked) },
      h('div', { className: 'toggle-thumb' })
    ),
    label && h('span', { className: 'toggle-label' }, label)
  );
}

function EmptyState(props: any) {
  const { icon, title, text } = props;
  return h('div', { className: 'empty-state' },
    h('div', { className: 'empty-state-icon', dangerouslySetInnerHTML: { __html: icon } }),
    h('div', { className: 'empty-state-title' }, title),
    h('div', { className: 'empty-state-text' }, text)
  );
}

function ConfirmDialog(props: any) {
  const { title, text, onConfirm, onCancel } = props;
  return h('div', { className: 'confirm-overlay', onClick: (e: any) => { if (e.target === e.currentTarget) onCancel(); } },
    h('div', { className: 'confirm-box' },
      h('div', { className: 'confirm-title' }, title),
      h('div', { className: 'confirm-text' }, text),
      h('div', { className: 'confirm-actions' },
        h(Button, { onClick: onCancel }, 'Отмена'),
        h(Button, { variant: 'danger', onClick: () => { onConfirm(); onCancel(); } }, 'Удалить')
      )
    )
  );
}

function PageHeader(props: any) {
  const { title, children } = props;
  return h('div', { className: 'page-header' },
    h('h1', null, title),
    h('div', { className: 'page-header-actions' }, children)
  );
}

function Sidebar(props: any) {
  const { activePage, profile } = props;
  const items = [
    { id: 'dashboard', label: 'Дашборд', hash: '#/dashboard', icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>' },
    { id: 'transactions', label: 'Транзакции', hash: '#/transactions', icon: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' },
    { id: 'accounts', label: 'Счета', hash: '#/accounts', icon: '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>' },
    { id: 'analytics', label: 'Аналитика', hash: '#/analytics', icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
    { id: 'budget', label: 'Бюджет', hash: '#/budget', icon: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' }
  ];
  return h('aside', { className: 'sidebar' },
    h('a', { href: '#/', className: 'sidebar-logo' }, 'CoinKeeper'),
    h('nav', { className: 'nav' },
      items.map(item =>
        h('a', { key: item.id, href: item.hash, className: activePage === item.id ? 'active' : '' },
          h('svg', { viewBox: '0 0 24 24', dangerouslySetInnerHTML: { __html: item.icon } }),
          item.label
        )
      )
    ),
    h('div', { className: 'sidebar-footer' },
      h('div', { className: 'avatar' }, profile ? profile.initials : '??'),
      h('div', { className: 'user-info' },
        h('strong', null, profile ? profile.name : 'Гость'),
        h('span', null, 'Yandex ID')
      )
    )
  );
}

function MobileNav(props: any) {
  const { activePage } = props;
  const items = [
    { id: 'dashboard', label: 'Главная', hash: '#/dashboard', icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>' },
    { id: 'transactions', label: 'Операции', hash: '#/transactions', icon: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' },
    { id: 'accounts', label: 'Счета', hash: '#/accounts', icon: '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>' },
    { id: 'analytics', label: 'Аналитика', hash: '#/analytics', icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
    { id: 'budget', label: 'Бюджет', hash: '#/budget', icon: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' }
  ];
  return h('nav', { className: 'mobile-nav' },
    h('div', { className: 'mobile-nav-inner' },
      items.map(item =>
        h('a', { key: item.id, href: item.hash, className: activePage === item.id ? 'active' : '' },
          h('svg', { viewBox: '0 0 24 24', dangerouslySetInnerHTML: { __html: item.icon } }),
          item.label
        )
      )
    )
  );
}

function AppShell(props: any) {
  const { activePage, state, children } = props;
  return h('div', { className: 'app' },
    h(Sidebar, { activePage, profile: state.profile }),
    h('main', { className: 'main' }, children),
    h(MobileNav, { activePage })
  );
}

CK.Button = Button;
CK.Modal = Modal;
CK.Toggle = Toggle;
CK.EmptyState = EmptyState;
CK.ConfirmDialog = ConfirmDialog;
CK.PageHeader = PageHeader;
CK.Sidebar = Sidebar;
CK.MobileNav = MobileNav;
CK.AppShell = AppShell;
