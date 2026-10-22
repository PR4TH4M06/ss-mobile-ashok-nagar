/**
 * SS Mobile shop details.
 * Baad mein WhatsApp, Instagram, location yahi update kar dena.
 */
export const shop = {
  name: "SS Mobile",
  area: "Ashok Nagar",
  contactName: "AVINASH DUGDHE SS MOBILE",
  tagline: "Mobiles · Smart TVs · Speakers · Home Theater · Service",
  phoneDisplay: "+91 97623 25555",
  phoneTel: "+919762325555",
  whatsapp: "919762325555",
  instagram: "https://www.instagram.com/ss_mobile_ashoknagar?srtk=MWMzdXQ2ZDZ6MGt4dg==",
  ownerInstagram: "https://www.instagram.com/avinash_dugdhe?xtok=MTVtc2JsMDRmc2R6MQ==",
  facebook: "https://www.facebook.com/share/19cDdhuzyF/",
  address: "SS Mobile, Ashok Nagar, Nashik",
  city: "Nashik",
  pincode: "",
  mapsQuery: "SS Mobile Ashok Nagar Nashik",
  placeId: "ChIJQ3gek5Xt3TsRzGvb3ycr6-E",
  mapsEmbed: "",
  hours: "Open Daily · 9:30 AM – 10:00 PM",
  brands: ["Samsung", "Apple iPhone", "Vivo", "Oppo", "Xiaomi / Redmi", "Realme", "OnePlus", "Smart TVs", "Home Theater", "JBL / boAt"],
  offers: [
    "Latest 5G smartphones — all major brands (Samsung, Vivo, Oppo, Xiaomi, Realme, iPhone, OnePlus)",
    "All-brand Smart LED TVs, 4K Android TVs & Google TVs",
    "Bluetooth speakers, soundbars, party speakers & Home Theater systems",
    "Genuine accessories, covers, tempered glass, neckbands, earbuds & fast chargers",
    "Expert mobile repair, display replacement & battery service",
    "Best exchange / buyback value on old phones + Easy 0% EMI options",
  ],
};

export const categories = [
  { id: "all", label: "All" },
  { id: "mobiles", label: "New Mobiles" },
  { id: "tv_audio", label: "Smart TV & Speakers" },
  { id: "accessories", label: "Accessories" },
  { id: "repair", label: "Repair & Service" },
  { id: "exchange", label: "Exchange & EMI" },
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
  return `https://maps.google.com/maps?q=${encodeURIComponent(shop.mapsQuery)}&t=h&z=18&ie=UTF8&iwloc=&output=embed`;
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
    shop.ownerInstagram ? `URL:${shop.ownerInstagram}` : "",
    shop.facebook.endsWith("facebook.com/") ? "" : `URL:${shop.facebook}`,
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\n");
}
