import type { CategoryId } from "./shop";
import { hashText, tooSimilar } from "./dedupe";

export type Lang = "en" | "hinglish" | "mr";

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

function pickThree<T>(arr: readonly T[], rng = Math.random): [T, T, T] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return [copy[0], copy[1], copy[2]];
}

// ============================================================================
// 1. ENGLISH KNOWLEDGE BASE
//    Covers: All-brand 5G Mobiles, Smart LED/4K/Google TVs, Bluetooth Speakers,
//    Soundbars, Party Speakers, 5.1 Home Theaters, Accessories, Repair,
//    Exchange & 0% EMI, and Staff/Owner Service.
// ============================================================================

const EN_OPENERS: Record<CategoryCore | "general", readonly string[]> = {
  general: [
    "Visited SS Mobile in Ashok Nagar today",
    "Stopped by SS Mobile this evening for electronics shopping",
    "Best mobile and electronics showroom experience I have had in Ashok Nagar",
    "Walked into SS Mobile after a friend recommended it",
    "Very reliable store in Ashok Nagar for smartphones, Smart TVs and audio systems",
    "Had a really smooth shopping experience at SS Mobile Ashok Nagar",
    "Came to SS Mobile for a quick purchase and was thoroughly impressed",
    "If you want genuine phones, TVs and speakers in Ashok Nagar, this is the place",
    "Great local mobile and electronics showroom with honest pricing",
    "Been visiting SS Mobile for our family's phones and home electronics and they never disappoint",
    "Drop by SS Mobile if you want straightforward advice without pushy sales pressure",
    "Superb experience at SS Mobile Ashok Nagar this weekend",
    "One-stop shop in Ashok Nagar for all-brand mobiles, LED TVs and home theaters",
    "Purchased from SS Mobile recently and had a five-star experience",
    "Really happy with the variety of all-brand electronics available at SS Mobile",
    "Walked into SS Mobile Ashok Nagar to check festive deals and loved the service",
    "Checked a few shops around Ashok Nagar and found SS Mobile to be the most genuine",
    "My whole family buys phones and home appliances from SS Mobile Ashok Nagar",
    "Hands down the most trusted electronics and mobile shop in Ashok Nagar, Nashik",
    "Went to SS Mobile with a tight budget and came back with a fantastic deal",
    "Every time I visit SS Mobile Ashok Nagar, their stock and service impress me",
    "Highly professional electronics store right in the heart of Ashok Nagar",
    "Had an awesome buying experience at SS Mobile today",
    "From entry-level phones to big-screen Smart TVs, SS Mobile has everything ready",
  ],
  mobiles: [
    "Bought my new 5G smartphone from SS Mobile in Ashok Nagar",
    "Just picked up a brand new handset from SS Mobile today",
    "Upgraded my phone at SS Mobile Ashok Nagar",
    "Purchased a new smartphone here for my parents",
    "Came in looking for a mid-range 5G phone at SS Mobile",
    "Bought a new phone from SS Mobile and loved the counter service",
    "Finally got the exact smartphone model and colour I wanted at SS Mobile",
    "Visited SS Mobile to compare Samsung, Vivo, Oppo and Redmi phones before buying",
    "Got a new Android phone from SS Mobile Ashok Nagar this week",
    "Bought a gift smartphone for my sister from SS Mobile",
    "Picked up a latest flagship phone on easy EMI from SS Mobile Ashok Nagar",
    "Checked multiple stores in Nashik and found the best mobile deal at SS Mobile",
    "Purchased two smartphones for my home from SS Mobile Ashok Nagar",
    "Upgraded to a new camera phone from SS Mobile today",
    "Bought a Realme 5G handset from SS Mobile Ashok Nagar at an unbeatable price",
    "Picked up a new iPhone and original adapter from SS Mobile today",
    "Bought a OnePlus smartphone from SS Mobile and the unboxing experience was great",
    "Got a high-battery smartphone for my father from SS Mobile Ashok Nagar",
    "Came to SS Mobile looking for a gaming phone with a 120Hz display",
    "Purchased my college phone on zero-down-payment EMI at SS Mobile",
    "Picked up the newly launched Samsung Galaxy series phone at SS Mobile Ashok Nagar",
    "Got a sleek Oppo camera phone from SS Mobile with an instant discount",
  ],
  tv_audio: [
    "Bought a new Smart LED TV from SS Mobile in Ashok Nagar",
    "Purchased a 4K Android Smart TV and soundbar from SS Mobile today",
    "Picked up a powerful Bluetooth Home Theater system from SS Mobile Ashok Nagar",
    "Visited SS Mobile looking for a party speaker and Smart TV for our living room",
    "Got a brand new Smart TV and woofer speaker set from SS Mobile",
    "Upgraded our home entertainment setup with a Smart LED TV from SS Mobile Ashok Nagar",
    "Came to SS Mobile to compare all-brand Smart TVs and home theater speakers",
    "Bought a booming bass tower speaker and Bluetooth soundbar at SS Mobile",
    "Found the best deal on a 43-inch 4K Smart TV at SS Mobile Ashok Nagar",
    "Purchased a multi-speaker home theater system from SS Mobile for my home",
    "Stopped by SS Mobile for a portable Bluetooth speaker and ended up loving their TV range too",
    "Bought a 55-inch Google TV from SS Mobile Ashok Nagar at a great price",
    "Picked up a high-bass home theater and party box speaker from SS Mobile",
    "Best shop in Ashok Nagar for all-brand Smart TVs, soundbars and speakers",
    "Bought a 32-inch Smart Android TV for our bedroom from SS Mobile Ashok Nagar",
    "Picked up a 5.1 surround sound Home Theater with deep subwoofer bass at SS Mobile",
    "Purchased a wireless karaoke party speaker with mic from SS Mobile today",
    "Got a Dolby Audio soundbar and Smart TV combo from SS Mobile Ashok Nagar",
    "Compared LG, Samsung, Mi and TCL Smart TVs at SS Mobile before picking mine",
    "Bought a portable waterproof Bluetooth speaker from SS Mobile for weekend trips",
    "Upgraded our old TV to a bezel-less 4K Smart TV from SS Mobile Ashok Nagar",
    "Found all major speaker and home theater brands ready for live sound testing at SS Mobile",
  ],
  accessories: [
    "Visited SS Mobile in Ashok Nagar for phone accessories and audio gear",
    "Picked up a premium back cover and edge-to-edge tempered glass from SS Mobile",
    "Came to SS Mobile looking for an original fast charger and cable",
    "Great collection of mobile accessories and Bluetooth neckbands at SS Mobile Ashok Nagar",
    "Stopped by SS Mobile for TWS earbuds, smartwatch and a screen protector",
    "Got my new phone's cover, camera lens guard and fast adapter from SS Mobile",
    "Needed a durable charging cable, power bank and neckband, found all at SS Mobile",
    "Best place in Ashok Nagar for quality mobile covers, matte glass and earbuds",
    "Bought a Bluetooth speaker, car charger and fast Type-C cable from SS Mobile",
    "Picked up wireless earphones and a heavy-duty shockproof case at SS Mobile Ashok Nagar",
    "Found genuine brand adapters and high-speed data cables at SS Mobile",
    "Visited SS Mobile to get privacy tempered glass and a magsafe cover",
    "Bought a 20000mAh fast-charging power bank and braided cable from SS Mobile",
    "Picked up an AMOLED calling smartwatch and ANC earbuds at SS Mobile Ashok Nagar",
    "Got a UV curved tempered glass installed on my phone at SS Mobile",
    "Came to SS Mobile for a mobile stand, OTG adapter and memory card",
    "Found the cutest designer silicone cases and flip covers at SS Mobile Ashok Nagar",
    "Bought a SuperVOOC / fast PD charger from SS Mobile with official warranty",
  ],
  repair: [
    "Gave my phone for repair at SS Mobile Ashok Nagar",
    "Got my cracked mobile display replaced at SS Mobile today",
    "Visited SS Mobile because my phone had a charging port issue",
    "Had my phone's battery replaced at SS Mobile in Ashok Nagar",
    "Took my handset to SS Mobile for urgent same-day servicing",
    "Very trustworthy mobile repair service at SS Mobile Ashok Nagar",
    "My phone speaker and mic were acting up, got both fixed neatly at SS Mobile",
    "Saved my phone from a huge repair bill thanks to the honest technicians at SS Mobile",
    "Got my water-damaged smartphone repaired smoothly at SS Mobile Ashok Nagar",
    "Went to SS Mobile for a software hang issue and camera glass replacement",
    "Fastest and cleanest mobile screen replacement I have experienced in Ashok Nagar",
    "My phone wasn't turning on, and SS Mobile diagnosed and fixed it within hours",
    "Had my phone's power button and volume keys repaired at SS Mobile today",
    "Got an original-quality display combo fitted at SS Mobile Ashok Nagar",
    "My phone was overheating and draining battery fast, SS Mobile fixed it properly",
    "Went to SS Mobile to fix a loose charging jack and speaker distortion",
    "Got my broken back glass panel replaced cleanly at SS Mobile Ashok Nagar",
    "Trusted SS Mobile with my flagship phone repair and they did a flawless job",
  ],
  exchange: [
    "Exchanged my old smartphone for a brand new 5G model at SS Mobile Ashok Nagar",
    "Traded in my used phone at SS Mobile today and got a great upgrade",
    "Got a very fair buyback value on my old handset at SS Mobile",
    "Upgraded my old phone through exchange and easy EMI at SS Mobile Ashok Nagar",
    "Came to SS Mobile to check the exchange rate for my 2-year-old phone",
    "Smooth phone exchange and zero-down-payment EMI experience at SS Mobile",
    "Swapped my old Android for a latest smartphone at SS Mobile Ashok Nagar",
    "Used the exchange offer at SS Mobile to upgrade both my phone and get a Bluetooth speaker",
    "Got the highest exchange price for my old handset at SS Mobile compared to other shops",
    "Upgraded my old phone on Bajaj Finance / card EMI smoothly at SS Mobile Ashok Nagar",
    "Traded in my old 4G handset for a new 5G smartphone at SS Mobile",
    "Even with minor scratches on my old phone, SS Mobile gave a very decent exchange value",
    "Bought a new Smart TV and smartphone on easy monthly EMI at SS Mobile Ashok Nagar",
    "Quick 15-minute paperless finance and phone exchange at SS Mobile",
  ],
  staff: [
    "Really impressed by the staff behaviour and owner's guidance at SS Mobile Ashok Nagar",
    "The team at SS Mobile knows how to treat every customer with genuine respect",
    "Polite staff, transparent pricing and super quick GST billing at SS Mobile",
    "Even during evening rush, the staff at SS Mobile attended us properly",
    "Customer service at SS Mobile Ashok Nagar is truly top notch",
    "The counter staff at SS Mobile are patient, knowledgeable and genuinely helpful",
    "Clean showroom, well-organised display, and very friendly team at SS Mobile",
    "Avinash sir and the SS Mobile team make sure every customer walks out happy",
    "Loved how patiently the staff demonstrated phones, TVs and speakers without rushing us",
    "Zero attitude, honest suggestions and fast billing at SS Mobile Ashok Nagar",
    "The way they explain technical features in simple language at SS Mobile is commendable",
    "After-sales support at SS Mobile Ashok Nagar is just as good as their pre-sale service",
    "Very welcoming atmosphere and honest guidance by the team at SS Mobile",
    "They treat senior citizens and first-time smartphone buyers with extra patience at SS Mobile",
  ],
};

