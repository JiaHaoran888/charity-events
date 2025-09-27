const modalE = document.getElementById('modal');
const modalBodyE = document.getElementById('modal-body');
const modalCloseE = document.getElementById('modal-close');
if(modalCloseE){modalCloseE.addEventListener('click', ()=>modalE.classList.remove('show'))}
function queryParam(name){
  const url = new URL(location.href);
  return url.searchParams.get(name);
}
async function loadEvent(){
  const id = queryParam('id');
  if(!id){
    document.getElementById('event-detail').innerHTML = '<div class="card"><p>Event not specified.</p></div>';
    return;
  }
  const res = await fetch('/api/events/' + encodeURIComponent(id));
  if(res.status === 404){
    document.getElementById('event-detail').innerHTML = '<div class="card"><p>Event not found.</p></div>';
    return;
  }
  const ev = await res.json();
  const img = ev.image_url || '/assets/placeholder.jpg';
  const date = new Date(ev.event_date).toLocaleString(undefined,{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
  const priceLabel = parseFloat(ev.price) === 0 ? 'Free' : '$'+parseFloat(ev.price).toFixed(2);
  const progress = Math.round(ev.progress || 0);
  const tickets = (ev.tickets || []).map(t => `<div class="meta-item">${t.type} · $${parseFloat(t.price).toFixed(2)} · ${t.quantity} available</div>`).join('');
  document.getElementById('event-detail').innerHTML = `
    <div class="event-media">
      <img src="${img}" alt="${ev.name}">
      <div style="margin-top:12px" class="progress-wrap">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px">
          <span>Raised: $${parseFloat(ev.raised_amount).toFixed(2)}</span><span>Goal: $${parseFloat(ev.goal_amount).toFixed(2)}</span>
        </div>
        <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:6px">
          <div class="progress-bar" style="width:${progress}%"></div>
        </div>
      </div>
    </div>
    <div class="event-main">
      <h2>${ev.name}</h2>
      <p class="muted">${ev.category} · ${ev.location} · ${date}</p>
      <p style="margin-top:12px">${ev.description}</p>
      <div class="details-grid">
        <div class="meta-item"><strong>Price</strong><div>${priceLabel}</div></div>
        <div class="meta-item"><strong>Contact</strong><div>${ev.contact_email} · ${ev.phone}</div></div>
        <div class="meta-item"><strong>Address</strong><div>${ev.address || ev.location}</div></div>
        <div class="meta-item"><strong>Organization</strong><div>${ev.organization}</div></div>
      </div>
      <div style="margin-top:14px">
        <button class="button register">Register</button>
      </div>
      <h3 style="margin-top:18px">Tickets</h3>
      <div>${tickets || '<div class="muted">No ticket information available.</div>'}</div>
    </div>
  `;
  document.querySelector('.register').addEventListener('click', ()=>{
    modalBodyE.innerHTML = '<h3>Register</h3><p>This feature is currently under construction.</p>';
    modalE.classList.add('show');
  });
}
document.addEventListener('DOMContentLoaded', loadEvent);
