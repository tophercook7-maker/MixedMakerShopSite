import { notFound } from "next/navigation";
import { getSampleBySlug } from "@/lib/website-samples";
import { SampleDraftClient, type SampleDraft } from "./sample-draft-client";

type ShowcaseType = "coffee" | "restaurant" | "church" | "plumbing" | "lawn";

function getShowcaseType(category: string, slug: string, name: string): ShowcaseType {
  if (category === "coffee") return "coffee";
  if (category === "restaurant") return "restaurant";
  if (category === "church") return "church";
  const needle = `${slug} ${name}`.toLowerCase();
  if (needle.includes("plumb")) return "plumbing";
  return "lawn";
}

function getShowcaseCopy(type: ShowcaseType, businessName: string): SampleDraft {
  if (type === "coffee") {
    return {
      businessName,
      tagline: "Neighborhood Coffee Bar",
      localPositioning: "Hot Springs, Arkansas",
      heroHeadline: "Craft Coffee, Fresh Pastries, and a Spot You Will Want to Return To",
      heroSub: "Your neighborhood coffee shop in Hot Springs for hand-crafted drinks, quick breakfast, and easy online ordering.",
      heroPrimaryCta: "Order Online",
      heroSecondaryCta: "See Menu",
      offeringsTitle: "Menu Favorites",
      offerings: [
        { name: "Signature Lattes", text: "House-made syrups, espresso flights, and seasonal drinks served all day." },
        { name: "Breakfast + Bakery", text: "Fresh muffins, croissants, and local pastry partnerships every morning." },
        { name: "Quick Pickup", text: "Order ahead from your phone and grab your drink without the wait." },
      ],
      aboutTitle: "Our Story",
      aboutText:
        `${businessName} started as a simple idea: serve excellent coffee, welcome everyone by name, and make mornings better in Hot Springs. We roast in small batches and keep the menu focused on quality and consistency.`,
      trustTitle: "What Regulars Say",
      trustQuotes: [
        { quote: "Best latte in town and the online order pickup is always smooth.", by: "Jordan M., Hot Springs" },
        { quote: "Great vibe, friendly team, and my go-to place before work.", by: "Casey T., Local Customer" },
      ],
      locationTitle: "Visit Us",
      locationName: businessName,
      address: "421 Central Ave, Hot Springs, AR 71901",
      phone: "(501) 555-0194",
      hours: ["Mon-Fri: 6:30 AM - 6:00 PM", "Sat: 7:00 AM - 7:00 PM", "Sun: 7:00 AM - 3:00 PM"],
      finalTitle: "Ready for Coffee?",
      finalSub: "Order ahead for pickup or stop in and stay awhile.",
      finalCta: "Order Online",
    };
  }
  if (type === "restaurant") {
    return {
      businessName,
      tagline: "Local Southern Kitchen",
      localPositioning: "Downtown Hot Springs",
      heroHeadline: "Southern Comfort Food Worth Coming Back For",
      heroSub: "Fresh daily specials, quick reservations, and a family-friendly dining room in Hot Springs.",
      heroPrimaryCta: "Reserve a Table",
      heroSecondaryCta: "View Menu",
      offeringsTitle: "Popular Menu Sections",
      offerings: [
        { name: "Breakfast Favorites", text: "Scratch biscuits, omelets, and hot coffee served from open to 11 AM." },
        { name: "Lunch + Dinner Plates", text: "Classic Southern entrees, house sides, and weekly chef specials." },
        { name: "Family Packs To-Go", text: "Easy takeout bundles for weeknights and gatherings." },
      ],
      aboutTitle: "Our Story",
      aboutText:
        `${businessName} has served Hot Springs families for over a decade with straightforward food, friendly staff, and generous portions. We keep things simple: quality ingredients, warm service, and meals worth sharing.`,
      trustTitle: "Guest Reviews",
      trustQuotes: [
        { quote: "Reservation was easy and the food came out fast on a busy Friday night.", by: "Megan R." },
        { quote: "Great portions, great service, and the website made ordering takeout painless.", by: "Brandon L." },
      ],
      locationTitle: "Location + Hours",
      locationName: businessName,
      address: "214 Malvern Ave, Hot Springs, AR 71901",
      phone: "(501) 555-0121",
      hours: ["Mon-Thu: 11:00 AM - 9:00 PM", "Fri-Sat: 11:00 AM - 10:00 PM", "Sun: 11:00 AM - 8:00 PM"],
      finalTitle: "Hungry? Let's Get You a Table",
      finalSub: "Book now or call us for same-day seating and takeout.",
      finalCta: "Call Now",
    };
  }
  if (type === "church") {
    return {
      businessName,
      tagline: "Everyone Is Welcome Here",
      localPositioning: "Serving Hot Springs Families",
      heroHeadline: "A Place to Belong, Grow, and Serve Together",
      heroSub: "Join us this Sunday in Hot Springs for worship, biblical teaching, and a welcoming church family.",
      heroPrimaryCta: "Plan Your Visit",
      heroSecondaryCta: "Service Times",
      offeringsTitle: "Ministries + Weekly Life",
      offerings: [
        { name: "Sunday Worship", text: "Biblical teaching and worship services for all ages." },
        { name: "Kids + Student Ministry", text: "Safe, engaging classes that help young people grow in faith." },
        { name: "Midweek Groups", text: "Small groups, prayer nights, and community outreach opportunities." },
      ],
      aboutTitle: "Our Story",
      aboutText:
        `${businessName} is a community-focused church in Hot Springs committed to helping people know Jesus and grow together. Whether you are new to church or returning after years away, you are welcome here.`,
      trustTitle: "From Our Church Family",
      trustQuotes: [
        { quote: "We felt welcomed on day one and knew exactly where to go.", by: "The Carter Family" },
        { quote: "The service times and ministries were easy to find before our first visit.", by: "Amanda P." },
      ],
      locationTitle: "Service Times + Location",
      locationName: businessName,
      address: "915 Airport Rd, Hot Springs, AR 71913",
      phone: "(501) 555-0148",
      hours: ["Sunday Worship: 9:00 AM & 10:45 AM", "Wednesday Groups: 6:30 PM", "Office: Mon-Thu 9:00 AM - 4:00 PM"],
      finalTitle: "We Would Love to Meet You",
      finalSub: "Join us this Sunday and let us help you plan your first visit.",
      finalCta: "Plan Your Visit",
    };
  }
  if (type === "plumbing") {
    return {
      businessName,
      tagline: "Licensed and Insured Plumbing Team",
      localPositioning: "Emergency Service Across Hot Springs",
      heroHeadline: "Fast, Reliable Plumbing Service in Hot Springs",
      heroSub: "From emergency repairs to full fixture installs, we show up on time and fix it right the first time.",
      heroPrimaryCta: "Call Now",
      heroSecondaryCta: "Request Service",
      offeringsTitle: "Plumbing Services",
      offerings: [
        { name: "24/7 Emergency Repairs", text: "Burst pipes, leaks, and urgent plumbing issues handled quickly." },
        { name: "Drain + Sewer Service", text: "Drain clearing, camera inspections, and long-term flow solutions." },
        { name: "Water Heater Installs", text: "Repair and replacement for standard and tankless systems." },
      ],
      aboutTitle: "About Us",
      aboutText:
        `${businessName} is a local family-owned plumbing company serving Hot Springs homeowners and businesses. We focus on honest communication, fair pricing, and clean workmanship.`,
      trustTitle: "Customer Feedback",
      trustQuotes: [
        { quote: "They answered at night and had our leak fixed before morning.", by: "Renee D." },
        { quote: "Professional, transparent, and no surprise charges.", by: "Travis H." },
      ],
      locationTitle: "Service Area + Hours",
      locationName: businessName,
      address: "Serving Hot Springs, Fountain Lake, and surrounding areas",
      phone: "(501) 555-0167",
      hours: ["Emergency Service: 24/7", "Mon-Fri: 7:00 AM - 6:00 PM", "Sat: 8:00 AM - 2:00 PM"],
      finalTitle: "Need a Plumber Today?",
      finalSub: "Call now for immediate help or request a same-day service window.",
      finalCta: "Call Now",
    };
  }
  return {
    businessName,
    tagline: "Reliable Local Lawn Professionals",
    localPositioning: "Hot Springs Service Area",
    heroHeadline: "Dependable Lawn Care for Yards That Stand Out",
    heroSub: "Routine mowing, edging, cleanup, and seasonal treatments for homeowners across Hot Springs.",
    heroPrimaryCta: "Request Service",
    heroSecondaryCta: "Get a Quick Quote",
    offeringsTitle: "Lawn Care Services",
    offerings: [
      { name: "Weekly Lawn Maintenance", text: "Consistent mowing, edging, and cleanup scheduled around your needs." },
      { name: "Seasonal Cleanup", text: "Leaf removal, trimming, and property refresh for spring and fall." },
      { name: "Fertilization + Weed Control", text: "Simple treatment plans for healthier, greener growth." },
    ],
    aboutTitle: "About Us",
    aboutText:
      `${businessName} helps Hot Springs homeowners keep their yards clean and healthy without the weekend hassle. Our crews are prompt, respectful, and focused on dependable service.`,
    trustTitle: "Homeowner Reviews",
    trustQuotes: [
      { quote: "Our yard has looked better every week since we started.", by: "Nicole S." },
      { quote: "Fast quote, fair price, and the team always shows up as promised.", by: "Marcus B." },
    ],
    locationTitle: "Service Area + Hours",
    locationName: businessName,
    address: "Serving Hot Springs and nearby neighborhoods",
    phone: "(501) 555-0118",
    hours: ["Mon-Fri: 7:30 AM - 6:00 PM", "Sat: 8:00 AM - 1:00 PM", "Sun: Closed"],
    finalTitle: "Ready for Better Lawn Care?",
    finalSub: "Tell us about your property and get a quick quote today.",
    finalCta: "Request Service",
  };
}

export default async function WebsiteSamplePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { slug } = await params;
  const { mode } = await searchParams;
  const sample = getSampleBySlug(slug);
  if (!sample || sample.externalHref) notFound();
  const type = getShowcaseType(sample.category, sample.slug, sample.name);
  const copy = getShowcaseCopy(type, sample.name);

  return <SampleDraftClient initialDraft={copy} initialMode={mode === "presentation" ? "presentation" : "edit"} />;
}
