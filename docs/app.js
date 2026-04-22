// ===================================================================
// DATA
// ===================================================================

const CASES = [
  { id:1, type:'Profitability', company:'MedTech Corp', difficulty:'Medium', industry:'Healthcare',
    prompt:`Your client, MedTech Corp, is a leading US medical device manufacturer with $2.4B in annual revenue. Over the past three years, operating profit margins have fallen from 22% to 13%, while the industry average has held steady at 19%. The CEO has brought in your team to diagnose the issue and develop a concrete path back to historical margins. How would you approach this problem?`,
    followup:'You discover that COGS increased from 45% to 52% of revenue while SG&A remained flat. What does this tell you, and what would you investigate next?',
    hints:['Start by splitting into Revenue vs. Cost — which side is the problem?','Ask whether competitors face the same issue (internal vs. external driver)'] },

  { id:2, type:'Profitability', company:'Premier Bank', difficulty:'Easy', industry:'Financial Services',
    prompt:`Premier Bank is a regional bank serving the Midwest with $8B in assets. Its return on equity has declined from 14% to 9% over the past two years while peer banks average 12%. The CFO has engaged your team to identify the root cause. This was previously a high-performing institution — what happened?`,
    followup:'You find net interest margin compressed by 80bps. Walk me through how you would size the impact and identify the cause.',
    hints:['ROE = Net Income / Equity — break it apart','Consider both the revenue side (interest income) and cost side (provisions, expenses)'] },

  { id:3, type:'Profitability', company:'StyleForward Retail', difficulty:'Hard', industry:'Retail',
    prompt:`StyleForward is a mid-tier fashion retailer with 800 stores across North America and $4B in revenue. Three years ago, EBITDA margins were 11%; today they're at 4%. The board is considering closing 200 stores. Same-store sales have been flat while online competitors have grown 30%+ annually. How would you advise them?`,
    followup:'Same-store sales are flat but store-level profitability varies widely — top quartile stores earn 18% EBITDA margins while bottom quartile are at negative 3%. What does this imply for the store closure decision?',
    hints:['This is a complex case — start by diagnosing whether this is a revenue, cost, or portfolio problem','Consider the omni-channel dimension before recommending store closures'] },

  { id:4, type:'Market Entry', company:'BrewBound Coffee', difficulty:'Easy', industry:'Food & Beverage',
    prompt:`BrewBound is a successful US specialty coffee chain with 450 locations and $1.2B in revenue. They are considering entering the Indian market, which has a rapidly growing middle class and increasing coffee consumption. Their Indian CEO candidate claims there is a $3B opportunity. They've asked your team to evaluate the opportunity and provide a recommendation. How would you structure your analysis?`,
    followup:'You estimate the addressable market at $800M growing at 25% annually. What information do you need to decide whether BrewBound specifically should enter?',
    hints:['Use Market Attractiveness → Company Fit → Entry Mode as your three buckets','Consider what makes Indian market different from the US (tea culture, real estate, supply chain)'] },

  { id:5, type:'Market Entry', company:'NovaDrive EV', difficulty:'Hard', industry:'Automotive',
    prompt:`NovaDrive is a premium electric vehicle manufacturer with $18B in revenue, currently operating only in North America and Europe. They are evaluating entering Southeast Asia — specifically Thailand and Vietnam — where EV adoption is nascent but growing rapidly. The CEO wants a recommendation on whether and how to enter within 18 months. How would you approach this?`,
    followup:'Thailand offers significant government EV incentives through 2027. Vietnam has a younger demographic and faster smartphone adoption. How does this change your market prioritization?',
    hints:['Consider market attractiveness, competitive position, and operational fit','Think about regulatory environment, local manufacturing requirements, and charging infrastructure'] },

  { id:6, type:'Market Sizing', company:'Scoot Share', difficulty:'Easy', industry:'Mobility',
    prompt:`A PE firm is evaluating an investment in Scoot Share, an electric scooter sharing startup. Before the meeting, they want your team to estimate the total addressable market for electric scooter sharing services in the United States. Walk me through your approach.`,
    followup:'Your estimate is $2.1B annually. The company is generating $180M in revenue with 15% market share. Does this make sense? What does it imply about their growth potential?',
    hints:['Start with population, narrow to urban areas, then to target users','Think about frequency: how often does the typical rider use a shared scooter?'] },

  { id:7, type:'Market Sizing', company:'PodStream', difficulty:'Medium', industry:'Media',
    prompt:`A private equity firm is evaluating an investment in PodStream, a podcast advertising platform. They need your team to estimate the total addressable market for podcast advertising in the United States to assess how large this opportunity can become. How would you approach this?`,
    followup:'Estimate the market from both a supply-side (ad inventory available) and demand-side (advertiser willingness to pay) perspective. Do your numbers converge?',
    hints:['Think about it from the listener side: how many listeners, how many ads per hour, CPM rates','Cross-check with total digital advertising as a sanity check'] },

  { id:8, type:'M&A', company:'Apex Health Systems', difficulty:'Medium', industry:'Healthcare',
    prompt:`Your client is a large PE firm considering acquiring Apex Health Systems, a regional hospital network with 12 hospitals across the Southeast US generating $2.8B in revenue. The acquisition price is $4.2B (1.5x revenue). The PE firm has a 5-year holding period. Walk me through how you would advise them on this investment.`,
    followup:'The hospitals have an average EBITDA margin of 8% vs. best-in-class of 14%. What are the most likely drivers of this gap, and how would you size the value creation opportunity?',
    hints:['Think: Strategic rationale → Target quality → Value creation → Risk → Exit','Consider healthcare-specific factors: reimbursement rates, physician relationships, regulatory'] },

  { id:9, type:'M&A', company:'CloudCRM', difficulty:'Hard', industry:'Technology',
    prompt:`Salesforce is considering acquiring CloudCRM, a 5-year-old B2B CRM startup with $120M ARR growing at 65% YoY, net revenue retention of 118%, and a 20% EBITDA margin. The founder is asking $2.4B (20x ARR). Structure your assessment of whether this is a compelling acquisition and at what price.`,
    followup:'You believe fair value is $1.8B. The founder will not accept below $2.2B. What creative deal structures could bridge the gap?',
    hints:['For a SaaS M&A, the key metrics are ARR growth, NRR, payback period, and strategic fit','Compare to comparable transactions — what have similar SaaS acquisitions traded at?'] },

  { id:10, type:'Operations', company:'AutoParts Manufacturing', difficulty:'Easy', industry:'Manufacturing',
    prompt:`A US automotive parts manufacturer has total costs running 18% above the industry benchmark. Operating across three plants, they produce brake systems and suspension components for major OEMs. The VP of Operations has engaged your team to identify the top opportunities for cost reduction without sacrificing quality. How would you structure this engagement?`,
    followup:'You learn that Plant 2 has 2.3x higher defect rates than Plants 1 and 3. What does this tell you, and what would you investigate?',
    hints:['Map the full value chain first: raw materials → production → quality → logistics','Benchmark plant by plant — the variation will tell you where the opportunity is'] },

  { id:11, type:'Operations', company:'FreshMart Grocery', difficulty:'Medium', industry:'Retail',
    prompt:`FreshMart, a 500-store grocery chain, has inventory carrying costs twice the industry average and spoilage rates running at 8% vs. a best-in-class benchmark of 3%. Revenue is flat while competitor margins are improving. The COO believes supply chain issues are the root cause. How would you approach diagnosing and solving this problem?`,
    followup:`FreshMart orders inventory weekly, while best-in-class chains order daily for perishables. You estimate this adds $180M in unnecessary spoilage annually. How do you structure a recommendation to change the ordering cadence, knowing store managers resist the change?`,
    hints:['Separate the diagnosis (why is this happening?) from the solution (what do we do?)','Think about both demand forecasting accuracy and supply chain flexibility'] },

  { id:12, type:'Pricing', company:'GenTera Pharma', difficulty:'Medium', industry:'Healthcare',
    prompt:`GenTera Pharma has received FDA approval for GenTerX, a breakthrough treatment for a rare neurological disorder affecting 80,000 Americans. Without treatment, patients deteriorate significantly within 5 years. GenTerX requires 4 infusions per year. Your team has been asked to develop an optimal pricing strategy for the US market. How would you approach this?`,
    followup:'Payers (insurance) say they can support $45K/year. Patient advocacy groups argue $20K is the ceiling. GenTera\'s break-even is $28K/year at 30% market penetration. How do you navigate this?',
    hints:['Use three lenses: value-based (patient benefit), cost-plus (manufacturer perspective), competitive (alternatives)','Consider the market access strategy alongside the price point'] },

  { id:13, type:'Pricing', company:'DataSync SaaS', difficulty:'Hard', industry:'Technology',
    prompt:`DataSync offers a B2B data integration platform currently priced at $99/month per user (freemium model). They have 50,000 free users and 2,000 paid users — a 4% conversion rate. Growth has plateaued and churn among paid users is 25% annually. The CEO wants to overhaul the pricing model. What frameworks would you apply, and what would you recommend?`,
    followup:'Data shows that customers using 5+ integrations have 8% churn vs. 35% for those using fewer than 3. How does this change your pricing architecture recommendation?',
    hints:['Analyze the current model before recommending changes — what is driving the 25% churn?','Consider value metric pricing (charge by usage/integrations rather than seats)'] },

  { id:14, type:'Competitive', company:'LastMile Grocery Delivery', difficulty:'Medium', industry:'Logistics',
    prompt:`LastMile is a grocery delivery startup with 35% market share in 3 major metro areas and $400M in annual revenue. They have been profitable for 2 years. Amazon just announced it is entering their markets with Amazon Fresh delivery, offering free delivery to Prime members. The CEO is asking: how should we respond? Structure your thinking.`,
    followup:'Amazon is pricing delivery at $0 for Prime members. LastMile charges $9.99/delivery. You estimate Amazon will capture 20% share within 12 months. Walk me through how you frame the response options and tradeoffs.',
    hints:['Understand the threat first — what are Amazon\'s actual advantages and constraints?','Consider which customer segments LastMile can defend vs. cede'] },

  { id:15, type:'Competitive', company:'SkyWay Airlines', difficulty:'Hard', industry:'Aviation',
    prompt:`SkyWay is a full-service airline with $5.2B in revenue operating 47 routes across the Eastern US. FlyBudget, a European low-cost carrier, has announced it will enter 12 of SkyWay's most profitable routes (which represent 38% of revenue) next quarter. FlyBudget's average fare is 40% below SkyWay's. How should SkyWay respond?`,
    followup:'SkyWay\'s CFO proposes matching FlyBudget\'s fares on all 12 routes. You believe this would reduce route profitability by $280M. What alternative strategies would you propose and how would you evaluate the tradeoffs?',
    hints:['Assess FlyBudget\'s actual capability — can they deliver on 12 simultaneous route launches?','SkyWay cannot win a pure price war — think about differentiation and segmentation'] }
];

