/** GST state codes (first 2 digits of GSTIN) */
export const STATE_CODES: Record<string, string> = {
  "01": "JAMMU AND KASHMIR",
  "02": "HIMACHAL PRADESH",
  "03": "PUNJAB",
  "04": "CHANDIGARH",
  "05": "UTTARAKHAND",
  "06": "HARYANA",
  "07": "DELHI",
  "08": "RAJASTHAN",
  "09": "UTTAR PRADESH",
  "10": "BIHAR",
  "11": "SIKKIM",
  "12": "ARUNACHAL PRADESH",
  "13": "NAGALAND",
  "14": "MANIPUR",
  "15": "MIZORAM",
  "16": "TRIPURA",
  "17": "MEGHALAYA",
  "18": "ASSAM",
  "19": "WEST BENGAL",
  "20": "JHARKHAND",
  "21": "ODISHA",
  "22": "CHHATTISGARH",
  "23": "MADHYA PRADESH",
  "24": "GUJARAT",
  "26": "DADRA AND NAGAR HAVELI AND DAMAN AND DIU",
  "27": "MAHARASHTRA",
  "29": "KARNATAKA",
  "30": "GOA",
  "31": "LAKSHADWEEP",
  "32": "KERALA",
  "33": "TAMIL NADU",
  "34": "PUDUCHERRY",
  "35": "ANDAMAN AND NICOBAR ISLANDS",
  "36": "TELANGANA",
  "37": "ANDHRA PRADESH",
  "38": "LADAKH",
};

export function formatPlaceOfSupply(state?: string, gstin?: string): string {
  if (state) {
    const normalized = state.toUpperCase().trim();
    const entry = Object.entries(STATE_CODES).find(([, name]) =>
      name.includes(normalized) || normalized.includes(name)
    );
    if (entry) return `${entry[0]}-${entry[1]}`;
    return normalized;
  }
  if (gstin && gstin.length >= 2) {
    const code = gstin.slice(0, 2);
    const name = STATE_CODES[code];
    if (name) return `${code}-${name}`;
  }
  return "";
}

export function getStateFromGstin(gstin?: string): string {
  if (!gstin || gstin.length < 2) return "";
  return STATE_CODES[gstin.slice(0, 2)] || "";
}
