(function() {
  var FILES = [
    '../src/shared/types.ts',
    '../src/shared/config/constants.ts',
    '../src/shared/lib/utils.ts',
    '../src/shared/store.ts',
    '../src/shared/ui/index.tsx',
    '../src/features/auth-dashboard.tsx',
    '../src/features/transactions.tsx',
    '../src/features/accounts-analytics.tsx',
    '../src/features/budget.tsx',
    '../src/app/App.tsx'
  ];

  for (var i = 0; i < FILES.length; i++) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', FILES[i], false);
      xhr.send('');
      if (xhr.status === 200 || xhr.status === 0) {
        var result = (Babel as any).transform(xhr.responseText, {
          presets: ['typescript', 'react']
        });
        var code = result.code
          .replace(/"use strict";\s*/g, '')
          .replace(/Object\.defineProperty\(exports,.*?\);\s*/g, '')
          .replace(/exports\.\w+\s*=\s*void 0;\s*/g, '')
          .replace(/^export\s+(function|const|let|var|class)\b/gm, '$1');
        var script = document.createElement('script');
        script.textContent = code;
        document.head.appendChild(script);
      } else {
        console.error('Failed to load ' + FILES[i] + ': ' + xhr.status);
      }
    } catch (e) {
      console.error('Error loading ' + FILES[i], e);
    }
  }

  var CK = (window as any).CK;
  if (CK && CK.render) {
    CK.render('root');
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      var CK2 = (window as any).CK;
      if (CK2 && CK2.render) CK2.render('root');
    });
  }
})();
