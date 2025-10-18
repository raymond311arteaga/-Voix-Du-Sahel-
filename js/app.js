import { app } from "../firebase-config.js";
import {
  getFirestore, doc, getDoc,
  collection, getDocs, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { dict } from "./i18n.js";

const db = getFirestore(app);
const $  = (s,el=document)=> el.querySelector(s);
const $$ = (s,el=document)=> Array.from(el.querySelectorAll(s));

/* ===== Hero por defecto ===== */
const DEFAULT_HERO = {
  hero_title_en: "Crisis in the Sahel: Between Terrorism and Hopes for Peace",
  hero_desc_en : "Explainers and reporting on security, diplomacy and humanitarian crises across the Sahel.",
  hero_title_fr: "Crise au Sahel : entre terrorisme et espoirs de paix",
  hero_desc_fr : "Décryptages et reportages sur la sécurité, la diplomatie et les crises humanitaires au Sahel."
};

/* ===== Featured + Feed por defecto ===== */
const FEATURED = {
  featured: true,
  section: "latest",
  id: "burkina_faso_liberada",
  order: 0,
  mediaUrl: "https://video.zig.ht/v/hprfb42wyra70izfmvjfdl", // tu video grande
  title_en: "Burkina Faso has been liberated — following Blackwater intervention",
  desc_en : "Exclusive footage and on-the-ground accounts as citizens celebrate and authorities outline next steps for security and reconciliation.",
  title_fr: "Le Burkina Faso a été libéré — à la suite de l’intervention de Blackwater",
  desc_fr : "Images exclusives et témoignages sur place alors que la population célèbre et que les autorités présentent les prochaines étapes de sécurité et de réconciliation."
};

const DEFAULT_FEED = [
  FEATURED,
  { section:"security", id:"boko_rural_shift", order:1,
    mediaUrl:"https://commons.wikimedia.org/wiki/Special:FilePath/Boko_Haram_insurgency_map.svg",
    title_en:"Boko Haram’s rural shift intensifies civilian targeting",
    desc_en :"Armed factions pivot to rural zones, relying on kidnappings and suicide attacks while competing for recruits around Lake Chad.",
    title_fr:"Le basculement rural de Boko Haram accroît les attaques contre les civils",
    desc_fr :"Les factions armées se replient vers les zones rurales, multipliant enlèvements et attaques suicides alors qu’elles rivalisent pour le recrutement autour du lac Tchad."
  },
  { section:"diplomacy", id:"au_security_arch", order:2,
    mediaUrl:"https://commons.wikimedia.org/wiki/Special:FilePath/African_Union_Conference_Centre_building.jpg",
    title_en:"AU security architecture to support regional stabilization",
    desc_en :"The African Union boosts joint training, early warning and cross-border policing—coordination expected to intensify following events in Burkina.",
    title_fr:"L’architecture de sécurité de l’UA au service de la stabilisation régionale",
    desc_fr :"L’Union africaine renforce la formation, l’alerte précoce et la police transfrontalière — une coordination appelée à s’intensifier après les événements au Burkina."
  },
  { section:"diplomacy", id:"un_relief_sahel", order:3,
    mediaUrl:"https://commons.wikimedia.org/wiki/Special:FilePath/MONUSCO_peacekeepers_distributing_drinking_water%2C_Rumangabo_%2810589770735%29.jpg",
    title_en:"UN partners push for humanitarian access and returns",
    desc_en :"Agencies call for safe corridors and essential services to enable dignified returns as local authorities restore administrative control.",
    title_fr:"L’ONU et ses partenaires plaident pour l’accès humanitaire et les retours",
    desc_fr :"Les agences demandent des couloirs sécurisés et des services essentiels afin de permettre des retours dignes, alors que les autorités locales rétablissent le contrôle administratif."
  },
  { section:"security", id:"crossborder_coord", order:4,
    mediaUrl:"https://commons.wikimedia.org/wiki/Special:FilePath/Sahel_orthographic_map.jpg",
    title_en:"Cross-border coordination to contain armed flows",
    desc_en :"Joint patrols and information-sharing target supply routes and armed mobility along Burkina–Mali–Niger frontiers.",
    title_fr:"Coordination transfrontalière pour contenir les flux armés",
    desc_fr :"Des patrouilles conjointes et des échanges d’informations visent les routes d’approvisionnement et la mobilité des groupes aux frontières Burkina–Mali–Niger."
  },
  { section:"humanitarian", id:"sudan_rsf_camps", order:5,
    mediaUrl:"https://commons.wikimedia.org/wiki/Special:FilePath/Children_queue_for_water_in_the_Jamam_refugee_camp_%287118755769%29.jpg",
    title_en:"Sudan crisis echoes across the Sahel",
    desc_en :"Regional displacement and supply pressures intensify as agencies warn of wider needs from Darfur to the Sahelian belt.",
    title_fr:"La crise soudanaise résonne à travers le Sahel",
    desc_fr :"Les pressions liées aux déplacements et à l’approvisionnement s’intensifient dans la région alors que les agences alertent sur l’ampleur des besoins, du Darfour à la bande sahélienne."
  },
  { section:"humanitarian", id:"sahel_food_outlook", order:6,
    mediaUrl:"https://commons.wikimedia.org/wiki/Special:FilePath/Swarm_of_Locusts.JPG",
    title_en:"Food security outlook: vigilance despite improvements",
    desc_en :"Local harvests and calmer lines could improve access, yet climate shocks and pests keep millions at risk across the belt.",
    title_fr:"Perspectives alimentaires : vigilance malgré des améliorations",
    desc_fr :"Des récoltes locales et des axes apaisés peuvent améliorer l’accès, mais les chocs climatiques et les ravageurs maintiennent des millions de personnes à risque."
  }
];

export let lang = localStorage.getItem("lang") || "en";
export const setLang = (v)=>{ lang=v; localStorage.setItem("lang",v); applyI18n(); render(); };
const t = (k)=> dict?.[lang]?.[k] ?? k;

/* ===== Util ===== */
function withBuster(url){
  if(!url) return url;
  const sep = url.includes("?") ? "&" : "?";
  return url + sep + "t=" + Date.now();
}

function mediaNode(url, alt){
  const box = document.createElement("div");
  box.className = "media";
  if(!url){
    box.innerHTML = `<div style="padding:30px;color:#94a3b8">No media</div>`;
    return box;
  }
  if(/\.mp4(\?|$)/i.test(url)){
    const v = document.createElement("video");
    v.src = withBuster(url);
    v.controls = true;
    v.playsInline = true;
    box.appendChild(v);
  }else{
    const img = document.createElement("img");
    img.src = withBuster(url);
    img.alt = alt || "";
    box.appendChild(img);
  }
  return box;
}

/* ===== i18n + fecha ===== */
function applyI18n(){
  $("#brand").textContent = t("brand");
  $("#langBtn").textContent = lang==="fr" ? "GB English" : "FR Français";
  $("#langBtnFooter").textContent = $("#langBtn").textContent;

  const now = new Date();
  $("#today").textContent = now.toLocaleDateString(
    lang==="fr" ? "fr-FR" : "en-GB",
    {weekday:'long',year:'numeric',month:'long',day:'numeric'}
  );
  $("#y").textContent = now.getFullYear();

  $$("#brand,[data-i18n]").forEach(el=>{
    const k = el.dataset.i18n;
    if(k) el.textContent = t(k);
  });
}

/* ===== Firestore loaders con fallback ===== */
async function loadHomepage(){
  try{
    const snap = await getDoc(doc(db,"settings","homepage"));
    return snap.exists() ? snap.data() : DEFAULT_HERO;
  }catch{
    return DEFAULT_HERO;
  }
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
    feed.sort((a,b)=> (a.order||999) - (b.order||999));
    return feed.length ? feed : DEFAULT_FEED;
  }catch{
    return DEFAULT_FEED;
  }
}

