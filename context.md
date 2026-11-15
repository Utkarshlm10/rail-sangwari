# Rail Sangwari (रेल संगवारी) — Master Context & Architectural Reference

> **Document Purpose:** Complete state, architectural blueprint, design system, and operational guide for Rail Sangwari. Use this document as the single source of truth for ongoing and future conversations.  
> **Last Updated:** October 2026 (Phase 3: 100% Free Dual-App Authentication Completed)  
> **Target Zone:** South East Central Railway (SECR) — Bilaspur Jn (BSP), Raipur Jn (R), Durg Jn (DURG)

---

## 1. Project Vision & Identity

**Rail Sangwari (रेल संगवारी)** is a Next.js 15 (App Router) + TypeScript + Tailwind CSS Progressive Web App (PWA) designed to modernize licensed railway porter (Sahayak / Coolie) booking across Indian Railway stations, starting with SECR headquarters (Bilaspur, Raipur, and Durg).

### Core Philosophy
1. **Dignity & Welfare of Railway Coolies:**
   - **100% Direct Porter Earnings:** 0% commission is deducted from the coolie's luggage tariff. The porter collects the full government-fixed rate via cash or direct UPI.
   - **Platform Convenience Fee (₹39):** Paid digitally by the passenger to cover automated PNR tracking, SECR badge verification, and guaranteed coach-doorstep pickup.
2. **Transparent Government Rates (SECR Gazette):**
   - Medium Trolley / Suitcase: ₹60/bag
   - Heavy Trunk / Carton: ₹90/bag
   - Small Cabin Bag: **FREE** when booked with 2+ other bags, else ₹30
   - Senior Citizen Wheelchair / Escort: +₹100
3. **Two-App Ecosystem (Uber/Rapido/Porter Model):**
   - Distinct, specialized experiences for passengers vs. coolies running seamlessly on a single, unified Next.js engine with zero infrastructure costs.
4. **100% Free Stack for Demonstration & Pilot:**
   - Zero paid cloud or SMS dependencies (Simulated Push SMS Banner, SECR Billa PIN auth, Web Audio API, Screen Wake Lock, Web Vibration, Native NPCI UPI QR, WhatsApp Click-to-Chat deep links, in-memory Server-Sent Events).

---

## 2. Authentication & Identity Management (100% Free)

### A. Sahayak (Coolie) Partner Authentication & Portal ([`/sahayak`](file:///d:/Rail%20Sangwari/app/sahayak/page.tsx))
- **Rapido Captain Architecture with SECR Sahayak Identity:**
  - **Overhauled Login Screen:** Gleaming SECR Brass Billa badge (`दपूमरे / SECR`), AppleAvatar with traditional red uniform (*Lal Kurta*), Royal SECR Navy & Brass primary action button, tactile uppercase Billa ID input, 4-digit PIN, 100% direct porter earnings guarantee pod, and 1-tap quick test credentials.
  - **Single Identity Top Bar:** AppleAvatar + Name + Billa `#BSP-108` + Station + Rating (`4.9★`), chime sound toggle, PWA install icon, and single-tap Shift Exit.
  - **Giant Duty Switch Hero Capsule:** Unmistakable pulsating status beacon (`🟢 ONLINE • On Duty` / `⚪ OFFLINE • Off Duty`) with 1-tap toggle.
  - **Quick Daily Earnings Bar:** Two compact glass pods (`Today's Cash: ₹{amount}` and `Trips Done: {count}`) replacing heavy tabs; clicking trips opens the Completed Trips Drawer.
  - **Focused Work State Engine:**
    - **Active Running Trip:** Sequential 3-step action card (Coach destination $\rightarrow$ One-tap Call/WhatsApp $\rightarrow$ 4-digit Happy Code entry & NPCI UPI QR).
    - **Incoming Gig Alert (25s countdown):** High-contrast sheet with giant fare (`₹150 Cash`), Coach & Platform badge, luggage summary, and giant green **Accept Booking** button.
    - **Idle State:** Pulsating SECR train radar searching for passengers at Bilaspur/Raipur/Durg with screen wake lock and railway chime alert.
    - **Offline State:** Friendly distraction-free screen with a 1-tap "Go Online" button.

