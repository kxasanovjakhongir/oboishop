// Formats digits as a live Uzbek phone mask while typing: "+998 90 123 45 67".
// Strips a redundant leading "998" so pasting either "998901234567" or
// "901234567" produces the same result.
export function formatUzPhone(raw) {
  const digits = raw.replace(/\D/g, '').replace(/^998/, '').slice(0, 9);
  if (!digits) return '';
  let out = `+998 ${digits.slice(0, 2)}`;
  if (digits.length > 2) out += ` ${digits.slice(2, 5)}`;
  if (digits.length > 5) out += ` ${digits.slice(5, 7)}`;
  if (digits.length > 7) out += ` ${digits.slice(7, 9)}`;
  return out;
}
