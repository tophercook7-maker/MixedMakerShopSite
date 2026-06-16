// 3D Pop-Out Scenes catalog. Each scene is a looping pop-out video that doubles
// as a ready-to-post Facebook/Instagram ad (rendered as a social-post card on
// /3d-scenes). Add new scenes here as they're produced — the gallery scales
// automatically. Target library size: 50.

export interface ThreeDScene {
  id: string;
  /** Gallery heading / internal name. */
  title: string;
  /** Who it's for. */
  niche: string;
  video: string;
  poster: string;
  /** The mock post author shown on the card. */
  author: string;
  handle: string;
  location?: string;
  /** Ready-to-paste Facebook / Instagram caption. */
  caption: string;
  likes: number;
  comments: number;
  shares: number;
}

export const THREE_D_SCENES: ThreeDScene[] = [
  {
    id: "money",
    title: "Money Rain",
    niche: "Small business · financing",
    video: "/videos/scenes/money.mp4",
    poster: "/videos/scenes/money-poster.jpg",
    author: "MixedMakerShop",
    handle: "@mixedmakershop",
    location: "Hot Springs, Arkansas",
    caption:
      "💸 A website that pays for itself? That's the MixedMakerShop way. We build sites that actually bring in customers — and we can even help you Get a Loan to fund the build. One umbrella, every service. 🌂",
    likes: 1243,
    comments: 86,
    shares: 41,
  },
  {
    id: "coffee",
    title: "Coffee Pour",
    niche: "Coffee shops & cafés",
    video: "/videos/scenes/coffee.mp4",
    poster: "/videos/scenes/coffee-poster.jpg",
    author: "MixedMakerShop",
    handle: "@mixedmakershop",
    location: "Hot Springs, Arkansas",
    caption:
      "☕ Pour-over perfection — and a coffee-shop website to match. We design café sites that get found on Google and fill seats. Free coffee-shop mockup, on us. #CoffeeShop #HotSpringsAR",
    likes: 892,
    comments: 54,
    shares: 28,
  },
  {
    id: "fire",
    title: "Fire & Embers",
    niche: "Bold brands · hot deals",
    video: "/videos/scenes/fire.mp4",
    poster: "/videos/scenes/fire-poster.jpg",
    author: "MixedMakerShop",
    handle: "@mixedmakershop",
    location: "Hot Springs, Arkansas",
    caption:
      "🔥 Your competition wishes their website looked this hot. Sites, SEO, and AI tools that bring in real customers. Hot deals all month long. 🌂 #SmallBusiness #HotSpringsAR",
    likes: 1561,
    comments: 103,
    shares: 67,
  },
  {
    id: "wash",
    title: "Pressure-Wash Sweep",
    niche: "Pressure washing & cleaning",
    video: "/videos/scenes/wash.mp4",
    poster: "/videos/scenes/wash-poster.jpg",
    author: "MixedMakerShop",
    handle: "@mixedmakershop",
    location: "Hot Springs, Arkansas",
    caption:
      "💦 Watch the grime disappear. Run a pressure-washing business in Hot Springs? We'll build you a site that books jobs while you work. Free estimate-ready mockup. #PressureWashing",
    likes: 734,
    comments: 39,
    shares: 22,
  },
  {
    id: "confetti",
    title: "Father's Day Confetti",
    niche: "Holidays & promotions",
    video: "/videos/scenes/confetti.mp4",
    poster: "/videos/scenes/confetti-poster.jpg",
    author: "MixedMakerShop",
    handle: "@mixedmakershop",
    location: "Hot Springs, Arkansas",
    caption:
      "🎉 Happy Father's Day from MixedMakerShop! Treat the maker, builder, or business owner in your life — websites, 3D printing, and local tech help, all under one umbrella. 🌂 #FathersDay",
    likes: 2104,
    comments: 147,
    shares: 95,
  },
  {
    id: "grass",
    title: "Fresh-Cut Sweep",
    niche: "Lawn care & property care",
    video: "/videos/scenes/grass.mp4",
    poster: "/videos/scenes/grass-poster.jpg",
    author: "Fresh Cut Property Care",
    handle: "@freshcutpropertycare",
    location: "Hot Springs & Lonsdale, AR",
    caption:
      "🌿 Fresh cut, fresh site. Fresh Cut Property Care keeps Hot Springs yards sharp — and a website that ranks keeps their phone ringing. Lawn care, cleanup & more. Free estimate. #LawnCare",
    likes: 658,
    comments: 31,
    shares: 19,
  },
  {
    id: "snow",
    title: "Snowfall",
    niche: "Any season · stand out",
    video: "/videos/scenes/snow.mp4",
    poster: "/videos/scenes/snow-poster.jpg",
    author: "MixedMakerShop",
    handle: "@mixedmakershop",
    location: "Hot Springs, Arkansas",
    caption:
      "❄️ Make your business impossible to scroll past — any season. We build websites that get found on Google and bring in real customers. One umbrella, every service. 🌂 #HotSpringsAR",
    likes: 1012,
    comments: 58,
    shares: 33,
  },
  {
    id: "storm",
    title: "Lightning Strike",
    niche: "Speed · performance",
    video: "/videos/scenes/storm.mp4",
    poster: "/videos/scenes/storm-poster.jpg",
    author: "MixedMakerShop",
    handle: "@mixedmakershop",
    location: "Hot Springs, Arkansas",
    caption:
      "⚡ Electrify your online presence. Slow, invisible website? We build fast sites that actually rank and convert. Power up your small business. 🌂 #HotSpringsAR #WebDesign",
    likes: 1187,
    comments: 71,
    shares: 44,
  },
  {
    id: "bubbles",
    title: "Soap & Shine",
    niche: "Cleaning & detailing",
    video: "/videos/scenes/bubbles.mp4",
    poster: "/videos/scenes/bubbles-poster.jpg",
    author: "MixedMakerShop",
    handle: "@mixedmakershop",
    location: "Hot Springs, Arkansas",
    caption:
      "🫧 Squeaky clean — site and all. Cleaning or pressure-washing pro? We'll build you a site that books jobs while you scrub. Free mockup. #CleaningBusiness #HotSpringsAR",
    likes: 803,
    comments: 42,
    shares: 25,
  },
  {
    id: "leaves",
    title: "Autumn Leaves",
    niche: "Lawn care & seasonal",
    video: "/videos/scenes/leaves.mp4",
    poster: "/videos/scenes/leaves-poster.jpg",
    author: "Fresh Cut Property Care",
    handle: "@freshcutpropertycare",
    location: "Hot Springs & Lonsdale, AR",
    caption:
      "🍂 Season's changing — is your yard ready? Fresh Cut Property Care handles cleanup, hauling and more, and a site that ranks keeps the calls coming. Free estimate. #PropertyCare #HotSpringsAR",
    likes: 712,
    comments: 36,
    shares: 21,
  },
  {
    id: "sparkle",
    title: "Golden Sparkle",
    niche: "Premium brands · cafés",
    video: "/videos/scenes/sparkle.mp4",
    poster: "/videos/scenes/sparkle-poster.jpg",
    author: "MixedMakerShop",
    handle: "@mixedmakershop",
    location: "Hot Springs, Arkansas",
    caption:
      "✨ Make your café shine online. Premium coffee deserves a premium website — found on Google, built to fill seats. Free coffee-shop mockup. ☕ #CoffeeShop #HotSpringsAR",
    likes: 948,
    comments: 61,
    shares: 37,
  },
  {
    id: "rain",
    title: "Rain on Glass",
    niche: "Small business · lead-gen",
    video: "/videos/scenes/rain.mp4",
    poster: "/videos/scenes/rain-poster.jpg",
    author: "MixedMakerShop",
    handle: "@mixedmakershop",
    location: "Hot Springs, Arkansas",
    caption:
      "🌧️ When it rains, it pours — leads, that is. A website built to bring in customers, rain or shine. Websites, SEO and AI help under one umbrella. 🌂 #HotSpringsAR",
    likes: 1095,
    comments: 64,
    shares: 39,
  },
];
