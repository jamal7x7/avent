import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateTeamAbbreviation = (name: string): string => {
  if (!name) return "";

  // Handle specific cases for French names like "Première Année" or "Deuxième Année"
  // These specific replacements can be expanded or made more generic if needed.
  const processedName = name
    .replace(/Première Année/gi, "1A")
    .replace(/Deuxième Année/gi, "2A")
    .replace(/Tronc Commun/gi, "TC");

  const initials = processedName
    .split(/[\s\-ÉÈÊÀÂÔÛÎÇŒÆéèêàâôûîçœæ]+/)
    .map((word) => {
      if (!word) return "";
      // Remove accents and take the first letter
      const firstLetter = word
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .charAt(0)
        .toUpperCase();
      return firstLetter;
    })
    .filter(Boolean) // Remove any empty strings that might result from multiple separators
    .join("");

  // Fallback to the first letter of the original name if initials are empty but name is not
  if (initials) {
    return initials;
  } if (name.length > 0) {
    return name.charAt(0).toUpperCase();
  }
  return ""; // Should not be reached if name is not empty initially
};
