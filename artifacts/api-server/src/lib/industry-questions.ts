import { randomInt } from "node:crypto";

export interface QuizQuestion {
  id: string;
  difficulty: "easy" | "medium" | "hard";
  type: "multiple_choice" | "text" | "berlitz";
  passage?: string;
  text: string;
  options?: string[];
}

const q = (
  id: string,
  difficulty: QuizQuestion["difficulty"],
  type: QuizQuestion["type"],
  text: string,
  options?: string[],
  passage?: string,
): QuizQuestion => ({ id, difficulty, type, text, options, passage });

/* ─── TECHNOLOGY / IT ─── */
const tech: QuizQuestion[] = [
  // EASY
  q("tech_e01","easy","multiple_choice","What does REST stand for in API development?",["Reliable Endpoint State Transfer","Representational State Transfer","Remote Execution Service Technology","Rapid Event Sync Transfer"]),
  q("tech_e02","easy","multiple_choice","Which data structure follows LIFO (Last In, First Out)?",["Queue","Stack","Array","Linked List"]),
  q("tech_e03","easy","multiple_choice","What is the primary purpose of version control systems like Git?",["Speed up code compilation","Track and manage changes to source code","Deploy applications to production","Secure API endpoints"]),
  q("tech_e04","easy","multiple_choice","Which of the following is NOT a programming paradigm?",["Object-Oriented","Functional","Procedural","Relational"]),
  q("tech_e05","easy","multiple_choice","What does SQL stand for?",["Structured Query Language","Simple Question Language","Sequential Query Logic","Standard Query Link"]),
  q("tech_e06","easy","multiple_choice","Which HTTP status code indicates a successful response?",["404","500","200","301"]),
  // MEDIUM
  q("tech_m01","medium","multiple_choice","In Big-O notation, what is the time complexity of binary search?",["O(n)","O(n²)","O(log n)","O(1)"]),
  q("tech_m02","medium","text","Explain the difference between synchronous and asynchronous programming and give one use case for each."),
  q("tech_m03","medium","multiple_choice","Which design pattern ensures a class has only one instance?",["Factory","Observer","Singleton","Strategy"]),
  q("tech_m04","medium","berlitz","Your team has just received this message from a client:\n\n'We are seeing severe performance degradation on our mobile app after the last release — page load times jumped from 1.5 s to 8 s. Revenue is impacted. Need resolution in 24 hours.'\n\nYour senior engineer is on leave. As the next available developer, what is your immediate action?",["Begin profiling the latest release to identify the regression, communicate an ETA to the client, and escalate internally","Reply that you need more time to investigate","Roll back the release immediately without analysis","Ask the client to wait until the senior engineer returns"],),
  q("tech_m05","medium","multiple_choice","What is the main purpose of a database index?",["Reduce storage size","Enforce data types","Speed up query retrieval","Encrypt sensitive fields"]),
  q("tech_m06","medium","text","Describe what SOLID principles mean in software engineering and name at least two of them."),
  q("tech_m07","medium","multiple_choice","In a microservices architecture, which component is typically responsible for routing external requests to internal services?",["Message broker","API Gateway","Load balancer","Service mesh"]),
  q("tech_m08","medium","multiple_choice","Which of the following best describes a race condition?",["A feature that speeds up concurrency","A bug caused by unexpected ordering of concurrent operations","A design pattern for parallel processing","A network latency issue"]),
  // HARD
  q("tech_h01","hard","text","You are tasked with designing a URL shortening service expected to handle 10,000 requests per second. Describe your high-level architecture including storage, hashing strategy, and scalability considerations."),
  q("tech_h02","hard","berlitz","During a code review, you encounter this comment from a colleague:\n\n'I refactored the payment module to use a single global mutable state object shared across all threads to avoid the overhead of passing parameters. It is much cleaner now.'\n\nWhat is the critical issue with this approach and how would you address it professionally?",["There is no issue — global state is a valid pattern","Global mutable shared state causes race conditions and makes the code non-deterministic. You would recommend immutable data structures or proper synchronization mechanisms and raise the concern in review.","The issue is only a style preference — refactor and move on","It is an architecture decision that should not be questioned in code review"]),
  q("tech_h03","hard","multiple_choice","Which consistency model does DynamoDB use by default for read operations?",["Strong consistency","Eventual consistency","Linearizability","Causal consistency"]),
  q("tech_h04","hard","text","Explain the CAP theorem and describe a real-world system that demonstrates the trade-off between consistency and availability."),
  q("tech_h05","hard","berlitz","A production system begins throwing OutOfMemoryErrors intermittently every 48 hours. Heap dumps show a large number of objects in the old generation that are never garbage collected. The application uses a third-party caching library.\n\nWhat is the most likely root cause and how would you investigate it?",["Insufficient RAM — add more memory","A memory leak, likely from the cache holding strong references to objects. Investigate using a memory profiler, check cache eviction policies, and review library documentation for known leaks.","The JVM garbage collector is misconfigured","The database is returning too many rows"]),
  q("tech_h06","hard","multiple_choice","In distributed systems, what does the 'two-phase commit' protocol address?",["Load balancing across nodes","Atomic transactions across multiple databases","Replication lag between primaries","Service discovery in microservices"]),
];

/* ─── BPO / CALL CENTER ─── */
const bpo: QuizQuestion[] = [
  q("bpo_e01","easy","multiple_choice","What does AHT stand for in a call center context?",["Average Handle Time","Agent Hold Time","Automated Help Tool","Active Hour Tracking"]),
  q("bpo_e02","easy","multiple_choice","Which of the following best defines First Call Resolution (FCR)?",["Resolving a complaint in the first meeting of the year","Resolving a customer issue on the first contact without callbacks","Answering the phone within the first ring","Closing the call under 3 minutes"]),
  q("bpo_e03","easy","multiple_choice","What does SLA stand for?",["Standard Level Achievement","Service Level Agreement","Support Line Access","Skill Level Assessment"]),
  q("bpo_e04","easy","multiple_choice","Which listening technique involves repeating back the customer's concern to confirm understanding?",["Active listening","Passive listening","Mirroring","Escalating"]),
  q("bpo_e05","easy","multiple_choice","What is the primary goal of a customer service representative during a call?",["Upsell as many products as possible","Resolve the customer's issue quickly and satisfactorily","Transfer the call to a supervisor","Document the issue for reporting"]),
  q("bpo_e06","easy","multiple_choice","What does KPI stand for?",["Key Performance Indicator","Knowledge Process Integration","Key Personnel Involvement","Known Problem Index"]),
  // MEDIUM
  q("bpo_m01","medium","berlitz","A customer calls in very agitated and says:\n\n'I have been charged TWICE for the same order and nobody has helped me for 3 days! This is unacceptable!'\n\nYou can see in the system that the duplicate charge is confirmed. What is the correct sequence of actions?",["Put the customer on hold immediately and escalate","Apologize sincerely, acknowledge the error, confirm the duplicate charge in the system, initiate the refund process, provide a reference number, and set a clear expectation for resolution time","Tell the customer you need to call them back","Ask the customer to email their complaint instead"],),
  q("bpo_m02","medium","multiple_choice","A customer is using jargon you do not understand. The best approach is to:",["Pretend to understand and continue","Ask a clarifying question politely to ensure you address their correct concern","Transfer the call immediately","Place the customer on hold to research"]),
  q("bpo_m03","medium","text","Describe how you would de-escalate a call where a customer becomes verbally abusive while remaining within company guidelines."),
  q("bpo_m04","medium","multiple_choice","What metric measures the percentage of calls answered within a specified time threshold?",["CSAT","FCR","Service Level","AHT"]),
  q("bpo_m05","medium","text","Explain what 'empathy statements' are in customer service and give two examples you would use in a real call."),
  q("bpo_m06","medium","multiple_choice","Which action is most appropriate when you are unable to resolve an issue during a live call?",["Hang up and hope the customer calls back","Place the customer on indefinite hold","Explain the limitation, offer an alternative or callback, and set clear expectations","Transfer without briefing the next agent"]),
  q("bpo_m07","medium","berlitz","Your supervisor observes your call and gives you this feedback:\n\n'Your CSAT scores are the highest on the floor but your AHT is 40% above the team average. You take too long on each call.'\n\nHow do you respond to this feedback?",["Argue that quality is more important than speed","Accept the feedback, thank the supervisor, and ask for specific call examples to identify areas where you can be more efficient without sacrificing quality","Ignore the feedback — CSAT is the most important metric","Request a transfer to a different team"],),
  q("bpo_m08","medium","multiple_choice","What does CSAT measure?",["Call Success and Transfer","Customer Satisfaction Score","Cost Savings Achieved Today","Call Summary and Tracking"]),
  // HARD
  q("bpo_h01","hard","text","You are a team leader. Two of your agents consistently have high AHT but excellent CSAT. Another agent has low AHT but poor CSAT. How do you manage the performance of all three and what metrics would you prioritise?"),
  q("bpo_h02","hard","berlitz","You receive this message from your operations manager:\n\n'The client has reported a 15% drop in FCR this month and is threatening to pull the account. The data shows agents are prematurely closing tickets. We need a recovery plan by tomorrow.'\n\nOutline the key components of an effective recovery plan.","",""),
  q("bpo_h03","hard","multiple_choice","In Workforce Management, what does 'shrinkage' refer to?",["Reduction in headcount due to attrition","Time agents are unavailable to handle calls due to breaks, meetings, or absences","Decrease in call volume","Agent idle time between calls"]),
  q("bpo_h04","hard","text","Describe the difference between inbound and outbound BPO operations and the unique challenges of managing quality in each."),
  q("bpo_h05","hard","berlitz","Your site receives a sudden 35% spike in call volume due to a product recall. Staffing is at normal levels.\n\nWhat operational decisions do you make in the first hour?",["Wait for the client to provide guidance","Activate your surge protocol: brief all agents on the recall, enable overflow routing, extend shifts where possible, implement callback options to reduce hold time, and escalate to the client for joint communication","Ask agents to work faster","Close the queue until volume normalises"],),
  q("bpo_h06","hard","multiple_choice","The Erlang C formula is used in call centers primarily to:",["Calculate agent bonuses","Determine the number of agents needed to meet a service level target","Measure customer satisfaction","Forecast product demand"]),
  // OPERATIONS MANAGER — management-level questions (not for frontline agents)
  q("bpo_om_e01","easy","multiple_choice","In call center operations, 'occupancy rate' refers to:",["The percentage of time agents spend handling calls and after-call work versus total paid time","The number of calls handled per hour","The percentage of calls resolved on first contact","Agent satisfaction score"]),
  q("bpo_om_e02","easy","multiple_choice","What does 'agent attrition rate' measure in a BPO context?",["The rate at which agents improve their CSAT scores","The average idle time between calls","The percentage of agents who leave the organisation in a given period","The ratio of senior to junior agents on the floor"]),
  q("bpo_om_m01","medium","berlitz","You are an Operations Manager. Your Team Leader reports that one of your pods has seen FCR drop from 71% to 48% over four consecutive weeks — 24 points below the client's contracted target.\n\nYour account review is in 48 hours. What are your immediate actions?",["Wait for the 48-hour review and present the raw data without changes","Conduct an urgent root cause analysis with the TL: pull call recordings, identify the top 3 failure reasons, run a focused coaching session with affected agents on those scenarios, then prepare a data-driven recovery roadmap with milestones for the client review","Replace the Team Leader immediately","Increase call monitoring but make no changes before the client review"],),
  q("bpo_om_m02","medium","multiple_choice","As an Operations Manager, 'schedule adherence' most accurately refers to:",["The consistency of supervisor-to-agent ratios across shifts","The percentage of time agents follow their assigned work schedules including start times, breaks, and log-off","The ratio of calls answered to calls abandoned","The percentage of agents who meet CSAT targets"]),
  q("bpo_om_m03","medium","text","You manage 120 agents across 3 shifts. Monthly attrition has risen from 5% to 18% over three months. Describe the key diagnostic steps you would take and the operational levers you would pull to reduce attrition back to target within 90 days."),
  q("bpo_om_h01","hard","berlitz","A key client accounts for 30% of your site's revenue. They have missed their contracted SLA for 3 consecutive months and have requested an urgent meeting, hinting they may move the account.\n\nAs Operations Manager, outline your approach to the meeting and the recovery plan you would present.",["Apologise and offer a discount to retain the account","Prepare a rigorous RCA identifying root causes, present a phased recovery roadmap with weekly KPI milestones, assign a dedicated quality task force, propose executive-level governance checkpoints, and commit to a 30-day performance guarantee","Ask the client for more time to investigate before the meeting","Attribute the performance gap to external factors such as staffing market conditions"],),
  q("bpo_om_h02","hard","text","Explain how you would build a workforce management strategy for a BPO site that needs to reduce cost-per-contact by 15% over two quarters without breaching contracted service level agreements."),
];

/* ─── HEALTHCARE / MEDICAL ─── */
const healthcare: QuizQuestion[] = [
  q("hc_e01","easy","multiple_choice","What does CPR stand for?",["Controlled Patient Recovery","Cardiopulmonary Resuscitation","Critical Patient Response","Cardiac Pressure Restoration"]),
  q("hc_e02","easy","multiple_choice","Which of the following is a vital sign?",["Blood type","Body weight","Blood pressure","BMI"]),
  q("hc_e03","easy","multiple_choice","What does 'stat' mean in a medical context?",["Standard Treatment","Immediately","Schedule Treatment","Stable"]),
  q("hc_e04","easy","multiple_choice","Which blood type is considered the universal donor for red blood cells?",["AB+","O+","O−","A−"]),
  q("hc_e05","easy","multiple_choice","The normal adult resting heart rate is typically between:",["40–60 bpm","60–100 bpm","100–120 bpm","120–140 bpm"]),
  q("hc_e06","easy","multiple_choice","What is the primary role of white blood cells?",["Transport oxygen","Clot blood","Fight infection","Carry nutrients"]),
  // MEDIUM
  q("hc_m01","medium","berlitz","A post-surgical patient on your ward presses the call button and reports chest pain radiating to the left arm with shortness of breath. Their vitals 30 minutes ago were normal.\n\nWhat is your immediate priority action?",["Document the complaint and wait for the physician's routine round","Assess the patient immediately using ABCDE, call for emergency support, initiate ECG monitoring, and inform the attending physician and charge nurse at once","Administer pain medication as prescribed","Ask the patient to rest and observe for 30 minutes"],),
  q("hc_m02","medium","multiple_choice","What does the acronym 'SOAP' refer to in clinical documentation?",["Surgical Outcome and Procedure","Subjective, Objective, Assessment, Plan","Standard Order of Assessment Protocols","Signs, Observations, Actions, Prescriptions"]),
  q("hc_m03","medium","text","Explain the principle of informed consent in patient care and describe a situation where it might be waived."),
  q("hc_m04","medium","multiple_choice","Which isolation precaution is required for a patient with active pulmonary tuberculosis?",["Contact precautions","Droplet precautions","Airborne precautions","Reverse isolation"]),
  q("hc_m05","medium","text","Describe the '5 Rights' of medication administration and why each matters in preventing errors."),
  q("hc_m06","medium","berlitz","A patient's family member confronts you angrily in the corridor:\n\n'Nobody is telling us anything about my father's condition. We have been waiting for 6 hours!'\n\nYou are the nurse on duty and are aware of patient confidentiality rules. How do you respond?",["Tell the family everything you know about the patient","Ignore the family and continue your duties","Acknowledge their distress, apologise for the wait, verify who has been designated to receive information, and arrange for the physician or charge nurse to speak with them within a defined timeframe","Ask security to remove them from the floor"],),
  q("hc_m07","medium","multiple_choice","A patient's SpO2 reading is 88% on room air. What is the appropriate initial action?",["Continue monitoring — this is normal","Administer supplemental oxygen and notify the physician","Reposition the probe and document","Prepare for immediate intubation"]),
  q("hc_m08","medium","multiple_choice","What does 'prognosis' mean?",["The diagnosis of a disease","The predicted outcome of a disease or treatment","The prescribed treatment plan","The cause of a disease"]),
  // HARD
  q("hc_h01","hard","text","Explain the pathophysiology of septic shock and outline the initial management steps based on the Surviving Sepsis Campaign guidelines."),
  q("hc_h02","hard","berlitz","A 68-year-old patient with hypertension and diabetes is admitted post-MI. On day 2, you notice their urine output drops to 15 ml/hr over 4 hours and creatinine rises from 0.9 to 2.4 mg/dL.\n\nWhat syndrome are you concerned about and what are your priority actions?",["Diabetic ketoacidosis — administer insulin","Acute Kidney Injury (AKI) — assess fluid status, review nephrotoxic medications, notify the physician, and avoid further nephrotoxic agents while planning renal support if needed","Urinary tract infection — start antibiotics","Normal post-MI kidney response — continue monitoring"],),
  q("hc_h03","hard","multiple_choice","Which medication class is first-line for anaphylaxis?",["Antihistamines","Corticosteroids","Epinephrine","Beta-blockers"]),
  q("hc_h04","hard","text","Describe the ethical dilemma a healthcare professional faces when a competent patient refuses a life-saving blood transfusion on religious grounds and how it should be managed."),
  q("hc_h05","hard","berlitz","During a medication reconciliation for a newly admitted patient, you discover they are on warfarin, aspirin, and have just been prescribed a COX-2 inhibitor by the admitting physician.\n\nWhat is your concern and how do you address it?",["No concern — the physician has reviewed this","There is a significant drug interaction risk increasing bleeding. You document the discrepancy, consult the clinical pharmacist, and communicate the concern to the prescribing physician with evidence before the medication is dispensed","Stop all medications until a cardiologist reviews","Administer the medications as prescribed and monitor"]),
  q("hc_h06","hard","multiple_choice","What is the primary mechanism of action of heparin?",["Inhibits platelet aggregation","Activates antithrombin III to inhibit thrombin and factor Xa","Blocks vitamin K–dependent clotting factors","Dissolves existing clots"]),
];

