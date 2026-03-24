import type { SampleDraft } from "@/app/(public)/website-samples/[slug]/sample-draft-client";
import { PORTFOLIO_PRESSURE_WASHING_HERO_PRIMARY } from "@/lib/sample-fallback-images";

/** Full-page website examples for common local trades (public pages). */
export type PortfolioSampleMeta = {
  routeSlug: string;
  title: string;
  category: string;
  description: string;
  cardImageUrl: string;
  /** For SampleDraftClient */
  stylePreset: "clean-modern" | "bold-premium" | "friendly-local" | "minimal-elegant";
  colorPreset: "blue" | "green" | "dark" | "warm-neutral" | "bold-accent" | "wellness";
};

/** Niche-matched pressure washing: active washing, flatwork, siding, outdoor living — not generic interiors. */
const PW_DRIVEWAY =
  "https://images.unsplash.com/photo-1718152521364-b9655b8a7926?auto=format&fit=crop&w=900&q=80";
const PW_HOUSE =
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80";
const PW_DECK =
  "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=900&q=80";
const PW_GALLERY_EXTRA =
  "https://images.unsplash.com/photo-1718152521147-817b3a991291?auto=format&fit=crop&w=900&q=80";

const DETAIL = [
  "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80",
];

const LAWN = [
  "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1458245201577-fc8a130b8829?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1605117882932-f9e32b03fea9?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1400&q=80",
];

const HVAC = [
  "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1705444509014-fed54b6191bf?auto=format&fit=crop&w=1400&q=80",
];

const FOOD = [
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1400&q=80",
];

/** Wellness / spa / yoga — calm imagery; pairs with `wellness` color preset (layered sand & sage, not stark white). */
const WELLNESS = [
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1528319725582-ddc096101511?auto=format&fit=crop&w=1400&q=80",
];

/**
 * Lawn care and similar local-service samples: use color presets with layered gradients (e.g. `green`),
 * not flat white page backgrounds — see `wellness` for spa/yoga and `green` for outdoor trades.
 */
function draftPressureWashing(): SampleDraft {
  return {
    businessName: "ClearView Pressure Washing",
    tagline: "Residential & commercial exterior cleaning",
    localPositioning: "Central Arkansas · Fast quotes · Licensed & insured",
    heroImageUrl: PORTFOLIO_PRESSURE_WASHING_HERO_PRIMARY,
    heroImageAlt: "Crew member pressure washing pavement — water and clean streaks on concrete",
    heroHeadline: "Exteriors That Look Maintained — Driveways, Siding, Decks",
    heroSub:
      "Concrete, brick, vinyl, wood, and composite — we match pressure and detergents to the surface so grime comes off and your property stays protected. Same-day quotes on most jobs.",
    heroPrimaryCta: "Request a Quote",
    heroSecondaryCta: "View Services",
    offeringsTitle: "What We Wash",
    servicesSectionLead:
      "Flatwork, vertical siding, and outdoor living spaces — each gets the right method so you get a deep clean without etched concrete or stripped paint.",
    offerings: [
      {
        name: "Driveway & Walkway Cleaning",
        text: "Oil drips, tire marks, algae, and pollen — lifted from concrete and pavers so your approach looks sharp.",
        image: PW_DRIVEWAY,
        imageAlt: "Pressure washing equipment cleaning a concrete street or driveway surface",
      },
      {
        name: "House & Siding Wash",
        text: "Soft-wash safe for vinyl, brick, and stucco — mildew and dull haze gone, curb appeal back.",
        image: PW_HOUSE,
        imageAlt: "Modern home exterior with clean siding and bright curb appeal after washing",
      },
      {
        name: "Deck, Patio & Pool Deck",
        text: "Wood restoration prep or composite refresh — algae and gray film removed so outdoor spaces are ready to use.",
        image: PW_DECK,
        imageAlt: "Outdoor patio and pool deck area attached to a contemporary home",
      },
    ],
    gallerySectionTitle: "Results you can see",
    gallerySectionLead:
      "Active washing shots and finished exteriors — the kind of proof neighbors notice when they walk or drive by.",
    galleryImages: [PW_DRIVEWAY, PW_HOUSE, PW_DECK, PW_GALLERY_EXTRA],
    galleryImageAlts: [
      "Flatwork and pavement cleaning in progress with visible rinse pattern",
      "Residential facade after soft washing — siding and trim look crisp",
      "Backyard deck and patio zone ready for entertaining",
      "Commercial or residential exterior cleaning crew finishing a wash",
    ],
    whyChooseTitle: "Why property owners hire ClearView",
    whyChooseBullets: [
      "Surface-specific methods — we do not blast everything on high pressure.",
      "Written scopes: you know what is included before we start.",
      "Insured crew, on-time arrivals, and respect for plants and paint.",
      "Local team that answers the phone and follows up after the job.",
    ],
    aboutTitle: "Built for busy property owners",
    aboutText:
      "ClearView focuses on exterior washing done right the first time. From pollen season in Hot Springs to storefront sidewalks in Little Rock, we keep scheduling simple and results consistent — no bait-and-switch pricing.",
    trustTitle: "What customers say",
    trustQuotes: [
      { quote: "Quote came the same day and the driveway looked brand new after.", by: "Rachel M., homeowner" },
      { quote: "Professional crew, fair price, and they were careful around our landscaping.", by: "James T." },
    ],
    locationTitle: "Service area & hours",
    locationName: "ClearView Pressure Washing",
    address: "Serving Hot Springs, Little Rock, and surrounding areas",
    phone: "(501) 555-0142",
    hours: ["Mon–Sat: 7:00 AM – 6:00 PM", "Sunday: Closed", "Emergency commercial: call anytime"],
    contactBandTitle: "Get a free estimate",
    contactBandSub:
      "Text or call with photos and square footage — we will confirm scope and email a quote, usually within one business day.",
    finalTitle: "Book your wash window",
    finalSub:
      "Spring pollen, fall mildew, or pre-listing curb appeal — tell us your timeline and we will fit you in.",
    finalCta: "Call ClearView",
  };
}

