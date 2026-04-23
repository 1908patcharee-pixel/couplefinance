import { useState, useMemo, useEffect } from "react";

const CATS={income:[
  {id:"salary",label:"เงินเดือน",icon:"💼"},{id:"freelance",label:"ฟรีแลนซ์",icon:"💻"},
  {id:"invest",label:"ลงทุน",icon:"📈"},{id:"bonus",label:"โบนัส",icon:"🎉"},
  {id:"gift",label:"ของขวัญ",icon:"🎁"},{id:"other_in",label:"อื่นๆ",icon:"💰"}],
expense:[
  {id:"food",label:"อาหาร",icon:"🍜"},{id:"transport",label:"เดินทาง",icon:"🚗"},
  {id:"shopping",label:"ช้อปปิ้ง",icon:"🛍️"},{id:"bills",label:"ค่าบิล",icon:"📄"},
  {id:"health",label:"สุขภาพ",icon:"💊"},{id:"fun",label:"บันเทิง",icon:"🎬"},
  {id:"edu",label:"การศึกษา",icon:"📚"},{id:"home",label:"บ้าน",icon:"🏠"},
  {id:"family",label:"ครอบครัว",icon:"👨‍👩‍👧‍👦"},{id:"other_out",label:"อื่นๆ",icon:"📦"}]};
const MO=["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const fmt=n=>n.toLocaleString("th-TH",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtS=n=>n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(1)+"K":fmt(n);
const td=()=>new Date().toISOString().slice(0,10);
const fmtD=d=>{const t=new Date(d);return`${t.getDate()} ${MO[t.getMonth()]}`;};
const fmtDF=d=>{const t=new Date(d);return`${t.getDate()} ${MO[t.getMonth()]} ${t.getFullYear()+543}`;};
const ci=id=>[...CATS.income,...CATS.expense].find(c=>c.id===id)||{label:id,icon:"❓"};

const EMOJIS=["🧑","👩","👦","👧","👴","👵","🐶","🐱"];
const COLORS=["#64b5f6","#f48fb1","#4db6ac","#ffb74d","#e57373","#ba68c8","#81c784","#7986cb"];

const DEF_MEMBERS=[{id:"me",name:"ฉัน",emoji:"🧑",color:"#64b5f6",isMe:true}];

const SEED=[
  {id:1,type:"income",cat:"salary",amt:35000,note:"เงินเดือน เม.ย.",date:"2026-04-01",who:"me"},
  {id:2,type:"expense",cat:"food",amt:1250,note:"ข้าวมื้อเที่ยง",date:"2026-04-18",who:"me"},
  {id:3,type:"expense",cat:"transport",amt:800,note:"น้ำมันรถ",date:"2026-04-17",who:"me"},
  {id:4,type:"expense",cat:"bills",amt:2400,note:"ค่าไฟฟ้า",date:"2026-04-15",who:"shared"},
  {id:5,type:"income",cat:"freelance",amt:8500,note:"งานออกแบบ",date:"2026-04-10",who:"me"},
  {id:6,type:"expense",cat:"shopping",amt:3200,note:"เสื้อผ้า",date:"2026-04-12",who:"me"},
  {id:7,type:"expense",cat:"fun",amt:450,note:"ดูหนัง",date:"2026-04-20",who:"shared"},
  {id:8,type:"expense",cat:"food",amt:680,note:"กาแฟ",date:"2026-04-21",who:"me"},
  {id:9,type:"expense",cat:"home",amt:8000,note:"ค่าเช่าบ้าน",date:"2026-04-01",who:"shared"},
  {id:10,type:"expense",cat:"family",amt:2000,note:"ค่าอาหารครอบครัว",date:"2026-04-13",who:"shared"},
];
const DB=[{cat:"food",limit:5000},{cat:"transport",limit:3000},{cat:"shopping",limit:4000},{cat:"bills",limit:5000},{cat:"fun",limit:2000}];
const DG=[{id:1,name:"ทริปญี่ปุ่น",target:60000,saved:22000,color:"#64b5f6"},{id:2,name:"ซื้อ iPad",target:35000,saved:12500,color:"#ffb74d"}];
const DRec=[{id:1,cat:"home",amt:8000,note:"ค่าเช่าบ้าน",who:"shared",day:1,type:"expense"},{id:2,cat:"bills",amt:2400,note:"ค่าไฟฟ้า",who:"shared",day:15,type:"expense"},{id:3,cat:"salary",amt:35000,note:"เงินเดือน",who:"me",day:1,type:"income"}];

const Ic=({d,size=22,color="currentColor"})=>(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>);
const P={
  home:"M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z",
  list:"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  plus:"M12 5v14M5 12h14",chart:"M18 20V10M12 20V4M6 20v-6",
  settings:"M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  back:"M19 12H5M12 19l-7-7 7-7",chevL:"M15 18l-6-6 6-6",chevR:"M9 18l6-6-6-6",
  users:"M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  userPlus:"M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6",
};

const LS={load(k,fb){try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;}},save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}};