/* ─── FINANCE / BANKING ─── */
const finance: QuizQuestion[] = [
  q("fin_e01","easy","multiple_choice","What does ROI stand for?",["Rate of Income","Return on Investment","Ratio of Interest","Revenue Output Index"]),
  q("fin_e02","easy","multiple_choice","What is the purpose of a balance sheet?",["Show cash inflows over a period","Report income and expenses","Show assets, liabilities, and equity at a point in time","Project future earnings"]),
  q("fin_e03","easy","multiple_choice","What is compound interest?",["Interest calculated only on the principal","Interest calculated on the principal plus accumulated interest","A fixed monthly fee","A penalty for late payment"]),
  q("fin_e04","easy","multiple_choice","What does 'liquidity' mean in finance?",["Profitability of an asset","Ease of converting an asset to cash without significant loss","Long-term solvency","The physical form of money"]),
  q("fin_e05","easy","multiple_choice","What is the BSP's primary mandate?",["Regulate the stock market","Supervise insurance companies","Maintain price stability and financial system soundness","Collect taxes"]),
  q("fin_e06","easy","multiple_choice","Which financial statement shows a company's revenues and expenses over a period?",["Balance sheet","Income statement","Cash flow statement","Equity statement"]),
  // MEDIUM
  q("fin_m01","medium","multiple_choice","A company has a current ratio of 0.8. What does this indicate?",["The company is highly profitable","Current liabilities exceed current assets — potential short-term liquidity risk","The company has more cash than debt","An excellent financial position"]),
  q("fin_m02","medium","text","Explain the difference between systematic and unsystematic risk in investments and how diversification addresses each."),
  q("fin_m03","medium","berlitz","A client with a moderate risk profile comes to you requesting to invest 80% of their retirement savings in a single high-yield foreign equity fund.\n\nUsing your knowledge of suitability and fiduciary duty, how do you respond?",["Process the client's request immediately — it is their money","Acknowledge the client's goals, explain the concentration risk and suitability concerns, present a diversified alternative that aligns with their risk profile, and document your advice thoroughly","Refuse to proceed without supervisor approval","Approve the transaction and note the client's insistence"],),
  q("fin_m04","medium","multiple_choice","What does EBITDA represent?",["Earnings Before Taxes, Depreciation, and Amortization","Earnings Before Interest, Taxes, Depreciation, and Amortization","Estimated Business Tax and Depreciation Allowance","Equity and Balance in Total Debt Arrangements"]),
  q("fin_m05","medium","text","Describe the five Cs of credit and how a credit analyst would use them to evaluate a loan application."),
  q("fin_m06","medium","multiple_choice","Under Basel III, what is the primary objective of the Common Equity Tier 1 (CET1) requirement?",["Increase bank profitability","Ensure banks maintain sufficient high-quality capital to absorb losses","Reduce transaction costs","Standardise accounting across banks"]),
  q("fin_m07","medium","berlitz","You are reviewing a client's loan application. Their Debt-to-Income ratio is 52% and they are requesting a mortgage equivalent to 8× their annual income. Current property values in their area are inflating rapidly.\n\nWhat credit risks do you flag and how do you proceed?",["Approve immediately — property values are rising","Flag the high DTI (above the 43% standard) and the elevated price-to-income ratio as credit risks. Present the finding to credit committee with a recommendation to either reduce the loan amount or require additional collateral, documenting your analysis","Decline without explanation","Ignore the DTI ratio since property values are rising"],),
  q("fin_m08","medium","multiple_choice","What is the primary purpose of Know Your Customer (KYC) procedures?",["Market the bank's products","Identify customer investment preferences","Prevent money laundering and fraud by verifying client identity and risk profile","Improve customer service metrics"]),
  // HARD
  q("fin_h01","hard","text","Explain how the Philippine Stock Exchange (PSE) index is calculated, and describe three macro-economic factors that significantly influence its movements."),
  q("fin_h02","hard","berlitz","Your bank's AML compliance team flags a corporate account with 47 high-value transactions in 72 hours — all just below the BSP reporting threshold. The client is a long-standing business with previously clean records.\n\nDescribe your SAR filing decision and the process you follow.","",""),
  q("fin_h03","hard","multiple_choice","In options trading, a 'put option' gives the holder the right to:",["Buy an asset at a specified price","Sell an asset at a specified price","Exchange currencies at a fixed rate","Borrow funds at a variable rate"]),
  q("fin_h04","hard","text","Discuss the impact of interest rate hikes by the Bangko Sentral ng Pilipinas on consumer credit, corporate borrowing, and the peso exchange rate."),
  q("fin_h05","hard","berlitz","A bank's model risk team discovers that the credit scoring model being used has a 14% disparate impact against a protected demographic group, even though the model performs well statistically.\n\nWhat are the regulatory and ethical implications and what steps should be taken?",["Ignore it — the model performs well statistically","Report the finding immediately, suspend the model's use for new decisions pending review, engage legal and compliance, and develop a fair lending remediation plan that meets BSP and PDIC fair-lending standards","Replace the model with a manual process temporarily","Delete the finding from the report"],),
  q("fin_h06","hard","multiple_choice","What is 'duration' in the context of fixed-income securities?",["The maturity date of a bond","A measure of a bond's price sensitivity to interest rate changes","The coupon payment frequency","The credit rating of the issuer"]),
];

/* ─── MARKETING / ADVERTISING ─── */
const marketing: QuizQuestion[] = [
  q("mkt_e01","easy","multiple_choice","What does CTR stand for in digital marketing?",["Click-Through Rate","Customer Total Revenue","Content Targeting Ratio","Campaign Tracking Result"]),
  q("mkt_e02","easy","multiple_choice","What is the primary purpose of SEO?",["Increase paid social media reach","Improve a website's organic visibility on search engines","Send email campaigns","Track TV advertising spend"]),
  q("mkt_e03","easy","multiple_choice","Which of the 4Ps of marketing refers to the amount a customer pays?",["Product","Place","Promotion","Price"]),
  q("mkt_e04","easy","multiple_choice","What does 'brand equity' mean?",["The monetary value of a brand's physical assets","The added value a brand name gives to a product","A brand's advertising budget","The number of brand employees"]),
  q("mkt_e05","easy","multiple_choice","What is a 'conversion' in digital marketing?",["Changing a campaign's target audience","A desired action completed by a user, such as a purchase or sign-up","Converting currency for international ads","Changing the ad creative"]),
  q("mkt_e06","easy","multiple_choice","Which platform primarily uses hashtags as its core discovery mechanism?",["LinkedIn","Google","Instagram","Email"]),
  // MEDIUM
  q("mkt_m01","medium","multiple_choice","What does ROAS measure?",["Return on Ad Spend","Rate of Audience Segmentation","Reach of Ad Systems","Revenue of Active Subscribers"]),
  q("mkt_m02","medium","text","Explain the difference between B2B and B2C marketing strategies and how the buyer journey differs between them."),
  q("mkt_m03","medium","berlitz","Your client's campaign shows a CTR of 4.2% (well above the industry average of 0.9%) but a conversion rate of only 0.3% (below the industry average of 2.5%).\n\nWhat does this data tell you and what recommendations do you make?",["The campaign is performing well — high CTR is enough","High CTR with low conversion indicates a disconnect between the ad and the landing page experience. Recommend a landing page audit, A/B testing of page copy and CTA, and funnel analysis to find where users are dropping off","Pause the campaign immediately","Increase the ad spend to compensate for low conversion"],),
  q("mkt_m04","medium","multiple_choice","Which email marketing metric best measures the quality of your email list and subject line effectiveness?",["Click-through rate","Bounce rate","Open rate","Unsubscribe rate"]),
  q("mkt_m05","medium","text","Describe the concept of 'customer lifetime value' (CLV) and explain how it should influence your marketing budget allocation."),
  q("mkt_m06","medium","multiple_choice","A brand's Net Promoter Score (NPS) is −15. What does this indicate?",["Strongly positive brand sentiment","More detractors than promoters — significant customer experience issues","A neutral market position","A declining social media following"]),
  q("mkt_m07","medium","berlitz","Your agency pitches a social media influencer campaign to a conservative pharmaceutical client. The influencer has 2 million followers and a 6% engagement rate but has previously made controversial health claims online.\n\nHow do you proceed?",["Sign the influencer immediately — the numbers are excellent","Flag the reputational risk to the client, conduct a thorough content audit of the influencer's history, and recommend either a different creator or a tightly controlled campaign with legal review of all content","Ignore the past content — past is past","Let the client decide without your input"],),
  q("mkt_m08","medium","multiple_choice","What is 'content marketing' primarily designed to do?",["Generate immediate direct sales","Build brand awareness and trust by providing relevant, valuable content to an audience","Replace paid advertising entirely","Increase website server speed"]),
  // HARD
  q("mkt_h01","hard","text","Design a full-funnel digital marketing strategy for a Philippine e-commerce startup entering the fashion market. Include channels, KPIs, and budget allocation rationale."),
  q("mkt_h02","hard","berlitz","A major competitor launches an aggressive price war, undercutting your client's product by 30%. Your client is a premium brand.\n\nDescribe the brand strategy you recommend and the reasoning behind it.","",""),
  q("mkt_h03","hard","multiple_choice","In programmatic advertising, what is a Demand-Side Platform (DSP) used for?",["Publishing ad inventory for sale","Allowing advertisers to buy digital ad inventory automatically across exchanges","Managing influencer contracts","Tracking in-store foot traffic"]),
  q("mkt_h04","hard","text","Explain the concept of 'attribution modeling' in digital marketing, compare first-touch and last-touch attribution, and describe which model you would recommend for a long sales-cycle B2B product."),
  q("mkt_h05","hard","berlitz","Your brand's social media account is at the center of a PR crisis after a post is misinterpreted and goes viral negatively. Thousands of angry comments are pouring in.\n\nOutline your crisis communication response in the first 2 hours.",["Delete the post and stay silent","Draft and post a sincere, specific public apology within the hour, take the original post down, brief leadership, activate crisis comms protocols, and assign a team to respond to top comments individually while monitoring sentiment","Reply to every single comment with a pre-written template","Transfer all social accounts to private temporarily"],),
  q("mkt_h06","hard","multiple_choice","What is 'market saturation' and why is it a strategic concern for brands?",["When a brand runs out of advertising budget","When a product or market reaches maximum penetration with limited room for growth, making customer acquisition costly","When competitors copy a brand's messaging","When the brand's social media reaches peak follower count"]),
];

/* ─── REAL ESTATE & CONSTRUCTION ─── */
const realestate: QuizQuestion[] = [
  q("re_e01","easy","multiple_choice","What does ROI stand for in real estate investment?",["Rate of Insurance","Return on Investment","Real Office Investment","Realty Output Index"]),
  q("re_e02","easy","multiple_choice","What is a 'title' in real estate?",["A property nickname","Legal ownership and rights to a property","The property's market value","The floor plan of a building"]),
  q("re_e03","easy","multiple_choice","What is the purpose of a property appraisal?",["To market the property","To determine the property's current market value","To calculate mortgage payments","To identify the buyer"]),
  q("re_e04","easy","multiple_choice","What does 'LTV ratio' stand for in property financing?",["Loan-to-Value ratio","Land Transfer Value","Long-Term Valuation","Lease Term Variance"]),
  q("re_e05","easy","multiple_choice","In construction, what does 'BOQ' refer to?",["Building Ownership Quota","Bill of Quantities","Build-Out Quality","Base of Quality"]),
  q("re_e06","easy","multiple_choice","What does a building permit authorise?",["Sale of a property","Legal construction or renovation in compliance with local codes","Property reclassification","Foreign ownership of land"]),
  // MEDIUM
  q("re_m01","medium","text","Describe the due diligence process a buyer should follow before purchasing a commercial property in the Philippines."),
  q("re_m02","medium","multiple_choice","Under the Philippine Condominium Act (RA 4726), who has ownership of the land in a condominium project?",["Individual unit owners","The condominium corporation in proportion to unit ownership","The developer perpetually","The local government unit"]),
  q("re_m03","medium","berlitz","A residential client shows strong interest in a 3-bedroom condo listed at ₱8.5M in a premium BGC tower. After discussing their finances, you learn they can qualify for a bank loan covering only 60% of the purchase price.\n\nHow do you guide this client?",["Tell them to take out a personal loan for the gap","Analyse the financing gap (₱3.4M equity required), discuss developer in-house financing options, compare bank vs. Pag-IBIG loan programs, and assess whether the investment aligns with their financial capacity before proceeding","Encourage them to buy despite the financing gap","Drop the client and focus on higher-budget buyers"],),
  q("re_m04","medium","multiple_choice","What is a 'defects liability period' in a construction contract?",["The period before a building permit is issued","A period after project completion during which the contractor is responsible for fixing identified defects","The warranty period for electrical fittings only","The time given to mobilise construction equipment"]),
  q("re_m05","medium","text","Explain the difference between 'wet works' and 'dry works' in construction and give two examples of each."),
  q("re_m06","medium","berlitz","You are the project manager for a mid-rise residential building. Your structural engineer informs you that the soil bearing capacity at the site is lower than the original geotechnical report indicated, requiring a redesign of the foundation.\n\nHow do you manage this situation?",["Proceed with the original design and hope for the best","Order an immediate work stoppage on the foundation, convene an emergency meeting with the structural engineer and geotechnical consultant, formally notify the owner, assess cost and schedule impact, and issue a change order after the redesign is approved","Continue construction and add more rebar","Reduce the number of floors to lessen the load without informing the owner"],),
  q("re_m07","medium","multiple_choice","Which Philippine law governs the regulation of real estate service practitioners?",["Republic Act 9646","Republic Act 7279","Presidential Decree 957","Republic Act 6552"]),
  q("re_m08","medium","multiple_choice","What is 'highest and best use' in property valuation?",["The highest floor count permitted","The most profitable, legally permissible use of a property that is physically possible and financially feasible","The most recent use of the property","The use preferred by the local government"]),
  // HARD
  q("re_h01","hard","text","Analyse the financial feasibility of a 12-storey mixed-use development in Quezon City. What key assumptions, cost components, and financial metrics would you evaluate?"),
  q("re_h02","hard","multiple_choice","Under DOLE's Department Order 174, what is the key test for determining if a contractor is engaged in permissible contracting?",["Whether the contractor has a Bureau of Internal Revenue certificate","Whether the contractor has substantial capital or investment and exercises control over the employees' means and methods","Whether the contractor has been in business for at least 3 years","Whether the principal has approved the contractor arrangement"]),
  q("re_h03","hard","berlitz","During a critical concrete pour for a high-rise transfer slab, your testing team reports that the slump test results are significantly out of specification. The concrete truck is on-site and the pour has already begun in one section.\n\nWhat do you do?",["Complete the pour to avoid delays","Immediately halt the pour, quarantine the out-of-spec batch, conduct core sample extraction for the already-poured section, notify the structural engineer and project owner, document everything, and issue a non-conformance report","Add water to the remaining concrete to improve workability","Pour the concrete and conduct destructive testing later"],),
  q("re_h04","hard","text","Describe the process and key risks involved in a real estate developer obtaining a HLURB (now DHSUD) licence to sell for a subdivision project in the Philippines."),
  q("re_h05","hard","multiple_choice","What is the primary purpose of Value Engineering in construction?",["Reducing the project team size","Increasing material costs for better quality","Systematically reviewing project functions to achieve required performance at the lowest cost","Extending the project timeline"]),
  q("re_h06","hard","multiple_choice","In the Critical Path Method (CPM) of project scheduling, a task with zero 'float' means:",["It can be delayed without affecting the project end date","Any delay to this task will directly delay the project completion date","It has already been completed","It is not on the critical path"]),
];

