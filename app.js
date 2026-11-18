import './style.css';
import { PRUEBA_SEMANAL, GUIA_EXAMEN, EXAMEN_PRACTICA } from './data.js';

const STORAGE_KEY = 'castellano_1eso_state_v1';

const FIGURA_OPTIONS = [
  'Personificación',
  'Hipérbole',
  'Símil o comparación',
  'Metáfora',
  'Anáfora',
  'Polisíndeton',
  'Ironía',
  'Hipérbaton',
];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        activeTab: parsed.activeTab || 'prueba',
        apellidos: parsed.apellidos || '',
        nombre: parsed.nombre || '',
        inputs: parsed.inputs || {},
        checklist: parsed.checklist || {},
        openTranslations: parsed.openTranslations || {},
        openAnswers: parsed.openAnswers || {},
        openHints: parsed.openHints || {},
        allTranslated: Boolean(parsed.allTranslated),
      };
    }
  } catch {
    // Ignore storage errors
  }
  return {
    activeTab: 'prueba',
    apellidos: '',
    nombre: '',
    inputs: {},
    checklist: {},
    openTranslations: {},
    openAnswers: {},
    openHints: {},
    allTranslated: false,
  };
}

const state = loadState();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatEsText(str) {
  const escaped = escapeHtml(str);
  return escaped.replace(/==(.+?)==/g, '<span class="expr-highlight">$1</span>');
}

function formatHyText(str) {
  const escaped = escapeHtml(str);
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[#1F1209] underline decoration-[#EA580C] underline-offset-4">$1</strong>');
}

function isTranslated(id) {
  return state.allTranslated ? state.openTranslations[id] !== false : Boolean(state.openTranslations[id]);
}

function toggleTranslationState(id) {
  const currentlyOpen = isTranslated(id);
  state.openTranslations[id] = !currentlyOpen;
  saveState();
  return !currentlyOpen;
}

function renderClickableEs({ id, es, hy, tag = 'div', esClass = '', inlineHint = true, formatSpecial = false }) {
  const open = isTranslated(id);
  const esMarkup = formatSpecial ? formatEsText(es) : escapeHtml(es);
  const hyMarkup = formatSpecial ? formatHyText(hy) : escapeHtml(hy);

  return `
    <div class="es-trans-wrapper" data-trans-wrapper="${escapeHtml(id)}">
      <${tag}
        role="button"
        tabindex="0"
        data-trans-id="${escapeHtml(id)}"
        aria-expanded="${open ? 'true' : 'false'}"
        class="es-clickable group px-3 py-2 -mx-3 ${open ? 'is-open' : ''} ${esClass}"
      >
        <span>${esMarkup}</span>
        ${
          inlineHint
            ? `<span class="inline-flex items-center gap-1 ml-2 text-[11px] font-semibold text-[#C2410C] opacity-80 group-hover:opacity-100 select-none align-baseline">
                <span aria-hidden="true">·</span>
                <span data-trans-label>${open ? 'Թաքցնել հայ.' : 'Հայերեն'}</span>
              </span>`
            : ''
        }
      </${tag}>
      <div class="hy-reveal ${open ? '' : 'hidden'}" data-trans-target="${escapeHtml(id)}">
        <div class="text-[11px] font-semibold text-[#B45309] mb-1">Հայերեն թարգմանություն</div>
        <div>${hyMarkup}</div>
      </div>
    </div>
  `;
}

function renderAnswerToggleBtn(ansId, labelClosed = 'Տեսնել պատասխանը · Ver respuesta', labelOpen = 'Թաքցնել պատասխանը · Ocultar respuesta') {
  const isOpen = Boolean(state.openAnswers[ansId]);
  return `
    <button
      type="button"
      data-answer-toggle="${escapeHtml(ansId)}"
      aria-expanded="${isOpen ? 'true' : 'false'}"
      class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
        isOpen
          ? 'bg-[#EA580C] text-white border-[#EA580C] hover:bg-[#C2410C]'
          : 'bg-[#FFFBEB] text-[#9A3412] border-[#F59E0B] hover:bg-[#EA580C] hover:text-white hover:border-[#EA580C]'
      }"
    >
      <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span>${isOpen ? labelOpen : labelClosed}</span>
    </button>
  `;
}

function renderTopBar() {
  const tabs = [
    { id: 'prueba', label: 'Prueba Semanal' },
    { id: 'guia', label: 'Guía de Examen' },
    { id: 'practica', label: 'Examen de Práctica' },
    { id: 'frases', label: 'Frases Útiles' },
  ];

  return `
    <header class="sticky top-0 z-30 bg-gradient-to-r from-[#C2410C] via-[#EA580C] to-[#D97706] border-b border-[#B45309] shadow-sm">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        <a
          href="#top"
          data-nav-tab="prueba"
          class="font-display text-lg font-semibold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-[#FEF08A] transition-colors"
        >
          1.º ESO · Castellano
        </a>

        <nav class="hidden md:flex items-center gap-6 text-sm font-medium" aria-label="Navegación principal">
          ${tabs
            .map(
              (t) => `
            <button
              type="button"
              data-nav-tab="${t.id}"
              class="py-1 whitespace-nowrap shrink-0 cursor-pointer border-b-2 transition-colors ${
                state.activeTab === t.id
                  ? 'border-[#FDE047] text-white font-semibold'
                  : 'border-transparent text-[#FFEDD5] hover:text-white hover:border-[#FDE047]/70'
              }"
            >
              ${t.label}
            </button>
          `
            )
            .join('')}
        </nav>

        <div class="flex items-center gap-3 shrink-0">
          <button
            type="button"
            id="toggleAllTransBtn"
            class="px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs ${
              state.allTranslated
                ? 'bg-[#1F1209] text-[#FDE047] hover:bg-[#3A2210]'
                : 'bg-[#FACC15] text-[#1F1209] hover:bg-[#FDE047]'
            }"
          >
            ${state.allTranslated ? 'Թաքցնել հայերենը' : 'Թարգմանել էջը'}
          </button>
        </div>
      </div>

      <div class="md:hidden border-t border-[#F97316] bg-[#C2410C] overflow-x-auto">
        <div class="flex items-center gap-3 px-4 py-2 text-xs font-medium">
          ${tabs
            .map(
              (t) => `
            <button
              type="button"
              data-nav-tab="${t.id}"
              class="px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 cursor-pointer ${
                state.activeTab === t.id
                  ? 'bg-[#FACC15] text-[#1F1209] font-semibold'
                  : 'text-[#FFEDD5] hover:text-white'
              }"
            >
              ${t.label}
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    </header>
  `;
}

function renderStudentFields() {
  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-[#F59E0B]/50">
      <label class="block">
        <span class="block text-xs font-semibold tracking-wide text-[#9A3412] mb-1.5">APELLIDOS · Ազգանուն</span>
        <input
          type="text"
          id="inputApellidos"
          value="${escapeHtml(state.apellidos)}"
          placeholder="Escribe tus apellidos..."
          class="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#F59E0B] rounded-lg text-sm text-[#1F1209] focus:bg-white focus:outline-none focus:border-[#EA580C]"
        />
      </label>
      <label class="block">
        <span class="block text-xs font-semibold tracking-wide text-[#9A3412] mb-1.5">NOMBRE · Անուն</span>
        <input
          type="text"
          id="inputNombre"
          value="${escapeHtml(state.nombre)}"
          placeholder="Escribe tu nombre..."
          class="w-full px-3.5 py-2.5 bg-[#FFFDF7] border border-[#F59E0B] rounded-lg text-sm text-[#1F1209] focus:bg-white focus:outline-none focus:border-[#EA580C]"
        />
      </label>
    </div>
  `;
}

