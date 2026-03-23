export type LeadStatus = "New" | "Messaged" | "Follow-Up" | "Closed";

export type Lead = {
  id: string;
  businessName: string;
  category: string;
  location: string;
  email?: string;
  phone?: string;
  facebook?: string;
  status: LeadStatus;
  notes?: string;
  lastContacted?: string;
  createdAt: string;
};

export const defaultLeads: Lead[] = [
  {
    id: "1",
    businessName: "BB’s Lawn & Landscaping",
    category: "Landscaping",
    location: "Hot Springs",
    facebook:
      "https://www.facebook.com/search/top?q=bb%27s%20lawn%20and%20landscaping%20hot%20springs",
    status: "New",
    notes: "No website - FB lead",
    createdAt: "2026-03-23",
  },
  {
    id: "2",
    businessName: "D2 Scape Landscaping",
    category: "Landscaping",
    location: "Hot Springs",
    facebook: "https://www.facebook.com/search/top?q=d2%20scape%20hot%20springs",
    status: "New",
    notes: "Directory only",
    createdAt: "2026-03-23",
  },
  {
    id: "3",
    businessName: "United Lawn Care",
    category: "Landscaping",
    location: "Hot Springs",
    facebook: "https://www.facebook.com/search/top?q=united%20lawn%20care%20hot%20springs",
    status: "New",
    notes: "No strong presence",
    createdAt: "2026-03-23",
  },
  {
    id: "4",
    businessName: "Rosales Lawn Service",
    category: "Landscaping",
    location: "Hot Springs",
    facebook: "https://www.facebook.com/search/top?q=rosales%20lawn%20service%20hot%20springs",
    status: "New",
    notes: "Small operator",
    createdAt: "2026-03-23",
  },
  {
    id: "5",
    businessName: "National Park Lawn Care",
    category: "Landscaping",
    location: "Hot Springs",
    facebook: "https://www.facebook.com/search/top?q=national%20park%20lawn%20care%20hot%20springs",
    status: "New",
    notes: "Service-based",
    createdAt: "2026-03-23",
  },
  {
    id: "6",
    businessName: "JE’s Odd Jobs",
    category: "Pressure Washing",
    location: "Hot Springs",
    facebook: "https://www.facebook.com/search/top?q=je%27s%20odd%20jobs%20hot%20springs",
    status: "New",
    notes: "Multi-service",
    createdAt: "2026-03-23",
  },
  {
    id: "7",
    businessName: "Grass Plus",
    category: "Pressure Washing / Lawn",
    location: "Hot Springs",
    facebook: "https://www.facebook.com/search/top?q=grass%20plus%20hot%20springs",
    status: "New",
    notes: "Local service biz",
    createdAt: "2026-03-23",
  },
  {
    id: "8",
    businessName: "Melinda’s Coffee Corner",
    category: "Coffee Shop",
    location: "Hot Springs Village",
    email: "dnahsv@gmail.com",
    facebook:
      "https://www.facebook.com/search/top?q=melinda%27s%20coffee%20corner%20hot%20springs",
    status: "Follow-Up",
    notes: "Website broken (HIGH PRIORITY)",
    lastContacted: "2026-03-23",
    createdAt: "2026-03-23",
  },
  {
    id: "9",
    businessName: "Red Light Roastery",
    category: "Coffee Shop",
    location: "Hot Springs",
    facebook: "https://www.facebook.com/search/top?q=red%20light%20roastery%20hot%20springs",
    status: "New",
    notes: "Brand opportunity",
    createdAt: "2026-03-23",
  },
  {
    id: "10",
    businessName: "Kollective Coffee",
    category: "Coffee Shop",
    location: "Hot Springs",
    facebook: "https://www.facebook.com/search/top?q=kollective%20coffee%20hot%20springs",
    status: "New",
    notes: "Social-based biz",
    createdAt: "2026-03-23",
  },
];

/** Alias for older samples — same as `defaultLeads`. */
export const leads = defaultLeads;