const FRAMEWORKS = [
  { id:'profitability', name:'Profitability Framework', icon:'📉', when:'Client profits are declining or below industry benchmark',
    structure:[
      {l:1,t:'Revenue = Price × Volume'},
      {l:2,t:'Price: pricing strategy, mix, discounts, realization'},
      {l:2,t:'Volume: # customers × purchase frequency × market share'},
      {l:1,t:'Costs = Fixed + Variable'},
      {l:2,t:'Variable: COGS, materials, logistics, sales commissions'},
      {l:2,t:'Fixed: SG&A, R&D, facilities, depreciation'},
      {l:1,t:'Segment Analysis'},
      {l:2,t:'By business unit, geography, product line, customer type'},
      {l:2,t:'Benchmark: internal best vs. worst, vs. industry'}
    ],
    questions:['Is this a revenue problem, a cost problem, or both?','Which segment or business unit is underperforming?','Is this internal (company-specific) or external (industry-wide)?','What changed over the relevant time period?','How do our margins compare to direct competitors?'],
    mistakes:['Jumping into costs without checking revenue first','Forgetting to benchmark against industry — is this widespread?','Not segmenting early enough by business unit or geography','Missing the "so what" — what specific change drove the decline?'],
    opening:'"To diagnose this, I\'d like to start at the top and work down. I\'ll split the problem into revenue and cost, then segment each to identify where the gap versus benchmark is largest. Before I do — has the decline been uniform across all business units, or concentrated in a specific area?"' },

  { id:'market-entry', name:'Market Entry Framework', icon:'🌍', when:'Client considering entering a new market, geography, or segment',
    structure:[
      {l:1,t:'Market Attractiveness'},
      {l:2,t:'Size: TAM, SAM, serviceable market today'},
      {l:2,t:'Growth: CAGR, emerging trends, inflection points'},
      {l:2,t:'Profitability: industry margins, pricing power'},
      {l:2,t:'Competition: concentration, barriers to entry, retaliation risk'},
      {l:1,t:'Company Fit'},
      {l:2,t:'Capabilities: do we have the assets, skills, relationships?'},
      {l:2,t:'Synergies: how does this connect to the core business?'},
      {l:2,t:'Financial case: investment required, break-even, ROI'},
      {l:1,t:'Risks'},
      {l:2,t:'Regulatory, cultural, operational, competitive retaliation'},
      {l:1,t:'Recommendation + Entry Mode'},
      {l:2,t:'Go / No-Go / Go with conditions'},
      {l:2,t:'Entry mode: organic, partnership, acquisition, licensing'}
    ],
    questions:['How large is the market today and what is the growth trajectory?','Who are the incumbents and what are their advantages?','Do we have a right to win — what would differentiate us?','What investment is required and what is the payback period?','What is the minimum viable entry strategy?'],
    mistakes:['Assessing company fit before market attractiveness','Skipping the "right to win" question — size alone is not sufficient','Forgetting regulatory and cultural barriers in international cases','Not making a clear go/no-go recommendation'],
    opening:'"I\'d structure this as three questions: Is this an attractive market? Can we win in it? And is the financial case compelling? Let me walk through each, then give you a recommendation. First — what is the primary metric the leadership team cares about most: revenue growth, profitability, or strategic positioning?"' },

  { id:'market-sizing', name:'Market Sizing Framework', icon:'📐', when:'Need to estimate the size of a market or quantity',
    structure:[
      {l:1,t:'Define the market precisely first'},
      {l:2,t:'Geography, product category, time period, customer type'},
      {l:1,t:'Top-Down Approach'},
      {l:2,t:'Total addressable population'},
      {l:2,t:'× % who are potential customers (segmentation)'},
      {l:2,t:'× % who are actual buyers (penetration rate)'},
      {l:2,t:'× Average annual spend per buyer'},
      {l:1,t:'Bottom-Up Approach'},
      {l:2,t:'Number of suppliers/locations'},
      {l:2,t:'× Average revenue per supplier'},
      {l:1,t:'Sanity Checks'},
      {l:2,t:'Cross-check top-down vs. bottom-up'},
      {l:2,t:'Benchmark against analogous markets you know'}
    ],
    questions:['How are we defining the boundaries of this market?','What population should serve as our starting anchor?','What is the most MECE way to segment the demand?','Does our estimate pass a common-sense test?','What is the growth rate implied, and does that make sense?'],
    mistakes:['Not defining the market clearly before estimating','Failing to show your work step-by-step','Not doing a sanity check at the end','Forgetting to segment MECE-ally — double-counting populations'],
    opening:'"Before I start estimating, let me clarify the scope — are we sizing the total market globally, or US only? And are we including [adjacent category] or focusing purely on [core product]? Once I have that, I\'ll use a top-down approach segmenting by [anchor] and cross-check with supply-side data."' },

  { id:'ma', name:'M&A Framework', icon:'🤝', when:'Evaluating a merger, acquisition, or partnership',
    structure:[
      {l:1,t:'Strategic Rationale'},
      {l:2,t:'Why this deal? What problem does it solve?'},
      {l:2,t:'Revenue synergies: cross-sell, new markets, pricing power'},
      {l:2,t:'Cost synergies: overlap elimination, procurement, scale'},
      {l:1,t:'Target Assessment'},
      {l:2,t:'Market position and competitive moat'},
      {l:2,t:'Financial performance: growth, margins, cash conversion'},
      {l:2,t:'Management quality and culture fit'},
      {l:1,t:'Valuation'},
      {l:2,t:'Intrinsic value: DCF, comparable company multiples'},
      {l:2,t:'Premium justification: synergy value vs. integration cost'},
      {l:1,t:'Risks & Integration'},
      {l:2,t:'Integration complexity, regulatory, cultural'},
      {l:2,t:'Key milestones and success metrics'},
      {l:1,t:'Go / No-Go + Structure'}
    ],
    questions:['What is the strategic rationale — capabilities, scale, or market access?','What are the quantified synergies and how confident are we?','How does the price compare to intrinsic and transaction value?','What are the top 3 integration risks?','What is the exit / holding strategy?'],
    mistakes:['Skipping strategic rationale and going straight to valuation','Failing to quantify synergies specifically','Ignoring integration risk and complexity','Not addressing how the deal is financed'],
    opening:'"I\'d approach this M&A question in three parts: first, the strategic rationale and synergy case; second, the valuation and whether the price is justified; and third, the key risks and integration considerations. To start — what is the primary driver of this deal: synergies, capabilities, or market access?"' },

  { id:'operations', name:'Operations / Cost Framework', icon:'⚙️', when:'Client has high costs, operational inefficiency, or process problems',
    structure:[
      {l:1,t:'Baseline: Map the Value Chain'},
      {l:2,t:'Identify all cost categories and their % of total'},
      {l:2,t:'Where in the process does cost/waste occur?'},
      {l:1,t:'Benchmark'},
      {l:2,t:'Internal: best vs. worst performing unit, plant, region'},
      {l:2,t:'External: industry benchmark, best-in-class'},
      {l:1,t:'Root Cause Analysis'},
      {l:2,t:'Where is the largest gap to benchmark?'},
      {l:2,t:'Process issues? Technology? Scale? People? Procurement?'},
      {l:1,t:'Solutions (prioritized by impact × ease)'},
      {l:2,t:'Quick wins (0-6 months)'},
      {l:2,t:'Medium-term initiatives (6-18 months)'},
      {l:2,t:'Strategic changes (18+ months)'}
    ],
    questions:['Where in the value chain is cost concentrated vs. the benchmark?','What is the variance between our best and worst performing units?','Is the gap driven by volume, rate, or efficiency?','What is the realistic improvement potential and timeline?','What are the change management implications?'],
    mistakes:['Trying to solve before fully diagnosing — map before you fix','Ignoring internal benchmarks (plant vs. plant variation is often the best insight)','Proposing solutions without quantifying impact','Underestimating change management complexity'],
    opening:'"I\'d start by mapping where in our value chain costs sit relative to benchmark. Are we over-spending on procurement, production, logistics, or overhead? Once I know where the gap is largest, I can hypothesize root causes. Before I dive in — do we have data on how our costs break down by category versus a peer benchmark?"' },

  { id:'pricing', name:'Pricing Framework', icon:'💲', when:'Client needs to set or optimize the price for a product or service',
    structure:[
      {l:1,t:'Value-Based: What is the product worth to the customer?'},
      {l:2,t:'Economic benefit: cost savings, revenue uplift, risk reduction'},
      {l:2,t:'Willingness to pay (WTP) by segment'},
      {l:1,t:'Cost-Plus: What is the floor?'},
      {l:2,t:'Total unit cost + target margin'},
      {l:1,t:'Competitive: Where is the market?'},
      {l:2,t:'Competitor price points and relative value positioning'},
      {l:1,t:'Pricing Strategy'},
      {l:2,t:'Skim vs. penetration vs. value pricing vs. freemium'},
      {l:2,t:'Segmentation: good/better/best tiers'},
      {l:2,t:'Value metric: per seat, per unit, per outcome'},
      {l:1,t:'Market Access & Implementation'},
      {l:2,t:'Channel, payer, reimbursement, price sensitivity'}
    ],
    questions:['What economic value does this product create for the customer?','What is the customer\'s willingness to pay — and how does it vary by segment?','What do comparable products or alternatives cost?','What pricing model best aligns incentives with customer value?','What are the market access / payer dynamics?'],
    mistakes:['Starting with cost-plus instead of value-based','Ignoring WTP variation across segments','Choosing a price without a model for how to communicate value','Failing to consider the competitive response to your pricing'],
    opening:'"Pricing decisions sit at the intersection of three forces: customer value, costs, and competitive dynamics. I\'d start with value — what economic benefit does this create for the buyer? Then set a floor based on cost, and find where our price should sit relative to alternatives. First — who is the primary buyer and what are they comparing us against?"' },

  { id:'competitive', name:'Competitive Response Framework', icon:'⚔️', when:'Client faces a competitive threat and needs to respond',
    structure:[
      {l:1,t:'Understand the Threat'},
      {l:2,t:'Who is the competitor? Credibility and resources?'},
      {l:2,t:'Their strategy: price, differentiation, focus?'},
      {l:2,t:'Timeline: how fast is the threat materializing?'},
      {l:1,t:'Assess Our Position'},
      {l:2,t:'Current competitive advantages'},
      {l:2,t:'Vulnerabilities: where are we exposed?'},
      {l:2,t:'Customer loyalty and switching costs'},
      {l:1,t:'Response Options'},
      {l:2,t:'Fight: match or beat them on their own terms'},
      {l:2,t:'Differentiate: emphasize what makes us unique'},
      {l:2,t:'Segment: cede exposed segments, dominate defensible ones'},
      {l:2,t:'Partner / Acquire: neutralize the threat'},
      {l:2,t:'Harvest: exit if the economics no longer work'},
      {l:1,t:'Recommendation + Timeline'}
    ],
    questions:['How credible and well-resourced is the competitor — can they actually execute?','Where are we most vulnerable and which customers are at risk?','Can we compete on their terms, or must we change the game?','What is the cost of each response option vs. doing nothing?','What is our timeline before we see material share loss?'],
    mistakes:['Assuming the competitive threat is as large as announced — stress-test it','Recommending a pure price war without considering the P&L impact','Ignoring internal capabilities when choosing a response strategy','Not making a clear, prioritized recommendation'],
    opening:'"Before recommending a response, I want to understand the threat clearly — how credible is this competitor, what exactly is their strategy, and how quickly can they execute? Then I\'ll assess where we\'re most exposed. Only then can we design a response that plays to our actual strengths. How much lead time do we have before they enter the market?"' },

  { id:'growth', name:'Growth Strategy Framework', icon:'🚀', when:'Client wants to grow revenue, market share, or enter new businesses',
    structure:[
      {l:1,t:'Ansoff Matrix: Organic Growth'},
      {l:2,t:'Market penetration: more from existing customers & markets'},
      {l:2,t:'Market development: existing products in new geographies'},
      {l:2,t:'Product extension: new products for existing customers'},
      {l:2,t:'Diversification: new products in new markets (highest risk)'},
      {l:1,t:'Inorganic Growth'},
      {l:2,t:'M&A: acquire capabilities or market access'},
      {l:2,t:'Partnerships, JVs, licensing, distribution deals'},
      {l:1,t:'Prioritization'},
      {l:2,t:'Size of prize vs. probability of winning'},
      {l:2,t:'Time to revenue and resource requirements'},
      {l:2,t:'Risk-adjusted return on investment'},
      {l:1,t:'Execution Roadmap'},
      {l:2,t:'Quick wins vs. long-term bets'},
      {l:2,t:'Key milestones and investment phasing'}
    ],
    questions:['What is the growth target and over what timeframe?','Where is the biggest untapped opportunity — existing customers, new markets, or new products?','What capabilities do we have vs. need to build or buy?','What is the risk appetite of the organization?','How do we sequence the initiatives for maximum near-term impact?'],
    mistakes:['Jumping to new markets before optimizing the core business','Not stress-testing the feasibility of each growth lever','Underestimating the internal capability gaps','Failing to prioritize — growth strategies need a clear sequence'],
    opening:'"I\'d approach this using the Ansoff matrix as a starting lens — four distinct growth paths with very different risk profiles. Before I explore each, let me clarify: is the 30% growth target over 3 years purely organic, or is M&A on the table? And is the constraint capital, capabilities, or market opportunity?"' }
];