/* ─── MANUFACTURING & ENGINEERING ─── */
const manufacturing: QuizQuestion[] = [
  q("mfg_e01","easy","multiple_choice","What does 'OEE' stand for in manufacturing?",["Overall Equipment Efficiency","Operational Engine Effectiveness","Output Evaluation Engine","Overall Engineering Excellence"]),
  q("mfg_e02","easy","multiple_choice","What is the purpose of a P&ID drawing?",["Show the exterior design of a plant","Illustrate piping, instrumentation, and process flow relationships","Outline the HR structure of a facility","Detail the electrical wiring layout"]),
  q("mfg_e03","easy","multiple_choice","What does '5S' methodology stand for?",["Sort, Set, Shine, Standardise, Sustain","Safety, Speed, Skill, Specification, System","Sort, Scan, Sequence, Schedule, Submit","Scale, Survey, Standardise, Secure, Sustain"]),
  q("mfg_e04","easy","multiple_choice","What is the function of a PLC in an automated manufacturing line?",["Power supply unit for heavy equipment","Programmable Logic Controller — controls automated processes","Pressure and Load Calibrator","Production Lifecycle Counter"]),
  q("mfg_e05","easy","multiple_choice","What does 'tolerance' mean in engineering drawings?",["The maximum load a material can bear","The permissible variation from a specified dimension","The surface finish of a machined part","The estimated project cost"]),
  q("mfg_e06","easy","multiple_choice","What is a Gantt chart used for in manufacturing projects?",["Displaying equipment specifications","Scheduling and tracking project tasks over time","Calculating material costs","Measuring product quality"]),
  // MEDIUM
  q("mfg_m01","medium","multiple_choice","In Six Sigma, what does DMAIC stand for?",["Define, Measure, Analyse, Improve, Control","Design, Monitor, Assess, Implement, Close","Direct, Manage, Audit, Inspect, Correct","Define, Map, Allocate, Integrate, Check"]),
  q("mfg_m02","medium","text","Explain the difference between preventive maintenance and predictive maintenance and the advantages of each approach."),
  q("mfg_m03","medium","berlitz","Your production line is producing 3% defective units — up from the baseline of 0.8%. The line has been running for 6 hours. A large customer order is due in 18 hours.\n\nDescribe your root cause analysis approach and the decision you make about the order.",["Continue production and sort defects at the end","Stop the line immediately to conduct root cause analysis using an Ishikawa diagram and 5-Why method, quarantine in-process output, assess if the root cause can be fixed in time to meet the order, and communicate proactively to the customer if the timeline is at risk","Ship the order with the defective units","Reduce the quality spec temporarily to meet the order"],),
  q("mfg_m04","medium","multiple_choice","What is the purpose of a FMEA (Failure Mode and Effects Analysis)?",["Evaluate employee performance","Identify potential failure modes, their effects, and risk priority numbers before they occur","Calculate the cost of raw materials","Schedule machine downtime"]),
  q("mfg_m05","medium","text","Describe the concept of 'line balancing' in manufacturing and the steps you would take to improve a bottlenecked assembly line."),
  q("mfg_m06","medium","multiple_choice","What does 'Poka-Yoke' mean?",["A Japanese quality ceremony","An error-proofing device or process that prevents defects","A production scheduling system","A type of welding technique"]),
  q("mfg_m07","medium","berlitz","A safety audit reveals that the lockout/tagout (LOTO) procedure is not being consistently followed during machine maintenance on the night shift.\n\nAs the safety officer, what actions do you take?",["Issue a memo and move on","Issue an immediate stop-work order for all machine maintenance, conduct emergency LOTO refresher training for the night shift, investigate whether any unsafe maintenance was performed, and implement a reinforced compliance monitoring plan","Report the finding in the next quarterly report","Only address the individuals directly observed non-compliant"],),
  q("mfg_m08","medium","multiple_choice","In lean manufacturing, 'Muda' refers to:",["A Japanese management certification","Any activity that consumes resources without adding value (waste)","A production target-setting process","An equipment calibration standard"]),
  // HARD
  q("mfg_h01","hard","text","Design a quality management framework for a Philippine electronics manufacturer exporting to the EU, including relevant standards, inspection stages, and corrective action processes."),
  q("mfg_h02","hard","berlitz","Your facility has just received a customer complaint claiming that a batch of 50,000 units delivered last month may have a critical safety defect. Your internal test records show the batch passed QC at the time of shipment.\n\nOutline your product recall assessment and containment process.","",""),
  q("mfg_h03","hard","multiple_choice","In thermodynamics, the Second Law states that:",["Energy is neither created nor destroyed","Entropy of an isolated system always increases over time","Work equals force times distance","Power equals energy divided by time"]),
  q("mfg_h04","hard","text","Explain the concept of Overall Equipment Effectiveness (OEE), how it is calculated, and how you would use it to prioritise a maintenance improvement programme."),
  q("mfg_h05","hard","berlitz","You are an industrial engineer tasked with reducing the cycle time of a final assembly station from 45 seconds to 30 seconds to meet a new production rate. The current station has 8 tasks with times ranging from 3 to 12 seconds.\n\nDescribe your approach.","",""),
  q("mfg_h06","hard","multiple_choice","What is the primary advantage of Just-In-Time (JIT) inventory management?",["Ensures maximum stock availability","Reduces inventory carrying costs and waste by receiving materials only when needed","Simplifies supplier relationships","Increases warehouse capacity"]),
];

/* ─── RETAIL & E-COMMERCE ─── */
const retail: QuizQuestion[] = [
  q("ret_e01","easy","multiple_choice","What does 'GMV' stand for in e-commerce?",["Gross Merchandise Volume","General Market Value","Guaranteed Monthly Volume","Gross Margin Value"]),
  q("ret_e02","easy","multiple_choice","What is a planogram?",["A store profit graph","A visual diagram of product placement on retail shelves","A loyalty programme document","An inventory order form"]),
  q("ret_e03","easy","multiple_choice","What does 'SKU' stand for?",["Stock Keeping Unit","Sales Key Utility","Standard Kiosk Unit","Shop Keep Update"]),
  q("ret_e04","easy","multiple_choice","What is 'shrinkage' in retail?",["Products on clearance sale","Inventory loss due to theft, damage, or administrative error","Product downsizing by a supplier","Seasonal sales decline"]),
  q("ret_e05","easy","multiple_choice","What does 'conversion rate' mean in a physical retail context?",["Percentage of visitors who make a purchase","Exchange rate for foreign transactions","Return rate of purchased items","Percentage of items on promotion"]),
  q("ret_e06","easy","multiple_choice","What is the purpose of a 'loyalty programme'?",["Attract one-time shoppers","Incentivise repeat purchases and deepen customer relationships","Replace in-store staff","Reduce advertising spend"]),
  // MEDIUM
  q("ret_m01","medium","berlitz","Your online store's cart abandonment rate has jumped from 65% to 82% this month coinciding with the addition of a new mandatory account creation step at checkout.\n\nWhat do you diagnose and what actions do you recommend?",["Cart abandonment is normal — do nothing","The mandatory account creation step is creating friction at the highest-intent moment of the purchase journey. Recommend a guest checkout option, test a 'save for later' prompt, and A/B test checkout flow variants to recover conversion","Remove the account creation feature permanently","Offer discounts to reduce abandonment"],),
  q("ret_m02","medium","multiple_choice","What does 'same-store sales growth' (SSSG) measure?",["Total revenue from all stores","Revenue growth from stores open for at least one year, excluding new store openings","Gross margin improvement per store","Foot traffic increase across the entire chain"]),
  q("ret_m03","medium","text","Describe the key differences between category management and brand management in retail and the role each plays in driving sales performance."),
  q("ret_m04","medium","multiple_choice","A fashion retailer has an inventory turnover ratio of 2× versus an industry average of 5×. What does this indicate?",["The retailer is selling products faster than competitors","The retailer is holding inventory too long — risk of markdowns and obsolescence","The retailer has too little inventory","A positive sign of demand for their products"]),
  q("ret_m05","medium","text","Explain omnichannel retailing and describe how a brick-and-mortar retailer in the Philippines would design an omnichannel strategy."),
  q("ret_m06","medium","berlitz","A supplier informs you of a 6-week lead time extension on your top 20 best-selling SKUs due to a production disruption. Your stock covers only 3 weeks of demand.\n\nWhat is your immediate supply chain response?",["Wait and see if the situation resolves","Activate your contingency sourcing plan: identify alternative suppliers, adjust reorder points, communicate projected stock-outs to sales and marketing, explore cross-docking from other regional warehouses, and update customer-facing ETAs on the website","Cancel all customer orders","Run a flash sale to deplete existing stock quickly"],),
  q("ret_m07","medium","multiple_choice","What is 'markdown optimisation' in retail merchandising?",["Reducing staff to cut costs","Strategically timing and sizing price reductions to maximise sell-through while protecting margins","Marking up prices to create sale illusions","Removing slow-moving products from the floor plan"]),
  q("ret_m08","medium","multiple_choice","In e-commerce, what does 'LTV:CAC ratio' measure?",["Website loading speed vs. cart abandonment","Customer lifetime value relative to customer acquisition cost — a key measure of business sustainability","Revenue per listing vs. ad cost","Loyalty points earned vs. spent"]),
  // HARD
  q("ret_h01","hard","text","A Philippine fashion e-commerce brand wants to expand into the Indonesian market. Describe the key market entry considerations, localisation requirements, and operational challenges they will face."),
  q("ret_h02","hard","berlitz","Your retail chain's data shows that 15% of your product range accounts for 80% of your revenue (a Pareto distribution). However, the bottom 40% of your range contributes only 3% of revenue but consumes 45% of your warehouse space.\n\nDesign a product range rationalisation strategy.","",""),
  q("ret_h03","hard","multiple_choice","What is 'dynamic pricing' in e-commerce?",["Pricing based on customer segment only","Adjusting prices in real-time based on demand, competitor prices, inventory levels, and other market signals","Setting a permanent promotional price","Offering different prices in different store locations"]),
  q("ret_h04","hard","text","Discuss the key financial and operational metrics you would track to assess the health of a multi-location retail chain in the Philippines, and explain why each matters."),
  q("ret_h05","hard","berlitz","Your e-commerce platform experiences a major outage during the 11.11 sale — your highest-revenue day of the year. The outage lasts 3 hours at peak traffic.\n\nDescribe your incident response, customer communication plan, and post-event analysis.",["Wait for IT to resolve it and send one apology email","Activate the incident response plan: publish a status page update within 15 minutes, communicate via email and social media with honest ETAs, extend the sale period by the duration of the outage, issue goodwill vouchers, conduct a post-incident review covering technical root cause and business impact quantification"],),
  q("ret_h06","hard","multiple_choice","What is 'demand sensing' in supply chain management?",["Measuring customer complaints in real time","Using short-term data signals (POS, social trends, weather) to improve near-term demand forecasting accuracy","Tracking supplier delivery performance","Monitoring warehouse picking rates"]),
];

/* ─── EDUCATION & TRAINING ─── */
const education: QuizQuestion[] = [
  q("edu_e01","easy","multiple_choice","What does 'IEP' stand for in special education?",["Integrated Education Plan","Individualised Education Program","Instructional Engagement Procedure","Internal Evaluation Protocol"]),
  q("edu_e02","easy","multiple_choice","What is Bloom's Taxonomy primarily used for?",["Classifying student demographics","A framework for categorising educational learning objectives","Scheduling school calendars","Measuring teacher performance"]),
  q("edu_e03","easy","multiple_choice","What does 'formative assessment' refer to?",["End-of-year examination","Ongoing assessment used to monitor learning and provide feedback during instruction","Assessment of teacher performance","School accreditation audit"]),
  q("edu_e04","easy","multiple_choice","In the context of Philippine education, what does DepEd stand for?",["Department of Economic Development","Department of Education","Division of Educational Delivery","Department of Equity Development"]),
  q("edu_e05","easy","multiple_choice","What is the primary goal of differentiated instruction?",["Teach all students the same content at the same pace","Tailor teaching methods and content to meet diverse student needs and learning styles","Reduce the number of subjects taught","Standardise classroom assessment"]),
  q("edu_e06","easy","multiple_choice","What does 'metacognition' mean in educational psychology?",["Learning through memorisation","Thinking about one's own thinking and learning process","Group-based collaborative learning","Technology-assisted instruction"]),
  // MEDIUM
  q("edu_m01","medium","berlitz","A student in your Grade 7 class consistently disengages during group activities, scoring well on individual written tests but barely participating in discussions. Other students have started excluding them.\n\nHow do you address this holistically?",["Give the student a failing participation grade","Observe and assess whether the student may have social anxiety or communication difficulties. Implement differentiated participation strategies (e.g., written discussion contributions), speak privately with the student, involve the guidance counsellor, and inform the parents","Assign the student to a different class","Ignore it — academic performance is the priority"],),
  q("edu_m02","medium","text","Describe the key principles of the K–12 curriculum framework in the Philippines and how it differs from the previous 10-year basic education system."),
  q("edu_m03","medium","multiple_choice","Which learning theory emphasises that students construct their own knowledge through experience rather than passive reception?",["Behaviourism","Cognitivism","Constructivism","Humanism"]),
  q("edu_m04","medium","text","Design a lesson plan outline for a 60-minute Grade 10 English class on persuasive writing. Include learning objectives, activities, and assessment methods."),
  q("edu_m05","medium","berlitz","A parent contacts you demanding that their child's failing grade be changed, claiming the test was unfair and threatening to escalate to the principal.\n\nHow do you handle this professionally?",["Change the grade to avoid conflict","Respond calmly and professionally. Invite the parent for a meeting, present the assessment criteria and the student's work, listen to their concerns, and if the test was fair and valid, maintain the grade while offering additional academic support pathways. Document the interaction.","Refer immediately to the principal without speaking to the parent","Apologise and offer to let the student retake with easier questions"],),
  q("edu_m06","medium","multiple_choice","What is the purpose of a 'rubric' in assessment?",["Timing student activities","A scoring guide that describes performance expectations at each level","A grading curve formula","A student self-reflection tool"]),
  q("edu_m07","medium","text","Explain how technology integration in classrooms (ed-tech) can both enhance and hinder the learning experience. Support your answer with specific examples."),
  q("edu_m08","medium","multiple_choice","In corporate training design, what does 'ADDIE' stand for?",["Assess, Develop, Design, Implement, Evaluate","Analyse, Design, Develop, Implement, Evaluate","Apply, Determine, Deliver, Improve, Engage","Assess, Define, Develop, Instruct, Evaluate"]),
  // HARD
  q("edu_h01","hard","text","Critically evaluate the effectiveness of the MTB-MLE (Mother Tongue-Based Multilingual Education) policy in the Philippines and its impact on student outcomes in early grade reading."),
  q("edu_h02","hard","berlitz","Your school's Grade 6 reading proficiency scores have declined 18 percentage points over 3 years. You have been appointed as the literacy programme coordinator.\n\nDesign a data-driven intervention plan.",["Blame the teachers and issue warnings","Conduct a root cause analysis using achievement data, classroom observations, and stakeholder interviews. Design a structured literacy programme, provide targeted professional development for teachers, implement early identification processes for struggling readers, and establish monthly progress monitoring with a clear improvement target and timeline.","Increase homework requirements","Purchase new textbooks"],),
  q("edu_h03","hard","multiple_choice","Vygotsky's 'Zone of Proximal Development' (ZPD) is best described as:",["The student's maximum achievable score without help","The range of tasks a student cannot do independently but can accomplish with appropriate teacher or peer support","The student's comfort zone in learning","The ideal classroom seating arrangement for learning"]),
  q("edu_h04","hard","text","Design a professional development programme for a school whose teachers show low digital literacy. Include needs assessment, content, delivery mode, and success metrics."),
  q("edu_h05","hard","berlitz","A gifted Grade 9 student has been consistently performing 2 grade levels above peers. Parents are requesting acceleration (grade-skipping). The student shows social-emotional maturity concerns noted by the guidance counsellor.\n\nHow do you advise the school administration?",["Approve the acceleration — academic ability should be the only criteria","Conduct a comprehensive assessment covering academic readiness, social-emotional maturity, and the student's own preference. Present a differentiated option (enrichment, subject-level acceleration) as an alternative to full grade-skipping if social-emotional concerns are significant. Involve parents, guidance counsellor, and teachers in the decision.","Deny the request without assessment","Ask the student to decide on their own"],),
  q("edu_h06","hard","multiple_choice","Which international large-scale assessment measures reading, mathematics, and science literacy of 15-year-old students and includes the Philippines?",["TIMSS","PIRLS","PISA","NAEP"]),
];

