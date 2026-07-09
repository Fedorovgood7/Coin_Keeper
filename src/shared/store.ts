const CK = (window as any).CK;

function loadState(): any {
  try {
    const saved = localStorage.getItem('ck_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {}
  return {
    profile: (() => {
      try { const p = localStorage.getItem('ck_profile'); return p ? JSON.parse(p) : null; } catch(e) { return null; }
    })(),
    auth: (() => {
      try { return localStorage.getItem('ck_auth') === '1'; } catch(e) { return false; }
    })(),
    categories: JSON.parse(JSON.stringify(CK.DEFAULT_CATEGORIES)),
    accounts: JSON.parse(JSON.stringify(CK.DEFAULT_ACCOUNTS)),
    transactions: JSON.parse(JSON.stringify(CK.DEFAULT_TRANSACTIONS)),
    goals: JSON.parse(JSON.stringify(CK.DEFAULT_GOALS)),
    budget: JSON.parse(JSON.stringify(CK.DEFAULT_BUDGET))
  };
}

class Store {
  private state: any;
  private listeners: Set<() => void> = new Set();
  private snap: any;

  constructor() {
    this.state = loadState();
    this.snap = { v: 0 };
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): any => {
    return this.state;
  };

  getServerSnapshot = (): any => {
    return this.snap;
  };

  private notify(): void {
    this.persist();
    this.snap = { v: Date.now() };
    this.listeners.forEach(fn => fn());
  }

  private persist(): void {
    try {
      localStorage.setItem('ck_state', JSON.stringify(this.state));
      if (this.state.profile) localStorage.setItem('ck_profile', JSON.stringify(this.state.profile));
      if (this.state.auth) localStorage.setItem('ck_auth', '1');
      else localStorage.removeItem('ck_auth');
    } catch (e) {
      console.warn('localStorage unavailable', e);
    }
  }

  login(): void {
    this.state.auth = true;
    if (!this.state.profile) {
      this.state.profile = {
        name: 'Пользователь',
        initials: 'П',
        email: 'user@yandex.ru',
        currency: 'RUB',
        createdAt: new Date().toISOString()
      };
    }
    this.notify();
  }

  logout(): void {
    this.state.auth = false;
    this.notify();
  }

  addCategory(cat: any): void {
    cat.id = CK.genId();
    this.state.categories.push(cat);
    this.notify();
  }

  addAccount(acc: any): void {
    acc.id = CK.genId();
    this.state.accounts.push(acc);
    this.notify();
  }

  toggleArchiveAccount(id: string): void {
    this.state.accounts = this.state.accounts.map((a: any) =>
      a.id === id ? { ...a, archived: !a.archived } : a
    );
    this.notify();
  }

  addTransaction(tx: any): void {
    tx.id = CK.genId();
    this.state.accounts = this.state.accounts.map((a: any) => {
      if (tx.type === 'income' && a.id === tx.accountId) return { ...a, balance: a.balance + tx.amount };
      if (tx.type === 'expense' && a.id === tx.accountId) return { ...a, balance: a.balance - tx.amount };
      if (tx.type === 'transfer') {
        if (a.id === tx.accountId) return { ...a, balance: a.balance - tx.amount };
        if (a.id === tx.toAccountId) return { ...a, balance: a.balance + tx.amount };
      }
      return a;
    });
    this.state.transactions.unshift(tx);
    this.notify();
  }

  deleteTransaction(id: string): void {
    this.state.transactions = this.state.transactions.filter((t: any) => t.id !== id);
    this.notify();
  }

  addGoal(goal: any): void {
    goal.id = CK.genId();
    this.state.goals.push(goal);
    this.notify();
  }

  contributeToGoal(id: string, amount: number, fromAccountId: string): void {
    this.state.goals = this.state.goals.map((g: any) =>
      g.id === id ? { ...g, current: Math.min(g.current + amount, g.target) } : g
    );
    this.state.accounts = this.state.accounts.map((a: any) =>
      a.id === fromAccountId ? { ...a, balance: a.balance - amount } : a
    );
    this.notify();
  }

  updateBudget(updates: any): void {
    Object.assign(this.state.budget, updates);
    this.notify();
  }

  getCategoryById(id: string): any {
    return this.state.categories.find((c: any) => c.id === id);
  }

  getAccountById(id: string): any {
    return this.state.accounts.find((a: any) => a.id === id);
  }
}

const store = new Store();
CK.store = store;

function useStore(): any {
  return (React as any).useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
}
CK.useStore = useStore;
