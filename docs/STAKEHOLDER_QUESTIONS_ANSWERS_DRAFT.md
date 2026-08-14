# PerishNet — Stakeholder Question Bank: Answer Draft

> **Status.** This file is a **draft** intended to be merged into
> `docs/STAKEHOLDER_QUESTIONS.md`, replacing the bare question list with the
> Q-and-A format. The original question text is preserved verbatim; each
> question is followed by a candid PerishNet answer.
>
> **Tone rules used here.** Startup-realistic, not marketing. Where the
> team has not yet made a decision, the answer says so plainly. Where
> concrete tech choices exist (Next.js App Router on Vercel, React +
> Recharts for primary viz, Apache ECharts lazy-loaded for heavy viz,
> Turborepo monorepo with `/apps/web` and friends), they are named.

---

## 1. Farmers / Producers

## Q1. Every farmer is not educated — how will they actually use your application easily? Will it work on a ₹5,000 phone with 2G?

**Answer:** We have not built the farmer UI yet. Our current prototype targets the web dashboard for retailers/NGOs (Next.js on Vercel) and assumes a modern browser. A low-end Android client with voice-first flows in local languages is on the roadmap, but for the MVP we are honest: we have not yet proved the ₹5,000 / 2G path. Open question for the team — likely a separate React Native or even a USSD/SMS gateway (Q171).

---

## Q2. My village has zero internet for 6 hours a day. What happens to the listing I posted during that window?

**Answer:** We have not decided on offline-first sync yet. Likely answer: a queued local store on the device that retries when connectivity returns, with optimistic UI showing "posted — pending sync." Concretely that means CRDTs or a simple last-write-wins timestamp column, but we have not picked. For the MVP we assume the listing is created online; the offline story is a Q198 decision.

---

## Q3. I don't read English — does the app support my local language, and is the voice input actually usable or a gimmick?

**Answer:** For the MVP, English-only on the web app. We know this excludes the majority of our intended farmer users. Voice input in local languages is a roadmap item, not a current feature — and we are candid that "voice" is the easy part; usable ASR/NLU on Indian languages in a 2G setting is genuinely hard. Open question.

---

## Q4. Why would I list my surplus on your app instead of just throwing it on the side of the road or feeding my cattle? What is in it for me *concretely* — rupees in hand, not "impact points"?

**Answer:** Honest answer: we have not yet validated the farmer value prop empirically. The hypothesis is cash-in-hand via same-day UPI payment at time of pickup (not Net-30/60), plus a secondary market they don't currently have access to. We have not yet proven this is true — that is exactly what a pilot (Q226) is for. "Impact points" without cash is not a plan, it is a wish.

---

## Q5. I am a small farmer with 10 kg of surplus tomatoes today. Will your system even bother with me, or will it only serve industrial-scale suppliers?

**Answer:** Today, the system does not have a per-listing minimum enforced, but economically 10 kg is below the threshold where pickup logistics are viable. We will need a collective-pooling model (Q13, Q83) to make this work — pooling 10 farmers into a shared pickup window. We have not built that yet. For the MVP pilot we will probably focus on cluster-level aggregation, not individual smallholders.

---

## Q6. Who pays for the packaging, the weighing, the photo? You want a beautiful listing, but my time costs money.

**Answer:** We have not decided. The realistic answer is that the farmer should not be paying for any of this. Packaging cost should be borne by the buyer or the platform, weighing should be done at the warehouse/hub, and photos are aspirational for v1. Listing must be <60 seconds end-to-end. This is a design constraint we are holding ourselves to but have not yet hit.

---

## Q7. I list at 9 AM. A truck arrives at 11 AM. Who guarantees pickup? What if the buyer cancels at the last minute — does the food just rot on my farm?

**Answer:** No one guarantees pickup in the MVP. We treat this as a known risk to be mitigated through: (a) buyer commitment (escrow or pre-auth), (b) fallback matchmaking within a tight time window, (c) explicit time-decay UX that shows the farmer how much shelf life is left. There is no safety net today. If a buyer cancels, the food likely rots — this is a real gap.

---

## Q8. I have been cheated before by middlemen. What stops *your* middleman from cheating me?

**Answer:** The platform is the middleman in a sense, and the honest answer is: we have not yet built the trust infrastructure (verified weighing at pickup, UPI-on-confirmation, transparent ledger). That is the design intent — but it is not yet enforced. We acknowledge that trust is earned over time, not claimed in a pitch deck.

---

## Q9. If the price you offer me is lower than the mandi price, why would I ever use this?

**Answer:** Then you shouldn't. The platform only makes sense when (a) the produce is surplus and would otherwise be discarded, or (b) the platform price beats the mandi price for the buyer's effective logistics cost. We will not try to compete with healthy mandi pricing — that is a losing game. The wedge is rescue-of-surplus, not replacement-of-mandi.

---

## Q10. How do I know the "warehouse" that picks up my produce will actually pay me — and on what timeline? Net-30? Net-60?

**Answer:** We have not decided. The startup-realistic answer is same-day UPI on confirmed weight at pickup. Anything longer is exploitative for a small farmer. Until we can enforce that settlement guarantee, we cannot honestly market "fast payment."

---

## Q11. Will my data — farm location, yield patterns, income — be sold to buyers or commodity traders?

**Answer:** No, we will not sell individual farm data. Aggregated, anonymized, opt-in data products (e.g., regional yield trends) are on the table as a future revenue line, but only with explicit farmer consent and never at the row level. This is a policy commitment, not yet a legal artifact — open question (Q96, Q98).

---

## Q12. What if I am not formally registered as a farmer? Will I still be able to participate, or will KYC lock me out?

**Answer:** Formal KYC (PAN/Aadhaar) is a likely requirement for receiving payments via UPI, but we are aware this excludes the most marginal users. We have not designed the unbanked / undocumented path (Q175). This is a real gap, not a solved problem.

---

## Q13. My produce is perishable. The app's matching algorithm says "no buyer in your region today." So what? The food is gone. Is there a fallback?

**Answer:** Today: nothing. The food is gone. A real fallback requires partnerships with composting facilities, biogas plants, and animal-feed aggregators — which we do not have. This is one of the highest-leverage missing pieces (Q126). It is a roadmap gap, not a feature toggle.

---

## Q14. Do you support collective selling — me + 9 neighboring farmers pooling a truckload? Or only individual listings?

**Answer:** The data model should support a "co-op listing" but we have not implemented it. For the MVP pilot we will manually orchestrate pooling via a community lead / FPO partner. Native co-op UI is a Q15-related feature.

---

## Q15. What happens during harvest glut weeks when *every* farmer has surplus and your platform is flooded?

**Answer:** The matching engine degrades gracefully (longer match latency, lower fill rate), but realistically supply exceeds demand and either (a) prices fall, (b) some supply is unsalvageable. We have not built the surplus-handling pipeline (Q126) and we acknowledge that gluts are precisely when the platform is most exposed.

---

## 2. Retailers / Supermarkets

## Q16. We already donate to a few local NGOs informally. Why should we route that through your platform — what do we gain besides a logo on a dashboard?

**Answer:** Concrete gains we plan to offer: (a) audit-grade receipts for tax deductions (Q18), (b) automated matching that reaches NGOs they don't currently have a relationship with, (c) consolidated ESG reporting across stores. The "logo on a dashboard" is not enough — we know that.

---

## Q17. Our loss-prevention / shrinkage accounting is internal. Will your system integrate with our existing ERP, or are you asking our staff to enter data twice?

**Answer:** For the MVP, double-entry is likely. Real integration requires ERP connectors (SAP, Oracle, custom) and is a phase-2 build. We are honest that this is a real ask, and most retailers will not adopt at scale without it. Open question — no current plan to build SAP connectors in v1.

---

## Q18. "Rescue credits" sound nice, but our CFO cares about tax deductions. Will your receipts be audit-grade for tax authorities?

**Answer:** The intent is yes — receipts will include donor/recipient identifiers, weight, timestamp, photos, signatures. Whether a given tax authority (IRS 501(c)(3), India 80G, etc.) accepts them depends on jurisdiction. We have not engaged tax counsel yet (Q217). "Audit-grade" is a strong claim we cannot make without legal sign-off.

---

## Q19. If a food-poisoning incident is traced back to a donation routed through your platform, where does liability sit — with us, with you, or with the food bank?

**Answer:** This is unsettled and we are candid about it. Likely answer (subject to legal review, Q218): the donor carries primary liability for the product at time of donation, the platform facilitates the chain-of-custody record, the NGO/recipient handles post-handoff. We are not yet insured to the level that lets us take liability onto ourselves (Q68). This is a known gap, not a settled policy.

---

## Q20. What is the SLA on your dashboard? If it is down during our month-end reporting, who compensates the labor cost of our staff?

**Answer:** We have not published an SLA. On Vercel, target availability is 99.9% region-level, but we are not offering financial SLAs to enterprise customers. We acknowledge this is a blocker for some retailers and is a Q207/Q215 question.

---

## Q21. We are a 1,200-store chain. Can your system actually handle that volume without us hiring a dedicated integration team?

**Answer:** Honestly: not yet. The MVP is built for tens of stores, not 1,200. Scale-out to 1,200 stores requires (a) API integrations (Q17), (b) multi-tenant isolation, (c) role-based access for store managers vs regional managers, (d) bulk onboarding tools. None of that exists today. This is a Q211/Q215 conversation.

---

## Q22. How do you prevent our store managers from gaming the donation numbers to inflate their "ESG metrics"?

**Answer:** Cross-store audits, photo evidence at pickup/dropoff, weight verification at warehouse, anomaly detection on listing-vs-receipt deltas. We have not built any of this. The honest answer is: today, the platform can be gamed. Hardening is a Q176–Q185 trust problem.

---

