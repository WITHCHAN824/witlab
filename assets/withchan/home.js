const search=document.querySelector('#search');
const buttons=[...document.querySelectorAll('[data-filter]')];
const cards=[...document.querySelectorAll('.game')];
let selected='전체';
function render(){const query=search.value.trim().toLocaleLowerCase();let shown=0;for(const card of cards){const match=(selected==='전체'||card.dataset.group===selected)&&card.dataset.search.toLocaleLowerCase().includes(query);card.hidden=!match;if(match)shown++;}document.querySelector('#count').textContent=`${shown}개 게임·앱`;document.querySelector('#empty').hidden=shown>0;for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.filter===selected));}
buttons.forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.filter;render();}));
search.addEventListener('input',render);
document.querySelector('#reset').addEventListener('click',()=>{selected='전체';search.value='';render();search.focus();});
