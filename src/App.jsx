import { useState, useMemo, useRef } from "react";
import { PHARMA_DB } from './data/pharmacies.js';
import { TRADE_DATA } from './data/trade.js';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const LABOS_SUGGESTIONS = ["Expanscience","Bailleul","Gilbert","Boiron","Cooper","Urgo","Mylan","Teva","Biogaran","Sandoz","Arkopharma","Pileje","Nutergia","Iprad","Servier","Bayer Consumer","J&J","Sanofi","Omega Pharma","Recordati"];

const TYPES_ACTION = [
  {id:"commande",label:"Commande",emoji:"🛒",color:"#22c55e"},
  {id:"garantie",label:"Garantie",emoji:"🔄",color:"#f59e0b"},
  {id:"ug",label:"UG",emoji:"🎁",color:"#8b5cf6"},
  {id:"autre",label:"Autre",emoji:"📝",color:"#64748b"},
];

const MOIS_ORDER = ["Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MOIS_EMOJI = {Juin:"☀️",Juillet:"🌴",Août:"🏖️",Septembre:"🍂",Octobre:"🎃",Novembre:"🍁",Décembre:"❄️"};
const PROD_COLORS = {"SW":"#6366f1","Parakito":"#22c55e","Thermoflash":"#ef4444","Tensioflash":"#f97316","Tensiomètre":"#8b5cf6","Thermothérapie":"#f59e0b","Innoxa":"#06b6d4","Bouillottes":"#f97316","Tests":"#ec4899","Automesure":"#8b5cf6","Observance":"#f59e0b","Bannière":"#94a3b8"};
function pColor(p){for(const[k,v]of Object.entries(PROD_COLORS))if(p.startsWith(k))return v;return"#64748b";}

const ALL_MOIS  = [...new Set(TRADE_DATA.map(o=>o.mois))].sort((a,b)=>MOIS_ORDER.indexOf(a)-MOIS_ORDER.indexOf(b));
const ALL_GRPTS = [...new Set(TRADE_DATA.map(o=>o.groupement))].sort();
const ACT_COLORS = {commande:"#22c55e",garantie:"#f59e0b",ug:"#8b5cf6",autre:"#64748b"};
const ACT_LABELS = {commande:"Commande",garantie:"Garantie",ug:"UG",autre:"Autre"};
const ACT_EMOJI  = {commande:"🛒",garantie:"🔄",ug:"🎁",autre:"📝"};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Ic=({d,s=20})=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={s} height={s}><path d={d} strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IHome  =()=><Ic d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10" s={22}/>;
const INotes =()=><Ic d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 000 4h6a2 2 0 000-4M9 5a2 2 0 012-2h2a2 2 0 012 2" s={22}/>;
const ITrade =()=><Ic d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" s={22}/>;
const IPlus  =()=><Ic d="M12 5v14M5 12h14" s={22}/>;
const ICam   =()=><Ic d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z" s={18}/>;
const IX     =()=><Ic d="M18 6L6 18M6 6l12 12" s={16}/>;
const ICheck =()=><Ic d="M20 6L9 17l-5-5" s={15}/>;
const ISearch=()=><Ic d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" s={15}/>;
const IPrint =()=><Ic d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" s={20}/>;
const ITrash =()=><Ic d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" s={15}/>;
const IBack  =()=><Ic d="M15 18l-6-6 6-6" s={20}/>;

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{display:none}
html,body{height:100%;background:#e8edf2;font-family:'Outfit',sans-serif}
#root{height:100%}

.shell{display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f4f6f9}
.phone{width:100vw;height:100vh;background:#f4f6f9;
  overflow:hidden;position:relative;display:flex;flex-direction:column;}

.screen{flex:1;overflow-y:auto;padding-bottom:88px;padding-top:env(safe-area-inset-top,0px)}

.navbar{position:absolute;bottom:0;left:0;right:0;height:80px;background:#ffffffee;
  backdrop-filter:blur(20px);border-top:1px solid #e2e8f0;
  display:flex;align-items:center;justify-content:space-around;padding-bottom:16px;z-index:10}
.nb{display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;
  cursor:pointer;padding:8px 14px;color:#94a3b8;font-family:'Outfit',sans-serif;font-size:10px;font-weight:600;transition:color .2s}
.nb.on{color:#6366f1}
.fab-w{position:relative;display:flex;align-items:center;justify-content:center;margin-bottom:8px}
.fab{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);
  border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
  color:#fff;box-shadow:0 4px 16px #6366f145;z-index:2;transition:transform .15s}
.fab:active{transform:scale(.92)}
.fab-sub{position:absolute;width:38px;height:38px;border-radius:50%;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;font-size:16px;transition:all .25s;z-index:1}
.fab-sub.v{background:#22c55e15;border:1.5px solid #22c55e30;left:-50px}
.fab-sub.n{background:#f59e0b15;border:1.5px solid #f59e0b30;right:-50px}
.fab-sub.hide{opacity:0;transform:scale(.6);pointer-events:none}
.fab-sub.v.hide{left:0}.fab-sub.n.hide{right:0}

.hdr{padding:20px 16px 12px}
.stat-row{display:flex;gap:8px;margin:0 16px 14px}
.sc{flex:1;background:#fff;border:1px solid #e8eef4;border-radius:14px;padding:12px;text-align:center;box-shadow:0 1px 4px #0000000a}
.divl{height:1px;background:#e8eef4;margin:12px 16px}
.sl{padding:0 16px 8px;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px}

.card{background:#fff;border:1px solid #e8eef4;border-radius:15px;margin:0 16px 8px;padding:14px 15px;
  cursor:pointer;box-shadow:0 1px 4px #0000000a;transition:box-shadow .15s}
.card:active{box-shadow:0 2px 8px #0000001a}
.tag{padding:3px 9px;border-radius:20px;font-size:10px;font-weight:700;display:inline-flex;align-items:center;gap:3px}
.qcard{background:#fff;border:1px solid #fde68a;border-left:3px solid #f59e0b;border-radius:15px;
  margin:0 16px 8px;padding:12px 14px;box-shadow:0 1px 4px #0000000a}
.note-row{display:flex;align-items:flex-start;gap:8px;background:#f8fafc;border-radius:9px;
  padding:8px 10px;border:1px solid #e8eef4;margin-top:7px}
.note-num{width:16px;height:16px;border-radius:50%;background:#6366f115;color:#6366f1;
  font-size:8px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
.empty{text-align:center;padding:50px 20px;color:#94a3b8;font-size:14px}

.ov{position:absolute;inset:0;background:#00000030;display:flex;align-items:flex-end;z-index:100;backdrop-filter:blur(3px)}
.modal{width:100%;background:#f8fafc;border-radius:28px 28px 0 0;padding:20px 18px 40px;
  max-height:93%;overflow-y:auto;animation:up .28s cubic-bezier(.34,1.2,.64,1);
  box-shadow:0 -8px 40px #00000018}
@keyframes up{from{transform:translateY(50px);opacity:0}to{transform:translateY(0);opacity:1}}
.mh{width:36px;height:4px;background:#cbd5e1;border-radius:4px;margin:0 auto 16px}
.fl{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:7px}
.inp{width:100%;background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;padding:11px 13px;
  color:#1e293b;font-family:'Outfit',sans-serif;font-size:14px;outline:none;transition:border .15s}
.inp:focus{border-color:#6366f1}
.ta{width:100%;background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;padding:11px 13px;
  color:#1e293b;font-family:'Outfit',sans-serif;font-size:14px;outline:none;resize:none;
  line-height:1.5;transition:border .15s}
.ta:focus{border-color:#6366f1}
.srw{position:relative}
.si{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#94a3b8}
.sinp{padding-left:36px}
.po{padding:9px 12px;border-radius:10px;cursor:pointer;font-size:13px;color:#475569;transition:background .1s}
.po:hover{background:#f1f5f9}
.pl{max-height:130px;overflow-y:auto;margin-top:6px}
.sel-row{display:flex;align-items:center;justify-content:space-between;background:#6366f108;
  border:1.5px solid #6366f130;border-radius:12px;padding:10px 13px}
.type-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
.type-btn{padding:12px 8px;border-radius:13px;border:1.5px solid #e2e8f0;background:#fff;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;gap:4px;font-family:'Outfit',sans-serif;
  font-size:12px;font-weight:600;color:#64748b;transition:all .15s}
.type-btn.on{border-width:2px}
.labo-inp{border-color:#22c55e50 !important}
.labo-inp:focus{border-color:#22c55e !important}
.cam-btn{display:flex;align-items:center;gap:7px;padding:9px 13px;background:#fff;
  border:1.5px dashed #e2e8f0;border-radius:12px;color:#94a3b8;font-size:12px;cursor:pointer;
  font-family:'Outfit',sans-serif;transition:all .15s;width:100%}
.cam-btn:hover{border-color:#f59e0b;color:#f59e0b;background:#fffbeb}
.note-edit{background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;padding:10px;margin-bottom:6px}
.ph-row{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}
.ph-w{position:relative}
.ph-rm{position:absolute;top:-5px;right:-5px;width:18px;height:18px;background:#ef4444;border-radius:50%;
  border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px}
.photo-thumb{width:56px;height:56px;border-radius:10px;background:#f1f5f9;
  border:1px solid #e2e8f0;display:flex;align-items:center;justify-content:center;font-size:20px}
.btn-save{width:100%;padding:14px;border-radius:14px;background:linear-gradient(135deg,#6366f1,#8b5cf6);
  border:none;color:#fff;font-family:'Outfit',sans-serif;font-size:15px;font-weight:700;cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:8px;margin-top:16px;transition:opacity .2s}
.btn-save:disabled{opacity:.35;cursor:not-allowed}
.step-dots{display:flex;gap:6px;justify-content:center;margin-bottom:14px}
.dot{width:6px;height:6px;border-radius:50%;background:#e2e8f0;transition:background .2s}
.dot.on{background:#6366f1}
.free-tag{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;
  font-size:10px;font-weight:700;background:#fef3c7;color:#d97706;border:1px solid #fde68a;margin-bottom:8px}

.recap-box{background:#fff;border:1.5px solid #e2e8f0;border-radius:13px;padding:13px;margin:0 16px;
  font-family:'DM Mono',monospace;font-size:10px;color:#64748b;line-height:1.9;white-space:pre-wrap;
  max-height:300px;overflow-y:auto;box-shadow:0 1px 4px #0000000a}
.print-btn{width:calc(100% - 32px);margin:10px 16px 0;padding:14px;border-radius:14px;
  background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;color:#fff;
  font-family:'Outfit',sans-serif;font-size:14px;font-weight:700;cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:8px}
.copy-btn{width:calc(100% - 32px);margin:8px 16px 0;padding:12px;border-radius:13px;
  background:#fff;border:1.5px solid #e2e8f0;color:#6366f1;font-family:'Outfit',sans-serif;
  font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;
  box-shadow:0 1px 4px #0000000a}

.pdf-screen{padding:16px;height:100%;overflow-y:auto}
.back-btn{display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;
  color:#6366f1;font-family:'Outfit',sans-serif;font-size:13px;font-weight:700;padding:0;margin-bottom:16px}
.pdf-preview{background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;
  box-shadow:0 4px 20px #00000010}
.pdf-hdr{background:#0f172a;padding:16px 18px;display:flex;justify-content:space-between;align-items:center}
.pdf-body{padding:14px 16px}
.pdf-stats{display:flex;gap:6px;margin-bottom:12px}
.pdf-stat{flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:7px;padding:6px;text-align:center}
.pdf-vbloc{border:1px solid #e2e8f0;border-radius:8px;margin-bottom:7px;overflow:hidden}
.pdf-vhdr{background:#f8fafc;padding:7px 10px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center}
.pdf-vbody{padding:7px 10px}
.pdf-note-row{display:flex;align-items:flex-start;gap:6px;padding:4px 0;border-top:1px dashed #f1f5f9}
.pdf-note-row:first-child{border-top:none;padding-top:0}
.pdf-ftr{background:#f8fafc;border-top:1px solid #e2e8f0;padding:7px 16px;display:flex;justify-content:space-between}
@media print{.shell{display:block}.phone{width:100%;height:auto;box-shadow:none;border-radius:0}.navbar{display:none!important}.fab-w{display:none!important}}

.view-toggle{display:flex;gap:5px;margin:0 16px 10px;background:#fff;border-radius:12px;padding:4px;
  border:1px solid #e2e8f0}
.vt{flex:1;padding:8px;border-radius:9px;border:none;cursor:pointer;font-family:'Outfit',sans-serif;
  font-size:11px;font-weight:600;color:#94a3b8;background:none;transition:all .15s}
.vt.on{background:#6366f115;color:#6366f1}
.mois-scroll{display:flex;gap:7px;padding:0 16px 10px;overflow-x:auto}
.mpill{padding:6px 12px;border-radius:20px;font-size:11px;font-weight:600;border:1.5px solid transparent;
  cursor:pointer;background:#fff;color:#64748b;font-family:'Outfit',sans-serif;white-space:nowrap;
  transition:all .15s;flex-shrink:0;box-shadow:0 1px 3px #0000000a}
.mpill.on{background:#6366f1;color:#fff;border-color:#6366f1}
.sel-wrap{margin:0 16px 8px}
.gsel{width:100%;background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;padding:10px 32px 10px 13px;
  color:#1e293b;font-family:'Outfit',sans-serif;font-size:12px;outline:none;appearance:none;cursor:pointer;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 12px center;box-shadow:0 1px 3px #0000000a}
.gsel option{background:#fff;color:#1e293b}
.op-card{background:#fff;border:1px solid #e8eef4;border-left-width:3px;border-radius:12px;
  margin:0 16px 7px;padding:12px 13px;box-shadow:0 1px 4px #0000000a}
.grpt-card{background:#fff;border:1px solid #e8eef4;border-radius:13px;margin:0 16px 7px;
  overflow:hidden;cursor:pointer;box-shadow:0 1px 4px #0000000a}
.grpt-hdr{padding:12px 14px;display:flex;justify-content:space-between;align-items:center}
.grpt-body{padding:0 14px 10px;border-top:1px solid #f1f5f9}
.op-row{display:flex;align-items:flex-start;gap:9px;padding:7px 0;border-bottom:1px solid #f1f5f9}
.op-row:last-child{border-bottom:none}
.nb-badge{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;
  padding:0 5px;border-radius:10px;background:#6366f115;color:#6366f1;font-size:10px;font-weight:700;margin-left:5px}
.op-badge{padding:2px 6px;border-radius:4px;font-size:9px;font-weight:700}
`;

// ─── PDF BUILDER ─────────────────────────────────────────────────────────────
function buildPrintHTML(items, today) {
  const visites = items.filter(i=>i.type==="visite");
  const memos   = items.filter(i=>i.type==="quick");
  const totalNotes = visites.reduce((a,v)=>a+(v.notes||[]).length,0);

  const visitesHTML = visites.map((v,i)=>{
    const c = ACT_COLORS[v.action?.type]||"#64748b";
    const lbl = ACT_LABELS[v.action?.type]||"";
    const notesHTML = (v.notes||[]).map((n,j)=>`
      <div style="display:flex;align-items:flex-start;gap:8px;padding:5px 0;border-top:1px dashed #f1f5f9;${j===0?"border-top:none;padding-top:0":""}">
        <div style="min-width:16px;height:16px;border-radius:50%;background:#6366f115;color:#6366f1;font-size:8px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">${j+1}</div>
        <div style="font-size:9px;color:#334155;line-height:1.5;flex:1">${n.text||n}${n.hasPhoto?'<span style="margin-left:6px;padding:2px 5px;border-radius:4px;background:#fef3c7;border:1px solid #fde68a;font-size:7px;color:#d97706;font-weight:700">📷 Photo jointe</span>':''}</div>
      </div>`).join("");
    return `
    <div style="border:1px solid #e2e8f0;border-radius:8px;margin-bottom:10px;overflow:hidden;page-break-inside:avoid">
      <div style="background:#f8fafc;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0">
        <div>
          <div style="font-size:11px;font-weight:800;color:#0f172a">${v.pharmacie}</div>
          ${v.adresse?`<div style="font-size:8px;color:#94a3b8;margin-top:1px">${v.adresse}${v.cp?' · '+v.cp:''}</div>`:''}
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;margin-left:10px">
          <span style="font-size:9px;color:#94a3b8;font-family:monospace">${v.heure}</span>
          <span style="padding:2px 7px;border-radius:4px;font-size:8px;font-weight:800;background:${c}15;color:${c};border:1px solid ${c}25">${lbl}</span>
        </div>
      </div>
      <div style="padding:9px 12px">
        ${v.action?.labo?`<div style="font-size:9px;color:#64748b;margin-bottom:6px">Laboratoire(s) : <strong style="color:#334155">${v.action.labo}</strong></div>`:''}
        ${notesHTML}
      </div>
    </div>`;
  }).join("");

  const memosHTML = memos.map(m=>`
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:7px 10px;margin-bottom:6px;display:flex;gap:8px;font-size:9px">
      <span style="color:#d97706;font-family:monospace;font-weight:700;flex-shrink:0">${m.heure}</span>
      <span style="color:#78350f;line-height:1.5">${m.note}</span>
    </div>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Tournée DBN — ${today}</title>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Helvetica Neue',Arial,sans-serif;background:#fff;padding:0}
  @page{margin:12mm;size:A4}@media print{body{padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>
  <div style="background:#0f172a;padding:18px 24px;display:flex;justify-content:space-between;align-items:center">
    <div>
      <div style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.5px">DBN <span style="color:#818cf8">Développement</span></div>
      <div style="font-size:9px;color:#64748b;margin-top:3px">Agent commercial multicartes · Paris</div>
    </div>
    <div style="text-align:right;font-size:9px;color:#64748b;text-transform:capitalize">${today}</div>
  </div>
  <div style="padding:18px 24px">
    <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:2px solid #f1f5f9;margin-bottom:16px">
      <div><div style="font-size:14px;font-weight:800;color:#0f172a">Rapport de tournée</div>
      <div style="font-size:9px;color:#94a3b8;margin-top:2px;text-transform:capitalize">${today}</div></div>
      <div style="display:flex;gap:8px">
        ${[[visites.length,"Visites","#0f172a"],[visites.filter(v=>v.action?.type==="commande").length,"Commandes","#22c55e"],[visites.filter(v=>v.action?.type==="garantie").length,"Garanties","#f59e0b"],[totalNotes,"Notes","#6366f1"]].map(([n,l,c])=>`
        <div style="text-align:center;background:#f8fafc;border-radius:8px;padding:6px 10px;border:1px solid #e2e8f0">
          <div style="font-size:16px;font-weight:800;color:${c}">${n}</div>
          <div style="font-size:7px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.5px">${l}</div>
        </div>`).join("")}
      </div>
    </div>
    ${visites.length?`<div style="font-size:9px;font-weight:800;color:#6366f1;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Visites du jour</div>${visitesHTML}`:''}
    ${memos.length?`<div style="font-size:9px;font-weight:800;color:#f59e0b;text-transform:uppercase;letter-spacing:1px;margin:14px 0 8px">Mémos rapides</div>${memosHTML}`:''}
    <div style="margin-top:16px;padding-top:8px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:8px;color:#94a3b8">
      <span>DBN Développement — Rapport généré automatiquement</span><span>Page 1 / 1</span>
    </div>
  </div></body></html>`;
}

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const INIT = [
  {id:1,type:"visite",pharmacie:"PHARMACIE CITYPHARMA",adresse:"26 RUE DU FOUR",cp:"75006",heure:"09:14",
   action:{type:"commande",labo:"Expanscience, Bailleul"},
   notes:[{text:"Commande Mustela crème 1er âge x24",hasPhoto:false},{text:"Demande catalogue gamme bébé",hasPhoto:false}]},
  {id:2,type:"visite",pharmacie:"PHARMACIE SAINT PAUL",adresse:"71 RUE SAINT ANTOINE",cp:"75004",heure:"10:45",
   action:{type:"garantie",labo:"Bailleul"},
   notes:[{text:"Retour boite Bailleul abimée — étiquette décollée",hasPhoto:true}]},
  {id:3,type:"quick",pharmacie:"",adresse:"",cp:"",heure:"11:20",
   action:{type:"autre"},note:"Concurrent Boiron promo -20% chez CityPharma",notes:[]},
];

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,setTab]       = useState("home");
  const [items,setItems]   = useState(INIT);
  const [fabOpen,setFabOpen] = useState(false);
  const [modal,setModal]   = useState(null);

  const today = new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});

  const addItem = (item) => setItems(p=>[...p,{...item,id:Date.now(),
    heure:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}]);

  const visites    = items.filter(i=>i.type==="visite");
  const totalCmd   = visites.filter(i=>i.action?.type==="commande").length;
  const totalGar   = visites.filter(i=>i.action?.type==="garantie").length;
  const totalMemo  = items.filter(i=>i.type==="quick").length;

  const handlePrint = () => {
    // Inject print styles + content into a hidden div, then print
    const html = buildPrintHTML(items, today);
    // Create/update a hidden print container
    let el = document.getElementById('dbn-print-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'dbn-print-container';
      document.body.appendChild(el);
    }
    el.innerHTML = html;
    // Add print style that shows only this div
    let style = document.getElementById('dbn-print-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'dbn-print-style';
      style.textContent = '@media print { body > * { display: none !important; } #dbn-print-container { display: block !important; } #dbn-print-container * { display: revert !important; } }';
      document.head.appendChild(style);
    }
    setTimeout(() => window.print(), 100);
  };

  return (
    <div className="shell">
      <style>{CSS}</style>
      <div className="phone">

        <div className="screen">
          {tab==="home"  && <Home items={items} setItems={setItems} visites={visites} totalCmd={totalCmd} totalGar={totalGar} totalMemo={totalMemo} today={today}/>}
          {tab==="recap" && <Recap items={items} today={today} onPrint={handlePrint}/>}
          {tab==="trade" && <Trade/>}
        </div>

        <div className="navbar">
          <button className={`nb ${tab==="home"?"on":""}`} onClick={()=>{setTab("home");setFabOpen(false)}}><IHome/>Tournée</button>
          <div className="fab-w">
            <button className={`fab-sub v ${fabOpen?"":"hide"}`} onClick={()=>{setModal("visite");setFabOpen(false)}}>🏥</button>
            <button className="fab" onClick={()=>setFabOpen(o=>!o)}>
              <div style={{transform:fabOpen?"rotate(45deg)":"none",transition:"transform .2s"}}><IPlus/></div>
            </button>
            <button className={`fab-sub n ${fabOpen?"":"hide"}`} onClick={()=>{setModal("quick");setFabOpen(false)}}>📝</button>
          </div>
          <button className={`nb ${tab==="recap"?"on":""}`} onClick={()=>{setTab("recap");setFabOpen(false);setShowPdf(false)}}><INotes/>Récap</button>
          <button className={`nb ${tab==="trade"?"on":""}`} onClick={()=>{setTab("trade");setFabOpen(false)}}><ITrade/>Trade</button>
        </div>

        {fabOpen&&<div style={{position:"absolute",bottom:90,left:0,right:0,display:"flex",justifyContent:"space-around",padding:"0 24px",pointerEvents:"none"}}>
          <span style={{fontSize:10,color:"#22c55e",fontWeight:700}}>Visite</span>
          <span style={{width:52}}/>
          <span style={{fontSize:10,color:"#f59e0b",fontWeight:700}}>Mémo</span>
        </div>}

        {modal==="visite"&&<ActionModal onClose={()=>setModal(null)} onSave={v=>{addItem({...v,type:"visite"});setModal(null)}}/>}
        {modal==="quick" &&<QuickModal  onClose={()=>setModal(null)} onSave={v=>{addItem({...v,type:"quick",pharmacie:"",action:{type:"autre"}});setModal(null)}}/>}
      </div>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function Home({items,setItems,visites,totalCmd,totalGar,totalMemo,today}) {
  const sorted = [...items].sort((a,b)=>a.heure.localeCompare(b.heure));
  return (
    <div>
      <div className="hdr">
        <div style={{fontSize:11,color:"#94a3b8",textTransform:"capitalize",marginBottom:3}}>{today}</div>
        <div style={{fontSize:22,fontWeight:700,color:"#1e293b"}}>Ma tournée</div>
        <div style={{fontSize:12,color:"#6366f1",marginTop:2,fontWeight:600}}>DBN Développement · Paris</div>
      </div>
      <div className="stat-row">
        <div className="sc"><div style={{fontSize:20,fontWeight:700,color:"#1e293b"}}>{visites.length}</div><div style={{fontSize:10,color:"#94a3b8",marginTop:2,fontWeight:600}}>Visites</div></div>
        <div className="sc"><div style={{fontSize:20,fontWeight:700,color:"#22c55e"}}>{totalCmd}</div><div style={{fontSize:10,color:"#94a3b8",marginTop:2,fontWeight:600}}>Commandes</div></div>
        <div className="sc"><div style={{fontSize:20,fontWeight:700,color:"#f59e0b"}}>{totalGar}</div><div style={{fontSize:10,color:"#94a3b8",marginTop:2,fontWeight:600}}>Garanties</div></div>
        <div className="sc"><div style={{fontSize:20,fontWeight:700,color:"#94a3b8"}}>{totalMemo}</div><div style={{fontSize:10,color:"#94a3b8",marginTop:2,fontWeight:600}}>Mémos</div></div>
      </div>
      <div className="divl"/>
      <div className="sl">Chronologie du jour</div>
      {sorted.map(item=>item.type==="visite"?<VisiteCard key={item.id} item={item} setItems={setItems}/>:<QuickCard key={item.id} item={item} setItems={setItems}/>)}
      {items.length===0&&<div className="empty">🗺️<br/><br/>Aucune activité<br/><span style={{fontSize:12}}>Appuie sur + pour commencer</span></div>}
    </div>
  );
}

// ─── VISITE CARD ──────────────────────────────────────────────────────────────
function VisiteCard({item,setItems}) {
  const [open,setOpen]=useState(false);
  const t=item.action?.type||"autre";
  const c=ACT_COLORS[t];
  return (
    <div className="card">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}} onClick={()=>setOpen(o=>!o)}>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:3}}>{item.pharmacie}</div>
          {item.adresse&&<div style={{fontSize:10,color:"#94a3b8",marginBottom:4}}>{item.adresse}{item.cp?` · ${item.cp}`:""}</div>}
          <span className="tag" style={{background:`${c}12`,color:c,border:`1px solid ${c}25`}}>
            {ACT_EMOJI[t]} {ACT_LABELS[t]}{item.action?.labo?` · ${item.action.labo}`:""}
          </span>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,marginLeft:8,flexShrink:0}}>
          <span style={{fontSize:11,color:"#94a3b8",fontFamily:"DM Mono,monospace"}}>{item.heure}</span>
          {(item.notes||[]).length>0&&<span className="tag" style={{background:"#6366f110",color:"#6366f1",border:"1px solid #6366f120",fontSize:9}}>
            {(item.notes||[]).length} note{(item.notes||[]).length>1?"s":""}
          </span>}
        </div>
      </div>
      {open&&<div style={{marginTop:10}}>
        {(item.notes||[]).map((n,i)=>(
          <div key={i} className="note-row">
            <span className="note-num">{i+1}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:"#475569",lineHeight:1.5}}>{n.text||n}</div>
              {n.hasPhoto&&<div style={{fontSize:10,color:"#d97706",marginTop:3}}>📷 Photo jointe</div>}
            </div>
          </div>
        ))}
        {(item.notes||[]).length===0&&<div style={{fontSize:12,color:"#94a3b8",textAlign:"center"}}>Aucune note</div>}
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
          <button onClick={()=>setItems(p=>p.filter(i=>i.id!==item.id))} style={{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",display:"flex",alignItems:"center",gap:4,fontSize:11,fontFamily:"'Outfit',sans-serif"}}>
            <ITrash/> Supprimer
          </button>
        </div>
      </div>}
    </div>
  );
}

// ─── QUICK CARD ───────────────────────────────────────────────────────────────
function QuickCard({item,setItems}) {
  return (
    <div className="qcard">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span className="tag" style={{background:"#fef9c3",color:"#a16207",border:"1px solid #fde68a"}}>📝 Mémo rapide</span>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:11,color:"#94a3b8",fontFamily:"DM Mono,monospace"}}>{item.heure}</span>
          <button onClick={()=>setItems(p=>p.filter(i=>i.id!==item.id))} style={{background:"none",border:"none",cursor:"pointer",color:"#cbd5e1"}}><IX/></button>
        </div>
      </div>
      <div style={{fontSize:12,color:"#475569",lineHeight:1.6}}>{item.note}</div>
    </div>
  );
}

// ─── RECAP ────────────────────────────────────────────────────────────────────
function Recap({items,today,onPrint}) {
  const [copied,setCopied]=useState(false);
  const visites=items.filter(i=>i.type==="visite");
  const memos=items.filter(i=>i.type==="quick");

  const recap=[
    `📋 TOURNÉE — ${today.toUpperCase()}`,
    "─".repeat(40),
    ...visites.map((v,i)=>{
      const lbl=ACT_LABELS[v.action?.type]||"";
      const lines=[`${i+1}. ${v.pharmacie}  🕐 ${v.heure}`,
        v.adresse?`   📍 ${v.adresse}${v.cp?" · "+v.cp:""}`:null,
        `   ${ACT_EMOJI[v.action?.type]||"📝"} ${lbl}${v.action?.labo?" · "+v.action.labo:""}`,
        ...(v.notes||[]).map((n,j)=>`   ${j+1}. ${n.text||n}${n.hasPhoto?" [📷]":""}`)
      ].filter(Boolean);
      return lines.join("\n");
    }),
    memos.length?["─── MÉMOS ───",...memos.map(m=>`🟡 ${m.heure}  ${m.note}`)].join("\n"):"",
    "─".repeat(40),
    `${visites.length} visite(s) · ${visites.filter(v=>v.action?.type==="commande").length} commande(s) · ${visites.filter(v=>v.action?.type==="garantie").length} garantie(s)`
  ].filter(Boolean).join("\n");

  return (
    <div>
      <div className="hdr">
        <div style={{fontSize:11,color:"#94a3b8",textTransform:"capitalize",marginBottom:3}}>{today}</div>
        <div style={{fontSize:22,fontWeight:700,color:"#1e293b"}}>Récap du jour</div>
        <div style={{fontSize:12,color:"#94a3b8",marginTop:2,fontWeight:500}}>{visites.length} visites · {visites.reduce((a,v)=>a+(v.notes||[]).length,0)} notes</div>
      </div>
      <div className="recap-box">{recap}</div>
      <button className="print-btn" onClick={onPrint}><IPrint/> Imprimer la tournée</button>
      <button className="copy-btn" onClick={()=>{navigator.clipboard?.writeText(recap);setCopied(true);setTimeout(()=>setCopied(false),2000)}}>
        {copied?<><ICheck/> Copié !</>:"📋 Copier le récap"}
      </button>
    </div>
  );
}

// ─── PDF SCREEN ───────────────────────────────────────────────────────────────
function PdfScreen({items,today,onBack,onPrint}) {
  const visites=items.filter(i=>i.type==="visite");
  const memos=items.filter(i=>i.type==="quick");
  return (
    <div className="pdf-screen">
      <button className="back-btn" onClick={onBack}><IBack/> Retour à l'app</button>
      <div style={{fontSize:16,fontWeight:700,color:"#1e293b",marginBottom:4}}>Aperçu du PDF</div>
      <div style={{fontSize:12,color:"#94a3b8",marginBottom:14}}>Vérifie puis imprime ou enregistre en PDF</div>

      <div className="pdf-preview">
        <div className="pdf-hdr">
          <div>
            <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>DBN <span style={{color:"#818cf8"}}>Développement</span></div>
            <div style={{fontSize:9,color:"#64748b",marginTop:2}}>Agent commercial multicartes · Paris</div>
          </div>
          <div style={{fontSize:9,color:"#64748b",textAlign:"right",textTransform:"capitalize"}}>{today}</div>
        </div>
        <div className="pdf-body">
          <div className="pdf-stats">
            {[[visites.length,"Visites","#1e293b"],[visites.filter(v=>v.action?.type==="commande").length,"Commandes","#22c55e"],[visites.filter(v=>v.action?.type==="garantie").length,"Garanties","#f59e0b"],[visites.reduce((a,v)=>a+(v.notes||[]).length,0),"Notes","#6366f1"]].map(([n,l,c])=>(
              <div key={l} className="pdf-stat">
                <div style={{fontSize:14,fontWeight:800,color:c}}>{n}</div>
                <div style={{fontSize:7,color:"#94a3b8",fontWeight:700,textTransform:"uppercase"}}>{l}</div>
              </div>
            ))}
          </div>
          {visites.map((v,i)=>{
            const c=ACT_COLORS[v.action?.type]||"#64748b";
            return (
              <div key={i} className="pdf-vbloc">
                <div className="pdf-vhdr">
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,fontWeight:800,color:"#0f172a"}}>{v.pharmacie}</div>
                    {v.adresse&&<div style={{fontSize:8,color:"#94a3b8",marginTop:1}}>{v.adresse}{v.cp?` · ${v.cp}`:""}</div>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:8,flexShrink:0}}>
                    <span style={{fontSize:9,color:"#94a3b8",fontFamily:"monospace"}}>{v.heure}</span>
                    <span style={{padding:"2px 6px",borderRadius:4,fontSize:8,fontWeight:800,background:`${c}15`,color:c,border:`1px solid ${c}25`}}>{ACT_LABELS[v.action?.type]}</span>
                  </div>
                </div>
                <div className="pdf-vbody">
                  {v.action?.labo&&<div style={{fontSize:9,color:"#64748b",marginBottom:5}}>Labo : <strong style={{color:"#334155"}}>{v.action.labo}</strong></div>}
                  {(v.notes||[]).map((n,j)=>(
                    <div key={j} className="pdf-note-row">
                      <div style={{minWidth:14,height:14,borderRadius:"50%",background:"#6366f115",color:"#6366f1",fontSize:7,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{j+1}</div>
                      <div style={{fontSize:9,color:"#334155",lineHeight:1.4,flex:1}}>{n.text||n}{n.hasPhoto&&<span style={{marginLeft:5,fontSize:7,color:"#d97706"}}>📷</span>}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {memos.length>0&&<>
            <div style={{fontSize:9,fontWeight:800,color:"#d97706",textTransform:"uppercase",letterSpacing:1,margin:"10px 0 6px"}}>Mémos rapides</div>
            {memos.map((m,i)=>(
              <div key={i} style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:6,padding:"6px 8px",marginBottom:5,display:"flex",gap:7,fontSize:9}}>
                <span style={{color:"#d97706",fontFamily:"monospace",fontWeight:700,flexShrink:0}}>{m.heure}</span>
                <span style={{color:"#78350f"}}>{m.note}</span>
              </div>
            ))}
          </>}
        </div>
        <div className="pdf-ftr">
          <span style={{fontSize:8,color:"#94a3b8"}}>DBN Développement</span>
          <span style={{fontSize:8,color:"#94a3b8",fontWeight:700}}>Page 1 / 1</span>
        </div>
      </div>

      <button className="print-btn" style={{marginTop:12}} onClick={onPrint}>
        🖨️ Imprimer / Enregistrer PDF
      </button>
      <button className="back-btn" style={{justifyContent:"center",marginTop:12,background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:13,padding:"12px",width:"100%",color:"#64748b"}} onClick={onBack}>
        <IBack/> Retour à la tournée
      </button>
    </div>
  );
}

// ─── TRADE ────────────────────────────────────────────────────────────────────
function Trade() {
  const [view,setView]=useState("mois");
  const [mois,setMois]=useState("Juin");
  const [grpt,setGrpt]=useState("Tous");
  const [openG,setOpenG]=useState(null);

  const opsMois=useMemo(()=>TRADE_DATA.filter(o=>o.mois===mois&&(grpt==="Tous"||o.groupement===grpt)),[mois,grpt]);
  const grptData=useMemo(()=>{
    const map={};TRADE_DATA.forEach(o=>{if(!map[o.groupement])map[o.groupement]=[];map[o.groupement].push(o);});
    return Object.entries(map).sort(([a],[b])=>a.localeCompare(b)).map(([g,ops])=>({g,ops:ops.sort((a,b)=>MOIS_ORDER.indexOf(a.mois)-MOIS_ORDER.indexOf(b.mois))}));
  },[]);

  return (
    <div>
      <div className="hdr">
        <div style={{fontSize:11,color:"#94a3b8",marginBottom:3}}>Plan commercial 2026</div>
        <div style={{display:"flex",alignItems:"center"}}>
          <span style={{fontSize:22,fontWeight:700,color:"#1e293b"}}>Ops Trade</span>
          <span className="nb-badge" style={{marginLeft:8}}>{TRADE_DATA.length}</span>
        </div>
        <div style={{fontSize:12,color:"#6366f1",marginTop:2,fontWeight:600}}>Juin → Décembre 2026</div>
      </div>
      <div className="view-toggle">
        <button className={`vt ${view==="mois"?"on":""}`} onClick={()=>setView("mois")}>📅 Par mois</button>
        <button className={`vt ${view==="groupement"?"on":""}`} onClick={()=>setView("groupement")}>🏢 Par groupement</button>
      </div>
      {view==="mois"&&<>
        <div className="mois-scroll">
          {ALL_MOIS.map(m=><button key={m} className={`mpill ${mois===m?"on":""}`} onClick={()=>setMois(m)}>{MOIS_EMOJI[m]} {m}</button>)}
        </div>
        <div className="sel-wrap">
          <select className="gsel" value={grpt} onChange={e=>setGrpt(e.target.value)}>
            <option value="Tous">Tous les groupements</option>
            {ALL_GRPTS.map(g=><option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="sl">{MOIS_EMOJI[mois]} {mois}<span className="nb-badge">{opsMois.length}</span></div>
        {opsMois.length===0&&<div className="empty">Aucune opération en {mois}</div>}
        {opsMois.map((op,i)=>{const c=pColor(op.produit);return(
          <div key={i} className="op-card" style={{borderLeftColor:c}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:"#1e293b",marginBottom:2}}>{op.produit}</div>
                <div style={{fontSize:11,color:"#64748b",fontWeight:600}}>{op.groupement}</div>
              </div>
              <span className="op-badge" style={{background:`${c}12`,color:c,border:`1px solid ${c}25`,marginLeft:8,flexShrink:0}}>{op.type}</span>
            </div>
            <div style={{fontSize:11,color:"#64748b",lineHeight:1.5,background:"#f8fafc",borderRadius:7,padding:"6px 8px",border:"1px solid #e8eef4"}}>{op.mecanique}</div>
          </div>
        );})}
      </>}
      {view==="groupement"&&<div style={{padding:"0 16px"}}>
        {grptData.map(({g,ops})=>{const isOpen=openG===g;return(
          <div key={g} className="grpt-card">
            <div className="grpt-hdr" onClick={()=>setOpenG(isOpen?null:g)}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"#1e293b"}}>{g}</div>
                <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{[...new Set(ops.map(o=>o.mois))].join(" · ")}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span className="nb-badge">{ops.length}</span>
                <span style={{color:"#cbd5e1",fontSize:13,transform:isOpen?"rotate(180deg)":"none",transition:"transform .2s"}}>▾</span>
              </div>
            </div>
            {isOpen&&<div className="grpt-body">
              {ops.map((op,i)=>{const c=pColor(op.produit);return(
                <div key={i} className="op-row">
                  <div style={{width:8,height:8,borderRadius:"50%",background:c,flexShrink:0,marginTop:4}}/>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                      <span style={{fontSize:12,fontWeight:600,color:"#1e293b"}}>{op.produit}</span>
                      <span style={{fontSize:11,fontWeight:700,color:c,fontFamily:"DM Mono,monospace"}}>{op.mois}</span>
                    </div>
                    <div style={{fontSize:10,color:"#64748b",lineHeight:1.4}}>{op.mecanique}</div>
                  </div>
                </div>
              );})}
            </div>}
          </div>
        );})}
      </div>}
    </div>
  );
}

// ─── ACTION MODAL ─────────────────────────────────────────────────────────────
function ActionModal({onClose,onSave}) {
  const [step,setStep]=useState(1);
  const [search,setSearch]=useState("");
  const [pharma,setPharma]=useState(null);
  const [isFree,setIsFree]=useState(false);
  const [freeText,setFreeText]=useState("");
  const [actionType,setActionType]=useState("");
  const [labo,setLabo]=useState("");
  const [notes,setNotes]=useState([{text:"",hasPhoto:false,photo:null}]);

  const results=useMemo(()=>{
    if(!search||search.length<2)return[];
    const q=search.toLowerCase();
    return PHARMA_DB.filter(p=>p.n.toLowerCase().includes(q)||p.a.toLowerCase().includes(q)).slice(0,7);
  },[search]);

  const canNext=pharma||(isFree&&freeText.trim());
  const canSave=canNext&&actionType;

  const addNote=()=>setNotes(p=>[...p,{text:"",hasPhoto:false,photo:null}]);
  const updNote=(i,t)=>setNotes(p=>p.map((n,j)=>j===i?{...n,text:t}:n));
  const togPhoto=(i)=>setNotes(p=>p.map((n,j)=>j===i?{...n,hasPhoto:!n.hasPhoto}:n));
  const delNote=(i)=>setNotes(p=>p.filter((_,j)=>j!==i));
  const updPhoto=(i,src)=>setNotes(p=>p.map((n,j)=>j===i?{...n,photo:src,hasPhoto:true}:n));

  const handleSave=()=>{
    const p=isFree?{n:freeText.trim(),a:"",c:""}:pharma;
    const validNotes=notes.filter(n=>n.text.trim()||n.hasPhoto);
    onSave({pharmacie:p.n,adresse:p.a,cp:p.c,action:{type:actionType,labo:labo.trim()},notes:validNotes});
  };

  return (
    <div className="ov" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mh"/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:16,fontWeight:700,color:"#1e293b"}}>🏥 Nouvelle visite</div>
          <button onClick={onClose} style={{background:"#f1f5f9",border:"none",borderRadius:"50%",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#64748b"}}><IX/></button>
        </div>
        <div className="step-dots"><div className={`dot ${step>=1?"on":""}`}/><div className={`dot ${step>=2?"on":""}`}/></div>

        {step===1&&<div>
          <div className="fl">Pharmacie</div>
          {pharma?(
            <div className="sel-row" style={{marginBottom:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,color:"#6366f1",fontWeight:700}}>{pharma.n}</div>
                {pharma.a&&<div style={{fontSize:10,color:"#94a3b8",marginTop:1}}>{pharma.a}{pharma.c?` · ${pharma.c}`:""}</div>}
                {isFree&&<span className="free-tag" style={{marginTop:6}}>✏️ Saisie libre</span>}
              </div>
              <button onClick={()=>{setPharma(null);setSearch("");setIsFree(false);setFreeText("")}} style={{background:"none",border:"none",cursor:"pointer",color:"#94a3b8"}}><IX/></button>
            </div>
          ):(
            <>
              {!isFree&&<>
                <div className="srw" style={{marginBottom:6}}>
                  <span className="si"><ISearch/></span>
                  <input className="inp sinp" placeholder="Rechercher parmi 691 pharmacies…" value={search} onChange={e=>setSearch(e.target.value)} autoFocus/>
                </div>
                <div className="pl">
                  {results.map((p,i)=>(
                    <div key={i} className="po" onClick={()=>{setPharma(p);setSearch("")}}>
                      <div style={{fontWeight:600,fontSize:13,color:"#1e293b"}}>{p.n}</div>
                      {p.a&&<div style={{fontSize:10,color:"#94a3b8",marginTop:1}}>{p.a}{p.c?` · ${p.c}`:""}</div>}
                    </div>
                  ))}
                </div>
                {search.length>1&&results.length===0&&(
                  <div style={{textAlign:"center",padding:"10px 0",color:"#94a3b8",fontSize:12}}>
                    Introuvable —
                    <button onClick={()=>setIsFree(true)} style={{background:"none",border:"none",color:"#6366f1",cursor:"pointer",fontWeight:700,marginLeft:4,fontFamily:"'Outfit',sans-serif"}}>saisir manuellement</button>
                  </div>
                )}
                {!search&&<button onClick={()=>setIsFree(true)} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:11,marginTop:6,textDecoration:"underline",display:"block",fontFamily:"'Outfit',sans-serif"}}>
                  Pharmacie absente ? Saisir manuellement →
                </button>}
              </>}
              {isFree&&<div>
                <span className="free-tag">✏️ Saisie libre</span>
                <input className="inp" placeholder="Nom de la pharmacie…" value={freeText} onChange={e=>setFreeText(e.target.value)} autoFocus style={{marginTop:8}}/>
                <button onClick={()=>setIsFree(false)} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:11,marginTop:6,textDecoration:"underline",display:"block",fontFamily:"'Outfit',sans-serif"}}>← Retour à la recherche</button>
              </div>}
            </>
          )}
          <button className="btn-save" disabled={!canNext} style={{marginTop:16}}
            onClick={()=>{if(isFree&&freeText.trim())setPharma({n:freeText.trim(),a:"",c:""});setStep(2)}}>
            Continuer →
          </button>
        </div>}

        {step===2&&<div>
          <div className="fl">Type d'action</div>
          <div className="type-grid">
            {TYPES_ACTION.map(t=>(
              <button key={t.id} className={`type-btn ${actionType===t.id?"on":""}`}
                style={actionType===t.id?{borderColor:t.color,color:t.color,background:`${t.color}08`}:{}}
                onClick={()=>setActionType(t.id)}>
                <span style={{fontSize:22}}>{t.emoji}</span>{t.label}
              </button>
            ))}
          </div>

          {/* Champ labo libre pour tous les types sauf "autre" */}
          {actionType&&actionType!=="autre"&&<div style={{marginBottom:14}}>
            <div className="fl" style={{color:ACT_COLORS[actionType]}}>
              {ACT_EMOJI[actionType]} Laboratoire(s)
            </div>
            <input className="inp labo-inp" placeholder="Ex: Expanscience, Bailleul…"
              value={labo} onChange={e=>setLabo(e.target.value)}
              style={{borderColor:`${ACT_COLORS[actionType]}40`}}/>
            <div style={{fontSize:10,color:"#94a3b8",marginTop:4}}>Saisie libre — sépare les labos par une virgule</div>
          </div>}

          {/* Notes */}
          <div style={{marginBottom:4}}>
            <div className="fl">Notes</div>
            {notes.map((n,i)=>(
              <div key={i} className="note-edit">
                <textarea className="ta" style={{minHeight:52,border:"none",padding:0,background:"transparent"}}
                  placeholder={`Note ${i+1}…`} value={n.text} onChange={e=>updNote(i,e.target.value)}/>
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6,borderTop:"1px solid #f1f5f9",paddingTop:6}}>
                  <label className="cam-btn" style={{flex:1,padding:"6px 10px",fontSize:11,cursor:"pointer"}}>
                    <ICam/>
                    {n.photo ? "📷 Photo ajoutée ✓" : "Ajouter une photo"}
                    <input type="file" accept="image/*" capture="environment" style={{display:"none"}}
                      onChange={e=>{
                        const file = e.target.files[0];
                        if(file){
                          const reader = new FileReader();
                          reader.onload = ev => updPhoto(i, ev.target.result);
                          reader.readAsDataURL(file);
                        }
                      }}/>
                  </label>
                  {notes.length>1&&<button onClick={()=>delNote(i)} style={{background:"none",border:"none",cursor:"pointer",color:"#94a3b8"}}><ITrash/></button>}
                </div>
                {n.photo && <img src={n.photo} alt="photo" style={{width:"100%",maxHeight:140,objectFit:"cover",borderRadius:8,marginTop:6}}/>}
              </div>
            ))}
            <button onClick={addNote} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"1.5px dashed #e2e8f0",borderRadius:10,padding:"8px 12px",color:"#94a3b8",cursor:"pointer",fontSize:12,width:"100%",justifyContent:"center",fontFamily:"'Outfit',sans-serif",marginTop:4}}>
              + Ajouter une note
            </button>
          </div>

          <div style={{display:"flex",gap:8,marginTop:16}}>
            <button onClick={()=>setStep(1)} style={{flex:"0 0 auto",padding:"13px 16px",borderRadius:13,background:"#f1f5f9",border:"none",color:"#64748b",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontSize:14}}>←</button>
            <button className="btn-save" disabled={!canSave} onClick={handleSave} style={{marginTop:0,flex:1}}>
              <ICheck/> Enregistrer
            </button>
          </div>
        </div>}
      </div>
    </div>
  );
}

// ─── QUICK MODAL ──────────────────────────────────────────────────────────────
function QuickModal({onClose,onSave}) {
  const [note,setNote]=useState("");
  return (
    <div className="ov" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mh"/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:16,fontWeight:700,color:"#1e293b"}}>📝 Mémo rapide</div>
          <button onClick={onClose} style={{background:"#f1f5f9",border:"none",borderRadius:"50%",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#64748b"}}><IX/></button>
        </div>
        <div style={{fontSize:12,color:"#94a3b8",marginBottom:12}}>Note libre — concurrent, info marché, idée…</div>
        <div className="fl">Note</div>
        <textarea className="ta" style={{minHeight:110}} placeholder="Ex: Produit concurrent vu en rayon…" value={note} onChange={e=>setNote(e.target.value)} autoFocus/>
        <button className="btn-save" disabled={!note.trim()} onClick={()=>onSave({note})}
          style={{background:"linear-gradient(135deg,#f59e0b,#ef4444)"}}>
          <ICheck/> Enregistrer le mémo
        </button>
      </div>
    </div>
  );
}