## Q23. Will our branded CSR reports claim your impact numbers as ours? Can we license the underlying data?

**Answer:** License terms are not yet drafted. The default plan is to allow retailers to cite PerishNet-attributed impact in their own reports with appropriate "in partnership with" attribution. Exclusive license to underlying data is a commercial conversation we are open to but have not productized.

---

## Q24. Our private-label products are in the surplus. Can we mark items as "do not donate" — for IP or brand-protection reasons?

**Answer:** Yes — item-level "do not donate" flags are a basic feature requirement and are easy to add. We have not yet built the donor-side item management UI, but it is on the spec.

---

## Q25. Why would we discount-sell near-expiry items on your marketplace instead of just dumping them to the same middlemen we already use?

**Answer:** Because we offer (a) better brand-safety story than anonymous middlemen, (b) a direct NGO channel that the retailer can publicly claim, (c) potentially better unit economics on small lots. We have not validated this with data; it is a hypothesis. The "dumping to middlemen" workflow is the incumbent we have to beat, and we do not yet have evidence we do.

---

## 3. Warehouses / Cold Storage

## Q26. Cold storage is expensive. Every hour of dwell time costs me. How does your platform guarantee throughput — minimum pickup within X hours?

**Answer:** We do not guarantee throughput. The system surfaces dwell time as a metric, surfaces inbound/outbound SLAs to partners, and uses pricing signals to incentivize fast turnaround — but the actual guarantee is contractually between warehouse and the partner on the other side. We are honest that "guarantee throughput" is a claim we cannot make as a marketplace.

---

## Q27. What is your surge-pricing model during festival weeks when cold-chain capacity is tight?

**Answer:** We have not designed a surge-pricing model. Likely direction: dynamic storage fees and pickup prioritization, but this is product-design speculation, not a committed feature. Open question.

---

## Q28. If a load arrives damaged or spoiled at my warehouse, who pays — the transporter, the seller, or PerishNet?

**Answer:** Default: the transporter, by carrier liability terms. We do not yet have an arbitration process or a platform insurance pool. This is a Q68/Q224 policy gap.

---

## Q29. Do you provide insurance for the inventory while it sits in my warehouse? At what cost?

**Answer:** No, we do not provide inventory insurance today. The warehouse operator is responsible for their own stock insurance. We may offer a marketplace for partner insurance products in the future but we have not built it.

---

## Q30. My warehouse handles B2B pallets, not small-parcel donations. Will your matching logic send me mismatched loads?

**Answer:** The matching engine will eventually filter by warehouse capabilities (pallet-only, ambient-only, frozen-capable, etc.) but in v1 this is a manual configuration by ops. Expect mismatched loads to happen early on.

---

## Q31. How do you handle quarantine / rejection of incoming food? Do you have a digital QC workflow, or is it still WhatsApp + paper?

**Answer:** WhatsApp + paper today. A digital QC workflow with photo evidence, decision audit trail, and disposition routing (donate / compost / reject) is a roadmap item and not yet built.

---

## Q32. What is your integration with my Warehouse Management System (WMS)? API? EDI? SFTP? Manual?

**Answer:** Manual for the MVP. API integration is the obvious next step; EDI/SFTP are out of scope for a long time. We are honest that warehouse operators will not adopt at scale without a real WMS hook.

---

## Q33. I am at 90% capacity. Will your system warn me *before* matching new loads to me?

**Answer:** Yes, that is a basic feature: capacity thresholds per warehouse, surfaced in the matching engine and the operator dashboard. We have not built the operator-facing dashboard yet (Q20) but the data model supports it.

---

## Q34. Power cuts kill my cold chain. Do you have offline buffering / temperature-logger integrations?

**Answer:** No. We do not have IoT temperature logger integration today, and we do not have an offline-buffering story for the warehouse. The MVP assumes the warehouse's own monitoring handles this. This is a Q116/Q121 gap.

---

## Q35. Who owns the data on my throughput, dwell time, and rejection rates?

**Answer:** The warehouse owns it. The platform can use aggregated, anonymized data for product improvement, and we will be explicit about this in the partner agreement (which we have not yet drafted). We will not sell individual warehouse data to third parties.

---

## 4. Food Banks / NGOs

## Q36. Our staff are volunteers. Will they actually log into yet another dashboard, or will they ignore it after week two?

**Answer:** They probably will, unless the dashboard is near-zero-friction. Realistic mitigation: WhatsApp-first interactions (listing notifications, accept/reject buttons), with a web dashboard as a secondary surface. We have not built the WhatsApp integration yet, but it is on the roadmap.

---

## Q37. We already have trusted donor relationships. What does PerishNet add that we cannot do with a phone call?

**Answer:** Marginal new donors, especially corporate/retail ones the NGO doesn't have a relationship with; logistics cost sharing (potentially); consolidated impact reporting for their funders. We have not validated that this is worth the friction of a new platform.

---

## Q38. When you route a donation to us, do you subsidize our distribution costs — or are we absorbing that?

**Answer:** Today, the NGO absorbs last-mile. We do not have a subsidy mechanism. The startup-realistic hope is that donor-side transport covers some of this, but we have no committed subsidy. Open question.

---

## Q39. If the food is unfit for human consumption, where does it go — animal feed, composting, landfill? Do you have that pipeline?

**Answer:** We do not have that pipeline. The honest answer is that today, unfit food likely goes to landfill. Building a composting/animal-feed channel is a real Q13/Q126 gap and would meaningfully improve our impact story.

---

## Q40. We serve specific communities (religious, dietary, refugee). Can your matching respect those constraints, or is it just "nearest NGO wins"?

**Answer:** It is "nearest NGO wins" in v1, and we know that is wrong for many real cases. Constraint-aware matching (halal-only, vegan-only, refugee-ID-required) is on the spec but not built. Open question.

---

## Q41. Our capacity fluctuates — 50 meals/day on weekdays, 500 on weekends. How does your system handle that?

**Answer:** Per-NGO capacity profiles, with daily/weekly capacity windows, are part of the data model. The matching engine is not yet using them well; expect over- and under-allocation in the MVP.

---

## Q42. What is your reporting format? Our funders (UN, corporate CSR) want audit trails and beneficiary counts.

**Answer:** PDF/CSV export is a must-have and is on the immediate roadmap. Beneficiary counts (downstream of the NGO) are out of our control unless the NGO logs them — we will surface an "outcome logging" UI but cannot guarantee quality.

---

## Q43. Do you charge us anything — platform fee, listing fee, success fee?

**Answer:** We have not decided. The directional answer is that NGOs are not charged in the near term; the revenue model is donor- or retailer-side. This is a Q106 question and we are open to revising.

---

## Q44. Will PerishNet divert corporate donations *away* from us by offering the corporation a "better dashboard"?

**Answer:** This is a real risk we are honest about. The mitigation is to position the platform as additive (we route to the existing NGO partner), not as a replacement intermediary. The contract and the product both need to be designed with that promise. Open governance question.

---

## Q45. We have strict eligibility / KYC for our beneficiaries. Can your app surface that eligibility check, or will recipients self-declare?

**Answer:** The platform does not do recipient KYC today; the NGO does. We can surface an eligibility-check workflow (with NGO-defined rules) but we have not built it. Recipients self-declaring without a verification step is not acceptable for most funders — this is a Q169-adjacent design problem.

---

## 5. Drivers / Field Ops

## Q46. Will the app give me turn-by-turn navigation that actually works in low-signal areas, or am I back to Google Maps + calling the recipient?

**Answer:** Today: Google Maps + calling. We are not building our own navigation engine. The realistic path is offline tile caching (Mapbox supports this, Google to a degree) and a pre-downloaded route book. We have not implemented either.

---

## Q47. What happens if a recipient is not home when I arrive? Do I have to sit and wait, or is there a clear handoff protocol?

**Answer:** There is a documented handoff protocol in our heads: attempted call, second-tier recipient (neighbor shelter), return to warehouse. We have not built it into the driver app. Today, drivers improvise.

---

## Q48. I am paid per delivery, not per hour. Will your route optimization actually reduce my deadhead miles, or just shuffle them?

**Answer:** We have not built route optimization. The current routing is "nearest recipient" with no batch optimization. Real route optimization is a Q86/Q87 problem and requires map APIs we have not yet wired up.

---

## Q49. How do you handle vehicle breakdowns — is there a roadside-assist hotline, or am I stranded with rotting produce?

**Answer:** Today, the driver is on their own. We do not have a roadside-assist program. This is a real safety and food-loss risk; open question.

---

## Q50. Will I be considered an employee, a contractor, or a gig worker? What are the tax / insurance implications for me?

**Answer:** We have not decided. Likely direction: independent contractor (gig worker) for the MVP, with the platform acting as a marketplace, not an employer. This classification has significant tax and labor-law implications in every market we operate in (Q219, Q221). We will not make this decision lightly.

---

## Q51. What is the working-hour cap? Will the app keep pushing deliveries past safe fatigue limits?

**Answer:** The MVP has no working-hour cap. This is a known safety and regulatory risk. We will need a per-driver hour-tracker, with hard and soft limits. Not built.

---

## Q52. If I deliver damaged goods, who pays — me, the warehouse, the transporter company?

**Answer:** Default: me, the driver, unless the warehouse signed off on a damaged handover. We have not formalized a chain-of-custody proof flow (photo + signature) that would actually adjudicate this. Open question.

---

## Q53. Will the app work offline for 8+ hours when I am in rural areas?

**Answer:** No. The current web app assumes connectivity. Offline-first mobile is a Q198 problem and is not in the MVP. We acknowledge this excludes rural drivers.

---

## Q54. Is there a real human dispatcher I can call, or just a chatbot?

**Answer:** Today, a small ops team is the dispatcher. As we scale this will not be sustainable. We have not decided between a chatbot-first or human-first path. The honest answer is "depends on what we can afford to staff."

