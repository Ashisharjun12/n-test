import numberToWords from "number-to-words";

const { toWords } = numberToWords;

export function amountInWordsINR(amount: number): string {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let words = toWords(rupees);
  words = words.charAt(0).toUpperCase() + words.slice(1);

  let result = `INR ${words} Rupees`;
  if (paise > 0) {
    const paiseWords = toWords(paise);
    result += ` And ${paiseWords.charAt(0).toUpperCase() + paiseWords.slice(1)} Paise`;
  }
  return result + " Only";
}
