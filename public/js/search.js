const form = document.getElementById('search-form');
const results = document.getElementById('results');
const noResults = document.getElementById('no-results');
const clearBtn = document.getElementById('clear');
const modalS = document.getElementById('modal');
const modalBodyS = document.getElementById('modal-body');
const modalCloseS = document.getElementById('modal-close');
if (modalCloseS) modalCloseS.addEventListener('click', () => modalS.classList.remove('show'));

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function createCardLink(item) {
  const link = document.createElement('a');
  link.className = 'event-card card';
  link.href = '/event.html?id=' + encodeURIComponent(item.id);
  link.setAttribute('aria-label', item.name || 'Event');
  const d = new Date(item.event_date);
  const dateLabel = isNaN(d) ? '' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const image = item.image_url || '/assets/placeholder.jpg';
  const priceLabel = parseFloat(item.price) === 0 ? 'Free' : ('$' + parseFloat(item.price).toFixed(2));
  link.innerHTML = `
    <img src="${escapeHtml(image)}" alt="${escapeHtml(item.name)}">
    <div class="meta">
      <h4>${escapeHtml(item.name)}</h4>
      <p class="muted">${escapeHtml(item.location || '')} · ${escapeHtml(dateLabel)}</p>
      <div class="row">
        <span class="badge">${escapeHtml(item.category || '')}</span>
        <span class="badge">${escapeHtml(priceLabel)}</span>
      </div>
    </div>
  `;
  return link;
}

async function fetchCategories() {
  const cat = document.getElementById('category');
  if (!cat) return;
  try {
    const res = await fetch('/api/categories');
    if (!res.ok) return;
    const cats = await res.json();
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      cat.appendChild(opt);
    });
  } catch (e) {}
}

async function doSearch() {
  const date = document.getElementById('date').value;
  const location = document.getElementById('location').value.trim();
  const category = document.getElementById('category').value;
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (location) params.append('location', location);
  if (category) params.append('category', category);
  try {
    results.innerHTML = '';
    noResults.hidden = true;
    const res = await fetch('/api/search?' + params.toString());
    if (!res.ok) throw new Error('search failed');
    const items = await res.json();
    if (!items || items.length === 0) {
      noResults.hidden = false;
      return;
    }
    noResults.hidden = true;
    items.forEach(item => {
      const card = createCardLink(item);
      results.appendChild(card);
    });
  } catch (e) {
    results.innerHTML = '';
    noResults.hidden = false;
    noResults.textContent = 'An error occurred while searching. Please try again.';
  }
}

function clearFilters() {
  form.reset();
  results.innerHTML = '';
  noResults.hidden = true;
}

async function init() {
  await fetchCategories();
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    await doSearch();
  });
  clearBtn.addEventListener('click', clearFilters);
}

document.addEventListener('DOMContentLoaded', init);
