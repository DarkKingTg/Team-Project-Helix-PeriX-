# PerishNet — Stakeholder Question Bank

> **Purpose.** A brutally honest, unfiltered list of hard questions that real
> stakeholders — farmers, retailers, warehouse operators, food-bank staff,
> drivers, end recipients, regulators, NGO partners, competitors, technical
> skeptics, and investors — will throw at PerishNet. Treat this as the
> pre-flight checklist before pitching, building, or shipping.
>
> Every question is written in plain stakeholder voice. Where useful, the
> question is followed by **[Hint]** notes that point toward the kind of
> evidence / answer the team will eventually need — but the document
> intentionally does **not** provide canned answers. The point is to surface
> the gaps.
>
> Audience: founders, PMs, designers, engineers, hackathon judges, and any
> reviewer doing due diligence.

---

## Table of Contents

1. [Farmers / Producers](#1-farmers--producers)
2. [Retailers / Supermarkets](#2-retailers--supermarkets)
3. [Warehouses / Cold Storage](#3-warehouses--cold-storage)
4. [Food Banks / NGOs](#4-food-banks--ngos)
5. [Drivers / Field Ops](#5-drivers--field-ops)
6. [End Recipients (Families, Shelters)](#6-end-recipients-families-shelters)
7. [Trust, Safety & Liability](#7-trust-safety--liability)
8. [Food Quality, Safety & Regulation](#8-food-quality-safety--regulation)
9. [Logistics, Routing & Operations](#9-logistics-routing--operations)
10. [Data, Privacy & Security](#10-data-privacy--security)
11. [Unit Economics & Business Model](#11-unit-economics--business-model)
12. [Cold-Chain & Infrastructure Reality](#12-cold-chain--infrastructure-reality)
13. [Demand / Supply Imbalance](#13-demand--supply-imbalance)
14. [Network Effects & Chicken-and-Egg](#14-network-effects--chicken-and-egg)
15. [Competition & Defensibility](#15-competition--defensibility)
16. [Geopolitics, Seasonality & Climate](#16-geopolitics-seasonality--climate)
17. [Accessibility, Inclusion & Digital Divide](#17-accessibility-inclusion--digital-divide)
18. [Trust, Fraud & Gaming](#18-trust-fraud--gaming)
19. [Adoption, Behavior Change & UX](#19-adoption-behavior-change--ux)
20. [Technical / Engineering Reality](#20-technical--engineering-reality)
21. [Scale, Performance & Reliability](#21-scale-performance--reliability)
22. [Legal, Compliance & Insurance](#22-legal-compliance--insurance)
23. [Pilot, Rollout & GTM](#23-pilot-rollout--gtm)
24. [Impact, Measurement & Reporting](#24-impact-measurement--reporting)
25. [Investor / Financial Due Diligence](#25-investor--financial-due-diligence)
26. [Team, Org & Execution](#26-team-org--execution)
27. [Existential / Worst-Case](#27-existential--worst-case)
28. [The "10-Question Stress Test"](#28-the-10-question-stress-test)

---

## 1. Farmers / Producers

1. Every farmer is not educated — how will they actually use your application
   easily? Will it work on a ₹5,000 phone with 2G?
2. My village has zero internet for 6 hours a day. What happens to the
   listing I posted during that window?
3. I don't read English — does the app support my local language, and is the
   voice input actually usable or a gimmick?
4. Why would I list my surplus on your app instead of just throwing it on the
   side of the road or feeding my cattle? What is in it for me *concretely*
   — rupees in hand, not "impact points"?
5. I am a small farmer with 10 kg of surplus tomatoes today. Will your system
   even bother with me, or will it only serve industrial-scale suppliers?
6. Who pays for the packaging, the weighing, the photo? You want a beautiful
   listing, but my time costs money.
7. I list at 9 AM. A truck arrives at 11 AM. Who guarantees pickup? What if
   the buyer cancels at the last minute — does the food just rot on my farm?
8. I have been cheated before by middlemen. What stops *your* middleman from
   cheating me?
9. If the price you offer me is lower than the mandi price, why would I
   ever use this?
10. How do I know the "warehouse" that picks up my produce will actually pay
    me — and on what timeline? Net-30? Net-60?
11. Will my data — farm location, yield patterns, income — be sold to buyers
    or commodity traders?
12. What if I am not formally registered as a farmer? Will I still be able
    to participate, or will KYC lock me out?
13. My produce is perishable. The app's matching algorithm says "no buyer in
    your region today." So what? The food is gone. Is there a fallback?
14. Do you support collective selling — me + 9 neighboring farmers pooling
    a truckload? Or only individual listings?
15. What happens during harvest glut weeks when *every* farmer has surplus
    and your platform is flooded?

---

## 2. Retailers / Supermarkets

16. We already donate to a few local NGOs informally. Why should we route
    that through your platform — what do we gain besides a logo on a
    dashboard?
17. Our loss-prevention / shrinkage accounting is internal. Will your
    system integrate with our existing ERP, or are you asking our staff
    to enter data twice?
18. "Rescue credits" sound nice, but our CFO cares about tax deductions.
    Will your receipts be audit-grade for tax authorities?
19. If a food-poisoning incident is traced back to a donation routed
    through your platform, where does liability sit — with us, with you,
    or with the food bank?
20. What is the SLA on your dashboard? If it is down during our
    month-end reporting, who compensates the labor cost of our staff?
21. We are a 1,200-store chain. Can your system actually handle that
    volume without us hiring a dedicated integration team?
22. How do you prevent our store managers from gaming the donation numbers
    to inflate their "ESG metrics"?
23. Will our branded CSR reports claim your impact numbers as ours? Can
    we license the underlying data?
24. Our private-label products are in the surplus. Can we mark items as
    "do not donate" — for IP or brand-protection reasons?
25. Why would we discount-sell near-expiry items on your marketplace
    instead of just dumping them to the same middlemen we already use?

---

## 3. Warehouses / Cold Storage

26. Cold storage is expensive. Every hour of dwell time costs me. How does
    your platform guarantee throughput — minimum pickup within X hours?
27. What is your surge-pricing model during festival weeks when cold-chain
    capacity is tight?
28. If a load arrives damaged or spoiled at my warehouse, who pays — the
    transporter, the seller, or PerishNet?
29. Do you provide insurance for the inventory while it sits in my
    warehouse? At what cost?
30. My warehouse handles B2B pallets, not small-parcel donations. Will
    your matching logic send me mismatched loads?
31. How do you handle quarantine / rejection of incoming food? Do you have
    a digital QC workflow, or is it still WhatsApp + paper?
32. What is your integration with my Warehouse Management System
    (WMS)? API? EDI? SFTP? Manual?
33. I am at 90% capacity. Will your system warn me *before* matching new
    loads to me?
34. Power cuts kill my cold chain. Do you have offline buffering /
    temperature-logger integrations?
35. Who owns the data on my throughput, dwell time, and rejection rates?

---

## 4. Food Banks / NGOs

36. Our staff are volunteers. Will they actually log into yet another
    dashboard, or will they ignore it after week two?
37. We already have trusted donor relationships. What does PerishNet add
    that we cannot do with a phone call?
38. When you route a donation to us, do you subsidize our distribution
    costs — or are we absorbing that?
39. If the food is unfit for human consumption, where does it go — animal
    feed, composting, landfill? Do you have that pipeline?
40. We serve specific communities (religious, dietary, refugee). Can your
    matching respect those constraints, or is it just "nearest NGO
    wins"?
41. Our capacity fluctuates — 50 meals/day on weekdays, 500 on weekends.
    How does your system handle that?
42. What is your reporting format? Our funders (UN, corporate CSR) want
    audit trails and beneficiary counts.
43. Do you charge us anything — platform fee, listing fee, success fee?
44. Will PerishNet divert corporate donations *away* from us by offering
    the corporation a "better dashboard"?
45. We have strict eligibility / KYC for our beneficiaries. Can your
    app surface that eligibility check, or will recipients self-declare?

---

## 5. Drivers / Field Ops

46. Will the app give me turn-by-turn navigation that actually works in
    low-signal areas, or am I back to Google Maps + calling the
    recipient?
47. What happens if a recipient is not home when I arrive? Do I have to
    sit and wait, or is there a clear handoff protocol?
48. I am paid per delivery, not per hour. Will your route optimization
    actually reduce my deadhead miles, or just shuffle them?
49. How do you handle vehicle breakdowns — is there a roadside-assist
    hotline, or am I stranded with rotting produce?
50. Will I be considered an employee, a contractor, or a gig worker?
    What are the tax / insurance implications for me?
51. What is the working-hour cap? Will the app keep pushing deliveries
    past safe fatigue limits?
52. If I deliver damaged goods, who pays — me, the warehouse, the
    transporter company?
53. Will the app work offline for 8+ hours when I am in rural areas?
54. Is there a real human dispatcher I can call, or just a chatbot?
55. What safety protections do I have when entering unfamiliar
    neighborhoods at night?

---

## 6. End Recipients (Families, Shelters)

56. Will the app tell me what I am actually receiving — nutritional
    info, allergens, ingredients — or just "mixed vegetables"?
57. I have dietary restrictions (vegan, halal, kosher, gluten-free,
    diabetic). Will the system respect those, or am I filtering
    manually?
58. If the food makes my family sick, who is accountable, and what is
    the dispute process?
59. Why should I trust a stranger handing me food? Is there a rating
    system, traceability, or recall mechanism?
60. Will I be asked to "pay" with my personal data — name, address,
    income, family size — to access the food?
61. If the app shows me "no food available today," what is my
    fallback? Do I have any visibility into *when* it might arrive?
62. Will I be profiled / scored for "deservingness"? Will missing a
    pickup hurt my future access?
63. Is there a dignity-preserving pickup experience, or will I queue
    publicly in a way that stigmatizes me?
64. Will the app work on my phone — which is older, smaller, and
    lower-end than the designer's test device?
65. What languages is the recipient UI available in?

---

## 7. Trust, Safety & Liability

66. If someone dies from food routed through PerishNet, who goes to
    jail? You, the donor, the transporter, the NGO?
67. What is your food-safety audit process before a new warehouse
    goes live on the platform?
68. Do you carry product-liability insurance? Up to what limit? Per
    incident or aggregate?
69. What is your recall protocol — when contamination is suspected,
    how fast can you contact every downstream recipient?
70. Are donations legally "gifts" (no warranty implied) or "sales"
    (full warranty)? This single classification changes everything.
71. What is your indemnification clause for retailers vs NGOs vs
    drivers?
72. Do you have a 24/7 incident hotline?
73. Will you publish post-incident reports, or are they buried under
    NDAs?
74. What is your policy on counterfeiting — fake "rescue" listings
    designed to game ESG metrics?
75. If a corporate donor wants to publicize a donation, can you
    guarantee the exact kg count and timeline, or is it "roughly X"?

---

## 8. Food Quality, Safety & Regulation

76. FSSAI / FDA / EFSA regulations differ across regions. How do you
    stay compliant in every jurisdiction you operate in?
77. What is the cold-chain integrity guarantee — temperature log every
    X minutes from pickup to delivery?
78. How do you handle mixed loads where some items require -18°C and
    others require +4°C?
79. What is your shelf-life estimation algorithm based on — visual
    inspection, sensor data, or just the printed date?
80. If a date label is missing or damaged, what is the fallback
    decision rule — accept, reject, or quarantine?
81. Will you ever handle raw meat, dairy, or infant formula — and if
    so, what extra safeguards exist?
82. How do you handle allergen cross-contamination in shared
    transport?
83. Will regulators audit your platform — and are you prepared to
    hand over matching / routing data on demand?
84. Do you support "best before" vs "use by" distinction — and does
    your matching logic treat them differently?
85. What is your HACCP / GMP documentation policy for partner
    warehouses?

---

## 9. Logistics, Routing & Operations

86. If demand is concentrated in one region and all middlemen send
    produce there, low-demand regions starve. How do you prevent
    this imbalance?
87. Will your routing engine optimize for *fairness* (every NGO gets
    something) or for *efficiency* (cheapest mile)? What if those
    conflict?
88. What happens during festivals / disasters when normal routes
    break?
89. If a truck breaks down mid-route, what is your failover — second
    vehicle, alternate warehouse, food bank rerouting?
90. How do you handle the "last mile" in dense urban areas where
    parking / loading is impossible?
91. Will you operate your own fleet, or always rely on third-party
    logistics?
92. What is the carbon accounting for your routes — is your
    "sustainability" claim verified, or marketing?
93. How do you batch small deliveries into truckloads efficiently
    without making anyone wait 3 days?
94. What happens when the algorithm cannot find a match within X km /
    Y hours?
95. Will you integrate with Google Maps, Mapbox, or HERE — and what
    happens if the API costs spike?

---

## 10. Data, Privacy & Security

96. What personal data do you collect — from farmers, retailers, NGOs,
    recipients, drivers?
97. GDPR / India DPDP / California CCPA — which regimes apply, and how
    do you comply?
98. Will you sell aggregated data to commodity traders, hedge funds,
    or retailers?
99. If we get breached, what is your notification SLA — to users, to
    regulators, to the public?
100. Do you anonymize beneficiary data, or will donors see exactly
     which "poor family" got their food?
101. Who has access to real-time location data of drivers?
102. Will you ever share data with law enforcement without a warrant?
103. Are you SOC 2 / ISO 27001 certified — or planning to be?
104. Do you encrypt data at rest and in transit? With what key
     management?
105. If a recipient dies or moves, what is your data-retention /
     deletion policy?

---

## 11. Unit Economics & Business Model

106. How do you actually make money — transaction fee, SaaS,
     government contract, advertising, data?
107. What is the average transaction value, and is it large enough to
     support the operational cost of rescue?
108. Who pays for the last-mile delivery — donor, recipient, NGO, or
     you?
109. What is your CAC (customer acquisition cost) per retailer, per
     NGO, per farmer?
110. What is your gross margin per rescued kg?
111. What is the payback period for onboarding a new warehouse?
112. Will you ever take a margin on the food itself, effectively
     becoming a middleman?
113. How do you sustain the platform during a 6-month zero-revenue
     pilot?
114. What happens to unit economics when diesel prices double?
115. Are you a nonprofit, a B-Corp, or a for-profit — and why does the
     structure choice matter?

---

## 12. Cold-Chain & Infrastructure Reality

116. In regions with 8-hour daily power cuts, your "cold-chain
     guarantee" is fiction. What do you actually do?
117. Refrigerated trucks cost 5x normal trucks. Who funds them?
118. What is your fallback when cold-chain breaks — is the food
     considered safe for shorter durations?
119. Will you operate your own cold storage, or always rely on
     partners?
120. In monsoon / flood / heatwave conditions, how does your routing
     adapt?
121. Will you invest in IoT temperature loggers, or assume trust?
122. What is your SLA for cold-chain failure detection and response?
123. Do you support passive cooling (evaporative, phase-change
     materials) for off-grid areas?
124. Will your system work for ambient-stable food (grains, pulses)
     the same way as chilled produce?
125. How do you handle multi-modal transport — reefer trucks, last-mile
     EVs, cargo bikes, drones?

---

## 13. Demand / Supply Imbalance

126. If a region has 10x more supply than demand, what is the
     fallback — composting, biogas, animal feed? Do you have that
     pipeline or just a "matching" engine?
127. If demand is concentrated in one city and supply is rural, will
     your logistics cost eat all the margin?
128. Will you subsidize transport to low-demand regions to maintain
     fairness, or starve them?
129. How do you balance perishable urgency against equitable
     distribution?
130. During harvest glut, prices crash — does your matching still
     work, or do farmers stop listing?
131. During demand spikes (Ramadan, Diwali, refugee influx), can you
     surge capacity in <24 hours?
132. Will you ever artificially constrain supply to keep prices up?
133. What is your mechanism for predicting demand 7 days out?
134. Will you let recipients "subscribe" to recurring pickups, or only
     ad-hoc?
135. How do you avoid creating a parallel gray market that undercuts
     formal supply chains?

---

## 14. Network Effects & Chicken-and-Egg

136. Why would a farmer list produce before there are any buyers
     visible on the platform?
137. Why would a retailer onboard before there is a single NGO on
     the other end?
138. Why would an NGO onboard before there is any food flowing?
139. How do you solve the cold-start problem in a new region?
140. What is your single-region launch strategy — one city, one
     district, one farm cluster?
141. Will you subsidize early transactions to seed liquidity?
142. How do you onboard the first 50 farmers, 10 retailers, 5 NGOs,
     3 warehouses — concretely, week by week?
143. What is the minimum viable density (per sq km) before matching
     works?
144. Do you anchor on a single dominant partner (e.g., one big
     retailer's CSR program), or build balanced?
145. How long until network effects kick in — 3 months, 12 months,
     36 months?

---

## 15. Competition & Defensibility

146. Why would a retailer not just build this internally — it is
     "just" a logistics app?
147. What stops an Amazon / Flipkart / BigBasket from launching this
     as a free CSR add-on?
148. What stops an existing food bank (Feeding America, Feeding
     India) from building their own tech?
149. What is your defensible moat — data, network, brand, regulation,
     patents?
150. If a competitor raises $50M, what is your response?
151. Will you partner with incumbents or compete head-on?
152. What is your "kill shot" — the feature that, once shipped, makes
     switching too painful?
153. Why won't an open-source clone replicate you in 6 months?
154. Will commodity traders / hedge funds acquire and shut you
     down?
155. Are you the category leader, or one of many similar efforts that
     will consolidate?

---

## 16. Geopolitics, Seasonality & Climate

156. Cross-border food rescue (India ↔ Bangladesh, US ↔ Mexico) —
     what customs / phytosanitary rules apply?
157. How does your model survive currency volatility for
     cross-border donations?
158. Climate change is shifting harvest seasons. Does your model
     adapt, or assume historical patterns?
159. Heatwaves will shorten shelf life — does your algorithm
     dynamically tighten time windows?
160. Will floods / cyclones / wildfires disrupt your logistics, and
     what is the disaster-recovery plan?
161. Will war / sanctions / trade wars affect your supply chain?
162. Will you operate in regions with weak rule of law — and how do
     you protect staff?
163. Do you support indigenous / traditional food systems, or push
     industrial monoculture?
164. Will you operate in regions where food is politically
     weaponized (e.g., blockades)?
165. How do you handle religious / cultural food rules during
     multi-faith distribution (Ramadan, Lent, Navratri)?

---

## 17. Accessibility, Inclusion & Digital Divide

166. What percentage of your target users (farmers, recipients) own a
     smartphone — and what is your plan for the rest?
167. Is your app usable by people with low literacy — icon-based,
     voice-based, or text-heavy?
168. Is your app accessible for users with disabilities (visual,
     hearing, motor)?
169. Will you ever require biometric authentication that excludes
     refugees / stateless people?
170. Do you support offline-first usage, or only online?
171. Will you support USSD / SMS interfaces for feature phones?
172. What is your data-cost optimization — does the app run on 2G?
173. Will you provide shared devices (kiosks) in villages / shelters?
174. How do you onboard elderly recipients who are not tech-savvy?
175. Will you ever require a bank account / digital payment that
     excludes unbanked users?

---

## 18. Trust, Fraud & Gaming

176. How do you prevent fake "rescue" photos — AI-generated images
     of food that never existed?
177. How do you prevent weight fraud (listing 100 kg but delivering
     60 kg)?
178. How do you prevent donation-laundering (food sold to
     restaurants, claimed as donated)?
179. How do you prevent duplicate counting — same food "rescued" 3
     times across 3 reports?
180. Will you use blockchain for traceability, or is that
     theater-without-substance?
181. How do you prevent recipients from selling donated food on the
     black market?
182. How do you prevent drivers from "losing" food and claiming
     delivery?
183. How do you prevent NGOs from claiming food they never received?
184. Will you use random audits, third-party verification, or trust
     entirely?
185. What is your whistleblower / fraud-reporting channel?

---

## 19. Adoption, Behavior Change & UX

186. Why would a busy store manager open your app at 8 PM to list
     surplus — what is the friction-zero path?
187. Why would a farmer wake up early to use your app vs. sleeping
     in?
188. What is your onboarding curve — 5 minutes, 5 days, 5 weeks?
189. Do you gamify (badges, leaderboards) — and does that help or
     backfire with farmers who hate being patronized?
190. Will you run behavior-change campaigns (push notifications,
     WhatsApp) — and at what frequency is it harassment?
191. How do you keep the app sticky after the novelty wears off?
192. What is your retention curve — Day 1, Day 7, Day 30?
193. Will you A/B test on vulnerable populations (recipients, small
     farmers), and is that ethical?
194. How do you handle the "cold-start UX" when a region has zero
     inventory?
195. Will you support community-led onboarding (a local champion
     model), or only top-down rollout?

---

## 20. Technical / Engineering Reality

196. What is your stack, and why is it appropriate for the load
     profile?
197. How do you handle intermittent connectivity between the field
     and your servers?
198. What is your offline-first sync architecture — CRDTs,
     last-write-wins, custom?
199. How do you keep the mobile app size <30 MB for low-end
     devices?
200. What is your CI/CD pipeline, and how fast can you ship a fix?
201. What is your observability stack — logs, metrics, traces?
202. What is your incident response time — MTTD, MTTR?
203. Will you open-source any components, or keep everything
     proprietary?
204. How do you handle schema migrations across mobile clients
     already in the wild?
205. What is your dependency on third-party APIs (maps, SMS,
     payments) — and what is your failover?

---

## 21. Scale, Performance & Reliability

206. What is your peak QPS projection, and how does your system
     handle 10x that?
207. What is your uptime SLA — 99%, 99.9%, 99.99%?
208. How do you handle a viral moment (TV feature, celebrity
     mention) without crashing?
209. Will you run multi-region active-active, or single-region with
     failover?
210. What is your database scaling strategy — read replicas,
     sharding, or single-node with optimism?
211. How do you handle year-end reporting load when every NGO
     exports at once?
212. Will you use edge functions, serverless, or long-running
     servers — and why?
213. What is your disaster-recovery RTO / RPO?
214. How do you handle "thundering herd" when a popular listing goes
     live?
215. What is your cost-per-1000-active-users trajectory?

---

## 22. Legal, Compliance & Insurance

216. Are you incorporated as a nonprofit, LLC, or public benefit
     corp — and why?
217. Are donations tax-deductible, and in which jurisdictions?
218. Do you have legal opinions on liability in every market you
     operate in?
219. Are you compliant with anti-bribery / FCPA if operating
     internationally?
220. Will you ever handle controlled substances (alcohol, OTC
     medicine) — and what licenses are required?
221. Do you have a Terms of Service that is enforceable against
     minors, refugees, or unbanked users?
222. Will you be subject to right-to-repair / data-portability
     regulations?
223. Do you have an ethical-AI policy if you deploy ML for matching
     / routing / pricing?
224. What is your policy on cooperating with subpoenas?
225. Will you carry D&O insurance as you scale?

---

## 23. Pilot, Rollout & GTM

226. What is the smallest pilot that proves the model — 1 city, 10
     farmers, 3 NGOs?
227. How long is your pilot — 30 days, 90 days, 12 months?
228. What are the success criteria for graduating from pilot to
     scale?
229. Who is your beachhead customer — farmer, retailer, NGO, or
     government?
230. Do you sell top-down (to ministries, retail chains) or
     bottom-up (to individual farmers / NGOs)?
231. Will you partner with established NGOs (Feeding India,
     Akshaya Patra) for distribution, or compete with them?
232. What is your sales cycle length for a new retailer — 1 week or
     6 months?
233. How do you onboard 1,000 farmers in a district — village
     meetings, WhatsApp, radio?
234. What is your customer-success motion after onboarding — is
     there a real human?
235. Will you charge for premium features, or stay free forever?

---

## 24. Impact, Measurement & Reporting

236. How do you define "rescued" — kg delivered, meals served,
     beneficiaries reached, or CO₂ avoided?
237. How do you prevent double-counting the same kg across multiple
     reports?
238. Will your impact numbers be audited by a third party, or
     self-reported?
239. How do you measure *additionality* — would the food have been
     rescued without you?
240. What is your counterfactual — what would have happened to the
     food in your absence?
241. Will you publish open data, or keep impact metrics proprietary?
242. How do you handle negative impact — e.g., displacement of
     informal-sector waste pickers?
243. Do you measure nutritional impact (vitamins delivered), or only
     weight?
244. How do you compare yourself to alternatives — composting,
     animal feed, industrial processing?
245. Will you ever claim impact for food that was sold, not donated?

---

## 25. Investor / Financial Due Diligence

246. What is your 5-year financial projection, and what assumptions
     does it hinge on?
247. What is your burn rate, runway, and next funding milestone?
248. What is your cap table, and how much dilution have founders
     taken?
249. What is your ARR / MRR today, and what is the growth rate?
250. What is your gross margin, net margin, and contribution margin?
251. What is your LTV / CAC ratio?
252. What is your payback period on customer acquisition?
253. What is your concentration risk — top 5 customers as % of
     revenue?
254. Have you raised priced equity before, and at what valuation?
255. What is your exit path — acquisition by Walmart / Amazon, IPO,
     perpetual nonprofit, or cooperative buyout?

---

## 26. Team, Org & Execution

256. Who is on the founding team, and what have they shipped at
     scale before?
257. Who is your technical lead, and have they built logistics /
     marketplace systems before?
258. Who is your ops lead, and have they run cold-chain or food
     supply chains before?
259. Who is your regulatory / legal lead, and do they have food-law
     expertise?
260. How big is the team today, and what is your hiring plan for
     12 / 24 / 36 months?
261. Are you remote-first, hybrid, or in-office — and why?
262. How do you handle founder conflict, if it arises?
263. What is your equity split, and is there a vesting cliff?
264. Have any founders left, and why?
265. Do you have an advisory board with real food / logistics / policy
     expertise?

---

## 27. Existential / Worst-Case

266. What happens if a major retailer sues you for defamation after
     a bad press cycle?
267. What happens if a mass food-poisoning event is traced to your
     platform?
268. What happens if your database is breached and donor
     relationships are leaked?
269. What happens if a key partner (largest retailer, biggest NGO)
     leaves you for a competitor?
270. What happens if a government bans your operations overnight
     (e.g., during a crisis)?
271. What happens if commodity prices crash and your entire model
     stops being needed?
272. What happens if a deepfake of your CEO goes viral claiming fake
     food rescues?
273. What happens if your biggest funder pulls out mid-pilot?
274. What happens if you simply run out of money in 6 months?
275. What happens if you succeed wildly — and a global incumbent
     acquires and shuts you down to neutralize the threat?

---

## 28. The "10-Question Stress Test"

If a stakeholder only has 10 minutes, these are the 10 questions that
determine whether PerishNet is fundable, buildable, and defensible:

1. **Unit economics** — what is your gross margin per rescued kg, and how
   does it scale past 10x volume?
2. **Chicken-and-egg** — what is your cold-start playbook for the first
   city, week by week?
3. **Liability** — who is legally responsible if a donation makes
   someone sick?
4. **Cold-chain reality** — what happens when the grid is down for 8
   hours?
5. **Inclusion** — how does a low-literacy farmer on a ₹5,000 phone
   actually use this?
6. **Demand imbalance** — how do you prevent all produce flowing to
   one region?
7. **Defensibility** — what stops Amazon / Flipkart from launching this
   as a free feature?
8. **Additionality** — would the food have been rescued without you?
9. **Privacy** — what personal data do you collect, and what is your
   policy on selling it?
10. **Exit / scale ceiling** — what is the realistic ceiling on this
    market, and how do you capture durable value past it?

If the team can answer these 10 crisply, with evidence, they are ready
to raise / build / ship. If they cannot, they have a real gap.

---

## How to Use This Document

- **Founders:** Treat this as your blind-spot radar. Sort questions by
  urgency (liability > unit-economics > UX) and write a one-paragraph
  answer for each.
- **PMs:** Group questions into epics (e.g., "Cold-Chain," "Privacy,"
  "Trust"). Each epic becomes a research spike.
- **Engineers:** Use technical questions (sections 9, 10, 20, 21) to
  pressure-test the architecture before writing a line of code.
- **Designers:** Use accessibility / UX questions (sections 1, 6, 17, 19)
  as the foundation for user research.
- **Investors / Judges:** Use the 10-Question Stress Test (section 28)
  as your due-diligence shortcut.
- **Anyone:** Add new questions to this doc as you discover them. Real
  stakeholders will surface ones the founders never imagined.

> A question you don't ask is a bug you ship.
