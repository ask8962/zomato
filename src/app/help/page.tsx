'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Search, ChevronDown, ChevronUp, HelpCircle, Phone, Mail, MessageCircle, ShoppingBag, User, CreditCard, Truck, Star } from 'lucide-react';

const HelpPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const faqCategories = [
    {
      id: 'orders',
      title: 'Orders & Delivery',
      icon: ShoppingBag,
      faqs: [
        {
          id: 'o1',
          question: 'How do I place an order?',
          answer: 'To place an order: 1) Browse restaurants in the Restaurants page, 2) Select your desired restaurant, 3) Add items to your cart, 4) Go to checkout, 5) Fill in your delivery details, 6) Confirm your order. You\'ll receive real-time updates on your order status.'
        },
        {
          id: 'o2',
          question: 'What is the minimum order value?',
          answer: 'The minimum order value varies by restaurant, typically ranging from ₹150 to ₹300. You can see the minimum order requirement for each restaurant on their page.'
        },
        {
          id: 'o3',
          question: 'How long does delivery take?',
          answer: 'Most deliveries are completed within 30-45 minutes. The exact delivery time depends on your location, restaurant preparation time, and current demand. You can see the estimated delivery time for each restaurant.'
        },
        {
          id: 'o4',
          question: 'Can I track my order?',
          answer: 'Yes! You can track your order in real-time from the Orders page. You\'ll see updates as your order moves from confirmed → preparing → ready → delivered. You\'ll also see the estimated delivery time.'
        },
        {
          id: 'o5',
          question: 'Can I cancel my order?',
          answer: 'You can request order cancellation by contacting us at +91 8962393954. Please note that orders can only be cancelled before the restaurant starts preparing your food.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Profile',
      icon: User,
      faqs: [
        {
          id: 'a1',
          question: 'How do I create an account?',
          answer: 'Click on "Sign Up" in the navigation bar. Fill in your details including name, email, password, and choose your account type (Customer or Restaurant Owner). You can also sign up using Google for faster registration.'
        },
        {
          id: 'a2',
          question: 'I forgot my password. What should I do?',
          answer: 'On the login page, click "Forgot your password?". Enter your email address and you\'ll receive instructions to reset your password.'
        },
        {
          id: 'a3',
          question: 'How do I update my profile information?',
          answer: 'Go to your Profile page from the navigation menu. Click "Edit Profile" to update your name, phone number, or address. Don\'t forget to click "Save Changes" when you\'re done.'
        },
        {
          id: 'a4',
          question: 'Can I change my email address?',
          answer: 'For security reasons, email addresses cannot be changed directly. Please contact our support team at ganukalp70@gmail.com if you need to update your email address.'
        }
      ]
    },
    {
      id: 'payment',
      title: 'Payment & Pricing',
      icon: CreditCard,
      faqs: [
        {
          id: 'p1',
          question: 'What payment methods do you accept?',
          answer: 'Currently, we accept Cash on Delivery (COD). Online payment options (credit/debit cards, UPI, wallets) will be available soon.'
        },
        {
          id: 'p2',
          question: 'Is there a delivery fee?',
          answer: 'Yes, delivery fees vary by restaurant, typically ranging from ₹20 to ₹50. The exact delivery fee is shown on each restaurant\'s page and in your cart before checkout.'
        },
        {
          id: 'p3',
          question: 'Do you offer any discounts?',
          answer: 'We regularly offer promotional discounts and deals. Keep an eye on our homepage and notifications for special offers. First-time users often get special discounts!'
        },
        {
          id: 'p4',
          question: 'Can I get a refund if I\'m not satisfied?',
          answer: 'If you\'re not satisfied with your order, please contact us immediately at +91 8962393954. We\'ll work to resolve the issue. Refund eligibility depends on the specific situation.'
        }
      ]
    },
    {
      id: 'restaurants',
      title: 'For Restaurants',
      icon: Truck,
      faqs: [
        {
          id: 'r1',
          question: 'How can I register my restaurant?',
          answer: 'Create an account as a "Restaurant Owner", then go to the Shopkeeper Dashboard and click "Register Restaurant". Fill in your restaurant details and submit for approval. Our admin team will review your application within 24-48 hours.'
        },
        {
          id: 'r2',
          question: 'How long does approval take?',
          answer: 'Restaurant approvals typically take 24-48 hours. We review all applications to ensure quality standards. You\'ll be notified via email once your restaurant is approved.'
        },
        {
          id: 'r3',
          question: 'How do I manage my menu?',
          answer: 'Once your restaurant is approved, go to your Shopkeeper Dashboard and click "Manage Menu". You can add, edit, or remove menu items, set prices, and mark items as available or unavailable.'
        },
        {
          id: 'r4',
          question: 'How do I receive orders?',
          answer: 'You\'ll see all incoming orders in real-time on your Shopkeeper Dashboard. You can update order status as you prepare the food. Make sure to update the status promptly to keep customers informed.'
        },
        {
          id: 'r5',
          question: 'What are the commission charges?',
          answer: 'Our commission structure is competitive and designed to be fair for restaurant partners. Please contact us at ganukalp70@gmail.com for detailed commission information.'
        }
      ]
    },
    {
      id: 'other',
      title: 'Other Questions',
      icon: HelpCircle,
      faqs: [
        {
          id: 'x1',
          question: 'Which cities do you serve?',
          answer: 'We currently serve tier 2 and tier 3 cities across India. We\'re expanding rapidly! Check the restaurant availability in your area by browsing our Restaurants page.'
        },
        {
          id: 'x2',
          question: 'How do I provide feedback or write a review?',
          answer: 'After your order is delivered, you can write a review by going to the order details page and clicking "Write a Review". Your feedback helps us improve and helps other customers make informed decisions.'
        },
        {
          id: 'x3',
          question: 'Is my personal information safe?',
          answer: 'Yes! We take data security very seriously. All your personal information is encrypted and stored securely. We never share your information with third parties without your consent. Read our Privacy Policy for more details.'
        },
        {
          id: 'x4',
          question: 'How can I add restaurants to my favorites?',
          answer: 'On any restaurant page, click the heart icon to add it to your favorites. You can view all your favorite restaurants on the Favorites page for easy access.'
        },
        {
          id: 'x5',
          question: 'Do you have a mobile app?',
          answer: 'We\'re currently working on native mobile apps for iOS and Android. In the meantime, our website is fully mobile-responsive and works great on all devices!'
        }
      ]
    }
  ];

  const toggleFaq = (faqId: string) => {
    setOpenFaqId(openFaqId === faqId ? null : faqId);
  };

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      searchTerm === '' ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium backdrop-blur-sm">
                <HelpCircle className="w-4 h-4 mr-2" />
                We're Here to Help
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Help <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Center</span>
            </h1>
            <p className="text-2xl text-orange-100 max-w-3xl mx-auto leading-relaxed mb-8">
              Find answers to frequently asked questions
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-16 pr-6 py-5 text-gray-900 rounded-3xl focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 text-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <a href="tel:+918962393954" className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Call Us</h3>
            <p className="text-gray-600">+91 8962393954</p>
          </a>

          <a href="mailto:ganukalp70@gmail.com" className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
            <p className="text-gray-600">ganukalp70@gmail.com</p>
          </a>

          <a href="/contact" className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Form</h3>
            <p className="text-gray-600">Send us a message</p>
          </a>
        </div>

        {/* FAQ Sections */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 max-w-md mx-auto">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No results found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any FAQs matching your search. Try different keywords or contact our support team.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="bg-orange-600 text-white px-6 py-3 rounded-2xl hover:bg-orange-700 transition-colors font-semibold"
              >
                Clear Search
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Category Header */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-8 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mr-4">
                      <category.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                      <p className="text-gray-600">{category.faqs.length} questions</p>
                    </div>
                  </div>
                </div>

                {/* FAQ Items */}
                <div className="divide-y divide-gray-100">
                  {category.faqs.map((faq) => (
                    <div key={faq.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                        {openFaqId === faq.id ? (
                          <ChevronUp className="w-6 h-6 text-orange-600 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      
                      {openFaqId === faq.id && (
                        <div className="mt-4 text-gray-700 leading-relaxed pl-0 animate-slide-in-up">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Still Need Help? */}
        <div className="mt-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl shadow-2xl p-12 text-center text-white">
          <HelpCircle className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto mb-8">
            Can't find what you're looking for? Our support team is here to help you 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Contact Support
            </a>
            <a
              href="tel:+918962393954"
              className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-orange-600 transition-all duration-300 transform hover:scale-105"
            >
              Call Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
