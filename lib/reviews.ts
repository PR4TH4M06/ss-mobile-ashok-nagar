import type { CategoryId } from "./shop";
import { hashText, tooSimilar } from "./dedupe";

export type Lang = "en" | "hinglish";

export type Review = {
  id: string;
  cat: CategoryId | "all";
  lang: Lang;
  text: string;
};

type CategoryCore = Exclude<CategoryId, "all">;

function pick<T>(arr: readonly T[], rng = Math.random): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickTwo<T>(arr: readonly T[], rng = Math.random): [T, T] {
  const i = Math.floor(rng() * arr.length);
  let j = Math.floor(rng() * (arr.length - 1));
  if (j >= i) j++;
  return [arr[i], arr[j]];
}

// ============================================================================
// Rich semantic knowledge base for SS Mobile (Ashok Nagar)
// Designed so every generated review reads like a genuine Google Local Guide
// or real walk-in customer, with natural variation in structure and length.
// ============================================================================

const EN_OPENERS: Record<CategoryCore | "general", readonly string[]> = {
  general: [
    "Visited SS Mobile in Ashok Nagar today",
    "Stopped by SS Mobile this evening",
    "Best mobile shop experience I have had in Ashok Nagar",
    "Walked into SS Mobile after a friend suggested it",
    "Very reliable mobile store in Ashok Nagar",
    "Had a really smooth experience at SS Mobile",
    "Came to SS Mobile for a quick purchase and was impressed",
    "If you want genuine mobile products in Ashok Nagar, this is the place",
    "Great local mobile showroom with honest pricing",
    "Been visiting SS Mobile for my family's phones and they never disappoint",
    "Drop by SS Mobile if you want straightforward advice without sales pressure",
    "Superb experience at SS Mobile Ashok Nagar",
  ],
  mobiles: [
    "Bought my new smartphone from SS Mobile in Ashok Nagar",
    "Just picked up a new handset from SS Mobile today",
    "Upgraded my phone at SS Mobile Ashok Nagar",
    "Purchased a new 5G phone here for my parents",
    "Came in looking for a mid-range smartphone at SS Mobile",
    "Bought a brand new phone from SS Mobile and loved the service",
    "Finally got the exact phone model and colour I wanted at SS Mobile",
    "Visited SS Mobile to compare a few latest smartphones before buying",
    "Got a new Android phone from SS Mobile Ashok Nagar this week",
    "Bought a phone for my sister from SS Mobile",
  ],
  accessories: [
    "Visited SS Mobile in Ashok Nagar for phone accessories",
    "Picked up a back cover and tempered glass from SS Mobile",
    "Came to SS Mobile looking for an original fast charger",
    "Great collection of mobile accessories at SS Mobile Ashok Nagar",
    "Stopped by SS Mobile for earphones and a screen protector",
    "Got my new phone's cover, lens guard and adapter from SS Mobile",
    "Needed a durable charging cable and neckband, found both at SS Mobile",
    "Best place in Ashok Nagar for quality mobile covers and glass",
  ],
  repair: [
    "Gave my phone for repair at SS Mobile Ashok Nagar",
    "Got my cracked mobile screen replaced at SS Mobile today",
    "Visited SS Mobile because my phone had a charging issue",
    "Had my phone's battery replaced at SS Mobile in Ashok Nagar",
    "Took my handset to SS Mobile for urgent servicing",
    "Very trustworthy mobile repair service at SS Mobile Ashok Nagar",
    "My phone speaker and mic were acting up, got it fixed at SS Mobile",
    "Saved my phone from a major repair bill thanks to SS Mobile",
  ],
  exchange: [
    "Exchanged my old smartphone for a new one at SS Mobile Ashok Nagar",
    "Traded in my used phone at SS Mobile today",
    "Got a very fair buyback value on my old handset at SS Mobile",
    "Upgraded my old phone through exchange at SS Mobile Ashok Nagar",
    "Came to SS Mobile to check the exchange rate for my 2-year-old phone",
    "Smooth phone exchange experience at SS Mobile",
    "Swapped my old Android for a latest model at SS Mobile Ashok Nagar",
  ],
  staff: [
    "Really impressed by the staff behaviour at SS Mobile Ashok Nagar",
    "The team at SS Mobile knows how to treat customers with respect",
    "Polite staff and super quick billing at SS Mobile",
    "Even during evening rush, the staff at SS Mobile attended us properly",
    "Customer service at SS Mobile Ashok Nagar is top notch",
    "The counter staff at SS Mobile are patient and genuinely helpful",
    "Clean store, organised counter, and very friendly team at SS Mobile",
  ],
};