export default function App(){
  const init=LS.load("mf5",null);
  const[tx,setTx]=useState(init?.tx||SEED);
  const[tab,setTab]=useState("home");
  const[members,setMembers]=useState(init?.members||DEF_MEMBERS);
  const[familyMode,setFamilyMode]=useState(init?.familyMode||false);
  const[viewAs,setViewAs]=useState("all");
  const[mo,setMo]=useState(()=>td().slice(0,7));
  const[budgets,setBudgets]=useState(init?.budgets||DB);
  const[goals,setGoals]=useState(init?.goals||DG);
  const[recur,setRecur]=useState(init?.recur||DRec);
  const[fType,setFType]=useState("expense");
  const[fAmt,setFAmt]=useState("");const[fCat,setFCat]=useState("");const[fNote,setFNote]=useState("");
  const[fDate,setFDate]=useState(td());const[fWho,setFWho]=useState("me");const[editId,setEditId]=useState(null);
  const[search,setSearch]=useState("");const[filterCat,setFilterCat]=useState("all");const[filterWho,setFilterWho]=useState("all");
  const[editNameI,setEditNameI]=useState(null);const[tableMode,setTableMode]=useState("month");
  const[showBF,setShowBF]=useState(false);const[showGF,setShowGF]=useState(false);const[showRF,setShowRF]=useState(false);
  const[showAddMember,setShowAddMember]=useState(false);
  const[bfCat,setBfCat]=useState("food");const[bfAmt,setBfAmt]=useState("");
  const[gfN,setGfN]=useState("");const[gfT,setGfT]=useState("");const[gfS,setGfS]=useState("");
  const[rfCat,setRfCat]=useState("bills");const[rfAmt,setRfAmt]=useState("");const[rfNote,setRfNote]=useState("");
  const[rfWho,setRfWho]=useState("me");const[rfDay,setRfDay]=useState("1");const[rfType,setRfType]=useState("expense");
  const[newMName,setNewMName]=useState("");const[newMEmoji,setNewMEmoji]=useState("👩");
  const[reminder,setReminder]=useState(true);const[showRem,setShowRem]=useState(false);

  useEffect(()=>{LS.save("mf5",{tx,members,familyMode,budgets,goals,recur,reminder});},[tx,members,familyMode,budgets,goals,recur,reminder]);
  useEffect(()=>{if(reminder&&!tx.some(x=>x.date===td()))setShowRem(true);},[]);

  const go=t=>setTab(t);
  const txV=useMemo(()=>{
    if(!familyMode) return tx.filter(t=>t.who==="me"||t.who==="shared");
    if(viewAs==="all") return tx;
    return tx.filter(t=>t.who===viewAs||t.who==="shared");
  },[tx,viewAs,familyMode]);
  const filt=useMemo(()=>{let r=txV.filter(t=>t.date.startsWith(mo));if(search){const s=search.toLowerCase();r=r.filter(t=>t.note.toLowerCase().includes(s)||ci(t.cat).label.toLowerCase().includes(s));}if(filterCat!=="all")r=r.filter(t=>t.cat===filterCat);if(filterWho!=="all")r=r.filter(t=>t.who===filterWho);return r.sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);},[txV,mo,search,filterCat,filterWho]);
  const st=useMemo(()=>{let i=0,e=0;filt.forEach(t=>{if(t.type==="income")i+=t.amt;else e+=t.amt;});return{i,e,b:i-e};},[filt]);
  const allB=useMemo(()=>{let b=0;txV.forEach(t=>{b+=t.type==="income"?t.amt:-t.amt;});return b;},[txV]);
  const mS=useMemo(()=>{const r={};members.forEach(p=>{let i=0,e=0;tx.filter(t=>t.date.startsWith(mo)&&(t.who===p.id||t.who==="shared")).forEach(t=>{if(t.type==="income")i+=t.amt;else e+=t.amt;});r[p.id]={i,e,b:i-e};});return r;},[tx,mo,members]);
  const cBk=useMemo(()=>{const m={};txV.filter(t=>t.date.startsWith(mo)).forEach(t=>{m[t.cat]=(m[t.cat]||0)+t.amt;});return Object.entries(m).map(([c,total])=>{const info=ci(c);const tp=CATS.income.find(x=>x.id===c)?"income":"expense";return{...info,total,tp};}).sort((a,b)=>b.total-a.total);},[txV,mo]);
  const bU=useMemo(()=>budgets.map(b=>{let sp=0;txV.filter(t=>t.date.startsWith(mo)&&t.cat===b.cat&&t.type==="expense").forEach(t=>{sp+=t.amt;});const c=ci(b.cat);const pct=b.limit>0?(sp/b.limit)*100:0;return{...b,...c,sp,pct};}),[budgets,txV,mo]);
  const m6=useMemo(()=>{const ms=[];const now=new Date();for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);const k=d.toISOString().slice(0,7);let ii=0,ee=0;txV.forEach(t=>{if(t.date.startsWith(k)){if(t.type==="income")ii+=t.amt;else ee+=t.amt;}});ms.push({k,l:MO[d.getMonth()],i:ii,e:ee});}return ms;},[txV]);
  const mx=useMemo(()=>Math.max(...m6.map(m=>Math.max(m.i,m.e)),1),[m6]);
  const mT=useMemo(()=>{const rows=[];const yr=parseInt(mo.split("-")[0]);let rb=0;txV.forEach(t=>{if(t.date<`${yr}-01-01`)rb+=t.type==="income"?t.amt:-t.amt;});for(let m=0;m<12;m++){const key=`${yr}-${String(m+1).padStart(2,"0")}`;let inc=0,exp=0;txV.forEach(t=>{if(t.date.startsWith(key)){if(t.type==="income")inc+=t.amt;else exp+=t.amt;}});rb+=inc-exp;rows.push({key,month:MO[m],inc,exp,net:inc-exp,bal:rb,cur:key===mo,has:inc>0||exp>0});}return rows;},[txV,mo]);
  const grp=useMemo(()=>{const g={};filt.forEach(t=>{if(!g[t.date])g[t.date]=[];g[t.date].push(t);});return Object.entries(g).sort((a,b)=>b[0].localeCompare(a[0]));},[filt]);

  const rF=()=>{setFAmt("");setFCat("");setFNote("");setFDate(td());setFType("expense");setEditId(null);setFWho("me");};
  const sv=()=>{const v=parseFloat(fAmt);if(!v||v<=0||!fCat)return;if(editId!==null)setTx(p=>p.map(t=>t.id===editId?{...t,type:fType,cat:fCat,amt:v,note:fNote,date:fDate,who:fWho}:t));else setTx(p=>[...p,{id:Date.now(),type:fType,cat:fCat,amt:v,note:fNote,date:fDate,who:fWho}]);rF();go("home");};
  const sE=t=>{setFType(t.type);setFAmt(String(t.amt));setFCat(t.cat);setFNote(t.note);setFDate(t.date);setFWho(t.who);setEditId(t.id);go("add");};
  const dl=id=>setTx(p=>p.filter(t=>t.id!==id));
  const cM=d=>{const[y,m]=mo.split("-").map(Number);const dt=new Date(y,m-1+d,1);setMo(dt.toISOString().slice(0,7));};
  const oI=w=>{if(w==="shared")return{emoji:"👨‍👩‍👧‍👦",name:"ค่าใช้จ่ายร่วม",color:"#ffb74d"};return members.find(p=>p.id===w)||{emoji:"❓",name:"?",color:"#90a4ae"};};
  const expCSV=()=>{const h="วันที่,ประเภท,หมวดหมู่,จำนวน,บันทึก,โดย\n";const rows=filt.map(t=>`${t.date},${t.type==="income"?"รายรับ":"รายจ่าย"},${ci(t.cat).label},${t.amt},${t.note},${oI(t.who).name}`).join("\n");const blob=new Blob(["\uFEFF"+h+rows],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`expenses_${mo}.csv`;a.click();};
  const aB=()=>{const v=parseFloat(bfAmt);if(!v)return;setBudgets(p=>[...p.filter(b=>b.cat!==bfCat),{cat:bfCat,limit:v}]);setBfAmt("");setShowBF(false);};
  const aG=()=>{const t=parseFloat(gfT),s=parseFloat(gfS)||0;if(!gfN||!t)return;setGoals(p=>[...p,{id:Date.now(),name:gfN,target:t,saved:s,color:COLORS[p.length%COLORS.length]}]);setGfN("");setGfT("");setGfS("");setShowGF(false);};
  const uGS=(id,v)=>setGoals(p=>p.map(g=>g.id===id?{...g,saved:Math.min(Math.max(0,g.saved+v),g.target)}:g));
  const aR=()=>{const v=parseFloat(rfAmt);if(!v)return;setRecur(p=>[...p,{id:Date.now(),cat:rfCat,amt:v,note:rfNote,who:rfWho,day:parseInt(rfDay),type:rfType}]);setRfAmt("");setRfNote("");setShowRF(false);};
  const addMember=()=>{if(!newMName.trim())return;const id="m"+Date.now();const color=COLORS[members.length%COLORS.length];setMembers(p=>[...p,{id,name:newMName.trim(),emoji:newMEmoji,color,isMe:false}]);setNewMName("");setNewMEmoji("👩");setShowAddMember(false);};
  const removeMember=id=>{setMembers(p=>p.filter(m=>m.id!==id));setTx(p=>p.map(t=>t.who===id?{...t,who:"me"}:t));};

  const V={"--n1":"#080e1e","--n2":"#0d1a33","--n3":"#132744","--n4":"#1a3557","--n5":"#234a75",
    "--gl":"rgba(16,32,62,.65)","--gl2":"rgba(22,42,78,.55)","--gb":"rgba(100,160,255,.1)",
    "--tx":"#e8edf6","--tx2":"#8fa4c4","--tx3":"#5a7099",
    "--gold":"#d4a853","--gold2":"rgba(212,168,83,.12)",
    "--grn":"#4ecdc4","--grn2":"rgba(78,205,196,.1)",
    "--red":"#ff6b6b","--red2":"rgba(255,107,107,.1)",
    "--amb":"#ffb74d","--amb2":"rgba(255,183,77,.12)"};

  const CSS=`
    @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;600&display=swap');
    *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
    .app{font-family:'Prompt',sans-serif;background:var(--n1);color:var(--tx);width:100%;max-width:420px;min-height:100vh;margin:0 auto;position:relative;overflow:hidden;display:flex;flex-direction:column;}
    .scr{flex:1;overflow-y:auto;padding:0 0 94px;-webkit-overflow-scrolling:touch;background:linear-gradient(180deg,var(--n1),var(--n2));}
    .scr::-webkit-scrollbar{display:none;}
    .bar{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:420px;background:rgba(8,14,30,.88);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-top:1px solid var(--gb);display:flex;padding:8px 10px 24px;z-index:50;}
    .bar button{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:none;cursor:pointer;padding:6px 0;color:var(--tx3);font-family:'Prompt';font-size:9px;font-weight:500;letter-spacing:.3px;transition:all .2s;}
    .bar button.on{color:var(--gold);}
    .bar .fab{position:absolute;top:-26px;left:50%;transform:translateX(-50%);width:58px;height:58px;border-radius:18px;border:none;cursor:pointer;background:linear-gradient(135deg,var(--gold),#c4923f);color:var(--n1);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 28px rgba(212,168,83,.35);}
    .bar .fab:active{transform:translateX(-50%) scale(.92);}
    .gl{background:var(--gl);border:1px solid var(--gb);border-radius:20px;padding:18px;backdrop-filter:blur(12px);}
    .gs{background:var(--gl);border:1px solid var(--gb);border-radius:16px;padding:14px;backdrop-filter:blur(12px);}
    .pill{padding:7px 14px;border-radius:24px;border:1px solid var(--gb);cursor:pointer;font-family:'Prompt';font-weight:500;font-size:11px;transition:all .2s;background:var(--gl);}
    .mn{font-family:'IBM Plex Mono',monospace;letter-spacing:-.3px;}
    .inp{width:100%;padding:13px 16px;border-radius:16px;border:1px solid var(--gb);background:var(--gl2);color:var(--tx);font-size:14px;font-family:'Prompt';outline:none;transition:border-color .2s;}
    .inp:focus{border-color:var(--gold);}
    .fi{animation:fi .3s cubic-bezier(.25,.46,.45,.94);}
    @keyframes fi{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    table{font-family:'Prompt';width:100%;border-collapse:separate;border-spacing:0 2px;font-size:11px;}
    table th{padding:8px 6px;color:var(--tx3);font-weight:500;font-size:10px;border-bottom:1px solid rgba(100,160,255,.06);text-transform:uppercase;letter-spacing:.5px;}
    table td{padding:8px 6px;}
    .mdl-bg{position:fixed;inset:0;background:rgba(4,8,18,.75);z-index:100;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(6px);}
    .mdl{background:linear-gradient(180deg,var(--n3),var(--n2));border:1px solid var(--gb);border-radius:28px 28px 0 0;padding:28px 24px 44px;width:100%;max-width:420px;animation:su .3s cubic-bezier(.25,.46,.45,.94);}
    @keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}
    select{-webkit-appearance:none;appearance:none;font-family:'Prompt';}
    .orb{position:absolute;border-radius:50%;pointer-events:none;filter:blur(60px);}
    .avatar{display:flex;align-items:center;justify-content:center;border-radius:12px;font-size:16px;flex-shrink:0;}
  `;

  return(<>
    <style>{CSS}</style>
    {/* Reminder Modal */}
    {showRem&&(<div className="mdl-bg" onClick={()=>setShowRem(false)}><div className="mdl" onClick={e=>e.stopPropagation()}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{width:64,height:64,borderRadius:20,background:"var(--gold2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 12px"}}>🔔</div>
        <div style={{fontSize:18,fontWeight:700}}>อย่าลืมบันทึกวันนี้</div>
        <div style={{fontSize:13,color:"var(--tx2)",marginTop:6,fontWeight:300}}>ยังไม่ได้บันทึกรายรับรายจ่ายวันนี้</div></div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>setShowRem(false)} style={{flex:1,padding:"14px",borderRadius:16,border:"1px solid var(--gb)",background:"transparent",color:"var(--tx2)",cursor:"pointer",fontFamily:"'Prompt'",fontWeight:500,fontSize:14}}>ภายหลัง</button>
        <button onClick={()=>{setShowRem(false);rF();go("add");}} style={goldBtn}>บันทึกเลย</button>
      </div>
    </div></div>)}

    <div className="app" style={V}>
      <div className="orb" style={{width:200,height:200,background:"rgba(100,181,246,.06)",top:-60,right:-40}}/>
      <div className="orb" style={{width:160,height:160,background:"rgba(212,168,83,.05)",bottom:100,left:-40}}/>

      {/* Status */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 22px 8px",fontSize:12,fontWeight:500,color:"var(--tx3)"}}>
        <span>{new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'})}</span>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <svg width="15" height="11" viewBox="0 0 16 12"><path d="M1 8h2v4H1zM5 5h2v7H5zM9 3h2v9H9zM13 0h2v12h-2z" fill="var(--tx3)"/></svg>
          <svg width="18" height="11" viewBox="0 0 20 12"><rect x="0" y="1" width="17" height="10" rx="2.5" fill="none" stroke="var(--tx3)" strokeWidth="1"/><rect x="1.5" y="2.5" width="12" height="7" rx="1.5" fill="var(--grn)"/></svg>
        </div></div>

      <div className="scr">
        {/* ═══ HOME ═══ */}
        {tab==="home"&&(<div className="fi" style={{padding:"0 22px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",margin:"8px 0 18px"}}>
            <div>
              <div style={{fontSize:13,color:"var(--tx3)",fontWeight:300}}>สวัสดี 👋</div>
              <div style={{fontSize:21,fontWeight:700,letterSpacing:-.3,background:"linear-gradient(135deg,var(--tx),var(--gold))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                {familyMode?"บัญชีครอบครัว":"บัญชีของฉัน"}
              </div></div>
            <button onClick={()=>go("settings")} style={{...nBtn}}><Ic d={P.settings} size={18}/></button>
          </div>

          {/* Family filter */}
          {familyMode&&members.length>1&&(
            <div style={{display:"flex",gap:5,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
              <button className="pill" onClick={()=>setViewAs("all")} style={{background:viewAs==="all"?"var(--gold)":"var(--gl)",color:viewAs==="all"?"var(--n1)":"var(--tx2)",borderColor:viewAs==="all"?"transparent":"var(--gb)",fontWeight:viewAs==="all"?600:400,whiteSpace:"nowrap"}}>👨‍👩‍👧‍👦 ทั้งหมด</button>
              {members.map(p=>(<button key={p.id} className="pill" onClick={()=>setViewAs(p.id)} style={{background:viewAs===p.id?p.color:"var(--gl)",color:viewAs===p.id?"#fff":"var(--tx2)",borderColor:viewAs===p.id?"transparent":"var(--gb)",fontWeight:viewAs===p.id?600:400,whiteSpace:"nowrap"}}>{p.emoji} {p.name}</button>))}
            </div>
          )}

          {/* Balance */}
          <div style={{background:"linear-gradient(145deg,#0f2a50,#163564 30%,#1c4070 60%,#0f2a50)",borderRadius:24,padding:"24px 22px 20px",marginBottom:16,position:"relative",overflow:"hidden",border:"1px solid rgba(100,160,255,.12)"}}>
            <div style={{position:"absolute",top:-30,right:-20,width:140,height:140,background:"radial-gradient(circle,rgba(212,168,83,.15),transparent 70%)",borderRadius:"50%"}}/>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,rgba(212,168,83,.3),transparent)"}}/>
            <div style={{fontSize:11,color:"rgba(255,255,255,.45)",fontWeight:400,letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>ยอดคงเหลือทั้งหมด</div>
            <div className="mn" style={{fontSize:34,fontWeight:600,color:"#fff",marginBottom:16,lineHeight:1}}>฿{fmt(allB)}</div>
            <div style={{display:"flex",gap:10}}>
              <div style={{flex:1,background:"rgba(255,255,255,.06)",borderRadius:14,padding:"10px 14px",border:"1px solid rgba(255,255,255,.04)"}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,.4)",marginBottom:3,fontWeight:300}}>รายรับเดือนนี้</div>
                <div className="mn" style={{fontSize:15,fontWeight:600,color:"var(--grn)"}}>+{fmt(st.i)}</div></div>
              <div style={{flex:1,background:"rgba(255,255,255,.06)",borderRadius:14,padding:"10px 14px",border:"1px solid rgba(255,255,255,.04)"}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,.4)",marginBottom:3,fontWeight:300}}>รายจ่ายเดือนนี้</div>
                <div className="mn" style={{fontSize:15,fontWeight:600,color:"var(--red)"}}>-{fmt(st.e)}</div></div>
            </div></div>

          {/* Family members comparison */}
          {familyMode&&members.length>1&&viewAs==="all"&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>👨‍👩‍👧‍👦 สมาชิกครอบครัว</div>
              <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
                {members.map(p=>{const s=mS[p.id]||{i:0,e:0,b:0};return(
                  <div key={p.id} className="gs" onClick={()=>setViewAs(p.id)} style={{minWidth:140,flex:"0 0 auto",cursor:"pointer",borderColor:`${p.color}20`}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
                      <div className="avatar" style={{width:32,height:32,background:`${p.color}15`,border:`1px solid ${p.color}25`}}>{p.emoji}</div>
                      <div style={{fontWeight:600,fontSize:12,color:p.color}}>{p.name}</div></div>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:10,color:"var(--tx3)",fontWeight:300}}>รายรับ</span><span className="mn" style={{fontSize:11,fontWeight:600,color:"var(--grn)"}}>+{fmtS(s.i)}</span></div>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:10,color:"var(--tx3)",fontWeight:300}}>รายจ่าย</span><span className="mn" style={{fontSize:11,fontWeight:600,color:"var(--red)"}}>-{fmtS(s.e)}</span></div>
                    <div style={{borderTop:`1px solid ${p.color}15`,paddingTop:6,textAlign:"right"}}><span className="mn" style={{fontSize:12,fontWeight:600,color:s.b>=0?"var(--grn)":"var(--red)"}}>{s.b>=0?"+":""}{fmtS(s.b)}</span></div>
                  </div>);})}
              </div></div>)}

          {/* Budget */}
          {bU.length>0&&(<div className="gs" style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontSize:13,fontWeight:600}}>งบประมาณ</span><button onClick={()=>go("chart")} style={{background:"none",border:"none",color:"var(--gold)",cursor:"pointer",fontFamily:"'Prompt'",fontSize:11,fontWeight:500}}>ดูทั้งหมด →</button></div>
            {bU.slice(0,3).map(b=>(<div key={b.cat} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}><span style={{fontWeight:400}}>{b.icon} {b.label}</span><span className="mn" style={{fontWeight:600,fontSize:10,color:b.pct>100?"var(--red)":b.pct>80?"var(--amb)":"var(--tx2)"}}>{fmt(b.sp)}/{fmtS(b.limit)}</span></div>
              <div style={{height:4,borderRadius:2,background:"rgba(100,160,255,.08)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:2,transition:"width .5s",width:`${Math.min(b.pct,100)}%`,background:b.pct>100?"var(--red)":b.pct>80?"var(--amb)":"var(--grn)"}}/></div>
            </div>))}</div>)}

          {/* Goals */}
          {goals.length>0&&(<div className="gs" style={{marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>🎯 เป้าหมายออม</div>
            {goals.map(g=>{const pct=(g.saved/g.target)*100;return(<div key={g.id} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{fontWeight:500}}>{g.name}</span><span className="mn" style={{fontWeight:600,color:g.color,fontSize:11}}>{Math.round(pct)}%</span></div>
              <div style={{height:6,borderRadius:3,background:"rgba(100,160,255,.08)",overflow:"hidden",marginBottom:5}}><div style={{height:"100%",borderRadius:3,transition:"width .5s",width:`${Math.min(pct,100)}%`,background:`linear-gradient(90deg,${g.color},${g.color}cc)`}}/></div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span className="mn" style={{fontSize:10,color:"var(--tx3)"}}>{fmt(g.saved)}/{fmt(g.target)}</span>
                <div style={{display:"flex",gap:4}}>{[500,1000].map(v=>(<button key={v} onClick={()=>uGS(g.id,v)} style={{padding:"2px 8px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"'IBM Plex Mono'",fontSize:9,fontWeight:600,background:`${g.color}18`,color:g.color}}>+{v>=1e3?`${v/1e3}K`:v}</button>))}</div></div>
            </div>);})}
          </div>)}

          {/* Recent */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"4px 0 12px"}}><span style={{fontSize:14,fontWeight:600}}>รายการล่าสุด</span><button onClick={()=>go("list")} style={{background:"none",border:"none",color:"var(--gold)",cursor:"pointer",fontFamily:"'Prompt'",fontSize:11,fontWeight:500}}>ดูทั้งหมด →</button></div>
          {filt.slice(0,5).map(t=>{const c=ci(t.cat);const o=oI(t.who);return(<div key={t.id} className="gs" style={{marginBottom:6,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:42,height:42,borderRadius:14,background:t.type==="income"?"var(--grn2)":"var(--red2)",border:`1px solid ${t.type==="income"?"rgba(78,205,196,.15)":"rgba(255,107,107,.15)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{c.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13,fontWeight:500}}>{c.label}</span>
                {familyMode&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:6,background:`${o.color}15`,color:o.color,fontWeight:600,border:`1px solid ${o.color}20`}}>{o.emoji}</span>}</div>
              <div style={{fontSize:11,color:"var(--tx3)",marginTop:2,fontWeight:300}}>{t.note&&`${t.note} · `}{fmtD(t.date)}</div></div>
            <div className="mn" style={{fontSize:14,fontWeight:600,color:t.type==="income"?"var(--grn)":"var(--red)",flexShrink:0}}>{t.type==="income"?"+":"-"}{fmt(t.amt)}</div>
          </div>);})}
          {filt.length===0&&<div style={{textAlign:"center",padding:30,color:"var(--tx3)",fontWeight:300}}><div style={{fontSize:36,marginBottom:8}}>📭</div>ยังไม่มีรายการ</div>}
          <div style={{height:16}}/>
        </div>)}

        {/* ═══ LIST ═══ */}
        {tab==="list"&&(<div className="fi" style={{padding:"0 22px"}}>
          <div style={{fontSize:20,fontWeight:700,margin:"10px 0 14px"}}>รายการทั้งหมด</div>
          <input className="inp" value={search} onChange={e=>setSearch(e.target.value)} placeholder="ค้นหา..." style={{marginBottom:10}}/>
          <div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:4}}>
            <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={selS}><option value="all">ทุกหมวด</option>{[...CATS.income,...CATS.expense].map(c=>(<option key={c.id} value={c.id}>{c.icon} {c.label}</option>))}</select>
            {familyMode&&<select value={filterWho} onChange={e=>setFilterWho(e.target.value)} style={selS}><option value="all">ทุกคน</option>{members.map(p=>(<option key={p.id} value={p.id}>{p.emoji} {p.name}</option>))}<option value="shared">👨‍👩‍👧‍👦 ร่วม</option></select>}
            <button onClick={expCSV} style={{...selS,background:"var(--gold2)",color:"var(--gold)",borderColor:"rgba(212,168,83,.2)",cursor:"pointer",fontWeight:600,whiteSpace:"nowrap"}}>📥 CSV</button>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <button onClick={()=>cM(-1)} style={nBtn}><Ic d={P.chevL} size={16}/></button>
            <span style={{fontSize:14,fontWeight:600}}>{MO[parseInt(mo.split("-")[1])-1]} {parseInt(mo.split("-")[0])+543}</span>
            <button onClick={()=>cM(1)} style={nBtn}><Ic d={P.chevR} size={16}/></button></div>
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {[{v:st.i,c:"var(--grn)",bg:"var(--grn2)",p:"+"},{v:st.e,c:"var(--red)",bg:"var(--red2)",p:"-"},{v:st.b,c:st.b>=0?"var(--gold)":"var(--red)",bg:st.b>=0?"var(--gold2)":"var(--red2)",p:"="}].map((x,i)=>(
              <div key={i} className="mn" style={{flex:1,textAlign:"center",padding:"8px 0",borderRadius:12,background:x.bg,fontSize:11,fontWeight:600,color:x.c,border:`1px solid ${x.c}15`}}>{x.p}{fmt(x.v)}</div>))}
          </div>
          {grp.map(([date,items])=>(<div key={date} style={{marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:500,color:"var(--tx3)",marginBottom:8,paddingLeft:2,letterSpacing:.5,textTransform:"uppercase"}}>{fmtDF(date)}</div>
            {items.map(t=>{const c=ci(t.cat);const o=oI(t.who);return(<div key={t.id} className="gs" style={{marginBottom:5,display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:38,height:38,borderRadius:12,background:t.type==="income"?"var(--grn2)":"var(--red2)",border:`1px solid ${t.type==="income"?"rgba(78,205,196,.12)":"rgba(255,107,107,.12)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{c.icon}</div>
              <div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:12,fontWeight:500}}>{c.label}</span>{familyMode&&<span style={{fontSize:8,padding:"1px 5px",borderRadius:5,background:`${o.color}12`,color:o.color,fontWeight:600}}>{o.emoji}</span>}</div>
                {t.note&&<div style={{fontSize:10,color:"var(--tx3)",marginTop:1,fontWeight:300}}>{t.note}</div>}</div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                <span className="mn" style={{fontSize:13,fontWeight:600,color:t.type==="income"?"var(--grn)":"var(--red)"}}>{t.type==="income"?"+":"-"}{fmt(t.amt)}</span>
                <div style={{display:"flex",gap:3}}><button onClick={()=>sE(t)} style={tnB}>✏️</button><button onClick={()=>dl(t.id)} style={tnB}>🗑</button></div></div>
            </div>);})}
          </div>))}
          {filt.length===0&&<div style={{textAlign:"center",padding:30,color:"var(--tx3)",fontWeight:300}}><div style={{fontSize:36,marginBottom:6}}>📭</div>ไม่มีรายการ</div>}
        </div>)}

        {/* ═══ ADD ═══ */}
        {tab==="add"&&(<div className="fi" style={{padding:"0 22px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,margin:"10px 0 20px"}}><button onClick={()=>{rF();go("home");}} style={nBtn}><Ic d={P.back} size={16}/></button><span style={{fontSize:18,fontWeight:700}}>{editId?"แก้ไขรายการ":"เพิ่มรายการ"}</span></div>
          <div style={{display:"flex",background:"var(--gl)",border:"1px solid var(--gb)",borderRadius:16,padding:3,marginBottom:20}}>
            {["expense","income"].map(t=>(<button key={t} onClick={()=>{setFType(t);setFCat("");}} style={{flex:1,padding:"12px 0",border:"none",borderRadius:13,cursor:"pointer",fontFamily:"'Prompt'",fontWeight:600,fontSize:14,transition:"all .2s",background:fType===t?(t==="income"?"var(--grn)":"var(--red)"):"transparent",color:fType===t?"#fff":"var(--tx3)"}}>{t==="income"?"💰 รายรับ":"💸 รายจ่าย"}</button>))}
          </div>
          <div style={{textAlign:"center",marginBottom:22}}>
            <div style={lbl}>จำนวนเงิน (บาท)</div>
            <input type="number" value={fAmt} onChange={e=>setFAmt(e.target.value)} placeholder="0.00" className="mn" style={{width:"100%",padding:"16px",borderRadius:20,border:"1px solid var(--gb)",background:"var(--gl2)",color:"var(--tx)",fontSize:34,fontWeight:600,fontFamily:"'IBM Plex Mono'",textAlign:"center",outline:"none"}}/>
          </div>
          {/* Owner */}
          {familyMode&&members.length>1&&(<><div style={lbl}>บันทึกโดย</div>
            <div style={{display:"flex",gap:6,marginBottom:18,overflowX:"auto",paddingBottom:4}}>
              {[...members,{id:"shared",emoji:"👨‍👩‍👧‍👦",name:"ร่วมกัน",color:"#ffb74d"}].map(o=>(<button key={o.id} onClick={()=>setFWho(o.id)} style={{padding:"10px 8px",borderRadius:14,cursor:"pointer",border:`1px solid ${fWho===o.id?o.color+"50":"var(--gb)"}`,background:fWho===o.id?`${o.color}12`:"var(--gl)",color:"var(--tx)",fontFamily:"'Prompt'",fontSize:11,fontWeight:500,display:"flex",flexDirection:"column",alignItems:"center",gap:5,minWidth:64,transition:"all .2s"}}><span style={{fontSize:22}}>{o.emoji}</span>{o.name}</button>))}
            </div></>)}
          <div style={lbl}>หมวดหมู่</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:18}}>
            {CATS[fType].map(c=>(<button key={c.id} onClick={()=>setFCat(c.id)} style={{padding:"9px 14px",borderRadius:14,cursor:"pointer",border:`1px solid ${fCat===c.id?(fType==="income"?"rgba(78,205,196,.4)":"rgba(255,107,107,.4)"):"var(--gb)"}`,background:fCat===c.id?(fType==="income"?"var(--grn2)":"var(--red2)"):"var(--gl)",color:"var(--tx)",fontFamily:"'Prompt'",fontSize:12,fontWeight:500}}>{c.icon} {c.label}</button>))}</div>
          <div style={lbl}>บันทึก</div>
          <input className="inp" value={fNote} onChange={e=>setFNote(e.target.value)} placeholder="เช่น ข้าวมื้อเที่ยง..." style={{marginBottom:14}}/>
          <div style={lbl}>วันที่</div>
          <input className="inp" type="date" value={fDate} onChange={e=>setFDate(e.target.value)} style={{marginBottom:22,colorScheme:"dark"}}/>
          <button onClick={sv} disabled={!fAmt||!fCat||parseFloat(fAmt)<=0} style={{width:"100%",padding:"16px",borderRadius:18,border:"none",cursor:"pointer",fontFamily:"'Prompt'",fontWeight:700,fontSize:16,background:!fAmt||!fCat?"var(--n4)":(fType==="income"?"var(--grn)":"var(--red)"),color:!fAmt||!fCat?"var(--tx3)":"#fff",boxShadow:fAmt&&fCat?"0 8px 28px rgba(0,0,0,.3)":"none"}}>{editId?"💾 บันทึกการแก้ไข":"✅ บันทึกรายการ"}</button>
          {editId&&<button onClick={()=>{rF();go("home");}} style={{width:"100%",padding:"14px",borderRadius:16,marginTop:8,border:"1px solid var(--gb)",background:"transparent",color:"var(--tx2)",cursor:"pointer",fontFamily:"'Prompt'",fontWeight:500,fontSize:14}}>ยกเลิก</button>}
        </div>)}

        {/* ═══ CHART ═══ */}
        {tab==="chart"&&(<div className="fi" style={{padding:"0 22px"}}>
          <div style={{fontSize:20,fontWeight:700,margin:"10px 0 16px"}}>วิเคราะห์</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <button onClick={()=>cM(-1)} style={nBtn}><Ic d={P.chevL} size={16}/></button>
            <span style={{fontSize:14,fontWeight:600}}>{MO[parseInt(mo.split("-")[1])-1]} {parseInt(mo.split("-")[0])+543}</span>
            <button onClick={()=>cM(1)} style={nBtn}><Ic d={P.chevR} size={16}/></button></div>
          {/* Donut */}
          <div className="gl" style={{display:"flex",alignItems:"center",gap:18,marginBottom:14}}>
            <div style={{position:"relative",width:110,height:110,flexShrink:0}}>
              {(()=>{const total=st.i+st.e||1;const pct=st.i/total;const r=44;const c=2*Math.PI*r;const iL=pct*c;
                return(<svg viewBox="0 0 120 120" style={{transform:"rotate(-90deg)"}}><circle cx="60" cy="60" r={r} fill="none" stroke="rgba(100,160,255,.08)" strokeWidth="8"/>
                  {st.i>0&&<circle cx="60" cy="60" r={r} fill="none" stroke="var(--grn)" strokeWidth="8" strokeDasharray={`${iL} ${c}`} strokeLinecap="round"/>}
                  {st.e>0&&<circle cx="60" cy="60" r={r} fill="none" stroke="var(--red)" strokeWidth="8" strokeDasharray={`${(1-pct)*c} ${c}`} strokeDashoffset={`-${iL}`} strokeLinecap="round"/>}
                </svg>);})()}
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:9,color:"var(--tx3)",fontWeight:300}}>คงเหลือ</span>
                <span className="mn" style={{fontSize:14,fontWeight:600,color:st.b>=0?"var(--grn)":"var(--red)"}}>{st.b>=0?"+":""}{fmtS(st.b)}</span></div></div>
            <div style={{flex:1}}>
              <div style={{marginBottom:10}}><div style={{fontSize:10,color:"var(--tx3)",fontWeight:300}}>รายรับ</div><div className="mn" style={{fontSize:17,fontWeight:600,color:"var(--grn)"}}>+{fmt(st.i)}</div></div>
              <div><div style={{fontSize:10,color:"var(--tx3)",fontWeight:300}}>รายจ่าย</div><div className="mn" style={{fontSize:17,fontWeight:600,color:"var(--red)"}}>-{fmt(st.e)}</div></div></div></div>
          {/* Budget */}
          <div className="gl" style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><span style={{fontSize:13,fontWeight:600}}>งบประมาณ</span><button onClick={()=>setShowBF(!showBF)} style={{fontSize:11,color:"var(--gold)",background:"none",border:"none",cursor:"pointer",fontFamily:"'Prompt'",fontWeight:500}}>+ เพิ่ม</button></div>
            {showBF&&(<div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
              <select value={bfCat} onChange={e=>setBfCat(e.target.value)} style={{...selS,flex:1}}>{CATS.expense.map(c=>(<option key={c.id} value={c.id}>{c.icon} {c.label}</option>))}</select>
              <input className="inp" type="number" value={bfAmt} onChange={e=>setBfAmt(e.target.value)} placeholder="วงเงิน" style={{flex:1,marginBottom:0}}/>
              <button onClick={aB} style={goldBtnSm}>✓</button></div>)}
            {bU.map(b=>(<div key={b.cat} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}><span>{b.icon} {b.label}</span>
                <div style={{display:"flex",alignItems:"center",gap:6}}><span className="mn" style={{fontWeight:600,fontSize:10,color:b.pct>100?"var(--red)":b.pct>80?"var(--amb)":"var(--tx2)"}}>{fmt(b.sp)}/{fmt(b.limit)}</span>
                  <button onClick={()=>setBudgets(p=>p.filter(x=>x.cat!==b.cat))} style={{...tnB,width:18,height:18,fontSize:9}}>✕</button></div></div>
              <div style={{height:4,borderRadius:2,background:"rgba(100,160,255,.06)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:2,width:`${Math.min(b.pct,100)}%`,background:b.pct>100?"var(--red)":b.pct>80?"var(--amb)":"var(--grn)",transition:"width .5s"}}/></div>
            </div>))}</div>
          {/* Goals */}
          <div className="gl" style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><span style={{fontSize:13,fontWeight:600}}>🎯 เป้าหมายออม</span><button onClick={()=>setShowGF(!showGF)} style={{fontSize:11,color:"var(--gold)",background:"none",border:"none",cursor:"pointer",fontFamily:"'Prompt'",fontWeight:500}}>+ เพิ่ม</button></div>
            {showGF&&(<div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
              <input className="inp" value={gfN} onChange={e=>setGfN(e.target.value)} placeholder="ชื่อเป้าหมาย" style={{flex:"1 1 100%",marginBottom:6}}/>
              <input className="inp" type="number" value={gfT} onChange={e=>setGfT(e.target.value)} placeholder="เป้าหมาย" style={{flex:1,marginBottom:0}}/>
              <input className="inp" type="number" value={gfS} onChange={e=>setGfS(e.target.value)} placeholder="ออมแล้ว" style={{flex:1,marginBottom:0}}/>
              <button onClick={aG} style={goldBtnSm}>✓</button></div>)}
            {goals.map(g=>{const pct=(g.saved/g.target)*100;return(<div key={g.id} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{fontWeight:500}}>{g.name}</span><div style={{display:"flex",alignItems:"center",gap:6}}><span className="mn" style={{fontWeight:600,color:g.color,fontSize:11}}>{Math.round(pct)}%</span><button onClick={()=>setGoals(p=>p.filter(x=>x.id!==g.id))} style={{...tnB,width:18,height:18,fontSize:9}}>✕</button></div></div>
              <div style={{height:6,borderRadius:3,background:"rgba(100,160,255,.06)",overflow:"hidden",marginBottom:5}}><div style={{height:"100%",borderRadius:3,width:`${Math.min(pct,100)}%`,background:g.color,transition:"width .5s"}}/></div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span className="mn" style={{fontSize:10,color:"var(--tx3)"}}>{fmt(g.saved)}/{fmt(g.target)}</span>
                <div style={{display:"flex",gap:3}}>{[-1000,500,1000,5000].map(v=>(<button key={v} onClick={()=>uGS(g.id,v)} style={{padding:"2px 7px",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"'IBM Plex Mono'",fontSize:9,fontWeight:600,background:v<0?"var(--red2)":`${g.color}15`,color:v<0?"var(--red)":g.color}}>{v>0?"+":""}{Math.abs(v)>=1e3?`${v/1e3}K`:v}</button>))}</div></div>
            </div>);})}
          </div>
          {/* Category */}
          <div className="gl" style={{marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:12}}>หมวดหมู่</div>
            {cBk.map(c=>{const mxC=Math.max(...cBk.map(x=>x.total),1);return(<div key={c.id} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}><span>{c.icon} {c.label}</span><span className="mn" style={{fontSize:11,fontWeight:600,color:c.tp==="income"?"var(--grn)":"var(--red)"}}>{c.tp==="income"?"+":"-"}{fmt(c.total)}</span></div>
              <div style={{height:4,borderRadius:2,background:"rgba(100,160,255,.06)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:2,width:`${(c.total/mxC)*100}%`,background:c.tp==="income"?"var(--grn)":"var(--red)",transition:"width .5s"}}/></div>
            </div>);})}
          </div>
          {/* Table */}
          <div className="gl" style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><span style={{fontSize:13,fontWeight:600}}>ตารางสรุป</span>
              <div style={{display:"flex",background:"var(--gl2)",borderRadius:12,padding:3,border:"1px solid var(--gb)"}}>
                {[{id:"month",l:"เดือน"},{id:"day",l:"วัน"}].map(m=>(<button key={m.id} onClick={()=>setTableMode(m.id)} style={{padding:"5px 12px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'Prompt'",fontWeight:500,fontSize:10,background:tableMode===m.id?"var(--gold)":"transparent",color:tableMode===m.id?"var(--n1)":"var(--tx3)"}}>{m.l}</button>))}</div></div>
            <div style={{overflowX:"auto"}}><table><thead><tr>{["","รายรับ","รายจ่าย","สุทธิ","คงเหลือ"].map((h,i)=>(<th key={i} style={{textAlign:i===0?"left":"right"}}>{h}</th>))}</tr></thead>
              <tbody>{(tableMode==="month"?mT.filter(r=>r.has||r.cur):(()=>{const rows=[];const[yr,mn]=mo.split("-").map(Number);const dim=new Date(yr,mn,0).getDate();let rb=0;txV.forEach(t=>{if(t.date<`${mo}-01`)rb+=t.type==="income"?t.amt:-t.amt;});for(let d=1;d<=dim;d++){const k=`${mo}-${String(d).padStart(2,"0")}`;let inc=0,exp=0;txV.forEach(t=>{if(t.date===k){if(t.type==="income")inc+=t.amt;else exp+=t.amt;}});rb+=inc-exp;if(inc>0||exp>0)rows.push({key:k,month:`${d} ${MO[mn-1]}`,inc,exp,net:inc-exp,bal:rb,cur:k===td(),has:true});}return rows;})()).map(r=>(<tr key={r.key} style={{background:r.cur?"var(--gold2)":"transparent"}}>
                <td style={{fontWeight:r.cur?600:400,color:r.cur?"var(--gold)":"var(--tx)",whiteSpace:"nowrap",fontSize:11}}>{r.cur?"▸ ":""}{r.month}</td>
                <td className="mn" style={{textAlign:"right",color:r.inc>0?"var(--grn)":"var(--tx3)",fontWeight:600,fontSize:10}}>{r.inc>0?`+${fmt(r.inc)}`:"-"}</td>
                <td className="mn" style={{textAlign:"right",color:r.exp>0?"var(--red)":"var(--tx3)",fontWeight:600,fontSize:10}}>{r.exp>0?`-${fmt(r.exp)}`:"-"}</td>
                <td className="mn" style={{textAlign:"right",fontWeight:600,fontSize:10,color:r.net>0?"var(--grn)":r.net<0?"var(--red)":"var(--tx3)"}}>{r.has?(r.net>=0?"+":"")+fmt(r.net):"-"}</td>
                <td className="mn" style={{textAlign:"right",fontWeight:600,fontSize:10,color:r.bal>=0?"var(--tx)":"var(--red)"}}>{fmt(r.bal)}</td>
              </tr>))}</tbody></table></div>
          </div>
          {/* 6mo chart */}
          <div className="gl"><div style={{fontSize:13,fontWeight:600,marginBottom:14}}>6 เดือนย้อนหลัง</div>
            <div style={{display:"flex",gap:7,alignItems:"flex-end",height:80}}>
              {m6.map(m=>(<div key={m.k} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{display:"flex",gap:2,alignItems:"flex-end",height:58}}>
                  <div style={{width:10,borderRadius:"4px 4px 0 0",background:"var(--grn)",height:Math.max((m.i/mx)*58,2),opacity:m.k===mo?1:.25,transition:"all .4s"}}/>
                  <div style={{width:10,borderRadius:"4px 4px 0 0",background:"var(--red)",height:Math.max((m.e/mx)*58,2),opacity:m.k===mo?1:.25,transition:"all .4s"}}/>
                </div><span style={{fontSize:9,color:m.k===mo?"var(--gold)":"var(--tx3)",fontWeight:m.k===mo?600:300}}>{m.l}</span>
              </div>))}</div></div>
        </div>)}

        {/* ═══ SETTINGS ═══ */}
        {tab==="settings"&&(<div className="fi" style={{padding:"0 22px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,margin:"10px 0 20px"}}><button onClick={()=>go("home")} style={nBtn}><Ic d={P.back} size={16}/></button><span style={{fontSize:18,fontWeight:700}}>ตั้งค่า</span></div>

          {/* Family toggle */}
          <div className="gl" style={{marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div><div style={{fontSize:14,fontWeight:600}}>👨‍👩‍👧‍👦 แชร์ครอบครัว</div><div style={{fontSize:11,color:"var(--tx3)",marginTop:3,fontWeight:300}}>บันทึกร่วมกับสมาชิกในครอบครัว</div></div>
              <button onClick={()=>setFamilyMode(!familyMode)} style={{width:50,height:28,borderRadius:14,border:"1px solid var(--gb)",cursor:"pointer",background:familyMode?"var(--gold)":"var(--n4)",position:"relative",transition:"all .2s"}}><div style={{width:22,height:22,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:familyMode?25:3,transition:"left .2s",boxShadow:"0 2px 4px rgba(0,0,0,.2)"}}/></button>
            </div></div>

          {/* Family members */}
          {familyMode&&(
            <div className="gl" style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:14,fontWeight:600}}>สมาชิกครอบครัว</div>
                <button onClick={()=>setShowAddMember(!showAddMember)} style={{fontSize:11,color:"var(--gold)",background:"none",border:"none",cursor:"pointer",fontFamily:"'Prompt'",fontWeight:500}}>+ เพิ่มสมาชิก</button>
              </div>
              {/* Add member form */}
              {showAddMember&&(
                <div style={{padding:14,background:"var(--gl2)",borderRadius:16,border:"1px solid var(--gb)",marginBottom:14}}>
                  <div style={{fontSize:12,fontWeight:500,marginBottom:8,color:"var(--tx2)"}}>เลือก Emoji</div>
                  <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
                    {EMOJIS.map(e=>(<button key={e} onClick={()=>setNewMEmoji(e)} style={{width:40,height:40,borderRadius:12,border:newMEmoji===e?"2px solid var(--gold)":"1px solid var(--gb)",background:newMEmoji===e?"var(--gold2)":"var(--gl)",cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>{e}</button>))}
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <input className="inp" value={newMName} onChange={e=>setNewMName(e.target.value)} placeholder="ชื่อสมาชิก" style={{flex:1}}/>
                    <button onClick={addMember} style={goldBtnSm}>เพิ่ม</button>
                  </div>
                </div>
              )}
              {/* Member list */}
              {members.map((m,i)=>(<div key={m.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,padding:"10px 12px",background:"var(--gl2)",borderRadius:14,border:"1px solid var(--gb)"}}>
                <div className="avatar" style={{width:36,height:36,background:`${m.color}15`,border:`1px solid ${m.color}25`,fontSize:18}}>{m.emoji}</div>
                {editNameI===i?(
                  <input autoFocus className="inp" value={m.name} onChange={e=>{const n=[...members];n[i]={...n[i],name:e.target.value};setMembers(n);}} onBlur={()=>setEditNameI(null)} onKeyDown={e=>e.key==="Enter"&&setEditNameI(null)} style={{flex:1,padding:"8px 12px"}}/>
                ):(
                  <div onClick={()=>setEditNameI(i)} style={{flex:1,cursor:"pointer"}}>
                    <div style={{fontSize:13,fontWeight:500,color:m.color}}>{m.name}{m.isMe&&<span style={{fontSize:10,color:"var(--tx3)",marginLeft:6}}>( ตัวเอง )</span>}</div>
                  </div>
                )}
                <button onClick={()=>setEditNameI(i)} style={tnB}>✏️</button>
                {!m.isMe&&<button onClick={()=>removeMember(m.id)} style={tnB}>✕</button>}
              </div>))}
            </div>
          )}

          {/* Reminder */}
          <div className="gl" style={{marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><div style={{fontSize:14,fontWeight:600}}>🔔 แจ้งเตือน</div><div style={{fontSize:11,color:"var(--tx3)",marginTop:3,fontWeight:300}}>เตือนเมื่อยังไม่บันทึกวันนี้</div></div>
              <button onClick={()=>setReminder(!reminder)} style={{width:50,height:28,borderRadius:14,border:"1px solid var(--gb)",cursor:"pointer",background:reminder?"var(--gold)":"var(--n4)",position:"relative",transition:"all .2s"}}><div style={{width:22,height:22,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:reminder?25:3,transition:"left .2s",boxShadow:"0 2px 4px rgba(0,0,0,.2)"}}/></button>
            </div></div>

          {/* Recurring */}
          <div className="gl" style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div><div style={{fontSize:14,fontWeight:600}}>🔄 รายการประจำ</div></div>
              <button onClick={()=>setShowRF(!showRF)} style={{fontSize:11,color:"var(--gold)",background:"none",border:"none",cursor:"pointer",fontFamily:"'Prompt'",fontWeight:500}}>+ เพิ่ม</button></div>
            {showRF&&(<div style={{padding:14,background:"var(--gl2)",borderRadius:16,border:"1px solid var(--gb)",marginBottom:12}}>
              <div style={{display:"flex",gap:6,marginBottom:8}}><select value={rfType} onChange={e=>setRfType(e.target.value)} style={{...selS,flex:1}}><option value="expense">💸 รายจ่าย</option><option value="income">💰 รายรับ</option></select>
                <select value={rfCat} onChange={e=>setRfCat(e.target.value)} style={{...selS,flex:1}}>{CATS[rfType].map(c=>(<option key={c.id} value={c.id}>{c.icon} {c.label}</option>))}</select></div>
              <div style={{display:"flex",gap:6,marginBottom:8}}><input className="inp" type="number" value={rfAmt} onChange={e=>setRfAmt(e.target.value)} placeholder="จำนวน" style={{flex:1}}/><input className="inp" type="number" value={rfDay} onChange={e=>setRfDay(e.target.value)} placeholder="วันที่" style={{flex:1}}/></div>
              <div style={{display:"flex",gap:6}}><input className="inp" value={rfNote} onChange={e=>setRfNote(e.target.value)} placeholder="บันทึก" style={{flex:1}}/>
                <button onClick={aR} style={goldBtnSm}>✓</button></div></div>)}
            {recur.map(r=>{const c=ci(r.cat);return(<div key={r.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,padding:"10px 12px",background:"var(--gl2)",borderRadius:14,border:"1px solid var(--gb)"}}>
              <span style={{fontSize:16}}>{c.icon}</span><div style={{flex:1}}><div style={{fontSize:12,fontWeight:500}}>{r.note||c.label}</div><div style={{fontSize:10,color:"var(--tx3)",fontWeight:300}}>ทุกวันที่ {r.day} · {oI(r.who).name}</div></div>
              <span className="mn" style={{fontSize:11,fontWeight:600,color:r.type==="income"?"var(--grn)":"var(--red)"}}>{r.type==="income"?"+":"-"}{fmt(r.amt)}</span>
              <button onClick={()=>setRecur(p=>p.filter(x=>x.id!==r.id))} style={{...tnB,width:20,height:20,fontSize:9}}>✕</button>
            </div>);})}
          </div>

          <div className="gl"><div style={{fontSize:13,fontWeight:600,marginBottom:6}}>เกี่ยวกับ</div><div style={{fontSize:12,color:"var(--tx3)",lineHeight:1.8,fontWeight:300}}>MyFinance v5.0<br/>บันทึกรายรับรายจ่ายส่วนตัว + แชร์ครอบครัว 👨‍👩‍👧‍👦</div></div>
        </div>)}
      </div>

      {/* Bottom Nav */}
      <div className="bar">
        {[{id:"home",icon:P.home,l:"หน้าหลัก"},{id:"list",icon:P.list,l:"รายการ"},{id:"_fab"},{id:"chart",icon:P.chart,l:"วิเคราะห์"},{id:"settings",icon:P.settings,l:"ตั้งค่า"}].map(b=>{
          if(b.id==="_fab")return(<div key="fab" style={{flex:1,position:"relative"}}><button className="fab" onClick={()=>{rF();go("add");}}><Ic d={P.plus} size={26} color="var(--n1)"/></button></div>);
          return(<button key={b.id} className={tab===b.id?"on":""} onClick={()=>go(b.id)}><Ic d={b.icon} size={20} color={tab===b.id?"var(--gold)":"var(--tx3)"}/><span>{b.l}</span></button>);
        })}
      </div>
    </div>
  </>);
}

const nBtn={width:38,height:38,borderRadius:13,border:"1px solid rgba(100,160,255,.1)",background:"rgba(16,32,62,.65)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#8fa4c4"};
const tnB={width:22,height:22,borderRadius:7,border:"none",background:"rgba(16,32,62,.8)",cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",color:"#8fa4c4"};
const selS={padding:"9px 12px",borderRadius:14,border:"1px solid rgba(100,160,255,.1)",background:"rgba(16,32,62,.65)",color:"#e8edf6",fontSize:12,fontFamily:"'Prompt'",outline:"none"};
const lbl={fontSize:10,fontWeight:400,color:"#5a7099",marginBottom:7,letterSpacing:1,textTransform:"uppercase"};
const goldBtn={flex:1,padding:"14px",borderRadius:16,border:"none",background:"linear-gradient(135deg,#d4a853,#c4923f)",color:"#080e1e",cursor:"pointer",fontFamily:"'Prompt'",fontWeight:600,fontSize:14};
const goldBtnSm={padding:"9px 16px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#d4a853,#c4923f)",color:"#080e1e",cursor:"pointer",fontFamily:"'Prompt'",fontWeight:700,fontSize:13};
