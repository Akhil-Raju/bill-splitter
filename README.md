# Bill Splitter App

A mobile-friendly web application for splitting canteen/restaurant bills among friends. Built with Next.js and React, featuring a calculator-style interface optimized for touch devices.

## Features

- **Individual Ordering**: Each person can select their own items from the menu
- **Common Items**: Add shared items (like curry) that get split equally among present people
- **Smart Calculations**: Automatically excludes absent people (those who didn't order anything)
- **Mobile-First Design**: Large touch-friendly buttons perfect for passing around phones
- **Local Storage**: Saves your data automatically, survives browser refreshes
- **Real-time Totals**: See individual costs and splits as you order

## Pre-loaded Menu

**Main Items (₹8 each):**
- Puri, Appam, Dosa, Puttu

**Curries:**
- Kadala Curry (₹15)
- Gravy Curry (₹15) 
- Egg Curry (₹10)

**Beverages:**
- Tea (₹9)
- Coffee (₹10)
- Snacks (₹7)

**Default Friends:** Akhil, Vishnu, Riyas, Dinto, Swapna

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Local Development
1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd bill-splitter
3. Install dependancies:
   npm install --legacy-peer-deps
4. start the development server:
   npm run dev
5. open http://localhost:3000 in your browser
6. 