const EN_EXPERIENCES: Record<CategoryCore, readonly string[]> = {
  mobiles: [
    "they had all major brands like Samsung, Vivo, Oppo, Redmi, Realme, OnePlus and iPhone ready in stock",
    "the staff compared three models side by side and explained the camera, display and battery clearly",
    "the box was factory sealed, IMEI was verified in front of me, and I received a proper GST invoice",
    "they did not push the most expensive handset and suggested what genuinely suited my budget",
    "they transferred all my WhatsApp chats, contacts, photos and banking apps to the new phone patiently",
    "pricing matched online festive offers and I got the phone in hand immediately with official brand warranty",
    "they explained zero-down-payment EMI and cashback schemes in very simple words",
    "they unboxed the handset on the counter and applied a complimentary screen guard and cover neatly",
    "the salesperson knew the exact processor, 5G bands and camera details instead of just reading the box",
    "I got a better deal here than what I saw online, plus peace of mind from a local Ashok Nagar store",
    "they set up my Google account, transferred SIM contacts and tested call quality before handing it over",
    "all RAM and colour variants were available on the spot so I did not have to wait for pre-booking",
    "they also threw in a nice discount on a fast charger and shockproof case with the new handset",
    "night camera and portrait mode were demonstrated live inside the store so I could judge the quality myself",
    "the billing and finance approval finished in less than 15 minutes with zero paperwork hassle",
    "they updated the new phone's software on store Wi-Fi and made sure every app was working fine",
  ],
  tv_audio: [
    "they gave a live picture and sound demo of multiple Smart LED TVs side by side on the wall",
    "we tested the bass and vocal clarity of the home theater and Bluetooth speakers right in the showroom",
    "they stock all popular brands of Smart TVs, soundbars, party speakers and home theaters under one roof",
    "the staff explained the difference between 4K UHD, QLED, Google TV and Android TV panels in detail",
    "the home theater woofer bass is super punchy and they helped me pick the right wattage for my hall",
    "they gave a sealed box TV with full brand warranty, proper GST bill and arranged safe delivery & wall-mount info",
    "the Bluetooth speaker and home theater pricing was noticeably lower than big mall showrooms",
    "they connected my phone via Bluetooth to test 4-5 speakers so I could hear the exact sound output",
    "got an awesome combo deal on a Smart LED TV along with a high-bass Dolby soundbar",
    "they also had easy EMI options on Smart TVs and home theater systems with minimal paperwork",
    "every remote function, YouTube voice search, OTT apps and screen mirroring feature was demonstrated clearly",
    "whether you want a compact portable speaker, a karaoke party box or a 5.1 home theater, their audio range is superb",
    "the picture brightness, viewing angles and Dolby audio clarity of the TV exceeded our expectations",
    "they carefully checked the TV panel for zero dead pixels before packing it safely for transport",
    "the tower speaker came with wireless mic support and crystal-clear treble even at full volume",
    "they guided us honestly on which TV brand has the best service support in Nashik",
  ],
  accessories: [
    "they applied the edge-to-edge tempered glass without a single air bubble or dust speck",
    "the back covers are sturdy, shockproof and fresh in design, not old yellowed stock",
    "they checked my handset model and gave the exact original wattage fast charger it supports",
    "found original data cables, power banks, TWS earbuds and neckbands neatly arranged by brand",
    "they let me test the Bluetooth neckband and speakers for bass and mic quality before billing",
    "the camera lens ring protector and matte gaming glass were fitted in less than five minutes",
    "prices for covers, chargers and audio gear are very reasonable compared to other shops nearby",
    "they gave a proper warranty card with the neckband, power bank and fast adapter",
    "their collection of silicone, leather-finish, rugged armor and transparent magsafe cases is huge",
    "they even cleaned my phone's charging port and speaker grill for free while fitting the tempered glass",
    "the curved UV glass was aligned perfectly without touching the case edges",
    "they helped pair my new smartwatch and TWS earbuds with my phone right at the counter",
    "all fast charging cables are thick, durable and support warp/super-fast charging properly",
    "bought three covers and two screen guards for the family and got a neat bundle discount",
  ],
  repair: [
    "they checked the fault in front of me and gave an honest estimate before touching the phone",
    "display fitting was so clean that the brightness and touch response feel 100% like original",
    "they fixed the charging port in under an hour instead of keeping the phone overnight",
    "no unnecessary motherboard scare tactics — they repaired only the exact part that was faulty",
    "after replacing the battery, they tested charging speed, call audio, speaker and cameras with me",
    "all my personal data, gallery photos and WhatsApp chats stayed completely safe during the repair",
    "they delivered the phone right on the time they promised at a very fair service charge",
    "the technician explained what caused the issue and how to protect the handset in future",
    "the adhesive sealing after screen replacement was done neatly with zero glue marks on the frame",
    "even a tricky mic and earpiece volume issue was solved within 30 minutes on the counter",
    "they used high-grade replacement parts and gave assurance on the new display and battery",
    "my phone had water damage and they cleaned the board ultrasonically and revived it the same day",
    "fingerprint sensor and front camera worked flawlessly after the screen replacement",
    "they applied a fresh screen guard after completing the display repair so it stays protected",
  ],
  exchange: [
    "they inspected my old phone on the counter and gave a fair, transparent valuation within minutes",
    "the exchange amount was deducted straight from the new purchase bill with zero confusion",
    "they waited patiently while I backed up my WhatsApp and photos and logged out of all accounts",
    "got a much better buyback price here than what online exchange apps were quoting",
    "there were no sudden hidden deductions after agreeing on the exchange value",
    "the whole upgrade from old phone to new 5G phone took barely twenty minutes",
    "they helped factory-reset my old handset properly in front of me for complete privacy",
    "EMI approval alongside the old phone exchange was super quick with just basic documents",
    "they accepted my old phone even without the original box as long as the bill/ID was clear",
    "the combination of exchange bonus plus store discount saved me a lot of money",
    "they transferred my SIM, memory card and data to the new phone before wiping the old one",
    "zero processing hassle on finance EMI — everything was explained clearly before signing",
  ],
  staff: [
    "the staff answered all my questions patiently without rushing me to make a quick decision",
    "billing was 100% transparent with every item and warranty clearly mentioned on the invoice",
    "they speak politely and treat every customer the same whether buying a Rs 100 cable or a flagship TV",
    "the showroom is clean, bright and all mobiles, TVs and speakers are displayed neatly",
    "they offered a chair and water while my new device setup and data transfer were completing",
    "no pushy cross-selling at the billing counter, which made the visit very comfortable",
    "they remembered our previous visit and gave us a great repeat-customer discount",
    "even small queries about phone settings and Smart TV Wi-Fi setup were handled with a smile",
    "the owner Avinash sir personally ensures that every customer gets genuine products and proper guidance",
    "they communicate comfortably in Marathi, Hindi and English so everyone feels at home",
    "their honesty about which model has better battery life or sound quality really builds trust",
    "even after billing was done, they spent 15 minutes helping me set up all my apps",
  ],
};

const EN_EXTRAS: readonly string[] = [
  "They also have a great range of all-brand Smart TVs, Bluetooth speakers and home theaters on display.",
  "Plus, their collection of covers, fast chargers, neckbands and audio systems is super impressive.",
  "Easy EMI options and exchange offers make upgrading here completely pocket-friendly.",
  "Parking right outside in Ashok Nagar is convenient and the store is very easy to locate.",
  "Everything comes with a proper GST bill and genuine brand warranty.",
  "It is rare to find a local store that combines fair online-matching prices with personal after-sales support.",
  "Whether it is a new 5G smartphone, a 4K Smart TV, a booming home theater or quick repair, they handle it all under one roof.",
  "They genuinely care about long-term customer trust rather than just making a one-time sale.",
  "All major brands are available right here so you don't need to travel into city traffic.",
  "Their live demo counter for speakers, soundbars and LED TVs makes choosing so much easier.",
  "Both cash and easy finance/UPI/card options are handled smoothly at the counter.",
  "You get 100% original sealed products with full manufacturer warranty support.",
];