const PHRASES = {
  'Opening & Clarification': [
    { phrase: "Before I dive in, I'd like to clarify a few things to make sure I'm solving the right problem.", when:'Starting any case' },
    { phrase: "Just to make sure I understand — you're saying [X]. Is that correct, and is it specific to this company or industry-wide?", when:'Confirming a key fact' },
    { phrase: "What's the primary objective here — short-term profitability, or are we also weighing long-term strategic positioning?", when:'Clarifying the goal' },
    { phrase: "Is there a particular segment or geography you're most concerned about, or is this a company-wide phenomenon?", when:'Narrowing scope early' },
    { phrase: "Do we have a sense of whether competitors are facing similar challenges, or is this unique to our client?", when:'Isolating internal vs. external drivers' },
    { phrase: "Are there any constraints I should keep in mind — budget, timeline, or stakeholder sensitivities?", when:'Understanding constraints before structuring' }
  ],
  'Structuring Your Approach': [
    { phrase: "I'd like to take a moment to structure my thoughts before diving in.", when:'Before presenting a framework' },
    { phrase: "I see three key areas we need to explore: [X], [Y], and [Z]. Let me walk through each.", when:'Presenting a 3-bucket framework' },
    { phrase: "The way I'd approach this is to start with [X] and use that to prioritize where we go deeper.", when:'Explaining your logic' },
    { phrase: "I'd like to approach this as a [profitability / market entry / sizing] problem, which means the core question is [X].", when:'Naming the case type explicitly' },
    { phrase: "At a high level, I see two possible hypotheses: [X] or [Y]. The analysis should tell us which is true.", when:'Leading with hypothesis before structure' },
    { phrase: "Before I go breadth-first, let me give you the skeleton and then we can agree where to go deep.", when:'Previewing your framework before detailing it' }
  ],
  'Hypothesis-Driven Language': [
    { phrase: "My initial hypothesis is that this is primarily a [cost/revenue/competitive] issue — but I want to test that with data.", when:'Stating a working hypothesis' },
    { phrase: "Given what you've told me, I'd guess the main driver is [X]. Do we have data to confirm or refute that?", when:'Proposing a hypothesis and asking for validation' },
    { phrase: "This pattern is consistent with [X], but inconsistent with [Y]. That suggests we should focus on [Z].", when:'Using data to update your hypothesis' },
    { phrase: "I'd expect the biggest opportunity to be in [X] — does that align with what leadership is seeing?", when:'Pressure-testing your hypothesis with the interviewer' },
    { phrase: "Let me state my working hypothesis: [X]. To prove or disprove it, I'd want to look at [Y] and [Z].", when:'Framing next steps around a hypothesis' }
  ],
  'Data Analysis & Math': [
    { phrase: "Let me do a quick back-of-envelope to sanity-check that number before we proceed.", when:'Before any calculation' },
    { phrase: "If revenue is $[X] and margins are [Y]%, that implies profit of $[Z] — does that align with what you have?", when:'Confirming math with the interviewer' },
    { phrase: "As a rough approximation, [X]% of $[Y]B is approximately $[Z]M, which tells us [implication].", when:'Showing mental math process out loud' },
    { phrase: "That number feels high. If we assume [X], the math only works if [Y] — let me pressure-test that.", when:'Flagging a number that seems off' },
    { phrase: "To size this, I'd anchor on [US population / number of households / industry revenue] and work down from there.", when:'Starting a market sizing calculation' }
  ],
  'Transitions': [
    { phrase: "That covers [X]. Let me now turn to [Y], which I think is actually where the bigger opportunity is.", when:'Moving between framework buckets' },
    { phrase: "Before I move on — is there anything here you'd like me to dig into further?", when:'Checking in mid-framework' },
    { phrase: "Having established that [X], the natural next question is [Y].", when:'Linking analysis steps logically' },
    { phrase: "That data point changes my hypothesis. Let me update my thinking: [revised view].", when:'Demonstrating intellectual flexibility' },
    { phrase: "Let me step back for a second — I want to make sure we're focused on the right issue before going deeper.", when:'Course-correcting mid-analysis' }
  ],
  'Synthesis & Recommendations': [
    { phrase: "Synthesizing what we've found: the core issue is [X], driven by [Y], and the highest-impact solution is [Z].", when:'Delivering the final synthesis' },
    { phrase: "Based on our analysis, I'd recommend [X]. The key rationale is [Y], and the main risk to manage is [Z].", when:'Giving a recommendation with rationale' },
    { phrase: "My recommendation is [X], contingent on [Y]. If [Y] turns out to be false, we should reconsider [Z].", when:'Making a conditional recommendation' },
    { phrase: "The data points to one conclusion: [X]. The implication for our client is [Y], and the next step is [Z].", when:'Driving to a clear conclusion' },
    { phrase: "If I had to prioritize, I'd focus the first 90 days on [X] — it has the highest impact and lowest execution risk.", when:'Providing a prioritized action plan' }
  ]
};

// ===================================================================
// MATH PROBLEM GENERATORS
// ===================================================================

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function fmt(n) { return n.toLocaleString(); }