const EN_EXPERIENCES: Record<CategoryCore, readonly string[]> = {
  mobiles: [
    "they had all major brands in stock and let me check the live demo peacefully",
    "the staff compared two models side by side and explained the camera and battery clearly",
    "the box was sealed, IMEI was verified in front of me, and I got a proper GST bill",
    "they did not push the most expensive phone and suggested what actually suited my budget",
    "they helped transfer all my WhatsApp chats, contacts and photos to the new handset",
    "pricing matched online offers and I got the phone in hand immediately with full warranty",
    "they explained the EMI and brand warranty options in very simple words",
    "they unboxed the handset on the counter and applied a complimentary screen guard neatly",
    "the salesperson knew the exact processor and camera details instead of reading the box",
    "I got a better deal here than what I was seeing online, plus local store support",
  ],
  accessories: [
    "they applied the edge-to-edge tempered glass without a single bubble or dust speck",
    "the back covers are sturdy and fresh in design, not old yellowed stock",
    "they checked my handset model and gave the exact wattage fast charger it supports",
    "found original cables, power banks and neckbands neatly arranged by brand",
    "they let me test the Bluetooth earphones for sound and mic quality before billing",
    "the camera lens protector and matte glass were fitted in less than five minutes",
    "prices for covers and chargers are very reasonable compared to other shops nearby",
    "they gave a proper warranty card with the neckband and charger",
  ],
  repair: [
    "they checked the fault in front of me and gave an honest estimate before touching the phone",
    "screen fitting was so clean that the phone looks and responds just like original",
    "they fixed the charging port in under an hour instead of keeping the phone overnight",
    "no unnecessary motherboard scare tactics - they repaired only the part that was faulty",
    "after replacing the battery, they tested charging speed, call audio and cameras with me",
    "all my personal data and photos stayed completely safe during the repair",
    "they delivered the phone right on the time they promised at a fair service charge",
    "the technician explained what went wrong and how to avoid the issue in future",
  ],
  exchange: [
    "they inspected my old phone on the counter and gave a transparent valuation",
    "the exchange bonus was deducted straight from the new phone bill with zero confusion",
    "they waited patiently while I backed up my data and logged out of my accounts",
    "got a much better exchange price here than what online apps were quoting",
    "there were no sudden hidden deductions after agreeing on the buyback price",
    "the whole upgrade from old phone to new phone took barely twenty minutes",
    "they helped factory-reset my old handset properly in front of me for privacy",
  ],
  staff: [
    "the staff answered all my questions patiently without rushing me to decide",
    "billing was transparent with every item clearly mentioned on the invoice",
    "they speak politely and treat every customer the same whether buying a cover or a flagship phone",
    "the store is clean, well-lit and everything is displayed neatly",
    "they offered a chair and water while my new phone setup was completing",
    "no pushy cross-selling at the billing counter, which made the visit very comfortable",
    "they remembered my previous visit and helped me pick up right where we left off",
    "even small queries about phone settings were handled with a smile",
  ],
};

const EN_CLOSERS: readonly string[] = [
  "Definitely my go-to mobile shop in Ashok Nagar.",
  "Highly recommended for anyone looking for genuine phones and honest service.",
  "Will surely come back here for our next family phone upgrade.",
  "Great to have such a trustworthy mobile store in the neighbourhood.",
  "Five stars for their transparency, fair pricing and polite behaviour.",
  "Much better peace of mind buying from SS Mobile than ordering blindly online.",
  "Overall a smooth, hassle-free experience from start to finish.",
  "Happy with the purchase and the after-sales assurance they provide.",
  "Easily one of the best mobile stores in Ashok Nagar.",
  "Walked out completely satisfied with both the product and the billing.",
];

