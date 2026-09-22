const form = document.querySelector('#lesson-form');
const grid = document.querySelector('#lessons-grid');
const searchInput = document.querySelector('#search-input');
const emptyState = document.querySelector('#empty-state');
const count = document.querySelector('#lesson-count');
const feedback = document.querySelector('#form-feedback');

function updateResults() {
  const term = searchInput.value.trim().toLowerCase();
  const cards = [...grid.querySelectorAll('.lesson-card')];
  let visible = 0;

  cards.forEach((card) => {
    const matches = card.dataset.search.includes(term);
    card.hidden = !matches;
    if (matches) visible += 1;
  });

  count.textContent = visible;
  emptyState.hidden = visible !== 0;
}

searchInput.addEventListener('input', updateResults);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = document.querySelector('#lesson-title').value.trim();
  const number = document.querySelector('#lesson-number').value.trim();
  const date = document.querySelector('#lesson-date').value.trim();
  const summary = document.querySelector('#lesson-summary').value.trim();
  const comment = document.querySelector('#lesson-comment').value.trim();
  const searchTerms = `${title} ${summary} ${comment} aula ${number}`.toLowerCase();
  const card = document.createElement('article');

  card.className = 'lesson-card';
  card.dataset.search = searchTerms;
  card.dataset.comment = comment;
  card.innerHTML = '<div class="card-top"><span class="lesson-number"></span><span class="lesson-date"></span></div><div class="card-body"><p class="card-tag">Novo registo</p><h3></h3><p></p></div><div class="lesson-comment"><h4>Comentário da aula</h4><p></p></div><div class="card-footer"><span>Ver sumário</span><span class="arrow-circle" aria-hidden="true">↗</span></div>';
  card.querySelector('.lesson-number').textContent = number.padStart(2, '0');
  card.querySelector('.lesson-date').textContent = date;
  card.querySelector('h3').textContent = title;
  card.querySelector('.card-body > p:last-child').textContent = summary;
  card.querySelector('.lesson-comment p').textContent = comment;

  grid.append(card);
  form.reset();
  feedback.textContent = 'Aula guardada no teu caderno de bordo.';
  updateResults();
  setTimeout(() => { feedback.textContent = ''; }, 4000);
});
