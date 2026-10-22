/**
 * SS Mobile shop details.
 * Baad mein WhatsApp, Instagram, location yahi update kar dena.
 */
export const shop = {
  name: "SS Mobile",
  area: "Ashok Nagar",
  contactName: "AVINASH DUGDHE SS MOBILE",
  tagline: "Mobiles · Accessories · Service · Exchange",
  phoneDisplay: "+91 97623 25555",
  phoneTel: "+919762325555",
  whatsapp: "919762325555",
  instagram: "https://www.instagram.com/ss_mobile_ashoknagar?srtk=MWMzdXQ2ZDZ6MGt4dg==",
  facebook: "https://www.facebook.com/share/19cDdhuzyF/",
  address: "SS Mobile, Ashok Nagar",
  city: "",
  pincode: "",
  mapsQuery: "SS Mobile Ashok Nagar",
  placeId: "ChIJQ3gek5Xt3TsRzGvb3ycr6-E",
  mapsEmbed: "",
  offers: [
    "Latest smartphones — all major brands",
    "Genuine accessories, covers & screen guards",
    "Mobile repair, screen & battery service",
    "Exchange / buyback on old phones",
    "EMI options & seasonal offers",
    "Fast billing and friendly staff",
  ],
};

export const categories = [
  { id: "all", label: "All" },
  { id: "mobiles", label: "New Mobiles" },
  { id: "accessories", label: "Accessories" },
  { id: "repair", label: "Repair & Service" },
  { id: "exchange", label: "Exchange" },
  { id: "staff", label: "Staff & Billing" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

export function googleReviewUrl() {
  if (shop.placeId) {
    return `https://search.google.com/local/writereview?placeid=${shop.placeId}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.mapsQuery)}`;
}

export function mapsDirectionsUrl() {
  if (shop.placeId) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.mapsQuery)}&query_place_id=${shop.placeId}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.mapsQuery)}`;
}

export function mapsEmbedUrl() {
  if (shop.mapsEmbed) return shop.mapsEmbed;
  return `https://maps.google.com/maps?q=${encodeURIComponent(shop.mapsQuery)}&output=embed`;
}

export function whatsappUrl() {
  const num = shop.whatsapp.replace(/\D/g, "");
  if (!num || num.includes("X")) return "#";
  return `https://wa.me/${num}`;
}

export function vcard() {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:DUGDHE SS MOBILE;AVINASH;;;`,
    `FN:AVINASH DUGDHE SS MOBILE`,
    `ORG:${shop.name} ${shop.area}`,
    shop.phoneTel.includes("X") ? "" : `TEL;TYPE=CELL,VOICE,PREF:${shop.phoneTel}`,
    `ADR;TYPE=WORK:;;${shop.address};;;;India`,
    shop.instagram.endsWith("instagram.com/") ? "" : `URL:${shop.instagram}`,
    shop.facebook.endsWith("facebook.com/") ? "" : `URL:${shop.facebook}`,
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\n");
}
