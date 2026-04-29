# M M Attarwala — Premium E-Commerce Store

A full-featured e-commerce web application for **M M Attarwala**, a premium fragrance and lifestyle brand. Built with React.js and Supabase.

---

## Screenshots

### Home Page
![Home Page](screenshots/home.png)

### Shop Page
![Shop Page](screenshots/shop.png)

### Product Detail Page
![Product Page](screenshots/product.png)

### Cart Page
![Cart Page](screenshots/cart.png)

### Checkout Page
![Checkout Page](screenshots/checkout.png)

### Admin Panel
![Admin Panel](screenshots/admin.png)

### Login Page
![Login Page](screenshots/login.png)

---

## Features

- **Home Page** — Hero banner, featured products, brand highlights
- **Shop Page** — Product listing with filters and search
- **Product Detail** — Image gallery, description, star ratings, add to cart
- **Shopping Cart** — Add/remove items, quantity management, price summary
- **Checkout** — Secure checkout flow for authenticated users
- **User Authentication** — Login/signup via Supabase Auth (email + Google OAuth)
- **User Profile** — View and update profile information
- **Order History** — Track past orders
- **Reviews Page** — Customer reviews with star ratings
- **Admin Panel** — Manage products, orders, and customers (protected route)
- **WhatsApp Button** — Quick customer support via WhatsApp
- **Welcome & Exit Popups** — Promotional popups for better engagement
- **Offer Banner** — Scrolling promotional banner
- **Responsive Design** — Fully mobile-friendly UI

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend framework |
| React Router v6 | Client-side routing |
| Supabase | Backend, database & authentication |
| Tailwind CSS | Utility-first styling |
| ShadCN UI | Reusable component library |
| Craco | CRA config override |
| React Helmet Async | SEO meta tags |

---

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/        # Reusable components
│   │   ├── ui/            # ShadCN UI components
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   ├── ProductCard.js
│   │   ├── Popups.js
│   │   ├── StarRating.js
│   │   ├── WhatsAppButton.js
│   │   └── ProtectedRoute.js
│   ├── pages/             # Page-level components
│   │   ├── HomePage.js
│   │   ├── ShopPage.js
│   │   ├── ProductPage.js
│   │   ├── CartPage.js
│   │   ├── CheckoutPage.js
│   │   ├── LoginPage.js
│   │   ├── ProfilePage.js
│   │   ├── OrdersPage.js
│   │   ├── AboutPage.js
│   │   ├── ReviewsPage.js
│   │   ├── ContactPage.js
│   │   └── AdminPage.js
│   ├── context/           # React context providers
│   │   ├── AuthContext.js
│   │   └── CartContext.js
│   ├── lib/               # Utility & API helpers
│   │   ├── supabase.js
│   │   ├── supabaseApi.js
│   │   └── utils.js
│   ├── App.js
│   └── index.js
├── .env.example
├── .gitignore
├── tailwind.config.js
├── craco.config.js
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v16+
- npm or yarn
- A [Supabase](https://supabase.com) account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yasarkureshi/ecommerce-admin-panel.git
   cd ecommerce-admin-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

   ```env
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm start` | Run development server |
| `npm run build` | Build for production |
| `npm test` | Run test suite |

---

## Routes

| Path | Page | Protected |
|---|---|---|
| `/` | Home | No |
| `/shop` | Shop | No |
| `/product/:id` | Product Detail | No |
| `/about` | About Us | No |
| `/reviews` | Reviews | No |
| `/contact` | Contact | No |
| `/cart` | Cart | No |
| `/login` | Login | No |
| `/checkout` | Checkout | Yes |
| `/profile` | User Profile | Yes |
| `/orders` | Order History | Yes |
| `/admin` | Admin Panel | Yes |

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is private. All rights reserved — **M M Attarwala**.

---

## Contact

- GitHub: [@yasarkureshi](https://github.com/yasarkureshi)
- WhatsApp: Available on the website
