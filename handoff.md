# Handoff — ระบบผสมสายพันธุ์ไก่ (Sunfarm)

เอกสารส่งต่องาน · อัปเดตล่าสุด: 2026-06-02 (เพิ่มแท็บเมทริกซ์ผสม + ผูก Google Sheet)

---

## 1. โปรเจกต์นี้คืออะไร

ระบบจัดการ **การผสมสายพันธุ์ไก่ในฟาร์มทดลอง** โดยอ้างอิงข้อมูลจากไฟล์ Excel `SB Tag (1).xlsx`
มี Flow หลัก: **เล้าไก่ → ไก่ → ไข่ → ตู้ฟัก → ลูกไก่** และมี "แผนทดลอง" เป็นแผนแม่บทกำกับด้านบน

งานที่ทำไปแล้ว = **อ่าน/ตีความข้อมูลจาก Excel** + สร้าง **HTML model แบบโต้ตอบได้** เพื่อให้เห็นภาพรวมทั้งระบบในหน้าเดียว (ยังไม่ได้ทำ backend/ฐานข้อมูลจริง)

---

## 2. ไฟล์ในโฟลเดอร์

| ไฟล์ | คืออะไร | สถานะ |
|------|---------|-------|
| `SB Tag (1).xlsx` | **ไฟล์ต้นฉบับ** — seed ครั้งแรกจากที่นี่ (ปัจจุบันข้อมูลจริงอยู่ใน Google Sheet) · gitignored | ของลูกค้า — ห้ามแก้ |
| `SunFarm_CoopModel.html` | **ตัวหลัก** — HTML model โต้ตอบได้ (เปิดไฟล์เดียวจบ ไม่ต้องมี server) | ✅ ทำแล้ว |
| `handoff.md` | ไฟล์นี้ | — |
| `SunFarm_AppsScript.gs` | **Apps Script** = seed ข้อมูล + เสิร์ฟ JSON (read-only) ให้ HTML ดึงสด | ✅ ทำแล้ว |
| `SETUP_GoogleSheet.md` | คู่มือ deploy Apps Script + ผูก HTML กับ Sheet ทีละขั้น | ✅ ทำแล้ว |
| `SunFarm_Form.html` | **หน้าฟอร์มกรอกข้อมูล** (สำหรับคนทดลอง) → เขียนเข้า Sheet ผ่าน Apps Script | ✅ ทำแล้ว |
| `index.html` | หน้า landing (2 ปุ่ม: ฟอร์ม / ภาพรวม) — GitHub Pages เปิดเป็นหน้าแรก | ✅ ทำแล้ว |
| `README.md` | อธิบายโปรเจกต์สำหรับ repo | ✅ ทำแล้ว |

> โปรเจกต์อยู่ใน **git repo** (branch `main`, โฮสต์ GitHub Pages) · ไฟล์เก่า `SunFarm_Dashboard.html` / `SunFarm_AppsScript_Fixed.gs` ถูกลบออกแล้ว
> ⚠️ `SunFarm_CoopModel.html` เป็น single-file แต่ **ข้อมูล const ถูกถอดออกหมด (ค่าว่าง)** — ดึงสดจาก Sheet API ที่ต้องใส่รหัสก่อน (เปิดไฟล์ตรงๆ จะเจอ gate ขอรหัส · ดูข้อ 8.7)

---

## 3. โครงสร้างข้อมูล / ความสัมพันธ์ (สำคัญที่สุด)

มี **5 ชั้น** เชื่อมกันด้วยรหัส (รหัสพ่อ/แม่/ลูก เป็น key หลัก):

```
ชั้น 0 แผน   →  แผนทดลอง   (พิมพ์เขียว: ออกแบบคู่ผสม + จำนวน family + ตารางฟัก)
ชั้น 1 เล้า   →  ผังเล้าทดลอง, P2   (จัดกรงจริง: พันธุ์ไหนอยู่กรงไหน กี่ผู้กี่เมีย)
ชั้น 2 ไก่    →  Lockbook   (ทะเบียนไก่รายตัว จัดกลุ่มเป็น Family)
ชั้น 3 ไข่    →  ไข่รายวัน   (บันทึกการผสม พ่อ×แม่ + จำนวนไข่รายวัน)
ชั้น 4 ฟัก    →  on hand   (ผลฟัก: ไข่เข้า→ลูกไก่ + KPI %ฟัก/%เชื้อ/%ตายโคม)
```

