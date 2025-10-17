import { app } from "../firebase-config.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
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

let selected = null;

function toastMsg(text){ toast.textContent=text; toast.style.display="block"; setTimeout(()=>toast.style.display="none",2000); }

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
});

document.addEventListener("click", (e)=>{
  const btn = e.target.closest(".tool"); if(!btn) return;
  if(!auth.currentUser) return;
  const card = e.target.closest(".card");
  selected = { section: card.dataset.section, id: card.dataset.key };
  $("#selPath").textContent = `${selected.section} / ${selected.id}`;
  const media = card.querySelector(".media img, .media video, .media iframe");
  $("#card_media").value = media?.src || "";
  $("#card_title_en").value = card.querySelector("h3").textContent;
  $("#card_desc_en").value  = card.querySelector("p").textContent;
  $("#card_title_fr").value = "";
  $("#card_desc_fr").value  = "";
  drawer.classList.add("open");
});

openFab.addEventListener("click", ()=> drawer.classList.add("open"));
closeEditor.addEventListener("click", ()=> drawer.classList.remove("open"));

// Guardar HERO (crea el doc si no existe)
$("#saveHero").addEventListener("click", async ()=>{
  if(!auth.currentUser) return alert("Sign in first.");
  const t = $("#hero_title_input").value.trim();
  const d = $("#hero_desc_input").value.trim();
  await setDoc(doc(db,"settings","homepage"), {
    [`hero_title_${lang}`]: t, [`hero_desc_${lang}`]: d
  }, { merge:true });
  drawer.classList.remove("open");
  toastMsg("Hero saved.");
  render();
});

// Guardar CARD (crea doc si no existe)
$("#saveCard").addEventListener("click", async ()=>{
  if(!auth.currentUser) return alert("Sign in first.");
  if(!selected) return alert("Pick a card from the page ().");
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
  drawer.classList.remove("open");
  toastMsg("Card saved.");
  render();
});

document.addEventListener("rendered", ()=>{
  $("#hero_title_input").value = $("#heroTitle").textContent;
  $("#hero_desc_input").value  = $("#heroDesc").textContent;
});