const generators = {
  mental(difficulty) {
    if (difficulty === 'easy') {
      const a = rand(10, 99), b = rand(2, 9);
      return { label:'MENTAL MATH', q:`${a} × ${b} = ?`, a: a * b, unit:'', explain:`${a} × ${b} = ${a*b}` };
    } else if (difficulty === 'medium') {
      const t = rand(0, 2);
      if (t === 0) {
        const a = rand(12, 99), b = rand(12, 49);
        return { label:'MENTAL MATH', q:`${a} × ${b} = ?`, a: a*b, unit:'', explain:`${a} × ${b} = ${a*b}\nTip: ${Math.floor(a/10)*10} × ${b} = ${Math.floor(a/10)*10*b}, then add ${a%10} × ${b} = ${(a%10)*b}` };
      } else if (t === 1) {
        const d = rand(2, 9), b = rand(10, 99);
        return { label:'MENTAL MATH', q:`${d * b} ÷ ${d} = ?`, a: b, unit:'', explain:`${d*b} ÷ ${d} = ${b}` };
      } else {
        const pct = pick([10,15,20,25,30,40,50]);
        const base = rand(1,10) * 100;
        return { label:'PERCENTAGE', q:`${pct}% of ${fmt(base)} = ?`, a: pct*base/100, unit:'', explain:`${base} × ${pct}/100 = ${pct*base/100}` };
      }
    } else {
      const a = rand(100, 999), b = rand(10, 49);
      return { label:'MENTAL MATH', q:`${a} × ${b} = ?`, a: a*b, unit:'', explain:`${a} × ${b} = ${a*b}\nTip: break into (${Math.floor(a/100)*100} × ${b}) + (${a%100} × ${b})` };
    }
  },
  percentage(difficulty) {
    if (difficulty === 'easy') {
      const old = pick([100,200,400,500,800,1000]), growth = pick([10,20,25,50]);
      const nv = old * (1 + growth / 100);
      return { label:'% CHANGE', q:`Revenue grew from $${fmt(old)}M to $${fmt(nv)}M.\nWhat is the growth rate?`, a: growth, unit:'%', explain:`(${fmt(nv)} − ${fmt(old)}) ÷ ${fmt(old)} × 100 = ${growth}%` };
    } else if (difficulty === 'medium') {
      const rev = pick([200,400,500,800,1000,1500]), m = pick([10,12,15,18,20,25]);
      const profit = rev * m / 100;
      return { label:'MARGIN MATH', q:`Revenue: $${rev}M\nOperating margin: ${m}%\nOperating profit = ?`, a: profit, unit:'M', explain:`$${rev}M × ${m}% = $${profit}M` };
    } else {
      const a = rand(200, 800), b = rand(200, 800);
      const ch = Math.round((b - a) / a * 100);
      return { label:'% CHANGE', q:`Value moved from ${fmt(a)} to ${fmt(b)}.\nWhat is the % change? (round to nearest %)`, a: ch, unit:'%', explain:`(${b} − ${a}) ÷ ${a} × 100 = ${ch}%` };
    }
  },
  market(difficulty) {
    const pop = pick([100,200,300,500]);
    const pct = pick([5,10,15,20,25,30]);
    const spend = pick([20,50,100,200,500]);
    const ans = Math.round(pop * pct / 100 * spend);
    if (difficulty === 'easy') {
      return { label:'MARKET MATH', q:`City of ${pop}M people.\n${pct}% use Product X, avg $${spend}/year.\nAnnual market size?`, a: ans, unit:'M', explain:`${pop}M × ${pct}% × $${spend} = $${fmt(ans)}M` };
    } else {
      const subPct = pick([30,40,50,60]);
      const convPct = pick([5,8,10,12,15]);
      const actualAns = Math.round(pop * subPct/100 * convPct/100 * spend * 12);
      return { label:'MARKET MATH', q:`Population: ${pop}M\n${subPct}% are target demographic\n${convPct}% of those are buyers\nAvg monthly spend: $${spend}\nAnnual market size?`, a: actualAns, unit:'M', explain:`${pop}M × ${subPct}% × ${convPct}% × $${spend} × 12 = $${fmt(actualAns)}M` };
    }
  },
  pnl(difficulty) {
    const rev = pick([100,200,400,500,800,1000]);
    const cogsPct = pick([40,45,50,55,60]);
    const sga = pick([20,40,50,80,100]);
    const gross = rev * (1 - cogsPct/100);
    const ebit = gross - sga;
    if (difficulty === 'easy') {
      return { label:'P&L MATH', q:`Revenue: $${rev}M\nCOGS: ${cogsPct}% of revenue\nGross Profit = ?`, a: gross, unit:'M', explain:`$${rev}M × (1 − ${cogsPct}%) = $${gross}M` };
    } else {
      return { label:'P&L MATH', q:`Revenue: $${rev}M | COGS: ${cogsPct}%\nSG&A: $${sga}M\nEBIT = ?`, a: ebit, unit:'M', explain:`Gross Profit = $${rev}M × ${100-cogsPct}% = $${gross}M\nEBIT = $${gross}M − $${sga}M = $${ebit}M` };
    }
  },
  growth(difficulty) {
    const start = pick([50,100,200,400,500]);
    const years = pick([2,3,4,5]);
    const cagr = pick([7,10,12,15,18,20,25]);
    const end = Math.round(start * Math.pow(1 + cagr/100, years));
    if (difficulty === 'easy') {
      return { label:'CAGR', q:`Revenue doubles from $${start}M to $${start*2}M in ${Math.round(72/cagr)} years.\nApproximate CAGR?`, a: cagr, unit:'%', explain:`Rule of 72: 72 ÷ ${Math.round(72/cagr)} years ≈ ${cagr}% CAGR` };
    } else {
      return { label:'CAGR', q:`Revenue grew from $${start}M to $${end}M over ${years} years.\nApproximate CAGR?`, a: cagr, unit:'%', explain:`$${start}M × (1 + ${cagr}%)^${years} ≈ $${end}M\nCAGR ≈ ${cagr}%` };
    }
  }
};

function generateProblem(type, difficulty) {
  return (generators[type] || generators.mental)(difficulty);
}

function checkAnswer(input, correct, type) {
  const clean = String(input).replace(/[$,MBK%]/gi,'').trim();
  const user = parseFloat(clean);
  if (isNaN(user)) return false;
  const tols = { mental:0.001, percentage:0.03, market:0.3, pnl:0.05, growth:0.04 };
  const tol = tols[type] || 0.05;
  if (Math.abs(correct) < 0.001) return Math.abs(user) < 1;
  return Math.abs(user - correct) / Math.abs(correct) <= tol;
}

function parseJSONResponse(text) {
  try { return JSON.parse(text); } catch {}
  const m = text.match(/\{[\s\S]*\}/);
  if (m) try { return JSON.parse(m[0]); } catch {}
  return null;
}

// ===================================================================
// MARKET SIZING LAB
// ===================================================================

const SIZING_PROBLEMS = [
  { title:'US Gym Membership Market', difficulty:'Beginner', intro:'Estimate the total annual revenue of US gym and fitness club memberships.',
    steps:[
      { q:'US adult population (18+)?', benchmark:260, unit:'M people', hint:'Total US pop ~330M, about 80% are adults' },
      { q:'% who have a gym membership?', benchmark:20, unit:'%', hint:'About 1 in 5 Americans has a gym membership' },
      { q:'Average annual membership cost ($)?', benchmark:540, unit:'$/year', hint:'Ranges from $120 (Planet Fitness) to $1,800+ (Equinox)' },
      { q:'Total annual market size ($)?', benchmark:28080, unit:'M', hint:'Population × % members × avg cost' }
    ], conclusion:'~$28–30B annually. Cross-check: ~60M members × ~$500/year ≈ $30B. ✓' },
  { title:'US Coffee Shop Market', difficulty:'Intermediate', intro:'Estimate the annual US market for coffee shop revenue.',
    steps:[
      { q:'Total US population?', benchmark:330, unit:'M people', hint:'~330M' },
      { q:'% who visit coffee shops at least once a week?', benchmark:35, unit:'%', hint:'Frequent visitors — exclude those who only brew at home' },
      { q:'Average visits per week (for regular visitors)?', benchmark:3, unit:'visits/week', hint:'Think about the morning routine and work days' },
      { q:'Average spend per visit ($)?', benchmark:7, unit:'$/visit', hint:'Latte + pastry ~$8–9, plain drip ~$3–4' },
      { q:'Total annual market size ($M)?', benchmark:128205, unit:'M', hint:'Pop × % × visits/week × spend × 52 weeks' }
    ], conclusion:'330M × 35% × 3 × $7 × 52 ≈ $127B. Industry puts US coffee shops at $100–130B. ✓' },
  { title:'Global App Store Revenue', difficulty:'Hard', intro:'Estimate total global annual revenue of both major mobile app stores combined.',
    steps:[
      { q:'Total smartphone users globally?', benchmark:6000, unit:'M users', hint:'~6 billion smartphones in use worldwide' },
      { q:'% who spend money in apps per year?', benchmark:20, unit:'%', hint:'High in US/Europe, low in emerging markets. Blended ~15–25%' },
      { q:'Average annual spend per paying user ($)?', benchmark:50, unit:'$/year', hint:'Mix of $0.99 apps to $99+/yr subscriptions' },
      { q:'App store take rate?', benchmark:30, unit:'%', hint:'Standard is 30%, 15% for subscriptions after year 1' },
      { q:'Total app store revenue ($M)?', benchmark:18000, unit:'M', hint:'Total GMV × take rate' }
    ], conclusion:'6B × 20% × $50 = $60B GMV × 30% = $18B. Apple reports ~$20–22B in App Store services. ✓' }
];

// ===================================================================
// STATE
// ===================================================================

const CASEBOOKS_KEY = 'cc_casebooks_v2';

