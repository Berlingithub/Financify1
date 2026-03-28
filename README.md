# 💰 Financify - Personal Finance Management System

**Your all-in-one platform for smarter money management.**

Financify is a modern full-stack web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that helps you take control of your finances with an intuitive interface and powerful features.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-17.0.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-14+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-blue)

## About the project
The idea is to help people view and study their overall spend analysis by developing a web app to analyze all the purchases. It is often noticed that we spend more than we earn which is wrong. To address it and keep a record of all the spending and earnings, we have created Financify wherein users can keep a log of their finances and manage them wisely.

<p align="center">
  <img src="./Assets/Screenshots/dashboard.jpg" style="max-width:100%; height:auto;" />
</p>

## Problem Statement
We make transactions every day, and we are never consistent. We use cash, card, or digital wallets and it gets very difficult to actually track where our money goes by the end of the month. We need one single platform for us to track our transactions and help analyze how we can be smart consumers to save as much as possible by spending as little as possible. Rather than going through all the bills at the end of the month, what if we could just click a photo and everything else happens automatically?


## ✨ Features

### 📊 Complete Financial Overview
Get real-time insights on your dashboard:
- Total spent this month
- Income vs expenses breakdown
- Recent transactions
- Active savings goals progress
- Upcoming recurring payments

### 💳 Transaction Management
Track every expense effortlessly:
- 7 categories: Household, Electronics, Fashion, Sports & Fitness, Automobile, Baby Care, Others
- Multiple payment methods: Credit/Debit cards, Cash, Bitcoin, UPI, Net Banking, Digital Wallets
- Edit or delete transactions anytime
- Search and filter through history

### 📱 AI Receipt Scanning
Say goodbye to manual entry! Upload receipt photos and Tesseract.js OCR automatically extracts:
- Merchant name
- Transaction amount
- Date and details

The smart detection system identifies actual bill amounts by filtering out bill numbers, dates, and other non-amount values. Green buttons highlight AI-recommended amounts.

### 🎯 Financial Goals
Achieve your dreams faster:
- Set target amounts and deadlines
- Visual progress tracking
- Incremental fund additions
- Mark goals as complete

### 🔄 Subscription Management
Keep track of recurring payments:
- Netflix, Spotify, gym memberships, and more
- Monthly or annual billing cycles
- Total monthly commitment view
- Payment date tracking

### 📰 Financial News Feed
Stay informed with curated financial news:
- Market trends
- Investment opportunities
- Economic updates that matter

### 👤 Account Control
Full control over your profile:
- Update personal information
- Manage income sources
- View account statistics

## 🛠️ Tech Stack

**Frontend:**
- React.js 17.0.2
- React Bootstrap & Reactstrap
- React Router v6
- Axios
- Chartist.js
- Tesseract.js
- React Toastify
- Styled Components

**Backend:**
- Node.js 14+
- Express.js 4.x
- MongoDB Atlas
- Mongoose 5.x
- Passport.js (Local Strategy)
- Express Session
- Connect-Mongo
- Validator
- Express Rate Limit

## 🚀 Quick Start

### Prerequisites
- Node.js v14 or higher
- npm (comes with Node.js)
- Modern browser (Chrome, Firefox, Edge, Safari)
- MongoDB Atlas account (free tier works)

### Setup Steps

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd "Financify clean"
```

**2. Install dependencies**
```bash
# One command installs everything
npm run install:all

# Or manually:
npm install                    # Root dependencies
cd client && npm install      # Frontend
cd ../server && npm install   # Backend
```

**3. Configure environment variables**

Create a `.env` file in the root folder:
```env
# MongoDB Atlas connection string
DATABASE_KEY=mongodb+srv://username:password@cluster.mongodb.net/financify?retryWrites=true&w=majority

# Session secret (use a random string, min 32 chars)
SESSION_SECRET=your-secret-key-here-min-32-chars

# Server port
PORT=3001

# Environment mode
NODE_ENV=development

