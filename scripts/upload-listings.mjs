import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// ── Supabase credentials ──────────────────────────────────────────────────────
const SUPABASE_URL = 'https://mdvvtrejlpvgfnbueruh.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdnZ0cmVqbHB2Z2ZuYnVlcnVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzU0NjM2OCwiZXhwIjoyMDkzMTIyMzY4fQ.4ZYIs4eCsNJK2QHIDjxzH1neno808ZF5-tsVB5V2pTg';
const BUCKET = 'listing-images';
const DATA_DIR = path.join(process.cwd(), 'public', 'uploads', 'TINY HOME DATA');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ── Pre-compiled listing metadata (parsed from all 36 script files) ──────────
const LISTINGS_META = [
  {
    folder: '10th model',
    title: 'The Aspenwood — Double Wide Homestead',
    price: 37000, priceType: 'sale', sqft: 950, bedrooms: 2, bathrooms: 2,
    homeType: 'foundation', offGridScore: 35,
    description: 'A clean, HUD-compliant mobile home in excellent condition with 950+ sq ft of living space. Features 2 spacious bedrooms and 2 full bathrooms. Perfect for families looking for full-time living with nationwide transport available.',
    amenities: ['Mini-Split A/C', 'Full Kitchen', 'Delivery Available', 'Financing Available'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal' },
  },
  {
    folder: '2nd model',
    title: 'The Summit Manor — Modern Family Oasis',
    price: 38000, priceType: 'sale', sqft: 1350, bedrooms: 3, bathrooms: 2,
    homeType: 'foundation', offGridScore: 25,
    description: 'A generous 1,350 sq ft family home featuring 3 bedrooms, 2.5 bathrooms, and a convenient 1-car garage. Spacious open-concept layout ideal for growing families seeking affordable and comfortable housing.',
    amenities: ['1-Car Garage', 'Full Kitchen', 'Delivery Available', 'Financing Available'],
    specs: { heatingType: 'Central HVAC', waterSystem: 'Municipal' },
  },
  {
    folder: "32' Poseidon Model",
    title: "32' Poseidon — Sleeps Up To 6",
    price: 43000, priceType: 'sale', sqft: 340, bedrooms: 2, bathrooms: 1,
    homeType: 'on-wheels', offGridScore: 72,
    description: "The 32' Poseidon Model has a private ground-floor bedroom with a sleeping loft with egress windows and easy-access stairs with safety rails. Spacious living space, full kitchen, and bathroom with 3'x3' shower. Can be pulled by a one-ton truck. Delivery available to all states.",
    amenities: ['Sleeping Loft', 'Full Kitchen', 'Road Legal', 'Delivery Nationwide', 'Financing Available'],
    specs: { heatingType: 'Propane', waterSystem: 'Tank + hookup', loftCount: 1 },
  },
  {
    folder: '399 SQFT MODEL',
    title: '399 Sqft Agate 522 ALT Loft — Park Model',
    price: 35000, priceType: 'sale', sqft: 399, bedrooms: 1, bathrooms: 1,
    homeType: 'foundation', offGridScore: 48,
    description: 'The 2023 Agate 522 ALT Loft by Athens Park Homes maximizes every inch of space with a bright open feel. Features a private bedroom, spacious loft, two inviting porches, and a fully equipped kitchen. One unit available — move-in ready upon delivery.',
    amenities: ['Sleeping Loft', 'Two Porches', 'Ductless A/C', 'Extended Warranty', 'Delivery Available'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal', loftCount: 1 },
  },
  {
    folder: '3rd model',
    title: 'The Tumbleweed — Charming Rustic Park Model',
    price: 24000, priceType: 'sale', sqft: 280, bedrooms: 1, bathrooms: 1,
    homeType: 'foundation', offGridScore: 52,
    description: "Say hello to The Tumbleweed by Platinum Cottages — as cute as it sounds! Perfect as a mother-in-law suite, guest house, Airbnb, or full-time living. Features metal roof, real wood cabinets, kitchen appliances, washer/dryer, Trex decking, and mini-split A/C & heat.",
    amenities: ['Metal Roof', 'Real Wood Cabinets', 'Washer/Dryer', 'Trex Decking', 'Mini-Split A/C', 'Movable Island'],
    specs: { heatingType: 'Mini-split', waterSystem: 'Municipal' },
  },
  {
    folder: '4th model',
    title: 'The Hearthstone — Country Farmhouse Cottage',
    price: 20000, priceType: 'sale', sqft: 310, bedrooms: 3, bathrooms: 2,
    homeType: 'foundation', offGridScore: 28,
    description: 'A beautiful 3-bedroom, 2-bathroom farmhouse-style tiny home. Delivery and setup included in the price with in-house financing available. A $500 refundable reservation fee holds your home. Contact us today for more information.',
    amenities: ['Delivery & Setup Included', 'Financing Available', 'Farmhouse Style', 'Reserve Today'],
    specs: { heatingType: 'Central', waterSystem: 'Municipal' },
  },
  {
    folder: '5th model',
    title: 'The Nomad Explorer — Custom Off-Grid THOW',
    price: 20000, priceType: 'sale', sqft: 240, bedrooms: 1, bathrooms: 1,
    homeType: 'on-wheels', offGridScore: 78,
    description: 'Your dream tiny home on wheels! Custom-built with modern amenities, off-grid options available, and high-quality craftsmanship. Perfect for full-time living, weekend getaways, or Airbnb rental. Live small, dream big, travel far.',
    amenities: ['Off-Grid Options', 'Road Legal', 'Delivery Available', 'Financing Available', 'Modern Amenities'],
    specs: { heatingType: 'Mini-split', waterSystem: 'Tank + hookup', rainwaterCollection: true },
  },
  {
    folder: '6th model',
    title: 'The Meadowlands Homestead — Expansive Double Wide',
    price: 45000, priceType: 'sale', sqft: 1530, bedrooms: 3, bathrooms: 2,
    homeType: 'foundation', offGridScore: 22,
    description: 'A spacious used 2021 double wide home at 28x56 feet offering 1,530 sq ft of comfortable living. Features 3 bedrooms, 2 bathrooms with ceramic tile shower, tape & textured walls, stainless appliances including microwave, kitchen pantry, and walk-in closets.',
    amenities: ['Ceramic Tile Shower', 'Stainless Appliances', 'Kitchen Pantry', 'Walk-In Closets', 'Financing Available'],
    specs: { heatingType: 'Central HVAC', waterSystem: 'Municipal' },
  },
  {
    folder: '7th model',
    title: 'The Blackberry Loft — Luxury Park Cottage',
    price: 25000, priceType: 'sale', sqft: 396, bedrooms: 1, bathrooms: 1,
    homeType: 'foundation', offGridScore: 50,
    description: "The Blackberry model is a 396 sq ft, 12'x44', 1-bedroom, 1-bath RV park model with a loft that comfortably sleeps 6. Loaded with premium upgrades including quartz countertops, stainless appliances, stacked washer/dryer, tankless water heater, and built-in storage throughout.",
    amenities: ['Sleeping Loft', 'Quartz Countertops', 'Stainless Appliances', 'Washer/Dryer', 'Tankless Water Heater', 'Built-In Storage'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal', loftCount: 1, insulationRValue: 20 },
  },
  {
    folder: '8th model',
    title: 'The Platinum Ridge — Architectural Masterpiece',
    price: 32000, priceType: 'sale', sqft: 1088, bedrooms: 2, bathrooms: 1,
    homeType: 'foundation', offGridScore: 32,
    description: 'A gorgeous 1,088 sq ft Platinum model with 2 bedrooms and 1 bathroom. Features a large kitchen island with open shelving and pop-up USB outlets, beam ceiling with shiplap accent wall, beautiful white tile backsplash, and a large bathroom with mosaic tile shower and separate bathtub. Includes all upgrades, delivery, and warranties.',
    amenities: ['Large Kitchen Island', 'Beam Ceiling', 'Shiplap Accent Wall', 'Mosaic Tile Shower', 'USB Outlets', 'Financing Available'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal' },
  },
  {
    folder: '9th model',
    title: 'The Sanctuary Estate — Grand 4-Bed Villa',
    price: 45000, priceType: 'sale', sqft: 2400, bedrooms: 4, bathrooms: 2,
    homeType: 'foundation', offGridScore: 18,
    description: 'The STON is back in stock — a 2015 used Kabco KB 3241 at 32x82 feet with a massive 2,400 sq ft of living space. Features 4 bedrooms, 2 bathrooms, tile flooring, full drywall, a den with fireplace, 2x6 exterior walls, 38-11-22 insulation, stand-alone tub, and 72" shower in the master bath.',
    amenities: ['Den with Fireplace', 'Stand-Alone Tub', '72" Master Shower', 'Full Drywall', 'Tile Flooring'],
    specs: { heatingType: 'Central HVAC', waterSystem: 'Municipal', insulationRValue: 38 },
  },
  {
    folder: 'APX Series AKBASH',
    title: 'APX Series Akbash — Front Kitchen Park Model',
    price: 33000, priceType: 'sale', sqft: 399, bedrooms: 1, bathrooms: 1,
    homeType: 'foundation', offGridScore: 45,
    description: 'The APX Series Akbash is a 1-bed/1-bath 399 sq ft RV park model with a unique front kitchen and back deck — perfect for a lake lot. Fits into most RV spots with no loft (can be added). Spacious living area with versatile furniture arrangements. Includes delivery, A/C, warranty.',
    amenities: ['Front Kitchen Layout', 'Back Deck', 'Ductless A/C', 'Extended Warranty', 'Fits RV Lots'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal' },
  },
  {
    folder: "Baluchon's Compact Tiny Home",
    title: "Baluchon's Compact Tiny Home — Red Cedar THOW",
    price: 28000, priceType: 'sale', sqft: 200, bedrooms: 1, bathrooms: 1,
    homeType: 'on-wheels', offGridScore: 82,
    description: "A 20-ft contemporary tiny home on wheels with stunning red cedar cladding and spruce interior. Features a bedroom, living area, bathroom, and kitchen with a suspended netted floor for extra space. Wood-burning stove, custom wardrobe, and plenty of storage. Natural light and cozy vibes throughout.",
    amenities: ['Red Cedar Cladding', 'Wood-Burning Stove', 'Suspended Netted Floor', 'Custom Wardrobe', 'Natural Materials'],
    specs: { heatingType: 'Wood stove', waterSystem: 'Tank', rainwaterCollection: false },
  },
  {
    folder: 'COLDWATER A12BO 1 bedroom 1 Bath tiny home',
    title: 'COLDWATER A12B0 — Luxury Tiny with Loft',
    price: 25000, priceType: 'sale', sqft: 395, bedrooms: 1, bathrooms: 1,
    homeType: 'foundation', offGridScore: 60,
    description: 'Experience upscale tiny living with the COLDWATER A12B0 — 395 sq ft of luxury with an open-concept living area, built-in electric fireplace, quartz countertops, full kitchen with dishwasher and large refrigerator, and a spacious loft that sleeps up to 6. Metal roof, mini-split, and high-end finishes throughout.',
    amenities: ['Electric Fireplace', 'Quartz Countertops', 'Full Kitchen', 'Sleeping Loft', 'Covered Front Porch', 'Mini-Split A/C'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal', insulationRValue: 22, loftCount: 1 },
  },
  {
    folder: 'Dasha 880 Sq Ft  2 Bed  2 Bath Single-Section Home',
    title: 'Dasha — 880 Sq Ft 2-Bed 2-Bath Single-Section',
    price: 36968, priceType: 'sale', sqft: 880, bedrooms: 2, bathrooms: 2,
    homeType: 'foundation', offGridScore: 38,
    description: 'The Dasha offers 880 sq ft of thoughtful design with a split-bedroom floor plan. Features a spacious living room with clerestory windows, open-concept kitchen, primary bedroom with en-suite tile shower, and a covered 8-ft front porch. Includes A/C, delivery, and extended warranty.',
    amenities: ['Clerestory Windows', 'Split Bedroom Plan', 'Covered Front Porch', 'Ductless A/C', 'Metal Roof', 'Extended Warranty'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal', insulationRValue: 30 },
  },
  {
    folder: 'Deekan',
    title: 'Deekan — Rustic 1-Bed 607 Sq Ft',
    price: 44000, priceType: 'sale', sqft: 607, bedrooms: 1, bathrooms: 1,
    homeType: 'foundation', offGridScore: 40,
    description: 'The Deekan is a rustic-feel 1-bed/1-bath 607 sq ft single-section home with beautiful built-ins throughout. Includes all upgrades, delivery and tiedowns nationwide, ductless A/C and heat, temporary steps, manufacturer\'s warranty, and extended warranty. Financing available.',
    amenities: ['Rustic Design', 'Built-In Storage', 'Ductless A/C', 'Delivery Nationwide', 'Extended Warranty', 'Financing Available'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal' },
  },
  {
    folder: 'Famous Bayview',
    title: 'Famous Bayview — Used 2020 1-Bed with Loft',
    price: 20000, priceType: 'sale', sqft: 300, bedrooms: 1, bathrooms: 1,
    homeType: 'foundation', offGridScore: 43,
    description: 'A beautiful used 2020 model ready for immediate sale. The Famous Bayview features a storage loft, compact size, and lightweight design with a cozy and modern interior. Perfect for small family living or vacation use. Homes like this sell fast!',
    amenities: ['Storage Loft', 'Compact Size', 'Modern Interior', 'Move-In Ready'],
    specs: { heatingType: 'Mini-split', waterSystem: 'Municipal', loftCount: 1 },
  },
  {
    folder: "Maltese' \u2013 1 Bed  1 Bath, 399 sq ft RV Park Model",
    title: "Maltese — 1-Bed 399 Sq Ft RV Park Model",
    price: 39442, priceType: 'sale', sqft: 399, bedrooms: 1, bathrooms: 1,
    homeType: 'foundation', offGridScore: 47,
    description: "The Maltese features raised flat ceilings, a painted tray ceiling on the porch, and a pantry. Includes all upgrades and options shown, A/C and heating system, wooden steps, manufacturer's warranty, and an extended warranty. Only one available at this price.",
    amenities: ['Raised Flat Ceilings', 'Painted Tray Ceiling', 'Pantry', 'Ductless A/C', 'Extended Warranty'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal' },
  },
  {
    folder: 'Meadowview',
    title: 'Meadowview — Cabin-Style Park Model with Fireplace',
    price: 24000, priceType: 'sale', sqft: 399, bedrooms: 1, bathrooms: 1,
    homeType: 'foundation', offGridScore: 50,
    description: 'A used 2019 Platinum Cottages Signature Series Meadowview RV park model with a stone fireplace on the porch. Done in a beautiful cabin style with metal roof, split log siding outside, hickory cabinets, and hickory stained ceiling inside. Includes loft and storage drawers in the stairs.',
    amenities: ['Stone Fireplace', 'Sleeping Loft', 'Hickory Cabinets', 'Metal Roof', 'Split Log Siding', 'Stair Storage'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal', loftCount: 1 },
  },
  {
    folder: 'Model RBI36207',
    title: 'Model RBI36207 — 2-Bed 940 Sq Ft Deal',
    price: 30000, priceType: 'sale', sqft: 940, bedrooms: 2, bathrooms: 2,
    homeType: 'foundation', offGridScore: 35,
    description: 'Available now — move fast on this deal! 2-bed/2-bath single-section home at 940 sq ft. Includes delivery and tiedowns within 100 miles, ductless A/C and heat system, manufacturer\'s warranty, and a 7-year extended service contract. Limited-time pricing.',
    amenities: ['Ductless A/C', 'Delivery Included', '7-Year Extended Warranty', 'Limited-Time Price'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal' },
  },
  {
    folder: 'THE TEJAS P-570ESL',
    title: 'THE TEJAS P-570ESL — 1-Bed 399 Sq Ft',
    price: 35000, priceType: 'sale', sqft: 399, bedrooms: 1, bathrooms: 1,
    homeType: 'foundation', offGridScore: 55,
    description: "This 32'x15' TEJAS P-570ESL tiny home offers comfort, functionality, and modern style for full-time living or a high-end getaway. Features a king-size bed area, full bathroom with washer/dryer space, open-concept kitchen with full appliances, large windows, and optional clerestory windows and front porch.",
    amenities: ['King-Size Bedroom', 'Full Kitchen Appliances', 'Optional Porch', 'Large Windows', 'Closet Storage'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal' },
  },
  {
    folder: 'The Athens',
    title: 'The Athens — 2-Bed with Stone Fireplace',
    price: 35000, priceType: 'sale', sqft: 810, bedrooms: 2, bathrooms: 1,
    homeType: 'foundation', offGridScore: 52,
    description: "The Athens features a spacious kitchen island perfect for entertaining and a show-stopping stone-covered wood-burning fireplace. The hallway includes a built-in desk with storage. High insulation values (R-30 walls, R-40 ceiling) with spray foam. Includes delivery, A/C, and warranties nationwide.",
    amenities: ['Wood-Burning Fireplace', 'Kitchen Island', 'Built-In Desk', 'Spray Foam Insulation', 'Metal Roof', 'Delivery Nationwide'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal', insulationRValue: 30, heatingType: 'Ductless mini-split + wood stove' },
  },
  {
    folder: 'The Cumberland',
    title: 'The Cumberland — Versatile Tiny with 10-Ft Porch',
    price: 40850, priceType: 'sale', sqft: 380, bedrooms: 1, bathrooms: 1,
    homeType: 'foundation', offGridScore: 48,
    description: "The Cumberland is a custom tiny house that makes a perfect office, dorm room, guest house, or weekend retreat. With the bunk room removed, the main area is massive — large enough for a dining table, a desk, and a spacious living room. Features a queen bedroom, full-size washer/dryer, nice open bathroom, and a 10-ft covered front porch.",
    amenities: ['10-ft Covered Porch', 'Queen Bedroom', 'Full Washer/Dryer', 'Open Bathroom', 'Multi-Use Space', 'Financing Available'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal' },
  },
  {
    folder: 'The Diamond Series',
    title: 'The Diamond Series Drake — 782 Sq Ft',
    price: 30000, priceType: 'sale', sqft: 782, bedrooms: 1, bathrooms: 1,
    homeType: 'foundation', offGridScore: 42,
    description: "Used renewed 2023 Bulk Park Home — The Diamond Series 'Drake'. A not-so-tiny home with a large island and gorgeous beam in the main living area, plus a beautiful large tile shower with a rolling barn door. The wide floorplan gives a spacious feel with amazing kitchen features. Includes delivery, A/C, and warranties.",
    amenities: ['Large Kitchen Island', 'Beam Ceiling', 'Tile Shower', 'Rolling Barn Door', 'Ductless A/C', 'Extended Warranty'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal' },
  },
  {
    folder: 'The ELDORADO',
    title: 'The ELDORADO — 1-Bed with Soaking Tub & Porch',
    price: 35000, priceType: 'sale', sqft: 399, bedrooms: 1, bathrooms: 1,
    homeType: 'foundation', offGridScore: 50,
    description: "The ELDORADO features a private rear primary bedroom that fits a king-size bed with storage including t-shirt cabinets and a bank of drawers. The bathroom features a large 60-inch soaking tub. This specific model has a 10-foot covered front porch with composite decking and an outdoor fan. Price includes delivery and setup.",
    amenities: ['King-Size Bedroom', '60-Inch Soaking Tub', '10-Ft Covered Porch', 'Composite Decking', 'Delivery Included'],
    specs: { heatingType: 'Ductless mini-split', toiletType: 'Standard', waterSystem: 'Municipal' },
  },
  {
    folder: 'The Foxglove Cabin',
    title: "The Foxglove Cabin — 2-Bed 640 Sq Ft",
    price: 25000, priceType: 'sale', sqft: 640, bedrooms: 2, bathrooms: 1,
    homeType: 'foundation', offGridScore: 42,
    description: "This fully finished 16'x40' tiny home combines style, comfort, and practicality. Comes complete with all appliances and is ready for delivery. A shell-only option is also available for those who want to customize finishes. Perfect for full-time living, a weekend retreat, or downsizing.",
    amenities: ['All Appliances Included', 'Shell Option Available', 'Delivery Available', 'Move-In Ready'],
    specs: { heatingType: 'Mini-split', waterSystem: 'Municipal' },
  },
  {
    folder: 'The Klondike',
    title: 'The Klondike — 2-Bed+Office 1,208 Sq Ft Luxury',
    price: 42000, priceType: 'sale', sqft: 1208, bedrooms: 2, bathrooms: 2,
    homeType: 'foundation', offGridScore: 38,
    description: 'The Klondike was just completed and is ready for delivery. 1,208 sq ft with 2 bedrooms, office, and 2.5 bathrooms. Features 11-ft ceilings, triple-pane windows, quartz kitchen, spray foam insulation, Trex decking, and lifetime shingles. Premium quality, modern design, and move-in ready.',
    amenities: ['11-Ft Ceilings', 'Triple-Pane Windows', 'Quartz Kitchen', 'Spray Foam Insulation', 'Trex Decking', 'Lifetime Shingles'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal', insulationRValue: 35 },
  },
  {
    folder: 'The Olivewood \uD83C\uDFE0 34\' tiny house with 2 beds',
    title: "The Olivewood — 34' 2-Bed Custom THOW",
    price: 44000, priceType: 'sale', sqft: 320, bedrooms: 2, bathrooms: 1,
    homeType: 'on-wheels', offGridScore: 70,
    description: "The Olivewood is a stunning 34' tiny house on wheels with a master bedroom with walk-in closet and loft bedroom. Features metal and cedar siding, galley kitchen, tiled shower, and mini-split A/C. Customizable and made to order — your dream tiny home built to your specifications.",
    amenities: ['Walk-In Closet', 'Loft Bedroom', 'Metal & Cedar Siding', 'Tiled Shower', 'Mini-Split A/C', 'Customizable'],
    specs: { heatingType: 'Mini-split', waterSystem: 'Tank + hookup', loftCount: 1 },
  },
  {
    folder: 'The Patara \uD83C\uDFE0 Premium double loft tiny house (46.2m2)',
    title: 'The Patara — Premium Double Loft THOW',
    price: 35000, priceType: 'sale', sqft: 497, bedrooms: 1, bathrooms: 1,
    homeType: 'on-wheels', offGridScore: 75,
    description: 'The Patara is a premium double loft tiny house (46.2m2) on a galvanised steel or aluminium trailer with insulated SIP panels. Sleeps 2-4 with a galley kitchen, large bathroom, and a lounge with lots of windows. Ideal for couples or small families. Fully customizable.',
    amenities: ['Double Loft', 'SIP Panel Insulation', 'Galley Kitchen', 'Large Bathroom', 'Customizable', 'Steel Trailer'],
    specs: { heatingType: 'Mini-split', waterSystem: 'Tank + hookup', insulationRValue: 24, loftCount: 2 },
  },
  {
    folder: 'The Sunset Retreat!',
    title: 'The Sunset Retreat — 399 Sq Ft Park Model',
    price: 41500, priceType: 'sale', sqft: 399, bedrooms: 1, bathrooms: 1,
    homeType: 'foundation', offGridScore: 45,
    description: "The Sunset Retreat is absolutely stunning — 399 sq ft designed for comfort and style. Features a spacious 10-ft front porch with flat ceiling, living room with shiplap accents and eat-in bar, U-shaped kitchen with dishwasher and floating shelves, queen bedroom with built-in storage, and en-suite bathroom with double vanity and laundry nook. No loft!",
    amenities: ['10-Ft Front Porch', 'Shiplap Accents', 'U-Shaped Kitchen', 'Dishwasher', 'Double Vanity', 'Laundry Nook'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal' },
  },
  {
    folder: 'The Sunstone',
    title: 'The Sunstone — Cabin-Style 2-Bed 750 Sq Ft',
    price: 30000, priceType: 'sale', sqft: 750, bedrooms: 2, bathrooms: 1,
    homeType: 'foundation', offGridScore: 42,
    description: "The Sunstone is a 2-bed/1-bath 750 sq ft single-section home done in a beautiful cabin style. Customize yours in any style while choosing from a variety of finishes. Includes A/C and heat system, manufacturer's warranty, and extended warranty. Financing and rent-to-own options available. Delivery and setup available nationwide.",
    amenities: ['Cabin Style', 'Customizable Finishes', 'Ductless A/C', 'Extended Warranty', 'Rent-to-Own', 'Delivery Nationwide'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal' },
  },
  {
    folder: 'The Trek',
    title: 'The Trek — 1-Bed 540 Sq Ft with Built-In Porch',
    price: 30000, priceType: 'sale', sqft: 540, bedrooms: 1, bathrooms: 1,
    homeType: 'foundation', offGridScore: 48,
    description: "The Trek offers 1 bedroom, 1 bath, and a built-in porch designed for comfort, convenience, and relaxation. Features stainless steel appliances, ceiling vents, space for washer & dryer, and delivery available to all states. Financing and rent-to-own options available.",
    amenities: ['Built-In Porch', 'Stainless Appliances', 'Ceiling Vents', 'Washer/Dryer Space', 'Delivery Nationwide', 'Financing Available'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal' },
  },
  {
    folder: 'Tiny House (8m) fully furnished',
    title: 'Tiny House 8m — Fully Furnished & Insured',
    price: 25000, priceType: 'sale', sqft: 260, bedrooms: 1, bathrooms: 1,
    homeType: 'on-wheels', offGridScore: 68,
    description: 'A fully furnished 8m tiny house on wheels with delivery to all states. Includes kitchen, bathroom, A/C, double bed, and washing machine. O2 certified with transportation insured! Move-in ready from day one — everything you need is already inside.',
    amenities: ['Fully Furnished', 'A/C Included', 'Washing Machine', 'O2 Certified', 'Transport Insured', 'Delivery All States'],
    specs: { heatingType: 'Mini-split', waterSystem: 'Tank + hookup' },
  },
  {
    folder: 'Used renewed 2024 Platinum Cottages - Majestic Series',
    title: 'Platinum Cottages Majestic — Lakeview 1-Bed + Two Porches',
    price: 28000, priceType: 'sale', sqft: 399, bedrooms: 1, bathrooms: 1,
    homeType: 'foundation', offGridScore: 46,
    description: "Used renewed 2024 Platinum Cottages Majestic Series — the Lakeview reimagined. 1-bed/1-bath 399 sq ft RV park model with a loft and TWO porches. Modern sleek look with a monoslope roofline and shiplap on the ceiling. Includes ductless A/C, extended warranty, and all upgrades shown.",
    amenities: ['Sleeping Loft', 'Two Porches', 'Monoslope Roofline', 'Shiplap Ceiling', 'Ductless A/C', 'Extended Warranty'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal', loftCount: 1 },
  },
  {
    folder: 'WHALE \uD83C\uDFE0 One Bedroom, Single Storey Tiny Home',
    title: 'WHALE — Eco-Friendly 1-Bed THOW (NZ Built)',
    price: 32000, priceType: 'sale', sqft: 290, bedrooms: 1, bathrooms: 1,
    homeType: 'on-wheels', offGridScore: 85,
    description: 'The WHALE is a one-bedroom, single-storey tiny home at 3m x 9.6m on a 3.5T trailer. Features insulation (R2.2), LED lights, galley kitchen, composting toilet, and double-glazed windows. Perfect for long-term living with expandable seating & storage. Eco-friendly and fully customizable.',
    amenities: ['Composting Toilet', 'Double-Glazed Windows', 'LED Lighting', 'Galley Kitchen', 'Customizable', 'Eco-Friendly'],
    specs: { heatingType: 'Mini-split', waterSystem: 'Tank', toiletType: 'Composting', greyWaterSystem: true, insulationRValue: 14 },
  },
  {
    folder: 'platinum model',
    title: 'The Horizon Ridge — Premium Dual-Loft Oasis',
    price: 23000, priceType: 'sale', sqft: 1088, bedrooms: 2, bathrooms: 1,
    homeType: 'foundation', offGridScore: 32,
    description: "The Platinum Model offers 2 bedrooms and 1 bathroom in 1,088 sq ft with delivery and setup included. Features a large kitchen island with open shelving, beam ceiling with shiplap accent wall, white tile backsplash with pop-up USB outlets, and a spacious bathroom with mosaic tile shower and separate tub. Comes with a 10-year warranty.",
    amenities: ['Delivery & Setup Included', 'Large Kitchen Island', 'Beam Ceiling', 'USB Outlets', 'Mosaic Tile Shower', '10-Year Warranty'],
    specs: { heatingType: 'Ductless mini-split', waterSystem: 'Municipal' },
  },
];

// ── Helper: Upload a file to Supabase Storage ─────────────────────────────────
async function uploadImage(localPath, storagePath) {
  const fileBuffer = fs.readFileSync(localPath);
  const ext = path.extname(localPath).toLowerCase();
  const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };
  const contentType = mimeMap[ext] || 'image/jpeg';

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, fileBuffer, {
    contentType, upsert: true,
  });
  if (error) throw new Error(`Upload failed for ${storagePath}: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

// ── Helper: Get images from a folder ─────────────────────────────────────────
function getImages(folderPath) {
  const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const files = fs.readdirSync(folderPath);
  const images = files.filter(f => IMAGE_EXTS.includes(path.extname(f).toLowerCase()));

  const mainImage = images.find(f => f.toLowerCase().includes('main'));
  const otherImages = images.filter(f => !f.toLowerCase().includes('main'));

  return { mainImage, otherImages };
}

// ── Main upload function ──────────────────────────────────────────────────────
async function main() {
  console.log(`\n🏠 Collins Tiny Homes — Bulk Upload Script`);
  console.log(`📁 Data dir: ${DATA_DIR}`);
  console.log(`🔗 Supabase: ${SUPABASE_URL}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const meta of LISTINGS_META) {
    const folderPath = path.join(DATA_DIR, meta.folder);

    if (!fs.existsSync(folderPath)) {
      console.warn(`⚠️  Folder not found: ${meta.folder}`);
      errorCount++;
      continue;
    }

    try {
      console.log(`\n📦 Processing: ${meta.title}`);
      const { mainImage, otherImages } = getImages(folderPath);

      if (!mainImage) {
        console.warn(`  ⚠️  No main image found in ${meta.folder} — skipping`);
        errorCount++;
        continue;
      }

      // Upload main image
      const listingId = randomUUID();
      const safeFolderName = meta.folder.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 40);
      const mainExt = path.extname(mainImage).toLowerCase();
      const mainStoragePath = `listings/${listingId}/main${mainExt}`;

      console.log(`  📸 Uploading main image: ${mainImage}`);
      const coverImageUrl = await uploadImage(path.join(folderPath, mainImage), mainStoragePath);
      console.log(`  ✅ Main image URL: ${coverImageUrl}`);

      // Insert listing record
      const { error: listingError } = await supabase.from('listings').insert([{
        id: listingId,
        title: meta.title,
        description: meta.description,
        price: meta.price,
        price_type: 'both',
        sqft: meta.sqft,
        bedrooms: meta.bedrooms,
        bathrooms: meta.bathrooms,
        location: 'United States',
        state: 'Nationwide',
        lat: 37.0902,
        lng: -95.7129,
        cover_image: coverImageUrl,
        home_type: meta.homeType,
        off_grid_score: meta.offGridScore,
        solar_wattage: meta.specs?.solarWattage || (meta.price > 29000 ? 1600 : null),
        water_system: meta.specs?.waterSystem || null,
        insulation_r_value: meta.specs?.insulationRValue || null,
        toilet_type: meta.specs?.toiletType || null,
        loft_count: meta.specs?.loftCount || 0,
        heating_type: meta.specs?.heatingType || null,
        rainwater_collection: meta.specs?.rainwaterCollection || false,
        grey_water_system: meta.specs?.greyWaterSystem || false,
        amenities: meta.amenities || [],
        is_featured: successCount < 6,
        status: 'active',
        created_at: new Date().toISOString(),
      }]);

      if (listingError) throw new Error(`DB insert failed: ${listingError.message}`);
      console.log(`  ✅ Listing inserted: ${listingId}`);

      // Upload and insert gallery images
      let sortOrder = 0;
      const imageInserts = [];

      // Add cover image as first gallery image too
      imageInserts.push({
        id: randomUUID(),
        listing_id: listingId,
        url: coverImageUrl,
        label: 'Main',
        sort_order: sortOrder++,
      });

      for (const imgFile of otherImages.slice(0, 15)) { // cap at 15 extras
        try {
          const imgExt = path.extname(imgFile).toLowerCase();
          const imgStoragePath = `listings/${listingId}/${sortOrder}${imgExt}`;
          console.log(`  📸 Uploading gallery image: ${imgFile}`);
          const imgUrl = await uploadImage(path.join(folderPath, imgFile), imgStoragePath);
          imageInserts.push({
            id: randomUUID(),
            listing_id: listingId,
            url: imgUrl,
            label: `Photo ${sortOrder}`,
            sort_order: sortOrder++,
          });
        } catch (imgErr) {
          console.warn(`  ⚠️  Could not upload ${imgFile}: ${imgErr.message}`);
        }
      }

      if (imageInserts.length > 0) {
        const { error: imgError } = await supabase.from('listing_images').insert(imageInserts);
        if (imgError) console.warn(`  ⚠️  Image DB insert warning: ${imgError.message}`);
        else console.log(`  ✅ ${imageInserts.length} images saved to DB`);
      }

      successCount++;
    } catch (err) {
      console.error(`  ❌ ERROR for ${meta.folder}: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`✅ Done! ${successCount} listings uploaded, ${errorCount} errors.`);
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
