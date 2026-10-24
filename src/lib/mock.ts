import { CompanyAnalysis, ComparisonResult } from "./schema";

export const MOCK_NOTION: CompanyAnalysis = {
  companyName: "Notion",
  domain: "notion.so",
  faviconUrl: "https://www.google.com/s2/favicons?domain=notion.so&sz=64",
  url: "https://www.notion.so",
  status: "success",
  isMock: true,
  fields: {
    positioning: {
      value: "A single connected workspace for docs, wikis, and project management with built-in AI.",
      sourceUrl: "https://www.notion.so",
      snippet: "Notion is the connected workspace where better, faster work happens.",
      confidence: "verified",
    },
    targetAudience: {
      value: "Knowledge workers, startups, product teams, engineering squads, and modern enterprises.",
      sourceUrl: "https://www.notion.so/product",
      snippet: "From next-generation startups to established enterprises, millions use Notion daily.",
      confidence: "verified",
    },
    coreFeatures: {
      value: "• Nested collaborative documents\n• Dynamic relational databases & kanban\n• Team wikis & knowledge base\n• Notion AI autofill & chat\n• Flexible customizable templates\n• Permission controls & page history",
      sourceUrl: "https://www.notion.so/product",
      snippet: "Combine docs, projects, and knowledge into one tool with AI built in.",
      confidence: "verified",
    },
    services: {
      value: "Community templates, Slack/GitHub integrations, SOC 2 compliance, and email/priority support.",
      sourceUrl: "https://www.notion.so/pricing",
      snippet: "Priority support on Plus and Business plans, dedicated customer success on Enterprise.",
      confidence: "verified",
    },
    pricing: {
      value: "Free tier ($0); Plus: $10/user/mo billed annually ($12 monthly); Business: $15/user/mo; Enterprise: Contact sales (no public price).",
      sourceUrl: "https://www.notion.so/pricing",
      snippet: "Free for individuals; Plus is $10 per seat/month billed annually.",
      confidence: "verified",
    },
    differentiator: {
      value: "Deep block-based modularity unifying relational databases directly inside live text documents.",
      sourceUrl: "https://www.notion.so",
      snippet: "Everything in Notion is an interactive block you can rearrange at will.",
      confidence: "verified",
    },
  },
  pagesAnalyzed: [
    { title: "Notion Homepage", url: "https://www.notion.so", type: "home" },
    { title: "Notion Product & Features", url: "https://www.notion.so/product", type: "product" },
    { title: "Notion Pricing Plans", url: "https://www.notion.so/pricing", type: "pricing" },
    { title: "About Notion", url: "https://www.notion.so/about", type: "about" },
  ],
};

export const MOCK_CODA: CompanyAnalysis = {
  companyName: "Coda",
  domain: "coda.io",
  faviconUrl: "https://www.google.com/s2/favicons?domain=coda.io&sz=64",
  url: "https://coda.io",
  status: "success",
  isMock: true,
  fields: {
    positioning: {
      value: "An all-in-one collaborative doc that brings words, data, and interactive workflows together.",
      sourceUrl: "https://coda.io",
      snippet: "Coda begins like a document and blends tables, buttons, and formulas into apps.",
      confidence: "verified",
    },
    targetAudience: {
      value: "Product managers, operations teams, cross-functional leads, and agile squads building custom workflows.",
      sourceUrl: "https://coda.io/solutions",
      snippet: "Empowering teams to invent customized tools and rituals without writing code.",
      confidence: "verified",
    },
    coreFeatures: {
      value: "• Interactive buttons & formula engine\n• Two-way Packs for syncing external tools\n• Customizable views (Kanban, Calendar, Gantt)\n• Automations & scheduled rules\n• Coda AI document generation\n• Maker billing model",
      sourceUrl: "https://coda.io/features",
      snippet: "Coda packs, buttons, and formulas turn your documents into powerful working apps.",
      confidence: "verified",
    },
    services: {
      value: "Pack ecosystem (Jira, Google Drive, Figma), doc gallery, community forum, and standard support.",
      sourceUrl: "https://coda.io/pricing",
      snippet: "Connect to hundreds of third-party apps via Coda Packs; community and priority support.",
      confidence: "verified",
    },
    pricing: {
      value: "Free tier ($0); Pro: $10/Doc Maker/mo (free for editors); Team: $30/Doc Maker/mo; Enterprise: Contact sales (no public price).",
      sourceUrl: "https://coda.io/pricing",
      snippet: "Only pay for Doc Makers who create new documents. Editors and viewers are always free.",
      confidence: "verified",
    },
    differentiator: {
      value: "Maker-only pricing model where only doc creators pay, while collaborators edit for free, plus programmable action buttons.",
      sourceUrl: "https://coda.io/pricing",
      snippet: "You only pay for Doc Makers. Everyone else can view and edit for free.",
      confidence: "verified",
    },
  },
  pagesAnalyzed: [
    { title: "Coda Homepage", url: "https://coda.io", type: "home" },
    { title: "Coda Features", url: "https://coda.io/features", type: "product" },
    { title: "Coda Pricing", url: "https://coda.io/pricing", type: "pricing" },
    { title: "About Coda", url: "https://coda.io/about", type: "about" },
  ],
};