### B. Passenger Mobile Login & OTP Simulation ([`components/PassengerAuthModal.tsx`](file:///d:/Rail%20Sangwari/components/PassengerAuthModal.tsx))
- **Low-Friction Guest Flow:** Passengers can search PNRs and calculate luggage tariffs without mandatory upfront login.
- **Simulated SMS Push Banner (`components/SimulatedOtpBanner.tsx`):**
  - When OTP is requested, an Apple iOS-style push notification banner slides down from the top:  
    `🔔 SECR Sangwari • Just Now`  
    `Your verification code is 4921. Valid for 5 mins. [ Auto-Fill Code ]`
  - Completely eliminates SMS gateway costs (₹0.00) while demonstrating an authentic real-life OTP experience to railway officials.
  - Pluggable architecture: Ready to swap to Twilio / MSG91 in 1 line of code once funding is approved.
- **My Bookings & Receipts Drawer ([`components/MyBookingsModal.tsx`](file:///d:/Rail%20Sangwari/components/MyBookingsModal.tsx)):**
  - Shows live active booking passes (with coach, seat, Happy Code, and porter contact button).
  - Shows past completed journey history and digital SECR tariff receipts.

---

## 3. Design System & User Interface

### A. Apple Liquid Glass Design (Both Passenger & Sahayak Apps)
- **Canvas & Surfaces:**
  - **Light Mode:** Apple `#F5F5F7` light canvas background with elevated Bento cards (`rounded-3xl`), specular hairline borders (`border-white/80`, `border-black/5`), and frosted glass blur (`backdrop-blur-2xl`).
  - **Dark Mode (21st.dev / Apple Dark Aesthetic):** Deep neutral OLED black (`#000000`) and neutral zinc canvas (`#09090B`) with elevated glass surfaces (`#18181B`). Replaced harsh clashing colors with subtle monochrome specular reflections (`rgba(255, 255, 255, 0.05)`) and delicate hairline specular borders (`border-white/[0.09]`).
- **Royal SECR Navy & Brass Design Scheme:**
  - **Primary Action CTA (`.apple-glass-btn-primary`):** Executive Indian Railways Navy gradient (`#0F2A4A` $\rightarrow$ `#0B1F36`) with a subtle liquid brass/gold rim (`border: 1px solid rgba(245, 158, 11, 0.35)`), specular top light reflection (`inset 0 1px 1.5px rgba(255, 255, 255, 0.35)`), and deep blue ambient drop shadow.
  - **Dark Mode Primary CTA:** Luminous SECR Navy glass (`#1E3A8A` $\rightarrow$ `#0F2A4A`) with brass rim and ambient blue-amber glow.
  - **Coolie Target Destination Radar:** Emphasized with `.coolie-target-radar` gradient and an SECR Navy & Brass target icon badge, clearly guiding the porter to the passenger's Coach & Seat.
  - **Translucent Tinted Trust Pods:** Emerald glass for SECR Brass Billa, Blue glass for Coach Doorstep, and Amber glass for ₹60 Govt Rate Card.
- **Adaptive Apple Wallet Pass Card (Step 3 Booking Confirmation):**
  - **Light Mode:** Crisp frosted white glass card (`bg-white/88`), subtle black hairline border, neutral slate typography (`text-slate-900`), and soft Apple drop shadows.
  - **Dark Mode:** Translucent neutral zinc glass card (`#18181B`), specular white hairline border, and crisp `#FFFFFF` typography.
  - **Happy Code (OTP) Security Capsule:** Apple Security Pass capsule (`bg-slate-950 dark:bg-zinc-900 text-white`) with high-contrast monospace OTP digits (`font-mono tracking-[0.2em] text-2xl sm:text-3xl`).
- **AppleAvatar Component ([`components/AppleAvatar.tsx`](file:///d:/Rail%20Sangwari/components/AppleAvatar.tsx)):**
  - Built an offline, retina-crisp Apple Vision/Memoji vector squircle featuring the smiling licensed Indian Railways Sahayak with red uniform and brass badge.
  - Replaced external Unsplash URLs to guarantee zero broken image errors (`<img>` 404/broken icons) across all offline and platform environments.
  - Generates custom visionOS gradient palettes per porter (`BSP-108`, `R-042`, `DURG-019`, etc.) with 100% reliability.
- **21st.dev / VisionOS Floating Capsule Navbar ([`components/Navbar.tsx`](file:///d:/Rail%20Sangwari/components/Navbar.tsx)):**
  - Floating pill capsule centered at `top-3 sm:top-5 max-w-4xl` with frosted backdrop blur.
  - Responsive passenger sign in / profile button (`My Bookings` pill with active booking indicators).
  - Smooth active tab indicators (`Passenger Booking`, `Sahayak Portal`, `Verify Badge`).
  - Mobile hamburger button opening a frosted glass drawer.
  - 100% pure bilingual switcher: `[ EN | छ.ग. ]`.

---

## 4. PNR Intelligence & Accurate Station Routing

### Strict 10-Digit PNR Rule
- Passengers are never asked to enter train numbers. The 10-digit PNR is the single source of truth.
- Both passenger and coolie apps highlight:  
  `🎯 Coolie Target Destination: Coach {coach} • Seat {berth}`  
  Guiding the porter directly to the passenger's seat.

### Boarding Station & Route Accuracy Fix
- **Live RapidAPI Integration ([`app/api/pnr/route.ts`](file:///d:/Rail%20Sangwari/app/api/pnr/route.ts)):**
  - Reads `RAILWAY_API_KEY` from `.env.local`.
  - Normalizes station codes (BSP, R, DURG, CSMT, HWH, NDLS, etc.) to full station names.
  - Extracts passenger `coach` (`currentCoachId` / `bookingCoachId`), `berth` (`currentBerthNo`), and expected `platform`.
- **Intelligent Fallback Schedule Generator ([`lib/mock-railway-data.ts`](file:///d:/Rail%20Sangwari/lib/mock-railway-data.ts)):**
  - Handles rate limits / quota limits (e.g. RapidAPI 429 Monthly Quota Exceeded) gracefully.
  - Deterministically hashes any 10-digit PNR across 8 authentic SECR train runs (Gitanjali Express, Bilaspur Rajdhani, Chhattisgarh Express, Howrah-Ahmedabad SF, Durg-Ambikapur Express, Samata Express, Bilaspur-Chennai Central).
  - Guarantees valid boarding station, platform, coach, and seat allocation matching SECR geography.
- **UI Boarding Badge:**
  - Boarding station is prominently rendered on the booking preview and coolie job card:  
    `📍 Boarding Station: Bilaspur Junction (BSP) • CSMT Mumbai → Howrah Jn`

---

## 5. Real-Time Gig Engine (100% Free Stack)

1. **Cross-Device Dispatch Engine:**
   - **Server-Sent Events (SSE) Route (`/api/dispatch`):** Real-time event broadcasting between separate devices (PC passenger $\rightarrow$ Mobile coolie) with zero paid cloud brokers.
   - **`BroadcastChannel` API:** Sub-millisecond instant synchronization across browser tabs on the same computer.
2. **Sensory Coolie Alert System ([`lib/sound-effects.ts`](file:///d:/Rail%20Sangwari/lib/sound-effects.ts)):**
   - **Synthesized Indian Railways 3-Tone Chime:** Built with Web Audio API (D5 $587.33\text{ Hz} \rightarrow$ A5 $880.00\text{ Hz} \rightarrow$ D6 $1174.66\text{ Hz}$), zero external MP3 dependencies.
   - **Web Vibration API:** Pulsating haptic alert pattern (`[300, 100, 300, 100, 500]ms`) on incoming bookings.
   - **Screen Wake Lock API:** Keeps the coolie's phone screen awake on the platform when marked `"🟢 ड्यूटी पर (ONLINE)"`.
3. **Uber-Style 25-Second Job Acceptance Countdown:**
   - Animated 25s timer on incoming bookings with visual progress bar before job cascades.
4. **End-to-End Verification Gate (Happy Code OTP):**
   - Passenger pass generates a 4-digit Happy Code (e.g., `7492`).
   - Coolie enters this OTP upon luggage delivery to close the job and trigger celebration confetti + cash bell ding.
5. **Direct Porter Settlement via Dynamic NPCI UPI QR ([`lib/qr.ts`](file:///d:/Rail%20Sangwari/lib/qr.ts)):**
   - Zero-dependency SVG QR code generator producing NPCI UPI links (`upi://pay?pa=secr.porter.bsp108@sbi&pn=...&am=...`).
   - Passenger scans to pay the porter directly with 0% platform deduction.
6. **Free WhatsApp Click-to-Chat Deep-Links:**
   - Pre-formatted bilingual trip sharing links without paid SMS gateway dependencies.
7. **Today's Earnings Ledger ([`/sahayak`](file:///d:/Rail%20Sangwari/app/sahayak/page.tsx)):**
   - Dedicated tab tracking daily completed trips, total cash/UPI collected, SECR license validation, and railway hospital medical card status.

---

## 6. Project File Structure

```
d:\Rail Sangwari
├── app/
│   ├── api/
│   │   ├── dispatch/
│   │   │   └── route.ts               # In-memory SSE & Broadcast real-time engine
│   │   └── pnr/
│   │       └── route.ts               # RapidAPI IRCTC lookup + fallback with boarding station mapper
│   ├── manifest-sahayak.webmanifest/
│   │   └── route.ts                   # Dedicated Sahayak Partner PWA Manifest
│   ├── sahayak/
│   │   ├── layout.tsx                 # Sahayak metadata & partner app link
│   │   └── page.tsx                   # Apple Liquid Glass Coolie login, duty & earnings portal
│   ├── supervisor/
│   │   ├── layout.tsx                 # SECR DRM & Station Supervisor metadata
│   │   └── page.tsx                   # 21st.dev Executive Control Center (Audit, Deployment & Chime)
│   ├── verify-billa/
│   │   └── page.tsx                   # SECR Coolie Brass Billa verification
│   ├── globals.css                    # Apple Liquid Glass design system & utilities
│   ├── layout.tsx                     # Root layout with Auth, Language, Booking providers & Modals
│   ├── manifest.ts                    # Passenger PWA Manifest
│   └── page.tsx                       # Passenger landing & booking page
├── components/
│   ├── AppleAvatar.tsx                # Offline-safe Memoji vector avatar generator for licensed porters
│   ├── BookingWidget.tsx              # 3-step interactive booking engine with Boarding Station badges
│   ├── DarkThemeToggle.tsx            # Apple pill theme switcher
│   ├── MyBookingsModal.tsx            # Passenger trips & digital receipts drawer
│   ├── Navbar.tsx                     # 21st.dev VisionOS floating glass capsule navbar with Auth button
│   ├── PassengerAuthModal.tsx         # Passenger mobile sign in modal
│   └── SimulatedOtpBanner.tsx         # Apple push notification banner for 100% free SMS OTP
├── context/
│   ├── AuthContext.tsx                # Dual-app auth provider (Passenger OTP + Sahayak Billa PIN)
│   ├── BookingContext.tsx             # Global booking state, dispatch & sound sync
│   ├── LanguageContext.tsx            # 100% Pure English / Hindi-Chhattisgarhi translation system
│   └── ThemeContext.tsx               # Light/Dark mode state
├── lib/
│   ├── mock-railway-data.ts           # SECR station, coolie, tariff, PIN auth & realistic train dataset
│   ├── qr.ts                          # NPCI UPI URI & SVG QR code generator
│   └── sound-effects.ts               # Web Audio IR chime, vibrations & wake lock
├── types/
│   └── index.ts                       # PNRData, SahayakProfile (with pin), PassengerUser, Fare types
├── .env.local                         # RapidAPI railway credentials
├── context.md                         # Master architectural & project context reference
└── test-all-features.mjs              # 26-point automated test suite (100% passing)
```

---

## 7. Verification & Automated Test Suite

Run all automated tests against the running server:
```bash
node test-all-features.mjs
```

### Test Coverage (27 / 27 Passing):
- **1. PNR Engine & Station Accuracy:** Verified demo PNRs, custom 10-digit SECR realistic trains, short PNR rejection, exact boarding station, platform, coach, and seat numbers.
- **2. Luggage & Tariff Engine:** Small bag free threshold (2+ bags), solo bag rate, heavy trunk, wheelchair escort.
- **3. SECR Brass Billa Registry:** Verified `BSP-108`, `R-042`, unregistered badge rejection.
- **4. SECR Billa + 4-Digit PIN Authentication:** Verified `BSP-108` + PIN `1080`, `R-042` + PIN `0420`, master demo PIN `1234`, wrong PIN rejection, unregistered badge rejection.
- **5. Live HTTP Endpoints & Assets:** Home `/`, `/sahayak`, `/supervisor`, `/verify-billa`, `/manifest.webmanifest`, `/manifest-sahayak.webmanifest`, `/logo.png`.
- **6. Live PNR API Endpoint:** `GET /api/pnr?pnr=6412890341` verification.
- **7. Real-Time Gig Dispatch:** `POST /api/dispatch` broadcast verification.
- **8. Apple Liquid Glass & Navbar DOM Audit:** Verified 21st.dev floating capsule navbar on passenger app and Apple Liquid Glass Bento structure on sahayak portal.

---

## 8. Operational Guidelines for Future Development

1. **Zero Train Number Inputs:** Never ask the passenger to type or know a train number. PNR must remain the sole input.
2. **Coolie Destination Focus:** The Coach & Seat number must always be highlighted as the porter's primary physical meeting and delivery target.
3. **Free Features First:** Maintain 100% free stack (browser APIs, Web Audio, native UPI QR, WhatsApp deep links) for pilots and demonstrations.
4. **Paid Upgrades (Post-Official Approval):**
   - Paid SMS gateway (Twilio / MSG91) for cellular OTP.
   - Official CRIS / IRCTC partner data feed.
   - Payment gateway integration (Razorpay / Cashfree) for convenience fee collection.
