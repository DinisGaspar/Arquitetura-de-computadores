const form = document.querySelector('#lesson-form');
const grid = document.querySelector('#lessons-grid');
const searchInput = document.querySelector('#search-input');
const emptyState = document.querySelector('#empty-state');
const count = document.querySelector('#lesson-count');
const feedback = document.querySelector('#form-feedback');
const STORAGE_KEY = 'arquitetura-de-computadores-lessons';
const ADMIN_PASSWORD = 'dinis2024';
let editingCard = null;
let supabaseClient = null;

const isAdminPage = window.location.pathname.endsWith('/admin.html') || window.location.pathname.endsWith('admin.html');

if (isAdminPage) {
  const storedAccess = sessionStorage.getItem('portfolio-admin-auth');
  if (!storedAccess) {
    const password = window.prompt('Palavra-passe de administração:');
    if (password !== ADMIN_PASSWORD) {
      window.location.href = './index.html';
      throw new Error('Acesso negado');
    }
    sessionStorage.setItem('portfolio-admin-auth', 'true');
  }
}

if (!grid || !searchInput) {
  throw new Error('Página pública sem grelha de aulas.');
}

function getSupabaseConfig() {
  const config = window.LESSON_CONFIG || {};
  return { url: config.url || '', key: config.key || '' };
}

function hasSupabaseConfig() {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key && window.supabase);
}

function extractLessonNumbers(value = '') {
  const numbers = [...String(value).matchAll(/\d+/g)].map((match) => Number(match[0]));
  return numbers.length > 0 ? numbers : [Number.MAX_SAFE_INTEGER];
}

function compareLessonNumbers(aValue, bValue) {
  const aNumbers = extractLessonNumbers(aValue);
  const bNumbers = extractLessonNumbers(bValue);

  for (let index = 0; index < Math.max(aNumbers.length, bNumbers.length); index += 1) {
    const aNumber = aNumbers[index] ?? Number.MAX_SAFE_INTEGER;
    const bNumber = bNumbers[index] ?? Number.MAX_SAFE_INTEGER;

    if (aNumber !== bNumber) {
      return aNumber - bNumber;
    }
  }

  return 0;
}

function saveLessons() {
  const lessons = [...grid.querySelectorAll('.lesson-card')].map((card) => ({
    number: card.dataset.number || '',
    summary: card.dataset.summary || '',
    comment: card.dataset.comment || '',
  }));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
}

function buildCard({ number = '', summary = '', comment = '' } = {}) {
  const numberValue = String(number || '').trim();
  const summaryValue = String(summary || '').trim();
  const commentValue = String(comment || '').trim();
  const formattedNumber = numberValue
    .replace(/\s*e\s*/gi, ' e ')
    .replace(/\s*\/\s*/g, ' / ')
    .replace(/\s+/g, ' ')
    .trim();
  const title = `Aula ${formattedNumber || 'Sem número'}`;
  const searchTerms = `${summaryValue} ${commentValue} ${formattedNumber}`.toLowerCase();
  const card = document.createElement('article');

  card.className = 'lesson-card';
  card.dataset.search = searchTerms;
  card.dataset.comment = commentValue;
  card.dataset.number = numberValue;
  card.dataset.summary = summaryValue;
  card.dataset.title = title;
  card.innerHTML = '<div class="card-top"><span class="lesson-number"></span><div class="card-actions"><button class="edit-btn" type="button">Editar</button><button class="delete-btn" type="button">Apagar</button></div></div><div class="card-body"><p></p></div><div class="lesson-comment"><h4>Comentário da aula</h4><p></p></div>';
  card.querySelector('.lesson-number').textContent = title;
  card.querySelector('.card-body > p').textContent = summaryValue;
  card.querySelector('.lesson-comment p').textContent = commentValue;

  const editButton = card.querySelector('.edit-btn');
  editButton.addEventListener('click', () => {
    editingCard = card;
    document.querySelector('#lesson-number').value = card.dataset.number || '';
    document.querySelector('#lesson-summary').value = card.dataset.summary || '';
    document.querySelector('#lesson-comment').value = card.dataset.comment || '';
    document.querySelector('#lesson-number').focus();
    feedback.textContent = 'Aula escolhida para editar. Corrige e guarda novamente.';
    setTimeout(() => { feedback.textContent = ''; }, 4000);
  });

  const deleteButton = card.querySelector('.delete-btn');
  deleteButton.addEventListener('click', async () => {
    const shouldDelete = window.confirm('Queres apagar esta aula?');
    if (!shouldDelete) {
      return;
    }

    if (hasSupabaseConfig() && supabaseClient) {
      const lessonNumber = card.dataset.number || '';
      const lessonSummary = card.dataset.summary || '';
      const lessonComment = card.dataset.comment || '';

      await supabaseClient.from('lessons').delete().match({
        number: lessonNumber,
        summary: lessonSummary,
        comment: lessonComment,
      });
    }

    card.remove();
    saveLessons();
    updateResults();
    feedback.textContent = 'Aula apagada do teu caderno de bordo.';
    setTimeout(() => { feedback.textContent = ''; }, 4000);
  });

  return card;
}

