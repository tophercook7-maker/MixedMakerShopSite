export type StlSite = {
  name: string;
  url: string;
  tags: string[];
  description: string;
};

export const STL_LIBRARY_SITES: StlSite[] = [
  {
    name: "Thingiverse",
    url: "https://www.thingiverse.com/",
    tags: ["Free Library", "Community"],
    description:
      "A huge library for downloadable 3D printable models, parts, gadgets, and functional designs.",
  },
  {
    name: "Printables",
    url: "https://www.printables.com/",
    tags: ["Free Library", "Community"],
    description:
      "A polished model library with strong community features, practical prints, and creator collections.",
  },
  {
    name: "MakerWorld",
    url: "https://makerworld.com/en",
    tags: ["Free Library", "Community"],
    description:
      "A fast-growing model platform with free files, maker profiles, and lots of modern printable designs.",
  },
  {
    name: "Thangs",
    url: "https://thangs.com/",
    tags: ["Search", "Community"],
    description: "Known for geometric search and model discovery across a broad 3D community.",
  },
  {
    name: "Cults3D",
    url: "https://cults3d.com/",
    tags: ["Marketplace", "Free + Paid"],
    description:
      "A large independent 3D model marketplace with free and paid STL, OBJ, 3MF, and CAD files.",
  },
  {
    name: "MyMiniFactory",
    url: "https://www.myminifactory.com/",
    tags: ["Marketplace", "Free + Paid"],
    description: "A quality-focused platform for printable models with a strong creator ecosystem.",
  },
  {
    name: "Yeggi",
    url: "https://www.yeggi.com/",
    tags: ["Search Engine", "Discovery"],
    description: "A search engine that indexes 3D printable model files from many different websites.",
  },
  {
    name: "Threeding",
    url: "https://www.threeding.com/",
    tags: ["Marketplace", "3D Models"],
    description:
      "A marketplace for downloadable 3D models and printable files across multiple categories.",
  },
];

export function stlSiteInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