---

## Q55. What safety protections do I have when entering unfamiliar neighborhoods at night?

**Answer:** None today. We do not currently have a safety-check-in flow, an emergency-button, or a partner relationship with a safety service. This is a real gap and a Q268-adjacent risk.

---

## 6. End Recipients (Families, Shelters)

## Q56. Will the app tell me what I am actually receiving — nutritional info, allergens, ingredients — or just "mixed vegetables"?

**Answer:** Today: just "mixed vegetables." Detailed nutritional/allergen metadata requires either (a) upstream data from the donor with barcodes/ingredients, or (b) computer-vision inference at warehouse intake. Both are not in the MVP. We are honest that this is a real gap for vulnerable users (e.g., allergies).

---

## Q57. I have dietary restrictions (vegan, halal, kosher, gluten-free, diabetic). Will the system respect those, or am I filtering manually?

**Answer:** The system will not respect them in v1. Recipient-side preference profiles and donor-side tagging are on the spec, not the roadmap this quarter. Until then, recipients filter manually or NGOs screen on their behalf.

---

## Q58. If the food makes my family sick, who is accountable, and what is the dispute process?

**Answer:** The donor is the primary accountable party, by general food-safety law, and the platform facilitates chain-of-custody evidence. The dispute process is not defined. This is a Q66/Q68 gap and a real liability exposure for the platform.

---

## Q59. Why should I trust a stranger handing me food? Is there a rating system, traceability, or recall mechanism?

**Answer:** We have not built a rating system, traceability chain (beyond basic pickup/dropoff), or recall mechanism. The platform today is "trust the NGO and the platform brand." That is not enough and we know it. Q69, Q176–Q185.

---

## Q60. Will I be asked to "pay" with my personal data — name, address, income, family size — to access the food?

**Answer:** The minimum viable data we ask for is name and contact info to confirm pickup eligibility. We do not ask for income, family size, Aadhaar/PAN, or other sensitive attributes for the MVP. That is a policy commitment; we have not yet drafted a formal data minimization policy (Q96, Q98).

---

## Q61. If the app shows me "no food available today," what is my fallback? Do I have any visibility into *when* it might arrive?

**Answer:** Today: no fallback in the app. The recipient relies on the NGO's broader network (other channels, partner shelters). We do not yet surface a forecast or a "next expected pickup" hint. This is a real UX gap.

---

## Q62. Will I be profiled / scored for "deservingness"? Will missing a pickup hurt my future access?

**Answer:** No, and we will not implement this. Missing a pickup because of weather, work, or family emergency should not penalize access. This is a policy commitment, not yet a written rule. It is also a Q193 ethical question.

---

## Q63. Is there a dignity-preserving pickup experience, or will I queue publicly in a way that stigmatizes me?

**Answer:** We do not yet have a pickup-location design. Our default plan is to use NGO-run distribution centers (existing, dignified spaces) rather than building our own pickup points that could be stigmatizing. This is a design principle, not a built feature.

---

## Q64. Will the app work on my phone — which is older, smaller, and lower-end than the designer's test device?

**Answer:** The web app on a modern phone: yes. The web app on a 5-year-old Android with a 4" screen and limited RAM: probably painful. A native low-end mobile app is a Q171/Q199 problem. We have not yet tested on low-end devices.

---

## Q65. What languages is the recipient UI available in?

**Answer:** English only today. Localized UIs are a Q3-adjacent problem and we have not built them. Open question.

---

## 7. Trust, Safety & Liability

## Q66. If someone dies from food routed through PerishNet, who goes to jail? You, the donor, the transporter, the NGO?

**Answer:** Default legal answer: the donor (the entity that placed the food into commerce) bears primary product-liability exposure. The platform is not the manufacturer, distributor, or seller in the legal sense. We are not yet at a place where we can absorb any portion of that liability ourselves, because we are not insured for it (Q68). This is a real, scary, unanswered question and we are candid that we do not have a satisfying answer.

---

## Q67. What is your food-safety audit process before a new warehouse goes live on the platform?

**Answer:** We do not have a formal audit. Today, an ops person visits and decides. The real answer is a checklist (FSSAI license, temperature logs, pest control, last-inspection date) which we have not formalized. Q67 is a process gap.

---

## Q68. Do you carry product-liability insurance? Up to what limit? Per incident or aggregate?

**Answer:** We do not currently carry product-liability insurance at a meaningful level. We acknowledge that this is a serious gap and is a precondition to scale. Open question and a pre-pilot hiring question (we need to engage a broker).

---

## Q69. What is your recall protocol — when contamination is suspected, how fast can you contact every downstream recipient?

**Answer:** We do not have a recall protocol. The contact mechanism today would be NGO-side phone trees and possibly SMS to recipients if we have their numbers. We do not have a real-time notification pipeline. This is a Q267 worst-case planning item.

---

## Q70. Are donations legally "gifts" (no warranty implied) or "sales" (full warranty)? This single classification changes everything.

**Answer:** The platform's intent is to treat donations as gifts (with a Good Samaritan food-donation act framework, where applicable). But we have not engaged counsel in every market to confirm this. In some jurisdictions (notably the US under the Bill Emerson Act), this is settled; in others, it is grey. Q218 open question.

---

## Q71. What is your indemnification clause for retailers vs NGOs vs drivers?

**Answer:** We have not drafted partner agreements. The directional answer is that each party indemnifies for their own sphere (donor for product, NGO for downstream distribution, driver for transit). We acknowledge this is currently aspirational.

---

## Q72. Do you have a 24/7 incident hotline?

**Answer:** No. We do not have a 24/7 incident hotline. This is a real gap and is a prerequisite for any serious food-safety posture.

---

## Q73. Will you publish post-incident reports, or are they buried under NDAs?

**Answer:** We intend to publish anonymized post-incident reports. This is a policy commitment, not a practice yet because we have not had an incident to publish.

---

## Q74. What is your policy on counterfeiting — fake "rescue" listings designed to game ESG metrics?

**Answer:** Detection (cross-checking listings vs photos vs warehouse receipts vs delivery confirmations) is the right framework. We have not built it. Counterfeit listings are a real risk on any ESG-adjacent platform. Q176–Q185 territory.

---

## Q75. If a corporate donor wants to publicize a donation, can you guarantee the exact kg count and timeline, or is it "roughly X"?

**Answer:** We can offer the exact count from the warehouse's confirmed-receipt record (assuming a working chain-of-custody). Without that record, we can only offer "as listed." This is a Q222 data-integrity question.

---

## 8. Food Quality, Safety & Regulation

## Q76. FSSAI / FDA / EFSA regulations differ across regions. How do you stay compliant in every jurisdiction you operate in?

**Answer:** We are not currently operational in any jurisdiction. As we enter one, we will need local food-safety counsel. The plan is to start narrow (one country, one regulator) and only expand after we have a working compliance posture there. Q218.

---

## Q77. What is the cold-chain integrity guarantee — temperature log every X minutes from pickup to delivery?

**Answer:** We do not have a cold-chain telemetry system. We assume the transporter's own monitoring handles it. The Q116/Q121 question is whether we ever instrument it ourselves; the answer is "not in MVP."

---

## Q78. How do you handle mixed loads where some items require -18°C and others require +4°C?

**Answer:** We do not handle them in MVP. Multi-temp loads require multi-compartment vehicles and a more sophisticated routing engine. We are honest that this is a future capability, not a current one.

---

## Q79. What is your shelf-life estimation algorithm based on — visual inspection, sensor data, or just the printed date?

**Answer:** Just the printed date in MVP. CV-based shelf-life estimation is research-grade for us. We are not building a CV pipeline for this in the near term.

---

## Q80. If a date label is missing or damaged, what is the fallback decision rule — accept, reject, or quarantine?

**Answer:** We have not codified this. The reasonable default is "quarantine — warehouse inspects and decides." Without a formal SOP, the rule will be applied inconsistently.

---

## Q81. Will you ever handle raw meat, dairy, or infant formula — and if so, what extra safeguards exist?

**Answer:** Out of scope for MVP. These categories are higher-risk and require additional safeguards (cold-chain, expiry enforcement, allergen control). We will not enter these categories without a clear Q67/Q68 compliance posture.

---

## Q82. How do you handle allergen cross-contamination in shared transport?

**Answer:** We do not. The MVP does not have allergen-aware transport. Recipients with severe allergies should not rely on this platform for v1.

---

## Q83. Will regulators audit your platform — and are you prepared to hand over matching / routing data on demand?

**Answer:** We anticipate that any food-safety regulator in our operating jurisdiction can request data, and we will comply. We have not built a regulator-facing export tool, but a data export to S3/CSV is straightforward and on the spec.

---

## Q84. Do you support "best before" vs "use by" distinction — and does your matching logic treat them differently?

**Answer:** We plan to support this distinction in the data model. "Use by" is hard-stop; "best before" allows some discretion. We have not yet built the matching logic that treats them differently, but the data model is the easy part.

---

## Q85. What is your HACCP / GMP documentation policy for partner warehouses?

**Answer:** Partner warehouses must have their own HACCP/GMP certifications (we require them at onboarding). The platform does not produce HACCP docs. This is a partner-side requirement, not a platform artifact.

---

## 9. Logistics, Routing & Operations

## Q86. If demand is concentrated in one region and all middlemen send produce there, low-demand regions starve. How do you prevent this imbalance?

**Answer:** We have not solved this. The mechanism would be a balanced-allocation scoring function in the matching engine, but that is product-design work, not a current feature. Q127, Q128.

---

## Q87. Will your routing engine optimize for *fairness* (every NGO gets something) or for *efficiency* (cheapest mile)? What if those conflict?