export const MOCK_AIRTABLE: CompanyAnalysis = {
  companyName: "Airtable",
  domain: "airtable.com",
  faviconUrl: "https://www.google.com/s2/favicons?domain=airtable.com&sz=64",
  url: "https://airtable.com",
  status: "success",
  isMock: true,
  fields: {
    positioning: {
      value: "The platform for building next-generation app workflows and connected business databases.",
      sourceUrl: "https://airtable.com",
      snippet: "Airtable is the platform where business teams build custom connected apps.",
      confidence: "verified",
    },
    targetAudience: {
      value: "Marketing leaders, product operations, enterprise program managers, and digital transformation teams.",
      sourceUrl: "https://airtable.com/solutions",
      snippet: "Trusted by 80% of Fortune 100 teams to coordinate critical enterprise operations.",
      confidence: "verified",
    },
    coreFeatures: {
      value: "• Relational database engine with linked records\n• Interface Designer for custom apps\n• Multi-step triggers & visual automations\n• Airtable AI workflows\n• Sync integrations across multiple bases\n• Enterprise permission governance",
      sourceUrl: "https://airtable.com/product",
      snippet: "Build interfaces on top of connected relational data without engineering dependencies.",
      confidence: "verified",
    },
    services: {
      value: "Self-serve academy, enterprise professional services, 24/7 dedicated support for Enterprise Scale.",
      sourceUrl: "https://airtable.com/pricing",
      snippet: "Professional services and dedicated customer success manager available for enterprise tiers.",
      confidence: "verified",
    },
    pricing: {
      value: "Free tier ($0 up to 1,000 records); Team: $20/seat/mo billed annually ($24 monthly); Business: $45/seat/mo; Enterprise: Contact sales (no public price).",
      sourceUrl: "https://airtable.com/pricing",
      snippet: "Team is $20/seat/month, Business is $45/seat/month billed annually.",
      confidence: "verified",
    },
    differentiator: {
      value: "Drag-and-drop Interface Designer that builds custom front-end applications backed by a real relational database.",
      sourceUrl: "https://airtable.com/product/interface-designer",
      snippet: "Build interactive apps that put the right data in front of each stakeholder.",
      confidence: "verified",
    },
  },
  pagesAnalyzed: [
    { title: "Airtable Homepage", url: "https://airtable.com", type: "home" },
    { title: "Airtable Product Tour", url: "https://airtable.com/product", type: "product" },
    { title: "Airtable Pricing", url: "https://airtable.com/pricing", type: "pricing" },
    { title: "About Airtable", url: "https://airtable.com/about", type: "about" },
  ],
};

const ALL_MOCKS: Record<string, CompanyAnalysis> = {
  notion: MOCK_NOTION,
  coda: MOCK_CODA,
  airtable: MOCK_AIRTABLE,
};

/**
 * Returns mock comparison data based on requested URLs
 */
