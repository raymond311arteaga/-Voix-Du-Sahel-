import { app } from "../firebase-config.js";
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { dict } from "./i18n.js";

const db = getFirestore(app);
const $ = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));

/* ===== Default content ===== */
const DEFAULT_HERO = {
  hero_title_en: "Crisis in the Sahel: Between Terrorism and Hopes for Peace",
  hero_desc_en : "Explainers and reporting on security, diplomacy and humanitarian crises across the Sahel.",
  hero_title_fr: "Crise au Sahel : entre terrorisme et espoirs de paix",
  hero_desc_fr : "Décryptages et reportages sur la sécurité, la diplomatie et les crises humanitaires au Sahel."
};

const DEFAULT_FEED = [
  {
    section:"security", id:"boko_rural_shift", order:1,
    // Nigeria / manga, convoy  temática Boko Haram / Lago Chad
    mediaUrl:"https://images.unsplash.com/photo-1580795479048-f8b5bfa5e3fd?q=80&w=1600&auto=format&fit=crop",
    title_en:"Boko Harams rural shift intensifies civilian targeting",
    desc_en :"After emergency measures, the group adapted to rural operations using kidnappings and suicide bombers as factions compete for recruits.",
    title_fr:"Le basculement rural de Boko Haram accroît les attaques contre les civils",
    desc_fr :"Après les mesures durgence, le groupe sest adapté aux opérations rurales en recourant aux enlèvements et aux kamikazes, tandis que ses factions rivalisent pour recruter."
  },
  {
    section:"security", id:"aes_ecowas_split", order:2,
    // Sahel alliance / militar  pick-up desierto
    mediaUrl:"https://images.unsplash.com/photo-1465447142348-e9952c393450?q=80&w=1600&auto=format&fit=crop",
    title_en:"Mali, Niger and Burkina exit ECOWAS and launch a Sahel alliance",
    desc_en :"The withdrawal signals deepening rifts as insecurity spreads across borders and new regional structures emerge.",
    title_fr:"Mali, Niger et Burkina quittent la CEDEAO et lancent une alliance sahélienne",
    desc_fr :"Ce retrait traduit des fractures croissantes alors que linsécurité sétend aux zones frontalières et que de nouvelles structures régionales émergent."
  },
  {
    section:"diplomacy", id:"m23_ceasefire_push", order:3,
    // ONU sala de conferencias / DRC diplomacia
    mediaUrl:"https://images.unsplash.com/photo-1576085898323-218337e3e43a?q=80&w=1600&auto=format&fit=crop",
    title_en:"UN presses M23 and DRC to honor ceasefire commitments",
    desc_en :"Talks urge withdrawal from seized areas and safe returns as violations continue in North and South Kivu.",
    title_fr:"LONU presse le M23 et la RDC de respecter le cessez-le-feu",
    desc_fr :"Les pourparlers demandent un retrait des zones occupées et des retours sûrs alors que les violations se poursuivent au Nord et au Sud-Kivu."
  },
  {
    section:"diplomacy", id:"au_security_arch", order:4,
    // Unión Africana / Addis  bandera AU
    mediaUrl:"https://images.unsplash.com/photo-1550771777-98e0a0b6f2d6?q=80&w=1600&auto=format&fit=crop",
    title_en:"AU security architecture scales up counter-terror coordination",
    desc_en :"ACSRT/AUCTC, early-warning systems and AFRIPOL drive training, intel-sharing and cross-border policing with UN backing.",
    title_fr:"Larchitecture de sécurité de lUA intensifie la coordination antiterroriste",
    desc_fr :"Le CAERT/AUCTC, les systèmes dalerte précoce et AFRIPOL impulsent formation, partage de renseignement et police transfrontalière avec lappui de lONU."
  },
  {
    section:"humanitarian", id:"sudan_rsf_camps", order:5,
    // Campamento de desplazados / Sudán
    mediaUrl:"https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=1600&auto=format&fit=crop",
    title_en:"Sudan crisis: RSF sieges of camps heighten famine risk",
    desc_en :"Strikes on displacement sites and blocked aid push displacement past 12 million while hospitals and water systems collapse.",
    title_fr:"Crise au Soudan : les sièges des camps par les FSR aggravent le risque de famine",
    desc_fr :"Les frappes contre les sites de déplacés et les blocages de laide portent les déplacements au-delà de 12 millions tandis que les hôpitaux et réseaux deau seffondrent."
  },
  {
    section:"humanitarian", id:"sahel_food_outlook", order:6,
    // Sequía / agricultura Sahel
    mediaUrl:"https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?q=80&w=1600&auto=format&fit=crop",
    title_en:"Sahel hunger outlook: acute food insecurity widens",
    desc_en :"Conflict, climate shocks and displacement leave millions at risk; agencies warn of escalating needs across the belt.",
    title_fr:"Perspective de faim au Sahel : linsécurité alimentaire aiguë sétend",
    desc_fr :"Conflits, chocs climatiques et déplacements mettent des millions en danger ; les agences alertent sur une hausse des besoins dans toute la bande sahélienne."
  }
];
/* ===================================== */

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
  const snap = await getDoc(doc(db,"settings","homepage")).catch(()=>null);
  return snap && snap.exists()? snap.data() : DEFAULT_HERO;
}

async function loadAllCards(){
  try{
    const qSecs = query(collection(db,"sections"), orderBy("order","asc"));
    const secSn = await getDocs(qSecs);
    const feed = [];
    for (const s of secSn.docs){
      const cardsQ = query(collection(s.ref,"cards"), orderBy("order","asc"));
      const cardsSn = await getDocs(cardsQ);
      cardsSn.docs.forEach(d=> feed.push({ section:s.id, id:d.id, ...d.data() }));
    }
    feed.sort((a,b)=> (a.order||999)-(b.order||999));
    return feed.length ? feed : DEFAULT_FEED;
  }catch(e){ return DEFAULT_FEED; }
}

// Evita caché cuando el usuario cambie la imagen
function withBuster(url){ if(!url) return url; const sep = url.includes("?")?"&":"?"; return url + sep + "t="+Date.now(); }

function mediaNode(url, alt){
  const box = document.createElement("div"); box.className="media";
  if(!url){ box.innerHTML = `<div style="padding:30px;color:#94a3b8">No media</div>`; return box; }
  if(/youtube\\.com|youtu\\.be/.test(url)){ const f=document.createElement("iframe"); f.src=url.replace("watch?v=","embed/"); f.allowFullscreen=true; box.appendChild(f); }
  else if(/\\.mp4(\\?|$)/.test(url)){ const v=document.createElement("video"); v.src=withBuster(url); v.controls=true; box.appendChild(v); }
  else { const img=document.createElement("img"); img.src=withBuster(url); img.alt=alt||""; box.appendChild(img); }
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
    const tools = `<span class="badge">Edit</span><div class="tools"><button class="tool" data-action="open"></button></div>`;
    const meta = `<div class="meta"><h3>${c[`title_${lang}`]||""}</h3><p>${c[`desc_${lang}`]||""}</p></div>`;
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