// ============================================================================
// Hinglish knowledge base (Natural Indian Hinglish as written on Google Maps)
// ============================================================================

const HI_OPENERS: Record<CategoryCore | "general", readonly string[]> = {
  general: [
    "SS Mobile Ashok Nagar par aaj visit kiya, bahut badhiya experience raha",
    "Ashok Nagar mein mobile aur accessories ke liye SS Mobile sabse bharosemand dukaan hai",
    "Dost ke kehne par SS Mobile aaya tha aur sach mein kaam ekdum first class hua",
    "SS Mobile par shopping ka experience hamesha smooth aur tension-free rehta hai",
    "Agar Ashok Nagar mein genuine mobile shop dhoondh rahe ho toh SS Mobile best hai",
    "Aaj SS Mobile se kuch saman liya, staff aur pricing dono dil khush karne wale hain",
    "Badiya mobile showroom hai Ashok Nagar mein, har cheez sahi rate par milti hai",
    "Family ke saare phones hum SS Mobile se hi lete hain, bharosa poora hai",
    "Online order karne se achha SS Mobile Ashok Nagar jaakar haath mein check karke lo",
    "Shaam ko SS Mobile gaya tha, bheed hone ke baad bhi poora dhyan diya",
  ],
  mobiles: [
    "SS Mobile Ashok Nagar se aaj naya smartphone liya",
    "Apna naya 5G phone SS Mobile se purchase kiya, dil khush ho gaya",
    "Ghar walon ke liye SS Mobile se naya phone liya",
    "SS Mobile Ashok Nagar se budget mein ekdum sahi phone mil gaya",
    "Jo model aur colour chahiye tha woh SS Mobile par ready stock mein mil gaya",
    "Naya handset lene SS Mobile gaya tha, bahut achha deal mila",
    "Pehli baar SS Mobile se phone kharida aur experience 5-star raha",
    "Brother ke liye naya mobile SS Mobile Ashok Nagar se liya",
  ],
  accessories: [
    "SS Mobile Ashok Nagar se phone ka back cover aur tempered glass lagwaya",
    "Original fast charger aur cable lene SS Mobile aaya tha",
    "Mobile accessories ke maamle mein SS Mobile ka collection lajawab hai",
    "SS Mobile se neckband aur screen guard liya, quality ekdum solid hai",
    "Naye phone ke liye stylish cover aur camera lens protector SS Mobile se liya",
    "Sahi rate mein achhi quality ke covers aur earphones SS Mobile par mil gaye",
    "Tempered glass aur adapter lene SS Mobile Ashok Nagar gaya tha",
  ],
  repair: [
    "Apna phone repair karwane SS Mobile Ashok Nagar diya tha",
    "SS Mobile par tooti hui screen change karwayi, kaam ekdum original jaisa hua",
    "Phone mein charging problem thi, SS Mobile walon ne turant theek kar diya",
    "Mobile ki battery SS Mobile Ashok Nagar se replace karwayi",
    "Phone hang aur speaker issue ke liye SS Mobile aaya tha, badhiya service mili",
    "Ashok Nagar mein imandari se mobile repair karne wali shop hai SS Mobile",
    "Urgent mein phone theek karwana tha aur SS Mobile ne same day karke de diya",
  ],
  exchange: [
    "Apna purana phone SS Mobile Ashok Nagar par exchange karke naya liya",
    "Old mobile dekar naya upgrade karne ke liye SS Mobile best jagah hai",
    "Purane handset ki bahut sahi exchange value mili SS Mobile par",
    "SS Mobile Ashok Nagar mein phone exchange ka process ekdum simple aur clear tha",
    "2 saal purana phone exchange kiya SS Mobile par, online se achha rate mila",
    "Used phone exchange karke naya Android liya SS Mobile se",
  ],
  staff: [
    "SS Mobile Ashok Nagar ke staff ka behaviour bahut hi polite aur helpful hai",
    "Yahan ke staff customer ki baat dhyan se sunte hain aur sahi salah dete hain",
    "SS Mobile par billing fast hai aur staff bilkul jaldbazi nahi karta",
    "Dukaan saaf-suthri hai aur SS Mobile ki team bahut tameez se pesh aati hai",
    "Customer handling ke maamle mein SS Mobile Ashok Nagar 10 on 10 hai",
    "Counter par baithe bhaiya ne bahut aaram se saare doubts clear kiye",
  ],
};

