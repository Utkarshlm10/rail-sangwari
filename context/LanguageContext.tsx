"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi_cg";

interface Translations {
  [key: string]: {
    en: string;
    hi_cg: string;
  };
}

export const DICTIONARY: Translations = {
  // Brand & Header
  brandTitle: {
    en: "Rail Sangwari",
    hi_cg: "रेल संगवारी",
  },
  brandTagline: {
    en: "SECR Licensed Station Sahayak",
    hi_cg: "बिलासपुर, रायपुर अउ दुर्ग स्टेशन म आप मन के अपन कुली साथी",
  },
  passengerNav: {
    en: "Passenger View",
    hi_cg: "यात्री पोर्टल",
  },
  verifyBadgeNav: {
    en: "Verify Badge",
    hi_cg: "बिल्ला सत्यापन",
  },
  sahayakAppNav: {
    en: "Sahayak App",
    hi_cg: "कुली साथी पोर्टल",
  },
  supervisorNav: {
    en: "DRM Supervisor",
    hi_cg: "स्टेशन अधीक्षक",
  },
  secrStationsTag: {
    en: "SECR Bilaspur • Raipur • Durg",
    hi_cg: "द.पू.म. रेलवे • बिलासपुर, रायपुर, दुर्ग",
  },

  // Hero Section
  heroTitle: {
    en: "Book your Railway Sahayak",
    hi_cg: "स्टेशन म अपन कुली साथी बुक करव",
  },
  heroDesc: {
    en: "Fixed government rates, coach doorstep pickup, zero haggling.",
    hi_cg: "सरकारी तय दर, बोगी दुवार म सेवा, मोल-भाव के कोनो झंझट नई।",
  },

  // Value Props
  brassBillaValue: {
    en: "Brass Billa",
    hi_cg: "पीतल बिल्ला",
  },
  brassBillaSub: {
    en: "SECR Licensed",
    hi_cg: "रेलवे ले अधिकृत",
  },
  coachDoorValue: {
    en: "Coach Doorstep",
    hi_cg: "बोगी दुवार म",
  },
  coachDoorSub: {
    en: "Direct Pickup",
    hi_cg: "सीधा सेवा",
  },
  fixedRateValue: {
    en: "₹60 / bag",
    hi_cg: "₹६० / बैग",
  },
  fixedRateSub: {
    en: "Govt Rate Card",
    hi_cg: "सरकारी दर सूची",
  },

  // Step 1: PNR
  step1Heading: {
    en: "1. Enter 10-Digit PNR",
    hi_cg: "१. केवल पीएनआर दर्ज करें",
  },
  pnrStep1Label: {
    en: "10-Digit Railway PNR Number",
    hi_cg: "१० अंकों का IRCTC पीएनआर नंबर",
  },
  pnrAutoFetchHint: {
    en: "✓ Auto-fetches Train, Coach & Seat",
    hi_cg: "✓ ट्रेन, बोगी अउ सीट खुद आ जाही",
  },
  pnrPlaceholder: {
    en: "Enter 10-digit PNR",
    hi_cg: "१० अंकों का पीएनआर दर्ज करें",
  },
  fetchBtn: {
    en: "Fetch",
    hi_cg: "खोजें",
  },
  fetchingBtn: {
    en: "Finding...",
    hi_cg: "खोज रहे...",
  },
  pnrVerified: {
    en: "✓ PNR Verified",
    hi_cg: "✓ पीएनआर सत्यापित",
  },
  targetDestination: {
    en: "Coolie Target Destination",
    hi_cg: "कुली का अंतिम गंतव्य",
  },
  routeFrom: {
    en: "From",
    hi_cg: "कहाँ से",
  },
  routeTo: {
    en: "To",
    hi_cg: "कहाँ तक",
  },
  directionLabel: {
    en: "Service Direction",
    hi_cg: "कहाँ से कहाँ ले जाना है",
  },
  arrivalMode: {
    en: "Train Coach → Station Exit",
    hi_cg: "ट्रेन बोगी ले स्टेशन निकास द्वार",
  },
  departureMode: {
    en: "Station Entry → Coach Seat",
    hi_cg: "स्टेशन प्रवेश द्वार ले ट्रेन सीट",
  },
  phoneLabel: {
    en: "Your Mobile Number (for Sahayak WhatsApp / Call)",
    hi_cg: "यात्री मोबाइल नंबर (कुली साथी संपर्क हेतु)",
  },
  phonePlaceholder: {
    en: "e.g. 98270 11200",
    hi_cg: "उदा. 98270 11200",
  },
  continueToLuggage: {
    en: "Choose Luggage →",
    hi_cg: "सामान चुनें →",
  },

  // Step 2: Luggage
  step2Heading: {
    en: "2. Select Bags",
    hi_cg: "२. सामान चुनें",
  },
  mediumTrolleyTitle: {
    en: "Medium Trolley / Suitcase",
    hi_cg: "मझोला ट्रॉली / सूटकेस",
  },
  mediumTrolleyDesc: {
    en: "Standard bags up to 35 kg (₹60)",
    hi_cg: "मानक सूटकेस (३५ किलो तक) - ₹६०",
  },
  heavyCartonTitle: {
    en: "Heavy Trunk / Carton Box",
    hi_cg: "भारी पेटी / कार्टन बक्सा",
  },
  heavyCartonDesc: {
    en: "Iron boxes or heavy parcels >35 kg (₹90)",
    hi_cg: "भारी बक्सा (>३५ किलो) - ₹९०",
  },
  smallBagTitle: {
    en: "Small Cabin Bag / Backpack",
    hi_cg: "छोटा बैग / पिट्ठू बैग",
  },
  smallBagDesc: {
    en: "FREE with 2+ other bags, else ₹30",
    hi_cg: "२ या अधिक बैग लेने पर मुफ़्त, अन्यथा ₹३०",
  },
  wheelchairTitle: {
    en: "Senior Citizen Wheelchair / Escort",
    hi_cg: "बुजुर्ग / व्हीलचेयर सहयोग",
  },
  wheelchairDesc: {
    en: "Dedicated escort through overbridges (+₹100)",
    hi_cg: "पुल व रैंप पर पूरा सहयोग (+₹१००)",
  },
  totalPorterFare: {
    en: "Total Porter Charge:",
    hi_cg: "कुल कुली मजदूरी:",
  },
  payToReserve: {
    en: "Pay now to reserve:",
    hi_cg: "बुक करने हेतु अभी दें:",
  },
  payAfterDrop: {
    en: "Pay to Sahayak after drop:",
    hi_cg: "सामान पहुँचाने के बाद कुली को दें:",
  },
  payAndConfirmBtn: {
    en: "Pay ₹39 & Confirm Booking",
    hi_cg: "₹३९ देकर बुकिंग पक्की करें",
  },
  confirmingBtn: {
    en: "Confirming Sahayak...",
    hi_cg: "कुली साथी असाइन हो रहा है...",
  },

  // Step 3: Boarding Pass
  step3Heading: {
    en: "3. Sahayak Pass",
    hi_cg: "३. कुली पास",
  },
  secrPassTitle: {
    en: "SECR Sahayak Pass",
    hi_cg: "SECR कुली साथी पास",
  },
  assignedStatus: {
    en: "● Assigned",
    hi_cg: "● नियुक्त",
  },
  completedStatus: {
    en: "✓ Completed",
    hi_cg: "✓ पूर्ण",
  },
  shareWhatsApp: {
    en: "Share Trip via WhatsApp",
    hi_cg: "व्हाट्सएप पर शेयर करें",
  },
  bookAnother: {
    en: "+ Book Another Porter",
    hi_cg: "+ अन्य कुली बुक करें",
  },
  happyCodeLabel: {
    en: "Happy Code (OTP)",
    hi_cg: "हैप्पी कोड (OTP)",
  },
  happyCodeDesc: {
    en: "Share after luggage delivery",
    hi_cg: "सामान पहुँचाने के बाद ही शेयर करें",
  },
  verifyPrompt: {
    en: "Have a coolie's badge number? Verify their SECR license →",
    hi_cg: "कुली का बिल्ला नंबर है? SECR लाइसेंस जांचें →",
  },

  // Sahayak Portal
  sahayakHeader: {
    en: "SECR Sahayak Partner Portal",
    hi_cg: "SECR कुली साथी पोर्टल",
  },
  dutyOnline: {
    en: "🟢 ON DUTY (ONLINE)",
    hi_cg: "🟢 ड्यूटी पर (ONLINE)",
  },
  dutyOffline: {
    en: "🔴 OFF DUTY (OFFLINE)",
    hi_cg: "🔴 विश्राम (OFFLINE)",
  },
  installPartnerApp: {
    en: "Install Sangwari Partner on Home Screen",
    hi_cg: "संगवारी साथी ऐप को अपने फ़ोन में जोड़ें",
  },
  installPartnerDesc: {
    en: "Launch duty with 1 tap directly from your phone screen.",
    hi_cg: "स्टेशन पर बिना ब्राउज़र खोले सीधे होम स्क्रीन से 1-क्लिक में ड्यूटी शुरू करें।",
  },
  installBtn: {
    en: "Install App",
    hi_cg: "ऐप इंस्टॉल करें",
  },
  dutyTab: {
    en: "Rail Duty",
    hi_cg: "रेल ड्यूटी",
  },
  earningsTab: {
    en: "Today's Earnings",
    hi_cg: "आज की कमाई",
  },
  activeTripTitle: {
    en: "Active Running Trip",
    hi_cg: "स्वीकृत यात्रा (Active Running Trip)",
  },
  incomingBookingsTitle: {
    en: "Incoming Station Bookings",
    hi_cg: "नये बुकिंग ऑर्डर",
  },
  youAreOffline: {
    en: "You are currently Offline",
    hi_cg: "आप अभी ऑफलाइन हैं",
  },
  goOnlinePrompt: {
    en: "Click the status button above to go ONLINE and receive passenger bookings.",
    hi_cg: "नये यात्री बुकिंग प्राप्त करने के लिए ऊपर दिए गए बटन पर क्लिक करके ड्यूटी शुरू करें।",
  },
  noPendingBookings: {
    en: "No pending bookings right now",
    hi_cg: "कोई नया बुकिंग पेंडिंग नहीं है",
  },
  noPendingDesc: {
    en: "As soon as a passenger books at Bilaspur, Raipur, or Durg, it will appear here in real time.",
    hi_cg: "जैसे ही कोई यात्री बिलासपुर, रायपुर या दुर्ग स्टेशन पर कुली बुक करेगा, वह यहाँ तुरंत दिखेगा।",
  },
  acceptJobBtn: {
    en: "ACCEPT JOB",
    hi_cg: "स्वीकार करें",
  },
  timeRemaining: {
    en: "remaining",
    hi_cg: "शेष",
  },
  rakePosition: {
    en: "Rake Position",
    hi_cg: "बोगी स्थिति",
  },
  luggageCount: {
    en: "Luggage Count",
    hi_cg: "सामान विवरण",
  },
  cashToCollect: {
    en: "Cash / UPI to Collect",
    hi_cg: "यात्री से मिलने वाली मजदूरी",
  },
  directPaymentNotice: {
    en: "100% direct cash or UPI to you",
    hi_cg: "१००% नकद या सीधा UPI प्राप्त करें",
  },
  passengerLabel: {
    en: "Passenger:",
    hi_cg: "यात्री:",
  },
  callBtn: {
    en: "Call",
    hi_cg: "कॉल",
  },
  whatsappBtn: {
    en: "WhatsApp",
    hi_cg: "WhatsApp",
  },
  showUpiQrBtn: {
    en: "Show UPI QR",
    hi_cg: "UPI QR दिखाएं",
  },
  completeTripBtn: {
    en: "Complete Trip (Enter OTP)",
    hi_cg: "काम पूरा करें (OTP दर्ज करें)",
  },
  todayTotalEarned: {
    en: "Today's Total Earned",
    hi_cg: "आज की कुल कमाई",
  },
  zeroCommissionNotice: {
    en: "✓ 100% Direct to you, 0% commission",
    hi_cg: "✓ १००% सीधे आपको, ०% प्लेटफ़ॉर्म कटौती",
  },
  completedTripsCount: {
    en: "Completed Trips",
    hi_cg: "पूरी की गई यात्राएं",
  },
  secrLicenseCard: {
    en: "SECR License & ID",
    hi_cg: "SECR लाइसेंस व पहचान",
  },
  validBadgeText: {
    en: "Valid Brass Badge",
    hi_cg: "सत्यापित पीतल बिल्ला",
  },
  medicalFitnessText: {
    en: "Railway Hospital Medical Card: Valid",
    hi_cg: "रेलवे हॉस्पिटल मेडिकल कार्ड: सत्यापित",
  },
  tripLedgerTitle: {
    en: "Today's Trip Ledger",
    hi_cg: "आज पूरी की गई यात्राओं का विवरण",
  },
  noTripsToday: {
    en: "No trips completed yet today.",
    hi_cg: "आज अभी तक कोई यात्रा पूरी नहीं हुई है।",
  },
  enterOtpModalTitle: {
    en: "Enter Happy Code (OTP)",
    hi_cg: "हैप्पी कोड (OTP) दर्ज करें",
  },
  enterOtpModalDesc: {
    en: "Enter the 4-digit code provided by the passenger after delivering their luggage:",
    hi_cg: "यात्री द्वारा दिए गए ४-अंकों के कोड को दर्ज करें ताकि यात्रा पूरी मानी जा सके:",
  },
  verifyAndFinishBtn: {
    en: "Verify & Finish Trip",
    hi_cg: "सत्यापित करें एवं यात्रा समाप्त करें",
  },
  cancelBtn: {
    en: "Cancel",
    hi_cg: "रद्द करें",
  },
  closeBtn: {
    en: "Close",
    hi_cg: "बंद करें",
  },
  upiModalTitle: {
    en: "UPI Payment QR Code",
    hi_cg: "UPI भुगतान QR कोड",
  },
  upiTariffLabel: {
    en: "Luggage Tariff Amount:",
    hi_cg: "कुल मजदूरी राशि:",
  },
  upiDirectNote: {
    en: "Passengers can scan with PhonePe / GPay / Paytm. 0% platform deduction.",
    hi_cg: "यात्री अपने मोबाइल से स्कैन करके सीधे भुगतान कर सकते हैं। ०% प्लेटफ़ॉर्म कटौती।",
  },
  switchProfileLabel: {
    en: "Switch Porter Profile:",
    hi_cg: "कुली प्रोफाइल बदलें:",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof DICTIONARY) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  // Load persisted language preference if present
  useEffect(() => {
    const saved = localStorage.getItem("rail_sangwari_lang") as Language;
    if (saved === "en" || saved === "hi_cg") {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("rail_sangwari_lang", lang);
  };

  const toggleLanguage = () => {
    const next = language === "en" ? "hi_cg" : "en";
    handleSetLanguage(next);
  };

  const t = (key: keyof typeof DICTIONARY): string => {
    const item = DICTIONARY[key];
    if (!item) return key as string;
    return item[language] || item.en;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