function renderPruebaSemanal() {
  const d = PRUEBA_SEMANAL;

  const readingHtml = d.paragraphs
    .map((p, idx) =>
      renderClickableEs({
        id: `ps-p-${idx}`,
        es: p.es,
        hy: p.hy,
        esClass: 'text-[17px] sm:text-[18px] leading-[1.85] text-[#140B04]',
        formatSpecial: true,
      })
    )
    .join('<div class="h-3"></div>');

  const questionsHtml = d.preguntasTexto
    .map((q) => {
      const ansId = `ans-${q.id}`;
      const isOpen = Boolean(state.openAnswers[ansId]);

      if (q.subItems) {
        return `
          <article class="bg-[#FFFDF7] border border-[#FCD34D] rounded-xl p-5 sm:p-6">
            <div class="flex items-start gap-2.5 mb-3">
              <span class="font-mono-num text-sm font-bold text-[#EA580C] pt-2">${escapeHtml(q.letter)}</span>
              <div class="flex-1">
                ${renderClickableEs({
                  id: `q-${q.id}`,
                  es: q.es,
                  hy: q.hy,
                  esClass: 'font-semibold text-[#1F1209]',
                })}
              </div>
            </div>

            <div class="space-y-4 mt-4 pl-0 sm:pl-6">
              ${q.subItems
                .map(
                  (sub, idx) => `
                <div class="p-4 bg-[#FFF8DF] border border-[#FBBF24] rounded-lg">
                  ${renderClickableEs({
                    id: `q-${q.id}-sub-${idx}`,
                    es: sub.es,
                    hy: sub.hy,
                    esClass: 'text-sm font-medium text-[#1F1209]',
                  })}
                  <textarea
                    rows="2"
                    data-student-input="${q.id}-sub-${idx}"
                    placeholder="Գրիր բացատրությունդ իսպաներեն..."
                    class="mt-3 w-full px-3 py-2 bg-white border border-[#F59E0B] rounded-lg text-sm text-[#1F1209] focus:outline-none focus:border-[#EA580C]"
                  >${escapeHtml(state.inputs[`${q.id}-sub-${idx}`] || '')}</textarea>
                </div>
              `
                )
                .join('')}
            </div>

            <div class="mt-4 flex flex-wrap items-center gap-3">
              ${renderAnswerToggleBtn(ansId)}
            </div>

            <div class="answer-panel ${isOpen ? '' : 'hidden'}" data-answer-panel="${ansId}">
              <div class="text-xs font-bold text-[#C2410C] mb-2">Respuesta modelo — Պատասխանի օրինակ</div>
              <div class="space-y-3">
                ${q.subItems
                  .map(
                    (sub, idx) => `
                  <div>
                    <div class="text-xs font-semibold text-[#78350F] mb-1">${escapeHtml(sub.es)}</div>
                    ${renderClickableEs({
                      id: `ans-${q.id}-sub-${idx}`,
                      es: sub.answerEs,
                      hy: sub.answerHy,
                      esClass: 'text-sm text-[#1F1209]',
                    })}
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          </article>
        `;
      }

      return `
        <article class="bg-[#FFFDF7] border border-[#FCD34D] rounded-xl p-5 sm:p-6">
          <div class="flex items-start gap-2.5">
            <span class="font-mono-num text-sm font-bold text-[#EA580C] pt-2">${escapeHtml(q.letter)}</span>
            <div class="flex-1">
              ${renderClickableEs({
                id: `q-${q.id}`,
                es: q.es,
                hy: q.hy,
                esClass: 'font-semibold text-[#1F1209]',
              })}
            </div>
          </div>

          <textarea
            rows="3"
            data-student-input="${q.id}"
            placeholder="Գրիր պատասխանդ իսպաներենով (օգտագործիր «porque» և օրինակ տեքստից)..."
            class="mt-3 w-full px-3.5 py-2.5 bg-[#FFFBEB] border border-[#F59E0B] rounded-lg text-sm text-[#1F1209] focus:bg-white focus:outline-none focus:border-[#EA580C]"
          >${escapeHtml(state.inputs[q.id] || '')}</textarea>

          <div class="mt-3 flex flex-wrap items-center gap-3">
            ${renderAnswerToggleBtn(ansId)}
          </div>

          <div class="answer-panel ${isOpen ? '' : 'hidden'}" data-answer-panel="${ansId}">
            <div class="text-xs font-bold text-[#C2410C] mb-2">${escapeHtml(q.answerLabel || 'Respuesta modelo — Պատասխանի օրինակ')}</div>
            ${renderClickableEs({
              id: `ans-text-${q.id}`,
              es: q.answerEs,
              hy: q.answerHy,
              esClass: 'text-[16px] leading-[1.75] text-[#140B04]',
            })}
            ${
              q.checklistItems
                ? `
              <div class="mt-4 pt-3 border-t border-[#FB923C]">
                <div class="text-xs font-semibold text-[#1F1209] mb-2">${escapeHtml(q.checklistTitle)}</div>
                <ul class="space-y-1.5 text-sm">
                  ${q.checklistItems
                    .map(
                      (item, idx) => `
                    <li class="flex items-start gap-2">
                      <span class="text-[#EA580C] font-bold" aria-hidden="true">✓</span>
                      <div class="flex-1">
                        ${renderClickableEs({
                          id: `ans-chk-${q.id}-${idx}`,
                          es: item.es,
                          hy: item.hy,
                          esClass: 'text-sm text-[#1F1209] py-0.5',
                        })}
                      </div>
                    </li>
                  `
                    )
                    .join('')}
                </ul>
              </div>
            `
                : ''
            }
          </div>
        </article>
      `;
    })
    .join('');

  const figurasHtml = d.figurasLiterarias
    .map((f) => {
      const ansId = `ans-${f.id}`;
      const isOpen = Boolean(state.openAnswers[ansId]);
      const currentVal = state.inputs[f.id] || '';
      return `
        <article class="bg-[#FFFDF7] border border-[#FCD34D] rounded-xl p-5 sm:p-6">
          <div class="flex items-start gap-2.5">
            <span class="font-mono-num text-sm font-bold text-[#EA580C] pt-2">${f.num}.</span>
            <div class="flex-1">
              ${renderClickableEs({
                id: `fig-${f.id}`,
                es: f.es,
                hy: f.hy,
                esClass: 'font-medium text-[#1F1209]',
              })}
            </div>
          </div>

          <div class="mt-3 flex flex-wrap gap-1.5">
            ${FIGURA_OPTIONS.map(
              (opt) => `
              <button
                type="button"
                data-pick-figura="${escapeHtml(f.id)}"
                data-pick-value="${escapeHtml(opt)}"
                class="px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                  currentVal === opt
                    ? 'bg-[#EA580C] text-white border-[#EA580C]'
                    : 'bg-[#FFFBEB] text-[#9A3412] border-[#FCD34D] hover:border-[#EA580C] hover:bg-[#FFEDD5]'
                }"
              >
                ${escapeHtml(opt)}
              </button>
            `
            ).join('')}
          </div>

          <input
            type="text"
            data-student-input="${f.id}"
            value="${escapeHtml(currentVal)}"
            placeholder="Ընտրիր վերևից կամ գրիր պատկերավորման միջոցը..."
            class="mt-2.5 w-full px-3.5 py-2 bg-[#FFFBEB] border border-[#F59E0B] rounded-lg text-sm text-[#1F1209] focus:bg-white focus:outline-none focus:border-[#EA580C]"
          />

          <div class="mt-3">
            ${renderAnswerToggleBtn(ansId)}
          </div>

          <div class="answer-panel ${isOpen ? '' : 'hidden'}" data-answer-panel="${ansId}">
            <div class="text-sm font-bold text-[#C2410C] mb-1.5">
              ${escapeHtml(f.figuraEs)} — ${escapeHtml(f.figuraHy)}
            </div>
            ${renderClickableEs({
              id: `ans-expl-${f.id}`,
              es: `Explicación: ${f.explEs}`,
              hy: `Բացատրություն՝ ${f.explHy}`,
              esClass: 'text-sm text-[#1F1209]',
            })}
          </div>
        </article>
      `;
    })
    .join('');

  const comprensionHtml = d.comprension
    .map((c) => {
      const ansId = `ans-${c.id}`;
      const isOpen = Boolean(state.openAnswers[ansId]);
      return `
        <article class="bg-[#FFFDF7] border border-[#FCD34D] rounded-xl p-5 sm:p-6">
          <div class="flex items-start gap-2.5">
            <span class="font-mono-num text-sm font-bold text-[#EA580C] pt-2">${c.num}.</span>
            <div class="flex-1">
              ${renderClickableEs({
                id: `comp-${c.id}`,
                es: c.es,
                hy: c.hy,
                esClass: 'font-semibold text-[#1F1209]',
              })}
            </div>
          </div>

          <textarea
            rows="2"
            data-student-input="${c.id}"
            placeholder="Գրիր պատասխանդ իսպաներենով..."
            class="mt-3 w-full px-3.5 py-2 bg-[#FFFBEB] border border-[#F59E0B] rounded-lg text-sm text-[#1F1209] focus:bg-white focus:outline-none focus:border-[#EA580C]"
          >${escapeHtml(state.inputs[c.id] || '')}</textarea>

          <div class="mt-3">${renderAnswerToggleBtn(ansId)}</div>

          <div class="answer-panel ${isOpen ? '' : 'hidden'}" data-answer-panel="${ansId}">
            ${renderClickableEs({
              id: `ans-comp-${c.id}`,
              es: c.answerEs,
              hy: c.answerHy,
              esClass: 'text-sm text-[#1F1209]',
            })}
          </div>
        </article>
      `;
    })
    .join('');

  const estructuraHtml = d.estructura
    .map((e) => {
      const ansId = `ans-${e.id}`;
      const isOpen = Boolean(state.openAnswers[ansId]);
      return `
        <article class="bg-[#FFFDF7] border border-[#FCD34D] rounded-xl p-5 sm:p-6">
          <div class="mb-2">
            ${renderClickableEs({
              id: `est-title-${e.id}`,
              es: `${e.num}. ${e.titleEs}`,
              hy: e.titleHy,
              esClass: 'font-semibold text-[#1F1209]',
            })}
          </div>
          <textarea
            rows="2"
            data-student-input="${e.id}"
            placeholder="Նկարագրիր այս մասը իսպաներենով..."
            class="mt-2 w-full px-3.5 py-2 bg-[#FFFBEB] border border-[#F59E0B] rounded-lg text-sm text-[#1F1209] focus:bg-white focus:outline-none focus:border-[#EA580C]"
          >${escapeHtml(state.inputs[e.id] || '')}</textarea>
          <div class="mt-3">${renderAnswerToggleBtn(ansId)}</div>
          <div class="answer-panel ${isOpen ? '' : 'hidden'}" data-answer-panel="${ansId}">
            ${renderClickableEs({
              id: `ans-est-${e.id}`,
              es: e.answerEs,
              hy: e.answerHy,
              esClass: 'text-sm text-[#1F1209]',
            })}
          </div>
        </article>
      `;
    })
    .join('');

  const reflAnsId = `ans-${d.reflexion.id}`;
  const reflOpen = Boolean(state.openAnswers[reflAnsId]);

  return `
    <section class="space-y-10">
      <!-- Intro Header -->
      <div class="bg-gradient-to-br from-[#FFF8DC] to-[#FFE6B3] border border-[#F59E0B] rounded-2xl p-6 sm:p-8 space-y-5">
        <div class="space-y-2">
          <div class="text-xs font-semibold text-[#9A3412]">
            <span>${escapeHtml(d.subtitleEs)}</span>
            <span aria-hidden="true"> · </span>
            <span>${escapeHtml(d.subtitleHy)}</span>
          </div>
          <h1 class="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#1F1209]" style="text-wrap: balance;">
            ${escapeHtml(d.title)}
          </h1>
          <p class="text-sm text-[#78350F]">
            Կտտացրու ցանկացած իսպաներեն նախադասության կամ հարցի վրա՝ հայերեն թարգմանությունը բացելու համար։ Հարցերի պատասխանները բացվում են առանձին կոճակով։
          </p>
        </div>
        ${renderStudentFields()}
      </div>

      <!-- Lectura -->
      <div class="bg-[#FFFDF7] border border-[#FCD34D] rounded-2xl p-6 sm:p-8">
        <div class="pb-5 mb-6 border-b border-[#FCD34D]">
          <div class="text-xs font-semibold text-[#B45309] mb-1">${escapeHtml(d.section1HeaderEs)} · ${escapeHtml(d.section1HeaderHy)}</div>
          <h2 class="font-display text-2xl sm:text-3xl font-semibold text-[#1F1209]">${escapeHtml(d.readingTitleEs)}</h2>
          <div class="text-sm text-[#9A3412] mt-1">${escapeHtml(d.readingMeta)}</div>
        </div>
        <div class="max-w-[70ch]">
          ${readingHtml}
        </div>
      </div>

      <!-- 1. Preguntas sobre el texto -->
      <div class="space-y-4">
        <div class="px-1">
          <h2 class="font-display text-2xl font-semibold text-[#1F1209]">1. Preguntas sobre el texto (6 puntos)</h2>
          <p class="text-sm text-[#78350F] mt-1">${escapeHtml(d.questionsHeaderSub)}</p>
        </div>
        <div class="space-y-4">
          ${questionsHtml}
        </div>
      </div>

      <!-- 2. Figuras literarias -->
      <div class="space-y-4">
        <div class="px-1">
          <h2 class="font-display text-2xl font-semibold text-[#1F1209]">2. Figuras literarias — Պատասխաններ (3 puntos)</h2>
          <p class="text-sm text-[#78350F] mt-1">Կտտացրու նախադասության վրա՝ թարգմանելու համար, ընտրիր պատկերավորման միջոցը և ստուգիր «Տեսնել պատասխանը» կոճակով։</p>
        </div>
        <div class="grid grid-cols-1 gap-4">
          ${figurasHtml}
        </div>
      </div>

      <!-- 3. Comprensión e interpretación -->
      <div class="space-y-4">
        <div class="px-1">
          <h2 class="font-display text-2xl font-semibold text-[#1F1209]">3. Comprensión e interpretación — Հարցեր և պատասխաններ</h2>
        </div>
        <div class="space-y-4">
          ${comprensionHtml}
        </div>
      </div>

      <!-- 4. Estructura de la narración -->
      <div class="space-y-4">
        <div class="px-1">
          <h2 class="font-display text-2xl font-semibold text-[#1F1209]">4. Estructura de la narración — Պատմության երեք մասերը</h2>
        </div>
        <div class="grid grid-cols-1 gap-4">
          ${estructuraHtml}
        </div>
      </div>

      <!-- 5. Reflexión personal -->
      <div class="space-y-4">
        <div class="px-1">
          <h2 class="font-display text-2xl font-semibold text-[#1F1209]">5. Reflexión personal — Սեփական կարծիքը</h2>
        </div>
        <article class="bg-[#FFFDF7] border border-[#FCD34D] rounded-xl p-5 sm:p-6">
          ${renderClickableEs({
            id: `refl-q`,
            es: `${d.reflexion.questionEs} ${d.reflexion.quoteEs}`,
            hy: d.reflexion.questionHy,
            esClass: 'font-semibold text-[#1F1209]',
          })}
          <textarea
            rows="5"
            data-student-input="${d.reflexion.id}"
            placeholder="Գրիր սեփական կարծիքդ 6 տողով իսպաներեն..."
            class="mt-3 w-full px-3.5 py-2.5 bg-[#FFFBEB] border border-[#F59E0B] rounded-lg text-sm text-[#1F1209] focus:bg-white focus:outline-none focus:border-[#EA580C]"
          >${escapeHtml(state.inputs[d.reflexion.id] || '')}</textarea>
          <div class="mt-3">${renderAnswerToggleBtn(reflAnsId)}</div>
          <div class="answer-panel ${reflOpen ? '' : 'hidden'}" data-answer-panel="${reflAnsId}">
            <div class="text-xs font-bold text-[#C2410C] mb-2">Respuesta modelo (6 líneas) — Օրինակելի պատասխան</div>
            <div class="space-y-1.5">
              ${d.reflexion.lines
                .map((ln, i) =>
                  renderClickableEs({
                    id: `refl-ln-${i}`,
                    es: ln.es,
                    hy: ln.hy,
                    esClass: 'text-sm text-[#1F1209]',
                  })
                )
                .join('')}
            </div>
          </div>
        </article>
      </div>

      <!-- 6. Frases útiles para el examen -->
      ${renderFrasesUtilesSection()}
    </section>
  `;
}

function renderFrasesUtilesSection() {
  const d = PRUEBA_SEMANAL;
  return `
    <div class="space-y-4">
      <div class="px-1">
        <h2 class="font-display text-2xl font-semibold text-[#1F1209]">6. Frases útiles para el examen — Քննության համար օգտակար արտահայտություններ</h2>
        <p class="text-sm text-[#78350F] mt-1">Այս նախադասությունները կարելի է սովորել, որպեսզի աշակերտը տարբեր տեքստերի վերաբերյալ կարողանա ինքնուրույն ճիշտ պատասխանել։ Կտտացրու իսպաներեն արտահայտության վրա՝ հայերենը տեսնելու համար։</p>
      </div>

      <div class="bg-[#FFFDF7] border border-[#FCD34D] rounded-xl divide-y divide-[#FDE68A] overflow-hidden">
        ${d.frasesUtiles
          .map(
            (row, idx) => `
          <div class="px-5 py-3">
            ${renderClickableEs({
              id: `frase-${idx}`,
              es: row.es,
              hy: row.hy,
              esClass: 'font-medium text-[#1F1209]',
            })}
          </div>
        `
          )
          .join('')}
      </div>

      <div class="bg-[#FEF08A] border border-[#EAB308] rounded-xl p-5 text-sm text-[#1F1209] leading-relaxed">
        ${escapeHtml(d.reglaExamenHy)}
      </div>
    </div>
  `;
}

function renderGuiaExamen() {
  const g = GUIA_EXAMEN;
  return `
    <section class="space-y-10">
      <!-- Intro -->
      <div class="bg-gradient-to-br from-[#FFF8DC] to-[#FFE6B3] border border-[#F59E0B] rounded-2xl p-6 sm:p-8 space-y-3">
        <div class="text-xs font-semibold text-[#9A3412]">${escapeHtml(g.subtitle)}</div>
        <h1 class="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#1F1209]" style="text-wrap: balance;">
          ${escapeHtml(g.title)}
        </h1>
        <p class="text-[15px] text-[#78350F] leading-relaxed max-w-[72ch]">
          ${escapeHtml(g.introHy)}
        </p>
      </div>

      <!-- 1. Cómo preparar el examen -->
      <div class="bg-[#FFFDF7] border border-[#FCD34D] rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 class="font-display text-2xl font-semibold text-[#1F1209]">${escapeHtml(g.sec1.title)}</h2>
        <div class="space-y-3 max-w-[72ch]">
          ${g.sec1.paragraphs
            .map((p, i) =>
              renderClickableEs({
                id: `guia-s1-${i}`,
                es: p.es,
                hy: p.hy,
                esClass: 'text-[15.5px] text-[#1F1209]',
              })
            )
            .join('')}
        </div>
      </div>

      <!-- 2. Cómo hacer un resumen -->
      <div class="bg-[#FFFDF7] border border-[#FCD34D] rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 class="font-display text-2xl font-semibold text-[#1F1209]">${escapeHtml(g.sec2.title)}</h2>
          <p class="text-sm text-[#78350F] mt-1">${escapeHtml(g.sec2.leadHy)}</p>
        </div>

        <div class="p-4 bg-[#FFF8DF] border border-[#FBBF24] rounded-xl space-y-2">
          <div class="text-sm font-semibold text-[#9A3412]">${escapeHtml(g.sec2.whatIsTitle)}</div>
          ${renderClickableEs({
            id: 'guia-s2-what',
            es: g.sec2.whatIs.es,
            hy: g.sec2.whatIs.hy,
            esClass: 'text-[15px] text-[#1F1209]',
          })}
        </div>

        <div class="space-y-4">
          <h3 class="font-display text-xl font-semibold text-[#1F1209]">${escapeHtml(g.sec2.stepsTitle)}</h3>
          <div class="space-y-4">
            ${g.sec2.steps
              .map(
                (st) => `
              <div class="p-5 bg-[#FFFBEB]/60 border border-[#FCD34D] rounded-xl space-y-2">
                <div class="flex items-start gap-3">
                  <span class="font-mono-num inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#EA580C] text-white text-xs font-bold shrink-0 mt-1">${st.num}</span>
                  <div class="flex-1">
                    ${renderClickableEs({
                      id: `guia-step-t-${st.num}`,
                      es: st.titleEs,
                      hy: st.titleHy,
                      esClass: 'font-semibold text-[#1F1209]',
                    })}
                    ${
                      st.bodyEs
                        ? renderClickableEs({
                            id: `guia-step-b-${st.num}`,
                            es: st.bodyEs,
                            hy: st.bodyHy,
                            esClass: 'text-sm text-[#451A03] mt-1',
                          })
                        : ''
                    }
                    ${
                      st.table
                        ? `
                      <div class="mt-3 bg-[#FFFDF7] border border-[#FCD34D] rounded-lg divide-y divide-[#FDE68A]">
                        ${st.table
                          .map(
                            (row, rIdx) => `
                          <div class="px-3.5 py-2">
                            ${renderClickableEs({
                              id: `guia-step2-q-${rIdx}`,
                              es: row.es,
                              hy: row.hy,
                              esClass: 'text-sm font-medium text-[#1F1209]',
                            })}
                          </div>
                        `
                          )
                          .join('')}
                      </div>
                    `
                        : ''
                    }
                  </div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Ejemplo con El jardín de los recuerdos -->
        <div class="space-y-4 pt-4 border-t border-[#FCD34D]">
          <h3 class="font-display text-xl font-semibold text-[#1F1209]">${escapeHtml(g.sec2.exampleTitle)}</h3>
          <p class="text-sm font-medium text-[#9A3412]">${escapeHtml(g.sec2.examplePromptEs)}</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl space-y-2">
              <div class="text-xs font-semibold text-[#B91C1C]">✕ ${escapeHtml(g.sec2.exampleWrong.label)}</div>
              <p class="text-sm text-[#1F1209] font-medium">${escapeHtml(g.sec2.exampleWrong.es)}</p>
              <div class="pt-2 border-t border-[#FECACA] text-xs font-semibold text-[#991B1B]">${escapeHtml(g.sec2.exampleWrong.whyTitle)}</div>
              ${renderClickableEs({
                id: 'guia-wrong-why',
                es: g.sec2.exampleWrong.whyEs,
                hy: g.sec2.exampleWrong.whyHy,
                esClass: 'text-sm text-[#451A03]',
              })}
            </div>

            <div class="p-5 bg-[#ECFDF5] border border-[#6EE7B7] rounded-xl space-y-2">
              <div class="text-xs font-semibold text-[#047857]">✓ ${escapeHtml(g.sec2.exampleRight.label)}</div>
              ${renderClickableEs({
                id: 'guia-right-ex',
                es: g.sec2.exampleRight.es,
                hy: g.sec2.exampleRight.hy,
                esClass: 'text-sm text-[#1F1209] leading-relaxed',
              })}
            </div>
          </div>
        </div>

        <!-- Palabras útiles -->
        <div class="space-y-3 pt-4 border-t border-[#FCD34D]">
          <h3 class="font-display text-xl font-semibold text-[#1F1209]">${escapeHtml(g.sec2.palabrasUtilesTitle)}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            ${g.sec2.palabrasUtiles
              .map(
                (p, i) => `
              <div class="p-3 bg-[#FFF8DF] border border-[#FBBF24] rounded-lg">
                ${renderClickableEs({
                  id: `guia-pal-${i}`,
                  es: p.es,
                  hy: p.hy,
                  esClass: 'text-sm font-medium text-[#1F1209]',
                })}
              </div>
            `
              )
              .join('')}
          </div>
          <div class="p-4 bg-[#FEF08A] border border-[#EAB308] rounded-xl mt-3">
            ${renderClickableEs({
              id: 'guia-importante',
              es: g.sec2.importante.es,
              hy: g.sec2.importante.hy,
              esClass: 'text-sm font-semibold text-[#1F1209]',
            })}
          </div>
        </div>
      </div>

      <!-- 3. Cómo responder a las preguntas -->
      <div class="bg-[#FFFDF7] border border-[#FCD34D] rounded-2xl p-6 sm:p-8 space-y-8">
        <h2 class="font-display text-2xl font-semibold text-[#1F1209]">${escapeHtml(g.sec3.title)}</h2>

        <!-- A. Literatura culta o popular -->
        <div class="space-y-4">
          <h3 class="font-display text-xl font-semibold text-[#1F1209]">${escapeHtml(g.sec3.subA.title)}</h3>
          ${renderClickableEs({
            id: 'guia-3a-q',
            es: `Pregunta: ${g.sec3.subA.questionEs}`,
            hy: g.sec3.subA.questionHy,
            esClass: 'text-sm font-semibold text-[#1F1209]',
          })}
          <div class="overflow-x-auto border border-[#FCD34D] rounded-xl">
            <table class="w-full text-left text-sm">
              <thead class="bg-[#FFF0B8] border-b border-[#F59E0B]">
                <tr>
                  <th class="px-4 py-3 font-semibold text-[#1F1209]">Literatura culta — Հեղինակային</th>
                  <th class="px-4 py-3 font-semibold text-[#1F1209]">Literatura popular — Ժողովրդական</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#FDE68A]">
                ${g.sec3.subA.rows
                  .map(
                    (r, idx) => `
                  <tr>
                    <td class="px-4 py-3 align-top">
                      ${renderClickableEs({
                        id: `guia-3a-c-${idx}`,
                        es: r.cultaEs,
                        hy: r.cultaHy,
                        esClass: 'text-sm text-[#1F1209]',
                      })}
                    </td>
                    <td class="px-4 py-3 align-top">
                      ${renderClickableEs({
                        id: `guia-3a-p-${idx}`,
                        es: r.popularEs,
                        hy: r.popularHy,
                        esClass: 'text-sm text-[#1F1209]',
                      })}
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
          <div class="p-4 bg-[#FFE8CC] border border-[#F97316] rounded-xl space-y-2">
            <div class="text-xs font-bold text-[#C2410C]">Ejemplo de respuesta:</div>
            ${renderClickableEs({
              id: 'guia-3a-ex',
              es: g.sec3.subA.ejemploEs,
              hy: g.sec3.subA.ejemploHy,
              esClass: 'text-sm text-[#1F1209]',
            })}
            <p class="text-xs text-[#78350F] pt-1">${escapeHtml(g.sec3.subA.noteHy)}</p>
          </div>
        </div>

        <!-- B. Género literario -->
        <div class="space-y-4 pt-6 border-t border-[#FCD34D]">
          <h3 class="font-display text-xl font-semibold text-[#1F1209]">${escapeHtml(g.sec3.subB.title)}</h3>
          <p class="text-sm text-[#78350F]">${escapeHtml(g.sec3.subB.leadHy)}</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${g.sec3.subB.genres
              .map(
                (gen, i) => `
              <div class="p-4 bg-[#FFF8DF] border border-[#FBBF24] rounded-xl space-y-2">
                <div class="font-semibold text-[#1F1209]">${escapeHtml(gen.nameEs)}</div>
                <div class="text-xs font-semibold text-[#EA580C]">${escapeHtml(gen.nameHy)}</div>
                ${renderClickableEs({
                  id: `guia-3b-g-${i}`,
                  es: gen.descEs,
                  hy: gen.descHy,
                  esClass: 'text-sm text-[#451A03]',
                })}
                <div class="text-xs text-[#9A3412] pt-1">${escapeHtml(gen.examples)}</div>
              </div>
            `
              )
              .join('')}
          </div>
          <div class="p-4 bg-[#FFE8CC] border border-[#F97316] rounded-xl">
            <div class="text-xs font-bold text-[#C2410C] mb-1">${escapeHtml(g.sec3.subB.sampleTitle)}</div>
            ${renderClickableEs({
              id: 'guia-3b-sample',
              es: g.sec3.subB.sampleEs,
              hy: g.sec3.subB.sampleHy,
              esClass: 'text-sm text-[#1F1209]',
            })}
          </div>
        </div>

        <!-- C. Figuras literarias -->
        <div class="space-y-4 pt-6 border-t border-[#FCD34D]">
          <h3 class="font-display text-xl font-semibold text-[#1F1209]">${escapeHtml(g.sec3.subC.title)}</h3>
          <div class="overflow-x-auto border border-[#FCD34D] rounded-xl">
            <table class="w-full text-left text-sm">
              <thead class="bg-[#FFF0B8] border-b border-[#F59E0B]">
                <tr>
                  <th class="px-4 py-3 font-semibold text-[#1F1209]">Figura</th>
                  <th class="px-4 py-3 font-semibold text-[#1F1209]">Cómo reconocerla — Ինչպես ճանաչել</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#FDE68A]">
                ${g.sec3.subC.rows
                  .map(
                    (r, i) => `
                  <tr>
                    <td class="px-4 py-3 align-top whitespace-nowrap">
                      <span class="font-semibold text-[#C2410C]">${escapeHtml(r.figEs)}</span>
                      <span class="block text-xs text-[#78350F]">${escapeHtml(r.figHy)}</span>
                    </td>
                    <td class="px-4 py-3 align-top">
                      ${renderClickableEs({
                        id: `guia-3c-r-${i}`,
                        es: r.descEs,
                        hy: r.descHy,
                        esClass: 'text-sm text-[#1F1209]',
                      })}
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>

          <div class="p-4 bg-[#FFF8DF] border border-[#FBBF24] rounded-xl space-y-2">
            <div class="text-sm font-semibold text-[#1F1209]">${escapeHtml(g.sec3.subC.justifyTitle)}</div>
            ${renderClickableEs({
              id: 'guia-3c-just',
              es: g.sec3.subC.justifyEs,
              hy: g.sec3.subC.justifyHy,
              esClass: 'text-sm text-[#451A03]',
            })}
            <div class="pt-2 border-t border-[#FCD34D] text-sm font-semibold text-[#EA580C]">${escapeHtml(g.sec3.subC.exampleQuote)}</div>
            ${renderClickableEs({
              id: 'guia-3c-ex',
              es: g.sec3.subC.exampleEs,
              hy: g.sec3.subC.exampleHy,
              esClass: 'text-sm text-[#1F1209]',
            })}
          </div>
        </div>

        <!-- D. Lenguaje literario -->
        <div class="space-y-3 pt-6 border-t border-[#FCD34D]">
          <h3 class="font-display text-xl font-semibold text-[#1F1209]">${escapeHtml(g.sec3.subD.title)}</h3>
          ${renderClickableEs({
            id: 'guia-3d-q',
            es: `Pregunta: ${g.sec3.subD.questionEs}`,
            hy: g.sec3.subD.questionHy,
            esClass: 'text-sm font-semibold text-[#1F1209]',
          })}
          <div class="p-4 bg-[#FFE8CC] border border-[#F97316] rounded-xl">
            <div class="text-xs font-bold text-[#C2410C] mb-1">Respuesta modelo:</div>
            ${renderClickableEs({
              id: 'guia-3d-a',
              es: g.sec3.subD.answerEs,
              hy: g.sec3.subD.answerHy,
              esClass: 'text-sm text-[#1F1209]',
            })}
          </div>
          <p class="text-xs text-[#78350F]">${escapeHtml(g.sec3.subD.tipHy)}</p>
        </div>

        <!-- E. Cómo explicar una expresión -->
        <div class="space-y-3 pt-6 border-t border-[#FCD34D]">
          <h3 class="font-display text-xl font-semibold text-[#1F1209]">${escapeHtml(g.sec3.subE.title)}</h3>
          <p class="text-sm text-[#78350F]">${escapeHtml(g.sec3.subE.leadHy)}</p>
          <div class="p-4 bg-[#FFF8DF] border border-[#FBBF24] rounded-xl space-y-2">
            <div class="text-sm font-semibold text-[#EA580C]">${escapeHtml(g.sec3.subE.exampleExpr)}</div>
            ${renderClickableEs({
              id: 'guia-3e-ex',
              es: `Respuesta: ${g.sec3.subE.exampleEs}`,
              hy: g.sec3.subE.exampleHy,
              esClass: 'text-sm text-[#1F1209]',
            })}
          </div>
          <div class="text-xs font-semibold text-[#9A3412]">${escapeHtml(g.sec3.subE.startersLeadHy)}</div>
          <div class="space-y-2">
            ${g.sec3.subE.starters
              .map(
                (st, i) => `
              <div class="px-3.5 py-2 bg-[#FFF8DF] border border-[#FBBF24] rounded-lg">
                ${renderClickableEs({
                  id: `guia-3e-st-${i}`,
                  es: st.es,
                  hy: st.hy,
                  esClass: 'text-sm font-medium text-[#1F1209]',
                })}
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- F. Cómo justificar una respuesta -->
        <div class="space-y-4 pt-6 border-t border-[#FCD34D]">
          <h3 class="font-display text-xl font-semibold text-[#1F1209]">${escapeHtml(g.sec3.subF.title)}</h3>
          <p class="text-sm text-[#78350F]">${escapeHtml(g.sec3.subF.formulaLeadHy)}</p>
          <div class="grid grid-cols-3 gap-3">
            ${g.sec3.subF.formula
              .map(
                (f) => `
              <div class="p-3 bg-[#FFF0B8] border border-[#F59E0B] rounded-xl text-center">
                <div class="font-bold text-sm text-[#9A3412]">${escapeHtml(f.es)}</div>
                <div class="text-xs text-[#78350F] mt-0.5">${escapeHtml(f.hy)}</div>
              </div>
            `
              )
              .join('')}
          </div>
          <p class="text-sm font-medium text-[#451A03]">${escapeHtml(g.sec3.subF.formulaSummaryHy)}</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl space-y-1.5">
              <div class="text-xs font-semibold text-[#B91C1C]">Respuesta insuficiente</div>
              <p class="text-sm font-medium text-[#1F1209]">${escapeHtml(g.sec3.subF.badEs)}</p>
              <p class="text-xs text-[#7F1D1D]">${escapeHtml(g.sec3.subF.badHy)}</p>
            </div>
            <div class="p-4 bg-[#ECFDF5] border border-[#6EE7B7] rounded-xl space-y-1.5">
              <div class="text-xs font-semibold text-[#047857]">Respuesta completa</div>
              <p class="text-sm font-medium text-[#1F1209]">${escapeHtml(g.sec3.subF.goodEs)}</p>
              <p class="text-xs text-[#065F46]">${escapeHtml(g.sec3.subF.goodHy)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderExamenPractica() {
  const ex = EXAMEN_PRACTICA;

  const readingHtml = ex.paragraphs
    .map((p, idx) =>
      renderClickableEs({
        id: `ep-p-${idx}`,
        es: p.es,
        hy: p.hy,
        esClass: 'text-[17px] sm:text-[18px] leading-[1.85] text-[#140B04]',
        formatSpecial: true,
      })
    )
    .join('<div class="h-3"></div>');

  const parte1Html = ex.parte1
    .map((q) => {
      const ansId = `ans-${q.id}`;
      const isOpen = Boolean(state.openAnswers[ansId]);
      return `
        <article class="bg-[#FFFDF7] border border-[#FCD34D] rounded-xl p-5 sm:p-6">
          <div class="flex items-start gap-2.5">
            <span class="font-mono-num text-sm font-bold text-[#EA580C] pt-2">${escapeHtml(q.letter)}</span>
            <div class="flex-1">
              ${renderClickableEs({
                id: `ep-q-${q.id}`,
                es: q.es,
                hy: q.hy,
                esClass: 'font-semibold text-[#1F1209]',
              })}
            </div>
          </div>

          ${
            q.subQuotes
              ? `
            <div class="mt-3 space-y-2 pl-0 sm:pl-6">
              ${q.subQuotes
                .map(
                  (sq, idx) => `
                <div class="p-3 bg-[#FFF8DF] border border-[#FBBF24] rounded-lg">
                  ${renderClickableEs({
                    id: `ep-sq-${q.id}-${idx}`,
                    es: sq.es,
                    hy: sq.hy,
                    esClass: 'text-sm italic text-[#1F1209]',
                  })}
                </div>
              `
                )
                .join('')}
            </div>
          `
              : ''
          }

          <textarea
            rows="3"
            data-student-input="${q.id}"
            placeholder="Գրիր քո պատասխանը իսպաներեն..."
            class="mt-3 w-full px-3.5 py-2.5 bg-[#FFFBEB] border border-[#F59E0B] rounded-lg text-sm text-[#1F1209] focus:bg-white focus:outline-none focus:border-[#EA580C]"
          >${escapeHtml(state.inputs[q.id] || '')}</textarea>

          <div class="mt-3">
            ${renderAnswerToggleBtn(ansId, 'Տեսնել պատասխանը · Ver respuesta', 'Թաքցնել պատասխանը · Ocultar respuesta')}
          </div>

          <div class="answer-panel ${isOpen ? '' : 'hidden'}" data-answer-panel="${ansId}">
            <div class="text-xs font-bold text-[#C2410C] mb-1.5">Ինքնաստուգման պատասխան · Respuesta orientativa</div>
            ${renderClickableEs({
              id: `ans-ep-${q.id}`,
              es: q.answerEs,
              hy: q.answerHy,
              esClass: 'text-[15.5px] text-[#140B04] leading-[1.75]',
            })}
          </div>
        </article>
      `;
    })
    .join('');

  const parte2Html = ex.parte2
    .map((f) => {
      const ansId = `ans-${f.id}`;
      const isOpen = Boolean(state.openAnswers[ansId]);
      const currentVal = state.inputs[f.id] || '';
      return `
        <article class="bg-[#FFFDF7] border border-[#FCD34D] rounded-xl p-5 sm:p-6">
          <div class="flex items-start gap-2.5">
            <span class="font-mono-num text-sm font-bold text-[#EA580C] pt-2">${f.num}.</span>
            <div class="flex-1">
              ${renderClickableEs({
                id: `ep-fig-${f.id}`,
                es: f.es,
                hy: f.hy,
                esClass: 'font-medium text-[#1F1209]',
              })}
            </div>
          </div>

          <div class="mt-3 flex flex-wrap gap-1.5">
            ${FIGURA_OPTIONS.map(
              (opt) => `
              <button
                type="button"
                data-pick-figura="${escapeHtml(f.id)}"
                data-pick-value="${escapeHtml(opt)}"
                class="px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                  currentVal === opt
                    ? 'bg-[#EA580C] text-white border-[#EA580C]'
                    : 'bg-[#FFFBEB] text-[#9A3412] border-[#FCD34D] hover:border-[#EA580C] hover:bg-[#FFEDD5]'
                }"
              >
                ${escapeHtml(opt)}
              </button>
            `
            ).join('')}
          </div>

          <input
            type="text"
            data-student-input="${f.id}"
            value="${escapeHtml(currentVal)}"
            placeholder="Figura literaria..."
            class="mt-2.5 w-full px-3.5 py-2 bg-[#FFFBEB] border border-[#F59E0B] rounded-lg text-sm text-[#1F1209] focus:bg-white focus:outline-none focus:border-[#EA580C]"
          />

          <div class="mt-3">${renderAnswerToggleBtn(ansId)}</div>

          <div class="answer-panel ${isOpen ? '' : 'hidden'}" data-answer-panel="${ansId}">
            <div class="text-sm font-bold text-[#C2410C] mb-1">
              ${escapeHtml(f.answerEs)} — ${escapeHtml(f.answerHy)}
            </div>
            ${renderClickableEs({
              id: `ans-ep-expl-${f.id}`,
              es: f.explEs,
              hy: f.explHy,
              esClass: 'text-sm text-[#1F1209]',
            })}
          </div>
        </article>
      `;
    })
    .join('');

  const parte3Html = ex.parte3.items
    .map((item) => {
      const hintId = `hint-${item.id}`;
      const ansId = `ans-${item.id}`;
      const hintOpen = Boolean(state.openHints[hintId]);
      const ansOpen = Boolean(state.openAnswers[ansId]);

      return `
        <article class="bg-[#FFFDF7] border border-[#FCD34D] rounded-xl p-5 sm:p-6">
          <div class="flex items-start gap-2.5">
            <span class="font-mono-num text-sm font-bold text-[#EA580C] pt-2">${item.num}.</span>
            <div class="flex-1">
              ${renderClickableEs({
                id: `ep-p3-${item.id}`,
                es: item.es,
                hy: item.hy,
                esClass: 'font-semibold text-[#1F1209]',
              })}
            </div>
          </div>

          <textarea
            rows="2"
            data-student-input="${item.id}"
            placeholder="Գրիր պատասխանդ իսպաներեն..."
            class="mt-3 w-full px-3.5 py-2 bg-[#FFFBEB] border border-[#F59E0B] rounded-lg text-sm text-[#1F1209] focus:bg-white focus:outline-none focus:border-[#EA580C]"
          >${escapeHtml(state.inputs[item.id] || '')}</textarea>

          <div class="mt-3 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              data-hint-toggle="${hintId}"
              aria-expanded="${hintOpen ? 'true' : 'false'}"
              class="px-3.5 py-2 text-xs font-semibold rounded-lg border border-[#EAB308] bg-[#FEF08A] text-[#78350F] hover:text-[#1F1209] hover:border-[#EA580C] hover:bg-[#FDE047] transition-colors cursor-pointer"
            >
              ${hintOpen ? 'Ocultar pista · Թաքցնել հուշումը' : 'Mostrar pista · Ցույց տալ հուշումը'}
            </button>
            ${renderAnswerToggleBtn(ansId)}
          </div>

          <div class="hint-panel ${hintOpen ? '' : 'hidden'}" data-hint-panel="${hintId}">
            <div class="text-xs font-bold text-[#9A3412] mb-1">Pista · Հուշում</div>
            ${renderClickableEs({
              id: `hint-txt-${item.id}`,
              es: item.pistaEs,
              hy: item.pistaHy,
              esClass: 'text-sm text-[#1F1209]',
            })}
          </div>

          <div class="answer-panel ${ansOpen ? '' : 'hidden'}" data-answer-panel="${ansId}">
            <div class="text-xs font-bold text-[#C2410C] mb-1">Ինքնաստուգման պատասխան</div>
            ${renderClickableEs({
              id: `ans-p3-${item.id}`,
              es: item.answerEs,
              hy: item.answerHy,
              esClass: 'text-sm text-[#1F1209]',
            })}
          </div>
        </article>
      `;
    })
    .join('');

  const checkedCount = ex.checklist.filter((c) => Boolean(state.checklist[c.id])).length;

  return `
    <section class="space-y-10">
      <!-- Intro -->
      <div class="bg-gradient-to-br from-[#FFF8DC] to-[#FFE6B3] border border-[#F59E0B] rounded-2xl p-6 sm:p-8 space-y-3">
        <div class="text-xs font-semibold text-[#9A3412]">${escapeHtml(ex.meta)}</div>
        <h1 class="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#1F1209]" style="text-wrap: balance;">
          ${escapeHtml(ex.title)}
        </h1>
        <p class="text-[15px] text-[#78350F] leading-relaxed max-w-[72ch]">
          ${escapeHtml(ex.introHy)}
        </p>
      </div>

      <!-- Lectura: Las personas que nadie ve -->
      <div class="bg-[#FFFDF7] border border-[#FCD34D] rounded-2xl p-6 sm:p-8">
        <div class="pb-5 mb-6 border-b border-[#FCD34D]">
          <h2 class="font-display text-2xl sm:text-3xl font-semibold text-[#1F1209]">${escapeHtml(ex.readingTitleEs)}</h2>
          <div class="text-sm text-[#9A3412] mt-1">${escapeHtml(ex.readingSubtitleHy)}</div>
        </div>
        <div class="max-w-[70ch]">
          ${readingHtml}
        </div>
      </div>

      <!-- Parte 1 -->
      <div class="space-y-4">
        <div class="px-1">
          <h2 class="font-display text-2xl font-semibold text-[#1F1209]">Parte 1. Comprensión y análisis literario (6 puntos)</h2>
        </div>
        <div class="space-y-4">
          ${parte1Html}
        </div>
      </div>

      <!-- Parte 2 -->
      <div class="space-y-4">
        <div class="px-1">
          <h2 class="font-display text-2xl font-semibold text-[#1F1209]">Parte 2. Figuras literarias (3 puntos)</h2>
          <p class="text-sm text-[#78350F] mt-1">Identifica la figura literaria principal. — Նշիր հիմնական պատկերավորման միջոցը։</p>
        </div>
        <div class="space-y-4">
          ${parte2Html}
        </div>
      </div>

      <!-- Parte 3 -->
      <div class="space-y-4">
        <div class="px-1">
          <h2 class="font-display text-2xl font-semibold text-[#1F1209]">${escapeHtml(ex.parte3.title)}</h2>
          <p class="text-sm text-[#78350F] mt-1">${escapeHtml(ex.parte3.subtitleHy)}</p>
        </div>
        <div class="space-y-4">
          ${parte3Html}
        </div>
        <div class="bg-[#FFFDF7] border border-[#FCD34D] rounded-xl p-5 sm:p-6 space-y-4">
          <p class="text-sm text-[#451A03] leading-relaxed">${escapeHtml(ex.parte3.instructionHy)}</p>
          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="copyResumenBtn"
              class="px-4 py-2 text-sm font-semibold rounded-lg bg-[#EA580C] text-white hover:bg-[#C2410C] transition-colors cursor-pointer"
            >
              Copiar respuestas · Պատճենել պատասխանները
            </button>
            <span id="copyStatusMsg" class="text-xs font-semibold text-[#B45309]"></span>
          </div>
          <div id="assembledResumenPreview" class="hidden p-4 bg-[#FFF8DF] border border-[#F59E0B] rounded-lg text-sm text-[#1F1209] leading-relaxed"></div>
        </div>
      </div>

      <!-- Lista de comprobación -->
      <div class="bg-[#FFFDF7] border border-[#FCD34D] rounded-2xl p-6 sm:p-8 space-y-4">
        <div class="flex items-center justify-between gap-4 pb-3 border-b border-[#FCD34D]">
          <div>
            <h2 class="font-display text-2xl font-semibold text-[#1F1209]">Lista de comprobación — Ստուգաթերթիկ</h2>
            <p class="text-sm text-[#78350F]">Antes de entregar el examen</p>
          </div>
          <div id="checklistCounter" class="font-mono-num text-lg font-bold text-[#EA580C]">
            ${checkedCount} / ${ex.checklist.length}
          </div>
        </div>

        <div class="divide-y divide-[#FDE68A]">
          ${ex.checklist
            .map((chk) => {
              const checked = Boolean(state.checklist[chk.id]);
              return `
              <div class="py-3 flex items-start gap-3">
                <input
                  type="checkbox"
                  data-checklist-id="${chk.id}"
                  ${checked ? 'checked' : ''}
                  aria-label="${escapeHtml(chk.es)}"
                  class="mt-2.5 w-4 h-4 accent-[#EA580C] rounded cursor-pointer shrink-0"
                />
                <div class="flex-1">
                  ${renderClickableEs({
                    id: `chk-txt-${chk.id}`,
                    es: chk.es,
                    hy: chk.hy,
                    esClass: `text-sm font-medium ${checked ? 'line-through text-[#B45309]' : 'text-[#1F1209]'}`,
                  })}
                </div>
              </div>
            `;
            })
            .join('')}
        </div>
      </div>

      <!-- Consejo final -->
      <div class="bg-[#FEF08A] border border-[#EAB308] rounded-2xl p-6 sm:p-8 space-y-3">
        <h2 class="font-display text-xl font-semibold text-[#1F1209]">${escapeHtml(ex.consejoFinal.title)}</h2>
        ${renderClickableEs({
          id: 'ep-consejo',
          es: ex.consejoFinal.es,
          hy: ex.consejoFinal.hy,
          esClass: 'text-[15.5px] font-medium text-[#1F1209]',
        })}
        <p class="text-xs text-[#78350F] pt-2 border-t border-[#EAB308]">${escapeHtml(ex.consejoFinal.noteHy)}</p>
      </div>
    </section>
  `;
}

function renderFrasesView() {
  return `
    <section class="space-y-8">
      <div class="bg-gradient-to-br from-[#FFF8DC] to-[#FFE6B3] border border-[#F59E0B] rounded-2xl p-6 sm:p-8 space-y-2">
        <div class="text-xs font-semibold text-[#9A3412]">Español + Հայերեն · Կլիշեներ և կապող բառեր</div>
        <h1 class="font-display text-3xl font-semibold text-[#1F1209]">Frases útiles para el examen</h1>
        <p class="text-sm text-[#78350F]">Կտտացրու յուրաքանչյուր իսպաներեն արտահայտության վրա՝ հայերեն թարգմանությունը տեսնելու համար։</p>
      </div>
      ${renderFrasesUtilesSection()}
    </section>
  `;
}

function renderApp() {
  const root = document.getElementById('app');
  if (!root) return;

  let mainContent = '';
  if (state.activeTab === 'prueba') mainContent = renderPruebaSemanal();
  else if (state.activeTab === 'guia') mainContent = renderGuiaExamen();
  else if (state.activeTab === 'practica') mainContent = renderExamenPractica();
  else mainContent = renderFrasesView();

  root.innerHTML = `
    <div id="top" class="min-h-screen flex flex-col">
      ${renderTopBar()}
      <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        ${mainContent}
      </main>
      <footer class="border-t border-[#FCD34D] bg-[#FFF0C2]/70 py-6 px-4 text-center text-xs font-medium text-[#78350F]">
        Lengua Castellana y Literatura · 1.º ESO · Իսպաներեն-հայերեն ինտերակտիվ ուղեցույց
      </footer>
    </div>
  `;
}

function syncTranslationDom(id, isOpen) {
  const wrapper = document.querySelector(`[data-trans-wrapper="${CSS.escape(id)}"]`);
  if (!wrapper) return;
  const trigger = wrapper.querySelector(`[data-trans-id="${CSS.escape(id)}"]`);
  const target = wrapper.querySelector(`[data-trans-target="${CSS.escape(id)}"]`);
  if (trigger) {
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    trigger.classList.toggle('is-open', isOpen);
    const lbl = trigger.querySelector('[data-trans-label]');
    if (lbl) lbl.textContent = isOpen ? 'Թաքցնել հայ.' : 'Հայերեն';
  }
  if (target) {
    target.classList.toggle('hidden', !isOpen);
  }
}

function syncAnswerDom(ansId, isOpen) {
  const btn = document.querySelector(`[data-answer-toggle="${CSS.escape(ansId)}"]`);
  const panel = document.querySelector(`[data-answer-panel="${CSS.escape(ansId)}"]`);
  if (btn) {
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    btn.className = `inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
      isOpen
        ? 'bg-[#EA580C] text-white border-[#EA580C] hover:bg-[#C2410C]'
        : 'bg-[#FFFBEB] text-[#9A3412] border-[#F59E0B] hover:bg-[#EA580C] hover:text-white hover:border-[#EA580C]'
    }`;
    const span = btn.querySelector('span');
    if (span) {
      span.textContent = isOpen
        ? 'Թաքցնել պատասխանը · Ocultar respuesta'
        : 'Տեսնել պատասխանը · Ver respuesta';
    }
  }
  if (panel) {
    panel.classList.toggle('hidden', !isOpen);
  }
}

function syncHintDom(hintId, isOpen) {
  const btn = document.querySelector(`[data-hint-toggle="${CSS.escape(hintId)}"]`);
  const panel = document.querySelector(`[data-hint-panel="${CSS.escape(hintId)}"]`);
  if (btn) {
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    btn.textContent = isOpen ? 'Ocultar pista · Թաքցնել հուշումը' : 'Mostrar pista · Ցույց տալ հուշումը';
  }
  if (panel) {
    panel.classList.toggle('hidden', !isOpen);
  }
}

function assembleResumenFromInputs() {
  const q1 = (state.inputs['ep-p3-1'] || '').trim();
  const q2 = (state.inputs['ep-p3-2'] || '').trim();
  const q3 = (state.inputs['ep-p3-3'] || '').trim();
  const q4 = (state.inputs['ep-p3-4'] || '').trim();

  const parts = [];
  if (q1) parts.push(`Al principio, ${q1.charAt(0).toLowerCase()}${q1.slice(1)}`);
  if (q2) parts.push(q2);
  if (q3) parts.push(`Después, ${q3.charAt(0).toLowerCase()}${q3.slice(1)}`);
  if (q4) parts.push(`Finalmente, ${q4.charAt(0).toLowerCase()}${q4.slice(1)}`);

  if (parts.length === 0) {
    return 'Al principio, ... Después, ... Finalmente, ... (Նախ լրացրու վերևի 4 հարցերի պատասխանները իսպաներենով։)';
  }
  return parts.join(' ');
}

function setupEventListeners() {
  document.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    // 1. Tab navigation
    const navBtn = target.closest('[data-nav-tab]');
    if (navBtn) {
      const tabId = navBtn.getAttribute('data-nav-tab');
      if (tabId) {
        state.activeTab = tabId;
        saveState();
        renderApp();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // 2. Global translate toggle
    if (target.closest('#toggleAllTransBtn')) {
      state.allTranslated = !state.allTranslated;
      state.openTranslations = {};
      saveState();
      renderApp();
      return;
    }

    // 3. Separate "View Answer" button
    const ansBtn = target.closest('[data-answer-toggle]');
    if (ansBtn) {
      const ansId = ansBtn.getAttribute('data-answer-toggle');
      if (ansId) {
        const next = !state.openAnswers[ansId];
        state.openAnswers[ansId] = next;
        saveState();
        syncAnswerDom(ansId, next);
      }
      return;
    }

    // 4. Hint toggle button
    const hintBtn = target.closest('[data-hint-toggle]');
    if (hintBtn) {
      const hintId = hintBtn.getAttribute('data-hint-toggle');
      if (hintId) {
        const next = !state.openHints[hintId];
        state.openHints[hintId] = next;
        saveState();
        syncHintDom(hintId, next);
      }
      return;
    }

    // 5. Quick-pick figura buttons
    const pickBtn = target.closest('[data-pick-figura]');
    if (pickBtn) {
      const fieldId = pickBtn.getAttribute('data-pick-figura');
      const val = pickBtn.getAttribute('data-pick-value');
      if (fieldId && val) {
        state.inputs[fieldId] = val;
        saveState();
        const inputEl = document.querySelector(`[data-student-input="${CSS.escape(fieldId)}"]`);
        if (inputEl instanceof HTMLInputElement) {
          inputEl.value = val;
        }
        const allPickBtns = document.querySelectorAll(`[data-pick-figura="${CSS.escape(fieldId)}"]`);
        allPickBtns.forEach((b) => {
          const active = b.getAttribute('data-pick-value') === val;
          b.className = `px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
            active
              ? 'bg-[#EA580C] text-white border-[#EA580C]'
              : 'bg-[#FFFBEB] text-[#9A3412] border-[#FCD34D] hover:border-[#EA580C] hover:bg-[#FFEDD5]'
          }`;
        });
      }
      return;
    }

    // 6. Copy Resumen button
    if (target.closest('#copyResumenBtn')) {
      const text = assembleResumenFromInputs();
      const preview = document.getElementById('assembledResumenPreview');
      const statusMsg = document.getElementById('copyStatusMsg');
      if (preview) {
        preview.textContent = text;
        preview.classList.remove('hidden');
      }
      try {
        await navigator.clipboard.writeText(text);
        if (statusMsg) statusMsg.textContent = 'Պատճենված է · Copiado al portapapeles';
      } catch {
        if (statusMsg) statusMsg.textContent = 'Ամփոփումը հավաքված է ներքևում';
      }
      return;
    }

    // 7. Click on Spanish block -> toggle Armenian translation
    const transTrigger = target.closest('[data-trans-id]');
    if (transTrigger) {
      const id = transTrigger.getAttribute('data-trans-id');
      if (id) {
        const nextOpen = toggleTranslationState(id);
        syncTranslationDom(id, nextOpen);
      }
    }
  });

  // Keyboard support for clickable Spanish blocks
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const transTrigger = target.closest('[data-trans-id]');
    if (transTrigger) {
      event.preventDefault();
      const id = transTrigger.getAttribute('data-trans-id');
      if (id) {
        const nextOpen = toggleTranslationState(id);
        syncTranslationDom(id, nextOpen);
      }
    }
  });

  // Input persistence
  document.addEventListener('input', (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.id === 'inputApellidos') {
      state.apellidos = target.value;
      saveState();
      return;
    }
    if (target instanceof HTMLInputElement && target.id === 'inputNombre') {
      state.nombre = target.value;
      saveState();
      return;
    }
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      const key = target.getAttribute('data-student-input');
      if (key) {
        state.inputs[key] = target.value;
        saveState();
      }
    }
  });

  // Checklist checkboxes
  document.addEventListener('change', (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      const chkId = target.getAttribute('data-checklist-id');
      if (chkId) {
        state.checklist[chkId] = target.checked;
        saveState();
        const checkedCount = EXAMEN_PRACTICA.checklist.filter((c) => Boolean(state.checklist[c.id])).length;
        const counter = document.getElementById('checklistCounter');
        if (counter) {
          counter.textContent = `${checkedCount} / ${EXAMEN_PRACTICA.checklist.length}`;
        }
        const txtTrigger = document.querySelector(`[data-trans-id="chk-txt-${CSS.escape(chkId)}"]`);
        if (txtTrigger) {
          txtTrigger.classList.toggle('line-through', target.checked);
          txtTrigger.classList.toggle('text-[#B45309]', target.checked);
          txtTrigger.classList.toggle('text-[#1F1209]', !target.checked);
        }
      }
    }
  });
}

renderApp();
setupEventListeners();