const HI_EXPERIENCES: Record<CategoryCore, readonly string[]> = {
  mobiles: [
    "staff ne do-teen models side by side dikha kar camera aur battery ka farq aaram se samjhaya",
    "seal pack box mere saamne open kiya, IMEI check karwaya aur pakka GST bill diya",
    "zabardasti mehnga phone chipkane ki koshish nahi ki, jo mere kaam ka tha wahi suggest kiya",
    "purane phone se saara data, contacts aur WhatsApp naye phone mein transfer bhi kar diya",
    "online jaisa hi rate mila aur saath mein local dukaan ki wajah se warranty ki tension bhi nahi",
    "EMI aur offer ke baare mein bina kisi chhupi shart ke seedhi baat batai",
    "payment se pehle live demo dikhaya aur haatho-haath glass aur cover bhi set kar diya",
    "saare latest brands ek hi chhat ke neeche mil gaye, kahin aur bhatakna nahi pada",
  ],
  accessories: [
    "tempered glass itni safai se lagaya ki ek bhi bubble ya dhool ka nishaan nahi aaya",
    "covers ki quality haath mein pakad ke hi pata chalti hai, sasta local maal nahi rakhte",
    "mere phone ka model dekh kar bilkul sahi watt wala original charger diya",
    "earphones aur neckband lene se pehle awaaz aur mic aaram se check karne diya",
    "power bank, data cable aur back covers mein kaafi naye designs dekhne ko mile",
    "market ke hisaab se rate kaafi wajib laga aur warranty card bhi saath mein diya",
    "2 minute mein screen guard aur camera ring dono ekdum barabar fit kar diye",
  ],
  repair: [
    "counter par hi phone check karke pehle sahi kharcha bataya, baad mein koi extra paisa nahi maanga",
    "screen change hone ke baad touch aur display bilkul naye phone jaisa smooth chal raha hai",
    "motherboard ka daraawa dekar lamba bill nahi banaya, sirf jo chhota part kharab tha wahi badla",
    "battery badalne ke baad charging aur call mere saamne check karwake tasalli karwayi",
    "repairing ke dauran mere phone ke saare photos aur data bilkul safe rahe",
    "jo time bola tha usi time par phone ready karke de diya, chakkar nahi katwaye",
    "charging jack ek ghante mein theek kar diya, ab cable ekdum tight lagti hai",
  ],
  exchange: [
    "purana phone mere saamne check kiya aur binafaltu kamiyan nikaale achha daam lagaya",
    "exchange ka paisa seedha naye phone ke bill mein minus ho gaya, koi confusion nahi raha",
    "jab tak maine apna backup liya tab tak staff ne poora wait kiya aur fir phone reset karwaya",
    "online exchange mein jitna dikha raha tha usse behtar value mujhe SS Mobile par mil gayi",
    "20 minute ke andar purana phone dekar naya phone haath mein aa gaya",
    "exchange slip aur naya bill dono ekdum clear bana kar diye",
  ],
  staff: [
    "itne sawaal poochne par bhi staff ne muskura kar jawab diya, bilkul bura nahi maana",
    "chhota saman lo ya mehnga phone, har customer ko barabar izzat dete hain",
    "billing ekdum saaf rakhte hain, koi faltu add-on bina pooche bill mein nahi jodte",
    "phone setup hote time baithne ko kaha aur paani bhi poocha, yeh chhoti baatein achhi lagti hain",
    "Hindi aur English dono mein aaram se samjha dete hain, jaisa customer ko samajh aaye",
    "shaam ke rush mein bhi bina hawa-bazi ke tasalli se kaam karke diya",
  ],
};