/* ─── HOSPITALITY & TOURISM ─── */
const hospitality: QuizQuestion[] = [
  q("hosp_e01","easy","multiple_choice","What does 'RevPAR' stand for in hotel management?",["Revenue Per Available Room","Reservation Per Average Rate","Revenue Prediction And Reporting","Rooms Evaluated Per Annual Review"]),
  q("hosp_e02","easy","multiple_choice","What is the standard check-in time at most hotels?",["10:00 AM","12:00 PM","2:00 PM","6:00 PM"]),
  q("hosp_e03","easy","multiple_choice","What is a 'mise en place' in food and beverage service?",["A French dessert","Everything in its place — the preparation and organisation done before service begins","A type of menu format","A kitchen safety protocol"]),
  q("hosp_e04","easy","multiple_choice","What does 'OTA' stand for in the hospitality industry?",["Official Tourism Authority","Online Travel Agency","Occupancy Trend Analysis","On-Time Arrival"]),
  q("hosp_e05","easy","multiple_choice","What is 'upselling' in a hotel context?",["Selling hotel services at a discount","Encouraging guests to purchase a more expensive room or add-on services","Moving a guest to a lower room category","Selling items from the minibar"]),
  q("hosp_e06","easy","multiple_choice","What does HACCP stand for in food service?",["Hazard Analysis and Critical Control Points","Health and Catering Compliance Protocol","Hygiene Assessment and Culinary Control Procedures","High-Accuracy Cooking and Cleaning Principles"]),
  // MEDIUM
  q("hosp_m01","medium","berlitz","A VIP guest calls the front desk at 11 PM to complain that the air conditioning in their suite is noisy and they cannot sleep. All suite upgrades are occupied. The guest has a 7 AM departure.\n\nHow do you handle this?",["Apologise and say there is nothing you can do tonight","Apologise sincerely, send engineering immediately to assess the AC unit, offer a complimentary room move to the best available room type, provide a late check-out or early wake-up call, and follow up with a handwritten note and amenity. Document the incident for the morning manager.","Tell the guest to use earplugs","Offer a full refund for their stay"],),
  q("hosp_m02","medium","multiple_choice","What is 'yield management' in hospitality?",["Managing food and beverage costs","Strategically adjusting room rates based on demand to maximise revenue","Measuring staff productivity","Tracking guest satisfaction scores"]),
  q("hosp_m03","medium","text","Describe the key differences between transient, group, and contract business segments in hotel sales and how you would balance them to optimise occupancy and revenue."),
  q("hosp_m04","medium","multiple_choice","A restaurant's food cost percentage is 38% against an industry benchmark of 28–32%. What is the likely implication?",["The restaurant is exceptionally profitable","The restaurant may have issues with over-portioning, food waste, theft, or poor procurement — margins are being compressed","The restaurant is priced too low","The restaurant has very high labour costs"]),
  q("hosp_m05","medium","text","Explain the role of the Department of Tourism (DOT) in accrediting tourism enterprises in the Philippines and why accreditation matters to operators."),
  q("hosp_m06","medium","berlitz","A negative TripAdvisor review with 2 stars from a high-profile guest complains about poor check-in experience, dirty bathroom, and dismissive staff. The review has 500 views in 24 hours.\n\nCompose the hotel's public response and describe the internal follow-up.","",""),
  q("hosp_m07","medium","multiple_choice","What is 'GDS' in hotel distribution?",["Guest Data System","Global Distribution System — technology connecting hotels to travel agents worldwide","General Department Standards","Group Discount Structure"]),
  q("hosp_m08","medium","multiple_choice","What is the 'mystery guest' programme used for in hospitality?",["Tracking unregistered guests","An anonymous quality audit where trained evaluators assess service standards as real guests","A loyalty programme for frequent travellers","A security screening protocol"]),
  // HARD
  q("hosp_h01","hard","text","Design a comprehensive revenue management strategy for a 200-room business hotel in Makati that wants to grow RevPAR by 15% over 12 months."),
  q("hosp_h02","hard","berlitz","Your resort in Palawan receives a call from a news channel requesting comment on a social media video that shows a guest's reef snorkelling tour causing visible coral damage by participants standing on the reef. The video has 80,000 views.\n\nOutline your crisis and sustainability response.",["Deny the incident","Issue a statement acknowledging the incident, suspend the tour offering pending a full environmental impact review, cooperate with DENR and local LGU, commit to retraining guides on eco-tourism protocols, and launch a reef restoration fund initiative. Engage the media proactively with specific commitments and a timeline."],),
  q("hosp_h03","hard","multiple_choice","Under the New Tourism Act (RA 9593), what is the primary mandate of the Tourism Infrastructure and Enterprise Zone Authority (TIEZA)?",["Promote Philippine destinations internationally","Develop, manage, and supervise tourism enterprise zones and tourism infrastructure","Regulate tour guides and travel agencies","Issue permits for eco-tourism activities"]),
  q("hosp_h04","hard","text","Analyse the impact of online travel agencies (OTAs) like Booking.com and Agoda on independent hotel operators in the Philippines and the strategies available to reduce OTA commission dependency."),
  q("hosp_h05","hard","berlitz","Your 5-star hotel is hosting a major international conference for 800 delegates. On Day 1 of the 3-day event, the main conference hall A/V system fails 2 hours before the opening keynote.\n\nDescribe your emergency contingency and event recovery plan.","",""),
  q("hosp_h06","hard","multiple_choice","In hospitality finance, what does 'ADR' measure?",["Annual Department Revenue","Average Daily Rate — calculated by dividing room revenue by the number of rooms sold","Annual Development Ratio","Average Discount Rate"]),
];

/* ─── FOOD & BEVERAGE ─── */
const foodbev: QuizQuestion[] = [
  q("fb_e01","easy","multiple_choice","What temperature range is considered the 'danger zone' for food safety?",["0°C – 5°C","5°C – 60°C","60°C – 100°C","−18°C – 0°C"]),
  q("fb_e02","easy","multiple_choice","What does FIFO stand for in food storage?",["First In, First Out","Frozen Items First Out","Fresh Inventory Filing Order","Facility Inspection Form Output"]),
  q("fb_e03","easy","multiple_choice","What is the Maillard reaction?",["Caramelisation of sugars","A chemical reaction between amino acids and reducing sugars that gives browned food its characteristic flavour","The process of pasteurisation","The emulsification of fats"]),
  q("fb_e04","easy","multiple_choice","What does 'par stock' mean in food and beverage operations?",["The minimum amount of stock needed to meet expected demand between deliveries","The maximum storage capacity of a kitchen","A type of pasta dish","A food grading standard"]),
  q("fb_e05","easy","multiple_choice","What is a 'mise en place' in culinary terms?",["A French dessert","The preparation and organisation of ingredients and equipment before cooking","A kitchen layout design","A type of sauce"]),
  q("fb_e06","easy","multiple_choice","Which government agency in the Philippines regulates food safety standards?",["DOLE","DENR","FDA (Food and Drug Administration)","DTI"]),
  // MEDIUM
  q("fb_m01","medium","text","Describe the key responsibilities of an Executive Chef in managing a hotel restaurant's kitchen operations, team, and food cost."),
  q("fb_m02","medium","berlitz","During dinner service, a customer returns a dish claiming it is undercooked and makes them feel ill. They are visibly distressed and other nearby diners are watching.\n\nHow do you manage this situation?",["Defend the kitchen's cooking standards publicly","Immediately apologise and remove the dish, take the guest to a quieter area, assess if they need medical attention, offer to replace the meal or provide a full refund, and document the complaint for kitchen review. Follow up with the kitchen team on cooking temperatures post-service.","Ask the guest to prove the food was undercooked","Offer a small discount and return the dish to the kitchen to reheat"],),
  q("fb_m03","medium","multiple_choice","What is 'food cost percentage' and how is it calculated?",["Total revenue divided by number of dishes sold","Cost of food sold divided by food revenue, multiplied by 100","Labour cost divided by food sold","Waste cost divided by total inventory"]),
  q("fb_m04","medium","text","Explain the concept of 'farm-to-table' and discuss the operational challenges of implementing this sourcing strategy in a Philippine restaurant."),
  q("fb_m05","medium","berlitz","A food safety audit reveals your cold storage unit has been operating at 8°C for an estimated 6 hours. It contains dairy products, raw poultry, and cooked items.\n\nWhat is your immediate action?",["Lower the temperature setting and monitor","Immediately quarantine all affected items, assess each product based on the time-temperature abuse and food type (raw poultry and cooked items must be disposed of if in the danger zone for more than 2 hours), document the incident, investigate the equipment failure, and notify your food safety officer","Continue service and dispose of unsold items at closing","Check one item per category and assume the rest are safe"],),
  q("fb_m06","medium","multiple_choice","What is a 'menu engineering' matrix used for?",["Designing the physical layout of menus","Categorising menu items by popularity and profitability to guide pricing and promotion decisions","Tracking server performance","Scheduling kitchen prep work"]),
  q("fb_m07","medium","multiple_choice","What does COGS stand for in F&B financial management?",["Cost of Goods Sold","Count of Guest Servings","Cost of General Service","Calculation of Gross Sales"]),
  q("fb_m08","medium","text","Describe the role of allergen management in a restaurant and the key processes a kitchen team should follow to prevent cross-contamination for guests with severe allergies."),
  // HARD
  q("fb_h01","hard","text","Design a cost reduction plan for a restaurant chain whose food cost has risen to 42% against a target of 30%. Address procurement, portion control, waste, and menu strategy."),
  q("fb_h02","hard","berlitz","Your flagship restaurant has received a formal complaint filed with the FDA claiming a guest contracted Salmonella after dining with you. The FDA is requesting records of your suppliers, temperatures logs, and staff health records for the past 30 days.\n\nHow do you respond and manage this crisis?","",""),
  q("fb_h03","hard","multiple_choice","What is the primary function of 'transglutaminase' in modern culinary applications?",["A natural sweetener","An enzyme used to bind proteins together, commonly used in molecular gastronomy","A preservative for cured meats","A thickening agent for sauces"]),
  q("fb_h04","hard","text","Discuss how a Philippine F&B business should structure its pricing strategy when input costs (ingredients, utilities, labour) are rising by 15% annually while competitors are discounting."),
  q("fb_h05","hard","berlitz","You are opening a new casual dining concept in a high-footfall mall in Metro Manila. The location has high rent (₱350/sqm/month) and a target of 200 covers per day at an average spend of ₱450 per head.\n\nConduct a basic break-even analysis and identify your key financial risks.",["This is a management concern — I focus on cooking","Calculate monthly revenue (200 covers × ₱450 × 30 days = ₱2.7M), estimate fixed costs (rent, labour, overheads), apply a target food cost of 30% (₱810K) and identify break-even covers per day. Flag key risks: cover count shortfall, high rent-to-revenue ratio, and delivery platform cannibalisation."],),
  q("fb_h06","hard","multiple_choice","What is 'sous vide' cooking?",["A French term for high-heat grilling","Cooking vacuum-sealed food in a precisely controlled water bath at low temperature over extended time","A dehydration technique for fruits","A method of flash-freezing proteins"]),
];

/* ─── CREATIVE ARTS & DESIGN ─── */
const creative: QuizQuestion[] = [
  q("cre_e01","easy","multiple_choice","What does RGB stand for?",["Red, Green, Blue","Red, Grey, Brown","Render, Grade, Build","Resolution, Gradient, Brightness"]),
  q("cre_e02","easy","multiple_choice","What is the 'golden ratio' in design?",["A colour system based on gold tones","A mathematical ratio (~1.618) used to create aesthetically pleasing proportions","A print resolution standard","The ratio of white space to content on a page"]),
  q("cre_e03","easy","multiple_choice","What does 'kerning' refer to in typography?",["The weight of a typeface","The space between individual characters","The height of uppercase letters","The line spacing between paragraphs"]),
  q("cre_e04","easy","multiple_choice","What does SVG stand for in web design?",["Standard Vector Graphic","Scalable Vector Graphics","Styled Visual Grid","Static Visual Guide"]),
  q("cre_e05","easy","multiple_choice","What is the primary difference between raster and vector graphics?",["Raster is web-only; vector is print-only","Raster images are made of pixels and lose quality when scaled; vector graphics are mathematically defined and scale without quality loss","Raster files are smaller than vector files","Vector graphics cannot display photographs"]),
  q("cre_e06","easy","multiple_choice","What does 'CMYK' stand for in print design?",["Cyan, Magenta, Yellow, Key (Black)","Colour Mode Yellow Key","Cyan, Magenta, Yellow, Khaki","Contrast, Mix, Yellow, Key"]),
  // MEDIUM
  q("cre_m01","medium","text","Describe the UX design process from user research to final delivery. What tools and methods would you use at each stage?"),
  q("cre_m02","medium","berlitz","A client reviews your logo designs and asks you to 'make it pop more and use more colours.' The brief specified a minimalist, premium brand identity.\n\nHow do you respond professionally?",["Add more colours to satisfy the client immediately","Acknowledge the client's desire for more impact, present the brand brief rationale for restraint, show alternative solutions within the minimal framework (e.g., bold typography, strategic colour use), and explain how adding complexity may undermine the premium positioning they approved","Redesign entirely with maximum colour","Tell the client their taste is wrong"],),
  q("cre_m03","medium","multiple_choice","What is 'negative space' in design?",["Unused budget in a design project","The empty space around and between subjects that helps define and emphasise the main elements","Colours with dark tones","A layout error where content is missing"]),
  q("cre_m04","medium","text","Explain the concept of 'visual hierarchy' and describe how you would apply it in designing a mobile app homepage."),
  q("cre_m05","medium","berlitz","You receive the final set of print-ready files from a client. Upon reviewing the PDFs, you notice the file is in RGB colour mode and the resolution is 72 DPI — both incorrect for commercial printing.\n\nHow do you proceed?",["Send it to the printer as-is and hope for the best","Inform the client of the technical issues immediately, explain that RGB will cause colour shifts in print and 72 DPI will result in blurry output. Request corrected files or offer to convert with a disclaimer about potential colour shifts from RGB-to-CMYK conversion, and adjust the delivery timeline accordingly.","Convert the files yourself without telling the client","Cancel the print job"],),
  q("cre_m06","medium","multiple_choice","In UI design, what does 'affordance' mean?",["The cost of a design element","The visual property of an element that suggests how it should be used (e.g., a button that looks pressable)","The font size used in a mobile interface","The accessibility rating of an app"]),
  q("cre_m07","medium","text","Compare traditional graphic design workflows with modern digital-first design workflows, including tools, collaboration methods, and client presentation."),
  q("cre_m08","medium","multiple_choice","What is an 'A/B test' in digital design?",["Testing two different fonts in a logo","Comparing two design variants with real users to determine which performs better","An accessibility compliance check","A print colour proof process"]),
  // HARD
  q("cre_h01","hard","text","Design a complete brand identity system for a Philippine fintech startup targeting millennials. Include logo rationale, colour palette, typography, and tone of voice guidelines."),
  q("cre_h02","hard","berlitz","Your agency has just won a pitch for a major government public health campaign. The campaign must reach audiences across Luzon, Visayas, and Mindanao including rural areas with low digital access.\n\nDesign the multi-channel communications strategy.","",""),
  q("cre_h03","hard","multiple_choice","What is 'atomic design' methodology in UI development?",["A physics-based animation system","A design system framework that builds interfaces from smallest reusable components (atoms) up to full pages","A minimalist design style","A method for rapid prototyping using paper"]),
  q("cre_h04","hard","text","Explain how WCAG 2.1 accessibility guidelines affect UI/UX design decisions. Provide specific examples of how you would design an accessible digital product."),
  q("cre_h05","hard","berlitz","Your creative agency delivers a campaign that your client later discovers closely resembles an international campaign from a competitor brand — raising intellectual property concerns.\n\nHow do you manage this professionally and legally?","",""),
  q("cre_h06","hard","multiple_choice","In motion design, what is the '12 Principles of Animation' framework originally developed by?",["Adobe Systems","Pixar's research division","Disney animators Frank Thomas and Ollie Johnston","ILM (Industrial Light & Magic)"]),
];

/* ─── LOGISTICS & TRANSPORTATION ─── */
const logistics: QuizQuestion[] = [
  q("log_e01","easy","multiple_choice","What does '3PL' stand for?",["Three-Party Logistics","Third-Party Logistics","Triple-Product Line","Three-Point Logistics"]),
  q("log_e02","easy","multiple_choice","What is 'lead time' in supply chain?",["The time to train a new logistics employee","The total time from placing an order to receiving the goods","The delay caused by road traffic","The time a shipment spends at customs"]),
  q("log_e03","easy","multiple_choice","What does 'FOB' stand for in shipping?",["Forward Order Booking","Free on Board","Freight on Bill","Final Order Batch"]),
  q("log_e04","easy","multiple_choice","What is 'dwell time' at a port?",["Time for customs clearance documentation","The time a container spends at the port terminal beyond what is necessary","The duration of a ship voyage","Time taken to load a vessel"]),
  q("log_e05","easy","multiple_choice","What is a 'Bill of Lading'?",["A customs declaration form","A legal document between a shipper and carrier describing cargo and shipment terms","An invoice for warehouse storage","A freight insurance certificate"]),
  q("log_e06","easy","multiple_choice","What does FIFO mean in warehouse management?",["First In, First Out","Freight In, Freight Out","Full Inventory For Operations","Fast In, Final Out"]),
  // MEDIUM
  q("log_m01","medium","text","Describe the key components of an effective last-mile delivery strategy in Metro Manila, considering traffic congestion and the growing e-commerce market."),
  q("log_m02","medium","berlitz","Your warehouse team informs you that a major FMCG client's shipment of 200 pallets must be dispatched by 5 PM today for a supermarket promotional event. At 2 PM, your loading dock conveyor breaks down with 80 pallets still to be processed.\n\nHow do you respond?",["Accept the delay and inform the client after 5 PM","Activate contingency: deploy manual loading teams immediately, call for additional staffing, assess which pallets are highest priority for the event, coordinate with the transport team for phased dispatching, inform the client of the situation and revised commitment proactively","Wait for the maintenance team to arrive","Cancel the dispatch and reschedule"],),
  q("log_m03","medium","multiple_choice","What is the 'bullwhip effect' in supply chain management?",["The cracking sound of warehouse equipment","The phenomenon where small fluctuations in consumer demand cause increasingly large swings in upstream supply chain orders","A type of shipment tracking error","Damage to goods during transit"],),
  q("log_m04","medium","text","Explain the key differences between Full Truckload (FTL) and Less-than-Truckload (LTL) shipping and the factors that determine which is more cost-effective."),
  q("log_m05","medium","berlitz","A critical shipment of pharmaceutical goods requiring cold-chain (2–8°C) has arrived at your facility and the temperature logger shows it exceeded 12°C for 3 hours during transit.\n\nWhat is your protocol?",["Accept the shipment and re-cool it","Reject the shipment or quarantine it immediately, notify the pharmaceutical client and carrier, document the cold-chain deviation with the logger data, conduct a quality investigation with the carrier's routing data, and assess with the client whether the product can be tested and salvaged or must be destroyed per regulatory guidelines","Accept the shipment and inform the client later","Re-cool and ship without informing the client"],),
  q("log_m06","medium","multiple_choice","What is 'cross-docking' in warehouse operations?",["Loading goods from one country to another","A method where incoming goods are transferred directly to outbound transport with minimal storage","A quality inspection technique","A dock management software"],),
  q("log_m07","medium","multiple_choice","What does 'COGS' represent in logistics financial management?",["Cost of Goods Sold","Count of Goods Shipped","Containerised Order Grouping System","Carrier Operations Global Standard"]),
  q("log_m08","medium","text","Describe the roles and responsibilities of a customs broker in Philippine import/export operations."),
  // HARD
  q("log_h01","hard","text","Design an end-to-end supply chain network for a Philippine consumer goods company wanting to distribute to Tier 2 cities in Mindanao. Address infrastructure, cost, and risk."),
  q("log_h02","hard","berlitz","Your international freight client has cargo stuck at Manila port for 14 days due to a documentation discrepancy identified by Bureau of Customs. Demurrage charges are accumulating at $500/day.\n\nOutline your escalation and resolution strategy.","",""),
  q("log_h03","hard","multiple_choice","In the context of the Incoterms 2020 rules, who bears the risk of loss under a 'CIF' (Cost, Insurance, Freight) arrangement once goods are loaded on the vessel?",["The seller until the buyer's port","The buyer — risk transfers when goods are loaded on the vessel at the origin port","The insurer during the voyage","The freight forwarder"]),
  q("log_h04","hard","text","Analyse the impact of the TRAIN Law and the updated excise tax structure on logistics operations and landed costs for imported goods in the Philippines."),
  q("log_h05","hard","berlitz","You are the supply chain manager during a port strike affecting Manila's international port for an estimated 10 days. You have 15 containers of raw materials in transit critical to production.\n\nDescribe your diversion and contingency strategy.","",""),
  q("log_h06","hard","multiple_choice","What is the Incoterm where the seller bears maximum risk and responsibility?",["EXW (Ex Works)","DAP (Delivered at Place)","DDP (Delivered Duty Paid)","FCA (Free Carrier)"]),
];

