/** Hardcoded units — future: replace with admin API fetch */
export const UNITS = [
  { code: "OTH", label: "OTHERS" },
  { code: "PCS", label: "PIECES" },
  { code: "NOS", label: "NUMBERS" },
  { code: "KGS", label: "KILOGRAMS" },
  { code: "UNT", label: "UNITS" },
  { code: "BOX", label: "BOX" },
  { code: "PAC", label: "PACKS" },
  { code: "EACH", label: "EACH" },
  { code: "DCMT", label: "DECIMETER" },
  { code: "MTR", label: "METERS" },
  { code: "SET", label: "SETS" },
  { code: "SQF", label: "SQUARE FEET" },
  { code: "POCH", label: "POUCH" },
  { code: "BTL", label: "BOTTLES" },
  { code: "BAG", label: "BAGS" },
  { code: "CASE", label: "CASE" },
  { code: "LAD", label: "LADI" },
  { code: "JARS", label: "JARS" },
  { code: "PETI", label: "PETI" },
  { code: "LTR", label: "LITRES" },
  { code: "KG", label: "KILOGRAM" },
  { code: "CAN", label: "CANS" },
  { code: "DZN", label: "DOZEN" },
];

export function getUnitLabel(code) {
  return UNITS.find((u) => u.code === code)?.label || code;
}