**รูปแบบรหัส** `SB-26-G8-F01-F-001`:
```
SB   - 26    - G8         - F01      - F        - 001
ไลน์   ปีเกิด   รุ่นพันธุกรรม  Family ที่   เพศ(F/M)   ลำดับตัว
```
- ไลน์: `SB`=SB8, `SM`=Lohmann SM, `SF`=SF, `PD`=ประดู่ดำ, `AS`=AUS(ออสตาร์ลอป), `SPL`=ลูกผสม
- `SB-26-G8` = SB8 44WK · `SB-25-G8` = SB8 69WK · `SM/SF-26-G0` = รุ่น G0
- รหัสแม่แบบ `...-F-001-10` = แม่ตัวที่ 001–010 (กลุ่ม 10 ตัว = 1 family)

**กุญแจเชื่อม:** รหัสพ่อ/แม่/ลูก ใช้ชุดเดียวกันใน Lockbook → ไข่รายวัน → on hand
(เอกสารละเอียดรวมมาที่ไฟล์นี้แล้ว — `Instruction.md` เดิมถูกยุบทิ้ง · ภาพรวมย่อดู `README.md`)

---

## 4. แมป ชีท Excel → แท็บใน HTML

| ชีท Excel | แท็บใน HTML | หมายเหตุ |
|-----------|-------------|----------|
| `แผนทดลอง` | 🗺️ แผนทดลอง (หน้าแรก) | การ์ดต่อสายทดลอง + ปุ่มลิงก์ไปแท็บอื่น |
| `ผังเล้าทดลอง` | 🏠 ผังเล้า | มี sub-toggle: ฝั่งไก่พันธุ์(19กรง) / ฝั่งไก่รุ่น(75กรง) |
| `Lockbook` | 📒 Lockbook | 62 Family · ฟิลเตอร์ตาม section |
| `ไข่รายวัน` | 🥚 ไข่รายวัน | 40 คู่ผสม + กราฟ sparkline |
| `on hand` | 🐤 ตู้ฟัก/ลูกไก่ | 111 รอบฟัก + funnel + KPI |
| (สร้างสดจาก PLAN) | 🔀 เมทริกซ์ผสม | ตารางไขว้ พ่อ×แม่→ลูก · purebred(ทแยง)/crossbred · `renderMatrix()` |
| `P2` | ❌ ยังไม่ทำ | ผังเล้าหลังที่ 2 (SPL ชุด4-9) |
| `อัพเดท`, `แผน Super` | ❌ ยังไม่ดู | ยังไม่ได้ตรวจ |

---

## 5. SunFarm_CoopModel.html — โครงสร้างเทคนิค

**ข้อมูล (โครงสร้าง JS const — ปัจจุบันเริ่มว่าง เติมจาก API ตอนรันไทม์):**
| const | มาจากชีท | โครงสร้าง |
|-------|----------|-----------|
| `BREEDER`, `GROWER` | ผังเล้าทดลอง | `{cages, chunk?, rows:[{name,sub,female:{cages:{n:[จำนวน,"สีhex"]},recTotal},male:{...}}]}` |
| `LOCKBOOK` | Lockbook | `[{s:section, f:familyNo, fc/mc:สีแท็ก, F:[[num,code,band]], M:[...]}]` |
| `EGGS` | ไข่รายวัน | `{dates:[...], rows:[{pa,mo,ch,st,sec,fam,d:[รายวัน]}]}` |
| `ONHAND` | on hand | `{rows:[{set,pull,pa,mo,ch,sec,fam,eggset,wind,crack,rot,fert,chick,dis,cdead,cull,se,sf,dpct,note,note2}]}` |
| `PLAN` | แผนทดลอง | `{rows:[{line,pa,mo,ch,nm,nf,nfam,loc,method,batches:[...]}]}` |

> ⚠️ **ปัจจุบัน const เหล่านี้เริ่มเป็นค่าว่าง** (`let PLAN={rows:[]}`, `let EGGS={dates:[],rows:[]}`, `let LOCKBOOK=[]` ฯลฯ) — `reloadAll()` เติมข้อมูลจาก Sheet API ตอนรันไทม์ (โครงสร้างยังเป็นรูปเดิมตามตารางข้างบน) · ดูข้อ 8.5/8.7