const HI_CLOSERS: readonly string[] = [
  "Ashok Nagar mein mobile lena ho toh aankh band karke SS Mobile jao.",
  "Dil se 5 star, agli baar bhi phone yahin se lenge.",
    "Sahi daam, asli saman aur badiya vyavhaar - aur kya chahiye.",
  "Apne doston aur family ko bhi main SS Mobile hi recommend karunga.",
  "Local dukaan par aisi professional service dekh kar bahut achha laga.",
  "Paisa vasool experience raha, poori tarah satisfied hoon.",
  "Online ke chakkar mein padne se achha seedha SS Mobile par aao.",
  "Service aur bharose ke maamle mein SS Mobile Ashok Nagar best hai.",
];

// Curated ultra-natural standalone reviews for instant variety
const STANDALONE_EN: readonly Review[] = [
  { id: "s-en-1", cat: "mobiles", lang: "en", text: "Bought a new 5G phone from SS Mobile Ashok Nagar today. The staff compared two models honestly, unboxed it in front of me, and completed the billing in minutes. Very trustworthy local store." },
  { id: "s-en-2", cat: "accessories", lang: "en", text: "Stopped by SS Mobile for a tempered glass and back cover. Zero bubbles on the screen guard, sturdy case quality, and very fair pricing. Quick 5-minute job done neatly." },
  { id: "s-en-3", cat: "repair", lang: "en", text: "Got my phone's broken display fixed at SS Mobile Ashok Nagar. They quoted the exact price upfront, kept my data safe, and handed the phone back the same evening looking brand new." },
  { id: "s-en-4", cat: "exchange", lang: "en", text: "Upgraded my old handset at SS Mobile through exchange. They checked the phone on the counter, gave a better buyback rate than online apps, and adjusted it straight into the new bill." },
  { id: "s-en-5", cat: "staff", lang: "en", text: "What stands out at SS Mobile Ashok Nagar is how patiently the staff talk to customers. No pushy sales pitch, clear GST billing, and genuine help with setting up the new phone." },
];

const STANDALONE_HI: readonly Review[] = [
  { id: "s-hi-1", cat: "mobiles", lang: "hinglish", text: "SS Mobile Ashok Nagar se aaj naya phone liya. Bhaiya ne budget ke hisaab se sahi model dikhaya, purane phone ka saara data transfer kar diya aur rate bhi online se badiya lagaya. Full 5 star!" },
  { id: "s-hi-2", cat: "accessories", lang: "hinglish", text: "Apne phone ke liye tempered glass aur original charger SS Mobile se liya. Glass ekdum safai se bina bubble ke lagaya aur charger bhi proper warranty ke saath mila. Badhiya dukaan hai." },
  { id: "s-hi-3", cat: "repair", lang: "hinglish", text: "Phone ki charging aur display problem ke liye SS Mobile Ashok Nagar gaya tha. Bina faltu kharcha bataye same day phone ekdum naye jaisa theek karke de diya. Bharosemand service!" },
  { id: "s-hi-4", cat: "exchange", lang: "hinglish", text: "Purana mobile dekar SS Mobile se naya handset liya. Counter par hi check karke achha exchange rate diya aur seedha bill mein minus kar diya. Koi jhanjhat nahi hua." },
  { id: "s-hi-5", cat: "staff", lang: "hinglish", text: "SS Mobile Ashok Nagar ka staff bahut tameez se baat karta hai. Chahe chhota cover lena ho ya naya phone, poora time dekar samjhate hain aur billing ekdum saaf rakhte hain." },
];

/**
 * Generates a fresh, natural-sounding review using multi-pattern synthesis
 * so reviews vary in sentence structure, length, and focus, and never repeat.
 */
