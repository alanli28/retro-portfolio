(()=>{
const settings=[['size','Computer size',.5,3,.01,1.05],['position','Vertical position',-100,100,1,0],['horizontal','Horizontal position',-100,100,.5,0],['note-size','Sticky size',.4,1.4,.05,1],['curve','Curvature',0,150,1,6],['lines','Scanlines',0,.22,.005,.035],['rgb','Phosphor texture',0,.18,.005,.01],['separation','RGB separation',0,2,.1,1.1],['brightness','Brightness',.7,1.3,.01,.99],['contrast','Contrast',.7,1.5,.01,1],['saturation','Saturation',0,1.6,.05,.9],['vignette','Vignette',0,.6,.01,.22],['reflection','Glass reflection',0,.6,.01,.16],['warmth','Warmth',0,.3,.01,.06]];
if(window.matchMedia('(max-width:700px)').matches){
 for(const [id,value] of [['size',2.58],['position',46],['horizontal',24.5],['curve',4],['separation',.6]])settings.find(setting=>setting[0]===id)[5]=value;
}
const backdrop=document.createElement('div');backdrop.className='office-glass';backdrop.setAttribute('aria-hidden','true');document.body.prepend(backdrop);
const machine=document.createElement('div');machine.className='macintosh';
machine.innerHTML='<div class="mac-recess" aria-hidden="true"></div><div class="mac-chin" aria-hidden="true"><span class="mac-apple">●</span><span class="mac-name">Macintosh Plus</span><div class="floppy"><span></span></div><i class="mac-led"></i></div><div class="mac-foot" aria-hidden="true"></div>';
document.body.prepend(machine);
const viewport=document.createElement('div');viewport.className='crt-viewport';
for(const el of [...document.body.children])if(el.matches('header,main,footer'))viewport.append(el);
const surface=document.createElement('div');surface.className='crt-content';while(viewport.firstChild)surface.append(viewport.firstChild);viewport.append(surface);machine.append(viewport);
function frameScreen(){
 const width=machine.offsetWidth,height=machine.offsetHeight;
 const scale=window.innerWidth*.5/(width*.74);
 machine.style.setProperty('--intro-scale',scale);
 machine.style.setProperty('--intro-top',(window.innerHeight*.5+height*.149333333*scale)+'px');
}
frameScreen();window.addEventListener('resize',frameScreen);
machine.classList.add('intro-zoom');
machine.addEventListener('animationend',()=>document.dispatchEvent(new Event('layout-tune')));
const glass=document.createElement('div');glass.className='crt-glass';glass.setAttribute('aria-hidden','true');machine.append(glass);
const controls=document.createElement('div');controls.className='crt-controls';
controls.innerHTML=`<button id="crt-toggle" aria-pressed="true">CRT ON</button><button id="crt-tune" aria-expanded="false" aria-controls="crt-panel">Tune ↗</button><div id="crt-panel" hidden><div class="tune-heading">COLOR DISPLAY <span>Layout & CRT</span></div>${settings.map(([id,label,min,max,step,value])=>`<label for="crt-${id}"><span>${label}</span><input id="crt-${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"><output id="value-${id}" for="crt-${id}">${value}</output></label>`).join('')}<label class="background-choice" for="crt-background"><span>Background</span><select id="crt-background"><option value="classic">Original</option><option value="glass" selected>Green glass</option></select></label><button id="crt-reset">Reset to default</button></div>`;
document.body.append(controls);document.body.classList.add('crt-on','office-glass-on');
const backgroundChoice=document.getElementById('crt-background');backgroundChoice.onchange=()=>document.body.classList.toggle('office-glass-on',backgroundChoice.value==='glass');
const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');
svg.innerHTML='<defs><clipPath id="mac-screen" clipPathUnits="objectBoundingBox"><path d="M .10 .035 C .34 .012 .66 .012 .90 .035 C .955 .04 .975 .065 .978 .12 C .994 .36 .994 .64 .978 .88 C .975 .935 .955 .96 .90 .965 C .66 .988 .34 .988 .10 .965 C .045 .96 .025 .935 .022 .88 C .006 .64 .006 .36 .022 .12 C .025 .065 .045 .04 .10 .035 Z"/></clipPath><filter id="crt-warp" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB"><feImage id="crt-map" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map"/><feDisplacementMap in="SourceGraphic" in2="map" scale="18" xChannelSelector="R" yChannelSelector="G"/></filter></defs>';
document.body.append(svg);
const c=document.createElement('canvas');c.width=128;c.height=128;const ctx=c.getContext('2d'),pixels=ctx.createImageData(128,128);
for(let y=0;y<128;y++)for(let x=0;x<128;x++){const px=x/127*2-1,py=y/127*2-1,r=(px*px+py*py)/2,i=(y*128+x)*4;pixels.data[i]=128+px*r*110;pixels.data[i+1]=128+py*r*110;pixels.data[i+2]=128;pixels.data[i+3]=255}ctx.putImageData(pixels,0,0);svg.querySelector('#crt-map').setAttribute('href',c.toDataURL());svg.querySelector('#crt-map').setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',c.toDataURL());
function sizeCurve(){
 const width=viewport.clientWidth,height=viewport.clientHeight,filter=svg.querySelector('#crt-warp'),map=svg.querySelector('#crt-map');
 filter.setAttribute('filterUnits','userSpaceOnUse');filter.setAttribute('primitiveUnits','userSpaceOnUse');
 for(const el of [filter,map]){el.setAttribute('x','0');el.setAttribute('y','0');el.setAttribute('width',width);el.setAttribute('height',height)}
}
new ResizeObserver(sizeCurve).observe(viewport);sizeCurve();
function tune(){for(const [id] of settings){const value=document.getElementById('crt-'+id).value;document.documentElement.style.setProperty('--crt-'+id,value);document.getElementById('value-'+id).value=value}svg.querySelector('feDisplacementMap').setAttribute('scale',document.getElementById('crt-curve').value);document.dispatchEvent(new Event('layout-tune'))}
for(const [id] of settings)document.getElementById('crt-'+id).oninput=tune;
document.querySelector('#crt-reset').onclick=()=>{for(const [id,,,,,value] of settings)document.getElementById('crt-'+id).value=value;backgroundChoice.value='glass';backgroundChoice.onchange();tune()};tune();
const toggle=document.querySelector('#crt-toggle'),panel=document.querySelector('#crt-panel');toggle.onclick=()=>{const active=document.body.classList.toggle('crt-on');toggle.textContent=active?'CRT ON':'CRT OFF';toggle.setAttribute('aria-pressed',active)};
document.querySelector('#crt-tune').onclick=e=>{panel.hidden=!panel.hidden;e.currentTarget.setAttribute('aria-expanded',!panel.hidden)};
const dialog=document.querySelector('#detail');new MutationObserver(()=>{viewport.style.overflow=dialog.open?'hidden':'auto'}).observe(dialog,{attributes:true,attributeFilter:['open']});
})();
