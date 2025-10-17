import { app } from "../firebase-config.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { render, lang } from "./app.js";

const auth = getAuth(app);
const db = getFirestore(app);
const $ = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));

const loginDialog = $("#loginDialog");
const toast = $("#toast");
const drawer = $("#editor");
const openFab = $("#openEditor");
const closeEditor = $("#closeEditor");

// Reestructura el drawer: un solo botón para guardar todo
let selected = null;

function toastMsg(text){ toast.textContent=text; toast.style.display="block"; setTimeout(()=>toast.style.display="none",2200); }

function toggleEdit(enabled){
  $$(".card").forEach(c=>{
    $(".badge",c).style.display = enabled?"inline-flex":"none";
    $(".tools",c).style.display  = enabled?"inline-flex":"none";
  });
  openFab.style.display = enabled?"inline-flex":"none";
  $("#adminBtn").classList.toggle("primary", !enabled);
  toastMsg(enabled ? "Connected  Edit mode on" : "Disconnected  Edit mode off");
}

$("#adminBtn").addEventListener("click", ()=>{
  if(auth.currentUser){ signOut(auth); } else { loginDialog.showModal(); }
});

$("#signIn").addEventListener("click", async (e)=>{
  e.preventDefault();
  try{
    const email = $("#email").value.trim();
    const password = $("#password").value.trim();
    await signInWithEmailAndPassword(auth, email, password);
    loginDialog.close();
  }catch(err){ alert("Login failed: "+err.message); }
});

onAuthStateChanged(auth, async (user)=>{
  toggleEdit(!!user);
  if(!user){ drawer.classList.remove("open"); }
  updateConnStatus(); // actualiza indicador Firebase
});

// --- Indicador de conexión Firebase ---
async function updateConnStatus(){
  const dot = document.querySelector(".status-dot");
  if(!dot) return;
  try{
    await getDoc(doc(db,"settings","homepage")); // simple read
    dot.classList.add("ok");
    dot.title = "Firebase: connected";
  }catch{
    dot.classList.remove("ok");
    dot.title = "Firebase: not connected";
  }
}
document.addEventListener("rendered", ()=>{
  // Precarga el hero en el panel
  $("#hero_title_input").value = $("#heroTitle").textContent;
  $("#hero_desc_input").value  = $("#heroDesc").textContent;
  updateConnStatus();
});

// abre editor desde una tarjeta
document.addEventListener("click", (e)=>{
  const btn = e.target.closest(".tool"); if(!btn) return;
  if(!auth.currentUser) return;
  const card = e.target.closest(".card");
  selected = { section: card.dataset.section, id: card.dataset.key };
  $("#selPath").textContent = `${selected.section} / ${selected.id}`;

  const media = card.querySelector(".media img, .media video, .media iframe");
  $("#card_media").value   = media?.src?.replace(/\\?t=\\d+$/,"") || "";
  $("#card_title_en").value= card.querySelector("h3").textContent;
  $("#card_desc_en").value = card.querySelector("p").textContent;
  $("#card_title_fr").value= "";
  $("#card_desc_fr").value = "";

  drawer.classList.add("open");
});
openFab.addEventListener("click", ()=> drawer.classList.add("open"));
closeEditor.addEventListener("click", ()=> drawer.classList.remove("open"));

// --- SAVE ALL: guarda hero + card seleccionada (si hay) ---
async function saveAll(){
  if(!auth.currentUser) return alert("Sign in first.");

  const btn = $("#saveAll");
  btn.disabled = true; btn.textContent = "Saving";

  // 1) HERO
  const heroPayload = {
    [`hero_title_${lang}`]: $("#hero_title_input").value.trim(),
    [`hero_desc_${lang}`] : $("#hero_desc_input").value.trim()
  };
  await setDoc(doc(db,"settings","homepage"), heroPayload, { merge:true });

  // 2) CARD seleccionada (opcional)
  if(selected){
    const payload = { mediaUrl: $("#card_media").value.trim() };
    const t_en = $("#card_title_en").value.trim();
    const d_en = $("#card_desc_en").value.trim();
    const t_fr = $("#card_title_fr").value.trim();
    const d_fr = $("#card_desc_fr").value.trim();
    if(t_en) payload["title_en"] = t_en;
    if(d_en) payload["desc_en"]  = d_en;
    if(t_fr) payload["title_fr"] = t_fr;
    if(d_fr) payload["desc_fr"]  = d_fr;

    await setDoc(doc(db,"sections",selected.section,"cards",selected.id), payload, { merge:true });
  }

  btn.textContent = "Saved "; setTimeout(()=>{ btn.textContent = "Save All"; btn.disabled=false; }, 900);
  toastMsg("Changes saved.");
  drawer.classList.remove("open");
  render();
}

// Inserta barra Save All e indicador si no existían (por si el HTML previo no lo tenía)
(function ensureSaveBar(){
  if(!document.querySelector(".save-all")){
    const bar = document.createElement("div");
    bar.className = "save-all";
    bar.innerHTML = `
      <div style="margin-right:auto;display:flex;align-items:center;gap:8px;">
        <span class="status-dot" title="Firebase status"></span>
        <button class="btn" id="testConn">Test</button>
      </div>
      <button class="btn success" id="saveAll">Save All</button>`;
    drawer.appendChild(bar);
    $("#testConn").addEventListener("click", updateConnStatus);
    $("#saveAll").addEventListener("click", saveAll);
  }
})();
