# VRIDHIRA - Authentic Indian Handicrafts Marketplace

VRIDHIRA is a modern, full-stack e-commerce platform built with Next.js, designed to connect talented Indian artisans with a global audience. It serves as a digital marketplace where artisans can showcase and sell their unique, handcrafted products, and customers can discover and purchase authentic, traditional crafts.

![VRIDHIRA Homepage Screenshot](https://picsum.photos/1200/600?readme)
*<p align="center">A platform that celebrates heritage, craftsmanship, and community.</p>*

---

## ✨ Key Features

This application is built with a role-based architecture to serve different types of users: Customers, Sellers (Artisans), and Owners.

### 👤 For Customers
- **Seamless Authentication:** Sign up or log in using email/password, phone number/password, or social sign-in with Google. Includes secure password reset functionality.
- **Product Discovery:** Browse a beautiful collection of products.
- **Advanced Filtering & Sorting:** Easily find items by category (Pottery, Textiles, etc.), or sort by price and popularity.
- **Detailed Product Pages:** View multiple product images, read detailed descriptions, check reviews, and learn about the artisan who made the item.
- **Shopping Cart:** A fully persistent shopping cart to add and manage items.
- **User Account Management:** A dedicated account page to view order history and manage personal details.

### 🛍️ For Sellers (Artisans)
- **Dedicated Seller Portal:** A separate "Sell with Us" page with dedicated signup and login portals for vendors.
- **Easy Onboarding:** Artisans can create a seller account and set up their shop, specifying its name and category.
- **Shop Management:** (Coming Soon) A dashboard for sellers to list new products, manage inventory, and track their sales.

### 👑 For Owners/Admins
- **Owner Dashboard:** A protected, role-based dashboard for site administrators.
- **User Management:** View all users in the system (customers, shopkeepers, admins).
- **Role Administration:** Securely promote or demote users to different roles (e.g., promote a 'user' to an 'admin').

---

## 🛠️ Tech Stack & Architecture

VRIDHIRA is built with a modern, robust, and scalable tech stack.

- **Framework:** **Next.js 14+** (using the App Router)
- **Language:** **TypeScript**
- **Styling:** **Tailwind CSS** with **ShadCN/UI** for a beautiful, accessible, and production-ready component library.
- **Authentication:** **NextAuth.js (v5)** provides secure, session-based authentication with credentials and Google OAuth providers.
- **Backend & Data Store:** For development, the application uses a **file-based database** (`users.json`, `products.json`, etc.) to simulate a real-world backend.
- **AI Integration:** **Genkit** is configured for future AI features, such as product description generation or customer support bots.

---

## 🚀 Getting Started

To run this project locally:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add the necessary credentials for Google authentication.
    ```env
    AUTH_SECRET="your-random-secret"
    AUTH_GOOGLE_ID="your-google-client-id"
    AUTH_GOOGLE_SECRET="your-google-client-secret"
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
    -   `src/app/(customer)/`: Routes for customers (e.g., `/products`, `/cart`).
    -   `src/app/(vendor)/`: Routes for sellers (e.g., `/vendor/signup`).
-   `src/components/`: Reusable React components.
    -   `src/components/ui/`: Auto-generated ShadCN UI components.
    -   `src/components/layout/`: Components like Header and Footer.
-   `src/lib/`: Core business logic, data models, and actions.
    -   `src/lib/data.ts`: Mock data for products, artisans, etc.
    -   `src/lib/user-actions.ts`: Functions for user management.
-   `src/context/`: React Context providers for global state (e.g., `CartContext`).
-   `src/ai/`: Configuration for Genkit AI flows.
-   `public/`: Static assets like images and fonts.