function draftAutoDetailing(): SampleDraft {
  return {
    businessName: "North River Auto Detailing",
    tagline: "Mobile detailing · Ceramic protection · Fleet welcome",
    localPositioning: "We come to you · Book by text or call",
    heroImageUrl: DETAIL[0],
    heroImageAlt: "Polished vehicle exterior reflecting light after detailing",
    heroHeadline: "Showroom Shine Without the Wait at a Shop",
    heroSub:
      "Interior detailing, exterior wash & wax, and full packages for daily drivers and weekend rides. Mobile service at your home or office.",
    heroPrimaryCta: "Book Detailing",
    heroSecondaryCta: "See Packages",
    offeringsTitle: "Detailing services",
    offerings: [
      {
        name: "Interior Detailing",
        text: "Vacuum, steam-safe cleaning, leather conditioning, and windows streak-free inside and out.",
        image: DETAIL[1],
      },
      {
        name: "Exterior Wash & Wax",
        text: "Hand wash, decontamination, and durable wax or sealant for depth and protection.",
        image: DETAIL[2],
      },
      {
        name: "Full Detail Packages",
        text: "Inside-and-out reset: perfect before a sale, after winter, or whenever you want that new-car feel.",
        image: DETAIL[3],
      },
    ],
    gallerySectionTitle: "Finish quality",
    galleryImages: DETAIL,
    whyChooseTitle: "Why book North River",
    whyChooseBullets: [
      "Mobile service available — we work around your schedule.",
      "Clear packages so you know exactly what you are getting.",
      "Experienced with daily drivers, trucks, and weekend classics.",
      "Water-conscious methods and pro-grade products.",
    ],
    aboutTitle: "Detailing that respects your time",
    aboutText:
      "North River exists because you should not have to burn half a Saturday at a tunnel wash. We bring pro tools, attention to detail, and straightforward pricing to your driveway or workplace lot.",
    trustTitle: "Recent feedback",
    trustQuotes: [
      { quote: "Interior looked better than when I bought the car. Booking again in spring.", by: "Alex P." },
      { quote: "They showed up on time and the ceramic wax still beads weeks later.", by: "Samira K." },
    ],
    locationTitle: "Coverage & hours",
    locationName: "North River Auto Detailing",
    address: "Mobile service · Hot Springs metro & Conway corridor",
    phone: "(501) 555-0187",
    hours: ["Mon–Sat: 8:00 AM – 5:00 PM", "Sunday: By appointment"],
    contactBandTitle: "Lock in your appointment",
    contactBandSub: "Text or call with your vehicle type and location — we will confirm the same day when possible.",
    finalTitle: "Treat your vehicle to a proper detail",
    finalSub: "Ask about ceramic coating and maintenance washes for long-term protection.",
    finalCta: "Get Quote",
  };
}

