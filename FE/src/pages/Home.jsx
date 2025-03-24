import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import { formatCurrency } from "../utils/formatCurrency";

const Home = () => {
  // This would be replaced with real auth context
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Toggle for demo purposes
  const toggleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <div className="bg-gray-50">
      {!isLoggedIn ? (
        <LandingPage onLogin={toggleLogin} />
      ) : (
        <Dashboard onLogout={toggleLogin} />
      )}
    </div>
  );
};

// Landing page for non-authenticated users
const LandingPage = ({ onLogin }) => {
  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Take control of your finances
              </h1>
              <p className="mt-6 text-xl max-w-3xl">
                FinancePro helps you track expenses, create budgets, and achieve
                your financial goals with ease.
              </p>
              <div className="mt-10 flex space-x-4">
                <Button size="large" onClick={onLogin}>
                  Get Started
                </Button>
                <Button size="large" variant="outline" className="bg-white">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="mt-12 lg:mt-0 flex justify-center">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
                <div className="bg-gray-50 px-4 py-5 border-b border-gray-200 sm:px-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Monthly Overview
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex justify-between mb-6">
                    <div>
                      <h4 className="text-gray-500 text-sm">Income</h4>
                      <p className="text-green-600 text-2xl font-bold">
                        $4,500.00
                      </p>
                    </div>
                    <div>
                      <h4 className="text-gray-500 text-sm">Expenses</h4>
                      <p className="text-red-600 text-2xl font-bold">
                        $3,250.00
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-200 h-4 rounded-full">
                    <div
                      className="bg-green-500 h-4 rounded-full"
                      style={{ width: "72%" }}
                    ></div>
                  </div>
                  <div className="mt-4 mb-6">
                    <h4 className="text-gray-500 text-sm">Remaining</h4>
                    <p className="text-gray-800 text-2xl font-bold">
                      $1,250.00
                    </p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { category: "Housing", amount: 1200, percentage: 37 },
                      { category: "Food", amount: 600, percentage: 18 },
                      { category: "Transport", amount: 450, percentage: 14 },
                      { category: "Shopping", amount: 350, percentage: 11 },
                    ].map((item) => (
                      <div
                        key={item.category}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                          <span className="text-gray-700">{item.category}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-900 font-medium">
                            ${item.amount}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {item.percentage}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Manage your money with confidence
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Our intuitive tools help you track spending, save more, and reach
              your financial goals.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  title: "Track Expenses",
                  description:
                    "Easily log and categorize all your expenses in real-time to stay on top of your spending habits.",
                },
                {
                  title: "Create Budgets",
                  description:
                    "Set up personalized budgets for different categories and get alerts when you’re nearing your limits.",
                },
                {
                  title: "Financial Goals",
                  description:
                    "Define your savings goals and track your progress with clear, actionable insights.",
                },
              ].map((feature) => (
                <Card key={feature.title} className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-gray-600">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of users who trust FinancePro to manage their
            finances.
          </p>
          <div className="mt-8">
            <Button size="large" onClick={onLogin}>
              Sign Up Now
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

// Dashboard for authenticated users
const Dashboard = ({ onLogout }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <Button variant="outline" onClick={onLogout}>
          Logout
        </Button>
      </div>

      {/* Overview Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Balance</h3>
          <p className="mt-2 text-3xl font-bold text-gray-800">
            {formatCurrency(1250)}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900">Monthly Income</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {formatCurrency(4500)}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900">
            Monthly Expenses
          </h3>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {formatCurrency(3250)}
          </p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Link to="/transactions">
            <Button className="w-full">Add Transaction</Button>
          </Link>
          <Link to="/budgets">
            <Button className="w-full">Create Budget</Button>
          </Link>
          <Link to="/categories">
            <Button className="w-full">Manage Categories</Button>
          </Link>
          <Link to="/accounts">
            <Button className="w-full">View Accounts</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
