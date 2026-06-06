/* ===================================================================
   นิยามสายพันธุ์ไก่ — แหล่งความจริงเดียว (ใช้ร่วมทุกหน้า)
   -------------------------------------------------------------------
   ★ เพิ่มพันธุ์ใหม่ = เพิ่ม 1 แถวในอาเรย์ BREEDS ด้านล่าง ★
     - match : regex จับจาก "รหัส/ชื่อ" (เช่น SB8-26, ประดู่ดำ (PD), L SM)
               · ตรวจจากบนลงล่าง → วางตัว "เฉพาะเจาะจง" ไว้ก่อนตัวที่กว้างกว่า
               · ใส่ /i เพื่อไม่สนพิมพ์เล็ก-ใหญ่
     - name  : ชื่อไทยที่จะโชว์ (หัวข้อกลุ่ม/ผังเครือญาติ/legend)
     - color : สี hex (หัวการ์ด · เส้น · กราฟ · ทุกที่)
     - emoji : ไอคอน (ใช้ในผังเครือญาติ)
   หน้า CoopModel/FamilyTree เรียกผ่าน window.breedOf(...) เท่านั้น
   =================================================================== */
window.BREEDS = [
  { match:/ประดู|PD/i,            name:'ประดู่หางดำ',      color:'#5b5048', emoji:'🐓' },
  { match:/SPL|ลูกผสม/i,          name:'ลูกผสม SPL',       color:'#e0a458', emoji:'🐥' },
  { match:/SB/i,                  name:'SB8',              color:'#c97b5a', emoji:'🐔' },
  { match:/SF/i,                  name:'Lohmann SF',       color:'#5b9aa0', emoji:'🐔' },
  { match:/SM/i,                  name:'Lohmann SM',       color:'#6f9a8d', emoji:'🐔' },
  { match:/SL/i,                  name:'Lohmann (SL)',     color:'#7a9a5b', emoji:'🐔' },
  { match:/MISSEX|คละ/i,          name:'คละเพศ',           color:'#9aa0a6', emoji:'🐔' },
  { match:/AUS|ออส|\bAS\b|^AS/i,  name:'ออสตาร์ลอป (AUS)', color:'#b0673a', emoji:'🐓' },
  /* ── เพิ่มพันธุ์ใหม่ตรงนี้ เช่น ──
  { match:/RIR/i, name:'โร้ดไอแลนด์', color:'#a23b3b', emoji:'🐔' },
  */
];

// ค่า default (สำรองไว้ถ้าชีทว่าง/ยังไม่ได้ตั้ง)
window.BREEDS_DEFAULT = window.BREEDS.slice();

// คืน {known, name, color, emoji} จากรหัส/ชื่อใดๆ · ไม่รู้จัก → สีเทากลาง
window.breedOf = function(s){
  s = (s==null ? '' : String(s)).trim();
  for(var i=0; i<window.BREEDS.length; i++){
    if(window.BREEDS[i].match.test(s)){
      var b=window.BREEDS[i];
      return { known:true, name:b.name, color:b.color, emoji:b.emoji };
    }
  }
  return { known:false, name:'', color:'#9a9486', emoji:'🐔' };
};

/* ตั้งค่าสายพันธุ์จาก Google Sheet (ชีท "พันธุ์") — เรียกตอนโหลดข้อมูล
   rows = [{key,name,color,emoji}] · key = คำ/รหัสคั่นด้วย , (เช่น "ประดู,PD")
   ถ้าไม่มีข้อมูล → กลับไปใช้ค่า default เดิม (ไม่พัง) */
window.setBreeds = function(rows){
  if(!rows || !rows.length){ window.BREEDS = window.BREEDS_DEFAULT.slice(); return; }
  var esc=function(x){ return x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); };
  var out=[];
  rows.forEach(function(r){
    if(!r) return;
    var keyStr=String(r.key||r.match||r.kw||'').trim();
    var name=String(r.name||'').trim();
    if(!keyStr||!name) return;
    var keys=keyStr.split(/[,|]/).map(function(x){return x.trim();}).filter(Boolean).map(esc);
    if(!keys.length) return;
    out.push({ match:new RegExp(keys.join('|'),'i'), name:name,
      color:(String(r.color||'').trim()||'#9a9486'), emoji:(String(r.emoji||'').trim()||'🐔') });
  });
  window.BREEDS = out.length ? out : window.BREEDS_DEFAULT.slice();
};
