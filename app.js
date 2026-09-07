const FALLBACK_DATA = {version:"2026.09.04",updatedAt:"2026-09-04",source:"内置数据快照",species:[
  {id:"001",name:"谱尼",type:"圣灵系 · 传说精灵",stats:{hp:180,attack:145,defense:120,spAttack:145,spDefense:120,speed:130}},
  {id:"002",name:"索伦森",type:"暗影系 · 传说精灵",stats:{hp:170,attack:150,defense:115,spAttack:155,spDefense:115,speed:125}},
  {id:"003",name:"混沌魔君索伦森",type:"混沌系 · 传说精灵",stats:{hp:185,attack:158,defense:125,spAttack:158,spDefense:125,speed:135}},
  {id:"004",name:"王之哈莫",type:"龙系 · 传说精灵",stats:{hp:190,attack:155,defense:130,spAttack:110,spDefense:125,speed:120}},
  {id:"005",name:"圣光灵神",type:"光系 · 传说精灵",stats:{hp:175,attack:135,defense:120,spAttack:150,spDefense:130,speed:128}},
  {id:"006",name:"幻境界皇",type:"次元系 · 传说精灵",stats:{hp:178,attack:142,defense:118,spAttack:152,spDefense:122,speed:140}},
  {id:"007",name:"天启帝君",type:"光次元系 · 传说精灵",stats:{hp:182,attack:150,defense:128,spAttack:145,spDefense:128,speed:132}},
  {id:"008",name:"魔钰",type:"混沌暗影系 · 稀有精灵",stats:{hp:165,attack:140,defense:108,spAttack:145,spDefense:110,speed:133}}
]};
const NATURES = [{name:"孤独",up:"attack",down:"defense"},{name:"勇敢",up:"attack",down:"speed"},{name:"固执",up:"attack",down:"spAttack"},{name:"调皮",up:"attack",down:"spDefense"},{name:"大胆",up:"defense",down:"attack"},{name:"淘气",up:"defense",down:"spAttack"},{name:"无虑",up:"defense",down:"spDefense"},{name:"悠闲",up:"defense",down:"speed"},{name:"保守",up:"spAttack",down:"attack"},{name:"稳重",up:"spAttack",down:"defense"},{name:"马虎",up:"spAttack",down:"spDefense"},{name:"冷静",up:"spAttack",down:"speed"},{name:"沉着",up:"spDefense",down:"attack"},{name:"温顺",up:"spDefense",down:"defense"},{name:"慎重",up:"spDefense",down:"spAttack"},{name:"狂妄",up:"spDefense",down:"speed"},{name:"胆小",up:"speed",down:"attack"},{name:"急躁",up:"speed",down:"defense"},{name:"开朗",up:"speed",down:"spAttack"},{name:"天真",up:"speed",down:"spDefense"},{name:"坦率",up:null,down:null},{name:"认真",up:null,down:null},{name:"害羞",up:null,down:null},{name:"浮躁",up:null,down:null},{name:"顽皮",up:null,down:null}];
const STAT_KEYS=["hp","attack","defense","spAttack","spDefense","speed"], STAT_LABELS={hp:"体力",attack:"攻击",defense:"防御",spAttack:"特攻",spDefense:"特防",speed:"速度"};
const EFFECTS = {
  titles: [
    { id: "none", name: "无（基础能力值）", fixed: {}, rate: {} },
    { id: "battle", name: "战斗大师（攻击 +10%）", fixed: {}, rate: { attack: 0.10 } },
    { id: "speed", name: "极速领域（速度 +10%）", fixed: {}, rate: { speed: 0.10 } },
    { id: "allround", name: "全能王者（全能力 +5%）", fixed: {}, rate: { hp: 0.05, attack: 0.05, defense: 0.05, spAttack: 0.05, spDefense: 0.05, speed: 0.05 } }
  ],
  soulmarks: [
    { id: "none", name: "无（不计魂印）", fixed: {}, rate: {} },
    { id: "vitality", name: "强化体质（体力 +50）", fixed: { hp: 50 }, rate: {} },
    { id: "offense", name: "强袭魂印（攻击 / 特攻 +15%）", fixed: {}, rate: { attack: 0.15, spAttack: 0.15 } },
    { id: "guard", name: "坚壁魂印（防御 / 特防 +15%）", fixed: {}, rate: { defense: 0.15, spDefense: 0.15 } }
  ]
};let data=FALLBACK_DATA, currentSpecies;
const $=id=>document.getElementById(id);
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function renderSelects(){
  $("speciesSelect").innerHTML=data.species.map(s=>`<option value="${s.id}">${s.name} · ${s.type.split(" · ")[0]}</option>`).join("");
  $("natureSelect").innerHTML=NATURES.map((n,i)=>`<option value="${i}">${n.name}${n.up?`（${STAT_LABELS[n.up]}↑ ${STAT_LABELS[n.down]}↓）`:"（平衡）"}</option>`).join("");
  $("titleSelect").innerHTML=EFFECTS.titles.map(e=>`<option value="${e.id}">${e.name}</option>`).join("");
  $("soulmarkSelect").innerHTML=EFFECTS.soulmarks.map(e=>`<option value="${e.id}">${e.name}</option>`).join("");
  $("ivFields").innerHTML=STAT_KEYS.map(k=>`<div class="compact-field"><label for="iv-${k}">${STAT_LABELS[k]}</label><input id="iv-${k}" data-stat="${k}" data-kind="iv" type="number" min="0" max="31" value="31"></div>`).join("");
  $("evFields").innerHTML=STAT_KEYS.map(k=>`<div class="compact-field"><label for="ev-${k}">${STAT_LABELS[k]}</label><input id="ev-${k}" data-stat="${k}" data-kind="ev" type="number" min="0" max="252" step="4" value="0"></div>`).join("");
  $("speciesSelect").addEventListener("change",calculate);$("natureSelect").addEventListener("change",calculate);$("titleSelect").addEventListener("change",calculate);$("soulmarkSelect").addEventListener("change",calculate);
  document.querySelectorAll("input").forEach(i=>i.addEventListener("input",calculate));
}
function selected(){return data.species.find(s=>s.id===$("speciesSelect").value)||data.species[0]}
function readNumber(id,min,max){const el=$(id);let n=Number(el.value);if(!Number.isFinite(n))n=0;n=clamp(Math.round(n),min,max);el.value=n;return n}
function calculate(){
  currentSpecies=selected();const level=readNumber("levelInput",1,100);const nature=NATURES[Number($("natureSelect").value)]||NATURES[0];
  const iv=Object.fromEntries(STAT_KEYS.map(k=>[k,readNumber(`iv-${k}`,0,31)]));const ev=Object.fromEntries(STAT_KEYS.map(k=>[k,readNumber(`ev-${k}`,0,252)]));const evTotal=Object.values(ev).reduce((a,b)=>a+b,0);
  $("evTotal").textContent=evTotal;$("evMeterFill").style.width=`${Math.min(100,evTotal/510*100)}%`;$("validation").textContent=evTotal>510?"努力值总和超过 510，请调整培养方案。":"";
  $("speciesName").textContent=currentSpecies.name;$("speciesType").textContent=currentSpecies.type;$("speciesId").textContent=`#${currentSpecies.id}`;$("speciesOrb").textContent=currentSpecies.name.slice(0,1);$("resultLevel").textContent=`LV.${level}`;
  const result={};STAT_KEYS.forEach(k=>{const base=Math.floor((2*currentSpecies.stats[k]+iv[k]+ev[k]/4)*level/100);result[k]=k==="hp"?base+level+10:Math.floor((base+5)*((nature.up===k)?1.1:(nature.down===k)?.9:1));});
  const title=EFFECTS.titles.find(e=>e.id===$("titleSelect").value)||EFFECTS.titles[0];const soulmark=EFFECTS.soulmarks.find(e=>e.id===$("soulmarkSelect").value)||EFFECTS.soulmarks[0];STAT_KEYS.forEach(k=>{result[k]=Math.floor((result[k]+(title.fixed[k]||0)+(soulmark.fixed[k]||0))*(1+(title.rate[k]||0)+(soulmark.rate[k]||0)))});const total=Object.values(result).reduce((a,b)=>a+b,0);$("totalStat").textContent=total;const pct=Math.min(100,total/900*100);$("ringValue").style.strokeDashoffset=107-(107*pct/100);$("ringPercent").textContent=`${Math.round(pct)}%`;
  $("statList").innerHTML=STAT_KEYS.map(k=>{const pct=Math.min(100,result[k]/400*100);const natureMark=nature.up===k?" · 性格提升":nature.down===k?" · 性格降低":"";return `<div class="stat-row"><span class="stat-label">${STAT_LABELS[k]}</span><div class="stat-track"><div class="stat-fill" style="width:${pct}%"></div></div><span class="stat-value">${result[k]}</span><span class="stat-meta">种族值 ${currentSpecies.stats[k]} · IV ${iv[k]} · EV ${ev[k]}${natureMark}</span></div>`}).join("");
}
async function syncData(){
  const btn=$("syncData");btn.disabled=true;btn.textContent="同步中…";
  try{const r=await fetch(`data/species.data?t=${Date.now()}`,{cache:"no-store"});if(!r.ok)throw Error();const payload=await r.json();const remote=payload.species?payload:{version:`seerapi-${new Date().toISOString().slice(0,10)}`,updatedAt:new Date().toISOString().slice(0,10),source:"SeerAPI",sourceUrl:"https://api.seerapi.com/v1/pet",species:(payload.results||[]).map(p=>({id:String(p.id).padStart(4,"0"),name:p.name,type:`属性 #${p.type?.id??""}`,stats:{hp:p.base_stats.hp,attack:p.base_stats.atk,defense:p.base_stats.def,spAttack:p.base_stats.sp_atk,spDefense:p.base_stats.sp_def,speed:p.base_stats.spd},soulmark:p.soulmark||[]}))};if(!Array.isArray(remote.species)||!remote.species.length)throw Error();data=remote;localStorage.setItem("seer-data",JSON.stringify(remote));$("dataStatus").textContent="数据已同步";$("sideDataStatus").textContent="最新数据已同步";$("dataUpdated").textContent=`更新于 ${remote.updatedAt||"最近"} · ${remote.species.length} 个精灵`;renderSelects();calculate()}catch(e){$("dataStatus").textContent="当前为离线数据";$("dataUpdated").textContent="同步失败，已使用内置快照"}finally{btn.disabled=false;btn.textContent="同步数据"}}
function init(){const cached=localStorage.getItem("seer-data");if(cached)try{data=JSON.parse(cached)}catch{}renderSelects();$("dataStatus").textContent=cached?"缓存数据已加载":"本地数据已就绪";$("dataUpdated").textContent=`更新于 ${data.updatedAt} · ${data.species.length} 个精灵`;$("footerVersion").textContent=data.version;calculate();$("syncData").addEventListener("click",syncData);document.querySelectorAll("[data-preset]").forEach(b=>b.addEventListener("click",()=>{const p=b.dataset.preset;STAT_KEYS.forEach(k=>{const el=$(`ev-${k}`);el.value=p==="attack"?(k==="attack"?252:k==="speed"?252:0):p==="speed"?(k==="speed"?252:k==="spAttack"?252:0):0});calculate()}));$("copyLink").addEventListener("click",async()=>{const params=new URLSearchParams({s:$("speciesSelect").value,l:$("levelInput").value,n:$("natureSelect").value});await navigator.clipboard?.writeText(`${location.origin}${location.pathname}?${params}`);$("copyLink").textContent="✓";setTimeout(()=>$("copyLink").textContent="↗",1200)});$("navData").addEventListener("click",()=>$("syncData").click())}
init();
setTimeout(syncData, 0);