**Answer:** We have not decided. Most marketplaces optimize for efficiency by default; fairness is a more interesting design problem. Open question and a Q215 product/ethics call.

---

## Q88. What happens during festivals / disasters when normal routes break?

**Answer:** We do not have a disaster playbook. The realistic answer is that supply chains degrade during disasters and our platform degrades with them. We are not building a war-room for v1.

---

## Q89. If a truck breaks down mid-route, what is your failover — second vehicle, alternate warehouse, food bank rerouting?

**Answer:** We have not built failover. Today, the driver improvises (call dispatcher, who is an ops person). This is a Q49-adjacent gap.

---

## Q90. How do you handle the "last mile" in dense urban areas where parking / loading is impossible?

**Answer:** We do not have a last-mile strategy. Likely direction: cargo bikes / EVs for dense urban cores, but that is a partnership-and-capex question we have not solved.

---

## Q91. Will you operate your own fleet, or always rely on third-party logistics?

**Answer:** Third-party for MVP. We will not own trucks. Whether we ever do is a Q113/Q255 strategic question, not a near-term decision.

---

## Q92. What is the carbon accounting for your routes — is your "sustainability" claim verified, or marketing?

**Answer:** Unverified today. Real carbon accounting (per-route kg CO₂e) is a real future feature but is not in the MVP. Any "sustainability" claim we make publicly is currently directional, not audited.

---

## Q93. How do you batch small deliveries into truckloads efficiently without making anyone wait 3 days?

**Answer:** We do not have a batching engine. The simple answer is "match within the same hour if possible; otherwise, no batch." This will underperform in low-density regions and is a Q142 problem.

---

## Q94. What happens when the algorithm cannot find a match within X km / Y hours?

**Answer:** Today, the listing times out. The farmer/retailer is notified (eventually) and presumably tries another channel. We have not yet built a graceful degradation to composting/animal feed (Q13, Q126).

---

## Q95. Will you integrate with Google Maps, Mapbox, or HERE — and what happens if the API costs spike?

**Answer:** We will likely integrate with Mapbox for cost reasons. If API costs spike, we degrade (cached tiles, lower-frequency updates). We have not picked the vendor yet.

---

## 10. Data, Privacy & Security

## Q96. What personal data do you collect — from farmers, retailers, NGOs, recipients, drivers?

**Answer:** Minimum viable: name, phone, location (city-level for now), and role-specific data (farm size, store ID, NGO capacity, vehicle plate). We do not collect Aadhaar/PAN/SSN in MVP. A formal data inventory and DPIA have not been done — open question.

---

## Q97. GDPR / India DPDP / California CCPA — which regimes apply, and how do you comply?

**Answer:** Whichever jurisdictions we operate in will dictate which regime applies. Today, we have not formally mapped our data flows to GDPR/DPDP/CCPA. Compliance work (data-subject access requests, deletion workflows, consent capture) is on the roadmap, not in the MVP.

---

## Q98. Will you sell aggregated data to commodity traders, hedge funds, or retailers?

**Answer:** We will not sell individually-identifying data. Aggregated, anonymized, opt-in data products (e.g., regional yield trends) are a possible future revenue line but require explicit user consent. This is a policy commitment; we have not yet operationalized the opt-in.

---

## Q99. If we get breached, what is your notification SLA — to users, to regulators, to the public?

**Answer:** We have not published an SLA. Legal minimums (72 hours under GDPR, similar under DPDP/CCPA) will be honored. Beyond that, we have not committed to a specific timeline.

---

## Q100. Do you anonymize beneficiary data, or will donors see exactly which "poor family" got their food?

**Answer:** Default plan: donors see aggregate recipient counts (number of families, region), not individual identifying data. The exception is if the recipient themselves consents to being identified. We have not built the consent flow yet.

---

## Q101. Who has access to real-time location data of drivers?

**Answer:** Authorized ops staff, for live dispatch purposes. We will not share real-time driver locations with third parties. Driver-side privacy controls (turn off location when off-duty) are not yet built.

---

## Q102. Will you ever share data with law enforcement without a warrant?

**Answer:** No, we will not voluntarily share data without a valid legal process. This is a Q224 governance commitment and a Q225 policy item.

---

## Q103. Are you SOC 2 / ISO 27001 certified — or planning to be?

**Answer:** Not certified today. SOC 2 Type II is a reasonable 12–18 month goal once we have an enterprise-customer pull. ISO 27001 is a longer-horizon item. Neither is a Q215 concern at MVP.

---

## Q104. Do you encrypt data at rest and in transit? With what key management?

**Answer:** Vercel + managed Postgres gives us TLS in transit and encryption at rest by default. We do not have a separate KMS. This is a Q215 hardening question for later.

---

## Q105. If a recipient dies or moves, what is your data-retention / deletion policy?

**Answer:** We have not drafted one. The default plan is to retain data for the life of the user account, plus a reasonable archival period, and to honor deletion requests on demand. We have not built the self-serve deletion flow.

---

## 11. Unit Economics & Business Model

## Q106. How do you actually make money — transaction fee, SaaS, government contract, advertising, data?

**Answer:** We have not decided. The directional options are: (a) a small platform fee on each rescued kg, (b) SaaS subscription for retailers/warehouses, (c) government/CSR grants during early scale, (d) opt-in aggregated data products. We will probably start with (c) and (b). This is a Q247 board-level question.

---

## Q107. What is the average transaction value, and is it large enough to support the operational cost of rescue?

**Answer:** We have not measured. The directional answer is that rescued kg is a low-margin business at small scale; the unit economics only work at meaningful volume with operational leverage. This is a known uncertainty.

---

## Q108. Who pays for the last-mile delivery — donor, recipient, NGO, or you?

**Answer:** We do not pay. In practice it is split: the donor may pay for the trunk-leg transport, the NGO covers last-mile, and the recipient does not pay. We have not designed a clean model.

---

## Q109. What is your CAC (customer acquisition cost) per retailer, per NGO, per farmer?

**Answer:** We do not have measured CACs. For the MVP, all acquisition is founder-led, so CAC is "founder time" — not a real number.

---

## Q110. What is your gross margin per rescued kg?

**Answer:** We do not know. We have not yet run a single paid rescue. The Q215 answer to the stress test (Q1) is "we cannot answer this honestly yet."

---

## Q111. What is the payback period for onboarding a new warehouse?

**Answer:** We have not measured. The answer depends on how we monetize (Q106) and how much volume the warehouse attracts. Open question.

---

## Q112. Will you ever take a margin on the food itself, effectively becoming a middleman?

**Answer:** No, that would put us in conflict with the rescue mission. We will charge for the platform service, not for the food itself. This is a policy commitment; we have not yet written the partner agreement to lock it in.

---

## Q113. How do you sustain the platform during a 6-month zero-revenue pilot?

**Answer:** Founder time + grants + small CSR contracts + runway from personal savings. We do not have a 6-month zero-revenue plan; we need at least a small revenue line (or grant) to keep the lights on. Q247.

---

## Q114. What happens to unit economics when diesel prices double?

**Answer:** Logistics cost goes up, our platform fee stays flat, gross margin compresses. We have not modeled the sensitivity. Likely mitigation: dynamic pricing on transport.

---

## Q115. Are you a nonprofit, a B-Corp, or a for-profit — and why does the structure choice matter?

**Answer:** We have not incorporated yet. The directional answer: a public-benefit / B-Corp-equivalent structure lets us raise impact-aligned capital while protecting the mission. Pure nonprofit constrains capital; pure for-profit invites mission drift. Q216, Q255.

---

## 12. Cold-Chain & Infrastructure Reality

## Q116. In regions with 8-hour daily power cuts, your "cold-chain guarantee" is fiction. What do you actually do?

**Answer:** We agree. The MVP does not make a cold-chain guarantee. We will not market one until we have instrumented, monitored cold-chain (Q121) and a verified partner network. Today, we route to warehouses that have their own backup power; we do not own the cold chain.

---

## Q117. Refrigerated trucks cost 5x normal trucks. Who funds them?

**Answer:** We do not. The transporter or the donor does. We do not have a capex plan for reefer trucks in the foreseeable future.

---

## Q118. What is your fallback when cold-chain breaks — is the food considered safe for shorter durations?

**Answer:** We do not make safety calls. The warehouse's QA process decides. The platform's role is to surface the temperature-log evidence (when we have it, Q77), not to make a determination.

---

## Q119. Will you operate your own cold storage, or always rely on partners?

**Answer:** Always partners. Capex-heavy cold storage is not on the roadmap.

---

## Q120. In monsoon / flood / heatwave conditions, how does your routing adapt?

**Answer:** It does not, today. Real adaptation (e.g., shortening time windows in heatwaves) is a Q159 product question we have not solved.

---

## Q121. Will you invest in IoT temperature loggers, or assume trust?

**Answer:** Assume trust for the MVP. IoT loggers are a real future feature but not in v1. Q77, Q116.

---

## Q122. What is your SLA for cold-chain failure detection and response?

**Answer:** We have no SLA. We do not detect cold-chain failures today. This is a real gap.

---

## Q123. Do you support passive cooling (evaporative, phase-change materials) for off-grid areas?

**Answer:** Not in software. If a partner uses passive cooling, we are happy to route to them; we do not provide the technology.

---

## Q124. Will your system work for ambient-stable food (grains, pulses) the same way as chilled produce?

**Answer:** Yes — and arguably the MVP should focus on ambient-stable food first, where cold-chain is not a concern. We have not formally prioritized this, but it is a good design constraint.

---

## Q125. How do you handle multi-modal transport — reefer trucks, last-mile EVs, cargo bikes, drones?

**Answer:** We do not handle this in v1. The transport mode is whatever the partner uses. Multi-modal optimization is a long-term feature.

---

## 13. Demand / Supply Imbalance

