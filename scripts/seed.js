import { app } from "../firebase-config.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

// 1) Login admin
await signInWithEmailAndPassword(auth, "admin@movenu.com", "TheAdmin");

// 2) Homepage (EN/FR)
await setDoc(doc(db,"settings","homepage"),{
  brand_en:"Voice of the Sahel", brand_fr:"Voix du Sahel",
  hero_title_en:"Crisis in the Sahel: Between Terrorism and Hopes for Peace",
  hero_title_fr:"Crise au Sahel : Entre terrorisme et espoirs de paix",
  hero_desc_en:"Explainers and field reporting on security, diplomacy and humanitarian crises across the Sahel.",
  hero_desc_fr:"Décryptages et reportages sur la sécurité, la diplomatie et les crises humanitaires au Sahel."
});

// 3) Sections (solo para mantener el orden; el feed leerá todo junto)
await setDoc(doc(db,"sections","security"),{name_en:"Security & Conflicts",name_fr:"Sécurité et Conflits",order:1});
await setDoc(doc(db,"sections","diplomacy"),{name_en:"Diplomacy & UN",name_fr:"Diplomatie & ONU",order:2});
await setDoc(doc(db,"sections","humanitarian"),{name_en:"Humanitarian Crises",name_fr:"Crises humanitaires",order:3});

// 4) Cards del documento (titular, resumen EN/FR + PRIMERA FOTO representativa de Unsplash)
await setDoc(doc(db,"sections","security","cards","boko_rural_shift"),{
  order:1,
  mediaUrl:"https://images.unsplash.com/photo-1520509414578-d9cbf09933a1?q=80&w=1600&auto=format&fit=crop",
  title_en:"Boko Harams rural shift intensifies civilian targeting",
  title_fr:"Le basculement rural de Boko Haram accroît les attaques contre les civils",
  desc_en:"After emergency measures, the group adapted to rural operations using kidnappings and suicide bombers as factions compete for recruits.",
  desc_fr:"Après les mesures durgence, le groupe sest adapté aux opérations rurales en recourant aux enlèvements et aux kamikazes, tandis que ses factions rivalisent pour recruter."
});

await setDoc(doc(db,"sections","security","cards","aes_ecowas_split"),{
  order:2,
  mediaUrl:"https://images.unsplash.com/photo-1529119368496-2dfda6ec2804?q=80&w=1600&auto=format&fit=crop",
  title_en:"Mali, Niger and Burkina exit ECOWAS and launch a Sahel alliance",
  title_fr:"Mali, Niger et Burkina quittent la CEDEAO et lancent une alliance sahélienne",
  desc_en:"The withdrawal signals deepening rifts as insecurity spreads across borders and new regional structures emerge.",
  desc_fr:"Ce retrait traduit des fractures croissantes alors que linsécurité sétend aux zones frontalières et que de nouvelles structures régionales émergent."
});

await setDoc(doc(db,"sections","diplomacy","cards","m23_ceasefire_push"),{
  order:3,
  mediaUrl:"https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop",
  title_en:"UN presses M23 and DRC to honor ceasefire commitments",
  title_fr:"LONU presse le M23 et la RDC de respecter le cessez-le-feu",
  desc_en:"Talks urge withdrawal from seized areas and safe returns as violations continue in North and South Kivu.",
  desc_fr:"Les pourparlers demandent un retrait des zones occupées et des retours sûrs alors que les violations se poursuivent au Nord et au Sud-Kivu."
});

await setDoc(doc(db,"sections","diplomacy","cards","au_security_arch"),{
  order:4,
  mediaUrl:"https://images.unsplash.com/photo-1491555103944-7c647fd857e6?q=80&w=1600&auto=format&fit=crop",
  title_en:"AU security architecture scales up counter-terror coordination",
  title_fr:"Larchitecture de sécurité de lUA intensifie la coordination antiterroriste",
  desc_en:"ACSRT/AUCTC, early-warning systems and AFRIPOL drive training, intel-sharing and cross-border policing with UN backing.",
  desc_fr:"Le CAERT/AUCTC, les systèmes dalerte précoce et AFRIPOL impulsent formation, partage de renseignement et police transfrontalière avec lappui de lONU."
});

await setDoc(doc(db,"sections","humanitarian","cards","sudan_rsf_camps"),{
  order:5,
  mediaUrl:"https://images.unsplash.com/photo-1520508168227-5ac05b93f493?q=80&w=1600&auto=format&fit=crop",
  title_en:"Sudan crisis: RSF sieges of camps heighten famine risk",
  title_fr:"Crise au Soudan : les sièges des camps par les FSR aggravent le risque de famine",
  desc_en:"Strikes on displacement sites and blocked aid push displacement past 12 million while hospitals and water systems collapse.",
  desc_fr:"Les frappes contre les sites de déplacés et les blocages de laide portent les déplacements au-delà de 12 millions tandis que les hôpitaux et réseaux deau seffondrent."
});

await setDoc(doc(db,"sections","humanitarian","cards","sahel_food_outlook"),{
  order:6,
  mediaUrl:"https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1600&auto=format&fit=crop",
  title_en:"Sahel hunger outlook: acute food insecurity widens",
  title_fr:"Perspective de faim au Sahel : linsécurité alimentaire aiguë sétend",
  desc_en:"Conflict, climate shocks and displacement leave millions at risk; agencies warn of escalating needs across the belt.",
  desc_fr:"Conflits, chocs climatiques et déplacements mettent des millions en danger ; les agences alertent sur une hausse des besoins dans toute la bande sahélienne."
});

alert("Feed inicial cargado   recarga la página.");