const EN_CLOSERS: readonly string[] = [
  "Definitely my go-to mobile and electronics shop in Ashok Nagar.",
  "Highly recommended for anyone looking for genuine phones, Smart TVs, speakers and honest service.",
  "Will surely come back here for our next family upgrade.",
  "Great to have such a trustworthy all-brand store in Ashok Nagar, Nashik.",
  "Five stars for their transparency, fair pricing and polite behaviour.",
  "Much better peace of mind buying from SS Mobile than ordering blindly online.",
  "Overall a smooth, hassle-free experience from start to finish.",
  "Happy with the purchase and the solid after-sales assurance they provide.",
  "Easily the best mobile, TV and home theater store in Ashok Nagar.",
  "Walked out completely satisfied with both the product quality and the billing.",
  "10/10 service — thank you team SS Mobile!",
  "Do visit SS Mobile Ashok Nagar before buying any phone, TV or speaker elsewhere.",
  "Full 5-star rating from my side for their genuine stock and friendly service.",
  "If you live in or around Ashok Nagar, this is the best place for mobiles and electronics.",
  "Totally worth visiting — great prices, original products and wonderful staff.",
  "Glad I chose SS Mobile Ashok Nagar for my purchase today!",
];

// ============================================================================
// 2. HINGLISH KNOWLEDGE BASE (Natural Indian Hinglish)
// ============================================================================

const HI_OPENERS: Record<CategoryCore | "general", readonly string[]> = {
  general: [
    "SS Mobile Ashok Nagar par aaj visit kiya, bahut hi badhiya experience raha",
    "Ashok Nagar mein mobile, Smart TV aur speakers ke liye SS Mobile sabse bharosemand dukaan hai",
    "Dost ke kehne par SS Mobile aaya tha aur sach mein kaam ekdum first class hua",
    "SS Mobile par shopping ka experience hamesha smooth aur tension-free rehta hai",
    "Agar Ashok Nagar Nashik mein genuine mobile aur electronics shop dhoondh rahe ho toh SS Mobile best hai",
    "Aaj SS Mobile se saman liya, staff ka vyavhaar aur pricing dono dil khush karne wale hain",
    "Badiya all-brand showroom hai Ashok Nagar mein, mobile se lekar TV aur home theater sab sahi rate par milta hai",
    "Family ke saare phones aur electronics hum SS Mobile se hi lete hain, bharosa 100% hai",
    "Online order karne se achha SS Mobile Ashok Nagar jaakar haath mein check karke lo",
    "Shaam ko SS Mobile gaya tha, rush hone ke baad bhi staff ne poora dhyan diya",
    "Ek hi chhat ke neeche saare brands ke mobile, LED TV aur speakers milne wali best shop",
    "SS Mobile Ashok Nagar mein hamesha naye offers aur genuine products milte hain",
    "Nashik ke Ashok Nagar area mein sabse top mobile aur electronics showroom SS Mobile hi hai",
    "Aaj ghar ke liye shopping karne SS Mobile aaye the, bahut badiya deal mili",
    "Jab bhi naya phone, speaker ya TV lena hota hai, hum seedha SS Mobile Ashok Nagar aate hain",
    "Sahi rate aur original saman ki guarantee chahiye toh SS Mobile zaroor visit karein",
    "Pichle 3 saal se SS Mobile Ashok Nagar ke regular customer hain, kabhi shikayat ka mauka nahi mila",
    "Bina kisi confusion ke best electronics shopping experience SS Mobile par mila",
  ],
  mobiles: [
    "SS Mobile Ashok Nagar se aaj naya 5G smartphone liya",
    "Apna naya phone SS Mobile se purchase kiya, dil khush ho gaya",
    "Ghar walon ke liye SS Mobile se naya smartphone liya",
    "SS Mobile Ashok Nagar se budget mein ekdum badiya camera phone mil gaya",
    "Jo model aur colour chahiye tha woh SS Mobile par ready stock mein mil gaya",
    "Naya handset lene SS Mobile gaya tha, market se bahut achha deal mila",
    "Pehli baar SS Mobile se phone kharida aur experience full 5-star raha",
    "Brother ke liye naya gaming aur 5G mobile SS Mobile Ashok Nagar se liya",
    "Samsung, Vivo, Oppo, Redmi saare brands compare karke SS Mobile se phone final kiya",
    "Easy EMI par naya smartphone SS Mobile Ashok Nagar se liya",
    "Do naye mobiles aaj SS Mobile se kharide, dono par badiya offer mila",
    "Papa ke liye badi battery aur achhe speaker wala phone SS Mobile se liya",
    "iPhone aur OnePlus ke latest models SS Mobile Ashok Nagar par best price mein mil gaye",
    "Bajaj card EMI par bina down payment ke naya 5G phone SS Mobile se liya",
    "College ke liye naya camera smartphone SS Mobile Ashok Nagar se purchase kiya",
    "Realme aur Vivo ke naye 5G models live check karke SS Mobile se kharida",
  ],
  tv_audio: [
    "SS Mobile Ashok Nagar se ghar ke liye naya Smart LED TV liya",
    "Aaj SS Mobile se 4K Android Smart TV aur Home Theater purchase kiya",
    "SS Mobile Ashok Nagar se zabardast bass wala Bluetooth speaker aur soundbar liya",
    "Ghar ke hall ke liye naya Smart TV aur woofer speaker lene SS Mobile gaya tha",
    "SS Mobile par saare brands ke Smart TV, party speakers aur home theater ek saath dekhne ko mile",
    "Naya Google TV aur 5.1 Home Theater SS Mobile Ashok Nagar se best rate mein mila",
    "Party aur ghar ke liye heavy bass speaker SS Mobile se liya, awaaz ekdum dhamakedar hai",
    "Smart TV lene se pehle 3-4 dukaan dekhi par sabse sahi rate aur demo SS Mobile par mila",
    "SS Mobile Ashok Nagar sirf mobile hi nahi, TV aur Home Theater ke liye bhi best showroom hai",
    "Bajaj EMI par naya Smart LED TV aur Bluetooth soundbar SS Mobile se liya",
    "Chhote Bluetooth speaker se lekar bade tower speaker aur TV tak sab SS Mobile par available hai",
    "32-inch aur 43-inch Smart TV ke saare top brands SS Mobile Ashok Nagar par ready stock mein mile",
    "55-inch 4K Smart TV aur Dolby soundbar ka combo SS Mobile se bahut saste mein mila",
    "Karaoke mic wala party speaker SS Mobile Ashok Nagar se liya, ghar mein sabko bahut pasand aaya",
    "Purane TV ki jagah naya Android Smart TV SS Mobile se liya, picture quality lajawab hai",
    "Home Theater ka woofer bass showroom mein baja kar check kiya aur turant final kar diya",
  ],
  accessories: [
    "SS Mobile Ashok Nagar se phone ka back cover aur tempered glass lagwaya",
    "Original fast charger aur Type-C cable lene SS Mobile aaya tha",
    "Mobile accessories, earbuds aur neckband ke maamle mein SS Mobile ka collection lajawab hai",
    "SS Mobile se Bluetooth neckband aur screen guard liya, quality ekdum solid hai",
    "Naye phone ke liye stylish shockproof cover aur camera lens protector SS Mobile se liya",
    "Sahi rate mein achhi quality ke covers, smartwatch aur earphones SS Mobile par mil gaye",
    "Matte tempered glass aur original adapter lene SS Mobile Ashok Nagar gaya tha",
    "Power bank, fast charger aur wireless earbuds SS Mobile se badhiya discount mein mile",
    "Phone ke liye privacy glass aur magsafe cover SS Mobile par turant mil gaya",
    "Curved display phone ke liye UV glass SS Mobile Ashok Nagar par ekdum perfekt lagwaya",
    "Calling smartwatch aur TWS earbuds lene SS Mobile aaya tha, bahut saare options mile",
    "20000mAh ka fast charging power bank aur original data cable SS Mobile se liya",
    "Car charger, mobile stand aur memory card sab sahi daam mein SS Mobile par mil gaya",
    "har model ke trendy back covers SS Mobile Ashok Nagar mein hamesha mil jaate hain",
  ],
  repair: [
    "Apna phone repair karwane SS Mobile Ashok Nagar diya tha",
    "SS Mobile par tooti hui mobile screen change karwayi, kaam ekdum original jaisa hua",
    "Phone mein charging problem thi, SS Mobile walon ne haatho-haath theek kar diya",
    "Mobile ki battery SS Mobile Ashok Nagar se replace karwayi",
    "Phone hang aur speaker-mic issue ke liye SS Mobile aaya tha, badhiya service mili",
    "Ashok Nagar mein imandari se mobile repair karne wali sabse sahi shop hai SS Mobile",
    "Urgent mein phone theek karwana tha aur SS Mobile ne same day ready karke de diya",
    "Paani jaane se phone band ho gaya tha, SS Mobile par kam kharche mein chalu ho gaya",
    "Display combo aur back panel SS Mobile par ekdum safai se fit karke diya",
    "Phone ka power button aur volume key kharab tha, 30 minute mein theek kar diya",
    "Battery jaldi utar rahi thi, SS Mobile se nayi warranty wali battery dalwayi",
    "Bina data delete kiye SS Mobile Ashok Nagar ne mera band pada phone chalu kar diya",
    "Screen badalne ke baad fingerprint aur touch ekdum makkhan jaisa chal raha hai",
  ],
  exchange: [
    "Apna purana phone SS Mobile Ashok Nagar par exchange karke naya 5G phone liya",
    "Old mobile dekar naya upgrade karne ke liye SS Mobile best jagah hai",
    "Purane handset ki bahut sahi exchange value mili SS Mobile par",
    "SS Mobile Ashok Nagar mein phone exchange aur EMI ka process ekdum simple aur fast tha",
    "2 saal purana phone exchange kiya SS Mobile par, online apps se achha rate mila",
    "Used phone exchange karke naya smartphone liya SS Mobile se, koi jhanjhat nahi hua",
    "Purana mobile dekar baki amount easy EMI par karwa liya SS Mobile Ashok Nagar mein",
    "Purane 4G phone ke badle naya 5G handset SS Mobile se bahut achhe exchange bonus mein mila",
    "Bina kisi hidden deduction ke purane phone ka poora daam naye bill mein adjust ho gaya",
    "15 minute mein finance EMI aur old phone exchange dono ka kaam SS Mobile par ho gaya",
  ],
  staff: [
    "SS Mobile Ashok Nagar ke staff aur Avinash bhai ka behaviour bahut hi polite aur helpful hai",
    "Yahan ke staff customer ki baat dhyan se sunte hain aur budget ke hisaab se sahi salah dete hain",
    "SS Mobile par billing fast hai aur staff bilkul jaldbazi ya pressure nahi banata",
    "Showroom saaf-suthra hai aur SS Mobile ki team bahut tameez se pesh aati hai",
    "Customer handling aur service ke maamle mein SS Mobile Ashok Nagar 10 on 10 hai",
    "Counter par baithe bhaiya ne bahut aaram se saare doubts clear kiye aur demo dikhaya",
    "Chhota tempered glass lo ya bada Smart TV, yahan har customer ko poori izzat milti hai",
    "Avinash sir khud dhyan dete hain ki har customer ko sahi product aur best rate mile",
    "Naya phone ya TV lene ke baad bhi SS Mobile ka staff har chhoti setting mein madad karta hai",
    "Itna friendly aur supportive staff Ashok Nagar ki kisi aur dukaan mein nahi dekha",
  ],
};

