/** Normalize PDF copy to the public site brand spelling. */
export function normalizeLegalBrand(text: string): string {
  return text
    .replace(/Mixed Maker Shop/g, "MixedMakerShop")
    .replace(/Mixed Maker Labs/g, "MixedMakerShop Labs")
    .replace(/safetycritical/g, "safety-critical");
}
