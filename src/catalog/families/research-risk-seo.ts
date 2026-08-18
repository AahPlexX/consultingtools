import { defineStandardCapability, type StandardCapabilitySeed } from "../define.js";

const seeds: readonly StandardCapabilitySeed[] = [
  {
    id: "evidence-synthesis", name: "Evidence synthesis", domain: "research", subdomain: "synthesis", status: "partial",
    summary: "Reconcile source facts, definitions, contradictions, assumptions, calculations, uncertainty, and implications into a traceable decision-ready evidence base.",
    businessQuestion: "What does the combined evidence support, where does it conflict, and what remains uncertain?", trigger: "synthesize evidence from multiple sources", antiTrigger: "when only one short source needs summarization with no comparison or decision synthesis",
    requiredInputs: ["evidence set or research question"], methodology: "Normalize definitions and dates, rank evidence quality, separate fact from inference, reconcile conflicts where possible, and preserve unresolved uncertainty."
  },
  {
    id: "source-discovery", name: "Public source discovery", domain: "research", subdomain: "source-discovery", status: "partial",
    summary: "Identify current public sources likely to contain decision-relevant evidence while prioritizing authoritative primary, official, institutional, and methodologically transparent sources.",
    businessQuestion: "Which public sources are most likely to answer this factual research question reliably?", trigger: "find authoritative public sources", antiTrigger: "when all required evidence is already supplied by the user",
    requiredInputs: ["research question"], methodology: "Translate the question into evidence needs, search broadly enough to find primary sources, rank candidate sources by authority relevance and freshness, and record gaps.", evidenceLevel: "current-external-evidence", surfaceRequirements: ["host-reasoning", "public-web"]
  },
  {
    id: "source-ranking", name: "Source quality ranking", domain: "research", subdomain: "source-quality", status: "partial",
    summary: "Rank candidate sources by authority, proximity to the underlying fact, methodology transparency, recency, independence, scope fit, and known limitations.",
    businessQuestion: "Which available sources deserve the most evidentiary weight for this claim?", trigger: "rank sources by reliability and relevance", antiTrigger: "when the task is sentiment analysis where source authority is not the construct being measured",
    requiredInputs: ["candidate sources", "claim or research question"], methodology: "Score or categorize evidence dimensions explicitly, prefer primary evidence when it answers the question, and explain why lower-tier sources are used if necessary."
  },
  {
    id: "freshness-validation", name: "Evidence freshness validation", domain: "research", subdomain: "freshness", status: "partial",
    summary: "Determine whether evidence is current enough for the claim by comparing publication date, event date, update cadence, volatility, and the decision's required as-of date.",
    businessQuestion: "Is this evidence fresh enough to support the claim as of the required date?", trigger: "verify whether research evidence is current", antiTrigger: "when the question is intentionally historical and the cited evidence matches that period",
    requiredInputs: ["claim", "source dates or metadata"], methodology: "Identify the claim's volatility and as-of requirement, distinguish event from publication date, check for newer authoritative evidence, and mark stale facts rather than silently reusing them.", evidenceLevel: "current-external-evidence"
  },
  {
    id: "claim-source-mapping", name: "Claim-to-source mapping", domain: "research", subdomain: "provenance", status: "partial",
    summary: "Map material factual claims to supporting source evidence so unsupported statements, citation gaps, and overly broad source attribution can be detected before delivery.",
    businessQuestion: "Which source supports each material factual claim in the analysis?", trigger: "map claims to supporting sources", antiTrigger: "when the content is purely creative and contains no factual assertions",
    requiredInputs: ["claims", "source set"], methodology: "Break prose into material claims, link each to the narrowest supporting evidence, flag unsupported or partially supported claims, and distinguish sources of data from sources of interpretation."
  },
  {
    id: "corroboration", name: "Source corroboration", domain: "research", subdomain: "verification", status: "partial",
    summary: "Test whether independent or primary evidence corroborates a material claim and identify when apparent agreement comes from sources repeating the same underlying origin.",
    businessQuestion: "Is this material claim independently supported or merely repeated?", trigger: "corroborate a factual claim", antiTrigger: "when one authoritative primary record is itself definitive for the requested fact",
    requiredInputs: ["claim", "candidate evidence"], methodology: "Trace sources to underlying origins, seek independent or primary confirmation proportional to stakes, compare definitions and dates, and report the remaining evidence strength."
  },
  {
    id: "conflict-detection", name: "Evidence conflict analysis", domain: "research", subdomain: "conflict-resolution", status: "partial",
    summary: "Detect and investigate conflicting claims or measurements by testing differences in definition, scope, date, methodology, geography, population, incentives, and source provenance.",
    businessQuestion: "Why do credible sources disagree and what can be concluded despite the conflict?", trigger: "resolve conflicting research evidence", antiTrigger: "when sources are actually measuring different constructs and no contradiction exists",
    requiredInputs: ["conflicting claims or sources"], methodology: "Normalize the compared claims, identify the dimension causing disagreement, seek stronger evidence, and preserve irreconcilable uncertainty instead of forcing a false single answer."
  },
  {
    id: "date-normalization", name: "Date and period normalization", domain: "research", subdomain: "normalization", status: "partial",
    summary: "Normalize source dates, fiscal periods, rolling windows, calendar years, event dates, publication dates, and as-of dates so evidence comparisons use compatible time bases.",
    businessQuestion: "Are these facts or metrics being compared over compatible dates and periods?", trigger: "normalize dates or reporting periods across sources", antiTrigger: "when all evidence already uses the same explicit period",
    requiredInputs: ["dated evidence"], methodology: "Identify each source's effective measurement period and publication date, convert to a common comparison basis where valid, and flag non-comparable windows."
  },
  {
    id: "quote-verification", name: "Quote verification", domain: "research", subdomain: "verification", status: "partial",
    summary: "Verify that a quoted statement appears in the cited source, preserves its substantive context, attribution, date, and meaning, and does not exceed supported wording.",
    businessQuestion: "Is this quote accurate, attributable, and represented in context?", trigger: "verify a quote against its source", antiTrigger: "when the request is to paraphrase supplied text rather than verify an external quote",
    requiredInputs: ["quote", "source"], methodology: "Locate the source passage, compare wording and attribution, inspect surrounding context and date, and flag truncation or context that materially changes meaning."
  },
  {
    id: "benchmark-normalization", name: "Benchmark normalization", domain: "research", subdomain: "benchmarking", status: "partial",
    summary: "Normalize benchmark definitions, populations, units, periods, geography, accounting conventions, and methodology before comparing an organization with external references.",
    businessQuestion: "Are these benchmarks genuinely comparable to the subject and to each other?", trigger: "normalize external benchmarks for comparison", antiTrigger: "when the benchmark and subject definitions are already identical and documented",
    requiredInputs: ["benchmark evidence", "subject measure definition"], methodology: "Compare metric definitions and populations, convert compatible units and periods, identify structural differences, and reject false precision where normalization cannot repair incompatibility."
  },
  {
    id: "benchmark-synthesis", name: "Benchmark synthesis", domain: "research", subdomain: "benchmarking", status: "partial",
    summary: "Synthesize multiple normalized benchmarks into a decision-relevant reference range while preserving source methods, dispersion, scope differences, and uncertainty.",
    businessQuestion: "What reference range is supported by comparable benchmark evidence?", trigger: "synthesize multiple benchmarks", antiTrigger: "when benchmark definitions have not been normalized",
    requiredInputs: ["normalized benchmark set"], methodology: "Weight evidence by comparability and authority rather than averaging blindly, explain variation, and report a range or distribution when a single point would be misleading."
  },
  {
    id: "evidence-quality", name: "Evidence quality assessment", domain: "research", subdomain: "source-quality", status: "partial",
    summary: "Assess evidence for authority, directness, methodology, sample adequacy, transparency, freshness, independence, relevance, and known bias or uncertainty.",
    businessQuestion: "How much evidentiary weight should this source or dataset receive for the intended claim?", trigger: "assess evidence quality", antiTrigger: "when the request is only to retrieve a source without evaluating its support",
    requiredInputs: ["evidence item", "claim or decision context"], methodology: "Evaluate explicit quality dimensions, distinguish methodological weakness from mere disagreement, and use the assessment to calibrate claims rather than assign decorative credibility scores."
  },
  {
    id: "unsupported-claim-detection", name: "Unsupported-claim detection", domain: "research", subdomain: "fact-checking", status: "partial",
    summary: "Identify factual or quantitative statements that lack adequate source, calculation, user-supplied evidence, or appropriate epistemic labeling before the result reaches a client-facing deliverable.",
    businessQuestion: "Which material statements are not adequately supported by their stated evidence class?", trigger: "check a report for unsupported claims", antiTrigger: "when the content contains only explicitly labeled creative ideas or opinions",
    requiredInputs: ["analysis or draft", "available sources or calculation references"], methodology: "Extract material claims, classify their evidence requirement, verify provenance or calculation reference, and flag unsupported certainty or missing labels."
  },
  {
    id: "citation-planning", name: "Citation planning", domain: "research", subdomain: "provenance", status: "partial",
    summary: "Determine which factual statements need citations, choose the narrowest authoritative source for each, and avoid both citation-free claims and indiscriminate citation clutter.",
    businessQuestion: "Where should evidence citations appear so material claims remain traceable?", trigger: "plan citations for a consulting deliverable", antiTrigger: "when the user explicitly requests a citation-free internal creative draft with no factual claims",
    requiredInputs: ["draft or planned claims", "source set"], methodology: "Prioritize current, material, non-obvious claims, map them to strongest sources, place citations adjacent to supported assertions, and avoid using one citation to imply support for unrelated statements."
  },
  {
    id: "research-gap", name: "Research-gap analysis", domain: "research", subdomain: "research-planning", status: "partial",
    summary: "Identify unanswered questions, weak evidence, missing populations, stale sources, untested assumptions, and decision-critical unknowns that deserve additional research.",
    businessQuestion: "What evidence is still missing before the decision can be defended?", trigger: "identify research or evidence gaps", antiTrigger: "when the request is merely to brainstorm unrelated future research topics",
    requiredInputs: ["decision question", "current evidence"], methodology: "Map decision requirements to available evidence, rate gaps by decision materiality, distinguish knowable from inherently uncertain items, and prioritize next evidence collection."
  },
  {
    id: "survey-design", name: "Survey design review", domain: "research", subdomain: "primary-research", status: "partial",
    summary: "Design or critique survey objectives, target population, sampling, question wording, ordering, scales, branching, burden, bias risks, and analysis plan.",
    businessQuestion: "Will this survey collect interpretable evidence for the intended decision?", trigger: "design or review a survey", antiTrigger: "when qualitative exploratory interviews are more appropriate than standardized responses",
    requiredInputs: ["research objective", "target population"], methodology: "Translate decisions into measurable constructs, choose appropriate sampling and response formats, remove leading or double-barreled questions, and predefine the analysis logic."
  },
  {
    id: "interview-guide", name: "Interview guide design", domain: "research", subdomain: "primary-research", status: "partial",
    summary: "Create a decision-focused qualitative interview guide with neutral sequencing, probes, evidence capture, bias controls, and flexibility for stakeholder or customer research.",
    businessQuestion: "What questions and probes will elicit useful qualitative evidence for this decision?", trigger: "create a stakeholder or customer interview guide", antiTrigger: "when standardized quantitative measurement is the primary research need",
    requiredInputs: ["research objective", "interview audience"], methodology: "Start broad, avoid leading language, separate experience from opinion, use probes for examples and tradeoffs, and connect questions to the downstream analysis plan."
  },
  {
    id: "risk-register", name: "Risk register", domain: "risk", subdomain: "risk-management", status: "partial",
    summary: "Define risks as uncertain events or conditions with causes, consequences, likelihood evidence, impact, controls, owners, treatment actions, triggers, and status.",
    businessQuestion: "Which uncertain events could affect objectives and how should they be controlled?", trigger: "create or update a risk register", antiTrigger: "when the item is already a realized issue rather than a future uncertainty",
    requiredInputs: ["objective or project scope", "known risk evidence"], methodology: "Write risks with cause-event-consequence logic, distinguish inherent and residual exposure, document controls and owners, and avoid treating ordinal scores as exact probabilities.", riskClass: "elevated", outputs: ["text", "structured-model", "spreadsheet"]
  },
  {
    id: "decision-matrix", name: "Weighted decision matrix", domain: "risk", subdomain: "decision-support", status: "partial",
    summary: "Compare alternatives using explicit criteria, normalized weights, evidence-backed scores, uncertainty, and sensitivity so tradeoffs are visible rather than hidden in narrative preference.",
    businessQuestion: "Which alternative performs best under the stated criteria and how sensitive is that result?", trigger: "build a weighted decision matrix", antiTrigger: "when criteria cannot be made meaningfully comparable or weighted",
    requiredInputs: ["alternatives", "decision criteria"], methodology: "Define criteria and scales, normalize weights, score from evidence, calculate totals, and test whether reasonable weight or score changes alter the ranking."
  },
  {
    id: "mcda", name: "Multi-criteria decision analysis", domain: "risk", subdomain: "decision-support", status: "partial",
    summary: "Structure complex decisions with multiple competing quantitative and qualitative criteria, preference tradeoffs, constraints, sensitivity, and transparent aggregation logic.",
    businessQuestion: "How should alternatives be compared when several important criteria conflict?", trigger: "perform multi criteria decision analysis", antiTrigger: "when one dominant criterion completely determines the choice",
    requiredInputs: ["alternatives", "criteria", "preference information"], methodology: "Define criteria and non-negotiable constraints, choose an aggregation approach suited to preferences, normalize inputs, calculate transparently, and stress-test rankings."
  },
  {
    id: "control-assessment", name: "Control assessment", domain: "risk", subdomain: "controls", status: "partial",
    summary: "Assess whether defined controls address material risks through preventive, detective, corrective, automated, manual, frequency, ownership, evidence, and design considerations.",
    businessQuestion: "Do the current controls adequately address the identified risks and where are control gaps?", trigger: "assess business or operational controls", antiTrigger: "when the request is for a formal regulated audit opinion",
    requiredInputs: ["risk or control objective", "control evidence"], methodology: "Map controls to risks, assess design and evidence of operation separately, identify coverage gaps or redundancy, and state the limits of non-audit review.", riskClass: "elevated"
  },
  {
    id: "gap-assessment", name: "Gap assessment", domain: "risk", subdomain: "assessment", status: "partial",
    summary: "Compare current state with a defined target, standard, requirement, or desired capability and prioritize evidence-backed gaps by consequence, dependency, effort, and urgency.",
    businessQuestion: "What is missing between current and target state, and which gaps matter most?", trigger: "perform a gap assessment", antiTrigger: "when the target state or comparison standard is undefined",
    requiredInputs: ["current state", "target state or standard"], methodology: "Define comparison dimensions, assess current evidence against each target requirement, quantify or categorize gaps consistently, and prioritize remediation by business consequence."
  },
  {
    id: "maturity-assessment", name: "Maturity assessment", domain: "risk", subdomain: "assessment", status: "partial",
    summary: "Assess process or capability maturity against explicitly defined stages using observable evidence and avoid treating generic maturity labels as precise performance measures.",
    businessQuestion: "What maturity level is supported by evidence and what capabilities are required for the next useful level?", trigger: "perform a maturity assessment", antiTrigger: "when no maturity model or progression criteria can be defined",
    requiredInputs: ["capability or process scope", "maturity criteria"], methodology: "Define observable criteria per level, assess evidence dimension by dimension, prevent averaging from hiding critical gaps, and connect target maturity to decision needs."
  },
  {
    id: "readiness-assessment", name: "Implementation readiness assessment", domain: "risk", subdomain: "readiness", status: "partial",
    summary: "Assess whether scope, ownership, resources, process, technology, data, governance, dependencies, controls, communication, and adoption conditions are sufficient to begin implementation.",
    businessQuestion: "Is the initiative ready to execute, and what conditions must be resolved first?", trigger: "assess implementation readiness", antiTrigger: "when the initiative is still at idea-generation stage with no proposed implementation",
    requiredInputs: ["initiative scope", "implementation context"], methodology: "Define readiness dimensions and minimum conditions, assess evidence, identify blockers versus manageable risks, and specify decision gates before launch."
  },
  {
    id: "vendor-assessment", name: "Vendor risk assessment", domain: "risk", subdomain: "third-party-risk", status: "partial",
    summary: "Assess a vendor's delivery, concentration, continuity, security, financial, compliance, geographic, subcontractor, contractual, and recovery risk from available evidence.",
    businessQuestion: "What third-party risks could materially affect the organization if this vendor fails or underperforms?", trigger: "assess vendor risk", antiTrigger: "when the request is primarily to choose the best vendor on commercial value",
    requiredInputs: ["vendor evidence", "service or dependency scope"], methodology: "Map dependency and failure mechanisms, assess consequence and control evidence, distinguish public facts from vendor claims, and prioritize mitigations by exposure.", riskClass: "elevated", evidenceLevel: "current-external-evidence"
  },
  {
    id: "scenario-risk", name: "Scenario risk analysis", domain: "risk", subdomain: "scenario-risk", status: "partial",
    summary: "Test risks and controls across coherent alternative scenarios to identify tail exposures, correlated failures, threshold effects, and response options that ordinary point estimates hide.",
    businessQuestion: "How does risk exposure change under materially different plausible scenarios?", trigger: "analyze risk across scenarios", antiTrigger: "when uncertainty is immaterial and a deterministic control check is sufficient",
    requiredInputs: ["risk scope", "scenario assumptions"], methodology: "Define coherent scenarios, trace exposure and controls under each, identify common and scenario-specific failures, and separate plausible stress from arbitrary extremes.", riskClass: "elevated"
  },
  {
    id: "dependency-risk", name: "Dependency risk analysis", domain: "risk", subdomain: "dependencies", status: "partial",
    summary: "Identify critical internal and external dependencies, concentration, sequencing, single points of failure, recovery options, and cascading consequences across a plan or operation.",
    businessQuestion: "Which dependencies can block or amplify failure across the system?", trigger: "analyze dependency risks", antiTrigger: "when the request is only to draw a dependency map without assessing risk",
    requiredInputs: ["plan process or system scope", "dependency evidence"], methodology: "Map dependency direction and criticality, identify concentration and recovery options, assess cascade pathways, and prioritize dependencies by consequence and substitutability."
  },
  {
    id: "implementation-risk", name: "Implementation risk assessment", domain: "risk", subdomain: "execution-risk", status: "partial",
    summary: "Assess scope, schedule, resource, capability, technology, data, vendor, governance, adoption, dependency, and benefit-realization risks that could derail implementation.",
    businessQuestion: "What could prevent this plan from being implemented successfully or realizing its intended benefits?", trigger: "assess implementation risks", antiTrigger: "when there is no defined implementation plan or target outcome",
    requiredInputs: ["implementation plan or intended change"], methodology: "Trace intended outcomes to execution dependencies, identify failure mechanisms and controls, assess timing and consequence, and pair material risks with mitigation and indicators.", riskClass: "elevated"
  },
  {
    id: "seo-technical-audit", name: "Technical SEO audit", domain: "seo", subdomain: "technical-seo", status: "partial",
    summary: "Assess publicly observable crawlability, indexability, canonicalization, robots directives, sitemaps, metadata, structured data, internal discovery, and technical search issues.",
    businessQuestion: "Which technical site conditions could prevent search engines from discovering, interpreting, or indexing important public pages correctly?", trigger: "perform a technical SEO audit", antiTrigger: "when the request requires private Search Console or authenticated analytics data only",
    requiredInputs: ["public site or supplied crawl evidence"], methodology: "Inspect public technical signals using current search-engine guidance, distinguish observed evidence from inferred indexing behavior, and prioritize fixes by likely search impact.", evidenceLevel: "current-external-evidence", surfaceRequirements: ["host-reasoning", "public-web"]
  },
  {
    id: "seo-on-page", name: "On-page SEO analysis", domain: "seo", subdomain: "on-page", status: "partial",
    summary: "Assess page intent, title, description, headings, content coverage, internal links, structured-data eligibility, clarity, duplication, and evidence against current public search guidance.",
    businessQuestion: "How well does this public page communicate its topic and satisfy relevant search intent?", trigger: "analyze on page SEO", antiTrigger: "when the request is solely a sitewide crawlability audit",
    requiredInputs: ["page content or public URL"], methodology: "Determine page intent, inspect discoverable elements and content evidence, compare with public search guidance and competing results where useful, and avoid fabricating keyword-volume metrics.", evidenceLevel: "current-external-evidence", surfaceRequirements: ["host-reasoning", "public-web"]
  },
  {
    id: "seo-content-gap", name: "SEO content-gap analysis", domain: "seo", subdomain: "content", status: "partial",
    summary: "Identify missing or weak topic and intent coverage using public search and competitor evidence while distinguishing observed gaps from proprietary demand estimates that are not available.",
    businessQuestion: "Which search intents or topic areas are insufficiently covered relative to user needs and public competitive evidence?", trigger: "identify SEO content gaps", antiTrigger: "when the user expects proprietary search-volume or keyword-difficulty data without supplying it",
    requiredInputs: ["site or content scope", "target audience or search topic"], methodology: "Map current content to search intents, inspect public result and competitor coverage, identify substantive gaps, and prioritize by relevance and evidence without inventing demand metrics.", evidenceLevel: "current-external-evidence", surfaceRequirements: ["host-reasoning", "public-web"]
  },
  {
    id: "local-seo-plan", name: "Local SEO assessment plan", domain: "seo", subdomain: "local-seo", status: "partial",
    summary: "Assess local discoverability through verified business information, location relevance, public site signals, local landing coverage, reviews, profiles, and consistency without requiring account access.",
    businessQuestion: "Which public local-search signals and content gaps should be improved for this location-based business?", trigger: "assess local SEO", antiTrigger: "when the business has no location or service-area relevance",
    requiredInputs: ["business and location scope"], methodology: "Verify public business/location facts, assess site and public profile consistency, review local content and reputation evidence, and prioritize issues that can be observed without private dashboards.", evidenceLevel: "current-external-evidence", surfaceRequirements: ["host-reasoning", "public-web"]
  },
  {
    id: "seo-canonicalization", name: "SEO canonicalization analysis", domain: "seo", subdomain: "technical-seo", status: "partial",
    summary: "Inspect canonical tags, URL variants, redirects, duplicate or near-duplicate public pages, and indexability interactions to identify ambiguous preferred-URL signals.",
    businessQuestion: "Are canonical signals consistently identifying the intended preferred public URLs?", trigger: "audit canonical tags and duplicate URLs", antiTrigger: "when the request is about content quality rather than URL consolidation",
    requiredInputs: ["public URL set or crawl evidence"], methodology: "Compare canonical declarations with redirects, indexability and duplicate patterns, identify loops or conflicts, and ground recommendations in current search-engine documentation.", evidenceLevel: "current-external-evidence", surfaceRequirements: ["host-reasoning", "public-web"]
  },
  {
    id: "seo-robots", name: "Robots directive analysis", domain: "seo", subdomain: "technical-seo", status: "partial",
    summary: "Inspect robots.txt and page-level robots directives for blocking, conflicting, overly broad, ineffective, or misunderstood controls that affect crawling and indexing.",
    businessQuestion: "Do robots directives permit the intended crawl and index behavior for public content?", trigger: "audit robots txt or robots meta directives", antiTrigger: "when the issue is canonicalization with no robots-control question",
    requiredInputs: ["public site or robots evidence"], methodology: "Retrieve and parse relevant directives, map user-agent and path scope, compare with page-level controls and current search guidance, and distinguish crawl blocking from indexing control.", evidenceLevel: "current-external-evidence", surfaceRequirements: ["host-reasoning", "public-web"]
  },
  {
    id: "seo-sitemap", name: "XML sitemap analysis", domain: "seo", subdomain: "technical-seo", status: "partial",
    summary: "Assess public XML sitemaps for discoverability, indexable-URL quality, stale or redirected entries, hierarchy, coverage, format validity, and alignment with canonical URLs.",
    businessQuestion: "Do the site's sitemaps accurately enumerate the public canonical URLs intended for search discovery?", trigger: "audit XML sitemaps", antiTrigger: "when the site has no public sitemap and the request is only content strategy",
    requiredInputs: ["public site or sitemap URL"], methodology: "Retrieve sitemap files, validate structure and URL status, compare entries with canonical/indexability signals, and identify coverage or hygiene problems.", evidenceLevel: "current-external-evidence", surfaceRequirements: ["host-reasoning", "public-web"]
  },
  {
    id: "seo-structured-data", name: "Structured-data eligibility analysis", domain: "seo", subdomain: "structured-data", status: "partial",
    summary: "Inspect public structured data for syntax, entity consistency, supported properties, content alignment, and current eligibility requirements without promising rich-result display.",
    businessQuestion: "Is the page's structured data valid, content-consistent, and appropriate for supported search features?", trigger: "audit schema or structured data for SEO", antiTrigger: "when the request is only visual page markup with no search semantics",
    requiredInputs: ["public page or supplied structured data"], methodology: "Parse structured data, validate types and required/recommended properties against current official guidance, compare markup with visible content, and avoid guaranteeing search presentation.", evidenceLevel: "current-external-evidence", surfaceRequirements: ["host-reasoning", "public-web"]
  },
  {
    id: "seo-internal-links", name: "Internal-link analysis", domain: "seo", subdomain: "site-architecture", status: "partial",
    summary: "Assess public internal links for crawl discovery, hierarchy, orphaning, context, anchor clarity, depth, broken paths, and concentration around important content.",
    businessQuestion: "Does internal linking help users and crawlers discover and understand the site's important content?", trigger: "analyze internal links for SEO", antiTrigger: "when the request concerns only external backlinks",
    requiredInputs: ["public site crawl or link evidence"], methodology: "Build a public internal-link graph, inspect status and depth, identify orphans and weakly connected priority pages, and distinguish navigational design from speculative ranking claims.", evidenceLevel: "current-external-evidence", surfaceRequirements: ["host-reasoning", "public-web"]
  },
  {
    id: "seo-indexability", name: "Indexability signal analysis", domain: "seo", subdomain: "technical-seo", status: "partial",
    summary: "Assess publicly observable status codes, robots controls, canonicals, redirects, content accessibility, and rendering signals that influence whether a URL is technically eligible for indexing.",
    businessQuestion: "Which public pages have technical signals that conflict with intended indexability?", trigger: "analyze indexability signals", antiTrigger: "when the user expects confirmation of actual private index status from Search Console",
    requiredInputs: ["public URLs or crawl evidence"], methodology: "Inspect public eligibility signals and current search guidance, classify conflicts, and clearly distinguish technical eligibility from actual search-engine index state.", evidenceLevel: "current-external-evidence", surfaceRequirements: ["host-reasoning", "public-web"]
  },
  {
    id: "seo-content-architecture", name: "SEO content architecture", domain: "seo", subdomain: "content-strategy", status: "partial",
    summary: "Organize public content around user intent, topic relationships, hierarchy, navigation, internal linking, duplication control, and scalable page purpose rather than keyword-page proliferation.",
    businessQuestion: "How should site content be structured so users and search systems can understand topic relationships and page purpose?", trigger: "design content architecture for SEO", antiTrigger: "when the request is only to rewrite one page",
    requiredInputs: ["site or topic scope", "user or search intent evidence"], methodology: "Group intents and topics by user task and information relationship, define page roles and hierarchy, prevent cannibalizing duplication, and connect architecture with internal navigation."
  },
  {
    id: "seo-search-intent", name: "Search-intent analysis", domain: "seo", subdomain: "content-strategy", status: "partial",
    summary: "Infer the dominant and secondary user tasks behind a search topic from query language and current public result evidence while avoiding unsupported demographic or demand assumptions.",
    businessQuestion: "What are users most likely trying to accomplish when searching this topic?", trigger: "analyze search intent", antiTrigger: "when the user asks for proprietary query-volume estimates rather than intent",
    requiredInputs: ["search topic or query set"], methodology: "Classify task intent from wording and public result patterns, inspect variation and ambiguity, and translate supported intent into content requirements without inventing demand volume.", evidenceLevel: "current-external-evidence", surfaceRequirements: ["host-reasoning", "public-web"]
  },
  {
    id: "seo-keyword-metrics", name: "Live proprietary keyword metrics", domain: "seo", subdomain: "private-metrics", status: "unavailable",
    summary: "Represents live proprietary keyword-volume, difficulty, or provider-specific opportunity metrics that Consulting Tools intentionally does not fetch through credentialed accounts.",
    businessQuestion: "What live proprietary keyword metrics does an authenticated commercial provider report?", trigger: "fetch live commercial keyword metrics", antiTrigger: "when the user supplies a keyword-metrics export for analysis",
    requiredInputs: ["authenticated commercial keyword provider"], methodology: "Unavailable under the open-access boundary; analyze a user-supplied export through ordinary data-analysis capabilities instead.", evidenceLevel: "current-external-evidence", surfaceRequirements: ["host-reasoning"], access: { userCredentialRequired: true, privateAccountRequired: true }, requires: "A private commercial keyword provider credential is outside the product boundary."
  },
  {
    id: "seo-backlink-metrics", name: "Live proprietary backlink metrics", domain: "seo", subdomain: "private-metrics", status: "unavailable",
    summary: "Represents live provider-specific backlink indexes and authority metrics that Consulting Tools intentionally does not fetch through authenticated commercial accounts.",
    businessQuestion: "What live proprietary backlink-index metrics does an authenticated provider report?", trigger: "fetch live commercial backlink metrics", antiTrigger: "when the user supplies a backlink export or asks about publicly observable links",
    requiredInputs: ["authenticated backlink provider"], methodology: "Unavailable under the open-access boundary; use user-supplied exports or openly observable link evidence instead.", evidenceLevel: "current-external-evidence", surfaceRequirements: ["host-reasoning"], access: { userCredentialRequired: true, privateAccountRequired: true }, requires: "A private commercial backlink provider credential is outside the product boundary."
  },
  {
    id: "seo-search-console", name: "Live Search Console account analysis", domain: "seo", subdomain: "private-metrics", status: "unavailable",
    summary: "Represents direct access to private Search Console impressions, clicks, queries, pages, and indexing data, which Consulting Tools intentionally does not request through OAuth.",
    businessQuestion: "What does the user's live private Search Console account report?", trigger: "connect to or query live Search Console data", antiTrigger: "when the user supplies a Search Console export for analysis",
    requiredInputs: ["authenticated Search Console account"], methodology: "Unavailable under the no-OAuth product boundary; analyze user-supplied Search Console exports through the separate export-analysis capability.", evidenceLevel: "current-external-evidence", surfaceRequirements: ["host-reasoning"], access: { userCredentialRequired: true, privateAccountRequired: true }, requires: "Search Console OAuth is outside the product boundary."
  },
  {
    id: "keyword-export-analysis", name: "Keyword-metrics export analysis", domain: "seo", subdomain: "user-supplied-metrics", status: "partial",
    summary: "Analyze keyword-volume, difficulty, CPC, rank, intent, or other provider metrics from a user-supplied export while preserving provider definitions and avoiding cross-provider equivalence claims.",
    businessQuestion: "What opportunities and patterns are present in the keyword metrics the user supplied?", trigger: "analyze an uploaded keyword metrics export", antiTrigger: "when no keyword dataset has been supplied and live provider retrieval would be required",
    requiredInputs: ["user-supplied keyword metrics dataset"], methodology: "Profile the export, preserve provider-specific metric definitions, segment and prioritize using explicit criteria, and distinguish supplied provider estimates from universal facts.", surfaceRequirements: ["host-reasoning", "artifact-input"]
  },
  {
    id: "backlink-export-analysis", name: "Backlink-export analysis", domain: "seo", subdomain: "user-supplied-metrics", status: "partial",
    summary: "Analyze a user-supplied backlink export for domains, pages, anchors, link types, concentration, loss/gain, relevance, and provider-defined metrics without requiring account access.",
    businessQuestion: "What patterns and risks are present in the backlink data the user supplied?", trigger: "analyze an uploaded backlink export", antiTrigger: "when live proprietary backlink retrieval is required",
    requiredInputs: ["user-supplied backlink dataset"], methodology: "Profile and deduplicate links, preserve provider-specific definitions, segment meaningful patterns, compare domains or pages carefully, and avoid treating proprietary authority scores as universal measures.", surfaceRequirements: ["host-reasoning", "artifact-input"]
  },
  {
    id: "search-console-export-analysis", name: "Search Console export analysis", domain: "seo", subdomain: "user-supplied-metrics", status: "partial",
    summary: "Analyze user-supplied Search Console query, page, country, device, click, impression, CTR, and position exports without requesting OAuth or live account access.",
    businessQuestion: "What search-performance patterns and opportunities are supported by the Search Console data the user supplied?", trigger: "analyze an uploaded Search Console export", antiTrigger: "when the user expects direct live Search Console account access",
    requiredInputs: ["user-supplied Search Console export"], methodology: "Validate export grain and date range, calculate weighted or aggregate metrics appropriately, segment queries and pages, identify trends and opportunities, and preserve the data's first-party provenance.", surfaceRequirements: ["host-reasoning", "artifact-input"]
  }
];

export const researchRiskSeoCapabilities = seeds.map(defineStandardCapability);