/* ─── TELECOMMUNICATIONS ─── */
const telecom: QuizQuestion[] = [
  q("tel_e01","easy","multiple_choice","What does LTE stand for in mobile networks?",["Local Terminal Extension","Long-Term Evolution","Linked Telecom Exchange","Line Transfer Equipment"]),
  q("tel_e02","easy","multiple_choice","What is the primary function of a Base Transceiver Station (BTS)?",["Route internet packets","Handle billing for subscribers","Facilitate radio communications between the network and mobile devices","Manage core network databases"]),
  q("tel_e03","easy","multiple_choice","What does ARPU stand for in telecommunications?",["Average Revenue Per User","Annual Rate Per Unit","Automated Revenue Processing Unit","Active Registered Phone Users"]),
  q("tel_e04","easy","multiple_choice","What is 'latency' in network communications?",["Data transfer speed","The delay between sending a signal and receiving a response","Network bandwidth capacity","The number of connected devices"]),
  q("tel_e05","easy","multiple_choice","What does 'churn rate' measure in telecom?",["Data usage per customer","The percentage of customers who discontinue service in a period","Call quality metrics","Network tower failure rate"]),
  q("tel_e06","easy","multiple_choice","What is the difference between 4G and 5G networks?",["5G only works outdoors","5G offers significantly higher speeds, lower latency, and supports more simultaneous device connections","4G is only for data; 5G includes voice","There is no practical difference"]),
  // MEDIUM
  q("tel_m01","medium","text","Explain the difference between FDD (Frequency Division Duplexing) and TDD (Time Division Duplexing) in LTE networks and the scenarios where each is preferred."),
  q("tel_m02","medium","berlitz","A major corporate client reports that VoIP call quality on their leased line has degraded significantly over the past 3 days. Call drops and jitter are reported every hour.\n\nDescribe your troubleshooting process.",["Tell the client to restart their router","Escalate the case to the NOC, conduct a network performance analysis of the client's link (checking for packet loss, jitter, latency against SLA targets), review change logs from the past 72 hours, and involve the transmission team for physical layer checks. Communicate findings with an interim fix and RCA within 24 hours.","Ask the client to call back later","Replace the client's CPE immediately without diagnosis"],),
  q("tel_m03","medium","multiple_choice","What is 'spectrum' in telecommunications?",["A type of antenna design","The range of electromagnetic frequencies used to transmit data wirelessly","A billing software platform","A type of network switch"]),
  q("tel_m04","medium","text","Describe the Philippine government's National Broadband Plan and its intended impact on internet access in rural areas."),
  q("tel_m05","medium","berlitz","The NTC (National Telecommunications Commission) announces a new regulation requiring all telcos to improve minimum broadband speeds in provincial areas to 25 Mbps within 18 months.\n\nAs a network planning manager, outline your compliance roadmap.",["Ignore the regulation until further details are issued","Conduct a gap analysis of current provincial broadband performance, identify priority areas for infrastructure investment, design a tower and fibre rollout plan, coordinate with LGUs for right-of-way, prepare a capex budget, and establish monitoring metrics to track compliance progress","Request an exemption immediately","Upgrade urban networks first"],),
  q("tel_m06","medium","multiple_choice","What is the purpose of a 'handover' (or handoff) in mobile networks?",["Switching from WiFi to mobile data","The process of transferring an active call or session from one cell tower to another as the user moves","Transferring a call to a customer service agent","Billing transfer between two providers"]),
  q("tel_m07","medium","multiple_choice","What does QoS (Quality of Service) management do in a telecommunications network?",["Reduce the number of users on a network","Prioritise certain types of network traffic to ensure performance standards for critical applications","Monitor employee internet usage","Allocate billing accounts"]),
  q("tel_m08","medium","text","Explain what 'tower sharing' means in the Philippine telecom context and how it impacts network expansion economics for smaller players."),
  // HARD
  q("tel_h01","hard","text","Analyse the competitive dynamics between PLDT, Globe, and DITO Telecommunity in the Philippine market and the regulatory challenges affecting fair competition."),
  q("tel_h02","hard","berlitz","Your telco experiences a major network outage affecting 2.5 million subscribers in Metro Manila during a Friday rush hour. The root cause is a BGP routing misconfiguration introduced during a routine maintenance window.\n\nDescribe your incident response and stakeholder communication plan.","",""),
  q("tel_h03","hard","multiple_choice","In 5G network architecture, what is a 'network slice'?",["A physical hardware partition in a data centre","A logically isolated virtual network customised for a specific use case or client within the shared 5G infrastructure","A spectrum frequency band","A security firewall component"]),
  q("tel_h04","hard","text","Discuss the technical and regulatory challenges of rolling out 5G infrastructure in the Philippines, including spectrum policy, right-of-way issues, and health perception concerns."),
  q("tel_h05","hard","berlitz","A large enterprise client is migrating their 500-seat call centre from legacy TDM telephony to a cloud-based UCaaS platform. They want zero downtime during the cutover.\n\nDesign the migration plan and risk mitigation strategy.","",""),
  q("tel_h06","hard","multiple_choice","What is 'IMS' (IP Multimedia Subsystem) used for in modern telco architecture?",["Internet marketing for telecom services","A framework for delivering multimedia services (voice, video, data) over IP-based networks","An international billing standard","An infrastructure monitoring system"]),
];

/* ─── MEDIA & ENTERTAINMENT ─── */
const media: QuizQuestion[] = [
  q("med_e01","easy","multiple_choice","What does 'editorial independence' mean in journalism?",["A publication's ability to generate advertising revenue independently","Freedom from external influence in editorial decisions and news coverage","Publishing without an editor","Owning the printing press outright"]),
  q("med_e02","easy","multiple_choice","What is a 'byline' in journalism?",["The headline of an article","The line giving the author's name in a published piece","A subscription cancellation notice","The last line of an article"]),
  q("med_e03","easy","multiple_choice","What does 'CPM' mean in digital media advertising?",["Cost Per Month","Cost Per Mille (cost per 1,000 impressions)","Content Per Market","Channel Pricing Model"]),
  q("med_e04","easy","multiple_choice","What is the primary role of a 'showrunner' in television production?",["The person in charge of daily lighting setups","The executive producer who oversees all creative and production decisions for a TV series","The lead sound engineer","The director of the pilot episode"]),
  q("med_e05","easy","multiple_choice","What is 'fact-checking' in journalism?",["Removing opinions from an article","Verifying the accuracy of claims, statistics, and statements before publication","Editing for grammar and style","Checking the article meets word count"]),
  q("med_e06","easy","multiple_choice","What does 'OTT' stand for in media distribution?",["Over-The-Top — content delivered directly via the internet, bypassing traditional cable or broadcast","Off-Track Television","Onsite Telecast Technology","Open Television Territory"]),
  // MEDIUM
  q("med_m01","medium","berlitz","You are a journalist and receive an exclusive tip from an anonymous source that a major government official is involved in procurement fraud. The source provides documents but requests complete anonymity.\n\nWhat is your editorial process before publication?",["Publish immediately — the documents are enough","Independently verify the documents' authenticity, seek a second source to corroborate the claim, give the accused official the opportunity to respond on the record, consult your editor and legal team, and publish only when the evidence meets your publication's standards. Protect the source's identity rigorously.","Request the source's identity before proceeding","Decline the story as too risky"],),
  q("med_m02","medium","text","Explain the economic model disruption facing traditional Philippine media (TV, print) and the strategies being used to pivot to digital revenue models."),
  q("med_m03","medium","multiple_choice","In video production, what is the '180-degree rule'?",["Cameras must always face north","A filmmaking guideline that keeps subjects on the same side of the frame to maintain spatial consistency","All scenes must be shot at 180-degree angles","A rule about camera lens focal length"]),
  q("med_m04","medium","text","Describe the ethical obligations of a journalist when covering a story involving minors or victims of crime or sexual violence."),
  q("med_m05","medium","berlitz","Your online news site publishes a story that later contains a significant factual error — a misidentified person in a crime report. The error has been live for 6 hours and has 15,000 views.\n\nDescribe your correction and accountability process.",["Delete the article quietly","Issue a prominent correction notice on the original article explaining the error clearly, update all social media posts with the correction, and if appropriate, publish a standalone correction piece. Conduct an internal review of fact-checking processes and communicate transparently with affected individuals.","Replace the text without noting a correction","Blame the source"],),
  q("med_m06","medium","multiple_choice","What is 'native advertising'?",["Advertising produced by local Philippine companies","Paid content designed to blend with editorial content in style and format","Advertising on traditional media only","A type of outdoor billboard advertising"]),
  q("med_m07","medium","text","Explain how social media algorithms affect news distribution and what implications this has for editorial decision-making in Philippine digital newsrooms."),
  q("med_m08","medium","multiple_choice","In audio production, what is 'dynamic range compression' used for?",["Increasing the length of audio files","Reducing the difference between the loudest and quietest parts of an audio signal for consistent volume","Adding reverb effects","Removing background noise"]),
  // HARD
  q("med_h01","hard","text","Analyse the impact of the Rappler vs. SEC case on press freedom and media regulation in the Philippines and its broader implications for foreign investment in Philippine media."),
  q("med_h02","hard","berlitz","Your media organisation is approached by a major advertiser who threatens to pull significant advertising spend unless you modify or kill a critical investigative article about their company.\n\nHow do you respond and what is your institutional process?","",""),
  q("med_h03","hard","multiple_choice","In the context of Philippine media law, what does the 'actual malice' standard require for a public official to succeed in a libel claim?",["Proof the article was published","Evidence the publisher knew the statement was false or acted with reckless disregard for its truth or falsity","Proof of financial damage","Evidence of intent to harm the official's family"]),
  q("med_h04","hard","text","Design a digital transformation roadmap for a legacy Philippine broadsheet transitioning to a subscription-based digital-first model. Address revenue, audience, and editorial strategy."),
  q("med_h05","hard","berlitz","A viral deepfake video falsely showing a prominent Philippine senator admitting to corruption is circulating at 500 shares per minute across social media. Your newsroom is receiving requests for comment.\n\nDescribe your verification and reporting protocol.","",""),
  q("med_h06","hard","multiple_choice","Under the Philippine Cybercrime Prevention Act (RA 10175), online libel carries a penalty that is:",["Lighter than traditional libel","The same as traditional libel","One degree higher than the penalty for traditional libel","Not covered under the law"]),
];

/* ─── HUMAN RESOURCES ─── */
const hr: QuizQuestion[] = [
  q("hr_e01","easy","multiple_choice","What does 'attrition rate' measure in HR?",["Employee satisfaction score","The percentage of employees who leave an organisation in a given period","Training completion rate","Benefits cost per employee"]),
  q("hr_e02","easy","multiple_choice","What is the primary purpose of a Job Description?",["A company advertisement","A document outlining the responsibilities, requirements, and reporting structure of a role","A salary comparison tool","An employee performance review form"]),
  q("hr_e03","easy","multiple_choice","What does 'HRIS' stand for?",["Human Resources International Standard","Human Resource Information System","HR Integration and Scheduling","Hiring and Retention Index Score"]),
  q("hr_e04","easy","multiple_choice","What is the primary law governing labour relations and workers' rights in the Philippines?",["Republic Act 8042","Presidential Decree 442 (Labour Code of the Philippines)","Republic Act 7277","Republic Act 6727"]),
  q("hr_e05","easy","multiple_choice","What is the purpose of an 'onboarding programme'?",["A legal compliance requirement only","To help new employees acclimate to the company culture, processes, and their role","A performance improvement plan","A recruitment marketing campaign"]),
  q("hr_e06","easy","multiple_choice","What does 'C&B' stand for in HR?",["Culture and Behaviour","Compensation and Benefits","Contracts and Bonuses","Compliance and Benchmarking"]),
  // MEDIUM
  q("hr_m01","medium","berlitz","A senior manager comes to you (HR Manager) with a complaint that one of their team members is consistently underperforming and they want the employee terminated immediately without a PIP.\n\nHow do you advise the manager?",["Proceed with immediate termination to satisfy the manager","Explain the legal requirements under the Labour Code: employees must be afforded due process including a formal notice of charges, an opportunity to respond, and a PIP or progressive discipline process before termination. Advise conducting a documented performance discussion, setting a PIP with clear targets and timelines, and following the two-notice rule if termination becomes necessary.","Side with the employee without investigating","Tell the manager to handle it without HR involvement"],),
  q("hr_m02","medium","text","Describe the twin-notice rule under Philippine Labour Law and the consequences of non-compliance in employee termination."),
  q("hr_m03","medium","multiple_choice","What is 'competency-based recruitment'?",["Hiring based on educational qualifications only","A structured approach that identifies and assesses specific behaviours and skills proven to predict job performance","Hiring based on personal referrals","A recruitment method based on salary expectations"]),
  q("hr_m04","medium","text","Design a structured interview process for hiring a Sales Manager for a pharmaceutical company. Include question types and evaluation criteria."),
  q("hr_m05","medium","berlitz","During an anonymous employee engagement survey, 65% of respondents cite 'poor communication from leadership' as their primary concern. The CEO is dismissing the result as 'just complaining.'\n\nAs HR Director, how do you present this finding and recommend action?",["Accept the CEO's dismissal and move on","Present the data with benchmark comparisons (industry or previous survey trends), quantify the risk (correlation with attrition and productivity), and recommend a structured leadership communications programme. Frame it as a business risk, not just a culture issue, and propose a 90-day action plan with measurable outcomes.","Repeat the survey hoping for better results","Share the results publicly to put pressure on leadership"],),
  q("hr_m06","medium","multiple_choice","Under DOLE Department Order 147-15, what are the just causes for termination of employment?",["Redundancy and retrenchment","Serious misconduct, wilful disobedience, gross negligence, fraud, and analogous causes","Breach of business performance targets","Budget constraints of the employer"]),
  q("hr_m07","medium","text","Explain the key components of a Total Rewards strategy and how it differs from traditional compensation-focused approaches."),
  q("hr_m08","medium","multiple_choice","What is the 'employer brand' in HR?",["A company's logo and visual identity","The company's reputation and perception as a place to work, influencing talent attraction and retention","A payroll software brand","An employee incentive programme"]),
  // HARD
  q("hr_h01","hard","text","Design a comprehensive talent retention strategy for a Philippine technology company experiencing 35% annual attrition, where the primary reason cited is 'better offers from competitors.'"),
  q("hr_h02","hard","berlitz","Your company is planning a retrenchment affecting 120 employees due to a business unit closure. You are the HR Director.\n\nDescribe the legal requirements, process timeline, and humane approach to managing this retrenchment under Philippine Labour Law.","",""),
  q("hr_h03","hard","multiple_choice","Which Supreme Court of the Philippines doctrine holds that an employer cannot terminate an employee for authorised causes without proof of good faith and fair dealing even if the just cause technically exists?",["Floating status doctrine","Management prerogative doctrine","Security of tenure principle under the 1987 Constitution","Social justice doctrine"]),
  q("hr_h04","hard","text","Critically evaluate the effectiveness of the compressed workweek arrangement under DOLE's TUCP-ECOP framework in the Philippine BPO industry context."),
  q("hr_h05","hard","berlitz","During a routine HR audit, you discover that a line manager has been systematically promoting only employees from the same regional background, consistently rating employees from other regions lower in performance reviews despite evidence to the contrary.\n\nDescribe your investigation and remediation process.","",""),
  q("hr_h06","hard","multiple_choice","Under the Philippine Data Privacy Act (RA 10173), what obligation does an employer have when collecting employee personal data for payroll processing?",["No obligation — employment gives blanket consent","Notify employees, limit collection to what is necessary, ensure data security, and process data only for declared legitimate purposes aligned with the employer-employee relationship","Obtain notarised consent for each data collection","Store all data indefinitely for audit purposes"]),
];