# CORS allowed origins
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
```

💡 **Tip:** Check `.env.example` for a template!

**4. Start the application**
```bash
# Starts both backend (port 3001) and frontend (port 3000)
npm start
```

**5. Open your browser**
- Frontend: **http://localhost:3000**
- Backend API: **http://localhost:3001**

That's it! You're ready to go. 🎉

## 📁 Project Structure

```
Financify-clean/
├── client/                     # React Frontend (Port 3000)
│   ├── public/                 # Static files
│   └── src/
│       ├── api/                # API calls (Axios)
│       ├── assets/             # CSS, SCSS, images
│       ├── components/         # Reusable UI components
│       │   ├── Navbar/
│       │   ├── Sidebar/
│       │   ├── Footer/
│       │   ├── TransactionRow/
│       │   └── modelScan.js    # Receipt scanner modal
│       ├── layouts/            # Admin dashboard layout
│       ├── pages/              # Signin, Signup, Home
│       └── views/              # Main app views
│           ├── Dashboard.js
│           ├── Transaction.js
│           ├── Goals.js
│           ├── Subscription.js
│           ├── NewsFeed.js
│           ├── Scan.js
│           └── UserProfile.js
│
├── server/                     # Node.js Backend (Port 3001)
│   ├── Models/                 # MongoDB schemas
│   │   ├── User.js
│   │   ├── Wallet.js
│   │   └── Goals.js
│   ├── Routes/                 # REST API endpoints
│   │   ├── authRoutes.js       # Login, Register, Logout
│   │   ├── transactions.js     # CRUD for transactions
│   │   ├── goals.js            # CRUD for goals
│   │   ├── recurringPayments.js
│   │   ├── incomeSources.js
│   │   ├── overview.js
│   │   └── profile.js
│   ├── index.js                # Express server setup
│   └── middlewares.js          # Auth guards, error handlers
│
├── .env                        # Environment variables
├── .env.example                # Template
├── .gitignore                  # Git ignore rules
└── package.json                # Root scripts
```

## 🔧 Available Commands

### Development Mode
```bash
# Start backend with auto-reload (nodemon)
npm run dev

# Start only frontend
npm run dev:client

# Start only backend
npm run dev:server
```

### Production Mode
```bash
# Build React app for production
npm run build

# Build and start server
npm run serve

# Install all dependencies at once
npm run install:all
```

### For Heroku/Cloud Deployment
```bash
# Auto-runs during deployment
npm run heroku-postbuild
```

## 🎯 How to Use Financify

### First Time Setup

**1. Create Your Account**
- Click "Sign Up" on the landing page
- Enter name, email, and password
- You'll be automatically logged in
- A digital wallet is created instantly

**2. Add Your Income**
- Go to "Income Sources" in the sidebar
- Enter your monthly salary/income amount
- Set the date you receive it

**3. Start Tracking Expenses**

*Option A: Manual Entry*
- Click "Transactions" → "Add Transaction"
- Fill in: name, amount, category, payment method
- Hit save - done!

*Option B: Scan Receipt*
- Click "Scan" in the sidebar
- Upload a receipt photo
- AI extracts merchant and amount
- Review and confirm - transaction created!

**4. Set Financial Goals**
- Navigate to "Goals"
- Click "Add Goal"
- Name it (e.g., "Emergency Fund", "Bali Trip")
- Set target amount and deadline
- Watch your progress bar fill as you save

**5. Track Subscriptions**
- Go to "Manage Subs"
- Add all recurring payments
- See total monthly commitment at a glance

### Daily Usage Flow

```
Login → Dashboard shows:
  ├─ Total spent this month
  ├─ Recent transactions
  ├─ Active goals progress
  └─ Upcoming bills

Quick Actions:
  • Add expense from lunch ☕
  • Check if you're over budget 📊
  • Add money to emergency fund 💰
  • Review subscription renewals 🔄
```

## 🔒 Security & Privacy

- **Password encryption**: bcrypt hashing
- **Session-based authentication**: Secure cookies with httpOnly flag
- **CSRF protection**: SameSite cookie policy
- **Input validation**: Server-side checks on all inputs
- **Rate limiting**: Brute force attack prevention
- **MongoDB Atlas**: Encrypted cloud database

## 🗄️ Database Schema

**User Model:**
- Email (unique, required)
- Password hash (bcrypt)
- Reference to Wallet
- Reference to Goals array

**Wallet Model:**
- Amount spent (monthly tracker)
- Monthly income configuration
- Transactions array (embedded documents)
- Recurring payments array

**Goals Model:**
- Goal name
- Target amount
- Current amount
- Start date (auto-generated)
- End date
- Completed status (boolean)

## 🐛 Troubleshooting

### Can't login/register?
- Check browser console (F12) for errors
- Verify backend is running on port 3001
- Check Network tab for failed API calls
- Ensure DATABASE_KEY is correctly set in .env

### Receipt scan not working?
- Make sure image is clear and well-lit
- Try different image formats (JPG, PNG work best)
- Check browser console for Tesseract.js errors
- Larger images may take longer to process

### Transactions not showing?
- Refresh the page
- Check if you're on the correct month filter
- Verify backend connection in Network tab

### Port already in use?
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure to update tests as appropriate and follow existing code style.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

Built with amazing open-source tools:
- [React](https://reactjs.org/) - UI framework
- [Light Bootstrap Dashboard React](https://github.com/creativetimofficial/light-bootstrap-dashboard-react) - Admin template
- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR engine
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Cloud database
- [Passport.js](http://www.passportjs.org/) - Authentication

## 📬 Contact & Support

**Having issues?**
1. Check the Troubleshooting section above
2. Look at browser DevTools console
3. Review server logs for errors
4. Verify all environment variables are set correctly

**Found a bug?**
Open an issue on GitHub with:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, browser, Node version)

**Have ideas?**
- Share feature suggestions
- Vote on existing feature requests
- Contribute your own implementations

---

Made with ❤️ for smarter money management