**ฟังก์ชัน render หลัก:** `renderCoop / renderLockbook / renderEggs / renderOnhand / renderPlan / renderMatrix`
**สีกรง = สีพื้นเซลล์จริงจาก Excel** (แมปสี hex → ชื่อพันธุ์ ใน `LEG_BREEDER` / `LEG_GROWER`)

**การเชื่อมข้ามแท็บ (คลิกแล้วกระโดด):**
- Lockbook family → `gotoEgg()` → แท็บไข่รายวัน
- ไข่รายวัน (footer "ดูผลฟัก") → `gotoHatch()` → on hand กรอง family นั้น
- แผนทดลอง (ปุ่ม "ทะเบียน/ผลฟัก") → `gotoLockbookSection()` / `gotoOnhandGroup()`
- map การเชื่อม: `EGG_BY_FAM`, `ONHAND_BY_FAM` (key = `section|familyNo`)

**ฟีเจอร์ UI:**
- ผังเล้าฝั่งไก่รุ่น = **pagination หน้าละ 20 กรง** (ตั้งที่ `GROWER.chunk=20`) ผ่าน `coopGoPage()`
- tooltip กรง (เมาส์ชี้) แสดง พันธุ์/เพศ/วันรับเข้า/อายุ/จำนวน — ข้อมูลใน `META`
- ปุ่มสลับ sub-tab ผังเล้า, ฟิลเตอร์ chip ในแต่ละแท็บ

---

## 6. ธีมสี (CSS variables ใน `:root`)

| ตัวแปร | ค่า | ใช้ที่ |
|--------|-----|--------|
| `--head` | `#15324f` navy | แถบหัวการ์ด (พื้น navy + ตัวอักษรขาว) |
| `--primary` | `#1f8a8a` teal | ปุ่ม/แท็บ/ลิงก์/หัวข้อรอง |
| `--accent` | `#f26b4e` coral | เลขเด่น/กราฟ sparkline/funnel-ไข่มีเชื้อ |
| `--bg`,`--panel` | `#ffffff` ขาว | พื้นหน้า + การ์ด |
| `--panel2`,`--line`,`--ink`,`--muted` | เทากลาง (neutral) | **สำคัญ: ต้องเป็นเทากลาง ไม่ติด cyan** |
| `--female`/`--male`/`--good` | ชมพู/ฟ้า/เขียว | semantic |

> ⚠️ บทเรียน: ตอนแรกใส่ cyan ลงในสีกลาง (panel2/line/ink) ทำให้ทั้งจอดู "ติดฟ้า" — แก้โดยทำสีกลางให้เป็นเทากลางจริง เหลือสีเฉพาะ teal/coral/navy/pink ที่ตั้งใจ
> **สีพันธุ์ (จาก Excel) และสีแท็กไก่ = "สีข้อมูล" ห้ามเปลี่ยน** (อยู่ใน LEG_*, SECCOL, OHCOL, TAGCOL)

---

## 7. ผลตรวจสอบความถูกต้อง (audit แล้ว)

✅ ข้อมูลทุกแท็บ **ตรงกับ Excel** (จำนวนแถว, recTotal, สีกรง, รหัส, สมการ %ฟัก ตรวจผ่านหมด)
✅ การเชื่อมข้ามแท็บ (key `section|family`) ถูกต้อง

⚠️ **ประเด็นค้างจาก Excel ต้นฉบับ (ไม่ใช่บั๊ก) — ควรแจ้งเจ้าของไฟล์:**
1. **Lockbook ข้าม "Family 5"** (เรียง 1,2,3,4,6,7…) แต่ไข่รายวัน/on hand มี F05 → ควรเพิ่ม Family 5 ในทะเบียน
2. **วันที่บางช่องสลับวัน/เดือน** (เช่น ประดู่ดำใหญ่ รับเข้า "2/10/2026" ดูเป็นอนาคต) — น่าจะกรอก d/m สลับ
3. **สีกรง 3 สีในผังเล้าไม่มีในรายการพันธุ์** (ฟ้าอ่อน/ส้ม/เทา) → ทำเครื่องหมาย "ไม่ระบุ" ไว้ รอยืนยัน

---

## 8. วิธีอัปเดตข้อมูล (ถ้า Excel เปลี่ยน)