export function synthesizeSmartReview(
  cat: CategoryId,
  lang: Lang,
  usedIds: Set<string>,
  usedTexts: string[]
): { text: string; id: string } {
  const allCats: CategoryCore[] = ["mobiles", "accessories", "repair", "exchange", "staff"];

  for (let attempt = 0; attempt < 40; attempt++) {
    const primaryCat: CategoryCore = cat === "all" ? pick(allCats) : cat;
    const useGeneralOpener = cat === "all" ? Math.random() < 0.55 : Math.random() < 0.25;
    const style = Math.floor(Math.random() * 4); // 4 structural templates for natural human rhythm

    let text = "";

    if (lang === "en") {
      const openerPool = useGeneralOpener ? EN_OPENERS.general : EN_OPENERS[primaryCat];
      const opener = pick(openerPool);
      const closer = pick(EN_CLOSERS);

      if (style === 0) {
        // 2-sentence crisp review
        const exp = pick(EN_EXPERIENCES[primaryCat]);
        text = `${opener}, and ${exp}. ${closer}`;
      } else if (style === 1 && cat === "all") {
        // Cross-category Local Guide style review
        const [c1, c2] = pickTwo(allCats);
        const e1 = pick(EN_EXPERIENCES[c1]);
        const e2 = pick(EN_EXPERIENCES[c2]);
        text = `${opener}. Whether it is phones or service, ${e1}, and ${e2}. ${closer}`;
      } else if (style === 2) {
        // 3-sentence detailed customer story
        const [e1, e2] = pickTwo(EN_EXPERIENCES[primaryCat]);
        text = `${opener}. First off, ${e1}. Also, ${e2}. ${closer}`;
      } else {
        // Direct punchy 2-sentence review
        const exp = pick(EN_EXPERIENCES[primaryCat]);
        const capExp = exp.charAt(0).toUpperCase() + exp.slice(1);
        text = `${opener}. ${capExp}. ${closer}`;
      }
    } else {
      const openerPool = useGeneralOpener ? HI_OPENERS.general : HI_OPENERS[primaryCat];
      const opener = pick(openerPool);
      const closer = pick(HI_CLOSERS);

      if (style === 0) {
        const exp = pick(HI_EXPERIENCES[primaryCat]);
        text = `${opener}, aur ${exp}. ${closer}`;
      } else if (style === 1 && cat === "all") {
        const [c1, c2] = pickTwo(allCats);
        const e1 = pick(HI_EXPERIENCES[c1]);
        const e2 = pick(HI_EXPERIENCES[c2]);
        text = `${opener}. Yahan ${e1}, aur saath hi ${e2}. ${closer}`;
      } else if (style === 2) {
        const [e1, e2] = pickTwo(HI_EXPERIENCES[primaryCat]);
        text = `${opener}. Sabse achhi baat yeh lagi ki ${e1}. Iske alawa ${e2}. ${closer}`;
      } else {
        const exp = pick(HI_EXPERIENCES[primaryCat]);
        const capExp = exp.charAt(0).toUpperCase() + exp.slice(1);
        text = `${opener}. ${capExp}. ${closer}`;
      }
    }

    const id = hashText(text);
    if (!usedIds.has(id) && !tooSimilar(text, usedTexts.slice(-25))) {
      return { text, id };
    }
  }

  // Fallback with timestamp salt guarantees uniqueness even after thousands of runs
  const primaryCat: CategoryCore = cat === "all" ? pick(allCats) : cat;
  const opener = lang === "en" ? pick(EN_OPENERS[primaryCat]) : pick(HI_OPENERS[primaryCat]);
  const exp = lang === "en" ? pick(EN_EXPERIENCES[primaryCat]) : pick(HI_EXPERIENCES[primaryCat]);
  const closer = lang === "en" ? pick(EN_CLOSERS) : pick(HI_CLOSERS);
  const text = `${opener}. ${exp.charAt(0).toUpperCase() + exp.slice(1)}. ${closer}`;
  return { text, id: hashText(text + Date.now()) };
}

export function listReviews(cat: string, lang: Lang): Review[] {
  const base = lang === "hinglish" ? STANDALONE_HI : STANDALONE_EN;
  return base.filter((r) => cat === "all" || r.cat === cat || r.cat === "all");
}

export function normalizeLang(raw: string | null): Lang {
  return raw === "hinglish" || raw === "hi" ? "hinglish" : "en";
}

export function normalizeCat(raw: string | null): CategoryId {
  const ids: CategoryId[] = ["all", "mobiles", "accessories", "repair", "exchange", "staff"];
  return ids.includes(raw as CategoryId) ? (raw as CategoryId) : "all";
}