const HI_EXPERIENCES: Record<CategoryCore, readonly string[]> = {
  mobiles: [
    "staff ne Samsung, Vivo, Oppo, Realme aur Redmi ke models side by side dikha kar camera aur battery ka farq samjhaya",
    "seal pack box mere saamne open kiya, IMEI check karwaya aur pakka GST bill diya",
    "zabardasti mehnga phone chipkane ki koshish nahi ki, jo mere kaam ka tha wahi suggest kiya",
    "purane phone se saara data, contacts, photos aur WhatsApp naye phone mein transfer bhi kar diya",
    "online jaisa hi rate mila aur saath mein local dukaan ki wajah se warranty ki tension bhi nahi rahi",
    "0% EMI aur cashback offer ke baare mein bina kisi chhupi shart ke seedhi baat batai",
    "payment se pehle live demo dikhaya aur haatho-haath glass aur cover bhi set kar diya",
    "saare latest 5G brands ek hi chhat ke neeche mil gaye, kahin aur bhatakna nahi pada",
    "phone setup karke Google ID aur SIM sab chalu karke haath mein diya",
    "naye phone ke saath tempered glass aur cover par bhi achha discount de diya",
    "store ke andar hi camera zoom aur portrait mode test karwaya jisse pasand karna aasan ho gaya",
    "saare colour aur RAM variants ready stock mein the toh wait bilkul nahi karna pada",
  ],
  tv_audio: [
    "diwar par lage Smart TVs mein 4K video chala kar picture quality aur brightness live check karwayi",
    "Home Theater aur Bluetooth speakers ka bass aur sound clarity showroom mein hi baja kar dikhaya",
    "yahan saare top brands ke Smart LED TV, Google TV, soundbars aur speakers ek hi jagah mil jaate hain",
    "hall ke size ke hisaab se kaunsa TV inch aur kitne watt ka home theater sahi rahega yeh achhe se bataya",
    "seal pack TV box, company warranty aur pakke bill ke saath market se sasta rate lagaya",
    "Bluetooth speaker aur party box mein itne saare models the ki pasand karna aasan ho gaya",
    "Smart TV mein YouTube, Wi-Fi aur mobile screen mirroring kaise chalana hai woh bhi samjha diya",
    "TV aur Home Theater dono par easy EMI facility mil gayi, kaam 15 minute mein ho gaya",
    "woofer ka bass itna tagda hai ki ghar mein theatre jaisa maza aa raha hai",
    "TV pack karne se pehle screen chalu karke poori tasalli karwayi aur wall-mount ki jankari bhi di",
    "Smart TV ke saath soundbar lene par bahut badiya combo discount bana kar diya",
    "chhote portable speaker se lekar bade DJ tower speaker tak har budget mein options dikhaye",
  ],
  accessories: [
    "tempered glass itni safai se lagaya ki ek bhi bubble ya dhool ka nishaan nahi aaya",
    "covers ki quality haath mein pakad ke hi pata chalti hai, sasta local maal nahi rakhte",
    "mere phone ka model dekh kar bilkul sahi watt wala original fast charger diya",
    "earbuds, neckband aur Bluetooth speaker lene se pehle awaaz aur mic aaram se check karne diya",
    "power bank, data cable aur back covers mein kaafi naye aur trendy designs dekhne ko mile",
    "market ke hisaab se rate kaafi wajib laga aur warranty card bhi saath mein diya",
    "5 minute mein screen guard aur camera ring dono ekdum barabar fit kar diye",
    "charging port aur speaker grill bhi free mein saaf karke tempered glass lagaya",
    "smartwatch aur earbuds ko mere phone se connect karke saare features samjha diye",
    "UV curved glass itne dhyan se lagaya ki cover lagane par bhi kinare se nahi uthta",
  ],
  repair: [
    "counter par hi phone check karke pehle sahi kharcha bataya, baad mein koi extra paisa nahi maanga",
    "screen change hone ke baad touch aur display bilkul naye phone jaisa smooth chal raha hai",
    "motherboard ka daraawa dekar lamba bill nahi banaya, sirf jo part kharab tha wahi theek kiya",
    "battery badalne ke baad charging speed aur call audio mere saamne check karwake tasalli karwayi",
    "repairing ke dauran mere phone ke saare photos aur personal data bilkul safe rahe",
    "jo time bola tha usi time par phone ready karke de diya, baar-baar chakkar nahi katwaye",
    "charging jack ek ghante mein theek kar diya, ab fast charging ekdum barabar ho rahi hai",
    "display fitting itni neat ki hai ki side se kahin bhi glue ya gap nazar nahi aata",
    "speaker aur mic saaf karke theek kar diya jisse naya part dalwane ka kharcha bach gaya",
    "repair ke baad upar se naya tempered glass bhi laga kar diya",
  ],
  exchange: [
    "purana phone mere saamne check kiya aur bina faltu kamiyan nikaale bahut achha daam lagaya",
    "exchange ka paisa seedha naye phone ke bill mein minus ho gaya, koi confusion nahi raha",
    "jab tak maine apna WhatsApp backup liya tab tak staff ne wait kiya aur fir phone reset karwaya",
    "online exchange mein jitna dikha raha tha usse behtar value mujhe SS Mobile par mil gayi",
    "20 minute ke andar purana phone dekar naya 5G phone haath mein aa gaya",
    "exchange ke saath baki paise par 0% EMI bhi aaram se ho gayi",
    "purane phone se SIM aur data nikaal kar mere saamne factory reset kiya jisse privacy safe rahi",
    "exchange bonus aur store discount mila kar naya phone kaafi saste mein pad gaya",
  ],
  staff: [
    "itne sawaal poochne par bhi staff ne muskura kar jawab diya, bilkul aalas nahi dikhaya",
    "chhota saman lo ya bada TV-mobile, har customer ko barabar izzat dete hain",
    "billing ekdum saaf rakhte hain, koi faltu chhupa hua charge bill mein nahi jodte",
    "phone setup hote time baithne ko kaha aur paani bhi poocha, yeh vyavhaar bahut achha laga",
    "Marathi, Hindi aur English teeno mein aaram se samjha dete hain",
    "shaam ke rush mein bhi bina jaldbazi ke tasalli se poora demo dikhaya",
    "Avinash bhai aur unki team customer ki zaroorat samajh kar hi sahi model suggest karte hain",
    "bill banne ke baad bhi poora data transfer aur app setup khud karke diya",
  ],
};

const HI_EXTRAS: readonly string[] = [
  "Yahan saare brands ke Smart TV, Bluetooth speakers aur Home Theater bhi bahut badiya rate mein milte hain.",
  "Saath hi covers, fast chargers, neckband aur earbuds ki variety bhi kaafi badi hai.",
  "Easy EMI aur purane phone par exchange offer ki wajah se budget ki koi dikkat nahi aati.",
  "Pakka GST bill aur company warranty milti hai toh poora bharosa rehta hai.",
  "Ashok Nagar mein main road par hi shop hai toh aana-jaana bhi ekdum aasan hai.",
  "Naya mobile lena ho, ghar ke liye LED TV aur speaker lena ho ya repairing ka kaam ho — sab ek hi jagah ho jata hai.",
  "Saare top brands ek hi dukaan mein mil jaate hain toh shahar ke traffic mein jaane ki zaroorat nahi padti.",
  "Showroom mein TV aur speakers ka live demo dekh kar kharidne ka maza hi alag hai.",
  "Cash, UPI, Card aur Bajaj Finance EMI sabhi options aaram se available hain.",
];

const HI_CLOSERS: readonly string[] = [
  "Ashok Nagar mein mobile, TV ya speaker lena ho toh aankh band karke SS Mobile jao.",
  "Dil se 5 star, agli baar bhi shopping yahin se karenge.",
  "Sahi daam, asli saman aur badiya vyavhaar — aur kya chahiye!",
  "Apne doston aur family ko bhi main SS Mobile Ashok Nagar hi recommend karunga.",
  "Local showroom par aisi VIP service dekh kar bahut achha laga.",
  "Paisa vasool experience raha, poori tarah satisfied hoon.",
  "Online ke chakkar mein padne se achha seedha SS Mobile par aao.",
  "Service aur bharose ke maamle mein SS Mobile Ashok Nagar best hai.",
  "Thank you Avinash bhai aur SS Mobile team itni achhi service ke liye!",
  "Nashik Ashok Nagar mein electronics aur mobile ke liye isse badiya jagah nahi milegi.",
  "Full 5-star rating meri taraf se, zaroor visit karein!",
  "Saman bhi original mila aur vyavhaar bhi lajawab — bahut khush hoon.",
];