function draftLandscaping(): SampleDraft {
  return {
    businessName: "Greenline Lawn & Landscape",
    tagline: "Lawn care · Mulch · Seasonal cleanups",
    localPositioning: "Neighborhood crews · Recurring routes available",
    heroImageUrl: LAWN[0],
    heroImageAlt: "Freshly mowed lawn with landscaped beds and mulch",
    heroHeadline: "A Healthier Yard Without the Weekend Work",
    heroSub:
      "Reliable mowing, crisp edges, mulch refreshes, and shrub care — scheduled so your property stays sharp all season.",
    heroPrimaryCta: "Request Estimate",
    heroSecondaryCta: "Our Services",
    offeringsTitle: "Popular services",
    offerings: [
      {
        name: "Lawn Maintenance",
        text: "Weekly or biweekly mowing, edging, and blowing — consistent height and stripe-ready finish.",
        image: LAWN[1],
      },
      {
        name: "Mulch & Cleanup",
        text: "Bed redefinition, fresh mulch, and leaf or storm debris haul-off for a tidy look.",
        image: LAWN[2],
      },
      {
        name: "Shrub Trimming",
        text: "Hand pruning and shaping to encourage growth and keep sight lines clear.",
        image: LAWN[3],
      },
    ],
    gallerySectionTitle: "Yards we maintain",
    galleryImages: LAWN,
    whyChooseTitle: "Why property owners choose Greenline",
    whyChooseBullets: [
      "Same crew familiarity week to week when you are on a route.",
      "Straightforward seasonal plans — spring cleanup through fall leaves.",
      "Equipment maintained daily for clean cuts and fewer delays.",
      "Local owner-operator who answers the phone.",
    ],
    aboutTitle: "Local roots, dependable rhythm",
    aboutText:
      "Greenline started with a handful of neighbors who wanted a lawn that looked cared for — not a one-off mow. We built recurring routes, clear pricing, and crews who know your property by name.",
    trustTitle: "Homeowner notes",
    trustQuotes: [
      { quote: "They actually show up on the day promised. Our HOA comments stopped.", by: "Chris & Dana W." },
      { quote: "Mulch and trimming package made our beds look intentional again.", by: "Patricia L." },
    ],
    locationTitle: "Service area",
    locationName: "Greenline Lawn & Landscape",
    address: "Hot Springs, Lake Hamilton, and west Garland County",
    phone: "(501) 555-0163",
    hours: ["Mon–Fri: 7:30 AM – 5:30 PM", "Sat: 8:00 AM – 1:00 PM"],
    contactBandTitle: "Book a walkthrough",
    contactBandSub: "We will measure beds, note slopes, and email a written estimate within 48 hours.",
    finalTitle: "Love your yard again",
    finalSub: "Seasonal packages available — ask about leaf removal and spring refresh bundles.",
    finalCta: "Call Today",
  };
}

