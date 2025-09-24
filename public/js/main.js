const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
if(modalClose){modalClose.addEventListener('click', ()=>{modal.classList.remove('show')})}
function showModal(html){modalBody.innerHTML=html;modal.classList.add('show')}

async function loadHome(){
  const res = await fetch('/api/home');
  const data = await res.json();
  const upEl = document.getElementById('upcoming-list');
  const popEl = document.getElementById('popular-list');
  upEl.innerHTML = '';
  popEl.innerHTML = '';
  data.upcoming.forEach(renderCardInto(upEl));
  data.popular.forEach(renderCardInto(popEl));
}
function renderCardInto(container){
  return function(ev){
    const div = document.createElement('div');
    div.className = 'event-card card';
    const d = new Date(ev.event_date);
    const isFree = parseFloat(ev.price) === 0;
    const dateLabel = d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});
    const image = ev.image_url || '/assets/placeholder.jpg';
    div.innerHTML = `<img src="${image}" alt="${ev.name}"><div class="meta"><h4>${ev.name}</h4><p class="muted">${ev.location} · ${dateLabel}</p><div class="row"><span class="badge">${ev.category}</span><span class="badge">${isFree? 'Free' : '$'+parseFloat(ev.price).toFixed(2)}</span></div></div>`;
    div.addEventListener('click', ()=>{location.href='/event.html?id='+ev.id});
    container.appendChild(div);
  };
}
document.addEventListener('DOMContentLoaded', loadHome);
document.addEventListener('click', (e) => {
  if(e.target && e.target.matches('.register')) {
    showModal('<h3>Registration</h3><p>This feature is currently under construction.</p>');
  }
});