## Q126. If a region has 10x more supply than demand, what is the fallback — composting, biogas, animal feed? Do you have that pipeline or just a "matching" engine?

**Answer:** We do not have that pipeline. This is one of the most important real-world gaps in the platform. Building or partnering into a composting/biogas channel is a Q13/Q15 follow-on that would significantly improve our impact story. We have not started.

---

## Q127. If demand is concentrated in one city and supply is rural, will your logistics cost eat all the margin?

**Answer:** Likely yes, in the worst case. We have not modeled this. The mitigation is hub-and-spoke: aggregate at a regional hub, then trunk-leg to the city. We have not designed the hub network.

---

## Q128. Will you subsidize transport to low-demand regions to maintain fairness, or starve them?

**Answer:** We have not decided. The honest answer is that without a subsidy mechanism, low-demand regions will be starved. The choice between fairness and efficiency is a Q87 product/ethics call.

---

## Q129. How do you balance perishable urgency against equitable distribution?

**Answer:** We have not built this. A good answer is "perishability wins for items past 50% shelf-life, equitable distribution is the tiebreaker for fresher items" — but that is design intent, not implemented behavior.

---

## Q130. During harvest glut, prices crash — does your matching still work, or do farmers stop listing?

**Answer:** Farmers will stop listing if the price is below their alternative. The platform only works for surplus at zero or near-zero expected price. We have not designed the dynamic-pricing model.

---

## Q131. During demand spikes (Ramadan, Diwali, refugee influx), can you surge capacity in <24 hours?

**Answer:** No. We do not have surge capacity. Our partner network is fixed; we cannot add warehouses or transporters on demand. This is a real limitation.

---

## Q132. Will you ever artificially constrain supply to keep prices up?

**Answer:** No. That is anti-mission and would also invite regulatory scrutiny. Policy commitment.

---

## Q133. What is your mechanism for predicting demand 7 days out?

**Answer:** We have not built one. Even a simple "this NGO accepts ~X kg on a weekday" is not implemented. Q215 open question.

---

## Q134. Will you let recipients "subscribe" to recurring pickups, or only ad-hoc?

**Answer:** Ad-hoc only in MVP. Recurring subscription is a Q215 product item.

---

## Q135. How do you avoid creating a parallel gray market that undercuts formal supply chains?

**Answer:** We do not actively police this. The risk is real: cheap rescued food can undercut small retailers in the same area. The mitigation is to direct rescued food to NGOs serving the most food-insecure, not to retail channels. We have not enforced this in the matching logic.

---

## 14. Network Effects & Chicken-and-Egg

## Q136. Why would a farmer list produce before there are any buyers visible on the platform?

**Answer:** They wouldn't, in a pure cold-start. The realistic answer is that we have to seed the buyer side first (a few committed NGOs, or a single anchor retailer, Q144), and only then start farmer outreach. Q142 is the concrete plan.

---

## Q137. Why would a retailer onboard before there is a single NGO on the other end?

**Answer:** For ESG optics and tax-deduction potential (Q18), a retailer might onboard with a "charity-of-the-month" default. That is the wedge. We have not yet signed an anchor retailer.

---

## Q138. Why would an NGO onboard before there is any food flowing?

**Answer:** We need to seed at least one anchor NGO per geography. Likely via direct relationship (founder outreach) or a partnership with an established federation (Feeding India, Feeding America — Q231).

---

## Q139. How do you solve the cold-start problem in a new region?

**Answer:** The answer is "anchor partner + subsidized transactions + manual ops in the first 90 days." We have not piloted this yet. Q140, Q142.

---

## Q140. What is your single-region launch strategy — one city, one district, one farm cluster?

**Answer:** We have not committed. The directional answer is "one district with a tight radius (≤50 km), one anchor NGO, one anchor warehouse, and a cluster of farmers in walking distance." District-level is more realistic than city-level for a pilot.

---

## Q141. Will you subsidize early transactions to seed liquidity?

**Answer:** Likely yes, in some form (zero platform fee for the first N rescues, or a transport subsidy). The exact mechanism and cap are not yet designed.

---

## Q142. How do you onboard the first 50 farmers, 10 retailers, 5 NGOs, 3 warehouses — concretely, week by week?

**Answer:** We have not written a week-by-week plan. This is exactly the kind of GTM plan that should exist before the next funding round (Q247). It is on the Q226/Q233 list.

---

## Q143. What is the minimum viable density (per sq km) before matching works?

**Answer:** We have not measured. The directional answer is "at least one warehouse and three NGOs within a 30-km radius, with at least 5–10 listings per day." Below that, matching is too sparse to be useful.

---

## Q144. Do you anchor on a single dominant partner (e.g., one big retailer's CSR program), or build balanced?

**Answer:** Anchor-on-one for cold-start, then diversify. The risk of over-anchoring is captured in Q269 (key partner leaves). The plan is to use the anchor to seed, then layer in 2–3 more partners before pilot graduation.

---

## Q145. How long until network effects kick in — 3 months, 12 months, 36 months?

**Answer:** We do not know. The honest answer is that network effects in food rescue are slow because trust has to be built locally; 12–24 months is a more realistic estimate than 3. This is a Q215 stress-test gap.

---

## 15. Competition & Defensibility

## Q146. Why would a retailer not just build this internally — it is "just" a logistics app?

**Answer:** Because (a) the cross-retailer pooling of supply and demand is hard to do internally, and (b) the impact-narrative value requires a third-party ledger. The honest counter is that a sufficiently motivated retailer could build this, and we need to move faster than them. Q152.

---

## Q147. What stops an Amazon / Flipkart / BigBasket from launching this as a free CSR add-on?

**Answer:** Nothing, structurally. Our defense has to be speed, community, and data — a "category leader" position before they enter. Q149, Q155.

---

## Q148. What stops an existing food bank (Feeding America, Feeding India) from building their own tech?

**Answer:** They can and probably should. Our position is "we are the infrastructure they use, not a competitor" — i.e., partnership-first (Q231). Whether they accept that framing is an open question.

---

## Q149. What is your defensible moat — data, network, brand, regulation, patents?

**Answer:** Today, none of these. The most likely moat is network density and brand trust, built over time. Data is a slow-build moat. Regulation is unlikely to be a moat in food rescue (low barriers to entry). Patents are not a real moat in software. Open question.

---

## Q150. If a competitor raises $50M, what is your response?

**Answer:** We do not have a $50M-competitor response plan. The likely answer is "we focus on density in our pilot region and out-execute on community trust" — but we have not stress-tested this.

---

## Q151. Will you partner with incumbents or compete head-on?

**Answer:** Partner with incumbents (Q231, Q148). The platform is more useful as a layer above existing food banks than as a replacement.

---

## Q152. What is your "kill shot" — the feature that, once shipped, makes switching too painful?

**Answer:** We do not have one. Possible candidates: (a) cross-region liquidity, (b) real-time ESG ledger, (c) cold-chain telemetry. None are built. Q149.

---

## Q153. Why won't an open-source clone replicate you in 6 months?

**Answer:** The software is the easy part; the network (NGOs, warehouses, retailers) is the hard part. An open-source clone can be deployed, but it cannot seed the network. This is a weak but real moat.

---

## Q154. Will commodity traders / hedge funds acquire and shut you down?

**Answer:** Possibly, if we become threatening to their information advantage. This is a Q275 existential question. We have not designed around it.

---

## Q155. Are you the category leader, or one of many similar efforts that will consolidate?

**Answer:** Aspirationally, the category leader. Realistically, we are one of several. Q145, Q215.

---

## 16. Geopolitics, Seasonality & Climate

## Q156. Cross-border food rescue (India ↔ Bangladesh, US ↔ Mexico) — what customs / phytosanitary rules apply?

**Answer:** Cross-border food rescue is out of scope for the MVP. The customs and phytosanitary complexity is high and the directional answer is "no, not in v1." Q76.

---

## Q157. How does your model survive currency volatility for cross-border donations?

**Answer:** We do not do cross-border in v1. The answer would be "settle in a stable currency or use crypto rails" — speculative, not a current plan.

---

## Q158. Climate change is shifting harvest seasons. Does your model adapt, or assume historical patterns?

**Answer:** The MVP assumes historical patterns. Adaptive harvest forecasting is a Q133 follow-on. We acknowledge that climate volatility is a real risk to the platform's basic assumptions.

---

## Q159. Heatwaves will shorten shelf life — does your algorithm dynamically tighten time windows?

**Answer:** No, not today. A "weather-aware matching engine" is a real future feature, not a current one.

---

## Q160. Will floods / cyclones / wildfires disrupt your logistics, and what is the disaster-recovery plan?

**Answer:** Yes, they will, and we do not have a disaster-recovery plan beyond "partners handle it." Q88, Q213.

---

## Q161. Will war / sanctions / trade wars affect your supply chain?

**Answer:** Yes, indirectly (fuel costs, supply chain disruption). We have not modeled these scenarios. Q88.

---

## Q162. Will you operate in regions with weak rule of law — and how do you protect staff?

**Answer:** Not in MVP. If we do, we will need local security advice and possibly insurance for staff. Open question.

---

## Q163. Do you support indigenous / traditional food systems, or push industrial monoculture?

**Answer:** The platform is supply-agnostic — whatever is offered is what is routed. We do not push monoculture. We acknowledge that food-rescue narratives can inadvertently reinforce industrial-supply chains; we have not designed around this.

---

## Q164. Will you operate in regions where food is politically weaponized (e.g., blockades)?

**Answer:** Not in MVP. Operating in such regions requires political risk analysis that is out of scope.

---

## Q165. How do you handle religious / cultural food rules during multi-faith distribution (Ramadan, Lent, Navratri)?

**Answer:** Q40 covers this at a matching-logic level. Beyond that, the directional answer is to defer to NGO partners who know their communities; the platform surfaces preferences but does not enforce them.