// ============================================================================
// 3. MARATHI KNOWLEDGE BASE (Natural Nashik / Maharashtra Marathi in Devanagari)
// ============================================================================

const MR_OPENERS: Record<CategoryCore | "general", readonly string[]> = {
  general: [
    "आज अशोक नगर मधील SS Mobile ला भेट दिली, अनुभव अतिशय उत्तम होता",
    "अशोक नगर, नाशिक मध्ये मोबाईल, स्मार्ट टीव्ही आणि स्पीकर्ससाठी SS Mobile हे सर्वात खात्रीशीर दुकान आहे",
    "मित्राच्या सांगण्यावरून SS Mobile मध्ये आलो होतो आणि खरोखरच खूप छान सेवा मिळाली",
    "SS Mobile मध्ये खरेदी करण्याचा अनुभव नेहमीच छान आणि विश्वासू असतो",
    "अशोक नगर मध्ये ओरिजिनल मोबाईल आणि इलेक्ट्रॉनिक्स घ्यायचे असतील तर SS Mobile सर्वोत्तम पर्याय आहे",
    "आमच्या घरातील सर्व मोबाईल आणि टीव्ही आम्ही SS Mobile मधूनच घेतो, पूर्ण विश्वास आहे",
    "ऑनलाईन मागवण्यापेक्षा SS Mobile अशोक नगर मध्ये प्रत्यक्ष पाहून खरेदी करणे कधीही चांगले",
    "एकाच छताखाली सर्व ब्रँडचे मोबाईल, स्मार्ट टीव्ही, होम थिएटर आणि रिपेअरिंग मिळणारे अशोक नगरमधील नंबर १ शोरूम",
    "आज संध्याकाळी SS Mobile मधून खरेदी केली, रेट आणि सर्विस दोन्ही एक नंबर आहे",
    "SS Mobile अशोक नगर मध्ये नेहमीच नवीन मॉडेल्स आणि चांगल्या ऑफर्स पाहायला मिळतात",
    "नाशिकच्या अशोक नगर भागात मोबाईल आणि इलेक्ट्रॉनिक्स खरेदीसाठी SS Mobile सारखे दुसरे दुकान नाही",
    "गेल्या अनेक वर्षांपासून आम्ही SS Mobile मधूनच खरेदी करतो, नेहमीच उत्तम अनुभव येतो",
    "योग्य सल्ला आणि प्रामाणिक दरासाठी अशोक नगरमधील SS Mobile ला नक्की भेट द्या",
    "कुटुंबासोबत आज SS Mobile अशोक नगर मध्ये खरेदीसाठी आलो होतो, खूप छान वाटले",
    "मोबाईल असो वा घरातील स्मार्ट टीव्ही आणि स्पीकर, SS Mobile मध्ये सर्व काही एकाच ठिकाणी मिळते",
    "कमी बजेटमध्ये सर्वोत्तम वस्तू देणारे अशोक नगरमधील हक्काचे दुकान म्हणजे SS Mobile",
  ],
  mobiles: [
    "आज SS Mobile अशोक नगर मधून नवीन 5G स्मार्टफोन खरेदी केला",
    "माझा नवीन मोबाईल SS Mobile मधून घेतला, खूपच मस्त डील मिळाली",
    "घरच्यांसाठी SS Mobile अशोक नगर मधून नवीन स्मार्टफोन घेतला",
    "माझ्या बजेटमध्ये बसणारा उत्तम कॅमेरा फोन मला SS Mobile मध्ये मिळाला",
    "मला हवा असलेला मोबाईल मॉडेल आणि कलर SS Mobile मध्ये लगेच स्टॉकमध्ये मिळाला",
    "नवीन हँडसेट घेण्यासाठी SS Mobile मध्ये गेलो होतो, मार्केटपेक्षा खूप चांगला रेट मिळाला",
    "Samsung, Vivo, Oppo, Redmi आणि iPhone सर्व ब्रँडचे फोन तुलना करून SS Mobile मधून फायनल केला",
    "सोप्या EMI वर SS Mobile अशोक नगर मधून नवीन स्मार्टफोन घेतला",
    "बहिणीला गिफ्ट देण्यासाठी SS Mobile मधून नवीन मोबाईल घेतला, तिला खूप आवडला",
    "पहिल्यांदाच SS Mobile मधून फोन घेतला आणि अनुभव ५-स्टार राहिला",
    "वडिलांसाठी मोठ्या बॅटरीचा आणि चांगल्या आवाजाचा नवीन फोन SS Mobile मधून घेतला",
    "दोन्ही मुलांच्या कॉलेजसाठी SS Mobile अशोक नगर मधून नवीन 5G मोबाईल घेतले",
    "झिरो डाऊन पेमेंट EMI वर मला हवा असलेला स्मार्टफोन SS Mobile मध्ये लगेच मिळाला",
    "Realme आणि OnePlus चे लेटेस्ट मॉडेल्स प्रत्यक्ष पाहून SS Mobile मधून खरेदी केले",
    "नवीन कॅमेरा आणि गेमिंग स्मार्टफोन घेण्यासाठी SS Mobile अशोक नगर सर्वोत्तम ठिकाण आहे",
  ],
  tv_audio: [
    "SS Mobile अशोक नगर मधून घरासाठी नवीन Smart LED TV खरेदी केला",
    "आज SS Mobile मधून 4K Android Smart TV आणि Home Theater घेतला",
    "SS Mobile अशोक नगर मधून जबरदस्त बेस असलेला Bluetooth Speaker आणि Soundbar घेतला",
    "घरातील हॉलसाठी नवीन स्मार्ट टीव्ही आणि वूफर स्पीकर घेण्यासाठी SS Mobile मध्ये आलो होतो",
    "SS Mobile मध्ये सर्व नामांकित ब्रँड्सचे Smart TV, पार्टी स्पीकर्स आणि होम थिएटर एकाच ठिकाणी पाहायला मिळाले",
    "नवीन Google TV आणि 5.1 Home Theater मला SS Mobile अशोक नगर मध्ये खूपच योग्य दरात मिळाला",
    "मोठ्या आवाजाचा आणि कडक बेस असलेला स्पीकर SS Mobile मधून घेतला, साऊंड क्वालिटी एक नंबर आहे",
    "स्मार्ट टीव्ही घेण्याआधी ३-४ दुकाने पाहिली, पण सर्वात चांगला रेट आणि लाईव्ह डेमो SS Mobile मध्येच मिळाला",
    "SS Mobile अशोक नगर हे फक्त मोबाईलसाठीच नाही तर Smart TV आणि Home Theater साठी सुद्धा बेस्ट शोरूम आहे",
    "बजाज फायनान्स EMI वर नवीन LED TV आणि ब्लूटूथ स्पीकर SS Mobile मधून सहज मिळाला",
    "३२ इंच, ४३ इंच आणि ५५ इंच Smart TV चे सर्व ब्रँड्स SS Mobile अशोक नगर मध्ये हजर स्टॉकमध्ये मिळाले",
    "कॅराओके माईक असलेला मोठा पार्टी स्पीकर SS Mobile मधून घेतला, घरातील कार्यक्रमासाठी खूपच छान आहे",
    "जुन्या टीव्हीच्या जागी नवीन 4K Google TV आम्ही SS Mobile अशोक नगर मधून घेतला",
    "डॉल्बी साऊंडबार आणि वूफर होम थिएटरची साऊंड टेस्ट घेऊन SS Mobile मधून खरेदी केली",
    "छोट्या ब्लूटूथ स्पीकरपासून मोठ्या टॉवर स्पीकरपर्यंत सर्व प्रकार SS Mobile मध्ये उपलब्ध आहेत",
  ],
  accessories: [
    "SS Mobile अशोक नगर मधून फोनसाठी नवीन बॅक कव्हर आणि टेम्पर्ड ग्लास बसवून घेतला",
    "ओरिजिनल फास्ट चार्जर आणि केबल घेण्यासाठी SS Mobile मध्ये आलो होतो",
    "मोबाईल कव्हर्स, इयरबड्स आणि नेकबँडच्या बाबतीत SS Mobile चे कलेक्शन खूपच भारी आहे",
    "SS Mobile मधून ब्लूटूथ नेकबँड आणि स्क्रीन गार्ड घेतला, क्वालिटी एकदम मजबूत आहे",
    "नवीन फोनसाठी स्टायलिश कव्हर आणि कॅमेरा लेन्स प्रोटेक्टर SS Mobile मधून घेतला",
    "योग्य दरात चांगल्या क्वालिटीचे कव्हर्स, स्मार्टवॉच आणि इयरफोन्स SS Mobile मध्ये मिळाले",
    "मॅट टेम्पर्ड ग्लास आणि फास्ट अडॅप्टर SS Mobile अशोक नगर मधून घेतला",
    "पॉवर बँक, चार्जर आणि वायरलेस इयरबड्सवर SS Mobile मध्ये चांगली सवलत मिळाली",
    "कर्व्ह डिस्प्ले फोनसाठी UV ग्लास SS Mobile अशोक नगर मध्ये अतिशय सफाईने बसवून मिळाला",
    "कॉलिंग स्मार्टवॉच आणि नवीन TWS इयरबड्स घेण्यासाठी SS Mobile ला भेट दिली",
    "२०००० mAh ची फास्ट चार्जिंग पॉवर बँक आणि ओरिजिनल डेटा केबल SS Mobile मधून घेतली",
    "कार चार्जर, मोबाईल स्टँड आणि मेमरी कार्ड सर्व वस्तू योग्य दरात SS Mobile मध्ये मिळाल्या",
  ],
  repair: [
    "माझा मोबाईल रिपेअर करण्यासाठी SS Mobile अशोक नगर मध्ये दिला होता",
    "SS Mobile मध्ये फुटलेली मोबाईल स्क्रीन बदलून घेतली, काम अगदी ओरिजिनलसारखे झाले",
    "फोनमध्ये चार्जिंगचा प्रॉब्लेम होता, SS Mobile मध्ये १ तासाच्या आत व्यवस्थित करून मिळाला",
    "मोबाईलची बॅटरी SS Mobile अशोक नगर मधून नवीन टाकून घेतली",
    "फोनचा स्पीकर आणि माईकचा आवाज येत नव्हता, SS Mobile मध्ये लगेच दुरुस्त करून दिला",
    "अशोक नगर मध्ये प्रामाणिकपणे मोबाईल रिपेअरिंग करणारे SS Mobile हे अतिशय खात्रीशीर ठिकाण आहे",
    "अर्जंट फोन दुरुस्त करायचा होता आणि SS Mobile च्या टीमने त्याच दिवशी फोन रेडी करून दिला",
    "पाणी गेल्यामुळे फोन बंद पडला होता, SS Mobile मध्ये कमी खर्चात पुन्हा चालू करून मिळाला",
    "फोनचे पॉवर बटन आणि व्हॉल्यूम बटन ३० मिनिटांत SS Mobile मध्ये दुरुस्त करून मिळाले",
    "फोनमधील एकही फोटो किंवा डेटा डिलीट न होऊ देता SS Mobile मध्ये माझा फोन रिपेअर करून दिला",
    "नवीन डिस्प्ले कॉम्बो बसवल्यानंतर फिंगरप्रिंट आणि टच अगदी पहिल्यासारखा फास्ट चालत आहे",
  ],
  exchange: [
    "माझा जुना फोन SS Mobile अशोक नगर मध्ये एक्सचेंज करून नवीन 5G मोबाईल घेतला",
    "जुना मोबाईल देऊन नवीन फोन घेण्यासाठी SS Mobile ही सर्वात उत्तम जागा आहे",
    "जुन्या हँडसेटला SS Mobile मध्ये खूप चांगली एक्सचेंज किंमत मिळाली",
    "SS Mobile अशोक नगर मध्ये फोन एक्सचेंज आणि EMI ची प्रोसेस एकदम सोपी आणि जलद आहे",
    "माझा २ वर्ष जुना फोन SS Mobile मध्ये एक्सचेंज केला, ऑनलाईनपेक्षा जास्त रेट मिळाला",
    "जुना फोन देऊन उरलेली रक्कम सोप्या EMI वर करून नवीन स्मार्टफोन घरी नेला",
    "जुन्या 4G फोनच्या बदल्यात नवीन 5G स्मार्टफोन घेताना SS Mobile मध्ये चांगला एक्सचेंज बोनस मिळाला",
    "कोणतीही कपात न करता जुन्या फोनची ठरलेली पूर्ण किंमत नवीन बिलातून वजा करून दिली",
  ],
  staff: [
    "SS Mobile अशोक नगर मधील स्टाफ आणि अविनाश दादांचे बोलणे अतिशय नम्र आणि मदतशीर आहे",
    "येथील स्टाफ ग्राहकांची गरज समजून घेऊन बजेटनुसार योग्य सल्ला देतो",
    "SS Mobile मध्ये बिलिंग खूप फास्ट होते आणि स्टाफ कोणतीही घाई करत नाही",
    "दुकान एकदम स्वच्छ आहे आणि SS Mobile ची संपूर्ण टीम खूप आदराने वागते",
    "ग्राहक सेवेच्या बाबतीत SS Mobile अशोक नगर ला १० पैकी १० गुण आहेत",
    "काउंटरवरील स्टाफने खूप शांतपणे सर्व माहिती दिली आणि फोनचा डेमो दाखवला",
    "अविनाश दादा स्वतः प्रत्येक ग्राहकाला योग्य वस्तू आणि चांगला दर मिळतोय का याकडे लक्ष देतात",
    "नवीन मोबाईल किंवा टीव्ही घेतल्यानंतरही सेटिंग्स समजून सांगण्यासाठी येथील स्टाफ नेहमी तयार असतो",
  ],
};

