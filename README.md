# VRIDHIRA - Authentic Indian Handicrafts Marketplace

VRIDHIRA is a modern, full-stack e-commerce platform built with Next.js, designed to connect talented Indian artisans with a global audience. It serves as a digital marketplace where artisans can showcase and sell their unique, handcrafted products, and customers can discover and purchase authentic, traditional crafts.

![VRIDHIRA Homepage Screenshot](https://picsum.photos/1200/600?readme)
*<p align="center">A platform that celebrates heritage, craftsmanship, and community.</p>*

---

## ✨ Key Features

This application is built with a role-based architecture to serve different types of users: Customers, Sellers (Artisans), and Owners.

### 👤 For Customers
- **Seamless Authentication:** Sign up or log in using email/password, phone number/password, or social sign-in with Google. Includes secure password reset functionality via both email and phone OTP.
- **Product Discovery:** Browse a beautiful collection of products.
- **Advanced Filtering & Sorting:** Easily find items by category (Pottery, Textiles, etc.), or sort by price and popularity.
- **Detailed Product Pages:** View multiple product images, read detailed descriptions, check reviews, and learn about the artisan who made the item.
- **Shopping Cart & Wishlist:** A fully persistent shopping cart and wishlist to add and manage items.
- **User Account Management:** A dedicated account page to manage personal details, addresses, payment methods, view order history, and see past reviews.

### 🛍️ For Sellers (Artisans)
- **Dedicated Seller Portal:** A separate "Sell with Us" page with dedicated signup and login portals for vendors.
- **Easy Onboarding:** Artisans can create a seller account and set up their shop, specifying its name and category.
- **Shop Management:** A role-based dashboard for sellers to list new products, manage inventory, and delete their own items.

### 👑 For Owners/Admins
- **Owner & Admin Dashboards:** Protected, role-based dashboards for site administrators.
- **User Management:** View all users in the system and manage their roles with a secure hierarchy (Owners > Admins > Shopkeepers > Users).
- **Product Management:** A global view of all products in the marketplace.

---

## 🛠️ Tech Stack & Architecture

VRIDHIRA is built with a modern, robust, and scalable tech stack.

- **Framework:** **Next.js 14+** (using the App Router for server-centric architecture).
- **Language:** **TypeScript** for end-to-end type safety.
- **Styling:** **Tailwind CSS** with **ShadCN/UI** for a beautiful, accessible, and production-ready component library built on Radix UI primitives.
- **Icons:** **Lucide React** for a consistent and clean icon set.
- **Authentication:** **NextAuth.js (v5)** provides secure, session-based authentication with credentials (email/phone) and Google OAuth providers.
- **Firebase Integration:** **Firebase Auth** is used for backend phone number OTP verification, enabling secure phone-based logins and password resets.
- **State Management:** **React Context API** is used for managing global state for the shopping cart and wishlist.
- **Forms & Validation:** **React Hook Form** for performant form handling, paired with **Zod** for robust schema-based validation.
- **Development Backend:** For development, the application uses a **file-based database** (`users.json`, `products.json`, etc.) to simulate a real-world backend, managed via server-side file system operations (`fs`).
- **AI Integration:** **Genkit** is configured for future AI features, such as product description generation or customer support bots.

---

## 🚀 Getting Started

To run this project locally:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add the necessary credentials for Google authentication and Firebase.
    ```env
    # NextAuth Secret
    AUTH_SECRET="your-random-secret"
    
    # Google OAuth Credentials
    AUTH_GOOGLE_ID="your-google-client-id"
    AUTH_GOOGLE_SECRET="your-google-client-secret"
    
    # Firebase Client Config (for phone auth)
    NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
    NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
    ```

3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:9003`.

---

## 📁 Project Structure

The codebase is organized logically to separate concerns:

-   `src/app/`: Contains all the application routes and pages (App Router).
    -   `src/app/api/`: Backend API routes for authentication.
    -   `src/app/account/`: The main customer account management page.
    -   `src/app/dashboard/`: The role-based dashboard for owners, admins, and shopkeepers.
-   `src/components/`: Reusable React components.
    -   `src/components/ui/`: Auto-generated ShadCN UI components.
    -   `src/components/layout/`: Components like Header and Footer.
    -   `src/components/dashboard/`: Components specific to the management dashboards.
-   `src/lib/`: Core business logic, data models, and server actions.
    -   `src/lib/*-actions.ts`: Server-side functions for managing data (users, products, etc.).
    -   `src/lib/*.json`: File-based storage acting as a mock database.
-   `src/context/`: React Context providers for global state (`CartContext`, `WishlistContext`).
-   `src/ai/`: Configuration for Genkit AI flows.
-   `public/`: Static assets like images and fonts.