> **แหล่งข้อมูลสด (runtime) ตอนนี้คือ Google Sheet** (seed ครั้งแรกจาก Excel ผ่าน `seedData()` ใน `.gs`) — การแก้ข้อมูลปกติทำผ่านฟอร์ม/Sheet ไม่ใช่แก้ HTML
> ส่วนด้านล่างนี้ใช้เฉพาะกรณี **re-seed ใหม่จาก Excel** (เช่น Excel เปลี่ยนโครงสร้างใหญ่) — ดึงด้วย Python แล้วเอาไปอัปเดต `seedData()` ใน `SunFarm_AppsScript.gs`:
1. ใช้ `python3 + openpyxl` อ่านชีทที่เปลี่ยน (มี pattern การดึงในประวัติ chat / โค้ดตัวอย่างด้านล่าง)
2. แปลงเป็น JS const (compact JSON) แล้วแทนที่ const เดิมในไฟล์ HTML
3. **สำคัญ:** สีกรงต้องอ่านจาก `cell.fill.fgColor.rgb` (ไม่ใช่แค่ค่าตัวเลข)

```python
import openpyxl
wb = openpyxl.load_workbook('SB Tag (1).xlsx', data_only=True)
ws = wb['ชื่อชีท']
# ดึงค่า: ws.cell(row,col).value ; ดึงสีพื้น: ws.cell(r,c).fill.fgColor.rgb
```

---

## 8.5 เชื่อม Google Sheet (อ่านสด) — ทำแล้ว

มี **โหมดดึงข้อมูลสดจาก Google Sheet** เพิ่มจากโหมดฝัง static (default ยังเป็น static ถ้ายังไม่ตั้งค่า)

- กลไก: `SunFarm_AppsScript.gs` (deploy เป็น Web app) → ส่ง JSON รูปทรงเดียวกับ const เดิมเป๊ะ → HTML ดึงผ่าน **JSONP** (เลี่ยง CORS เปิดไฟล์ตรงๆ ได้)
- เปิดใช้: วาง Web app URL ในตัวแปร `const SHEET_API_URL` (ท้าย `<script>`) · ว่าง = ใช้ข้อมูลฝังในไฟล์
- ฝั่ง HTML: data const เปลี่ยนจาก `const`→`let`, มี `reloadAll(data)` แทนที่ข้อมูล+วาดใหม่ทุกแท็บ, `rebuildEggMap()/rebuildOnhandMap()`, แถบสถานะ+ปุ่ม ↻ รีเฟรช (มุมขวาล่าง, สร้างใน JS ชื่อ `#databar`)
- ฝั่ง Sheet: 12 แท็บ (flat 1 แถว=1 รายการ) · `seedData()` สร้าง+ใส่ข้อมูลตั้งต้นอัตโนมัติ · ทุกช่อง format ข้อความ (กันวันที่เพี้ยน) · `doGet()` อ่านชีท→ประกอบ JSON
- **ตรวจแล้ว:** logic ประกอบกลับให้ผลตรงกับ const เดิมทั้ง 11 ชุด (verify ด้วย Python simulation)
- คู่มือ deploy: `SETUP_GoogleSheet.md`
- ⚠️ กฎแก้ Sheet: ห้ามเปลี่ยนชื่อหัวคอลัมน์/ชื่อแท็บ · `batches` คั่นด้วย ` | ` · `daily` คั่นด้วย `,` (ว่าง=null)

## 8.6 ฟอร์มกรอกข้อมูล + เขียนกลับ (write-back) — ทำแล้ว

`SunFarm_Form.html` = หน้าฟอร์มแยกสำหรับ "คนกรอก" (มือถือได้) · Sheet เป็นฐานหลังบ้าน ไม่ต้องเปิดดู

```
[คนกรอก] SunFarm_Form.html ──เขียน(JSONP GET+action)──► Sheet ──อ่าน──► SunFarm_CoopModel.html [คนดู]
```

- **3 ฟอร์ม:** 🥚 ไข่รายวัน (เลือกวัน→กรอกจำนวนต่อคู่ผสม, ส่งเป็น chunk ละ 15 ผ่าน `eggBatch`) · 🐤 ผลฟัก (`addHatch` คำนวณ se/sf/dpct ให้) · 📋 เพิ่มไก่/Family (`addBird`/`addFamily`)
- **Apps Script เขียนกลับ:** `doGet` แตกตาม `action` → `handleAction_` (มี `LockService` กันชนกัน) · actions: `eggBatch/addHatch/addBird/addFamily/ping`
- `eggBatch` หา row ด้วย `mo` (รหัสแม่ unique) แล้ว set ช่อง daily ตาม index ของวันที่ (เพิ่มวันที่ใหม่ใน `ไข่วันที่` อัตโนมัติ)
- เขียนผ่าน **JSONP GET** (ไม่ใช่ POST) เพื่อเลี่ยง CORS จาก `file://` · payload เล็ก
- ⚠️ **ต้อง redeploy Apps Script (New version)** หลังแก้ `.gs` ถึงจะมี write-back (URL เดิมไม่เปลี่ยน)
- ⚠️ ความปลอดภัย: endpoint เปิด "Anyone" + เขียนได้ = ใครมี URL ก็เขียนได้ (โอเคสำหรับใช้ภายใน) · ถ้าต้องการกันควรเพิ่ม token param

