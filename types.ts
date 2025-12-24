
export interface SelectionItem {
  id: string;
  name: string;
  description: string;
  image: string;
  priceRange: string;
  location?: string;
  tagline?: string;
  venue?: string;
  dates?: string;
  criticRating?: string;
  signatureDish?: string;
  topFeatures?: string[];
  cuisine?: string;
}

export interface MegaShow extends SelectionItem {
  hotels: MegaHotel[];
}

export interface MegaHotel extends SelectionItem {
  restaurants: SelectionItem[];
}

export type Step = 'landing' | 'show' | 'hotel' | 'cuisine' | 'restaurant' | 'summary';

export interface ItineraryState {
  show: MegaShow | null;
  hotel: MegaHotel | null;
  restaurant: SelectionItem | null;
}