function draftPlumbingHvac(): SampleDraft {
  return {
    businessName: "Summit Plumbing & Comfort",
    tagline: "Plumbing repair · Water heaters · HVAC tune-ups",
    localPositioning: "Same-week appointments · Emergency line",
    heroImageUrl: HVAC[0],
    heroImageAlt: "Technician working on HVAC or plumbing equipment",
    heroHeadline: "Repairs Done Right the First Time",
    heroSub:
      "Leaks, clogs, fixture installs, water heaters, and seasonal HVAC tune-ups — clear diagnostics and upfront options before we start work.",
    heroPrimaryCta: "Schedule Service",
    heroSecondaryCta: "Emergency Line",
    offeringsTitle: "How we help",
    offerings: [
      {
        name: "Drain & Leak Repair",
        text: "Camera options when needed, clean work areas, and fixes that address the cause — not just the symptom.",
        image: HVAC[1],
      },
      {
        name: "Water Heater Service",
        text: "Repairs, flushes, and replacements with efficiency guidance for your household size.",
        image: HVAC[2],
      },
      {
        name: "HVAC Tune-Ups",
        text: "Cooling and heating checks, filter guidance, and honest talk about when to repair vs replace.",
        image: HVAC[3],
      },
    ],
    gallerySectionTitle: "On the job",
    galleryImages: HVAC,
    whyChooseTitle: "Why Summit",
    whyChooseBullets: [
      "Licensed pros who explain findings in plain language.",
      "Written estimates before major work moves forward.",
      "Respect for your home: shoe covers, drop cloths, and tidy wrap-up.",
      "Emergency routing for active leaks and no-heat situations.",
    ],
    aboutTitle: "Comfort you can count on",
    aboutText:
      "Summit blends old-school plumbing craft with modern diagnostics. Whether it is a dripping shutoff or a system that is not keeping up in July heat, we focus on durable fixes and predictable communication.",
    trustTitle: "Customer trust",
    trustQuotes: [
      { quote: "They showed me the camera footage and gave three price tiers. No pressure.", by: "Jordan E." },
      { quote: "Furnace tune-up caught a cracked part before winter. Worth every penny.", by: "Melissa R." },
    ],
    locationTitle: "Dispatch & hours",
    locationName: "Summit Plumbing & Comfort",
    address: "Serving Garland County and Saline County",
    phone: "(501) 555-0175",
    hours: ["Mon–Fri: 7:00 AM – 6:00 PM", "Sat: 8:00 AM – 2:00 PM", "Emergency: 24/7 line"],
    contactBandTitle: "Need help today?",
    contactBandSub: "Call for triage — we will advise what to shut off and when a tech can arrive.",
    finalTitle: "Book your visit",
    finalSub: "Ask about maintenance memberships for seasonal HVAC checks.",
    finalCta: "Call Now",
  };
}

