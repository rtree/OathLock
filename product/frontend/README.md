# OathLock Frontend

React + Vite application for OathLock transaction dispute interface.

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Features

- **Deposit Page**: Transaction dispute interface based on the original deposit.html design
- **Responsive Design**: Mobile-friendly layout
- **Modern UI**: Glassmorphism effects, smooth transitions, and interactive elements

## Project Structure

```text
src/
├── components/
│   ├── DepositPage.jsx
│   └── DepositPage.css
├── App.jsx
├── App.css
├── main.jsx
└── index.css
```

## Technology Stack

- **React 18**: Component-based UI framework
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing
- **CSS3**: Modern styling with animations and effects

## Development

The application runs on `http://localhost:3000` by default.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Design

Based on the original deposit.html page with:

- Participant cards (Buyer/Seller) with stats and issue tracking
- Central transaction display with product image and pricing
- Interactive deposit button with state management
- Mobile-responsive design