const MR_EXPERIENCES: Record<CategoryCore, readonly string[]> = {
  mobiles: [
    "स्टाफने २-३ मॉडेल्स समोरासमोर ठेवून कॅमेरा, बॅटरी आणि प्रोसेसरमधील फरक व्यवस्थित समजावून सांगितला",
    "माझ्यासमोरच सील पॅक बॉक्स उघडून दाखवला, IMEI चेक केला आणि पक्के GST बिल दिले",
    "उगाच महागडा फोन घेण्याचा आग्रह न करता माझ्या बजेटमध्ये सर्वात चांगला फोन सुचवला",
    "जुन्या फोनमधील सर्व कॉन्टॅक्ट्स, फोटो आणि WhatsApp डेटा नवीन फोनमध्ये ट्रान्सफर करून दिला",
    "ऑनलाईन ऑफर्सइतकाच चांगला रेट मिळाला आणि स्थानिक दुकान असल्यामुळे वॉरंटीचीही पूर्ण खात्री मिळाली",
    "झिरो डाऊन पेमेंट EMI आणि कॅशबॅक ऑफर्सबद्दल अगदी स्पष्ट माहिती दिली",
    "सर्व नामांकित ब्रँड्सचे लेटेस्ट 5G मोबाईल एकाच ठिकाणी उपलब्ध असल्यामुळे दुसरीकडे जावे लागले नाही",
    "फोन अनबॉक्स करून लगेच स्क्रीन गार्ड आणि कव्हरही नीट बसवून दिले",
    "नवीन फोनमध्ये Google अकाउंट, सिम कार्ड आणि सर्व आवश्यक अ‍ॅप्स चालू करून हातात दिले",
    "मला हवा असलेला कलर आणि रॅम व्हेरिएंट लगेच उपलब्ध होता, त्यामुळे थांबावे लागले नाही",
    "शोरूममध्येच कॅमेरा झूम आणि डिस्प्ले क्वालिटी टेस्ट करून पाहता आली",
  ],
  tv_audio: [
    "भिंतीवर लावलेल्या Smart TV वर 4K व्हिडिओ लावून पिक्चर क्वालिटी आणि आवाज प्रत्यक्ष दाखवला",
    "होम थिएटर आणि ब्लूटूथ स्पीकर्सचा बेस आणि साऊंड क्लिअरिटी शोरूममध्येच वाजवून दाखवली",
    "येथे सर्व ब्रँड्सचे Smart LED TV, Google TV, साऊंडबार आणि होम थिएटर योग्य दरात मिळतात",
    "आमच्या हॉलच्या आकारानुसार किती इंचाचा टीव्ही आणि कोणता होम थिएटर योग्य राहील हे छान सांगितले",
    "सील पॅक टीव्ही बॉक्स, कंपनी वॉरंटी आणि पक्क्या बिलासह मार्केटपेक्षा कमी दरात डील मिळाली",
    "छोट्या पोर्टेबल स्पीकरपासून ते मोठ्या पार्टी टॉवर स्पीकरपर्यंत खूप मोठी व्हरायटी येथे आहे",
    "Smart TV मध्ये YouTube, व्हॉइस सर्च आणि मोबाईल कनेक्ट कसा करायचा हे सुद्धा शिकवले",
    "टीव्ही आणि होम थिएटर दोन्हीवर सोप्या हप्त्यांची (EMI) सोय उपलब्ध करून दिली",
    "वूफरचा बेस इतका जबरदस्त आहे की घरातच थिएटरसारखा अनुभव मिळत आहे",
    "टीव्ही पॅक करण्याआधी स्क्रीन चालू करून पूर्ण खात्री करून दिली आणि वॉल-माऊंटबद्दलही माहिती दिली",
    "Smart TV सोबत साऊंडबार घेतल्यावर खूप चांगली कॉम्बो डिस्काउंट ऑफर दिली",
  ],
  accessories: [
    "टेम्पर्ड ग्लास इतक्या सफाईने लावला की एकही बबल किंवा धुळीचा कण राहिला नाही",
    "बॅक कव्हर्सची क्वालिटी हातात घेतल्यावरच समजते, खूप मजबूत आणि नवीन डिझाईन्स आहेत",
    "माझ्या मोबाईल मॉडेलनुसार अगदी योग्य वॅटचा ओरिजिनल फास्ट चार्जर दिला",
    "नेकबँड, इयरबड्स आणि स्पीकर घेण्याआधी आवाज आणि माईक टेस्ट करून पाहू दिला",
    "पॉवर बँक, डेटा केबल आणि कव्हर्समध्ये भरपूर व्हरायटी आणि ब्रँड वॉरंटी मिळाली",
    "५ मिनिटांत स्क्रीन गार्ड आणि कॅमेरा लेन्स रिंग एकदम परफेक्ट बसवून दिली",
    "टेम्पर्ड ग्लास लावताना फोनचा चार्जिंग पोर्ट आणि स्पीकर सुद्धा मोफत साफ करून दिला",
    "स्मार्टवॉच आणि ब्लूटूथ इयरबड्स माझ्या फोनला जोडून सर्व फीचर्स समजावून सांगितले",
  ],
  repair: [
    "काउंटरवरच फोन तपासून आधीच योग्य खर्च सांगितला, नंतर कोणतेही जास्तीचे पैसे घेतले नाहीत",
    "नवीन डिस्प्ले बसवल्यानंतर टच आणि कलर अगदी ओरिजिनल फोनसारखे स्मूथ चालत आहेत",
    "मदरबोर्ड खराब आहे असे सांगून मोठे बिल न बनवता, जो छोटा पार्ट खराब होता तोच बदलला",
    "बॅटरी बदलल्यानंतर चार्जिंग स्पीड आणि कॉलिंग आवाज माझ्यासमोरच चेक करून खात्री करून दिली",
    "रिपेअरिंग करताना माझ्या फोनमधील सर्व फोटो आणि वैयक्तिक डेटा १००% सुरक्षित राहिला",
    "दिलेल्या वेळेतच फोन दुरुस्त करून दिला, पुन्हा पुन्हा फेऱ्या माराव्या लागल्या नाहीत",
    "डिस्प्ले इतक्या स्वच्छतेने बसवला की बाजूला कुठेही गम किंवा फट दिसत नाही",
    "रिपेअरिंग पूर्ण झाल्यावर वरून नवीन स्क्रीन गार्ड सुद्धा व्यवस्थित लावून दिला",
  ],
  exchange: [
    "माझा जुना फोन समोरच चेक करून कोणतीही विनाकारण तक्रार न करता उत्तम किंमत दिली",
    "एक्सचेंजचे पैसे थेट नवीन फोनच्या बिलातून वजा केले, कोणताही गोंधळ झाला नाही",
    "माझा WhatsApp बॅकअप पूर्ण होईपर्यंत स्टाफने शांतपणे वाट पाहिली आणि नंतर जुना फोन रिसेट केला",
    "ऑनलाईन एक्सचेंजमध्ये दिसत असलेल्या किमतीपेक्षा जास्त रेट मला SS Mobile मध्ये मिळाला",
    "अवघ्या २० मिनिटांत जुना फोन देऊन नवीन 5G स्मार्टफोन हातात मिळाला",
    "जुन्या फोनची किंमत वजा करून उरलेल्या रकमेवर सोपा EMI लगेच मंजूर करून दिला",
  ],
  staff: [
    "खूप प्रश्न विचारूनही स्टाफने हसतमुखाने उत्तरे दिली, अजिबात कंटाळा केला नाही",
    "छोटी केबल घ्या किंवा मोठा टीव्ही-मोबाईल, प्रत्येक ग्राहकाला सारखाच मान दिला जातो",
    "बिलिंग अतिशय पारदर्शक आहे, बिलामध्ये कोणतेही छुपे चार्जेस लावले जात नाहीत",
    "नवीन फोन सेटअप होईपर्यंत बसायला खुर्ची आणि पाणी विचारले, ही आपुलकी खूप आवडली",
    "मराठी, हिंदी आणि इंग्रजी अशा तिन्ही भाषांमध्ये अगदी सोप्या शब्दांत माहिती देतात",
    "संध्याकाळी गर्दी असतानाही कोणतीही घाई न करता शांतपणे सर्व समजावून सांगितले",
    "बिल झाल्यानंतरही १५ मिनिटे वेळ देऊन नवीन फोनचे सर्व सेटिंग्स करून दिले",
  ],
};