/* ─── GOVERNMENT & PUBLIC SECTOR ─── */
const government: QuizQuestion[] = [
  q("gov_e01","easy","multiple_choice","What does 'COA' stand for in Philippine government?",["Committee on Accountability","Commission on Audit","Corporation of Agencies","Central Office of Administration"]),
  q("gov_e02","easy","multiple_choice","What is the Procurement Service-Philippine Government Electronic Procurement System (PS-PhilGEPS) used for?",["Processing government salary payments","A centralized procurement platform for government purchasing","Tracking government employees' attendance","Registering businesses for government contracts"]),
  q("gov_e03","easy","multiple_choice","What is the purpose of an Annual Investment Plan (AIP) in local government?",["A personal investment plan for LGU officials","A document linking LGU programs to the local development plan and budget","A banking requirement for LGU funds","An investment portfolio for LGU savings"]),
  q("gov_e04","easy","multiple_choice","What does 'GOCC' stand for?",["Government-Owned and Controlled Corporation","General Office of Corporate Compliance","Government Operations and Community Coordination","General Order of Commercial Contracts"]),
  q("gov_e05","easy","multiple_choice","What is a 'barangay' in the context of Philippine governance?",["A provincial legislature","The smallest administrative unit of government","A national government agency","A type of government scholarship"]),
  q("gov_e06","easy","multiple_choice","What does RA 9003 (Ecological Solid Waste Management Act) primarily mandate?",["Penalties for littering only","A comprehensive approach to solid waste management including segregation, recycling, and composting","Regulation of industrial waste only","Tax incentives for recycling companies"]),
  // MEDIUM
  q("gov_m01","medium","text","Describe the Philippine Government Procurement Reform Act (RA 9184) and its key principles. What modes of procurement are recognised under the law?"),
  q("gov_m02","medium","berlitz","You are a public health officer and your barangay experiences a suspected dengue outbreak with 15 cases reported in one week — three times the normal baseline.\n\nDescribe your immediate public health response.",["Wait for the provincial health office to respond","Initiate active case surveillance to confirm the outbreak, coordinate fogging operations and source reduction campaigns within 24 hours, set up rapid response teams for case investigation, issue public advisories, notify the City/Municipal Health Officer and DOH regional office, and mobilise barangay health workers for community education.","Issue a public advisory and wait","Only treat current patients at the health centre"],),
  q("gov_m03","medium","multiple_choice","What is the 'Seal of Good Local Governance' (SGLG) awarded by the DILG?",["An award for the best-looking government building","A performance-based incentive that recognises LGUs that meet criteria across financial administration, social protection, and disaster risk reduction","A certification for LGU financial audits","A reward for the highest tax collection"]),
  q("gov_m04","medium","text","Explain the role of the Civil Service Commission (CSC) in the Philippine government and how merit and fitness principles apply to government employment."),
  q("gov_m05","medium","berlitz","A major infrastructure project funded by ODA (Official Development Assistance) in your agency is 18 months behind schedule and 30% over budget. The donor agency is requesting an explanation.\n\nHow do you prepare your response and corrective action plan?",["Blame the contractor and make no commitments","Conduct an honest root cause analysis, prepare a detailed variance report addressing schedule and cost deviations, present concrete corrective measures with revised milestones, and assign accountability. Communicate transparently with the donor while maintaining a solutions-focused narrative.","Minimise the problem in your report","Request a budget increase without addressing schedule"],),
  q("gov_m06","medium","multiple_choice","What is the 'Bottom-Up Budgeting' approach in Philippine local governance?",["Budget preparation driven entirely by the DBM","A participatory approach where communities identify priority projects that are included in the local budget","A method of reducing government spending","A formula for distributing the Internal Revenue Allotment"]),
  q("gov_m07","medium","text","Describe the role of the Ombudsman in Philippine governance and the process for filing and investigating complaints against government officials."),
  q("gov_m08","medium","multiple_choice","Under the Anti-Graft and Corrupt Practices Act (RA 3019), what is the maximum prison term for most corrupt practices?",["6 years","10 years","15 years","Life imprisonment"]),
  // HARD
  q("gov_h01","hard","text","Critically evaluate the effectiveness of the Philippine Disaster Risk Reduction and Management Act (RA 10121) in building community resilience, citing gaps and improvement areas based on past disaster responses."),
  q("gov_h02","hard","berlitz","You are a policy analyst in the Department of Labor. Your analysis reveals that a proposed minimum wage increase will benefit 3.5 million workers but economic modelling suggests it could result in 180,000 job losses, primarily in MSMEs.\n\nHow do you present this trade-off to the Secretary?",["Present only the benefits to gain approval","Present a balanced policy brief with the wage increase benefits and the projected employment risk with supporting evidence. Recommend a phased implementation with complementary measures (MSME credit access, productivity incentive programmes) to mitigate job losses, and propose monitoring mechanisms to evaluate impact post-implementation.","Recommend against the wage increase entirely","Present only the job loss risk to block the policy"],),
  q("gov_h03","hard","multiple_choice","Under the Philippine Constitution, which commission has exclusive original jurisdiction over election offenses?",["Commission on Audit (COA)","Commission on Elections (COMELEC)","Civil Service Commission (CSC)","Office of the Ombudsman"]),
  q("gov_h04","hard","text","Analyse the fiscal implications of the Mandanas-Garcia ruling on the Internal Revenue Allotment and its impact on national and local government budget dynamics."),
  q("gov_h05","hard","berlitz","Your agency discovers that a private contractor has submitted false certifications in a PhilGEPS procurement process, winning a ₱50M contract. The project is 40% completed.\n\nDescribe the legal and administrative actions your agency must take.","",""),
  q("gov_h06","hard","multiple_choice","The Philippine Development Plan (PDP) is the government's medium-term socioeconomic blueprint typically covering:",["1 year (annual budget cycle)","3 years (mid-term elections)","6 years (aligned to the term of the President)","10 years (long-term strategic planning)"]),
];

/* ─── AGRICULTURE & ENVIRONMENT ─── */
const agriculture: QuizQuestion[] = [
  q("agr_e01","easy","multiple_choice","What is 'crop rotation' and its primary benefit?",["Rotating farm machinery between fields","Growing different crops in succession on the same land to maintain soil health and reduce pest buildup","Harvesting crops at different times","Rotating farmers between different fields"]),
  q("agr_e02","easy","multiple_choice","What does 'pH' measure in agricultural soil testing?",["Phosphorus and hydrogen content","The acidity or alkalinity of the soil on a scale of 0–14","Plant height measurement","Pesticide harmfulness index"]),
  q("agr_e03","easy","multiple_choice","What is an 'EIS' in environmental management?",["Environmental Inspection System","Environmental Impact Statement — a document assessing the potential environmental effects of a proposed project","Endangered Identification Survey","Ecological Infrastructure Score"]),
  q("agr_e04","easy","multiple_choice","What does 'DA' stand for in Philippine agriculture?",["Department of Agriculture","Development Authority","Duly Accredited (for farms)","District Agriculture"]),
  q("agr_e05","easy","multiple_choice","What is the purpose of 'composting' in agriculture?",["Chemical fertiliser production","Decomposing organic matter to create a nutrient-rich soil amendment","Water retention in soil","Pest control"]),
  q("agr_e06","easy","multiple_choice","What is 'agroforestry'?",["Logging for agricultural land","An integrated land-use system combining trees with crops or livestock on the same land","Organic farming certification","A type of irrigation system"]),
  // MEDIUM
  q("agr_m01","medium","text","Describe the key provisions of the Philippine Organic Agriculture Act (RA 10068) and how it affects farming practices and certification in the country."),
  q("agr_m02","medium","berlitz","An El Niño event is forecast to affect your province for the next 4 months. Your agricultural cooperative manages 500 hectares of rice and vegetables.\n\nDescribe your adaptation strategy.",["Continue planting normally and hope for rain","Implement a drought adaptation plan: shift to drought-tolerant varieties or alternative crops with shorter water requirements, implement water conservation measures (mulching, drip irrigation), coordinate with the National Irrigation Authority for prioritised water release, access the Philippine Crop Insurance Corporation (PCIC) coverage, and engage with DA for emergency seed and input subsidies.","Stop all farming operations for 4 months","Request immediate government subsidies without changing practices"],),
  q("agr_m03","medium","multiple_choice","What is 'integrated pest management' (IPM)?",["Using the maximum dose of pesticides for total pest elimination","An ecosystem-based strategy combining biological, cultural, and chemical methods to manage pests at acceptable levels with minimum impact on health and environment","Planting pest-resistant varieties only","A government pest registration programme"]),
  q("agr_m04","medium","text","Explain the climate change vulnerabilities of Philippine agriculture and the adaptation strategies that smallholder farmers can implement with limited resources."),
  q("agr_m05","medium","berlitz","Your environmental monitoring data shows that a river adjacent to a banana plantation shows elevated levels of chlorpyrifos (an organophosphate pesticide), affecting aquatic biodiversity.\n\nAs an environmental officer, what regulatory actions do you pursue?",["Issue an advisory and continue monitoring","Collect and document evidence, notify the DENR and local environmental management bureau, issue a cease-and-desist order on pesticide application pending investigation, coordinate with the DA's Fertilizer and Pesticide Authority (FPA), and initiate legal proceedings under the Clean Water Act (RA 9275) if the violation is confirmed.","Send a warning letter to the plantation","Increase river monitoring frequency only"],),
  q("agr_m06","medium","multiple_choice","What is 'hydroponics'?",["A method of growing crops using only rainwater","Growing plants without soil, using nutrient solutions in water","A type of deep-sea fishing method","A land classification system"]),
  q("agr_m07","medium","text","Describe the role of the National Food Authority (NFA) in Philippine rice production and the policy debates around its mandate and operations."),
  q("agr_m08","medium","multiple_choice","What is 'vermicomposting'?",["A soil testing method","Using worms to decompose organic waste into high-quality compost","A chemical fertiliser application technique","A crop insurance programme"]),
  // HARD
  q("agr_h01","hard","text","Critically evaluate the effectiveness of the Rice Tariffication Law (RA 11203) on Philippine rice farmers, consumers, and national food security."),
  q("agr_h02","hard","berlitz","A proposed 300-hectare mixed-use development project in Palawan wants to convert an area partially classified as A&D (alienable and disposable) land but bordering a protected watershed.\n\nWhat are the environmental governance concerns and regulatory process?","",""),
  q("agr_h03","hard","multiple_choice","Under the Philippine Clean Air Act (RA 8749), which government body is primarily responsible for the implementation and enforcement of the law?",["Department of Agriculture","Department of Environment and Natural Resources (DENR)","Department of Health","Department of Transportation"]),
  q("agr_h04","hard","text","Discuss the economic and ecological case for expanding mangrove rehabilitation in coastal Philippine provinces and the barriers to implementation."),
  q("agr_h05","hard","berlitz","A climate vulnerability assessment of your municipality identifies that 40% of agricultural land is at risk of saltwater intrusion by 2040 due to sea-level rise. The municipality relies on agriculture for 70% of its economic output.\n\nDesign a long-term climate adaptation plan for the local government.","",""),
  q("agr_h06","hard","multiple_choice","What is 'carbon sequestration' in the context of environmental management?",["The process of emitting carbon dioxide from industrial plants","The capture and long-term storage of carbon from the atmosphere in natural systems like forests and soils","A carbon tax calculation method","Carbon dioxide monitoring in urban areas"]),
];

/* ─── LEGAL & COMPLIANCE ─── */
const legal: QuizQuestion[] = [
  q("leg_e01","easy","multiple_choice","What is the Philippine legal term for an accusatory pleading filed in court?",["Complaint","Information","Indictment","Petition"]),
  q("leg_e02","easy","multiple_choice","What does 'IP' stand for in legal and business contexts?",["Investment Portfolio","Intellectual Property","Internal Protocol","Independent Practice"]),
  q("leg_e03","easy","multiple_choice","Under the Data Privacy Act (RA 10173), who is the DPO?",["Database Processing Officer","Data Protection Officer","Digital Privacy Operator","Document Protocol Officer"]),
  q("leg_e04","easy","multiple_choice","What is the 'presumption of innocence' in Philippine criminal law?",["A suspect is guilty until proven innocent","An accused person is presumed innocent until the prosecution proves guilt beyond reasonable doubt","A police officer is always correct","A confession is always valid evidence"]),
  q("leg_e05","easy","multiple_choice","What does 'arbitration' mean in dispute resolution?",["A court trial before a judge","A private dispute resolution process where a neutral arbitrator renders a binding decision","A government mediation process","An appeal to the Supreme Court"]),
  q("leg_e06","easy","multiple_choice","What is the Statute of Limitations?",["A law limiting the number of terms a senator can serve","The time period within which a legal action must be commenced","A limit on the length of court documents","A restriction on the number of lawyers in a firm"]),
  // MEDIUM
  q("leg_m01","medium","berlitz","Your client, a startup, asks you to draft an NDA for a partnership discussion. The other party's lawyer proposes that the NDA be mutual, cover a 10-year period, and include a non-compete clause.\n\nWhat provisions do you flag as potentially problematic and how do you advise your client?",["Accept all provisions to close the deal quickly","Flag the 10-year duration as unusually long (industry standard is 2–5 years), note that the non-compete requires careful scoping (geographic limits, duration, reasonableness) and may be unenforceable if overly broad under Philippine law. Advise your client to negotiate a reasonable term and to carefully define 'Confidential Information' to avoid over-breadth.","Reject the entire NDA","Sign the NDA without review"],),
  q("leg_m02","medium","text","Explain the requirements for a valid contract under the Philippine Civil Code, including essential requisites and common causes of nullity."),
  q("leg_m03","medium","multiple_choice","What is the primary difference between 'void' and 'voidable' contracts under Philippine law?",["They mean the same thing","A void contract has no legal effect from the beginning; a voidable contract is valid until annulled by the aggrieved party","A voidable contract is permanently invalid","A void contract can be ratified"]),
  q("leg_m04","medium","text","Describe the key provisions of the Anti-Money Laundering Act (RA 9160 as amended) and the obligations it imposes on covered institutions."),
  q("leg_m05","medium","berlitz","During a contract review, you discover a clause that grants the counterparty unlimited liability from your client for any damages arising from the contract, regardless of cause.\n\nHow do you advise your client?",["Accept it — unlimited liability clauses are standard","Strongly advise against accepting the clause. Recommend a mutual limitation of liability capped at the contract value, exclusion of consequential damages, and inclusion of force majeure provisions. Negotiate the clause before execution.","Remove the clause without informing the counterparty","Proceed with signing and obtain insurance"],),
  q("leg_m06","medium","multiple_choice","What is 'judicial notice' in evidence law?",["A court summons served on a party","The recognition by a court of certain well-known facts without requiring formal proof","A written decision by a judge","A notice of appeal filed by a party"]),
  q("leg_m07","medium","text","Explain the concept of 'piercing the corporate veil' in Philippine corporate law and provide examples of when courts have applied it."),
  q("leg_m08","medium","multiple_choice","Under the Revised Corporation Code (RA 11232), what is the minimum number of incorporators required?",["5","7","1","3"]),
  // HARD
  q("leg_h01","hard","text","Analyse the legal framework governing foreign investment in Philippine mass media and the constitutional restrictions imposed. How have recent regulatory issuances sought to address these while remaining within constitutional bounds?"),
  q("leg_h02","hard","berlitz","Your law firm is engaged by a multinational corporation facing a class action suit from 2,500 workers claiming illegal dismissal following a plant closure in Batangas. The company maintains that retrenchment was valid due to business losses.\n\nOutline your legal defence strategy and the evidence you will need to build.","",""),
  q("leg_h03","hard","multiple_choice","Under the Philippine Competition Act (RA 10667), what type of agreement between competitors is considered prohibited per se?",["Exclusive distribution agreements","Price-fixing or bid-rigging agreements","Territorial allocation agreements when efficiency-justified","Joint venture agreements"]),
  q("leg_h04","hard","text","Discuss the legal and ethical dimensions of the right to privacy of employees in the Philippine workplace, specifically regarding employer monitoring of company devices and email."),
  q("leg_h05","hard","berlitz","A client company has been served a Writ of Kalikasan (environmental protection writ) by the Court of Appeals based on a community petition claiming that their cement plant is causing air pollution damaging to their health and environment.\n\nDescribe the legal response strategy and the evidentiary requirements.","",""),
  q("leg_h06","hard","multiple_choice","What is the standard of proof required in administrative cases before the Civil Service Commission?",["Beyond reasonable doubt","Proof beyond a preponderance of evidence","Substantial evidence — such relevant evidence as a reasonable mind might accept as adequate","Clear and convincing evidence"]),
];