const state = {
  tab:'coach', coachSection:'practice', mathSection:'drill',
  caseFilter:'All', currentCase:null,
  caseTimer:null, caseSeconds:0, caseTimerRunning:false,
  drill:{ type:'mental', difficulty:'easy', count:10, timePerQ:30, active:false,
    questions:[], index:0, correct:0, streak:0, bestStreak:0,
    timer:null, secondsLeft:30, answered:false, countdownTimer:null },
  sizing:{ problemIndex:0, stepIndex:0 },
  phraseCategory:null,
  casebooks:[],
  stats: JSON.parse(localStorage.getItem('cc_stats') || '{"cases":[],"drills":[]}'),
  apiKey: localStorage.getItem('cc_apikey') || ''
};

function saveStats() { localStorage.setItem('cc_stats', JSON.stringify(state.stats)); }
function loadCasebooksFromStorage() {
  try { return JSON.parse(localStorage.getItem(CASEBOOKS_KEY) || '[]'); } catch { return []; }
}
function saveCasebooksToStorage(books) {
  try { localStorage.setItem(CASEBOOKS_KEY, JSON.stringify(books)); }
  catch { toast('Storage limit reached. Delete old case books to add new ones.', 'error'); }
}

// ===================================================================
// ANTHROPIC API (direct browser call)
// ===================================================================

async function callAnthropic(apiKey, system, userMessage, maxTokens = 1024) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-client-side-api': 'allow'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userMessage }]
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

// ===================================================================
// TOAST
// ===================================================================

function toast(msg, type = 'info') {
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(() => { el.style.animation = 'slideOut .25s ease forwards'; setTimeout(() => el.remove(), 300); }, 3500);
}

// ===================================================================
// SETTINGS
// ===================================================================

function openSettings() {
  document.getElementById('settings-api-key').value = state.apiKey;
  document.getElementById('settings-modal').classList.remove('hidden');
}
function closeSettings() { document.getElementById('settings-modal').classList.add('hidden'); }
function closeSettingsIfOutside(e) { if (e.target === document.getElementById('settings-modal')) closeSettings(); }
function saveSettings() {
  const key = document.getElementById('settings-api-key').value.trim();
  state.apiKey = key;
  localStorage.setItem('cc_apikey', key);
  closeSettings();
  toast(key ? '✓ API key saved — AI feedback enabled' : 'API key cleared', key ? 'success' : 'info');
}

// ===================================================================
// NAVIGATION
// ===================================================================

function switchTab(tab) {
  state.tab = tab;
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.querySelectorAll('.main-nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.main-nav-btn').forEach(b => {
    if (b.textContent.toLowerCase().includes(tab === 'coach' ? 'case' : 'math')) b.classList.add('active');
  });
  if (tab === 'math') renderMathStats();
}

function showCoachSection(section) {
  state.coachSection = section;
  document.querySelectorAll('#tab-coach .section').forEach(s => s.classList.remove('active'));
  document.getElementById(`section-${section}`).classList.add('active');
  document.querySelectorAll('#tab-coach .sidebar-item').forEach(b => b.classList.remove('active'));
  document.getElementById(`nav-${section}`)?.classList.add('active');
  if (section === 'casebooks') loadCasebooks();
  if (section === 'phrases' && !state.phraseCategory) showPhraseCategory(Object.keys(PHRASES)[0]);
}

function showMathSection(section) {
  state.mathSection = section;
  document.querySelectorAll('#tab-math .section').forEach(s => s.classList.remove('active'));
  document.getElementById(`section-${section}`).classList.add('active');
  document.querySelectorAll('#tab-math .sidebar-item').forEach(b => b.classList.remove('active'));
  document.getElementById(`nav-${section}`)?.classList.add('active');
  if (section === 'sizing') renderSizingProblem();
  if (section === 'mathstats') renderMathStats();
}

// ===================================================================
// CASE INTERVIEW
// ===================================================================

function filterCases(type) {
  state.caseFilter = type;
  document.querySelectorAll('#case-filters .chip').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('#case-filters .chip').forEach(c => { if (c.textContent === type) c.classList.add('active'); });
  renderCaseGrid();
}

function renderCaseGrid() {
  const filtered = state.caseFilter === 'All' ? CASES : CASES.filter(c => c.type === state.caseFilter);
  document.getElementById('case-grid').innerHTML = filtered.map(c => `
    <div class="case-card ${state.currentCase?.id === c.id ? 'selected' : ''}" onclick="selectCase(${c.id})">
      <div class="case-card-top"><div class="case-card-company">${c.company}</div></div>
      <div class="case-card-meta">
        <span class="badge badge-type">${c.type}</span>
        <span class="badge badge-${c.difficulty.toLowerCase()}">${c.difficulty}</span>
        <span class="badge badge-neutral">${c.industry}</span>
      </div>
      <div class="case-card-desc">${c.prompt.slice(0,110)}...</div>
    </div>`).join('');
}

function selectCase(idOrData) {
  const caseData = typeof idOrData === 'number' ? CASES.find(c => c.id === idOrData) : idOrData;
  if (!caseData) return;
  state.currentCase = caseData;
  clearTimer();
  document.getElementById('active-case-area').style.display = 'block';
  document.getElementById('case-prompt-company').textContent = caseData.company || caseData.title || 'Case';
  document.getElementById('case-prompt-badges').innerHTML = `<span class="badge badge-type">${caseData.type}</span><span class="badge badge-${(caseData.difficulty||'').toLowerCase()}">${caseData.difficulty||''}</span>`;
  document.getElementById('case-prompt-text').textContent = caseData.prompt;
  const hintBox = document.getElementById('case-hint-box');
  if (caseData.hints?.length && caseData.difficulty === 'Beginner') {
    hintBox.style.display = 'block';
    document.getElementById('case-hints-list').innerHTML = caseData.hints.map(h => `<div style="margin-top:4px">• ${h}</div>`).join('');
  } else { hintBox.style.display = 'none'; }
  const fuBox = document.getElementById('case-followup-box');
  if (caseData.followup) { fuBox.style.display = 'block'; document.getElementById('case-followup-text').textContent = caseData.followup; }
  else { fuBox.style.display = 'none'; }
  const srcBox = document.getElementById('case-source-info');
  if (caseData.source) { srcBox.style.display = 'block'; srcBox.innerHTML = `📚 Generated from <strong>${caseData.source}</strong>`; }
  else { srcBox.style.display = 'none'; }
  document.getElementById('response-textarea').value = '';
  document.getElementById('word-count').textContent = '0 words';
  document.getElementById('feedback-area').innerHTML = '';
  document.getElementById('active-case-area').scrollIntoView({ behavior:'smooth', block:'start' });
  renderCaseGrid();
}

function clearCase() {
  state.currentCase = null;
  clearTimer();
  document.getElementById('active-case-area').style.display = 'none';
  renderCaseGrid();
}

function updateWordCount() {
  const txt = document.getElementById('response-textarea').value.trim();
  const wc = txt ? txt.split(/\s+/).length : 0;
  document.getElementById('word-count').textContent = `${wc} word${wc !== 1 ? 's' : ''}`;
}

function toggleTimer() {
  if (state.caseTimerRunning) {
    clearTimer(); document.getElementById('timer-btn').textContent = 'Start Timer';
  } else {
    state.caseTimerRunning = true;
    document.getElementById('timer-btn').textContent = 'Stop Timer';
    document.getElementById('timer-display').classList.add('running');
    document.getElementById('timer-icon').textContent = '▶';
    state.caseTimer = setInterval(() => {
      state.caseSeconds++;
      const m = Math.floor(state.caseSeconds/60).toString().padStart(2,'0');
      const s = (state.caseSeconds%60).toString().padStart(2,'0');
      document.getElementById('timer-text').textContent = `${m}:${s}`;
    }, 1000);
  }
}

function clearTimer() {
  if (state.caseTimer) { clearInterval(state.caseTimer); state.caseTimer = null; }
  state.caseTimerRunning = false; state.caseSeconds = 0;
  document.getElementById('timer-text').textContent = '00:00';
  document.getElementById('timer-icon').textContent = '⏱';
  document.getElementById('timer-display').classList.remove('running');
  document.getElementById('timer-btn').textContent = 'Start Timer';
}

async function submitResponse() {
  const response = document.getElementById('response-textarea').value.trim();
  if (!response || response.length < 30) { toast('Write at least a sentence or two before getting feedback.', 'error'); return; }
  if (!state.currentCase) return;
  clearTimer();
  const btn = document.getElementById('submit-btn');
  btn.disabled = true; btn.textContent = 'Analyzing...';
  document.getElementById('feedback-area').innerHTML = `<div class="loading-state card" style="margin-top:16px"><div class="spinner"></div><span>Getting feedback from your AI coach...</span></div>`;

  let feedback;
  try {
    if (state.apiKey) {
      const system = `You are a senior McKinsey partner conducting case interview feedback. Be direct, specific, and actionable.
Return ONLY valid JSON — no markdown, no backticks:
{"overall_score":<1-10>,"framework_score":<1-10>,"communication_score":<1-10>,"hypothesis_score":<1-10>,"strengths":["<strength>","<strength>"],"improvements":["<improvement>","<improvement>","<improvement>"],"overall_feedback":"<3-4 sentence assessment>","ideal_framework":"<2-3 sentences on optimal approach>","pass":<true if overall>=7>}`;
      const text = await callAnthropic(state.apiKey, system, `Case Type: ${state.currentCase.type}\n\nCase Prompt:\n${state.currentCase.prompt}\n\nCandidate Response:\n${response}`);
      feedback = parseJSONResponse(text);
      if (!feedback) throw new Error('parse failed');
    } else { throw new Error('no key'); }
  } catch (err) {
    feedback = localFeedback(state.currentCase.type, response);
    if (state.apiKey && err.message !== 'no key' && err.message !== 'parse failed') {
      toast('AI unavailable — showing local feedback instead.', 'info');
    }
  }

  renderFeedback(feedback);
  updateCaseStats(feedback.overall_score);
  btn.disabled = false; btn.textContent = 'Get AI Feedback →';
}