const MR_EXTRAS: readonly string[] = [
  "येथे सर्व ब्रँड्सचे Smart TV, ब्लूटूथ स्पीकर्स आणि Home Theater सुद्धा खूप चांगल्या किमतीत मिळतात.",
  "तसेच कव्हर्स, फास्ट चार्जर्स, नेकबँड आणि इयरबड्सची खूप मोठी व्हरायटी उपलब्ध आहे.",
  "सोपी EMI सुविधा आणि जुन्या फोनवर एक्सचेंज ऑफर असल्यामुळे बजेटची अजिबात काळजी राहत नाही.",
  "पक्के GST बिल आणि अधिकृत कंपनी वॉरंटी मिळत असल्यामुळे मनात कोणतीही शंका राहत नाही.",
  "अशोक नगरमध्ये मुख्य रस्त्यावरच दुकान असल्यामुळे शोधायला आणि पार्किंगला खूप सोयीचे आहे.",
  "नवीन मोबाईल, घरासाठी स्मार्ट टीव्ही, स्पीकर किंवा रिपेअरिंग — सर्व कामे एकाच ठिकाणी होतात.",
  "सर्व नामांकित ब्रँड्स एकाच छताखाली मिळत असल्यामुळे शहरात लांब जाण्याची गरज भासत नाही.",
  "टीव्ही आणि होम थिएटरचा लाईव्ह डेमो पाहून खरेदी करता येते ही खूप चांगली गोष्ट आहे.",
  "रोख पेमेंटसोबतच UPI, कार्ड आणि बजाज फायनान्स EMI ची सुविधाही लगेच उपलब्ध आहे.",
];

const MR_CLOSERS: readonly string[] = [
  "अशोक नगर मध्ये मोबाईल, टीव्ही किंवा स्पीकर घ्यायचा असेल तर नक्कीच SS Mobile ला भेट द्या.",
  "मनापासून ५ स्टार! पुढच्या वेळीही खरेदी इथूनच करणार.",
  "योग्य दर, ओरिजिनल वस्तू आणि आपुलकीची सेवा — अजून काय हवे!",
  "माझ्या सर्व मित्रांना आणि नातेवाईकांना मी SS Mobile अशोक नगरच सुचवेन.",
  "आपल्या भागातील दुकानात इतकी छान आणि व्यावसायिक सेवा पाहून खूप आनंद झाला.",
  "पूर्णपणे पैसा वसूल अनुभव, सेवेबद्दल १००% समाधानी आहे.",
  "ऑनलाईनच्या नादी लागण्यापेक्षा थेट SS Mobile अशोक नगर मध्ये येऊन खरेदी करा.",
  "विश्वास आणि उत्तम सेवेसाठी SS Mobile अशोक नगर हेच सर्वोत्तम ठिकाण आहे.",
  "उत्तम सेवेबद्दल अविनाश दादा आणि SS Mobile टीमचे खूप खूप आभार!",
  "अशोक नगर, नाशिक मधील मोबाईल आणि इलेक्ट्रॉनिक्ससाठी सर्वात बेस्ट शोरूम!",
  "माझ्याकडून पूर्ण ५-स्टार रेटिंग, नक्कीच एकदा भेट देऊन पहा.",
];

// ============================================================================
// Curated standalone reviews
// ============================================================================

const STANDALONE_EN: readonly Review[] = [
  { id: "s-en-1", cat: "mobiles", lang: "en", text: "Bought a new 5G phone from SS Mobile Ashok Nagar today. The staff compared models honestly, unboxed it in front of me, and completed the GST billing in minutes. Very trustworthy store." },
  { id: "s-en-2", cat: "tv_audio", lang: "en", text: "Purchased a 4K Smart LED TV and a Bluetooth Home Theater from SS Mobile Ashok Nagar. They gave a full live sound and picture demo, offered the best rate in Nashik, and arranged easy EMI." },
  { id: "s-en-3", cat: "accessories", lang: "en", text: "Stopped by SS Mobile for a tempered glass, cover and Bluetooth neckband. Zero bubbles on the screen guard, sturdy case quality, and very fair pricing." },
  { id: "s-en-4", cat: "repair", lang: "en", text: "Got my phone's broken display fixed at SS Mobile Ashok Nagar. They quoted the exact price upfront, kept my data safe, and handed the phone back the same evening looking brand new." },
  { id: "s-en-5", cat: "exchange", lang: "en", text: "Upgraded my old handset at SS Mobile through exchange. They checked the phone on the counter, gave a better buyback rate than online apps, and adjusted it straight into the new bill." },
  { id: "s-en-6", cat: "staff", lang: "en", text: "What stands out at SS Mobile Ashok Nagar is how patiently Avinash sir and the staff talk to customers. From mobiles to Smart TVs and speakers, they guide you honestly." },
];

const STANDALONE_HI: readonly Review[] = [
  { id: "s-hi-1", cat: "mobiles", lang: "hinglish", text: "SS Mobile Ashok Nagar se aaj naya 5G phone liya. Bhaiya ne budget ke hisaab se sahi model dikhaya, purane phone ka saara data transfer kar diya aur rate bhi online se badiya lagaya. Full 5 star!" },
  { id: "s-hi-2", cat: "tv_audio", lang: "hinglish", text: "Ghar ke liye naya Smart LED TV aur Home Theater SS Mobile Ashok Nagar se liya. Saare brands ek hi jagah mil gaye, awaaz aur picture ka live demo dikhaya aur rate bhi sabse sahi lagaya." },
  { id: "s-hi-3", cat: "accessories", lang: "hinglish", text: "Apne phone ke liye tempered glass, cover aur Bluetooth speaker SS Mobile se liya. Glass ekdum safai se bina bubble ke lagaya aur speaker ka bass bhi zabardast hai." },
  { id: "s-hi-4", cat: "repair", lang: "hinglish", text: "Phone ki charging aur display problem ke liye SS Mobile Ashok Nagar gaya tha. Bina faltu kharcha bataye same day phone ekdum naye jaisa theek karke de diya." },
  { id: "s-hi-5", cat: "exchange", lang: "hinglish", text: "Purana mobile dekar SS Mobile se naya handset liya. Counter par hi check karke achha exchange rate diya aur seedha bill mein minus kar diya. Koi jhanjhat nahi hua." },
  { id: "s-hi-6", cat: "staff", lang: "hinglish", text: "SS Mobile Ashok Nagar ka staff bahut tameez se baat karta hai. Chahe chhota cover lena ho, naya phone ya Smart TV, poora time dekar samjhate hain." },
];

