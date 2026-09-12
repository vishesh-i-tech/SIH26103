# PAIMANA AI (SIH26103) — Hackathon Demo Video Script & Recording Guide
**Target Duration:** ~2.5 to 3 minutes  
**Language:** Natural Hinglish (Hindi + English)  
**Format:** Screen Recording + Voiceover  

---

## 🛠️ Quick Recording Setup Guide (Windows)

### Recommended Tool 1: Windows Game Bar (Built-in, Zero Install)
- **Start / Stop Recording Shortcut:** `Win + Alt + R`
- **Toggle Microphone On/Off:** `Win + Alt + M`
- **Open Game Bar Overlay:** `Win + G`
- **Where videos are saved:** `C:\Users\<YourUsername>\Videos\Captures` (MP4 format, 1080p).
- *Tip:* Make sure the browser window (running `http://localhost:5173`) is active before pressing `Win + Alt + R`.

### Recommended Tool 2: OBS Studio or Loom (Alternative)
- **Loom:** Great for simultaneous webcam bubble + screen.
- **OBS Studio:** Set source to *Window Capture* -> select Chrome/Edge window.

### Pre-Flight Checklist Before Recording:
1. **Frontend running:** `npm run dev` (`http://localhost:5173`).
2. **Backend running:** `python ml/server.py` (`http://localhost:8000`).
3. **Browser setup:** Press `F11` (or keep clean bookmark bar), browser zoom at `100%` or `110%`.
4. **Logged in:** Logged in as MoSPI Admin (`admin@mospi.gov.in` / demo session) so you start directly on `/dashboard`.

---

## 🎬 Section-by-Section Screenplay & Hinglish Script

```
TIMELINE OVERVIEW:
0:00 - 0:25 | Section 1: Intro — MoSPI Problem Statement & PAIMANA AI Vision
0:25 - 0:55 | Section 2: Dashboard — Live ML Risk Scoring & KPI Overview
0:55 - 1:35 | Section 3: High-Risk Deep Dive (NH-4471) — Genuine SHAP Attribution
1:35 - 2:05 | Section 4: Low-Risk Project (RW-8802) — Protective Factors Mode
2:05 - 2:40 | Section 5: What-If Simulator — Live Counterfactual Interventions
2:40 - 3:00 | Section 6: Closing & Data Calibration Transparency
```

---

### ⏱️ SECTION 1: Intro & Problem Statement (0:00 – 0:25)
**Visual Action:**
- Screen is on **MoSPI Dashboard** (`http://localhost:5173/dashboard`).
- Mouse hovers briefly over the **PAIMANA AI** header and the KPI summary cards at the top (*Total Monitored Projects: 10*, *High Risk: 4*, *Critical Bottlenecks*).

**Spoken Hinglish Narration:**
> "Namaste! Yeh hai **PAIMANA AI** — Smart India Hackathon problem statement 26103 ke liye hamara AI-driven Project Risk Monitoring and Intervention Platform.
> 
> MoSPI ke under pure desh mein hazaron crore ke mega infrastructure projects chalte hain — Highways, Railways, Bridges, aur Power grids. Lekin ground reality yeh hai ki most projects time and cost overrun face karte hain, kyunki traditional monitoring reactive hoti hai.
> 
> PAIMANA AI ground-level telemetry aur financial audits ko integrate karke **predictive risk intelligence** provide karta hai, taaki delay hone se *pehle* proactive interventions liye ja sakein."

---

### ⏱️ SECTION 2: Main Dashboard & Live ML Risk Scores (0:25 – 0:55)
**Visual Action:**
- Scroll down smoothly through the **Projects Table** on the Dashboard.
- Point cursor to the **ML Risk Score** badges (Red `95`, Orange `61`, Green `18`).
- Show the sector filter tabs (*Roads, Bridges, Railways, Power*) and click once on *Roads*, then back to *All*.
- Highlight the **Priority Queue** preview card or click to `/priority-queue` briefly, then return to `/dashboard`.

**Spoken Hinglish Narration:**
> "Yeh hamara centralized **Executive Dashboard** hai. Yahan har central sector project ka live execution status, sanctioned cost, aur physical progress mapped hai.
> 
> Notice kijiye yeh **ML Risk Scores**. Yeh koi static color code ya manual rating nahi hai. Hamara trained XGBoost Model har project ke ground telemetry signals — jaise payment delay days, subcontractor depth, land disputes, aur billing mismatches — ko analyze karke real-time risk compute karta hai.
> 
> Red score indicate karta hai critical intervention priority, jabki green projects scheduled buffer ke andar perfectly on-track hain."

---

### ⏱️ SECTION 3: High-Risk Project Deep Dive & SHAP Attribution (0:55 – 1:35)
**Visual Action:**
- Click directly on project **`NH-4471`** (*Indore–Betul Highway Widening Package 2*).
- URL changes to `/projects/NH-4471`.
- Scroll to the **Risk Breakdown / SHAP Factors** panel showing the top risk drivers with percentage weights.
- Point cursor at the top factor: *Disproportionate expenditure burn outpacing verified physical progress* (or *Expenditure outpacing physical work*).
- Point at the **Prescriptive Recommendation** box.
- Scroll down slightly to show **Daily Telemetry Logs** and **Running Account Billing Entries** (highlighting the flagged bill).

