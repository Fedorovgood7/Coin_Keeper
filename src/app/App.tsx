(function() {
  var CK = (window as any).CK;
  var h = (React as any).createElement;
  var useState = (React as any).useState;
  var useEffect = (React as any).useEffect;

  var ROUTES: Record<string, any> = {
    '/login': 'LoginPage',
    '/dashboard': 'DashboardPage',
    '/transactions': 'TransactionsPage',
    '/accounts': 'AccountsPage',
    '/analytics': 'AnalyticsPage',
    '/budget': 'BudgetPage'
  };

  function getRoute(): string {
    var hash = window.location.hash.replace('#', '') || '/login';
    return hash;
  }

  function App() {
    var state = CK.useStore();
    var route = getRoute();

    useEffect(function() {
      function onHashChange() {
        forceUpdate();
      }
      window.addEventListener('hashchange', onHashChange);
      return function() { window.removeEventListener('hashchange', onHashChange); };
    }, []);

    var [, setTick] = useState(0);
    function forceUpdate() { setTick(function(n: number) { return n + 1; }); }

    if (!state.auth && route !== '/login') {
      window.location.hash = '#/login';
      return null;
    }
    if (state.auth && route === '/login') {
      window.location.hash = '#/dashboard';
      return null;
    }

    var componentName = ROUTES[route];
    if (!componentName || !CK[componentName]) {
      return h('div', { style: { padding: '40px', textAlign: 'center', color: 'var(--muted)' } },
        h('p', null, 'Страница не найдена'),
        h('a', { href: '#/dashboard', style: { color: 'var(--accent-secondary)' } }, 'Перейти на дашборд')
      );
    }

    return h(CK[componentName]);
  }

  CK.App = App;

  CK.render = function(containerId: string) {
    var container = document.getElementById(containerId);
    if (!container) return;
    (ReactDOM as any).createRoot(container).render(h(App));
  };
})();
