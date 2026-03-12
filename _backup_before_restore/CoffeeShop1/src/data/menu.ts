export type MenuCategory = {
  title: string;
  description: string;
  items: Array<{ name: string; price: string }>;
};

export const menuCategories: MenuCategory[] = [
  {
    title: "Espresso Classics",
    description: "Simple. Strong. Perfect.",
    items: [
      { name: "Latte", price: "$5.25" },
      { name: "Cappuccino", price: "$4.95" },
      { name: "Americano", price: "$3.75" },
      { name: "Mocha", price: "$5.75" }
    ]
  },
  {
    title: "Cold & Smooth",
    description: "Chilled stuff that still hits.",
    items: [
      { name: "Cold Brew", price: "$4.50" },
      { name: "Iced Latte", price: "$5.25" },
      { name: "Nitro (when available)", price: "$5.95" },
      { name: "Iced Mocha", price: "$5.95" }
    ]
  },
  {
    title: "Seasonal Flavors",
    description: "A few rotating picks.",
    items: [
      { name: "Vanilla Bean", price: "+$0.75" },
      { name: "Caramel", price: "+$0.75" },
      { name: "Hazelnut", price: "+$0.75" },
      { name: "Brown Sugar Cinnamon", price: "+$0.75" }
    ]
  }
];
