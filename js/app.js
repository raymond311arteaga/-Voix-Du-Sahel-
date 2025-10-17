import { app } from "../firebase-config.js";
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { dict } from "./i18n.js";

const db = getFirestore(app);
const $ = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));

export let lang = localStorage.getItem("lang") || "en";
export const setLang = (v)=>{ lang=v; localStorage.setItem("lang",v); applyI18n(); render(); };

function t(k){ return dict[lang][k]; }

function applyI18n(){
  $("#brand").textContent = t("brand");
  $("#langBtn").textContent = lang==="fr"? "GB English" : "FR Français";
  $("#langBtnFooter").textContent = $("#langBtn").textContent;
  const now = new Date();
  $("#today").textContent = now.toLocaleDateString(lang==="fr"?"fr-FR":"en-GB",
      {weekday:'long',year:'numeric',month:'long',day:'numeric'});
  $("#y").textContent = now.getFullYear();
  $$("#brand,[data-i18n]").forEach(el => { const k=el.dataset.i18n; if(k) el.textContent = t(k); });
}

async function loadHomepage(){
  const snap = await getDoc(doc(db,"settings","homepage"));
  return snap.exists()? snap.data() : {};
}

async function loadAllCards(){
  // leemos todas las secciones y las convertimos en un solo array (feed)
  const qSecs = query(collection(db,"sections"), orderBy("order","asc"));
  const secSn = await getDocs(qSecs);
  const feed = [];
  for (const s of secSn.docs){
    const secId = s.id;
    const cardsQ = query(collection(s.ref,"cards"), orderBy("order","asc"));
    const cardsSn = await getDocs(cardsQ);
    cardsSn.docs.forEach(d=>{
      feed.push({ section:secId, id:d.id, ...d.data() });
    });
  }
  // orden simple: por "order" y luego por sección
  feed.sort((a,b)=> (a.order||999)-(b.order||999));
  return feed;
}

function mediaNode(url, alt){
  const box = document.createElement("div"); box.className="media";
  if(!url){ box.innerHTML = `<div style="padding:30px;color:#94a3b8">No media</div>`; return box; }
  if(/youtube\\.com|youtu\\.be/.test(url)){ const f=document.createElement("iframe"); f.src=url.replace("watch?v=","embed/"); f.allowFullscreen=true; box.appendChild(f); }
  else if(/\\.mp4(\\?|$)/.test(url)){ const v=document.createElement("video"); v.src=url; v.controls=true; box.appendChild(v); }
  else { const img=document.createElement("img"); img.src=url; img.alt=alt||""; box.appendChild(img); }
  return box;
}

export async function render(){
  applyI18n();
  const hp = await loadHomepage();
  $("#heroTitle").textContent = hp[`hero_title_${lang}`] || "";
  $("#heroDesc").textContent  = hp[`hero_desc_${lang}`]  || "";

  const feedEl = $("#feed");
  feedEl.innerHTML = "";
  const items = await loadAllCards();

  for(const c of items){
    const card = document.createElement("article");
    card.className="card"; card.dataset.key=c.id; card.dataset.section=c.section;
    const tools = `<span class="badge">Edit</span><div class="tools">
        <button class="tool" data-action="open"></button>
      </div>`;
    const meta = `<div class="meta"><h3>${c[`title_${lang}`]||""}</h3>
      <p>${c[`desc_${lang}`]||""}</p></div>`;
    card.innerHTML = tools;
    card.appendChild(mediaNode(c.mediaUrl, c[`title_${lang}`]));
    card.insertAdjacentHTML("beforeend", meta);
    feedEl.appendChild(card);
  }

  document.dispatchEvent(new CustomEvent("rendered"));
}

applyI18n(); render();

$("#langBtn").addEventListener("click", ()=> setLang(lang==="en"?"fr":"en"));
$("#langBtnFooter").addEventListener("click", ()=> $("#langBtn").click());