function localFeedback(caseType, response) {
  const wc = response.split(/\s+/).length;
  const hasNums = /\$|\d+%|\d+[Mmb]|million|billion/i.test(response);
  const hasStructure = /first|second|third|1\.|2\.|3\.|revenue|cost|market|customer|framework|approach/i.test(response);
  const hasHypothesis = /hypothesis|believe|likely|probably|suggest|seems|appears/i.test(response);
  const hasMECE = /mece|segment|bucket|split|divide|break/i.test(response);
  let fw = 5, comm = 5, hyp = 4;
  if (wc > 80) fw++; if (wc > 150) fw++;
  if (hasStructure) fw++; if (hasMECE) fw++;
  if (hasHypothesis) hyp += 2; if (hasNums) hyp++;
  if (wc > 60 && wc < 350) comm++; if (hasStructure) comm++;
  fw = Math.min(fw, 9); comm = Math.min(comm, 9); hyp = Math.min(hyp, 9);
  const overall = +((fw + comm + hyp) / 3).toFixed(1);
  const tips = {
    'Profitability':{ improvements:['Explicitly split Revenue vs. Cost before going deeper into either','Always benchmark against industry — is this internal or external?','Lead with a hypothesis: which side do you believe is the bigger issue?'], ideal:'Profit = Revenue − Cost. Segment revenue by Price × Volume, costs by Fixed vs. Variable. Identify which segment or unit is underperforming vs. benchmark.' },
    'Market Entry':{ improvements:['Assess market attractiveness (size, growth, competition) before your firm\'s fit','Always make a clear Go/No-Go recommendation with conditions','Consider entry mode: organic build vs. acquisition vs. partnership'], ideal:'Market Attractiveness → Company Fit → Risk → Recommendation. Define the right to win before committing.' },
    'Market Sizing':{ improvements:['Define market scope clearly before estimating — geography, category, time period','Show your math step-by-step; the process is as important as the answer','Always do a sanity check by cross-referencing from a different angle'], ideal:'Anchor on a population, segment MECE-ally, apply penetration and spend rates, cross-check top-down vs. bottom-up.' },
    'M&A':{ improvements:['Lead with strategic rationale — why this deal, not just what it costs','Quantify synergies specifically; vague claims are a red flag','Address integration risk — most deals fail in execution, not in thesis'], ideal:'Strategic rationale → Target quality → Synergy quantification → Valuation justification → Risk & integration.' },
    'Operations':{ improvements:['Map the value chain before proposing solutions — diagnose before you fix','Use internal benchmarks (plant vs. plant) as well as external','Prioritize solutions by impact vs. ease of implementation'], ideal:'Baseline current costs → Benchmark internally and externally → Root cause by bucket → Prioritize solutions by impact × feasibility.' },
    'Pricing':{ improvements:['Lead with value-based pricing (customer WTP) not cost-plus','Segment customers — WTP varies widely across customer types','Consider the full pricing architecture: tiers, bundles, value metrics'], ideal:'Value-based (WTP by segment) → Cost floor → Competitive positioning → Pricing model → Market access strategy.' },
    'Competitive':{ improvements:['Pressure-test the threat — is it as large as claimed?','Identify which specific customer segments are at risk vs. defensible','Avoid recommending a pure price war without modeling the P&L impact'], ideal:'Understand the threat → Assess your position → Evaluate response options → Recommend with sequenced actions.' }
  };
  const t = tips[caseType] || tips['Profitability'];
  return { overall_score:overall, framework_score:fw, communication_score:comm, hypothesis_score:hyp,
    strengths: wc > 100 ? ['Shows structured thinking and engagement with the problem','Reasonable attempt at identifying key issue areas'] : ['Engaged with the problem statement'],
    improvements: t.improvements,
    overall_feedback: `Your response shows ${overall >= 7 ? 'solid' : 'developing'} case interview fundamentals. ${wc < 80 ? 'Expand your response — interviewers want to see your full thinking, not just the headline.' : 'Good response length.'} Add an API key in Settings for personalized AI feedback.`,
    ideal_framework: t.ideal, pass: overall >= 7, local: true };
}

function renderFeedback(fb) {
  const scoreColor = s => s >= 8 ? '#10b981' : s >= 6 ? '#f59e0b' : '#ef4444';
  const ring = (score, color) => {
    const r = 30, circ = 2 * Math.PI * r, offset = circ - (score/10) * circ;
    return `<svg width="72" height="72" viewBox="0 0 72 72"><circle cx="36" cy="36" r="${r}" fill="none" stroke="#e2e8f0" stroke-width="5.5"/><circle cx="36" cy="36" r="${r}" fill="none" stroke="${color}" stroke-width="5.5" stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}" stroke-linecap="round" transform="rotate(-90 36 36)"/></svg>`;
  };
  const scores = [{label:'Overall',val:fb.overall_score},{label:'Framework',val:fb.framework_score},{label:'Communication',val:fb.communication_score},{label:'Hypothesis',val:fb.hypothesis_score}];
  document.getElementById('feedback-area').innerHTML = `
    <div class="feedback-section">
      <div class="feedback-header">
        <div class="section-title" style="font-size:18px">Feedback</div>
        <span class="pass-badge ${fb.pass ? 'pass' : 'fail'}">${fb.pass ? '✓ Pass' : '✗ Needs Work'}</span>
        ${fb.local ? '<span class="badge badge-neutral">Local Analysis</span>' : '<span class="badge badge-type">AI Feedback</span>'}
      </div>
      <div class="score-grid">
        ${scores.map(s => `<div class="score-item"><div class="score-circle-wrap">${ring(s.val, scoreColor(s.val))}<div class="score-circle-num"><span class="num" style="color:${scoreColor(s.val)}">${s.val.toFixed(1)}</span><span class="denom">/10</span></div></div><div class="score-label">${s.label}</div></div>`).join('')}
      </div>
      <div class="feedback-overall"><div class="feedback-list-title" style="color:var(--text)">📝 Overall Assessment</div><div class="feedback-overall-text">${fb.overall_feedback}</div></div>
      <div class="feedback-body">
        <div class="feedback-list-card"><div class="feedback-list-title" style="color:var(--success)">✓ Strengths</div>${(fb.strengths||[]).map(s => `<div class="feedback-list-item"><span style="color:var(--success);flex-shrink:0">✓</span>${s}</div>`).join('')}</div>
        <div class="feedback-list-card"><div class="feedback-list-title" style="color:var(--warning)">→ Improvements</div>${(fb.improvements||[]).map(s => `<div class="feedback-list-item"><span style="color:var(--warning);flex-shrink:0">→</span>${s}</div>`).join('')}</div>
      </div>
      <div class="feedback-ideal"><div class="feedback-ideal-label">Ideal Framework for this Case</div><div class="feedback-ideal-text">${fb.ideal_framework}</div></div>
      <div style="display:flex;gap:10px;margin-top:16px">
        <button class="btn btn-primary" onclick="clearCase()">Practice Next Case</button>
        <button class="btn btn-secondary" onclick="document.getElementById('response-textarea').value='';document.getElementById('feedback-area').innerHTML='';document.getElementById('word-count').textContent='0 words'">Try Again</button>
      </div>
    </div>`;
}

function updateCaseStats(score) {
  state.stats.cases.push({ date: new Date().toDateString(), score, type: state.currentCase?.type });
  saveStats(); updateSidebarStats();
}

function updateSidebarStats() {
  const today = new Date().toDateString();
  const todayCases = state.stats.cases.filter(c => c.date === today);
  document.getElementById('stat-cases-today').textContent = todayCases.length;
  if (todayCases.length > 0) {
    const avg = todayCases.reduce((a,c) => a + c.score, 0) / todayCases.length;
    document.getElementById('stat-session-avg').textContent = avg.toFixed(1);
  }
  const todayDrills = state.stats.drills.filter(d => d.date === today);
  document.getElementById('stat-drills-today').textContent = todayDrills.length;
  const allAcc = state.stats.drills.map(d => d.accuracy);
  if (allAcc.length) document.getElementById('stat-best-acc').textContent = Math.max(...allAcc).toFixed(0) + '%';
  const allStreaks = state.stats.drills.map(d => d.bestStreak || 0);
  if (allStreaks.length) document.getElementById('stat-best-streak').textContent = Math.max(...allStreaks);
  document.getElementById('stat-streak').textContent = state.drill.bestStreak || 0;
}

// ===================================================================
// FRAMEWORKS
// ===================================================================

function renderFrameworks() {
  document.getElementById('fw-grid').innerHTML = FRAMEWORKS.map(fw => `
    <div class="fw-card" id="fw-${fw.id}" onclick="toggleFramework('${fw.id}')">
      <div class="fw-icon">${fw.icon}</div>
      <div class="fw-name">${fw.name}</div>
      <div class="fw-when">${fw.when}</div>
      <div class="fw-detail">
        <div class="fw-section-title">Structure</div>
        <div class="fw-tree">${fw.structure.map(n => `<div class="fw-tree-item l${n.l}">${n.t}</div>`).join('')}</div>
        <div class="fw-section-title">Key Questions to Ask</div>
        <ul class="fw-questions">${fw.questions.map(q => `<li>${q}</li>`).join('')}</ul>
        <div class="fw-section-title">Common Mistakes</div>
        <ul class="fw-mistakes">${fw.mistakes.map(m => `<li>${m}</li>`).join('')}</ul>
        <div class="fw-section-title">Sample Opening</div>
        <div class="fw-opening">${fw.opening}</div>
      </div>
    </div>`).join('');
}

function toggleFramework(id) {
  const el = document.getElementById(`fw-${id}`);
  const was = el.classList.contains('expanded');
  document.querySelectorAll('.fw-card').forEach(c => c.classList.remove('expanded'));
  if (!was) el.classList.add('expanded');
}

// ===================================================================
// PHRASE BANK
// ===================================================================

