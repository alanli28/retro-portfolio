const config = window.PORTFOLIO;
const base = 'assets/';
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const safeUrl = value => {
  const url = new URL(String(value), location.href);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Use a relative or HTTP(S) project link.');
  return escapeHTML(url.href);
};
const attachmentUrl = safeUrl;
document.title = config.title;
document.querySelectorAll('[data-name]').forEach(el => el.textContent = config.name);
document.querySelector('#headline').textContent = config.headline;
document.querySelector('#headline-accent').textContent = config.headlineAccent;
document.querySelector('#bio').textContent = config.bio;
document.querySelector('#footer-copy').textContent = config.footer;
const email = document.querySelector('#email');
email.textContent = config.email + ' ↗';
email.href = 'mailto:' + config.email;
const projects = config.projects.map(project => ({...project, title: escapeHTML(project.title), tag: escapeHTML(project.tag), context: escapeHTML(project.context), summary: escapeHTML(project.summary), text: escapeHTML(project.text || project.summary), image: escapeHTML(project.image), links: (project.links || []).map(([label, url]) => [escapeHTML(label), url])}));
document.querySelectorAll('[data-filter]').forEach(button=>{button.querySelector('sup').textContent=projects.filter(p=>button.dataset.filter==='all'||p.tag===button.dataset.filter).length});
const list=document.querySelector('#projects'),dialog=document.querySelector('#detail');let lastFocus;
const courseLabels={},listCopy={};
projects.forEach((p,i)=>{const b=document.createElement('button');b.className='project-row';b.dataset.tag=p.tag;b.setAttribute('aria-controls','notes-board');b.setAttribute('aria-label',`Explore ${p.title}`);b.innerHTML=`<span class="number">${String(i+1).padStart(2,'0')}</span><div class="project-copy"><div class="metadata"><span class="tag ${p.tag}">${p.tag.toUpperCase()}</span><span>${(courseLabels[p.title]?.replace(/\b(\d{2})\b/g,'’$1')||p.context)}</span></div><h3><span class="project-name">${listCopy[p.title]?.listTitle||p.title}</span></h3><p>${listCopy[p.title]?.listSummary||p.summary}</p></div><img class="project-image" src="assets/projects/${p.image}" alt="${p.title} project image" loading="lazy"><span class="row-arrow" aria-hidden="true">↗</span>`;b.onclick=()=>openProject(p);list.append(b)});
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',x===b));document.querySelectorAll('.project-row').forEach(row=>row.hidden=b.dataset.filter!=='all'&&row.dataset.tag!==b.dataset.filter)});
const board=document.createElement('aside');board.id='notes-board';board.setAttribute('aria-label','Open project notes');
board.innerHTML='<div class="notes-grid"></div>';
document.body.append(board);
const grid=board.querySelector('.notes-grid'),openNotes=new Map();let noteSequence=0;
function placeNote(cell){
 const note=cell.querySelector('.sticky-note');if(!note)return;
 const w=cell.clientWidth,h=cell.clientHeight,angle=Number(note.dataset.angle),rad=angle*Math.PI/180;
 const size=Number(getComputedStyle(document.documentElement).getPropertyValue('--crt-note-size'))||1;
 let nw=240*size,nh=300*size;const cos=Math.abs(Math.cos(rad)),sin=Math.abs(Math.sin(rad));
 const fit=Math.min(1,(w-16)/(nw*cos+nh*sin),(h-16)/(nh*cos+nw*sin));nw*=fit;nh*=fit;
 note.style.width=nw+'px';note.style.height=nh+'px';
 const bw=nw*cos+nh*sin,bh=nh*cos+nw*sin;
 let cx=Number(note.dataset.cx),cy=Number(note.dataset.cy);
 if(!Number.isFinite(cx)||!Number.isFinite(cy)){cx=w*.55+bw/2+Math.random()*Math.max(0,w*.45-bw-16);cy=bh/2+8+Math.random()*Math.max(0,h-bh-16)}
 const clampX=x=>Math.max(bw/2+8,Math.min(w-bw/2-8,x)),clampY=y=>Math.max(bh/2+8,Math.min(h-bh/2-8,y));cx=clampX(cx);cy=clampY(cy);
 const screen=document.querySelector('.crt-viewport')?.getBoundingClientRect();
 if(screen&&cx+bw/2>screen.left-6&&cx-bw/2<screen.right+6&&cy+bh/2>screen.top-6&&cy-bh/2<screen.bottom+6){
 const candidates=[[screen.left-bw/2-6,cy],[screen.right+bw/2+6,cy],[cx,screen.top-bh/2-6],[cx,screen.bottom+bh/2+6]].filter(([x,y])=>x>=bw/2+8&&x<=w-bw/2-8&&y>=bh/2+8&&y<=h-bh/2-8);
 candidates.sort((a,b)=>(a[0]-cx)**2+(a[1]-cy)**2-((b[0]-cx)**2+(b[1]-cy)**2));if(candidates.length)[cx,cy]=candidates[0];
 }
 note.dataset.cx=cx;note.dataset.cy=cy;note.style.left=(cx-nw/2)+'px';note.style.top=(cy-nh/2)+'px';note.style.transform=`rotate(${angle}deg)`;
}
document.addEventListener('layout-tune',()=>[...grid.children].forEach(placeNote));
const noteResize=new ResizeObserver(entries=>entries.forEach(e=>placeNote(e.target)));
function openProject(p){
 if(openNotes.has(p.title)){const existing=openNotes.get(p.title);existing.style.zIndex=++noteSequence;existing.querySelector('.note-close').focus({preventScroll:true});return}
 const cell=document.createElement('div');cell.className='note-cell';cell.style.zIndex=++noteSequence;grid.append(cell);
 const note=document.createElement('article');note.className='sticky-note';note.setAttribute('aria-label',p.title);note.dataset.angle=(Math.random()*30-15).toFixed(2);
 note.innerHTML=`<div class="note-drag" title="Drag sticky note" aria-label="Drag sticky note"></div><button class="note-rotate" aria-label="Rotate sticky note" title="Drag to rotate">↻</button><button class="note-close" aria-label="Close ${p.title}">×</button><div class="note-body"><div class="note-meta">${p.tag.toUpperCase()} / ${(courseLabels[p.title]?.replace(/\b(\d{2})\b/g,'’$1')||p.context)}</div><h2>${listCopy[p.title]?.listTitle||p.title}</h2><p>${p.text||p.summary}</p><img loading="lazy" src="assets/projects/${p.image}" alt="${p.title}">${p.video?`<video controls preload="none" src="${attachmentUrl(p.video)}" aria-label="Project demonstration"></video>`:''}<div class="note-links">${(p.links||[]).map(([label,url])=>`<a href="${attachmentUrl(url)}" target="_blank" rel="noopener">${label} ↗</a>`).join('')}</div></div>`;
 cell.append(note);openNotes.set(p.title,cell);noteResize.observe(cell);placeNote(cell);
 const handle=note.querySelector('.note-drag'),rotate=note.querySelector('.note-rotate');let drag;
 function start(e,mode){if(e.button!==0)return;e.preventDefault();cell.style.zIndex=++noteSequence;e.currentTarget.setPointerCapture(e.pointerId);const cx=Number(note.dataset.cx),cy=Number(note.dataset.cy);drag={mode,x:e.clientX,y:e.clientY,cx,cy,angle:Number(note.dataset.angle),start:Math.atan2(e.clientY-cy,e.clientX-cx)};note.classList.add('dragging')}
 function move(e){if(!drag)return;if(drag.mode==='rotate'){note.dataset.angle=drag.angle+(Math.atan2(e.clientY-drag.cy,e.clientX-drag.cx)-drag.start)*180/Math.PI}else{note.dataset.cx=drag.cx+e.clientX-drag.x;note.dataset.cy=drag.cy+e.clientY-drag.y}placeNote(cell)}
 const endDrag=()=>{drag=null;note.classList.remove('dragging')};
 for(const [control,mode] of [[handle,'move'],[rotate,'rotate']]){control.onpointerdown=e=>start(e,mode);control.onpointermove=move;control.onpointerup=endDrag;control.onpointercancel=endDrag;control.onlostpointercapture=endDrag}
 note.querySelector('.note-close').onclick=()=>{note.querySelector('video')?.pause();noteResize.unobserve(cell);openNotes.delete(p.title);cell.remove()};

}
