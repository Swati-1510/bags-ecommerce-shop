# 🎒 Shivang's Bags - Full-Stack E-Commerce Storefront

A fully functional, responsive, and secure MERN-stack e-commerce application built for a bag retail shop. It features secure user authentication, Razorpay payment gateway integration for UPI and card payments, Cloudinary for product image management, and automated email receipts.

## ✨ Features

- **Modern & Responsive UI**: Built with React, Tailwind CSS, and animated using Framer Motion.
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing.
- **Product Management**: Full CRUD capabilities for administrators to manage bags/inventory.
- **Shopping Cart & Checkout**: Seamless cart experience with real-time total calculations.
- **Integrated Payments**: Razorpay integration supporting UPI, Net Banking, and Credit/Debit Cards.
- **Automated Emails**: Nodemailer integration to automatically send email receipts upon successful purchase.
- **Image Hosting**: Cloudinary integration for scalable and fast image uploads.

## 💻 Tech Stack

**Frontend:**
- React (built with Vite)
- Tailwind CSS (Styling)
- Framer Motion (Animations)
- React Router DOM (Navigation)
- Axios (API requests)
- Lucide React (Icons)

**Backend:**
- Node.js & Express.js (Server framework)
- MongoDB & Mongoose (Database & ORM)
- JSON Web Tokens (JWT) & bcryptjs (Auth)
- Razorpay API (Payment processing)
- Cloudinary & Multer (Image handling)
- Nodemailer (Email service)

---

## 🚀 Getting Started (Local Development)

Follow these steps to set up the project on your local machine.

### Prerequisites
- Node.js installed
- MongoDB installed locally or a free MongoDB Atlas cluster
- Accounts on Cloudinary and Razorpay

### 1. Clone the repository
```bash
git clone https://github.com/your-username/bags-ecommerce-shop.git
cd bags-ecommerce-shop

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and configure environment variables.

```bash

cd backend
npm install
Create a .env file in the backend/ directory based on the .env.example:

env


PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
Start the backend server:

bash


npm run dev
3. Frontend Setup
Open a new terminal tab, navigate to the frontend directory, install dependencies, and configure environment variables.

bash


cd frontend
npm install
Create a .env file in the frontend/ directory based on .env.example:

env


VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
Start the Vite development server:

bash


npm run dev
🌍 Production Deployment
Detailed deployment instructions are available in the 
DEPLOYMENT.md
 file included in this repository.

Brief overview of the deployment stack:

Database: MongoDB Atlas
Backend API: Render (Node.js Web Service)
Frontend Storefront: Vercel
Custom Domain: Configured via GoDaddy DNS
🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page