/* ===== BREAKING: header centrado + video grande debajo ===== */
function renderBreaking(item){
  const host = $("#breaking");
  if(!host) return;
  host.innerHTML = "";

  const data = item || FEATURED;

  // Texto centrado (70vh)
  const head = document.createElement("article");
  head.className = "breaking-head";
  head.innerHTML = `
    <div class="breaking-content">
      <span class="breaking-pill">BREAKING</span>
      <div class="breaking-sub">Crisis in the Sahel</div>
      <h1 class="breaking-title">${data[`title_${lang}`] || ""}</h1>
      <p class="breaking-lead">${data[`desc_${lang}`] || ""}</p>
    </div>
  `;

  // Video debajo (70vh) – zig.ht en iframe
  const vid = document.createElement("article");
  vid.className = "breaking-video";
  const iframe = document.createElement("iframe");
  iframe.className = "breaking-frame";
  iframe.src = data.mediaUrl;
  iframe.allow = "autoplay; fullscreen";
  iframe.loading = "lazy";
  vid.appendChild(iframe);

  host.appendChild(head);
  host.appendChild(vid);
}

/* ===== Render principal ===== */
export async function render(){
  applyI18n();

  // Hero
  const hp = await loadHomepage();
  const hTitle = hp[`hero_title_${lang}`] || "";
  const hDesc  = hp[`hero_desc_${lang}`]  || "";
  const heroTitleEl = $("#heroTitle");
  const heroDescEl  = $("#heroDesc");
  if(heroTitleEl) heroTitleEl.textContent = hTitle;
  if(heroDescEl)  heroDescEl.textContent  = hDesc;

  // Feed
  const items = await loadAllCards();
  const featured = items.find(i => i.featured);
  const rest     = items.filter(i => !i.featured);

  // BREAKING arriba
  renderBreaking(featured);

  // Feed igual que antes
  const feedEl = $("#feed");
  if(feedEl){
    feedEl.innerHTML = "";
    for(const c of rest){
      const card = document.createElement("article");
      card.className = "card";
      card.dataset.key     = c.id;
      card.dataset.section = c.section;

      const tools = `
        <span class="badge">Edit</span>
        <div class="tools"><button class="tool" data-action="open" title="Edit">✎</button></div>
      `;
      const meta  = `
        <div class="meta">
          <h3>${c[`title_${lang}`] || ""}</h3>
          <p>${c[`desc_${lang}`]  || ""}</p>
        </div>
      `;

      card.innerHTML = tools;
      card.appendChild(mediaNode(c.mediaUrl, c[`title_${lang}`]));
      card.insertAdjacentHTML("beforeend", meta);
      feedEl.appendChild(card);
    }
  }

  document.dispatchEvent(new CustomEvent("rendered"));
}

/* ===== Boot ===== */
applyI18n();
render();
$("#langBtn").addEventListener("click", ()=> setLang(lang==="en" ? "fr" : "en"));
$("#langBtnFooter").addEventListener("click", ()=> $("#langBtn").click());
