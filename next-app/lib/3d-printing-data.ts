/**
 * 3D Printing page content and gallery.
 * Add more entries to GALLERY_ITEMS to expand the sample gallery.
 */

export type GalleryItem = {
  src: string;
  alt: string;
  title: string;
  desc: string;
};

/** Sample prints gallery — add more items here as you add photos */
export const GALLERY_ITEMS: GalleryItem[] = [
  { src: "/images/products/blue%20dragon.png", alt: "Blue dragon", title: "Dragon Figurines", desc: "Collectible • Multiple colors" },
  { src: "/images/products/copper-dragon.png", alt: "Copper dragon", title: "Copper Dragon", desc: "Warm tones • Color options" },
  { src: "/images/products/black-knit-cat.png", alt: "Cat with hat", title: "Cat with Hat", desc: "Decorative • Textured" },
  { src: "/images/products/baby-dragon.png", alt: "Baby dragon", title: "Baby Dragon", desc: "Desk decor • Multiple colors" },
  { src: "/images/products/uno-box.png", alt: "UNO box", title: "UNO Card Case", desc: "Functional • Game storage" },
  { src: "/images/products/articulating-monkey.png", alt: "Articulating monkey", title: "Articulating Monkey", desc: "Poseable • Size options" },
];

export const WHAT_I_PRINT = [
  { title: "Custom parts", desc: "Replacement parts, brackets, enclosures — built to spec for your home or workshop." },
  { title: "Prototypes", desc: "Working models and fit tests so you can validate before committing to production." },
  { title: "Gifts & novelty items", desc: "Personalized keychains, figurines, and one-of-a-kind gifts that stand out." },
  { title: "Small business & branded prints", desc: "Promotional pieces and branded items for your business — no bulk required." },
  { title: "Functional household items", desc: "Organizers, stands, and practical fixes designed around how you actually use them." },
  { title: "One-off custom ideas", desc: "Your design, sketch, or rough idea — I help turn it into a real, finished print." },
];

export const HOW_IT_WORKS = [
  { step: "1", title: "Share your idea", desc: "Send a sketch, STL file, or description. The more detail, the better the quote." },
  { step: "2", title: "Get a clear quote", desc: "I’ll send pricing, timeline, and material options — no surprises." },
  { step: "3", title: "Print and finish", desc: "Your item is printed, finished, and checked before it goes out." },
  { step: "4", title: "Pick up or ship", desc: "Local pickup in Hot Springs, or I’ll ship when it’s ready." },
];

export const WHY_MIXEDMAKERSHOP = [
  { title: "Work directly with me", desc: "No middlemen. You get clear answers and one point of contact." },
  { title: "Built for custom work", desc: "One-offs and small batches are the focus — not mass production." },
  { title: "No minimums", desc: "One piece or twenty. Your project size fits." },
  { title: "Practical and creative", desc: "Functional parts or one-of-a-kind gifts — both get the same care." },
];
