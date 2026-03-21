import { notFound } from "next/navigation";
import { getSampleBySlug } from "@/lib/website-samples";
import type { SampleImageCategory } from "@/lib/sample-fallback-images";
import { SampleDraftClient, type SampleDraft, type SampleDraftEmbedOptions } from "./sample-draft-client";

type ShowcaseType = "coffee" | "restaurant" | "church" | "plumbing" | "lawn";

function embedOptionsForShowcaseType(type: ShowcaseType): SampleDraftEmbedOptions {
  const imageCategoryKey: SampleImageCategory | undefined =
    type === "plumbing"
      ? "plumbing"
      : type === "church"
        ? "church"
        : type === "coffee"
          ? "coffee"
          : type === "restaurant"
            ? "restaurant"
            : type === "lawn"
              ? "landscaping"
              : undefined;
  const secondaryHref =
    type === "church" ? "#hours" : type === "coffee" || type === "restaurant" ? "#services" : "#contact";
  return { lockPresentation: true, imageCategoryKey, secondaryHref };
}

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
      heroImageUrl:
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1400&q=80",
      heroImageAlt: "Barista-poured latte with art on a wooden cafe counter",
      heroHeadline: "Craft Coffee, Fresh Pastries, and a Spot You Will Want to Return To",
      heroSub:
        "Hand-pulled espresso, warm pastries, and a calm place to meet friends or grab a drink before work — right here in Hot Springs.",
      heroPrimaryCta: "Order Ahead",
      heroSecondaryCta: "See the Menu",
      offeringsTitle: "Menu Favorites",
      offerings: [
        {
          name: "Signature Lattes",
          text: "House-made syrups, seasonal specials, and espresso drinks crafted to order — never rushed.",
          image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
          imageAlt: "Close-up of latte art in a ceramic cup on a cafe counter",
        },
        {
          name: "Breakfast + Bakery",
          text: "Fresh muffins, croissants, and morning bites baked and delivered locally — perfect with a hot drink.",
          image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=900&q=80",
          imageAlt: "Fresh croissants and pastries displayed at a coffee shop bakery case",
        },
        {
          name: "Quick Pickup",
          text: "Order from your phone and skip the line — we will have your name on the cup when you walk in.",
          image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
          imageAlt: "Coffee cups and brewing equipment at a neighborhood espresso bar",
        },
      ],
      gallerySectionTitle: "Inside the cafe",
      galleryImages: [
        "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
      ],
      galleryImageAlts: [
        "Coffee beans and brewing setup on a warm wooden counter",
        "Espresso machine and bar area ready for the morning rush",
        "Finished drinks lined up for pickup at the counter",
      ],
      whyChooseTitle: "Why locals make this their regular spot",
      whyChooseBullets: [
        "Beans dialed in daily — drinks taste the same every visit",
        "Friendly baristas who remember your order",
        "Plenty of seating for meetings, study, or a quiet cup",
        "Fast pickup when you are on a tight schedule",
      ],
      contactBandTitle: "Visit or order ahead",
      contactBandSub:
        "Call for large office orders or holiday trays — we will confirm timing and have everything ready when you arrive.",
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
      finalCta: "Call to Order",
    };
  }
  if (type === "restaurant") {
    return {
      businessName,
      tagline: "Local Southern Kitchen",
      localPositioning: "Downtown Hot Springs",
      heroImageUrl:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80",
      heroImageAlt: "Southern-style plated dinner on a candlelit restaurant table",
      heroHeadline: "Southern Comfort Food Worth Coming Back For",
      heroSub:
        "Scratch cooking, generous plates, and a dining room that works for date night, families, and Sunday lunch after church.",
      heroPrimaryCta: "Reserve a Table",
      heroSecondaryCta: "View Menu",
      offeringsTitle: "Popular Menu Sections",
      offerings: [
        {
          name: "Breakfast Favorites",
          text: "Buttermilk biscuits, country gravy, omelets, and hot coffee from open until 11 AM.",
          image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80",
          imageAlt: "Breakfast spread with eggs, toast, and morning sides on a restaurant table",
        },
        {
          name: "Lunch + Dinner Plates",
          text: "Fried chicken, meatloaf, fresh vegetables, and rotating chef specials every week.",
          image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
          imageAlt: "Grilled meat and sides plated for dinner service",
        },
        {
          name: "Family Packs To-Go",
          text: "Feed the crew without the hassle — bundled meals with sides, bread, and reheating instructions.",
          image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80",
          imageAlt: "Restaurant interior with booths and warm lighting for family dining",
        },
      ],
      gallerySectionTitle: "The dining room",
      galleryImages: [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
      ],
      galleryImageAlts: [
        "Guests dining in a lively restaurant atmosphere",
        "Chef-prepared plates ready for the dining room",
        "Warm table setting with Southern comfort entrees",
      ],
      whyChooseTitle: "Why Hot Springs keeps coming back",
      whyChooseBullets: [
        "Recipes you would expect from Sunday dinner at grandma's",
        "Kids menu and high chairs without the side-eye",
        "Same-day reservations when we have room",
        "Takeout packed so it travels home hot",
      ],
      contactBandTitle: "Reserve or order takeout",
      contactBandSub:
        "Call for tonight's wait time, large-party seating, or a family pack on the way home — we will confirm before you head over.",
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
      heroImageUrl:
        "https://images.unsplash.com/photo-1465848059293-208e11dfea17?auto=format&fit=crop&w=1400&q=80",
      heroImageAlt: "Historic church sanctuary with wooden pews, cross, and soft natural light",
      heroHeadline: "A Place to Belong, Grow, and Serve Together",
      heroSub:
        "Come as you are this Sunday — heartfelt worship, clear Bible teaching, and a community that will help you take your next step in faith.",
      heroPrimaryCta: "Plan Your Visit",
      heroSecondaryCta: "Service Times",
      offeringsTitle: "Ministries + Weekly Life",
      servicesNavLabel: "Ministries",
      offerings: [
        {
          name: "Sunday Worship",
          text: "Expository preaching, congregational singing, and a rhythm of worship that points us to Jesus every week.",
          image: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&w=900&q=80",
          imageAlt: "Open Bibles and hymnals on sanctuary seating as sunlight fills the worship space",
        },
        {
          name: "Kids + Student Ministry",
          text: "Age-appropriate lessons, trusted volunteers, and safe check-in so families can worship with peace of mind.",
          image: "https://images.unsplash.com/photo-1663162550938-4584b8e0016d?auto=format&fit=crop&w=900&q=80",
          imageAlt: "Youth and adults gathered outdoors in discussion during a church group activity",
        },
        {
          name: "Midweek Groups",
          text: "Smaller gatherings for prayer, Scripture, and friendship — the place many people say they feel most known.",
          image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
          imageAlt: "Small group seated around a table with open Bibles and coffee cups",
        },
      ],
      gallerySectionTitle: "Life together",
      galleryImages: [
        "https://images.unsplash.com/photo-1531808012724-688c1de500b4?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
      ],
      galleryImageAlts: [
        "Wooden pews and light beams across a quiet church interior before worship",
        "Congregation-facing platform and cross at the front of the sanctuary",
        "Midweek small group meeting around a table for Bible discussion",
      ],
      whyChooseTitle: "What to expect on a first visit",
      whyChooseBullets: [
        "Welcoming first-time guests — greeters at the door and clear signage to kids areas",
        "Biblical teaching that connects Sunday to everyday life",
        "Ministries for kids, students, and adults so every generation can grow",
        "A friendly first visit — we will help you find a seat, nursery, and your next step",
      ],
      contactBandTitle: "We are glad you are here",
      contactBandSub:
        "Call the office for directions, accessibility needs, or kids check-in questions — we would love to help you feel at home before Sunday.",
      serviceCardsLinkToContact: true,
      serviceCardContactCtaLabel: "Ask a question",
      aboutTitle: "Our Story",
      aboutText:
        `${businessName} is a gospel-centered church in Hot Springs. We love Jesus, love people, and want our neighbors to know they have a place here — whether you have been in church your whole life or are walking through the doors for the first time.`,
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
      finalSub: "Join us this Sunday — save a seat, meet a pastor, and see if Grace is home for your family.",
      finalCta: "Plan Your Visit",
    };
  }
  if (type === "plumbing") {
    return {
      businessName,
      tagline: "Licensed and Insured Plumbing Team",
      localPositioning: "Fast, Reliable Plumbing Service in Hot Springs",
      heroImageUrl:
        "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1400&q=80",
      heroImageAlt: "Licensed plumber repairing pipes and fixtures under a residential kitchen sink",
      heroHeadline: "Fast, Reliable Plumbing Service in Hot Springs",
      heroSub:
        "Emergency leaks, clogged drains, and water heater problems — we answer the phone, show up prepared, and leave your home clean when we are done.",
      heroPrimaryCta: "Call Now",
      heroSecondaryCta: "Request Service",
      offeringsTitle: "Plumbing Services",
      offerings: [
        {
          name: "24/7 Emergency Repairs",
          text: "Burst pipes, slab leaks, and no-water situations — rapid response when you cannot wait until Monday.",
          image:
            "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80",
          imageAlt: "Plumbing tools and pipe fittings ready for an emergency repair call",
        },
        {
          name: "Drain + Sewer Service",
          text: "Slow sinks, backed-up tubs, and main-line issues cleared with the right tools — plus honest advice if a camera line check makes sense.",
          image:
            "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80",
          imageAlt: "Plumber working on bathroom drain and supply plumbing under a sink",
        },
        {
          name: "Water Heater Installs",
          text: "Repairs, replacements, and upgrades for tank and tankless units — sized right for your household and installed to code.",
          image:
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80",
          imageAlt: "Tankless water heater mounted on a wall for residential hot water",
        },
      ],
      gallerySectionTitle: "Recent work",
      galleryImages: [
        "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=900&q=80",
      ],
      galleryImageAlts: [
        "Copper and PVC supply lines in a residential plumbing installation",
        "Plumber installing pipe and fittings on a job site",
        "Technician checking plumbing connections during a service visit",
      ],
      whyChooseTitle: "Why homeowners call us first",
      whyChooseBullets: [
        "Fast response times — especially after hours when leaks do not wait",
        "Licensed and insured — your home is protected while we work",
        "Honest communication — you will know what we found and what it costs before we start",
        "Clean, respectful technicians — shoe covers, tidy workspaces, and respect for your home",
      ],
      aboutTitle: "About Us",
      aboutText:
        `${businessName} is a local family-owned plumbing company serving Hot Springs homeowners and small businesses. We focus on honest recommendations, upfront communication, and workmanship you can trust — not upsells you do not need.`,
      trustTitle: "What neighbors say",
      trustQuotes: [
        { quote: "They answered at night and had our leak stopped before it ruined the floors.", by: "Renee D., Hot Springs" },
        { quote: "Clear pricing, showed up on time, and explained the repair in plain English.", by: "Travis H., Garland County" },
      ],
      contactBandTitle: "Book a plumber",
      contactBandSub:
        "Emergency line or office — tell us what is going on and we will give you a straight answer and a realistic arrival window.",
      locationTitle: "Service area + hours",
      locationName: businessName,
      address: "Serving Hot Springs, Fountain Lake, Lake Hamilton, and nearby neighborhoods",
      phone: "(501) 555-0167",
      hours: ["Emergency line: 24/7", "Office hours: Mon–Fri 7:00 AM – 6:00 PM", "Saturday: 8:00 AM – 2:00 PM (by appointment)"],
      finalTitle: "Need a plumber today?",
      finalSub: "Save our number — one call for emergencies, drains, and water heater help.",
      finalCta: "Call Now",
    };
  }
  return {
    businessName,
    tagline: "Reliable Local Lawn Professionals",
    localPositioning: "Hot Springs Service Area",
    heroImageUrl:
      "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=1400&q=80",
    heroImageAlt: "Healthy green lawn with clean mowing stripes in a residential yard",
    heroHeadline: "Dependable Lawn Care for Yards That Stand Out",
    heroSub:
      "Weekly mowing, crisp edging, seasonal cleanups, and simple treatment plans — so your curb appeal stays sharp without eating your weekends.",
    heroPrimaryCta: "Request Service",
    heroSecondaryCta: "Get a Quote",
    offeringsTitle: "Lawn Care Services",
    offerings: [
      {
        name: "Weekly Lawn Maintenance",
        text: "Scheduled mowing, edging, and line-trimming on a route that fits your neighborhood.",
        image: "https://images.unsplash.com/photo-1458245201577-fc8a130b8829?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Lawn mower cutting fresh green grass on a residential property",
      },
      {
        name: "Seasonal Cleanup",
        text: "Leaf removal, bed reshaping, and debris haul-off when seasons change in Hot Springs.",
        image: "https://images.unsplash.com/photo-1605117882932-f9e32b03fea9?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Landscaping professional with tools preparing beds for seasonal maintenance",
      },
      {
        name: "Fertilization + Weed Control",
        text: "Targeted applications to thicken turf and knock back weeds — explained in plain language.",
        image: "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Lush green lawn after fertilization and regular care",
      },
    ],
    gallerySectionTitle: "Yards we maintain",
    galleryImages: [
      "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1458245201577-fc8a130b8829?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1605117882932-f9e32b03fea9?auto=format&fit=crop&w=900&q=80",
    ],
    galleryImageAlts: [
      "Well-kept front lawn with defined edges along the driveway",
      "Professional mowing in progress on a midsize yard",
      "Crew member finishing seasonal bed cleanup at a home",
    ],
    whyChooseTitle: "Why neighbors hire us",
    whyChooseBullets: [
      "Routes built for punctuality — we show up when we say we will",
      "Equipment maintained so cuts look clean, not chewed up",
      "Clear quotes — no mystery fees after the first visit",
      "Local owner-operator who answers the phone",
    ],
    contactBandTitle: "Get on the schedule",
    contactBandSub:
      "Text your address and lawn size — we will reply with availability and a straightforward price for weekly or seasonal work.",
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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sample = getSampleBySlug(slug);
  if (!sample || sample.externalHref) notFound();
  const type = getShowcaseType(sample.category, sample.slug, sample.name);
  const copy = getShowcaseCopy(type, sample.name);

  return <SampleDraftClient initialDraft={copy} initialMode="presentation" embedOptions={embedOptionsForShowcaseType(type)} />;
}
