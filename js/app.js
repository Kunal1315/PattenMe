const DB_KEY = 'patternme_accounts_v2';
const SESSION_KEY = 'patternme_session_v2';

function getAccounts(){try{return JSON.parse(localStorage.getItem(DB_KEY)||'{}')}catch{return {}}}
function saveAccounts(accounts){localStorage.setItem(DB_KEY,JSON.stringify(accounts))}
function getSession(){return localStorage.getItem(SESSION_KEY)}
function currentAccount(){const email=getSession();if(!email)return null;return getAccounts()[email]||null}
function setSession(email){localStorage.setItem(SESSION_KEY,email)}
function clearSession(){localStorage.removeItem(SESSION_KEY)}
function requireAuth(){if(!getSession()||!currentAccount()){location.href='login.html';return false}return true}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function entries(){const a=currentAccount();return a?.entries||{}}
function saveEntry(date,data){const accounts=getAccounts(),email=getSession();if(!accounts[email])return;accounts[email].entries=accounts[email].entries||{};accounts[email].entries[date]=data;saveAccounts(accounts)}
function deleteEntry(date){const accounts=getAccounts(),email=getSession();if(accounts[email]?.entries){delete accounts[email].entries[date];saveAccounts(accounts)}}
function todayISO(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function formatDate(date){if(!date)return '—';return new Date(date+'T12:00:00').toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}
function allEntries(){return Object.entries(entries()).sort((a,b)=>b[0].localeCompare(a[0]))}
function average(arr,key){const values=arr.map(([,v])=>Number(v[key])).filter(n=>Number.isFinite(n));return values.length?values.reduce((a,b)=>a+b,0)/values.length:0}
function metric(id,value,note){const el=document.getElementById(id);if(el)el.innerHTML=`<div class="metric">${value}</div><div class="metric-note">${note}</div>`}
function renderNav(active){const a=currentAccount();const initials=(a?.name||'P').trim().split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase();const links=[['dashboard.html','Overview','dashboard'],['checkin.html','Daily check-in','checkin'],['history.html','History','history'],['insights.html','Insights','insights']];document.getElementById('topbar').innerHTML=`<div class="topbar-inner"><a class="brand" href="dashboard.html"><span class="brand-mark">P</span>PatternMe</a><nav class="nav">${links.map(([url,label,key])=>`<a class="${active===key?'active':''}" href="${url}">${label}</a>`).join('')}</nav><div class="user-tools"><span class="avatar">${esc(initials)}</span><span class="user-name">${esc(a?.name||'User')}</span><button class="secondary" onclick="logout()" style="padding:8px 11px">Log out</button></div></div>`}
function logout(){clearSession();location.href='login.html'}
function showMessage(text,type='notice'){const el=document.getElementById('message');if(el){el.className=type;el.textContent=text;el.hidden=false}}
function recentDays(count){const out=[];const now=new Date();for(let i=count-1;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);out.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`)}return out}
function insightList(){const all=allEntries().slice(0,30);if(!all.length)return ['Start with your first daily check-in. Patterns will appear as you add more days.'];const out=[];const study=average(all,'study'),sleep=average(all,'sleep'),screen=average(all,'screen'),focus=average(all,'focus');if(study>=2)out.push(`You average ${study.toFixed(1)} study hours per logged day. Keep a repeatable study block in your routine.`);else out.push('Try setting a small, consistent study goal. Even a focused 25-minute session is a useful start.');if(sleep>0&&sleep<7)out.push(`Your logged sleep averages ${sleep.toFixed(1)} hours. If possible, make room for a more regular sleep schedule.`);if(screen>=4)out.push(`Your screen time averages ${screen.toFixed(1)} hours. Consider one phone-free focus block each day.`);if(focus>=4)out.push(`Your focus rating averages ${focus.toFixed(1)}/5. Notice which routines help you feel this focused.`);if(out.length<2)out.push('Add notes about your mood and routine to make your personal patterns easier to understand.');return out}
function exportCSV(){const rows=[['Date','Sleep hours','Study hours','Screen hours','Exercise minutes','Focus / 5','Mood','Notes'],...allEntries().map(([date,v])=>[date,v.sleep,v.study,v.screen,v.exercise,v.focus,v.mood,v.notes||''])];const csv=rows.map(row=>row.map(cell=>`"${String(cell??'').replace(/"/g,'""')}"`).join(',')).join('\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='patternme-history.csv';a.click();URL.revokeObjectURL(url)}
function protectPage(){if(!requireAuth())return;const active=document.body.dataset.active;renderNav(active)}