/* ─── ARCHITECTURE & URBAN PLANNING ─── */
const architecture: QuizQuestion[] = [
  q("arc_e01","easy","multiple_choice","What is a 'setback' in Philippine building regulations?",["The cost overrun of a construction project","The minimum distance between a building and the property boundary or street","A structural failure","A building facade design element"]),
  q("arc_e02","easy","multiple_choice","What does 'FAR' stand for in urban planning?",["Floor Area Ratio","Facility Allocation Regulation","Front Architectural Requirement","Fixed Asset Registry"]),
  q("arc_e03","easy","multiple_choice","What is the primary legislation governing the practice of architecture in the Philippines?",["Republic Act 9266","Republic Act 8981","Presidential Decree 1096","Republic Act 7920"]),
  q("arc_e04","easy","multiple_choice","What does 'AutoCAD' primarily help architects do?",["Financial modelling of construction projects","Creating 2D and 3D technical drawings and blueprints","Managing project timelines","Structural load calculations"]),
  q("arc_e05","easy","multiple_choice","What is a 'zoning ordinance'?",["A law governing architect licensing","A local regulation that controls land use and building types within specific areas","A national building permit requirement","An environmental protection order"]),
  q("arc_e06","easy","multiple_choice","What is 'passive design' in architecture?",["Using minimum structural materials","Design strategies that harness natural resources (sunlight, wind, thermal mass) to maintain comfort without mechanical systems","Designing without client input","A low-cost building approach"]),
  // MEDIUM
  q("arc_m01","medium","text","Explain the National Building Code of the Philippines (PD 1096) framework and describe three key provisions that affect residential building design in Metro Manila."),
  q("arc_m02","medium","berlitz","Your urban planning team presents two development options for a 5-hectare urban infill site in Quezon City: (A) a high-density mixed-use tower with ground-floor retail and 600 residential units, or (B) a medium-density walkable development with 250 units, a public park, and ground-level community spaces.\n\nArticulat the planning considerations for each option.",["Choose A — higher density always wins","Evaluate Option A for economic density, housing supply contribution, and infrastructure load (traffic, utilities). Evaluate Option B for livability, community benefit, and alignment with the Local Government's Comprehensive Land Use Plan (CLUP). Present trade-offs including FAR, GBP, parking requirements, shadow impact, and mixed-income housing considerations. Recommend based on the CLUP designation and community needs.","Choose B — lower density is always better","Let the developer decide"],),
  q("arc_m03","medium","multiple_choice","What is 'BIM' (Building Information Modelling) primarily used for?",["A billing invoice management tool","A 3D model-based process integrating physical and functional data of a building across its lifecycle","A brand identity manual","A building insurance method"]),
  q("arc_m04","medium","text","Describe the concept of 'universal design' in architecture and list five specific features that would make a public building accessible to persons with disabilities under Batas Pambansa 344."),
  q("arc_m05","medium","berlitz","You are the architect of record for a 15-storey commercial building in a seismically active zone. Your structural engineer's preliminary design meets code minimum standards. A peer review suggests that while code-compliant, the design is at the lower end of acceptable performance for a Risk Category III building.\n\nHow do you advise your client?",["Proceed with code-minimum design to save cost","Present the peer review findings to the client, explain the difference between code-minimum life-safety performance and enhanced resilience performance objectives. Recommend the enhanced design with a cost-benefit analysis showing potential loss avoidance against upgrade cost. Document the client's decision thoroughly if they choose code-minimum.","Override the peer review without discussion","Ask the structural engineer to find a cheaper code-compliant solution"],),
  q("arc_m06","medium","multiple_choice","What is the purpose of a 'development control' in urban planning?",["Controlling the developer's budget","A regulatory tool that governs what can be built, where, and at what density within a local jurisdiction","An international construction standard","A project timeline management system"]),
  q("arc_m07","medium","text","Compare tropical modern architecture with international style architecture in the Philippine context. How do Filipino architects address climate, culture, and sustainability in contemporary design?"),
  q("arc_m08","medium","multiple_choice","What is a 'heritage zone' in urban planning?",["An area reserved for future development","A designated area where historic or culturally significant structures are protected and regulated under cultural heritage laws","A tourist district designation","An agricultural preservation zone"]),
  // HARD
  q("arc_h01","hard","text","Design a conceptual urban renewal strategy for Binondo, Manila — one of the world's oldest Chinatowns — that balances heritage conservation, economic revitalisation, and resilience to flooding."),
  q("arc_h02","hard","berlitz","A heritage building in Intramuros (classified Grade I under NHCP) is owned by a private developer who wants to demolish it for a mixed-use development. The developer argues the building is structurally unsafe.\n\nDescribe the regulatory and design response.",["Support demolition if it is structurally unsafe","Require an independent structural assessment commissioned by the NHCP. If the building is unsafe, explore adaptive reuse options (structural reinforcement, partial preservation of facade). If demolition is unavoidable, require the developer to document the structure in detail (measured drawings, photographs) and incorporate heritage references in the new development design. NHCP clearance is mandatory under RA 10066.","Demolish and move on","Ask the developer to fund a replica elsewhere"],),
  q("arc_h03","hard","multiple_choice","Under HLURB (now DHSUD) regulations, what is the minimum lot area for a socialized housing unit in the Philippines?",["25 sqm","36 sqm","50 sqm","64 sqm"]),
  q("arc_h04","hard","text","Critically analyse the challenges of implementing Transit-Oriented Development (TOD) around MRT/LRT stations in Metro Manila and the planning reforms needed to realise its potential."),
  q("arc_h05","hard","berlitz","Metro Manila's urban heat island effect is worsening, with average temperatures 3–5°C above surrounding rural areas. You are tasked with designing an urban cooling strategy for Makati's CBD.\n\nDescribe a multi-scale approach from building to urban block to district level.","",""),
  q("arc_h06","hard","multiple_choice","What is the 'sick building syndrome' and what are its typical architectural and mechanical causes?",["A legal term for unsafe construction","A situation where occupants experience acute health and comfort effects linked to time spent in a building, typically caused by poor ventilation, chemical off-gassing, inadequate daylighting, or humidity issues","A structural failure mode","An insurance category for damaged buildings"]),
];

/* ─── MASTER QUESTION BANK ─── */
export const INDUSTRY_QUESTIONS: Record<string, QuizQuestion[]> = {
  "Technology / IT":          tech,
  "BPO / Call Center":        bpo,
  "Healthcare / Medical":     healthcare,
  "Finance / Banking":        finance,
  "Marketing / Advertising":  marketing,
  "Real Estate & Construction": realestate,
  "Manufacturing & Engineering": manufacturing,
  "Retail & E-commerce":      retail,
  "Education & Training":     education,
  "Hospitality & Tourism":    hospitality,
  "Food & Beverage":          foodbev,
  "Creative Arts & Design":   creative,
  "Logistics & Transportation": logistics,
  "Telecommunications":       telecom,
  "Media & Entertainment":    media,
  "Human Resources":          hr,
  "Government & Public Sector": government,
  "Agriculture & Environment": agriculture,
  "Legal & Compliance":       legal,
  "Architecture & Urban Planning": architecture,
};

/* ─── ROLES PER INDUSTRY ─── */
export const INDUSTRY_ROLES: Record<string, string[]> = {
  "Technology / IT": [
    "Software Developer / Engineer",
    "Data Analyst / Engineer",
    "IT Manager / Project Lead",
    "System / Network Administrator",
    "QA / Test Engineer",
    "DevOps / Cloud Engineer",
    "Cybersecurity Analyst",
  ],
  "BPO / Call Center": [
    "Customer Service Agent",
    "Team Leader / Supervisor",
    "Quality Analyst",
    "Workforce Manager",
    "Trainer / L&D Specialist",
    "Operations Manager",
  ],
  "Healthcare / Medical": [
    "Staff Nurse / RN",
    "Medical Doctor / Physician",
    "Medical Technologist",
    "Hospital Administrator",
    "Pharmacist",
    "Radiologic Technologist",
  ],
  "Finance / Banking": [
    "Credit / Loan Analyst",
    "Bank Teller / Branch Staff",
    "Compliance Officer",
    "Treasury / Investment Analyst",
    "Financial Advisor",
    "Risk Manager",
    "Accounting / Finance Officer",
  ],
  "Marketing / Advertising": [
    "Digital Marketing Specialist",
    "Brand Manager",
    "Content Creator / Copywriter",
    "Media Buyer / Planner",
    "SEO / SEM Specialist",
    "Marketing Manager",
  ],
  "Real Estate & Construction": [
    "Licensed Real Estate Broker",
    "Civil / Structural Engineer",
    "Project Manager",
    "Quantity Surveyor",
    "Property Appraiser",
    "Site Safety Officer",
  ],
  "Manufacturing & Engineering": [
    "Production / Plant Engineer",
    "Quality Control Inspector",
    "Safety Officer",
    "Industrial / Process Engineer",
    "Maintenance Engineer",
    "Production Supervisor",
  ],
  "Retail & E-commerce": [
    "Store Manager / Supervisor",
    "Merchandiser / Buyer",
    "E-commerce Manager",
    "Supply Chain / Inventory Analyst",
    "Customer Service Representative",
    "Sales Associate",
  ],
  "Education & Training": [
    "Teacher / Instructor",
    "School Administrator",
    "Curriculum Developer",
    "Corporate Trainer / L&D Specialist",
    "Special Education Teacher",
    "Academic Coordinator",
  ],
  "Hospitality & Tourism": [
    "Front Office / Guest Relations",
    "Food & Beverage Manager",
    "Hotel General Manager",
    "Events Coordinator",
    "Revenue Manager",
    "Tour Operations Specialist",
  ],
  "Food & Beverage": [
    "Chef / Cook",
    "Restaurant Manager",
    "Food Safety Officer",
    "Purchasing / Supply Officer",
    "Barista / Bartender",
    "F&B Supervisor",
  ],
  "Creative Arts & Design": [
    "Graphic Designer",
    "UI / UX Designer",
    "Art Director",
    "Video / Motion Designer",
    "Copywriter / Content Strategist",
    "Brand / Visual Identity Designer",
  ],
  "Logistics & Transportation": [
    "Logistics Coordinator",
    "Customs Broker / Compliance Officer",
    "Supply Chain Manager",
    "Warehouse Supervisor",
    "Freight Forwarder",
    "Fleet / Transport Manager",
  ],
  "Telecommunications": [
    "Network Engineer",
    "RF / Transmission Engineer",
    "Customer Solutions Specialist",
    "Telco Sales Account Manager",
    "Network Operations Analyst",
    "Product / Service Manager",
  ],
  "Media & Entertainment": [
    "Journalist / Reporter",
    "Content Producer / Editor",
    "Broadcast Engineer",
    "Social Media Manager",
    "Advertising / Media Sales Executive",
    "Public Relations Specialist",
  ],
  "Human Resources": [
    "HR Generalist",
    "Recruiter / Talent Acquisition Specialist",
    "Compensation & Benefits Specialist",
    "Learning & Development Officer",
    "HR Business Partner",
    "HR Manager / Director",
  ],
  "Government & Public Sector": [
    "Government Project Officer",
    "Public Health Officer",
    "Procurement / Bids & Awards Officer",
    "Policy Analyst / Researcher",
    "Local Government Officer",
    "Administrative Officer",
  ],
  "Agriculture & Environment": [
    "Agricultural Extension Officer",
    "Agronomist / Crop Scientist",
    "Environmental Compliance Officer",
    "Farm Manager / Supervisor",
    "Veterinarian / Animal Health Officer",
    "Fisheries / Aquaculture Officer",
  ],
  "Legal & Compliance": [
    "Associate Lawyer / Attorney",
    "Paralegal / Legal Assistant",
    "Compliance Officer",
    "Corporate / In-house Counsel",
    "Legal Researcher",
    "Contracts Specialist",
  ],
  "Architecture & Urban Planning": [
    "Licensed Architect",
    "Urban / Land Use Planner",
    "Interior Designer",
    "Landscape Architect",
    "Heritage Conservation Specialist",
    "Building / Construction Project Manager",
  ],
};