function draftWellnessWiseBody(): SampleDraft {
  return {
    businessName: "Wise Body Mind Soul",
    tagline: "Melissa Wise · Massage · Yoga · Sound healing",
    localPositioning:
      "A calmer, more restorative online experience designed to match the quality of the care offered in person.",
    heroImageUrl: WELLNESS[0],
    heroImageAlt: "Calm spa treatment room with soft towels and natural light",
    heroHeadline: "Holistic wellness for body, mind, and soul",
    heroSub: "Massage therapy, yoga, and restorative healing experiences in Hot Springs Village, Arkansas.",
    heroPrimaryCta: "Book a Session",
    heroSecondaryCta: "Explore Services",
    offeringsTitle: "Services",
    servicesSectionLead:
      "Thoughtful sessions and classes — each offering is designed to help you reset, breathe deeper, and feel more like yourself.",
    offerings: [
      {
        name: "Massage Therapy",
        text: "Therapeutic touch to ease tension, support recovery, and restore balance — tailored pressure and focus based on what your body needs that day.",
        image: WELLNESS[0],
        imageAlt: "Therapeutic massage session in a peaceful treatment space",
      },
      {
        name: "Yoga Classes",
        text: "Grounding movement and breath in a supportive setting — approachable pacing whether you are new to the mat or returning to practice.",
        image: WELLNESS[1],
        imageAlt: "Yoga practice in a bright, calm studio space",
      },
      {
        name: "Sound Baths",
        text: "Immersive sound and stillness to quiet the mind — a gentle reset for nervous system and spirit without needing to \"do\" anything.",
        image: WELLNESS[2],
        imageAlt: "Singing bowls and meditation props arranged for a sound bath",
      },
    ],
    gallerySectionTitle: "",
    galleryImages: [],
    whyChooseTitle: "What makes this practice different",
    whyChooseBullets: [
      "Personalized sessions — your goals and comfort lead every visit.",
      "Thoughtful therapeutic products and a clean, calming environment.",
      "A supportive healing space where you are seen as a whole person.",
      "Local Hot Springs Village practice with booking that respects your time.",
    ],
    aboutTitle: "A healing practice rooted in experience",
    aboutText:
      "Wise Body Mind Soul exists to hold space for real rest. Melissa brings years of hands-on bodywork, movement, and mindful practice together so clients can soften stress, reconnect with their bodies, and leave feeling lighter. This work is slow, intentional, and grounded in compassion — never rushed, never noisy.",
    aboutCtaLabel: "Book a Session",
    trustTitle: "Kind words from clients",
    trustQuotes: [
      {
        quote: "The most grounding massage I have had in years — I walked out feeling human again.",
        by: "Local client",
      },
      {
        quote: "Her yoga classes feel welcoming, not intimidating. I finally stuck with a practice.",
        by: "Class member",
      },
      {
        quote: "The sound bath was unlike anything I expected — deep calm without forcing it.",
        by: "First-time guest",
      },
    ],
    locationTitle: "Visit & hours",
    locationName: "Wise Body Mind Soul",
    address: "Hot Springs Village, Arkansas — details provided when you book.",
    phone: "(501) 555-0191",
    hours: ["By appointment", "Message or call for class schedule", "New clients welcome"],
    contactBandTitle: "Questions before you book?",
    contactBandSub: "Reach out for session types, class times, or what to expect on your first visit.",
    finalTitle: "Ready to book your session?",
    finalSub: "Experience massage therapy, yoga, and restorative wellness in a calm local setting.",
    finalCta: "Schedule Now",
  };
}

function draftRestaurant(): SampleDraft {
  return {
    businessName: "Brick & Ember Kitchen",
    tagline: "Restaurant · Catering · Food truck events",
    localPositioning: "Downtown Hot Springs · Family-owned",
    heroImageUrl: FOOD[0],
    heroImageAlt: "Plated restaurant meal with warm lighting",
    heroHeadline: "Bold Flavors, Fast Service, Room for Everyone",
    heroSub:
      "Dine in, order ahead, or book the truck for your lot or festival. Weekly specials and a menu designed for speed without cutting corners.",
    heroPrimaryCta: "Order Online",
    heroSecondaryCta: "View Menu",
    offeringsTitle: "What we serve",
    offerings: [
      {
        name: "Scratch-Made Plates",
        text: "Hand-cut proteins, house sauces, and sides that rotate with the season.",
        image: FOOD[1],
      },
      {
        name: "Food Truck & Catering",
        text: "Corporate lunches, weddings, and brewery nights — custom bundles and clear headcount pricing.",
        image: FOOD[2],
      },
      {
        name: "Family Packs To-Go",
        text: "Feed four to six fast: proteins, sides, and drinks packaged for easy pickup.",
        image: FOOD[3],
      },
    ],
    gallerySectionTitle: "From the kitchen & truck",
    galleryImages: FOOD,
    whyChooseTitle: "Why guests come back",
    whyChooseBullets: [
      "Mobile-friendly ordering — tap to call or order in two clicks.",
      "Transparent hours, parking notes, and allergy-friendly staff training.",
      "Consistent quality whether you are at the counter or the window.",
      "Local sourcing where it makes sense for freshness.",
    ],
    aboutTitle: "Our table is your table",
    aboutText:
      "Brick & Ember started as a weekend pop-up and grew into a brick-and-mortar plus truck fleet. This sample site shows how we would present menus, catering, and events in one clean story.",
    trustTitle: "Guest words",
    trustQuotes: [
      { quote: "Ordered from my phone and it was ready in fifteen minutes.", by: "Taylor B." },
      { quote: "They catered our office lunch — on time and labeled for vegetarians.", by: "HR lead, local firm" },
    ],
    locationTitle: "Visit & hours",
    locationName: "Brick & Ember Kitchen",
    address: "214 Central Ave, Hot Springs, AR 71901",
    phone: "(501) 555-0129",
    hours: ["Sun–Thu: 11:00 AM – 9:00 PM", "Fri–Sat: 11:00 AM – 10:30 PM", "Truck schedule: see events page"],
    contactBandTitle: "Book the truck or a table",
    contactBandSub: "Event inquiries answered within one business day — include date, headcount, and location.",
    finalTitle: "Hungry yet?",
    finalSub: "Stop in, order ahead, or ask about catering and truck routing.",
    finalCta: "Reserve / Order",
  };
}