function sortCards() {
  const cards = [...grid.querySelectorAll('.lesson-card')];

  cards.sort((cardA, cardB) => {
    const aValue = cardA.dataset.number || cardA.querySelector('.lesson-number')?.textContent || '';
    const bValue = cardB.dataset.number || cardB.querySelector('.lesson-number')?.textContent || '';
    return compareLessonNumbers(aValue, bValue);
  });

  cards.forEach((card) => {
    grid.appendChild(card);
  });
}

async function initSupabase() {
  const { url, key } = getSupabaseConfig();
  if (!url || !key || !window.supabase) {
    return;
  }

  supabaseClient = window.supabase.createClient(url, key);
  const { data, error } = await supabaseClient.from('lessons').select('*').order('number', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Supabase error:', error.message);
    return;
  }

  grid.innerHTML = '';
  data.forEach((lesson) => {
    const card = buildCard({
      number: lesson.number,
      summary: lesson.summary,
      comment: lesson.comment,
    });
    grid.appendChild(card);
  });
  sortCards();
  saveLessons();
  updateResults();
}

function loadLessons() {
  const savedLessons = localStorage.getItem(STORAGE_KEY);

  if (!savedLessons) {
    return;
  }

  try {
    const lessons = JSON.parse(savedLessons) || [];
    lessons.forEach((lesson) => {
      const card = buildCard(lesson);
      grid.appendChild(card);
    });
    sortCards();
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function updateResults() {
  const term = searchInput.value.trim().toLowerCase();
  const cards = [...grid.querySelectorAll('.lesson-card')];
  let visible = 0;

  cards.forEach((card) => {
    const matches = (card.dataset.search || '').includes(term);
    card.hidden = !matches;
    if (matches) visible += 1;
  });

  count.textContent = cards.length;
  if (term) {
    count.textContent = visible;
  }

  emptyState.hidden = visible !== 0 || cards.length === 0;
  if (cards.length === 0) {
    emptyState.textContent = 'Ainda não existem aulas registadas.';
    emptyState.hidden = false;
  } else if (visible === 0) {
    emptyState.textContent = 'Não encontrei nenhuma aula com esse termo.';
    emptyState.hidden = false;
  }
}

searchInput.addEventListener('input', updateResults);

loadLessons();
updateResults();
initSupabase();

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const numberInput = document.querySelector('#lesson-number').value.trim();
  const summary = document.querySelector('#lesson-summary').value.trim();
  const comment = document.querySelector('#lesson-comment').value.trim();

  if (!summary && !comment && !numberInput) {
    feedback.textContent = 'Preenche pelo menos algum detalhe da aula.';
    setTimeout(() => { feedback.textContent = ''; }, 4000);
    return;
  }

  const isUpdate = Boolean(editingCard);
  const card = editingCard || buildCard();
  const number = numberInput || 'Aula';
  const formattedNumber = number
    .replace(/\s*e\s*/gi, ' e ')
    .replace(/\s*\/\s*/g, ' / ')
    .replace(/\s+/g, ' ')
    .trim();
  const title = `Aula ${formattedNumber}`;
  const searchTerms = `${summary} ${comment} ${formattedNumber}`.toLowerCase();

  if (!editingCard) {
    grid.appendChild(card);
  }

  card.dataset.search = searchTerms;
  card.dataset.comment = comment;
  card.dataset.number = numberInput;
  card.dataset.summary = summary;
  card.dataset.title = title;
  card.querySelector('.lesson-number').textContent = title;
  card.querySelector('.card-body > p').textContent = summary;
  card.querySelector('.lesson-comment p').textContent = comment;

  if (hasSupabaseConfig() && supabaseClient) {
    const payload = { number: numberInput, summary, comment };

    if (isUpdate && editingCard) {
      const currentNumber = editingCard.dataset.number || '';
      const currentSummary = editingCard.dataset.summary || '';
      const currentComment = editingCard.dataset.comment || '';

      await supabaseClient.from('lessons').update(payload).match({
        number: currentNumber,
        summary: currentSummary,
        comment: currentComment,
      });
    } else {
      await supabaseClient.from('lessons').insert(payload);
    }

    const { data } = await supabaseClient.from('lessons').select('*').order('number', { ascending: true, nullsFirst: false });
    grid.innerHTML = '';
    data.forEach((lesson) => {
      const lessonCard = buildCard({
        number: lesson.number,
        summary: lesson.summary,
        comment: lesson.comment,
      });
      grid.appendChild(lessonCard);
    });
    sortCards();
    saveLessons();
    updateResults();
  } else {
    saveLessons();
    sortCards();
    updateResults();
  }

  form.reset();
  editingCard = null;
  feedback.textContent = isUpdate ? 'Aula atualizada no teu caderno de bordo.' : 'Aula guardada no teu caderno de bordo.';
  setTimeout(() => { feedback.textContent = ''; }, 4000);
});
