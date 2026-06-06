/**
 * Generate a consistent background color based on company name
 * Uses a hash of the name to pick from a predefined palette
 */
const COLORS = [
  "bg-blue-500",
  "bg-blue-600",
  "bg-indigo-500",
  "bg-indigo-600",
  "bg-purple-500",
  "bg-purple-600",
  "bg-pink-500",
  "bg-pink-600",
  "bg-red-500",
  "bg-red-600",
  "bg-orange-500",
  "bg-orange-600",
  "bg-amber-500",
  "bg-amber-600",
  "bg-yellow-500",
  "bg-yellow-600",
  "bg-lime-500",
  "bg-lime-600",
  "bg-green-500",
  "bg-green-600",
  "bg-emerald-500",
  "bg-emerald-600",
  "bg-teal-500",
  "bg-teal-600",
  "bg-cyan-500",
  "bg-cyan-600",
  "bg-sky-500",
  "bg-sky-600",
];

export function getCompanyAvatarColor(companyName: string): string {
  let hash = 0;
  for (let i = 0; i < companyName.length; i++) {
    hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}

export function getCompanyAvatarInitial(companyName: string): string {
  return companyName.charAt(0).toUpperCase();
}