/* ─── ROLE → QUESTION PRIORITY MAP ─── */
// For each role, list question IDs (from the bank) that are highest priority.
// pickQuiz will serve these first; remaining slots filled with general industry questions.
export const ROLE_QUESTION_MAP: Record<string, Record<string, string[]>> = {
  "Technology / IT": {
    "Software Developer / Engineer":    ["tech_e01","tech_e02","tech_e03","tech_e04","tech_m01","tech_m02","tech_m03","tech_m06","tech_m08","tech_h01","tech_h02","tech_h04"],
    "Data Analyst / Engineer":          ["tech_e05","tech_e06","tech_m01","tech_m05","tech_m08","tech_h03","tech_h04","tech_h06"],
    "IT Manager / Project Lead":        ["tech_m04","tech_m07","tech_m08","tech_h01","tech_h05","tech_h06"],
    "System / Network Administrator":   ["tech_e05","tech_e06","tech_m05","tech_m07","tech_h03","tech_h05","tech_h06"],
    "QA / Test Engineer":               ["tech_e03","tech_m02","tech_m04","tech_m08","tech_h02","tech_h05"],
    "DevOps / Cloud Engineer":          ["tech_e06","tech_m07","tech_m08","tech_h01","tech_h03","tech_h05","tech_h06"],
    "Cybersecurity Analyst":            ["tech_e06","tech_m07","tech_m08","tech_h03","tech_h04","tech_h06"],
  },
  "BPO / Call Center": {
    "Customer Service Agent":           ["bpo_e01","bpo_e02","bpo_e04","bpo_e05","bpo_m01","bpo_m02","bpo_m03","bpo_m05","bpo_h05"],
    "Team Leader / Supervisor":         ["bpo_e03","bpo_e06","bpo_m04","bpo_m07","bpo_m08","bpo_h01","bpo_h05"],
    "Quality Analyst":                  ["bpo_e02","bpo_e03","bpo_e06","bpo_m04","bpo_m08","bpo_h01","bpo_h06"],
    "Workforce Manager":                ["bpo_e01","bpo_e03","bpo_e06","bpo_m04","bpo_m08","bpo_h03","bpo_h06"],
    "Trainer / L&D Specialist":         ["bpo_e02","bpo_e04","bpo_e05","bpo_m02","bpo_m03","bpo_m05","bpo_h01"],
    "Operations Manager":               ["bpo_e03","bpo_e06","bpo_om_e01","bpo_om_e02","bpo_m04","bpo_m08","bpo_om_m01","bpo_om_m02","bpo_om_m03","bpo_h03","bpo_h05","bpo_h06","bpo_om_h01","bpo_om_h02"],
  },
  "Healthcare / Medical": {
    "Staff Nurse / RN":                 ["hc_e01","hc_e02","hc_e03","hc_e05","hc_m01","hc_m02","hc_m04","hc_m05","hc_m06","hc_m07","hc_h02"],
    "Medical Doctor / Physician":       ["hc_e01","hc_e02","hc_e04","hc_m02","hc_m03","hc_m08","hc_h01","hc_h02","hc_h04"],
    "Medical Technologist":             ["hc_e02","hc_e04","hc_e06","hc_m02","hc_m04","hc_h01","hc_h03"],
    "Hospital Administrator":           ["hc_m03","hc_m06","hc_h04","hc_h05"],
    "Pharmacist":                       ["hc_e03","hc_e06","hc_m05","hc_m07","hc_h03","hc_h05","hc_h06"],
    "Radiologic Technologist":          ["hc_e01","hc_e02","hc_e03","hc_m02","hc_m04","hc_h03"],
  },
  "Finance / Banking": {
    "Credit / Loan Analyst":            ["fin_e01","fin_e04","fin_e06","fin_m01","fin_m05","fin_m07","fin_h01","fin_h05"],
    "Bank Teller / Branch Staff":       ["fin_e01","fin_e02","fin_e03","fin_e06","fin_m08","fin_h02"],
    "Compliance Officer":               ["fin_e06","fin_m07","fin_m08","fin_h02","fin_h05"],
    "Treasury / Investment Analyst":    ["fin_e01","fin_e03","fin_e04","fin_m02","fin_m04","fin_h01","fin_h03","fin_h06"],
    "Financial Advisor":                ["fin_e01","fin_e03","fin_e04","fin_m02","fin_m03","fin_h01","fin_h03","fin_h04"],
    "Risk Manager":                     ["fin_e04","fin_m01","fin_m02","fin_m06","fin_m07","fin_h02","fin_h05","fin_h06"],
    "Accounting / Finance Officer":     ["fin_e02","fin_e03","fin_e06","fin_m01","fin_m04","fin_h04"],
  },
  "Marketing / Advertising": {
    "Digital Marketing Specialist":     ["mkt_e01","mkt_e02","mkt_e05","mkt_e06","mkt_m01","mkt_m03","mkt_m04","mkt_h03","mkt_h04"],
    "Brand Manager":                    ["mkt_e03","mkt_e04","mkt_e06","mkt_m02","mkt_m06","mkt_h02","mkt_h05"],
    "Content Creator / Copywriter":     ["mkt_e04","mkt_e06","mkt_m08","mkt_m07","mkt_h04","mkt_h05"],
    "Media Buyer / Planner":            ["mkt_e01","mkt_e05","mkt_m01","mkt_m04","mkt_h03","mkt_h04"],
    "SEO / SEM Specialist":             ["mkt_e01","mkt_e02","mkt_e05","mkt_m01","mkt_m03","mkt_m04","mkt_h03"],
    "Marketing Manager":                ["mkt_e03","mkt_e04","mkt_m02","mkt_m05","mkt_m06","mkt_h01","mkt_h02","mkt_h05"],
  },
  "Real Estate & Construction": {
    "Licensed Real Estate Broker":      ["re_e01","re_e02","re_e03","re_e04","re_m02","re_m03","re_m07","re_m08","re_h01","re_h04"],
    "Civil / Structural Engineer":      ["re_e05","re_e06","re_m04","re_m05","re_m06","re_h02","re_h03","re_h05","re_h06"],
    "Project Manager":                  ["re_e05","re_e06","re_m04","re_m06","re_h03","re_h05","re_h06"],
    "Quantity Surveyor":                ["re_e01","re_e05","re_m04","re_m05","re_h01","re_h05"],
    "Property Appraiser":               ["re_e01","re_e02","re_e03","re_e04","re_m02","re_m07","re_m08","re_h01","re_h04"],
    "Site Safety Officer":              ["re_e06","re_m06","re_h03","re_h02"],
  },
  "Manufacturing & Engineering": {
    "Production / Plant Engineer":      ["mfg_e01","mfg_e03","mfg_e04","mfg_m01","mfg_m03","mfg_m05","mfg_m06","mfg_m08","mfg_h01","mfg_h04"],
    "Quality Control Inspector":        ["mfg_e01","mfg_e03","mfg_m01","mfg_m03","mfg_m04","mfg_h01","mfg_h02","mfg_h04"],
    "Safety Officer":                   ["mfg_e03","mfg_m04","mfg_m07","mfg_h01","mfg_h02"],
    "Industrial / Process Engineer":    ["mfg_e01","mfg_e04","mfg_m01","mfg_m05","mfg_m08","mfg_h04","mfg_h05","mfg_h06"],
    "Maintenance Engineer":             ["mfg_e01","mfg_e04","mfg_m02","mfg_m04","mfg_m07","mfg_h04"],
    "Production Supervisor":            ["mfg_e01","mfg_e03","mfg_e06","mfg_m01","mfg_m03","mfg_m07","mfg_h01","mfg_h02"],
  },
  "Retail & E-commerce": {
    "Store Manager / Supervisor":       ["ret_e01","ret_e02","ret_e03","ret_e04","ret_e05","ret_m02","ret_m04","ret_h04"],
    "Merchandiser / Buyer":             ["ret_e02","ret_e03","ret_e04","ret_m04","ret_m07","ret_h02","ret_h04"],
    "E-commerce Manager":               ["ret_e01","ret_e05","ret_e06","ret_m01","ret_m08","ret_h01","ret_h03","ret_h05"],
    "Supply Chain / Inventory Analyst": ["ret_e03","ret_e04","ret_m04","ret_m06","ret_h02","ret_h04","ret_h06"],
    "Customer Service Representative":  ["ret_e05","ret_e06","ret_m01","ret_h05"],
    "Sales Associate":                  ["ret_e05","ret_e06","ret_m02","ret_m07"],
  },
  "Education & Training": {
    "Teacher / Instructor":             ["edu_e01","edu_e02","edu_e03","edu_e05","edu_e06","edu_m01","edu_m03","edu_m04","edu_h03","edu_h05"],
    "School Administrator":             ["edu_e02","edu_e04","edu_m02","edu_m05","edu_h01","edu_h02","edu_h04"],
    "Curriculum Developer":             ["edu_e02","edu_e03","edu_e05","edu_e06","edu_m03","edu_m04","edu_m08","edu_h01","edu_h03"],
    "Corporate Trainer / L&D Specialist":["edu_e03","edu_e05","edu_e06","edu_m07","edu_m08","edu_h04"],
    "Special Education Teacher":        ["edu_e01","edu_e05","edu_e06","edu_m01","edu_m03","edu_h03","edu_h05"],
    "Academic Coordinator":             ["edu_e02","edu_e04","edu_m02","edu_m05","edu_m06","edu_h01","edu_h02"],
  },
  "Hospitality & Tourism": {
    "Front Office / Guest Relations":   ["hosp_e01","hosp_e02","hosp_e05","hosp_m01","hosp_m08","hosp_h01","hosp_h06"],
    "Food & Beverage Manager":          ["hosp_e03","hosp_e06","hosp_m01","hosp_m04","hosp_m07","hosp_h03","hosp_h04"],
    "Hotel General Manager":            ["hosp_e01","hosp_e04","hosp_m02","hosp_m03","hosp_m06","hosp_h01","hosp_h02","hosp_h04"],
    "Events Coordinator":               ["hosp_e02","hosp_e05","hosp_m01","hosp_m03","hosp_h05"],
    "Revenue Manager":                  ["hosp_e01","hosp_e04","hosp_m02","hosp_m07","hosp_h01","hosp_h04","hosp_h06"],
    "Tour Operations Specialist":       ["hosp_e04","hosp_e05","hosp_m03","hosp_m05","hosp_h02","hosp_h03"],
  },
  "Food & Beverage": {
    "Chef / Cook":                      ["fb_e01","fb_e02","fb_e03","fb_e04","fb_e05","fb_m02","fb_m05","fb_h03","fb_h06"],
    "Restaurant Manager":               ["fb_e01","fb_e02","fb_e04","fb_e06","fb_m01","fb_m03","fb_m06","fb_m07","fb_h01","fb_h04","fb_h05"],
    "Food Safety Officer":              ["fb_e01","fb_e02","fb_e06","fb_m02","fb_m05","fb_h02","fb_h03"],
    "Purchasing / Supply Officer":      ["fb_e04","fb_m03","fb_m07","fb_h01","fb_h04"],
    "Barista / Bartender":              ["fb_e01","fb_e02","fb_e03","fb_e05","fb_m02","fb_m08"],
    "F&B Supervisor":                   ["fb_e01","fb_e04","fb_e06","fb_m01","fb_m03","fb_m06","fb_h01","fb_h04"],
  },
  "Creative Arts & Design": {
    "Graphic Designer":                 ["cre_e01","cre_e02","cre_e03","cre_e04","cre_e05","cre_e06","cre_m03","cre_m04","cre_m05","cre_h01"],
    "UI / UX Designer":                 ["cre_e02","cre_e04","cre_e05","cre_m01","cre_m03","cre_m04","cre_m06","cre_m08","cre_h03","cre_h04"],
    "Art Director":                     ["cre_e02","cre_e03","cre_m02","cre_m03","cre_m07","cre_h01","cre_h02"],
    "Video / Motion Designer":          ["cre_e01","cre_e05","cre_m07","cre_h06"],
    "Copywriter / Content Strategist":  ["cre_m02","cre_m07","cre_m08","cre_h01","cre_h02","cre_h04"],
    "Brand / Visual Identity Designer": ["cre_e02","cre_e03","cre_e06","cre_m02","cre_m03","cre_h01","cre_h02","cre_h03"],
  },
  "Logistics & Transportation": {
    "Logistics Coordinator":            ["log_e01","log_e02","log_e05","log_e06","log_m02","log_m04","log_m07","log_h01"],
    "Customs Broker / Compliance Officer":["log_e03","log_e04","log_e05","log_m05","log_m08","log_h02","log_h03","log_h04"],
    "Supply Chain Manager":             ["log_e01","log_e02","log_e06","log_m03","log_m04","log_m06","log_h01","log_h05","log_h06"],
    "Warehouse Supervisor":             ["log_e04","log_e06","log_m02","log_m06","log_h01"],
    "Freight Forwarder":                ["log_e03","log_e04","log_e05","log_m08","log_h02","log_h03","log_h04"],
    "Fleet / Transport Manager":        ["log_e02","log_e04","log_m01","log_m02","log_h01","log_h05"],
  },
  "Telecommunications": {
    "Network Engineer":                 ["tel_e01","tel_e02","tel_e04","tel_e06","tel_m01","tel_m06","tel_m07","tel_h01","tel_h02","tel_h03","tel_h04"],
    "RF / Transmission Engineer":       ["tel_e01","tel_e02","tel_e04","tel_m01","tel_m03","tel_m06","tel_h03","tel_h04"],
    "Customer Solutions Specialist":    ["tel_e03","tel_e05","tel_m02","tel_m08","tel_h05"],
    "Telco Sales Account Manager":      ["tel_e03","tel_e05","tel_e06","tel_m04","tel_m08"],
    "Network Operations Analyst":       ["tel_e01","tel_e04","tel_m06","tel_m07","tel_h02","tel_h03"],
    "Product / Service Manager":        ["tel_e03","tel_e06","tel_m04","tel_m05","tel_m08","tel_h01","tel_h04"],
  },
  "Media & Entertainment": {
    "Journalist / Reporter":            ["med_e01","med_e02","med_e05","med_m01","med_m04","med_m05","med_h01","med_h03","med_h05"],
    "Content Producer / Editor":        ["med_e03","med_e06","med_m02","med_m03","med_m07","med_h04"],
    "Broadcast Engineer":               ["med_e03","med_e04","med_e06","med_m03","med_m08","med_h04"],
    "Social Media Manager":             ["med_e03","med_e05","med_e06","med_m06","med_m07","med_h05"],
    "Advertising / Media Sales Executive":["med_e03","med_m06","med_m07","med_h01","med_h02","med_h03"],
    "Public Relations Specialist":      ["med_e01","med_e05","med_m05","med_m06","med_h02","med_h05"],
  },
  "Human Resources": {
    "HR Generalist":                    ["hr_e01","hr_e02","hr_e03","hr_e04","hr_e05","hr_m01","hr_m02","hr_m06","hr_m07","hr_h01"],
    "Recruiter / Talent Acquisition Specialist":["hr_e02","hr_e03","hr_e05","hr_e06","hr_m03","hr_m04","hr_m08","hr_h01","hr_h05"],
    "Compensation & Benefits Specialist":["hr_e03","hr_e06","hr_m07","hr_h01","hr_h04"],
    "Learning & Development Officer":   ["hr_e05","hr_m03","hr_m04","hr_h01","hr_h04"],
    "HR Business Partner":              ["hr_e04","hr_m01","hr_m02","hr_m05","hr_m06","hr_h01","hr_h02","hr_h05"],
    "HR Manager / Director":            ["hr_e01","hr_e04","hr_e06","hr_m01","hr_m02","hr_m05","hr_m06","hr_h01","hr_h02","hr_h03","hr_h04","hr_h05","hr_h06"],
  },
  "Government & Public Sector": {
    "Government Project Officer":           ["gov_e02","gov_e03","gov_m01","gov_m05","gov_h01","gov_h04","gov_h05"],
    "Public Health Officer":                ["gov_e01","gov_m02","gov_m03","gov_h01"],
    "Procurement / Bids & Awards Officer":  ["gov_e02","gov_m01","gov_m08","gov_h05"],
    "Policy Analyst / Researcher":          ["gov_e04","gov_m06","gov_m07","gov_m08","gov_h02","gov_h04","gov_h06"],
    "Local Government Officer":             ["gov_e01","gov_e05","gov_m02","gov_m03","gov_m06","gov_h01"],
    "Administrative Officer":               ["gov_e01","gov_e02","gov_e03","gov_m04","gov_m08","gov_h03"],
  },
  "Agriculture & Environment": {
    "Agricultural Extension Officer":   ["agr_e01","agr_e02","agr_e04","agr_e05","agr_m01","agr_m03","agr_m04","agr_h01"],
    "Agronomist / Crop Scientist":      ["agr_e01","agr_e02","agr_e05","agr_m03","agr_m06","agr_h01"],
    "Environmental Compliance Officer": ["agr_e03","agr_e06","agr_m04","agr_m05","agr_h03","agr_h04"],
    "Farm Manager / Supervisor":        ["agr_e01","agr_e04","agr_e05","agr_m01","agr_m03","agr_m08","agr_h01"],
    "Veterinarian / Animal Health Officer":["agr_e01","agr_e02","agr_e05","agr_m03","agr_h01"],
    "Fisheries / Aquaculture Officer":  ["agr_e02","agr_e06","agr_m04","agr_m07","agr_h04"],
  },
  "Legal & Compliance": {
    "Associate Lawyer / Attorney":      ["leg_e01","leg_e02","leg_e04","leg_e05","leg_m02","leg_m03","leg_m07","leg_h01","leg_h02","leg_h03","leg_h04"],
    "Paralegal / Legal Assistant":      ["leg_e01","leg_e03","leg_e05","leg_e06","leg_m02","leg_m06","leg_h02"],
    "Compliance Officer":               ["leg_e03","leg_e05","leg_m04","leg_m05","leg_h02","leg_h03","leg_h06"],
    "Corporate / In-house Counsel":     ["leg_e02","leg_m02","leg_m03","leg_m05","leg_m07","leg_m08","leg_h01","leg_h02","leg_h04"],
    "Legal Researcher":                 ["leg_e04","leg_e06","leg_m02","leg_m06","leg_h01","leg_h03","leg_h04"],
    "Contracts Specialist":             ["leg_e05","leg_m01","leg_m02","leg_m03","leg_m05","leg_h04"],
  },
  "Architecture & Urban Planning": {
    "Licensed Architect":               ["arc_e01","arc_e02","arc_e04","arc_e05","arc_m01","arc_m03","arc_m05","arc_m07","arc_h01","arc_h03","arc_h04"],
    "Urban / Land Use Planner":         ["arc_e02","arc_e05","arc_m02","arc_m06","arc_m08","arc_h01","arc_h04","arc_h05"],
    "Interior Designer":                ["arc_e03","arc_e04","arc_m07","arc_h01"],
    "Landscape Architect":              ["arc_e01","arc_e02","arc_e05","arc_m07","arc_h01","arc_h05"],
    "Heritage Conservation Specialist": ["arc_e05","arc_m08","arc_h01","arc_h02","arc_h04"],
    "Building / Construction Project Manager":["arc_e01","arc_e06","arc_m01","arc_m05","arc_m06","arc_h03","arc_h04","arc_h06"],
  },
};


/**
 * Cryptographically unbiased Fisher–Yates shuffle.
 * Uses node:crypto.randomInt instead of Math.random for uniform distribution
 * and to avoid the modulo-bias of plain `Math.floor(Math.random() * n)`.
 */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Per-(industry,role) ring buffer of the last N issued question-set hashes.
 * Used to softly avoid handing out a duplicate set when many applicants take
 * the quiz close together. Entries expire after 60s.
 */
const RECENT_TTL_MS = 60_000;
const RECENT_MAX_PER_KEY = 20;
const recentIssued = new Map<string, { hash: string; at: number }[]>();

function setHash(qs: QuizQuestion[]): string {
  return qs.map(q => q.id).sort().join("|");
}

function getRecent(key: string): Set<string> {
  const now = Date.now();
  const arr = (recentIssued.get(key) ?? []).filter(e => now - e.at < RECENT_TTL_MS);
  recentIssued.set(key, arr);
  return new Set(arr.map(e => e.hash));
}

function rememberIssued(key: string, hash: string): void {
  const arr = recentIssued.get(key) ?? [];
  arr.push({ hash, at: Date.now() });
  while (arr.length > RECENT_MAX_PER_KEY) arr.shift();
  recentIssued.set(key, arr);
}

/** Shuffle answer options so order doesn't reveal the correct answer by position. */
function shuffleOptions(q: QuizQuestion): QuizQuestion {
  if (q.type !== "multiple_choice" || !q.options || q.options.length < 2) return q;
  return { ...q, options: shuffle([...q.options]) };
}

function pickInternal(
  industry: string,
  excludeIds: string[],
  role: string | undefined,
): QuizQuestion[] {
  const bank = INDUSTRY_QUESTIONS[industry] ?? tech;
  const excluded = new Set(excludeIds);

  const roleIds: Set<string> = role
    ? new Set((ROLE_QUESTION_MAP[industry] as Record<string, string[]>)?.[role] ?? [])
    : new Set();

  const pick = (difficulty: QuizQuestion["difficulty"], count: number): QuizQuestion[] => {
    const pool = bank.filter(q => q.difficulty === difficulty && !excluded.has(q.id));
    const fallback = bank.filter(q => q.difficulty === difficulty);
    const source = pool.length >= count ? pool : fallback;

    if (roleIds.size > 0) {
      const prioritised = source.filter(q => roleIds.has(q.id));
      const general     = source.filter(q => !roleIds.has(q.id));
      const combined = [...shuffle([...prioritised]), ...shuffle([...general])];
      return combined.slice(0, count);
    }

    return shuffle([...source]).slice(0, count);
  };

  const selected = [
    ...pick("easy", 3),
    ...pick("medium", 4),
    ...pick("hard", 3),
  ];

  return shuffle(selected);
}

export function pickQuiz(
  industry: string,
  excludeIds: string[] = [],
  role?: string,
): QuizQuestion[] {
  const recentKey = `${industry}::${role ?? "_"}`;
  const recent = getRecent(recentKey);

  // Try up to 4 times to avoid handing out an identical set issued in the last 60s.
  let chosen = pickInternal(industry, excludeIds, role);
  for (let attempt = 0; attempt < 3 && recent.has(setHash(chosen)); attempt++) {
    chosen = pickInternal(industry, excludeIds, role);
  }

  rememberIssued(recentKey, setHash(chosen));

  // Shuffle each question's answer options so position doesn't leak the answer.
  return chosen.map(shuffleOptions);
}