function renderPhraseTabs() {
  document.getElementById('phrase-tabs').innerHTML = Object.keys(PHRASES).map(c => `
    <button class="phrase-tab ${state.phraseCategory === c ? 'active' : ''}" onclick="showPhraseCategory('${c}')">${c}</button>`).join('');
}

function showPhraseCategory(cat) {
  state.phraseCategory = cat;
  renderPhraseTabs();
  document.getElementById('phrase-list').innerHTML = (PHRASES[cat]||[]).map(p => `
    <div class="phrase-item">
      <div class="phrase-text">
        <div class="phrase-quote">"${p.phrase}"</div>
        <div class="phrase-when">When to use: ${p.when}</div>
      </div>
      <button class="phrase-copy-btn" onclick="copyPhrase(this, '${p.phrase.replace(/'/g,"\\'").replace(/"/g,"&quot;")}')">📋</button>
    </div>`).join('');
}

function copyPhrase(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '✓'; btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '📋'; btn.classList.remove('copied'); }, 1500);
  });
}

// ===================================================================
// CASE BOOKS — client-side PDF + localStorage
// ===================================================================

function handleDragOver(e) { e.preventDefault(); document.getElementById('upload-zone').classList.add('dragging'); }
function handleDragLeave() { document.getElementById('upload-zone').classList.remove('dragging'); }
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('upload-zone').classList.remove('dragging');
  const file = e.dataTransfer.files[0];
  if (file) uploadCasebook(file);
}
function handleFileSelect(e) { if (e.target.files[0]) uploadCasebook(e.target.files[0]); }

async function uploadCasebook(file) {
  if (!file.name.toLowerCase().endsWith('.pdf')) { toast('Please upload a PDF file.', 'error'); return; }
  const prog = document.getElementById('upload-progress');
  prog.style.display = 'flex';
  document.getElementById('upload-progress-text').textContent = `Extracting text from ${file.name}...`;
  document.getElementById('upload-zone').style.opacity = '0.5';

  try {
    let text = '', pages = 0;

    // Use PDF.js if available (loaded from CDN)
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      pages = pdf.numPages;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
      }
    } else {
      throw new Error('PDF library not loaded. Please refresh the page and try again.');
    }

    if (!text || text.trim().length < 200) {
      throw new Error('Could not extract text from this PDF. Please use a text-based (not scanned) PDF.');
    }

    document.getElementById('upload-progress-text').textContent = 'Analyzing case book...';

    let metadata = { title: file.name.replace(/\.pdf$/i, ''), firm: 'Unknown', caseCount: null, topics: [] };
    if (state.apiKey) {
      try {
        const metaSystem = 'Analyze this consulting case book excerpt and return ONLY valid JSON (no markdown):\n{"title":"<title>","firm":"<consulting firm or Unknown>","caseCount":<int or null>,"topics":["<topic>"]}\nTopics only from: Profitability, Market Entry, Market Sizing, M&A, Operations, Pricing, Competitive, Growth';
        const metaText = await callAnthropic(state.apiKey, metaSystem, text.slice(0, 3000), 256);
        const parsed = parseJSONResponse(metaText);
        if (parsed) metadata = { ...metadata, ...parsed };
      } catch {}
    }

    const casebook = {
      id: `book_${Date.now()}`, name: metadata.title, firm: metadata.firm,
      caseCount: metadata.caseCount, topics: metadata.topics || [],
      pages, uploadedAt: new Date().toISOString(),
      excerpt: text.slice(0, 8000)
    };

    state.casebooks.push(casebook);
    saveCasebooksToStorage(state.casebooks);
    renderCasebooks();
    toast(`✓ "${casebook.name}" ready`, 'success');
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    prog.style.display = 'none';
    document.getElementById('upload-zone').style.opacity = '1';
    document.getElementById('file-input').value = '';
  }
}

function loadCasebooks() {
  state.casebooks = loadCasebooksFromStorage();
  renderCasebooks();
}