**Spoken Hinglish Narration:**
> "Ab dekhte hain ek high-risk project: **NH-4471**. Iska risk score hai **95 out of 100**.
> 
> Ab sabse important feature: **Genuine Explainability**. Kisi bhi black-box AI model par government authorities blind trust nahi kar sakti. Isliye humne implement kiya hai **SHAP TreeExplainer**.
> 
> Yahan aap exact mathematically reconciled attribution dekh sakte hain. Model explain kar raha hai ki score 95 kyun pahuncha:
> Pehla major driver hai **Billing Progress Mismatch** — yaani physical progress sirf 47% hui hai jabki financial disbursement 68% claim ho chuki hai.
> Dusra driver hai **Right-of-Way Land Disputes** at chainage kilometer 44.
> 
> Aur sirf problem batana kaafi nahi hai — platform niche automated **Policy Recommendation** deta hai under Clause 14.2: Running Account bills par temporary freeze lagao aur joint measurement physical cross-section audit mandate karo."

---

### ⏱️ SECTION 4: Low-Risk Project & Dual-Mode Attribution (1:35 – 2:05)
**Visual Action:**
- Click the **Back to Projects** link or click **Projects** in the sidebar.
- Click on low-risk project **`RW-8802`** (*Bhopal–Itarsi Rail Doubling Section B*).
- URL changes to `/projects/RW-8802`.
- Highlight the **Green Risk Score: 18**.
- Point to the factors list: notice the label **Protective / Stabilizing Factors**.
- Show the positive factors: *Prompt ministry payment disbursements*, *100% encumbrance-free right-of-way*, *Disciplined billing alignment*.

**Spoken Hinglish Narration:**
> "Ab dekhte hain ek well-performing project: **RW-8802**, Railway doubling package. Iska risk score hai sirf **18**.
> 
> Yahan hamara explainability engine dynamically switch hota hai **Protective Mode** mein. 
> 
> Base expected risk 64 points se niche isliye gaya kyunki yahan 4 key stabilizing factors hain: prompt contractor payments, single-tier direct EPC management, zero design revisions, aur 100% clear land acquisition. 
> 
> Yeh dual-mode capability decision-makers ko clear benchmarking deti hai ki kaun se best practices doosre corridors mein replicate karne hain."

---

### ⏱️ SECTION 5: The What-If Intervention Simulator (2:05 – 2:40)
**Visual Action:**
- In the sidebar, click on **What-If Simulator** (`/simulator`).
- In the Project dropdown, select **`NH-4471`** (or leave it if pre-selected).
- Point to the **Baseline Risk Score: 95**.
- In the controls form on the left:
  - Change **Payment Delay (Days)**: from `78` to `15`.
  - Change **Land Clearance Status**: from `Disputed` to `Clear`.
  - Change **Billing Progress Mismatch (%)**: from `14.5` (or current) to `2.0`.
- Click the blue **Run Simulation** button.
- Watch the right-hand panel animate:
  - Simulated Score drops (e.g. from `95` down to `60` or `55`).
  - Delta badge turns green: `Score Reduced by X pts (Improved)`.
  - New SHAP factor distribution updates live.

**Spoken Hinglish Narration:**
> "Yeh hai PAIMANA AI ka sabse powerful decision-support tool — **What-If Intervention Simulator**.
> 
> Ek Project Director ya Ministry Secretary action lene se pehle counterfactual scenario test kar sakte hain. Hum select karte hain wahi high-risk highway project: **NH-4471**. Baseline risk hai **95**.
> 
> Ab hum simulate karte hain policy interventions:
> Agar hum payment delay ko 78 days se kam karke **15 days** kar dein, land dispute ko resolve karke **Clear** mark kar dein, aur billing discrepancy audit karke **2%** par align kar dein...
> 
> Click on **Run Simulation**!
> 
> Dekhiye — real XGBoost model aur SHAP ne bina kisi hardcoded rule ke recalculate kiya, aur projected risk drop ho kar direct **manageable watch zone** mein aa gaya! Isse administration accurately quantify kar sakti hai ki kis intervention par maximum return-on-effort milega."

---

### ⏱️ SECTION 6: Closing & Data Calibration Transparency (2:40 – 3:00)
**Visual Action:**
- Navigate back to **Dashboard** (`/dashboard`).
- Point mouse to the bottom footer / MoSPI badge.
- Bring cursor to rest at center screen showing the complete, responsive interface.

**Spoken Hinglish Narration:**
> "Technical transparency ke baare mein ek zaruri baat: kyunki actual MoSPI row-level infrastructure data classified and access-restricted hota hai, hamara Model B MoSPI ke published quarterly aggregate statistics par rigorously calibrated synthetic dataset par train kiya gaya hai. Iska complete architecture aur feature engineering pipeline humne transparently **model_card.md** mein document kiya hai.
> 
> PAIMANA AI bridges the gap between ground telemetry, financial auditing, and actionable machine learning. 
> 
> Dhanyawad! Jai Hind."

---

## 💡 Quick Tips for the Recording:
1. **Speak naturally:** Don't rush; pause for 1 second whenever clicking a button so the viewer can see the screen transition.
2. **Resolution:** 1920x1080 at 30fps or 60fps is ideal.
3. **Cursor:** Keep mouse movements smooth and intentional.
4. **Volume:** Keep the microphone about 6 inches away to prevent pop sounds.