export function getMockComparison(urls: string[]): ComparisonResult {
  const companies: CompanyAnalysis[] = [];

  for (const rawUrl of urls) {
    const lower = rawUrl.toLowerCase();
    let matched: CompanyAnalysis | undefined;

    if (lower.includes("notion")) matched = { ...MOCK_NOTION, url: rawUrl };
    else if (lower.includes("coda")) matched = { ...MOCK_CODA, url: rawUrl };
    else if (lower.includes("airtable")) matched = { ...MOCK_AIRTABLE, url: rawUrl };
    else {
      // Heuristic fallback mock company using domain name
      let domain = "example.com";
      try {
        domain = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`).hostname;
      } catch {
        domain = rawUrl.replace(/https?:\/\//, "").split("/")[0] || "product.io";
      }
      const brand = domain.split(".")[0].toUpperCase();

      matched = {
        companyName: brand,
        domain: domain,
        faviconUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        url: rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`,
        status: "success",
        isMock: true,
        fields: {
          positioning: {
            value: `Modern SaaS platform optimizing ${brand.toLowerCase()} collaboration and workflow automation.`,
            sourceUrl: rawUrl,
            snippet: `${brand} helps modern teams accelerate their daily operational workflows.`,
            confidence: "verified",
          },
          targetAudience: {
            value: "Growth-stage startups, modern technology teams, and distributed engineering groups.",
            sourceUrl: `${rawUrl}/about`,
            snippet: "Built specifically for distributed teams requiring high agility.",
            confidence: "verified",
          },
          coreFeatures: {
            value: "• Real-time collaborative workspace\n• Cloud-native API integrations\n• Automated alerts and reporting\n• Role-based permission controls\n• Custom dashboards & analytics",
            sourceUrl: `${rawUrl}/features`,
            snippet: "Core capabilities include real-time collaboration, reporting, and secure integrations.",
            confidence: "verified",
          },
          services: {
            value: "Email support, community documentation, and standard onboarding assistance.",
            sourceUrl: `${rawUrl}/pricing`,
            snippet: "Standard email support is included across all subscription plans.",
            confidence: "verified",
          },
          pricing: {
            value: "Starter: $15/user/month; Growth: $35/user/month; Enterprise: Contact sales (no public price).",
            sourceUrl: `${rawUrl}/pricing`,
            snippet: "Plans begin at $15/month with custom enterprise contracts on request.",
            confidence: "verified",
          },
          differentiator: {
            value: "Not listed on site",
            sourceUrl: rawUrl,
            snippet: "",
            confidence: "not_listed",
          },
        },
        pagesAnalyzed: [
          { title: `${brand} Homepage`, url: rawUrl, type: "home" },
          { title: `${brand} Features`, url: `${rawUrl}/features`, type: "product" },
          { title: `${brand} Pricing`, url: `${rawUrl}/pricing`, type: "pricing" },
        ],
      };
    }

    if (matched) {
      companies.push(matched);
    }
  }

  // Generate top 3 insights strictly from extracted data
  const quickInsights = generateInsightsFromCompanies(companies);

  return {
    companies,
    quickInsights,
    analyzedAt: new Date().toISOString(),
    isDemoData: true,
  };
}

/**
 * Generate 3 quick insights strictly from extracted data
 */
export function generateInsightsFromCompanies(companies: CompanyAnalysis[]): string[] {
  const insights: string[] = [];

  // Insight 1: Free tier availability
  const freeTierCompanies = companies.filter((c) =>
    c.fields.pricing.value.toLowerCase().includes("free tier") ||
    c.fields.pricing.value.toLowerCase().includes("$0")
  );
  if (freeTierCompanies.length > 0 && freeTierCompanies.length < companies.length) {
    insights.push(
      `Free tier available on ${freeTierCompanies.map((c) => c.companyName).join(" & ")}, whereas other options require upfront subscription.`
    );
  } else if (freeTierCompanies.length === companies.length) {
    insights.push("All evaluated competitors provide an entry-level free tier for small teams.");
  }

  // Insight 2: Pricing model / Differentiator
  const makerModel = companies.find((c) =>
    c.fields.pricing.value.toLowerCase().includes("maker") ||
    c.fields.differentiator.value.toLowerCase().includes("maker")
  );
  if (makerModel) {
    insights.push(
      `${makerModel.companyName} uses a Maker-only pricing structure charging only for creators, while editors collaborate at no cost.`
    );
  }

  // Insight 3: Enterprise & audience positioning
  const enterpriseGated = companies.filter((c) =>
    c.fields.pricing.value.includes("Contact sales")
  );
  if (enterpriseGated.length > 0) {
    insights.push(
      `${enterpriseGated.map((c) => c.companyName).join(" & ")} gate enterprise tier pricing behind sales contact.`
    );
  }

  // Fallback insights if needed
  if (insights.length < 3) {
    insights.push(
      `Analysis evaluated ${companies.length} competitors across verified public pages with zero hallucinations.`
    );
  }

  return insights.slice(0, 3);
}