const DEFINITIONS: Array<
  PortfolioSampleMeta & {
    buildDraft: () => SampleDraft;
  }
> = [
  {
    routeSlug: "pressure-washing",
    title: "ClearView Pressure Washing",
    category: "Pressure washing",
    description: "A simple pressure washing website designed to turn visitors into calls and booked jobs.",
    cardImageUrl: PORTFOLIO_PRESSURE_WASHING_HERO_PRIMARY,
    stylePreset: "clean-modern",
    colorPreset: "blue",
    buildDraft: draftPressureWashing,
  },
  {
    routeSlug: "auto-detailing",
    title: "North River Auto Detailing",
    category: "Auto detailing",
    description: "A mobile-friendly detailing site built to bring in more calls and booked appointments.",
    cardImageUrl: DETAIL[0],
    stylePreset: "bold-premium",
    colorPreset: "dark",
    buildDraft: draftAutoDetailing,
  },
  {
    routeSlug: "landscaping",
    title: "Greenline Lawn & Landscape",
    category: "Landscaping / lawn care",
    description: "A lawn care site focused on recurring work, estimates, and trust — so neighbors know who to call.",
    cardImageUrl: LAWN[0],
    stylePreset: "friendly-local",
    colorPreset: "green",
    buildDraft: draftLandscaping,
  },
  {
    routeSlug: "plumbing",
    title: "Summit Plumbing & Comfort",
    category: "Plumbing / HVAC",
    description: "A plumbing and HVAC site built for emergency calls, tune-ups, and clear next steps for homeowners.",
    cardImageUrl: HVAC[0],
    stylePreset: "clean-modern",
    colorPreset: "warm-neutral",
    buildDraft: draftPlumbingHvac,
  },
  {
    routeSlug: "restaurant",
    title: "Brick & Ember Kitchen",
    category: "Restaurant / food truck",
    description: "A restaurant and food truck site that makes ordering, catering, and events easy to find and book.",
    cardImageUrl: FOOD[0],
    stylePreset: "minimal-elegant",
    colorPreset: "bold-accent",
    buildDraft: draftRestaurant,
  },
  {
    routeSlug: "wellness",
    title: "Wise Body Mind Soul — Wellness Mockup",
    category: "Wellness / Massage / Yoga",
    description:
      "Wide, premium wellness homepage with layered sand-and-sage backgrounds — massage, yoga, and sound baths with clear booking flow.",
    cardImageUrl: WELLNESS[0],
    stylePreset: "minimal-elegant",
    colorPreset: "wellness",
    buildDraft: draftWellnessWiseBody,
  },
];

export const PORTFOLIO_SAMPLES: PortfolioSampleMeta[] = DEFINITIONS.map((d) => {
  const { buildDraft: _bd, ...meta } = d;
  return meta;
});

export function getPortfolioSampleBySlug(slug: string):
  | (PortfolioSampleMeta & { draft: SampleDraft })
  | undefined {
  const found = DEFINITIONS.find((d) => d.routeSlug === slug);
  if (!found) return undefined;
  return {
    routeSlug: found.routeSlug,
    title: found.title,
    category: found.category,
    description: found.description,
    cardImageUrl: found.cardImageUrl,
    stylePreset: found.stylePreset,
    colorPreset: found.colorPreset,
    draft: found.buildDraft(),
  };
}

export function listPortfolioRouteSlugs(): string[] {
  return DEFINITIONS.map((d) => d.routeSlug);
}