---

## 17. Accessibility, Inclusion & Digital Divide

## Q166. What percentage of your target users (farmers, recipients) own a smartphone — and what is your plan for the rest?

**Answer:** The majority of our target users in low-income segments do not own a smartphone or own a low-end one. The plan for the rest is "use a community champion (NGO staff, FPO lead) as the proxy user" — but we have not built the proxy-user flow explicitly.

---

## Q167. Is your app usable by people with low literacy — icon-based, voice-based, or text-heavy?

**Answer:** The MVP is text-heavy. Icon-based and voice-based redesign is a Q3 follow-on. We acknowledge this is exclusionary in MVP.

---

## Q168. Is your app accessible for users with disabilities (visual, hearing, motor)?

**Answer:** The web app follows standard a11y patterns (semantic HTML, focus management) but has not been audited for WCAG conformance. This is on the Q215 hardening list.

---

## Q169. Will you ever require biometric authentication that excludes refugees / stateless people?

**Answer:** No, we will not require biometrics. The default auth is phone-number OTP. We acknowledge that even phone-based auth excludes the most marginalized (Q175).

---

## Q170. Do you support offline-first usage, or only online?

**Answer:** Only online in v1. Offline-first is a Q198 item.

---

## Q171. Will you support USSD / SMS interfaces for feature phones?

**Answer:** Not in v1. We know this excludes a meaningful slice of users. Open question for a later phase.

---

## Q172. What is your data-cost optimization — does the app run on 2G?

**Answer:** We have not tested on 2G. The web app is heavier than what 2G can comfortably handle. A native low-end app is a Q199 problem.

---

## Q173. Will you provide shared devices (kiosks) in villages / shelters?

**Answer:** Not as a platform. The community-champion model (Q166) effectively serves the same function.

---

## Q174. How do you onboard elderly recipients who are not tech-savvy?

**Answer:** Via the NGO. The recipient's primary interaction is with the NGO's distribution channel, not our app directly. The app is mostly for the NGO side; recipient-side is light.

---

## Q175. Will you ever require a bank account / digital payment that excludes unbanked users?

**Answer:** For farmer payouts, UPI is the default and we know it excludes some users. NGO-side payouts are flexible. We have not designed a fully cash-out path.

---

## 18. Trust, Fraud & Gaming

## Q176. How do you prevent fake "rescue" photos — AI-generated images of food that never existed?

**Answer:** Cross-check photo with warehouse receipt weight, transporter signature, and recipient confirmation. We have not built any of these checks. This is a real exposure.

---

## Q177. How do you prevent weight fraud (listing 100 kg but delivering 60 kg)?

**Answer:** Verified weighing at the warehouse, with photo of the scale. We have not built a digital scale integration; today, weights are typed in by humans.

---

## Q178. How do you prevent donation-laundering (food sold to restaurants, claimed as donated)?

**Answer:** Chain-of-custody receipts with explicit "donation" classification, signed by both donor and recipient. We have not built the enforcement layer; we have not built the audit function.

---

## Q179. How do you prevent duplicate counting — same food "rescued" 3 times across 3 reports?

**Answer:** Unique IDs per rescue event, propagated through every downstream report. The data model supports this; the reporting layer is what needs to honor it. We have not built the consolidated report yet.

---

## Q180. Will you use blockchain for traceability, or is that theater-without-substance?

**Answer:** No blockchain. The traceability chain does not need decentralization at our scale. A signed JSON ledger per rescue is sufficient. Q180 is honestly "we considered it, rejected it."

---

## Q181. How do you prevent recipients from selling donated food on the black market?

**Answer:** We do not have a technical mechanism. The deterrent is contractual (recipient NGOs agree to in-kind distribution) and social (NGO partners enforce norms). A technical solution is unrealistic.

---

## Q182. How do you prevent drivers from "losing" food and claiming delivery?

**Answer:** Photo + signature at handoff, GPS breadcrumbs. We have not built the driver-app handoff flow. Q52.

---

## Q183. How do you prevent NGOs from claiming food they never received?

**Answer:** Recipient-side signature + photo on delivery, plus anomaly detection on NGO claim rates vs peer benchmarks. We have not built the anomaly detection.

---

## Q184. Will you use random audits, third-party verification, or trust entirely?

**Answer:** Trust + spot audits for the MVP. Third-party verification is a Q215 cost we cannot yet afford. Random audits will be done by our own ops team.

---

## Q185. What is your whistleblower / fraud-reporting channel?

**Answer:** A simple email address (fraud@perishnet.example, to be set up). We have not built a real whistleblower flow with anonymity guarantees. This is a Q215 governance gap.

---

## 19. Adoption, Behavior Change & UX

## Q186. Why would a busy store manager open your app at 8 PM to list surplus — what is the friction-zero path?

**Answer:** The hypothetical friction-zero path is: pre-configured store → "list today's surplus" button → confirm weight from a pre-paired scale → done. We have not built any of this. Today, a listing takes 2–5 minutes. Q6.

---

## Q187. Why would a farmer wake up early to use your app vs. sleeping in?

**Answer:** They won't, unless there is concrete cash-in-hand (Q4). Behavior change is downstream of value capture, not the other way around.

---

## Q188. What is your onboarding curve — 5 minutes, 5 days, 5 weeks?

**Answer:** For a retailer/NGO on the web app: target 5 minutes. For a farmer via the proxy-user model: target 5 days (including training the FPO lead). We have not measured this in practice.

---

## Q189. Do you gamify (badges, leaderboards) — and does that help or backfire with farmers who hate being patronized?

**Answer:** No gamification in v1. We are aware that patronizing gamification is a real risk with farmer users. The directional answer is "no badges, no leaderboards, just transparent kg and rupees." Open question.

---

## Q190. Will you run behavior-change campaigns (push notifications, WhatsApp) — and at what frequency is it harassment?

**Answer:** WhatsApp is likely our main outreach channel. We have not yet calibrated frequency. The principle is "respectful, value-bearing, opt-out-able" but it is a principle, not a built feature.

---

## Q191. How do you keep the app sticky after the novelty wears off?

**Answer:** By being where the value happens — a store manager opens it because there is surplus to list, not because of a habit loop. The stickiness comes from operational necessity, not engagement tricks.

---

## Q192. What is your retention curve — Day 1, Day 7, Day 30?

**Answer:** We have not measured. This is a Q215 instrumentation gap. Without analytics, we cannot answer.

---

## Q193. Will you A/B test on vulnerable populations (recipients, small farmers), and is that ethical?

**Answer:** No A/B testing on recipients in v1. For small farmers, internal-only experiments (no behavioral manipulation) are acceptable. This is a policy commitment, not yet a written rule.

---

## Q194. How do you handle the "cold-start UX" when a region has zero inventory?

**Answer:** An empty state is a real product problem we have not yet designed for. Likely direction: a "no rescues yet — here's how to get started" landing screen with one-tap onboarding.

---

## Q195. Will you support community-led onboarding (a local champion model), or only top-down rollout?

**Answer:** Community-led. The local-champion (FPO lead, NGO coordinator) is the primary onboarding vector. Top-down ministry deals are a separate track.

---

## 20. Technical / Engineering Reality

## Q196. What is your stack, and why is it appropriate for the load profile?

**Answer:** Next.js (App Router) on Vercel for the web app; React + Recharts for primary data viz; Apache ECharts lazy-loaded for heavy viz (sankey, geo, network); Turborepo monorepo with `/apps/web` and future `/apps/api`, `/packages/ui`, etc. The fit: Vercel gives us fast deploys and global edge for the read path; Turborepo gives us a clean monorepo as we split out packages. This is appropriate for an MVP at low-to-mid scale; the Q215 question is when to introduce a separate API tier.

---

## Q197. How do you handle intermittent connectivity between the field and your servers?

**Answer:** Today: not well. The web app assumes connectivity. The Q198 offline-first work is the answer. We have not built a sync layer.

---

## Q198. What is your offline-first sync architecture — CRDTs, last-write-wins, custom?

**Answer:** We have not decided. The directional answer is "operation-specific": listings can be last-write-wins with a server timestamp; QC and chain-of-custody events need stronger guarantees (probably CRDTs or append-only logs). This is a design decision deferred to when we have a real mobile client.

---

## Q199. How do you keep the mobile app size <30 MB for low-end devices?

**Answer:** We do not have a mobile app yet. When we build one, the constraint is real (Q166, Q172) and will drive choices like a thin native shell with server-rendered content, lazy-loaded bundles, and minimal on-device state.

---

## Q200. What is your CI/CD pipeline, and how fast can you ship a fix?

**Answer:** Vercel-managed deploys on push to main, with preview deploys per PR. A hotfix can ship in minutes. We do not yet have a full staging-environment story; preview-deploys per PR serve that role. Q200 is honestly a strength today.

---

## Q201. What is your observability stack — logs, metrics, traces?

**Answer:** Vercel logs + a managed Postgres + a basic error-reporting tool. We do not have a full APM (Datadog / Honeycomb) yet. This is a Q215 hardening item.

---

## Q202. What is your incident response time — MTTD, MTTR?

**Answer:** We do not measure. The realistic answer is "founder is on call, MTTR is hours, not minutes." This is fine for an MVP and unacceptable at scale.

---

## Q203. Will you open-source any components, or keep everything proprietary?

**Answer:** Selective open-source. Things like the data model, the matching algorithm, and the impact-reporting schema are candidates; the user-facing brand and the operational layer are proprietary. We have not committed.

---

## Q204. How do you handle schema migrations across mobile clients already in the wild?

**Answer:** We do not have a mobile client. The web app is server-rendered, so migrations are server-side only. The mobile-client problem is a Q199 follow-on.

---