function renderCasebooks() {
  const grid = document.getElementById('books-grid');
  const empty = document.getElementById('books-empty');
  if (!state.casebooks.length) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  grid.innerHTML = state.casebooks.map(b => `
    <div class="book-card">
      <div class="book-card-header">
        <div class="book-icon">📚</div>
        <div>
          <div class="book-title">${b.name}</div>
          <div class="book-firm">${b.firm !== 'Unknown' ? b.firm : 'Uploaded case book'}${b.pages ? ` · ${b.pages} pages` : ''}${b.caseCount ? ` · ~${b.caseCount} cases` : ''}</div>
        </div>
      </div>
      ${b.topics?.length ? `<div class="book-meta tag-row">${b.topics.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
      <div class="book-actions">
        <select class="difficulty-select" id="diff-${b.id}">
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Hard">Hard</option>
        </select>
        <button class="btn btn-primary btn-sm" onclick="generateFromBook('${b.id}')">Generate Case</button>
        <button class="btn btn-icon" onclick="deleteBook('${b.id}')" title="Delete">🗑</button>
      </div>
    </div>`).join('');
}

async function generateFromBook(bookId) {
  if (!state.apiKey) { toast('Add your Anthropic API key in Settings to generate cases from case books.', 'error'); openSettings(); return; }
  const diffEl = document.getElementById(`diff-${bookId}`);
  const difficulty = diffEl?.value || 'Intermediate';
  const book = state.casebooks.find(b => b.id === bookId);
  if (!book) { toast('Book not found', 'error'); return; }
  toast(`Generating ${difficulty} case from "${book.name}"...`, 'info');
  const diffGuide = {
    Beginner:'Simple, clear problem. Single main driver. Obvious framework. Include 2 helpful hints.',
    Intermediate:'Moderate complexity, standard MBB format, some ambiguity, one follow-up question.',
    Hard:'Complex, multi-dimensional, requires cross-framework synthesis, significant ambiguity.'
  }[difficulty] || 'Standard.';
  const system = `You are a case interview coach generating practice cases from consulting case books. Match the firm's style.
Difficulty: ${difficulty} — ${diffGuide}
Return ONLY valid JSON (no markdown):
{"company":"<realistic company>","type":"<Profitability|Market Entry|Market Sizing|M&A|Operations|Pricing|Competitive>","difficulty":"${difficulty}","prompt":"<120-200 word case prompt>","followup":"<one follow-up question>","hints":["<hint>","<hint>"]}`;
  try {
    const text = await callAnthropic(state.apiKey, system, `Case book excerpt:\n${book.excerpt}\n\nGenerate a ${difficulty} case matching this firm's style.`, 768);
    const caseData = parseJSONResponse(text);
    if (!caseData) throw new Error('Could not generate case. Try again.');
    showCoachSection('practice');
    selectCase({ ...caseData, id:`gen_${Date.now()}`, source:book.name, bookId });
    toast(`✓ ${difficulty} case generated`, 'success');
  } catch (err) { toast(err.message, 'error'); }
}

function deleteBook(bookId) {
  if (!confirm('Delete this case book?')) return;
  state.casebooks = state.casebooks.filter(b => b.id !== bookId);
  saveCasebooksToStorage(state.casebooks);
  renderCasebooks();
  toast('Case book deleted', 'info');
}

// ===================================================================
// MATH DRILLS
// ===================================================================

function selectDrillType(el, type) {
  state.drill.type = type;
  document.querySelectorAll('.drill-type-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

function selectPill(el, group, val) {
  if (group === 'diff') state.drill.difficulty = val;
  if (group === 'count') state.drill.count = parseInt(val);
  if (group === 'time') state.drill.timePerQ = parseInt(val);
  el.closest('.pill-row').querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}

function startDrill() {
  const d = state.drill;
  d.questions = Array.from({ length: d.count }, () => generateProblem(d.type, d.difficulty));
  d.index = 0; d.correct = 0; d.streak = 0; d.bestStreak = 0; d.answered = false;
  document.getElementById('drill-setup-view').style.display = 'none';
  document.getElementById('drill-active-view').style.display = 'block';
  document.getElementById('drill-end-view').style.display = 'none';
  showQuestion();
}

function showQuestion() {
  const d = state.drill;
  if (d.index >= d.questions.length) { endDrill(); return; }
  const q = d.questions[d.index];
  d.answered = false;
  document.getElementById('drill-progress').textContent = `Question ${d.index + 1} of ${d.questions.length}`;
  document.getElementById('drill-correct-count').textContent = d.correct;
  const sb = document.getElementById('streak-badge');
  if (d.streak >= 2) { sb.style.display = 'flex'; document.getElementById('streak-count').textContent = d.streak; }
  else { sb.style.display = 'none'; }
  document.getElementById('q-type-label').textContent = q.label || 'DRILL';
  document.getElementById('q-text').textContent = q.q;
  const ai = document.getElementById('answer-input');
  ai.value = ''; ai.className = 'answer-input'; ai.disabled = false; ai.focus();
  const af = document.getElementById('answer-feedback');
  af.style.display = 'none'; af.className = 'answer-feedback';
  document.getElementById('submit-answer-btn').disabled = false;
  startDrillTimer();
}

function startDrillTimer() {
  clearDrillTimer();
  state.drill.secondsLeft = state.drill.timePerQ;
  updateTimerBar();
  state.drill.timer = setInterval(() => {
    state.drill.secondsLeft--;
    updateTimerBar();
    if (state.drill.secondsLeft <= 0) { clearDrillTimer(); if (!state.drill.answered) timeUp(); }
  }, 1000);
}

function clearDrillTimer() {
  if (state.drill.timer) { clearInterval(state.drill.timer); state.drill.timer = null; }
}

function updateTimerBar() {
  const pct = (state.drill.secondsLeft / state.drill.timePerQ) * 100;
  const fill = document.getElementById('timer-fill');
  fill.style.width = pct + '%';
  fill.className = 'timer-fill' + (pct < 20 ? ' danger' : pct < 40 ? ' warn' : '');
}

function timeUp() {
  state.drill.answered = true; state.drill.streak = 0;
  const q = state.drill.questions[state.drill.index];
  showAnswerResult(false, q.a, q.explain);
}

function handleAnswerKey(e) { if (e.key === 'Enter') submitDrillAnswer(); }

function submitDrillAnswer() {
  if (state.drill.answered) return;
  clearDrillTimer();
  state.drill.answered = true;
  const input = document.getElementById('answer-input').value;
  const q = state.drill.questions[state.drill.index];
  const correct = checkAnswer(input, q.a, state.drill.type);
  if (correct) { state.drill.correct++; state.drill.streak++; if (state.drill.streak > state.drill.bestStreak) state.drill.bestStreak = state.drill.streak; }
  else { state.drill.streak = 0; }
  showAnswerResult(correct, q.a, q.explain);
}

function showAnswerResult(correct, correctAnswer, explain) {
  const ai = document.getElementById('answer-input');
  ai.className = 'answer-input ' + (correct ? 'correct' : 'wrong'); ai.disabled = true;
  document.getElementById('submit-answer-btn').disabled = true;
  const af = document.getElementById('answer-feedback');
  af.className = 'answer-feedback ' + (correct ? 'correct' : 'wrong'); af.style.display = 'block';
  document.getElementById('feedback-icon').textContent = correct ? '✓' : '✗';
  document.getElementById('feedback-main').textContent = correct ? 'Correct!' : `Incorrect — the answer was ${correctAnswer.toLocaleString()}`;
  document.getElementById('feedback-explain').textContent = explain || '';
  let secs = 2;
  const cd = document.getElementById('next-countdown');
  cd.textContent = `Next in ${secs}s...`;
  if (state.drill.countdownTimer) clearInterval(state.drill.countdownTimer);
  state.drill.countdownTimer = setInterval(() => {
    secs--;
    if (secs > 0) { cd.textContent = `Next in ${secs}s...`; }
    else { clearInterval(state.drill.countdownTimer); state.drill.index++; showQuestion(); }
  }, 1000);
}

function endDrill() {
  clearDrillTimer();
  document.getElementById('drill-active-view').style.display = 'none';
  document.getElementById('drill-end-view').style.display = 'block';
  const d = state.drill;
  const pct = d.questions.length > 0 ? Math.round(d.correct / d.questions.length * 100) : 0;
  const circ = 2 * Math.PI * 46;
  const offset = circ - (pct/100) * circ;
  document.getElementById('end-ring').setAttribute('stroke-dashoffset', offset.toFixed(1));
  const ringColor = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
  document.getElementById('end-ring').setAttribute('stroke', ringColor);
  document.getElementById('end-pct').textContent = pct + '%';
  document.getElementById('end-pct').style.color = ringColor;
  document.getElementById('end-title').textContent = pct >= 90 ? 'Outstanding!' : pct >= 70 ? 'Solid work!' : pct >= 50 ? 'Keep practicing.' : 'More reps needed.';
  document.getElementById('end-sub').textContent = pct >= 70 ? `Building real fluency. Best streak: ${d.bestStreak}.` : `Focus on accuracy over speed first. Best streak: ${d.bestStreak}.`;
  document.getElementById('end-correct').textContent = d.correct;
  document.getElementById('end-total').textContent = d.questions.length;
  document.getElementById('end-streak').textContent = d.bestStreak;
  state.stats.drills.push({ date:new Date().toDateString(), type:d.type, difficulty:d.difficulty, correct:d.correct, total:d.questions.length, accuracy:pct, bestStreak:d.bestStreak });
  saveStats(); updateSidebarStats();
}

function endDrillEarly() {
  clearDrillTimer();
  if (state.drill.countdownTimer) clearInterval(state.drill.countdownTimer);
  if (state.drill.index > 0) endDrill(); else backToSetup();
}

function restartDrill() { document.getElementById('drill-end-view').style.display = 'none'; startDrill(); }
function backToSetup() {
  clearDrillTimer(); state.drill.active = false;
  document.getElementById('drill-setup-view').style.display = 'block';
  document.getElementById('drill-active-view').style.display = 'none';
  document.getElementById('drill-end-view').style.display = 'none';
}

// ===================================================================
// MARKET SIZING LAB
// ===================================================================

function renderSizingProblem() {
  const pi = state.sizing.problemIndex;
  const p = SIZING_PROBLEMS[pi];
  document.getElementById('sizing-content').innerHTML = `
    <div class="sizing-problem">
      <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap">
        ${SIZING_PROBLEMS.map((sp,i) => `<button class="chip ${i===pi?'active':''}" onclick="selectSizingProblem(${i})">${sp.title}</button>`).join('')}
      </div>
      <div class="card">
        <div class="card-header">
          <div><div class="card-title">${p.title}</div><div class="card-subtitle">${p.intro}</div></div>
          <span class="badge badge-${p.difficulty.toLowerCase()}">${p.difficulty}</span>
        </div>
        <div class="sizing-steps" id="sizing-steps">
          ${p.steps.map((step,i) => `
            <div class="sizing-step ${i===0?'active':''}" id="sstep-${i}">
              <div class="sizing-step-num">Step ${i+1} of ${p.steps.length}</div>
              <div class="sizing-step-q">${step.q}</div>
              <div class="sizing-input-row">
                <input type="number" class="sizing-input" id="si-${i}" placeholder="Your estimate...">
                <span style="font-size:13px;color:var(--text-muted)">${step.unit}</span>
                <button class="btn btn-primary btn-sm" onclick="checkSizingStep(${i})">Check →</button>
              </div>
              <div id="si-feedback-${i}" style="margin-top:8px;display:none;font-size:13px"></div>
            </div>`).join('')}
        </div>
        <div id="sizing-conclusion" style="display:none;margin-top:16px" class="feedback-ideal">
          <div class="feedback-ideal-label">Conclusion</div>
          <div class="feedback-ideal-text">${p.conclusion}</div>
        </div>
      </div>
    </div>`;
  state.sizing.stepIndex = 0;
}

function selectSizingProblem(i) {
  state.sizing.problemIndex = i; state.sizing.stepIndex = 0; renderSizingProblem();
}

function checkSizingStep(i) {
  const p = SIZING_PROBLEMS[state.sizing.problemIndex];
  const step = p.steps[i];
  const val = parseFloat(document.getElementById(`si-${i}`).value);
  if (isNaN(val)) { toast('Enter a number first.', 'error'); return; }
  const correct = Math.abs(val - step.benchmark) / step.benchmark <= 0.4;
  const fb = document.getElementById(`si-feedback-${i}`);
  fb.style.display = 'block';
  fb.innerHTML = correct
    ? `<span style="color:var(--success)">✓ Good estimate!</span> Benchmark: ~${step.benchmark.toLocaleString()} ${step.unit}. ${step.hint}`
    : `<span style="color:var(--warning)">Close, but refine it.</span> Benchmark: ~${step.benchmark.toLocaleString()} ${step.unit}. Hint: ${step.hint}`;
  document.getElementById(`sstep-${i}`).classList.remove('active'); document.getElementById(`sstep-${i}`).classList.add('done');
  state.sizing.stepIndex = i + 1;
  if (i + 1 < p.steps.length) {
    const next = document.getElementById(`sstep-${i+1}`);
    if (next) { next.classList.add('active'); next.querySelector('input')?.focus(); }
  } else { document.getElementById('sizing-conclusion').style.display = 'block'; }
}

// ===================================================================
// STATS
// ===================================================================

function renderMathStats() {
  const drills = state.stats.drills;
  const content = document.getElementById('math-stats-content');
  if (!drills.length) {
    content.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-title">No drill history yet</div><div class="empty-state-sub">Complete a Quick Drill to see your performance stats here.</div></div>`;
    return;
  }
  const avgAcc = (drills.reduce((a,d) => a + d.accuracy, 0) / drills.length).toFixed(0);
  const bestAcc = Math.max(...drills.map(d => d.accuracy));
  const bestStreak = Math.max(...drills.map(d => d.bestStreak || 0));
  const totalQ = drills.reduce((a,d) => a + d.total, 0);
  content.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-card-val">${drills.length}</div><div class="stat-card-label">Total Drills</div></div>
      <div class="stat-card"><div class="stat-card-val">${avgAcc}%</div><div class="stat-card-label">Average Accuracy</div></div>
      <div class="stat-card"><div class="stat-card-val">${bestAcc}%</div><div class="stat-card-label">Best Session</div></div>
      <div class="stat-card"><div class="stat-card-val">${bestStreak}</div><div class="stat-card-label">Best Streak</div></div>
      <div class="stat-card"><div class="stat-card-val">${totalQ}</div><div class="stat-card-label">Questions Done</div></div>
    </div>
    <div class="stat-history">
      <div class="stat-history-header">Recent Sessions</div>
      <div class="stat-history-row header"><div>Date</div><div>Type</div><div>Score</div><div>Accuracy</div></div>
      ${drills.slice(-15).reverse().map(d => `
        <div class="stat-history-row">
          <div>${d.date}</div>
          <div style="text-transform:capitalize">${d.type}</div>
          <div>${d.correct}/${d.total}</div>
          <div><span style="color:${d.accuracy>=80?'var(--success)':d.accuracy>=60?'var(--warning)':'var(--danger)'};font-weight:600">${d.accuracy}%</span></div>
        </div>`).join('')}
    </div>`;
}

// ===================================================================
// INIT
// ===================================================================

function init() {
  // Set up PDF.js worker
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
  renderCaseGrid();
  renderFrameworks();
  showPhraseCategory(Object.keys(PHRASES)[0]);
  updateSidebarStats();
  if (!state.apiKey) {
    setTimeout(() => toast('💡 Add your Anthropic API key in Settings to enable AI feedback.', 'info'), 1200);
  }
}

document.addEventListener('DOMContentLoaded', init);
