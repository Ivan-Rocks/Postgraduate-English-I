window.__ModuleLoader__.load({
  id: '@local/postgraduate-english-i',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const UNITS_URL = '/postgraduate-english-i/units';
    const DEFAULT_BUDGET_MIN = 15;
    const TYPE_LABEL = {
      'main-idea': '主旨',
      'vocabulary-in-context': '词义',
      'reference': '指代',
      'logic-link': '逻辑衔接',
      'detail': '细节',
      'inference': '推断',
      'attitude': '态度',
    };
    const KIND_LABEL = { sentence: '造句', scenario: '场景', rewrite: '仿写' };
    const SUFFIXES = ['s', 'es', 'ed', 'd', 'ing', 'n'];

    const CARD_CSS = [
      '.pe-card{margin:0 0 8px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:14px;line-height:1.55;overflow:hidden}',
      '.pe-head{display:flex;align-items:center;gap:8px;padding:8px 12px;flex-wrap:wrap}',
      '.pe-title{font-weight:600;font-size:13px}',
      '.pe-badge{font-size:11px;color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l2);border-radius:999px;padding:0 6px}',
      '.pe-grow{flex:1}',
      '.pe-btn{font:inherit;font-size:12px;color:var(--dsw-alias-label-secondary);background:transparent;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:2px 8px;cursor:pointer}',
      '.pe-btn:hover{background:var(--dsw-alias-bg-layer-2)}',
      '.pe-btn:disabled{opacity:.4;cursor:default}',
      '.pe-select{font:inherit;font-size:12px;color:inherit;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:2px 6px}',
      '.pe-timer{font:inherit;font-size:12px;color:var(--dsw-alias-label-secondary);background:transparent;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:2px 8px;cursor:pointer}',
      '.pe-timer.pe-warn{color:var(--dsw-alias-state-warn-primary);border-color:var(--dsw-alias-state-warn-primary)}',
      '.pe-timer.pe-over{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary)}',
      '.pe-body{padding:0 12px 12px;max-height:46vh;overflow-y:auto}',
      '.pe-passage{margin:0 0 10px;white-space:pre-wrap}',
      '.pe-strong{color:var(--dsw-alias-brand-primary);font-weight:600}',
      '.pe-vocab{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}',
      '.pe-chip{font-size:12px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:1px 6px;color:var(--dsw-alias-label-secondary)}',
      '.pe-qhead{font-size:12px;color:var(--dsw-alias-label-secondary);margin-bottom:4px}',
      '.pe-stem{font-weight:600;margin-bottom:8px}',
      '.pe-options{display:grid;gap:6px}',
      '.pe-option{display:flex;gap:8px;text-align:left;width:100%;padding:6px 8px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:transparent;color:inherit;cursor:pointer;font:inherit}',
      '.pe-option:hover{background:var(--dsw-alias-bg-layer-2)}',
      '.pe-key{font-weight:700;color:var(--dsw-alias-brand-primary);min-width:14px}',
      '.pe-nav{display:flex;align-items:center;gap:8px;margin-top:8px}',
      '.pe-hint{font-size:12px;color:var(--dsw-alias-label-secondary);margin-left:auto}',
      '.pe-trans-item{margin-bottom:8px}',
      '.pe-trans-source{font-size:13px;margin-bottom:4px}',
      '.pe-reference{font-size:13px;color:var(--dsw-alias-label-secondary);margin:6px 0 0;padding:6px 8px;background:var(--dsw-alias-bg-layer-2);border-radius:8px}',
      '.pe-points{margin:6px 0 0;padding-left:18px;font-size:12px;color:var(--dsw-alias-label-secondary)}',
      '.pe-task-head{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-bottom:4px}',
      '.pe-kind{font-size:11px;color:var(--dsw-alias-brand-primary);border:1px solid var(--dsw-alias-brand-primary);border-radius:6px;padding:0 5px}',
      '.pe-task-prompt{font-size:13px;margin-bottom:4px}',
      '.pe-task-hint{font-size:12px;color:var(--dsw-alias-label-secondary);margin-bottom:4px}',
      '.pe-task-actions{display:flex;gap:6px;margin-top:4px}',
      '.pe-error{color:var(--dsw-alias-state-error-primary)}',
    ].join('\n');

    function mmss(totalSeconds) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    }

    function escapeReg(value) {
      return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function wordForms(word) {
      const text = String(word || '').trim();
      if (!text) return null;
      return text.split(/\s+/).map((token) => {
        const base = escapeReg(token);
        const forms = SUFFIXES.map((suffix) => base + escapeReg(suffix));
        forms.push(base);
        return '(?:' + forms.join('|') + ')';
      }).join('\\s+');
    }

    function highlight(passage, vocab) {
      const text = String(passage || '');
      const forms = (Array.isArray(vocab) ? vocab : [])
        .map((item) => wordForms(item && item.word))
        .filter(Boolean);
      if (!forms.length) return [text];
      let pattern;
      try {
        pattern = new RegExp('(' + forms.join('|') + ')', 'gi');
      } catch {
        return [text];
      }
      const out = [];
      let last = 0;
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match.index > last) out.push(text.slice(last, match.index));
        out.push(h('strong', { key: 'v' + out.length, className: 'pe-strong' }, match[0]));
        last = match.index + match[0].length;
      }
      if (last < text.length) out.push(text.slice(last));
      return out;
    }

    function ReadingCard(props) {
      const inputActions = props.inputActions;
      const [load, setLoad] = React.useState({ status: 'loading', units: [], error: null });
      const [unitIndex, setUnitIndex] = React.useState(0);
      const [step, setStep] = React.useState(0);
      const [open, setOpen] = React.useState(true);
      const [seconds, setSeconds] = React.useState(0);
      const [revealed, setRevealed] = React.useState({});
      const [revealedOutput, setRevealedOutput] = React.useState({});
      const [reloadKey, setReloadKey] = React.useState(0);
      const currentIdRef = React.useRef(null);

      // Re-read the unit list on mount, on the refresh button, and when the page
      // becomes visible again, so a newly added unit appears without a page reload.
      React.useEffect(() => {
        let alive = true;
        const wanted = currentIdRef.current;
        setLoad((previous) => (previous.units.length ? previous : { status: 'loading', units: [], error: null }));
        fetch(UNITS_URL, { headers: { accept: 'application/json' } })
          .then((response) => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
          })
          .then((data) => {
            if (!alive) return;
            const units = Array.isArray(data.units) ? data.units : [];
            setLoad({ status: 'ready', units, error: null });
            if (wanted) {
              const next = units.findIndex((item) => item.id === wanted);
              setUnitIndex(next >= 0 ? next : 0);
            }
          })
          .catch((error) => {
            if (!alive) return;
            setLoad((previous) => (previous.units.length
              ? previous
              : { status: 'error', units: [], error: String(error && error.message || error) }));
          });
        return () => { alive = false; };
      }, [reloadKey]);

      React.useEffect(() => {
        const bump = () => setReloadKey((value) => value + 1);
        const onVisible = () => { if (!document.hidden) bump(); };
        window.addEventListener('focus', bump);
        document.addEventListener('visibilitychange', onVisible);
        return () => {
          window.removeEventListener('focus', bump);
          document.removeEventListener('visibilitychange', onVisible);
        };
      }, []);

      React.useEffect(() => {
        const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
        return () => clearInterval(timer);
      }, []);

      React.useEffect(() => {
        setSeconds(0);
        setRevealed({});
        setRevealedOutput({});
        setStep(0);
      }, [unitIndex]);

      const unit = load.units[unitIndex];
      React.useEffect(() => {
        currentIdRef.current = unit ? unit.id : null;
      }, [unit]);

      const passageNodes = React.useMemo(
        () => (unit ? highlight(unit.passage, unit.vocab) : []),
        [unit],
      );

      const headBase = (title) => h('div', { className: 'pe-head', key: 'head' }, [
        h('span', { className: 'pe-title', key: 't' }, title),
        h('span', { className: 'pe-grow', key: 'g' }),
      ]);

      if (load.status === 'loading') {
        return h('div', { className: 'pe-card' }, [
          h('style', { key: 's' }, CARD_CSS),
          headBase('阅读练习'),
          h('div', { className: 'pe-head', key: 'status' }, [
            h('span', { className: 'pe-hint', key: 'h' }, '加载中…'),
          ]),
        ]);
      }
      if (load.status === 'error') {
        return h('div', { className: 'pe-card' }, [
          h('style', { key: 's' }, CARD_CSS),
          headBase('阅读练习'),
          h('div', { className: 'pe-head', key: 'status' }, [
            h('span', { className: 'pe-hint pe-error', key: 'e' }, '单元加载失败：' + load.error),
            h('button', {
              key: 'retry',
              type: 'button',
              className: 'pe-btn',
              onClick: () => setReloadKey((value) => value + 1),
            }, '重试'),
          ]),
        ]);
      }
      if (!unit) {
        return h('div', { className: 'pe-card' }, [
          h('style', { key: 's' }, CARD_CSS),
          headBase('阅读练习'),
          h('div', { className: 'pe-head', key: 'status' }, [
            h('span', { className: 'pe-hint', key: 'h' }, '没有可用单元'),
            h('button', {
              key: 'retry',
              type: 'button',
              className: 'pe-btn',
              onClick: () => setReloadKey((value) => value + 1),
            }, '刷新'),
          ]),
        ]);
      }

      const budgetMin = Number(unit.timeBudgetMin) > 0 ? Number(unit.timeBudgetMin) : DEFAULT_BUDGET_MIN;
      const budget = budgetMin * 60;
      const warn = seconds >= Math.floor(budget * 0.8);
      const over = seconds >= budget;
      const quiz = Array.isArray(unit.quiz) ? unit.quiz : [];
      const translation = unit.translation && Array.isArray(unit.translation.items) ? unit.translation.items : [];
      const output = unit.output && Array.isArray(unit.output.tasks) ? unit.output.tasks : [];
      const totalSteps = quiz.length + translation.length + output.length;
      const safeStep = Math.min(step, Math.max(0, totalSteps - 1));
      const inQuiz = safeStep < quiz.length;
      const inTrans = !inQuiz && safeStep < quiz.length + translation.length;
      const progressLabel = inQuiz
        ? '题目 · ' + (TYPE_LABEL[(quiz[safeStep] && quiz[safeStep].type) || ''] || (quiz[safeStep] && quiz[safeStep].type) || '')
        : inTrans ? '翻译' : '输出';

      const fillTask = (task) => {
        if (!inputActions || typeof inputActions.setDraft !== 'function') return;
        const kind = KIND_LABEL[task.kind] || task.kind;
        const targets = (task.targets || []).join('、');
        inputActions.setDraft(targets ? kind + '（' + targets + '）：' : kind + '：');
      };

      let current = null;
      if (inQuiz) {
        const question = quiz[safeStep];
        current = question
          ? h('div', { key: 'quiz' }, [
            h('div', { className: 'pe-stem', key: 'st' }, question.stem || ''),
            h('div', { className: 'pe-options', key: 'op' }, (question.options || []).map((option) => h(
              'button',
              {
                key: option.key,
                type: 'button',
                className: 'pe-option',
                onClick: () => {
                  if (inputActions && typeof inputActions.setDraft === 'function') {
                    inputActions.setDraft('选 ' + option.key + '：' + option.text + '（信心：确定 / 犹豫 / 猜）');
                  }
                },
              },
              [
                h('span', { className: 'pe-key', key: 'k' }, option.key),
                h('span', { key: 'x' }, option.text),
              ],
            ))),
          ])
          : null;
      } else if (inTrans) {
        const item = translation[safeStep - quiz.length];
        current = item
          ? h('div', { className: 'pe-trans-item', key: item.id }, [
            h('div', { className: 'pe-trans-source', key: 's' }, item.source),
            h('button', {
              key: 'r',
              type: 'button',
              className: 'pe-btn',
              onClick: () => setRevealed((map) => ({ ...map, [item.id]: !map[item.id] })),
            }, revealed[item.id] ? '收起参考' : '看参考'),
            revealed[item.id]
              ? h('div', { key: 'ref' }, [
                h('div', { className: 'pe-reference', key: 'rf' }, item.reference),
                (item.points || []).length
                  ? h('ul', { className: 'pe-points', key: 'p' }, item.points.map((point, index) => h('li', { key: index }, point)))
                  : null,
              ])
              : null,
          ])
          : null;
      } else {
        const task = output[safeStep - quiz.length - translation.length];
        current = task
          ? h('div', { className: 'pe-task', key: task.id }, [
            h('div', { className: 'pe-task-head', key: 'h' }, [
              h('span', { className: 'pe-kind', key: 'k' }, KIND_LABEL[task.kind] || task.kind),
              ...(task.targets || []).map((target, index) => h('span', { className: 'pe-chip', key: 'c' + index }, target)),
            ]),
            h('div', { className: 'pe-task-prompt', key: 'p' }, task.prompt),
            task.hint ? h('div', { className: 'pe-task-hint', key: 'hint' }, '提示：' + task.hint) : null,
            h('div', { className: 'pe-task-actions', key: 'a' }, [
              h('button', {
                key: 'fill',
                type: 'button',
                className: 'pe-btn',
                onClick: () => fillTask(task),
              }, '填入输入框'),
              h('button', {
                key: 'ref',
                type: 'button',
                className: 'pe-btn',
                onClick: () => setRevealedOutput((map) => ({ ...map, [task.id]: !map[task.id] })),
              }, revealedOutput[task.id] ? '收起参考' : '看参考'),
            ]),
            revealedOutput[task.id]
              ? h('div', { key: 'reveal' }, [
                task.reference ? h('div', { className: 'pe-reference', key: 'rf' }, task.reference) : null,
                (task.checkpoints || []).length
                  ? h('ul', { className: 'pe-points', key: 'cp' }, task.checkpoints.map((point, index) => h('li', { key: index }, point)))
                  : null,
              ])
              : null,
          ])
          : null;
      }

      const head = h('div', { className: 'pe-head', key: 'head' }, [
        h('span', { className: 'pe-title', key: 't' }, unit.title || unit.id || '阅读练习'),
        h('span', { className: 'pe-badge', key: 'b' }, unit.level || ''),
        load.units.length > 1
          ? h('select', {
            key: 'sel',
            className: 'pe-select',
            value: String(unitIndex),
            onChange: (event) => setUnitIndex(Number(event.target.value)),
          }, load.units.map((item, index) => h(
            'option',
            { key: item.id || index, value: String(index) },
            (item.level ? item.level + ' · ' : '') + (item.title || item.id),
          )))
          : null,
        h('span', { className: 'pe-grow', key: 'g' }),
        h('button', {
          key: 'refresh',
          type: 'button',
          className: 'pe-btn',
          title: '重新读取单元列表',
          onClick: () => setReloadKey((value) => value + 1),
        }, '刷新'),
        h('button', {
          key: 'timer',
          type: 'button',
          className: 'pe-timer' + (over ? ' pe-over' : warn ? ' pe-warn' : ''),
          title: '点击重置计时',
          onClick: () => setSeconds(0),
        }, mmss(seconds) + ' / ' + mmss(budget)),
        h('button', {
          key: 'col',
          type: 'button',
          className: 'pe-btn',
          onClick: () => setOpen((value) => !value),
        }, open ? '收起' : '展开'),
      ]);

      const body = open ? h('div', { className: 'pe-body', key: 'body' }, [
        h('p', { className: 'pe-passage', key: 'p' }, passageNodes),
        (unit.vocab || []).length
          ? h('div', { className: 'pe-vocab', key: 'v' }, unit.vocab.map((item, index) => h(
            'span',
            { className: 'pe-chip', key: index },
            item.word,
          )))
          : null,
        totalSteps
          ? h('div', { key: 'step' }, [
            h('div', { className: 'pe-qhead', key: 'h' },
              progressLabel + ' · ' + (safeStep + 1) + ' / ' + totalSteps),
            current,
            h('div', { className: 'pe-nav', key: 'nav' }, [
              h('button', {
                key: 'prev',
                type: 'button',
                className: 'pe-btn',
                disabled: safeStep === 0,
                onClick: () => setStep((value) => Math.max(0, value - 1)),
              }, '上一题'),
              h('button', {
                key: 'next',
                type: 'button',
                className: 'pe-btn',
                disabled: safeStep >= totalSteps - 1,
                onClick: () => setStep((value) => Math.min(totalSteps - 1, value + 1)),
              }, '下一题'),
              h('span', { className: 'pe-hint', key: 'hint' }, '原文常驻在上方；作答后按 Enter 发送'),
            ]),
          ])
          : h('div', { className: 'pe-hint', key: 'empty' }, '该单元没有题目'),
      ]) : null;

      return h('div', { className: 'pe-card' }, [h('style', { key: 's' }, CARD_CSS), head, body]);
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
          name: 'conversation.input.dock',
          id: 'postgraduate-reading',
          order: 5,
        }, ReadingCard));
      },
    };
  },
});