## Q205. What is your dependency on third-party APIs (maps, SMS, payments) — and what is your failover?

**Answer:** Today: SMS (auth OTP) and possibly payment (later). Maps: not yet wired. Failover: degrade gracefully (skip SMS, use email; skip maps, use text addresses). We have not yet chosen specific vendors.

---

## 21. Scale, Performance & Reliability

## Q206. What is your peak QPS projection, and how does your system handle 10x that?

**Answer:** Today's load is "founder + a few pilot users" — sub-1 QPS. At 10x, Vercel edge + managed Postgres handles it; at 100x, we need read replicas, caching, and likely a dedicated API tier. We have not yet load-tested.

---

## Q207. What is your uptime SLA — 99%, 99.9%, 99.99%?

**Answer:** We do not publish an SLA. Implicit SLA is whatever Vercel + our managed Postgres give us. We will not promise 99.99% to enterprise customers without real engineering investment.

---

## Q208. How do you handle a viral moment (TV feature, celebrity mention) without crashing?

**Answer:** Vercel scales elastically for the read path. The risk is on the write path (a celebrity drives 10,000 signups) and the database connection pool. We have not yet stress-tested this.

---

## Q209. Will you run multi-region active-active, or single-region with failover?

**Answer:** Single-region with failover. Vercel gives us multi-region edge for the read path, but our database is single-region. Multi-region active-active is a Q215 post-Series-A conversation.

---

## Q210. What is your database scaling strategy — read replicas, sharding, or single-node with optimism?

**Answer:** Single-node with optimism for now. Read replicas when we hit the first real read bottleneck; sharding is a much later problem.

---

## Q211. How do you handle year-end reporting load when every NGO exports at once?

**Answer:** We have not stress-tested this. Likely mitigation: precomputed rollups, async export jobs. Not built.

---

## Q212. Will you use edge functions, serverless, or long-running servers — and why?

**Answer:** Edge functions and serverless for the web app (Vercel default). Long-running servers (e.g., a queue worker) only if we have a background-processing need we cannot fit into a serverless function. Today, we are all serverless.

---

## Q213. What is your disaster-recovery RTO / RPO?

**Answer:** We have not committed. Realistic: RPO 1 hour (managed Postgres backups), RTO 4–8 hours (manual restore from backup + Vercel redeploy). Not great, but acceptable for an MVP.

---

## Q214. How do you handle "thundering herd" when a popular listing goes live?

**Answer:** We do not. If a listing goes viral, expect a brief degradation. This is a Q215 hardening item (queue, rate-limit, optimistic UI).

---

## Q215. What is your cost-per-1000-active-users trajectory?

**Answer:** We have not measured. The Vercel + managed-Postgres cost is roughly linear in traffic; we have not yet projected at scale. Q247 board question.

---

## 22. Legal, Compliance & Insurance

## Q216. Are you incorporated as a nonprofit, LLC, or public benefit corp — and why?

**Answer:** We have not incorporated. The directional answer is "public benefit corporation" or the Indian/UK equivalent, to balance mission and capital. Q115, Q255.

---

## Q217. Are donations tax-deductible, and in which jurisdictions?

**Answer:** Tax-deductibility depends on the donor's jurisdiction and the platform's legal status. We have not engaged tax counsel. We cannot promise tax-deductibility today.

---

## Q218. Do you have legal opinions on liability in every market you operate in?

**Answer:** No. We have not yet engaged local counsel in any market. This is a Q226 pre-pilot blocker.

---

## Q219. Are you compliant with anti-bribery / FCPA if operating internationally?

**Answer:** We have not yet done a FCPA review. As we expand internationally, this becomes a real item. Not a v1 concern.

---

## Q220. Will you ever handle controlled substances (alcohol, OTC medicine) — and what licenses are required?

**Answer:** No, out of scope. Controlled substances require licenses and a regulatory posture that is incompatible with our v1.

---

## Q221. Do you have a Terms of Service that is enforceable against minors, refugees, or unbanked users?

**Answer:** We do not have a finalized ToS. We acknowledge that enforcing contracts against minors and refugees is legally and ethically fraught; we will not rely on ToS as the primary protection. Real protection comes from policy + ops, not legal clauses.

---

## Q222. Will you be subject to right-to-repair / data-portability regulations?

**Answer:** Yes, likely, under GDPR/DPDP/CCPA. We have not built data-portability exports yet but will need to.

---

## Q223. Do you have an ethical-AI policy if you deploy ML for matching / routing / pricing?

**Answer:** Not in writing. The principle is "no ML that disadvantages vulnerable users without explicit human review." Until we deploy ML in production, this is policy intent, not a deployed behavior.

---

## Q224. What is your policy on cooperating with subpoenas?

**Answer:** Comply with valid legal process; challenge over-broad subpoenas; transparency report annually (aspirational). We have not written this down yet.

---

## Q225. Will you carry D&O insurance as you scale?

**Answer:** Yes, when we have a board. Today, no board, no D&O. This is a Q256 follow-on.

---

## 23. Pilot, Rollout & GTM

## Q226. What is the smallest pilot that proves the model — 1 city, 10 farmers, 3 NGOs?

**Answer:** Directional: one district, one anchor NGO, one anchor warehouse, one anchor retailer (or 5–10 smallholder farmers via an FPO), 30–90 days. We have not committed to a specific pilot yet. This is the next concrete deliverable.

---

## Q227. How long is your pilot — 30 days, 90 days, 12 months?

**Answer:** 90 days. Long enough to see weekly cycles, short enough to keep the team honest.

---

## Q228. What are the success criteria for graduating from pilot to scale?

**Answer:** Suggested criteria: (a) ≥X rescues/week sustained, (b) ≥Y% match rate, (c) ≤Z% food-loss rate, (d) ≥1 NGO willing to pay for the service, (e) ≥1 retailer willing to pay. We have not set the actual numbers.

---

## Q229. Who is your beachhead customer — farmer, retailer, NGO, or government?

**Answer:** Retailer for revenue, NGO for distribution, farmer for supply. The beachhead is the anchor retailer (Q144), but the pilot is structured around the NGO.

---

## Q230. Do you sell top-down (to ministries, retail chains) or bottom-up (to individual farmers / NGOs)?

**Answer:** Both, but in sequence. Bottom-up (NGO, FPO) first to build the network; top-down (ministry, retail chain) second to scale. Q231, Q233.

---

## Q231. Will you partner with established NGOs (Feeding India, Akshaya Patra) for distribution, or compete with them?

**Answer:** Partner. The platform's value to them is "more inbound flow + better reporting." Competing would be a Q155 losing move.

---

## Q232. What is your sales cycle length for a new retailer — 1 week or 6 months?

**Answer:** Likely 1–3 months for a small/medium retailer, 6+ months for a large chain. We have not yet sold to either.

---

## Q233. How do you onboard 1,000 farmers in a district — village meetings, WhatsApp, radio?

**Answer:** FPO meetings + WhatsApp. Radio is a Q215 marketing-channel exploration. We have not run a 1,000-farmer onboarding yet.

---

## Q234. What is your customer-success motion after onboarding — is there a real human?

**Answer:** Founder is the CSM today. This is a Q256 hiring question: a dedicated CS hire is a Series-A milestone.

---

## Q235. Will you charge for premium features, or stay free forever?

**Answer:** Free for NGOs in the near term; charge retailers/warehouses for premium features (analytics, integrations, SLAs). We have not yet defined the premium tier.

---

## 24. Impact, Measurement & Reporting

## Q236. How do you define "rescued" — kg delivered, meals served, beneficiaries reached, or CO₂ avoided?

**Answer:** Primary metric: kg delivered to a recipient. Secondary: meals served (assumes 0.5 kg/meal default). Tertiary: CO₂e avoided (per-route calculation). We do not yet have a precise beneficiary count.

---

## Q237. How do you prevent double-counting the same kg across multiple reports?

**Answer:** Unique rescue IDs propagated through every downstream report. The data model supports it; the reporting layer is what needs to honor it. We have not built the consolidated report yet.

---

## Q238. Will your impact numbers be audited by a third party, or self-reported?

**Answer:** Self-reported for now. Third-party audit is a Q215 cost we cannot yet afford. Aspirational target: annually, once we have ≥$1M revenue.

---

## Q239. How do you measure *additionality* — would the food have been rescued without you?

**Answer:** This is hard. The honest answer is "we cannot measure additionality perfectly; we triangulate via counterfactual surveys of donors and recipients." This is a Q240 follow-on.

---

## Q240. What is your counterfactual — what would have happened to the food in your absence?

**Answer:** Directional: a portion would have been discarded, a portion informally donated, a portion sold at deep discount. We have not measured; we cite industry estimates.

---

## Q241. Will you publish open data, or keep impact metrics proprietary?

**Answer:** Publish anonymized aggregate data annually. The platform does not gain from holding it close.

---

## Q242. How do you handle negative impact — e.g., displacement of informal-sector waste pickers?

**Answer:** This is a real risk we are honest about. If our platform routes food that waste pickers were already collecting and reselling, we may be displacing informal-sector income. We have not yet designed a mitigation.

---

## Q243. Do you measure nutritional impact (vitamins delivered), or only weight?

**Answer:** Weight only in v1. Nutritional impact requires upstream data we do not have.

---

## Q244. How do you compare yourself to alternatives — composting, animal feed, industrial processing?

**Answer:** We do not yet have a clean comparison. The directional argument is "human-consumption rescue has higher social value per kg than composting/animal feed, but lower waste-volume yield." Open question.

---

## Q245. Will you ever claim impact for food that was sold, not donated?

**Answer:** No. Only donations count toward rescue impact. Sales (discount marketplaces) are a separate line and will not be conflated.

---

## 25. Investor / Financial Due Diligence

## Q246. What is your 5-year financial projection, and what assumptions does it hinge on?

