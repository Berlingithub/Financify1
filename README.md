# 🚀 FINANCIFY

<div align="center">
  <img src="client/src/images/favicon.png" alt="Financify Logo" width="100" height="100">
  
   <h3 align="center">FINANCIFY</h3>
  
  <p>
    <strong>Live Demo:</strong> <a href="https://financify-zeta.netlify.app/">https://financify-zeta.netlify.app/</a><br>
    <em>Best experienced on Firefox Browser</em>
  </p>
  
  <p>
    A web-app made using MERN stack which acts as a hub for all the transactions, subscriptions and goals one wants to keep a track of.
    Record your transactions by just clicking a photo of the bill/receipt.
  </p>
</div>

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [Problem Statement](#problem-statement)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 About The Project

Financify addresses the common challenge of inconsistent financial tracking across multiple payment methods (cash, cards, digital wallets). By providing a unified platform, users can:

- **Track all transactions** in one place
- **Analyze spending patterns** to become smarter consumers
- **Save money** by understanding where funds are going
- **Automate receipt processing** with photo capture instead of manual entry

<div align="center">
  <img src="client/src/images/landing.png" alt="Financify Landing Page" width="100%">
</div>

---

## 🔍 Problem Statement

Managing personal finances is challenging because:
- **Multiple payment methods** (cash, cards, digital wallets) create scattered records
- **Manual tracking** is time-consuming and error-prone
- **End-of-month analysis** becomes overwhelming with piles of receipts
- **Lack of insights** prevents informed financial decisions

**Solution:** A single platform that automatically processes receipts and provides comprehensive financial analytics.

---

## 🛠️ Tech Stack

### Frontend
- **[React.js](https://reactjs.org/)** - Modern UI framework
- **[Bootstrap](https://getbootstrap.com)** - Responsive CSS framework
- **[React Bootstrap](https://react-bootstrap.github.io/)** - React components
- **[Styled Components](https://styled-components.com/)** - CSS-in-JS styling

### Backend
- **[Node.js](https://nodejs.org/en/)** - JavaScript runtime
- **[Express.js](https://expressjs.com/)** - Web application framework
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database
- **[Passport.js](https://passportjs.org/)** - Authentication middleware

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (Latest LTS version)
- **npm** (Comes with Node.js)
- **MongoDB** (Local or Atlas cloud database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Berlingithub/Financify.git
   cd Financify
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd client
   npm install
   
   # Install backend dependencies
   cd ../Server
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the `Server` directory:
   ```env
   DATABASE_KEY=mongodb+srv://username:password@cluster.mongodb.net/financify
   SESSION_SECRET=your_session_secret_here
   ```
   
   <div align="center">
     <img src="client/src/images/1.png" alt="Database Configuration" width="50%">
   </div>

4. **Start the application**
   ```bash
   # Terminal 1: Start backend server
   cd Server
   npm start
   
   # Terminal 2: Start frontend client
   cd client
   npm start
   ```

5. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:3001](http://localhost:3001)
   - Dashboard: [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)

---

## 📁 Project Structure

```
Financify/
├── Assets/                     # Project assets and screenshots
├── client/                     # React frontend application
│   ├── public/                # Static files
│   ├── src/                   # Source code
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── views/            # Dashboard views
│   │   ├── api/              # API configuration
│   │   ├── assets/           # Images, CSS, fonts
│   │   └── index.js          # Main entry point
│   ├── package.json           # Frontend dependencies
│   └── jsconfig.json         # JavaScript configuration
├── Server/                     # Express backend application
│   ├── Models/                # Database models
│   ├── Routes/                # API route handlers
│   ├── middlewares/           # Custom middleware
│   ├── index.js               # Main server file
│   ├── .env                   # Environment variables
│   └── package.json           # Backend dependencies
├── package.json                # Root package.json
├── LICENSE                     # MIT License
└── README.md                   # This file
```

---

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/logout` - User logout

### Transactions
- `GET /transaction` - Get all transactions
- `POST /transaction` - Create new transaction
- `PUT /transaction` - Update transaction
- `DELETE /transaction` - Delete transaction

### Goals
- `GET /goals` - Get user goals
- `POST /goals` - Create new goal
- `PUT /goals` - Update goal
- `DELETE /goals` - Delete goal

### Subscriptions
- `GET /recurring` - Get recurring payments
- `POST /recurring` - Create subscription
- `PUT /recurring` - Update subscription
- `DELETE /recurring` - Delete subscription

---

## 🎨 Features

### Core Functionality
- **Transaction Management** - Track all income and expenses
- **Receipt Scanning** - OCR-powered receipt processing
- **Goal Setting** - Set and track financial goals
- **Subscription Management** - Monitor recurring payments
- **Financial Analytics** - Spending insights and reports
- **User Authentication** - Secure login and registration

### Dashboard Features
- **Overview** - Financial summary and charts
- **Wallet Management** - Transaction history and categorization
- **Receipt Scanner** - Photo-based transaction entry
- **Goals Tracker** - Progress monitoring and completion
- **News Feed** - Personalized financial tips and offers
- **User Profile** - Account settings and income management

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **MongoDB Atlas** for cloud database hosting
- **React Community** for excellent documentation
- **Express.js Team** for the robust backend framework
- **Bootstrap Team** for the responsive CSS framework

---

<div align="center">
  <p><strong>Made with ❤️ by the Financify Team</strong></p>
  <p>Questions? Open an issue or reach out to us!</p>
</div>