---

## 8.7 ระบบรหัสกันคนนอก + โฮสต์ GitHub Pages — ทำแล้ว

- **รหัสเขียน (WRITE_KEY):** Apps Script ตรวจ `e.parameter.key === WRITE_KEY` ก่อนทุก action เขียน (อ่านไม่ต้องใช้รหัส) · ฟอร์มเก็บรหัสใน `localStorage('sf_key')` ถามครั้งแรกครั้งเดียว ส่งแนบทุกครั้งที่เขียน · รหัสผิด → `needKey` → ฟอร์มล้าง+ถามใหม่
- ⚠️ **WRITE_KEY อยู่ใน `.gs` เท่านั้น (ฝั่ง Google) ห้าม commit รหัสจริง** — ไฟล์ `.gs` ใน repo มีค่า placeholder `"เปลี่ยนรหัสนี้"` · ตั้งรหัสจริงเฉพาะในหน้า Apps Script แล้ว redeploy
- **`index.html`:** หน้าแรก (landing) มี 2 ปุ่ม → ฟอร์ม / ภาพรวม · เป็นไฟล์ที่ GitHub Pages เปิดเป็นหน้าแรก
- **โฮสต์:** GitHub Pages (repo public) · URL = `https://poompittayut.github.io/sunfarm/`

### ล็อกทั้งระบบ (รหัสเดียว ทั้งดู+กรอก) — ทำแล้ว
- `doGet` อ่านข้อมูล (ไม่มี action) ก็ต้องมี `key===WRITE_KEY` ด้วย (ping ยังเปิด)
- **ถอด embedded data ออกจาก `SunFarm_CoopModel.html` ทั้งหมด** (PLAN/BREEDER/GROWER/LOCKBOOK/EGGS/ONHAND/LEG_*/META/TAGCOL/SECCOL/BREEDER_TBL/GROWER_TBL = ว่าง) เพราะไฟล์อยู่บน repo public → ข้อมูลมาจาก API (มีรหัส) เท่านั้น
- CoopModel มี **gate overlay** (`#gate`) บังหน้าจนใส่รหัสถูก · ส่ง `key` ทุกครั้งที่โหลด · `needKey` → ล้างรหัส+ขอใหม่
- Form `boot()` ส่ง key ด้วย · รหัสผิด → ปุ่มลองใหม่
- ⚠️ แก้ `doGet` แล้ว **ต้อง redeploy** ถึงจะ enforce read-lock

---

## 9. Next steps (ยังไม่ได้ทำ)

- [ ] แท็บ/หน้า `P2` (ผังเล้าหลังที่ 2 — SPL ชุด 4-9, ประดู่ดำ ชุด 3)
- [ ] ดูชีท `อัพเดท` และ `แผน Super`
- [ ] (ถ้าต้องการ DB จริงแทน Google Sheet) ทำ backend — โครงสร้างตารางอ้างอิงตาม Data Model ข้อ 3 ของไฟล์นี้ (เล้า→ฝั่ง→แถว→กรง→ช่อง / Family / cross / hatch)
- [ ] ยืนยัน 3 ประเด็นค้างในข้อ 7 กับเจ้าของไฟล์

---

## 10. ข้อควรระวังเวลาแก้ HTML

- เป็น single-file — แก้ CSS ใน `<style>`, JS ใน `<script>` ท้ายไฟล์
- หลังแก้ JS ทุกครั้ง **เช็ค bracket/backtick สมดุล** (node ไม่มีในเครื่อง ใช้ python นับ `(){}[]` + backtick คู่)
- ข้อมูล const เป็น single-line JSON ยาว — แก้ผ่านสคริปต์ python แทนการพิมพ์มือ
- ทุก render ใช้ `innerHTML` + event delegation — เพิ่ม element ใหม่ต้องผูก handler ที่ container