**Answer:** We have not built a 5-year model. The honest answer is that the projection hinges on (a) match rate reaching 30–50%, (b) CAC staying below a per-rescued-kg threshold, (c) at least one paid retailer-customer by year 2. None of these are validated.

---

## Q247. What is your burn rate, runway, and next funding milestone?

**Answer:** Burn is essentially zero (founder time + small infra costs). Runway is "as long as the founders' personal savings last." Next funding milestone is pre-seed/seed, contingent on a successful pilot (Q226).

---

## Q248. What is your cap table, and how much dilution have founders taken?

**Answer:** Founders hold 100% today. We have not raised priced equity. We have not yet decided on a SAFE vs priced round for the seed.

---

## Q249. What is your ARR / MRR today, and what is the growth rate?

**Answer:** Zero. We are pre-revenue. This is the Q226 blocker.

---

## Q250. What is your gross margin, net margin, and contribution margin?

**Answer:** We cannot answer honestly. Q110.

---

## Q251. What is your LTV / CAC ratio?

**Answer:** We cannot answer. Q109.

---

## Q252. What is your payback period on customer acquisition?

**Answer:** We cannot answer. Q111.

---

## Q253. What is your concentration risk — top 5 customers as % of revenue?

**Answer:** N/A today (zero revenue). Q144.

---

## Q254. Have you raised priced equity before, and at what valuation?

**Answer:** No. Q248.

---

## Q255. What is your exit path — acquisition by Walmart / Amazon, IPO, perpetual nonprofit, or cooperative buyout?

**Answer:** We have not committed. The most likely paths are (a) acquisition by a logistics or retail-tech incumbent, (b) perpetual operation as a public-benefit corp, (c) cooperative buyout by the NGO/farmer network. The mission-aligned options are (b) and (c); (a) is the most likely financial outcome.

---

## 26. Team, Org & Execution

## Q256. Who is on the founding team, and what have they shipped at scale before?

**Answer:** We are a hackathon team. Founders are early-career engineers/designers; we have not shipped at scale before. This is a Q215 honest gap.

---

## Q257. Who is your technical lead, and have they built logistics / marketplace systems before?

**Answer:** The technical lead is a hackathon-stage engineer. Logistics/marketplace experience is limited. Advisors will need to fill this gap.

---

## Q258. Who is your ops lead, and have they run cold-chain or food supply chains before?

**Answer:** No dedicated ops lead. The team has not run cold-chain before. This is a Q256 hiring gap and a Q226 pre-pilot blocker.

---

## Q259. Who is your regulatory / legal lead, and do they have food-law expertise?

**Answer:** No dedicated legal lead. We have not engaged food-safety counsel. This is a Q226 pre-pilot blocker.

---

## Q260. How big is the team today, and what is your hiring plan for 12 / 24 / 36 months?

**Answer:** Team is currently the hackathon team. Plan (rough): 3–4 by month 12, 8–10 by month 24, 15–20 by month 36. This is contingent on funding (Q247).

---

## Q261. Are you remote-first, hybrid, or in-office — and why?

**Answer:** Remote-first. Geographic dispersion of pilot regions and the nature of the problem make in-office impractical.

---

## Q262. How do you handle founder conflict, if it arises?

**Answer:** We have not formalized. We will need a founders' agreement before incorporation (Q216). This is a real gap.

---

## Q263. What is your equity split, and is there a vesting cliff?

**Answer:** We have not finalized. Vesting with a cliff is the default plan; exact splits are TBD.

---

## Q264. Have any founders left, and why?

**Answer:** N/A today. The honest answer if asked later: we will be transparent.

---

## Q265. Do you have an advisory board with real food / logistics / policy expertise?

**Answer:** Not formally. We will need at least one advisor with food-supply-chain experience and one with policy/regulatory experience before the next funding round. Q247.

---

## 27. Existential / Worst-Case

## Q266. What happens if a major retailer sues you for defamation after a bad press cycle?

**Answer:** We do not have a defamation-protection plan. Insurance (Q68, Q225) and a strong terms-of-service (Q221) are the mitigations. The honest answer is that a defamation suit could be lethal at our stage.

---

## Q267. What happens if a mass food-poisoning event is traced to your platform?

**Answer:** The platform's existence is at risk. The mitigations are (a) chain-of-custody records to demonstrate we did not cause the contamination, (b) insurance, (c) rapid recall and incident response (Q69, Q72). We have not built (c). This is the scenario we plan for but are not ready for.

---

## Q268. What happens if your database is breached and donor relationships are leaked?

**Answer:** Notification under applicable law (Q99), possible regulatory fines, loss of trust. The mitigations are encryption (Q104), access controls, and incident-response readiness (Q202). We are not where we need to be.

---

## Q269. What happens if a key partner (largest retailer, biggest NGO) leaves you for a competitor?

**Answer:** The pilot fails or is set back significantly. The mitigation is to not over-anchor on a single partner (Q144) and to keep the partner agreement portable.

---

## Q270. What happens if a government bans your operations overnight (e.g., during a crisis)?

**Answer:** We comply, pause operations in that jurisdiction, and resume when allowed. We do not have a multi-jurisdiction fallback plan today.

---

## Q271. What happens if commodity prices crash and your entire model stops being needed?

**Answer:** This is the "we have solved food waste" scenario, which would be a societal win and a business problem. The directional answer: pivot to broader supply-chain visibility / food-system data. We have not modeled this seriously.

---

## Q272. What happens if a deepfake of your CEO goes viral claiming fake food rescues?

**Answer:** Rapid response: official channels, press statement, video verification. We have not built a comms playbook. This is a Q266/Q274 risk.

---

## Q273. What happens if your biggest funder pulls out mid-pilot?

**Answer:** Pilot pauses or shrinks. We do not have a fallback funder list. Q247.

---

## Q274. What happens if you simply run out of money in 6 months?

**Answer:** The platform goes dark. The data and code survive (open-source release is an option). The team disperses. We have not yet built a graceful wind-down plan.

---

## Q275. What happens if you succeed wildly — and a global incumbent acquires and shuts you down to neutralize the threat?

**Answer:** This is the Q154/Q271 question again. The directional mitigation: open-source the code, keep the network alive as a cooperative, ensure mission protection in the charter (Q216). We have not stress-tested this path.

---

## 28. The "10-Question Stress Test"

## Q1 (Stress Test). Unit economics — what is your gross margin per rescued kg, and how does it scale past 10x volume?

**Answer:** We cannot answer this honestly yet. We have not run a single paid rescue. The directional model is: per-rescue fee minus per-rescue variable cost (server, ops, transport subsidy) yields a small positive margin at scale, but only if match rate is high and CAC is low. Until we measure, this is a framework, not a number. This is the Q110 gap.

---

## Q2 (Stress Test). Chicken-and-egg — what is your cold-start playbook for the first city, week by week?

**Answer:** We have not written it down at week-level granularity. The directional playbook: Week 0 — sign anchor NGO + anchor warehouse. Weeks 1–2 — onboard 5–10 farmers via FPO, 1 anchor retailer. Weeks 3–6 — run subsidized rescues, measure match rate and loss rate. Weeks 7–10 — iterate. Week 12 — decide on scale. This is a Q142 deliverable.

---

## Q3 (Stress Test). Liability — who is legally responsible if a donation makes someone sick?

**Answer:** The donor bears primary product-liability exposure. The platform facilitates chain-of-custody evidence. We do not absorb liability today and are not insured to do so (Q66, Q68). This is a real, unmitigated risk.

---

## Q4 (Stress Test). Cold-chain reality — what happens when the grid is down for 8 hours?

**Answer:** The platform does not own cold-chain. The warehouse partner owns backup power and decisions. We do not have telemetry (Q77, Q121). The honest answer is: food may be lost; we do not detect it; the NGO finds out at delivery.

---

## Q5 (Stress Test). Inclusion — how does a low-literacy farmer on a ₹5,000 phone actually use this?

**Answer:** Today: not at all. The MVP web app is English-only and assumes a modern browser. The Q1/Q3/Q166/Q171 path is the answer, and we have not built it. This is a hard gap.

---

## Q6 (Stress Test). Demand imbalance — how do you prevent all produce flowing to one region?

**Answer:** We do not yet. The mechanism (balanced-allocation scoring) is a Q86/Q128 product question we have not solved. Today, the system optimizes for the most efficient match, which biases toward high-demand regions.

---

## Q7 (Stress Test). Defensibility — what stops Amazon / Flipkart from launching this as a free feature?

**Answer:** Nothing structural. Our defense has to be speed, network density, and brand trust. We do not have a defensible moat today (Q149). The realistic answer: a focused, community-rooted operator can out-execute a generalist incumbent on a niche.

---

## Q8 (Stress Test). Additionality — would the food have been rescued without you?

**Answer:** We cannot measure additionality perfectly. The directional answer: a meaningful fraction of rescued food would have been discarded; a fraction would have been informally donated; a fraction would have been sold at deep discount. We cite industry estimates; we have not run a counterfactual survey. Q239.

---

## Q9 (Stress Test). Privacy — what personal data do you collect, and what is your policy on selling it?

**Answer:** Minimum viable: name, phone, role-specific data. We do not collect Aadhaar/PAN/SSN in MVP. We do not sell individually-identifying data. Aggregated, anonymized, opt-in data products are a possible future line. We have not done a formal DPIA. Q96, Q98.

---

## Q10 (Stress Test). Exit / scale ceiling — what is the realistic ceiling on this market, and how do you capture durable value past it?

**Answer:** The market ceiling is bounded by total addressable food waste in our operating geographies, minus what informal channels already rescue. We have not sized this. The durable-value question is open: per-rescue fee, SaaS, or data. We have not committed to a model (Q106, Q255).

---