const STANDALONE_MR: readonly Review[] = [
  { id: "s-mr-1", cat: "mobiles", lang: "mr", text: "आज SS Mobile अशोक नगर मधून नवीन 5G स्मार्टफोन घेतला. स्टाफने बजेटनुसार योग्य मॉडेल सुचवले, जुन्या फोनमधील सर्व डेटा ट्रान्सफर करून दिला आणि मार्केटपेक्षा चांगला रेट लावला. नक्की भेट द्या!" },
  { id: "s-mr-2", cat: "tv_audio", lang: "mr", text: "घरासाठी नवीन Smart LED TV आणि Home Theater आम्ही SS Mobile अशोक नगर मधून घेतला. सर्व ब्रँडचे टीव्ही आणि स्पीकर्स एकाच ठिकाणी पाहायला मिळाले आणि सोप्या EMI वर काम झाले." },
  { id: "s-mr-3", cat: "accessories", lang: "mr", text: "SS Mobile मधून मोबाईलसाठी टेम्पर्ड ग्लास, कव्हर आणि ब्लूटूथ नेकबँड घेतला. ग्लास एकही बबल न ठेवता लावून दिला आणि वस्तूंची क्वालिटी एकदम ओरिजिनल आहे." },
  { id: "s-mr-4", cat: "repair", lang: "mr", text: "माझ्या फोनचा डिस्प्ले आणि चार्जिंग प्रॉब्लेम SS Mobile अशोक नगर मध्ये तासाभरात दुरुस्त करून मिळाला. प्रामाणिक काम आणि योग्य दर, फोनमधील सर्व डेटा सुरक्षित राहिला." },
  { id: "s-mr-5", cat: "exchange", lang: "mr", text: "जुना मोबाईल एक्सचेंज करून SS Mobile मधून नवीन फोन घेतला. ऑनलाईनपेक्षा जास्त एक्सचेंज किंमत मिळाली आणि २० मिनिटांत सर्व प्रोसेस पूर्ण झाली." },
  { id: "s-mr-6", cat: "staff", lang: "mr", text: "SS Mobile अशोक नगर मधील स्टाफ आणि अविनाश दादा खूप आपुलकीने मार्गदर्शन करतात. मोबाईल, स्मार्ट टीव्ही आणि स्पीकर्सच्या खरेदीसाठी नाशिकमधील सर्वात खात्रीशीर ठिकाण!" },
];

function capFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/**
 * Generates a fresh, natural-sounding review across 8 distinct structural patterns
 * in English, Hinglish, or Marathi (Devanagari), yielding tens of millions of unique combinations.
 */
export function synthesizeSmartReview(
  cat: CategoryId,
  lang: Lang,
  usedIds: Set<string>,
  usedTexts: string[]
): { text: string; id: string } {
  const allCats: CategoryCore[] = [
    "mobiles",
    "tv_audio",
    "accessories",
    "repair",
    "exchange",
    "staff",
  ];

  for (let attempt = 0; attempt < 60; attempt++) {
    const primaryCat: CategoryCore = cat === "all" ? pick(allCats) : cat;
    const useGeneralOpener = cat === "all" ? Math.random() < 0.45 : Math.random() < 0.22;
    const style = Math.floor(Math.random() * 8); // 8 structural templates for massive variety

    let text = "";

    if (lang === "en") {
      const openerPool = useGeneralOpener ? EN_OPENERS.general : EN_OPENERS[primaryCat];
      const opener = pick(openerPool);
      const closer = pick(EN_CLOSERS);
      const extra = pick(EN_EXTRAS);

      if (style === 0) {
        const exp = pick(EN_EXPERIENCES[primaryCat]);
        text = `${opener}, and ${exp}. ${closer}`;
      } else if (style === 1 && cat === "all") {
        const [c1, c2] = pickTwo(allCats);
        const e1 = pick(EN_EXPERIENCES[c1]);
        const e2 = pick(EN_EXPERIENCES[c2]);
        text = `${opener}. Whether it is smartphones, Smart TVs or service, ${e1}, and ${e2}. ${closer}`;
      } else if (style === 2) {
        const [e1, e2] = pickTwo(EN_EXPERIENCES[primaryCat]);
        text = `${opener}. First off, ${e1}. Also, ${e2}. ${closer}`;
      } else if (style === 3) {
        const exp = pick(EN_EXPERIENCES[primaryCat]);
        text = `${opener}. ${capFirst(exp)}. ${extra} ${closer}`;
      } else if (style === 4) {
        const [e1, e2] = pickTwo(EN_EXPERIENCES[primaryCat]);
        text = `${opener} — ${e1}, plus ${e2}. ${extra} ${closer}`;
      } else if (style === 5) {
        const secondaryCat = pick(allCats.filter((c) => c !== primaryCat));
        const e1 = pick(EN_EXPERIENCES[primaryCat]);
        const e2 = pick(EN_EXPERIENCES[secondaryCat]);
        text = `${opener}. ${capFirst(e1)}. On top of that, ${e2}. ${closer}`;
      } else if (style === 6) {
        const [e1, e2, e3] = pickThree(EN_EXPERIENCES[primaryCat]);
        text = `${opener}. What I liked most is that ${e1}, ${e2}, and ${e3}. ${closer}`;
      } else {
        const exp = pick(EN_EXPERIENCES[primaryCat]);
        text = `${opener}. ${capFirst(exp)}. ${closer}`;
      }
    } else if (lang === "mr") {
      const openerPool = useGeneralOpener ? MR_OPENERS.general : MR_OPENERS[primaryCat];
      const opener = pick(openerPool);
      const closer = pick(MR_CLOSERS);
      const extra = pick(MR_EXTRAS);

      if (style === 0) {
        const exp = pick(MR_EXPERIENCES[primaryCat]);
        text = `${opener}, आणि ${exp}. ${closer}`;
      } else if (style === 1 && cat === "all") {
        const [c1, c2] = pickTwo(allCats);
        const e1 = pick(MR_EXPERIENCES[c1]);
        const e2 = pick(MR_EXPERIENCES[c2]);
        text = `${opener}. येथे ${e1}, तसेच ${e2}. ${closer}`;
      } else if (style === 2) {
        const [e1, e2] = pickTwo(MR_EXPERIENCES[primaryCat]);
        text = `${opener}. सर्वात महत्त्वाचे म्हणजे ${e1}. याशिवाय ${e2}. ${closer}`;
      } else if (style === 3) {
        const exp = pick(MR_EXPERIENCES[primaryCat]);
        text = `${opener}. ${exp}. ${extra} ${closer}`;
      } else if (style === 4) {
        const [e1, e2] = pickTwo(MR_EXPERIENCES[primaryCat]);
        text = `${opener} — ${e1}, आणि सोबतच ${e2}. ${extra} ${closer}`;
      } else if (style === 5) {
        const secondaryCat = pick(allCats.filter((c) => c !== primaryCat));
        const e1 = pick(MR_EXPERIENCES[primaryCat]);
        const e2 = pick(MR_EXPERIENCES[secondaryCat]);
        text = `${opener}. ${e1}. तसेच ${e2}. ${closer}`;
      } else if (style === 6) {
        const [e1, e2] = pickTwo(MR_EXPERIENCES[primaryCat]);
        text = `${opener}. मला सर्वात जास्त आवडलेली गोष्ट म्हणजे ${e1}, आणि ${e2}. ${closer}`;
      } else {
        const exp = pick(MR_EXPERIENCES[primaryCat]);
        text = `${opener}. विशेष म्हणजे ${exp}. ${closer}`;
      }
    } else {
      const openerPool = useGeneralOpener ? HI_OPENERS.general : HI_OPENERS[primaryCat];
      const opener = pick(openerPool);
      const closer = pick(HI_CLOSERS);
      const extra = pick(HI_EXTRAS);

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
      } else if (style === 3) {
        const exp = pick(HI_EXPERIENCES[primaryCat]);
        text = `${opener}. ${capFirst(exp)}. ${extra} ${closer}`;
      } else if (style === 4) {
        const [e1, e2] = pickTwo(HI_EXPERIENCES[primaryCat]);
        text = `${opener} — ${e1}, aur saath mein ${e2}. ${extra} ${closer}`;
      } else if (style === 5) {
        const secondaryCat = pick(allCats.filter((c) => c !== primaryCat));
        const e1 = pick(HI_EXPERIENCES[primaryCat]);
        const e2 = pick(HI_EXPERIENCES[secondaryCat]);
        text = `${opener}. ${capFirst(e1)}. Aur sabse badiya baat ki ${e2}. ${closer}`;
      } else if (style === 6) {
        const [e1, e2, e3] = pickThree(HI_EXPERIENCES[primaryCat]);
        text = `${opener}. Yahan ${e1}, ${e2}, aur ${e3}. ${closer}`;
      } else {
        const exp = pick(HI_EXPERIENCES[primaryCat]);
        text = `${opener}. ${capFirst(exp)}. ${closer}`;
      }
    }

    const id = hashText(text);
    if (!usedIds.has(id) && !tooSimilar(text, usedTexts.slice(-35))) {
      return { text, id };
    }
  }

  // Fallback with timestamp salt guarantees uniqueness even after thousands of runs
  const primaryCat: CategoryCore = cat === "all" ? pick(allCats) : cat;
  const opener =
    lang === "en"
      ? pick(EN_OPENERS[primaryCat])
      : lang === "mr"
      ? pick(MR_OPENERS[primaryCat])
      : pick(HI_OPENERS[primaryCat]);
  const exp =
    lang === "en"
      ? pick(EN_EXPERIENCES[primaryCat])
      : lang === "mr"
      ? pick(MR_EXPERIENCES[primaryCat])
      : pick(HI_EXPERIENCES[primaryCat]);
  const closer =
    lang === "en" ? pick(EN_CLOSERS) : lang === "mr" ? pick(MR_CLOSERS) : pick(HI_CLOSERS);
  const text = `${opener}. ${capFirst(exp)}. ${closer}`;
  return { text, id: hashText(text + Date.now()) };
}

export function listReviews(cat: string, lang: Lang): Review[] {
  const base =
    lang === "hinglish" ? STANDALONE_HI : lang === "mr" ? STANDALONE_MR : STANDALONE_EN;
  return base.filter((r) => cat === "all" || r.cat === cat || r.cat === "all");
}

export function normalizeLang(raw: string | null): Lang {
  if (raw === "mr" || raw === "marathi") return "mr";
  if (raw === "hinglish" || raw === "hi") return "hinglish";
  return "en";
}

export function normalizeCat(raw: string | null): CategoryId {
  const ids: CategoryId[] = [
    "all",
    "mobiles",
    "tv_audio",
    "accessories",
    "repair",
    "exchange",
    "staff",
  ];
  return ids.includes(raw as CategoryId) ? (raw as CategoryId) : "all";
}
