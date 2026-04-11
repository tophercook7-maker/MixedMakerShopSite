import type { LocalPage } from "../../types/local-seo";

/**
 * Fresh Cut Property Care — preserved full-fidelity local landing pages (lawn-care niche).
 * To add URLs for this client, extend this array or switch the client to generated mode in
 * `src/data/clients/fresh-cut-property-care.ts`.
 */
export const FRESH_CUT_LOCAL_PAGES: readonly LocalPage[] = [
  {
    slug: "lawn-care-hot-springs-ar",
    serviceKey: "lawn-care",
    serviceName: "Lawn care",
    city: "Hot Springs",
    state: "Arkansas",
    stateAbbr: "AR",
    locationId: "hot-springs-ar",
    nearbyAreas: ["Lake Hamilton", "Pleasant Hill", "Rockwell", "Mountain Pine"],
    intro:
      "Healthy grass in Hot Springs has to deal with heat, humidity, and sudden storms. I set up mowing on a steady rhythm, keep edges and beds looking intentional, and watch for thin spots before they turn into bare patches along sidewalks and driveways.",
    metaTitle: "Lawn Care in Hot Springs, AR | Fresh Cut Property Care",
    metaDescription:
      "Reliable lawn care in Hot Springs, AR. Fresh Cut Property Care provides practical mowing, edging, and seasonal lawn help with easy estimate requests.",
    whatWeOffer: [
      "Scheduled mowing with crisp, consistent height through the growing season",
      "Edging and line cleanup so concrete borders look sharp, not overgrown",
      "Seasonal adjustments for fertilizing windows, weed pressure, and drought stress",
      "Bed and tree ring touch-ups so mulch doesn’t spill into the lawn after storms",
    ],
    whyChooseUs: [
      "Local scheduling that respects Hot Springs traffic and narrow neighborhood streets",
      "Straightforward pricing and a clear plan — no mystery “packages”",
      "Equipment maintained for clean cuts, not torn grass blades after every visit",
      "Photos and notes available on request so you know what was done and why",
    ],
    commonJobs: [
      "Weekly or biweekly mowing for busy families near Lake Hamilton",
      "Corner lots that collect clippings and need extra blower cleanup",
      "Rental properties between guests where the lawn has to look cared for fast",
      "Overgrown edges along sidewalks where grass creeps into concrete joints",
      "Thin strips beside fences where string trimming makes the biggest visual difference",
    ],
    faq: [
      {
        question: "Do you service homes near Lake Hamilton and the national park area?",
        answer:
          "Yes. I route work across Hot Springs and nearby neighborhoods. Tell me your address and any gate or parking notes when you request an estimate.",
      },
      {
        question: "What if my lawn is mostly weeds right now?",
        answer:
          "That’s common. We’ll be honest about what a clean-up takes, what can improve with steady mowing and edging, and when targeted treatment makes sense for your goals and budget.",
      },
      {
        question: "Can you coordinate around my irrigation or lawn treatment schedule?",
        answer:
          "Absolutely. Share your watering days and any recent fertilizer or spray dates so visits land at the right time for your grass.",
      },
    ],
    primaryCtaLabel: "Request a Free Estimate",
    primaryCtaHref: "/contact#estimate",
    secondaryCtaLabel: "See Pricing or Contact",
    secondaryCtaHref: "/pricing",
  },
  {
    slug: "lawn-mowing-hot-springs-ar",
    serviceKey: "lawn-mowing",
    serviceName: "Lawn mowing",
    city: "Hot Springs",
    state: "Arkansas",
    stateAbbr: "AR",
    locationId: "hot-springs-ar",
    nearbyAreas: ["Lake Hamilton", "Pleasant Hill", "Rockwell"],
    intro:
      "Mowing sounds simple until the grass jumps after a week of rain. I keep Hot Springs yards level, stripe-free where you want a clean residential look, and I pay attention to the details that make a lawn feel maintained — not just shorter.",
    metaTitle: "Lawn Mowing in Hot Springs, AR | Fresh Cut Property Care",
    metaDescription:
      "Reliable lawn mowing in Hot Springs, AR. Consistent visits, careful trimming, and blower cleanup so your property looks cared for every time.",
    whatWeOffer: [
      "Regular mowing on an agreed cadence that matches how fast your turf grows",
      "String trimming around posts, fences, and tight corners the mower can’t reach",
      "Blower cleanup of walks and drives so clippings don’t track into the house",
      "Straightforward rescheduling when storms soak the yard and cutting too soon would damage grass",
    ],
    whyChooseUs: [
      "Predictable routes across Hot Springs so your yard doesn’t get skipped during peak season",
      "Blades kept sharp — dull equipment is what leaves frayed tips and a grayish cast",
      "Respect for irrigation heads and landscaped beds while trimming",
      "Clear communication if something looks off (fungus, pet damage, thin spots)",
    ],
    commonJobs: [
      "Steep front yards where a clean line along the curb matters for curb appeal",
      "Side yards between houses where airflow is poor and grass grows unevenly",
      "Homes on travel schedules where the lawn has to look tidy on short notice",
      "Corners where the city mower misses and your property picks up the slack",
    ],
    faq: [
      {
        question: "What height do you cut at in summer?",
        answer:
          "I adjust by season and grass type, favoring slightly taller cuts in peak heat to reduce stress. If you have a preference for your yard, tell me and we’ll align with what your turf can support.",
      },
      {
        question: "Do you bag clippings?",
        answer:
          "Most of the time mulching is healthier and returns nutrients, but if you’re dealing with heavy growth or disease concerns, we can discuss bagging or extra cleanup for that visit.",
      },
    ],
    primaryCtaLabel: "Request a Free Estimate",
    primaryCtaHref: "/contact#estimate",
    secondaryCtaLabel: "See Pricing or Contact",
    secondaryCtaHref: "/pricing",
  },
  {
    slug: "yard-cleanup-hot-springs-ar",
    serviceKey: "yard-cleanup",
    serviceName: "Yard cleanup",
    city: "Hot Springs",
    state: "Arkansas",
    stateAbbr: "AR",
    locationId: "hot-springs-ar",
    nearbyAreas: ["Mountain Pine", "National Park area", "Pleasant Hill"],
    intro:
      "Storms, pine needles, and leaves pile up fast around Hot Springs. I handle the kind of cleanups that make a yard feel open again — brush moved off paths, beds visible, and debris off the lawn so grass isn’t smothered after weather swings.",
    metaTitle: "Yard Cleanup in Hot Springs, AR | Fresh Cut Property Care",
    metaDescription:
      "Reliable yard cleanup in Hot Springs, AR. Seasonal debris removal, bed clearing, and thorough blower work so your outdoor space looks cared for again.",
    whatWeOffer: [
      "Seasonal cleanups after storms, heavy leaf drop, or neglected stretches of growth",
      "Bed and border clearing so mulch and plants aren’t buried under debris",
      "Haul-off or pile-and-stage options depending on volume and city pickup schedules",
      "Final blower pass on turf, walks, and drives for a finished look",
    ],
    whyChooseUs: [
      "Practical sorting: what can mulch, what should leave the property, and what needs a different disposal route",
      "Care around shallow roots and ornamental beds — cleanup shouldn’t wreck what you’re trying to keep",
      "Honest time estimates so you’re not surprised when a heavy cleanup is a multi-step job",
    ],
    commonJobs: [
      "Back patios buried in oak leaves after a windy week",
      "Fence lines where leaves collect and hold moisture against wood and metal",
      "Rental turnovers where the yard has to look tidy before the next guest",
      "Overgrown corners that became storage for branches and random yard waste",
    ],
    faq: [
      {
        question: "Will you remove large branches?",
        answer:
          "Light limb work and drag-to-curb options are common. For major tree damage or overhead hazards, I’ll point you toward an arborist and help with ground cleanup once it’s safe.",
      },
      {
        question: "Do you offer one-time cleanups only?",
        answer:
          "Yes — many calls are one-off projects. If you want ongoing seasonal visits, we can set a simple schedule for spring and fall peaks.",
      },
    ],
    primaryCtaLabel: "Request a Free Estimate",
    primaryCtaHref: "/contact#estimate",
    secondaryCtaLabel: "See Pricing or Contact",
    secondaryCtaHref: "/pricing",
  },
  {
    slug: "leaf-removal-hot-springs-ar",
    serviceKey: "leaf-removal",
    serviceName: "Leaf removal",
    city: "Hot Springs",
    state: "Arkansas",
    stateAbbr: "AR",
    locationId: "hot-springs-ar",
    nearbyAreas: ["Lake Hamilton", "Rockwell", "Pleasant Hill"],
    intro:
      "Leaves mat down fast in Hot Springs humidity. I remove heavy layers from turf and hardscapes so you’re not fighting moldy patches, clogged drains, or slick walkways when guests pull in.",
    metaTitle: "Leaf Removal in Hot Springs, AR | Fresh Cut Property Care",
    metaDescription:
      "Reliable leaf removal in Hot Springs, AR. Thorough clearing from lawns, beds, and drives with practical disposal options for a cleaner, safer yard.",
    whatWeOffer: [
      "Multi-pass clearing for big drops — one pass rarely fixes a thick mat of leaves",
      "Hardscape and gutter-line cleanup where leaves choke drainage",
      "Bed work so perennials aren’t smothered and mulch stays where it belongs",
      "Options for bagging, curbside staging, or haul-off depending on volume",
    ],
    whyChooseUs: [
      "Attention to turf health: removal is also about airflow and sunlight reaching the soil",
      "Care around irrigation and lighting fixtures buried under debris",
      "Scheduling around weather — wet leaves need a different approach than dry ones",
    ],
    commonJobs: [
      "Oak-heavy lots with layered leaves along fence lines",
      "Driveways that flood when catch basins are packed with debris",
      "Homes prepping for sale where the yard needs to look crisp fast",
      "Wooded backyards where leaves drift into seating areas and paths",
    ],
    faq: [
      {
        question: "Is it better to mulch leaves into the lawn?",
        answer:
          "Light mulching can work, but thick mats should be thinned or removed. I’ll recommend what fits your turf density and how late we are in the season.",
      },
      {
        question: "Can you work around my landscape crew?",
        answer:
          "Yes — share your timing and I’ll coordinate so we’re not fighting the same areas on the same day.",
      },
    ],
    primaryCtaLabel: "Request a Free Estimate",
    primaryCtaHref: "/contact#estimate",
    secondaryCtaLabel: "See Pricing or Contact",
    secondaryCtaHref: "/pricing",
  },
  {
    slug: "pressure-washing-hot-springs-ar",
    serviceKey: "pressure-washing",
    serviceName: "Pressure washing",
    city: "Hot Springs",
    state: "Arkansas",
    stateAbbr: "AR",
    locationId: "hot-springs-ar",
    nearbyAreas: ["National Park area", "Mountain Pine", "Lake Hamilton"],
    intro:
      "Algae and pollen love Arkansas humidity. I wash concrete, siding-safe areas, and outdoor living spaces with the right pressure and fan so surfaces get clean without etching soft materials or forcing water where it shouldn’t go.",
    metaTitle: "Pressure Washing in Hot Springs, AR | Fresh Cut Property Care",
    metaDescription:
      "Reliable pressure washing in Hot Springs, AR. Concrete, decks, and exterior surfaces cleaned with careful technique and straightforward pricing.",
    whatWeOffer: [
      "Driveways, sidewalks, and patios cleaned with controlled pressure and proper fan patterns",
      "House washing approaches that match your siding type — not one blast fits all",
      "Porch and outdoor kitchen areas where grease and pollen combine",
      "Post-clean walkthrough so you see problem spots before they become permanent staining",
    ],
    whyChooseUs: [
      "Technique-first mindset: the goal is clean surfaces, not contractor scars",
      "Clear scope: what we can wash safely, what needs a specialist, and why",
      "Respect for landscaping — runoff and overspray get managed, not ignored",
    ],
    commonJobs: [
      "Shaded driveways that turn slick with algae near tree cover",
      "Rental properties needing a quick exterior refresh between bookings",
      "Pool decks where bare feet need grip, not slime",
      "Garage aprons stained from leaf tannins and road grime",
    ],
    faq: [
      {
        question: "Will pressure washing damage my siding?",
        answer:
          "Soft washing methods and appropriate detergents are used for many exteriors. If something shouldn’t be high-pressure blasted, I’ll say so and recommend a safer approach.",
      },
      {
        question: "Do I need to move everything off my patio?",
        answer:
          "Light clearing helps. For heavy items, tell me what you can move and what you need help with — we’ll plan around it.",
      },
    ],
    primaryCtaLabel: "Request a Free Estimate",
    primaryCtaHref: "/contact#estimate",
    secondaryCtaLabel: "See Pricing or Contact",
    secondaryCtaHref: "/pricing",
  },
  {
    slug: "driveway-cleaning-hot-springs-ar",
    serviceKey: "driveway-cleaning",
    serviceName: "Driveway cleaning",
    city: "Hot Springs",
    state: "Arkansas",
    stateAbbr: "AR",
    locationId: "hot-springs-ar",
    nearbyAreas: ["Pleasant Hill", "Rockwell", "Lake Hamilton"],
    intro:
      "Driveways take a beating from hot tires, leaf tannins, and drip marks. In Hot Springs I focus on lifting grime without chewing up expansion joints or stripping sealer — so the approach matches concrete, asphalt, or pavers.",
    metaTitle: "Driveway Cleaning in Hot Springs, AR | Fresh Cut Property Care",
    metaDescription:
      "Reliable driveway cleaning in Hot Springs, AR. Remove buildup, restore curb appeal, and protect surfaces with careful washing and honest scope.",
    whatWeOffer: [
      "Surface-specific cleaning for concrete, asphalt, and many paver systems",
      "Pretreatment on oil spots and organic stains where realistic improvement is possible",
      "Edge and curb attention — where grass stains and soil collect first",
      "Finishing guidance if you’re planning sealcoat afterward",
    ],
    whyChooseUs: [
      "Joints and edges matter: that’s where water sits and stains set in",
      "Honest expectations on older oil spots that may only lighten, not disappear",
      "Cleanup that doesn’t leave muddy soup running into your garage slab",
    ],
    commonJobs: [
      "Shaded drives with black algae streaks near tree lines",
      "Homes preparing to list where the driveway photo has to pop",
      "Basketball half-courts and parking pads with leaf-packed corners",
      "Steep drives where traction matters after mossy buildup",
    ],
    faq: [
      {
        question: "Should I seal my driveway after cleaning?",
        answer:
          "Often yes, if the surface is in good shape and you want longer-lasting stain resistance. Cleaning first is the right prep — I’ll tell you what I’m seeing before you spend on sealer.",
      },
      {
        question: "Can you remove old oil stains completely?",
        answer:
          "Fresh spots respond best. Older stains may improve noticeably but not vanish. I’ll show you what’s realistic before we start.",
      },
    ],
    primaryCtaLabel: "Request a Free Estimate",
    primaryCtaHref: "/contact#estimate",
    secondaryCtaLabel: "See Pricing or Contact",
    secondaryCtaHref: "/pricing",
  },
  {
    slug: "lawn-care-hot-springs-village-ar",
    serviceKey: "lawn-care",
    serviceName: "Lawn care",
    city: "Hot Springs Village",
    state: "Arkansas",
    stateAbbr: "AR",
    locationId: "hot-springs-village-ar",
    nearbyAreas: ["Lake Cortez", "Lake Desoto", "Magellan Golf area"],
    intro:
      "Hot Springs Village lots range from compact golf-side lawns to wooded acreage with pine straw and tight turns. I plan routes carefully, respect HOA visibility rules where they apply, and keep communication clear for seasonal residents who aren’t always on-site.",
    metaTitle: "Lawn Care in Hot Springs Village, AR | Fresh Cut Property Care",
    metaDescription:
      "Reliable lawn care in Hot Springs Village, AR. Steady mowing, edging, and seasonal help tailored to golf-side lots, wooded homes, and seasonal schedules.",
    whatWeOffer: [
      "Mowing and edging plans that match fast-growing turf in spring and controlled growth in summer",
      "Trimming approaches for pine-heavy edges and beds that collect needles",
      "Seasonal adjustments for fertilizer timing and weed pressure common to Village turf",
      "Photo updates available for owners who manage the property from out of town",
    ],
    whyChooseUs: [
      "Experience with Village routing, gate codes, and narrow drives",
      "Straightforward recommendations — not a pushy upsell every visit",
      "Equipment sized for residential lots, not a one-size commercial rig wedged into your yard",
    ],
    commonJobs: [
      "Golf-course lots where presentation matters along fairway sightlines",
      "Wooded homes with mulch beds that spill into turf after storms",
      "Seasonal homes that need dependable service between visits",
      "Corner lots with extra edging along roads and cart-path visibility",
    ],
    faq: [
      {
        question: "Can you work with my HOA guidelines?",
        answer:
          "Yes — share the key rules (height, edging, debris) and I’ll align the plan so your yard stays compliant without guesswork.",
      },
      {
        question: "Do you service if I’m not in town?",
        answer:
          "Many Village clients aren’t local year-round. We can coordinate access, priorities, and updates remotely so the property still looks maintained.",
      },
    ],
    primaryCtaLabel: "Request a Free Estimate",
    primaryCtaHref: "/contact#estimate",
    secondaryCtaLabel: "See Pricing or Contact",
    secondaryCtaHref: "/pricing",
  },
  {
    slug: "pressure-washing-hot-springs-village-ar",
    serviceKey: "pressure-washing",
    serviceName: "Pressure washing",
    city: "Hot Springs Village",
    state: "Arkansas",
    stateAbbr: "AR",
    locationId: "hot-springs-village-ar",
    nearbyAreas: ["West Gate area", "DeSoto Blvd corridor", "Lake Cortez"],
    intro:
      "Village homes pick up pollen, mildew, and drip stains from tree cover — especially on patios and north-facing concrete. I focus on controlled cleaning that respects decks, decorative stone, and the kind of finishes you see on higher-end exteriors.",
    metaTitle: "Pressure Washing in Hot Springs Village, AR | Fresh Cut Property Care",
    metaDescription:
      "Reliable pressure washing in Hot Springs Village, AR. Decks, concrete, and exterior surfaces cleaned with careful technique for wooded lots and seasonal homes.",
    whatWeOffer: [
      "Concrete drives and paths with algae and tannin staining common under trees",
      "Exterior washing methods matched to siding and trim materials",
      "Outdoor living spaces where pollen and dust reset every week in spring",
      "Prep washes before painting or sealing when you’re planning bigger projects",
    ],
    whyChooseUs: [
      "Technique-first: many Village finishes need finesse, not brute force",
      "Clear scope and access planning for homes with gates and winding drives",
      "Respect for landscaping — especially beds and irrigation near hardscapes",
    ],
    commonJobs: [
      "North-facing patios that stay damp and turn slick",
      "Driveways with leaf-packed edges along curbs",
      "Homes staging for sale in competitive Village neighborhoods",
      "Pool surrounds where bare feet need clean, grippy surfaces",
    ],
    faq: [
      {
        question: "Is soft washing available for siding?",
        answer:
          "Yes — many exteriors need detergents and lower pressure. I’ll match the method to what you’re trying to protect.",
      },
      {
        question: "What if my deck is older wood?",
        answer:
          "Older wood can be washed safely with the right fan and distance. If boards are splintering or failing, I’ll recommend repairs before aggressive cleaning.",
      },
    ],
    primaryCtaLabel: "Request a Free Estimate",
    primaryCtaHref: "/contact#estimate",
    secondaryCtaLabel: "See Pricing or Contact",
    secondaryCtaHref: "/pricing",
  },
  {
    slug: "lawn-care-lake-hamilton-ar",
    serviceKey: "lawn-care",
    serviceName: "Lawn care",
    city: "Lake Hamilton",
    state: "Arkansas",
    stateAbbr: "AR",
    locationId: "lake-hamilton-ar",
    nearbyAreas: ["Hot Springs National Park", "Red Oak", "Royal", "Lake Hamilton islands & coves"],
    intro:
      "Lake lots often mean slopes, tight access, and shoreline plantings you don’t want torn up. Around Lake Hamilton I focus on steady mowing lines, careful trimming near docks and retaining walls, and cleanup that doesn’t send clippings into the water.",
    metaTitle: "Lawn Care in Lake Hamilton, AR | Fresh Cut Property Care",
    metaDescription:
      "Reliable lawn care in Lake Hamilton, AR. Steep lots, waterfront access, and professional mowing with shoreline-smart cleanup and easy estimates.",
    whatWeOffer: [
      "Mowing plans that respect slopes and erosion-prone areas near the water",
      "Trimming with extra care near docks, rocks, and tight shorelines",
      "Seasonal adjustments for fast spring growth and summer heat stress",
      "Cleanup that keeps clippings and debris off beaches, paths, and shared access points",
    ],
    whyChooseUs: [
      "Shoreline-aware work — your lake access matters to you and your neighbors",
      "Honest talk about what turf can handle on steep grades versus where groundcover might be smarter",
      "Scheduling that fits weekend traffic and vacation rental turnovers",
    ],
    commonJobs: [
      "Steep front yards where string trimming defines the whole look",
      "Weekend homes that need a dependable rhythm between visits",
      "Homes with stone steps and paths where blown-off clippings are a safety issue",
      "Corners where lake wind piles leaves and debris against fences",
    ],
    faq: [
      {
        question: "Can you service properties with limited parking?",
        answer:
          "Yes — tell me about access, steep drives, and boat/trailer space. I’ll plan equipment and timing so we’re not blocking your neighbors.",
      },
      {
        question: "Do you handle lake-adjacent weed issues?",
        answer:
          "I can help with practical turf and bed management. For invasive shoreline plants or regulated areas, I’ll steer you to the right local guidance before doing work that could cause problems.",
      },
    ],
    primaryCtaLabel: "Request a Free Estimate",
    primaryCtaHref: "/contact#estimate",
    secondaryCtaLabel: "See Pricing or Contact",
    secondaryCtaHref: "/pricing",
  },
];
