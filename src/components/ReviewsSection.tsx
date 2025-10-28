'use client';

import React, { useState, useEffect } from 'react';
import { Star, User, ThumbsUp, Calendar, MessageSquare } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Review } from '@/types';

interface ReviewsSectionProps {
  restaurantId: string;
  restaurantName: string;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ restaurantId, restaurantName }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    fetchReviews();
  }, [restaurantId, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      let reviewsQuery;
      
      if (sortBy === 'recent') {
        reviewsQuery = query(
          collection(db, 'reviews'),
          where('restaurantId', '==', restaurantId),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
      } else {
        reviewsQuery = query(
          collection(db, 'reviews'),
          where('restaurantId', '==', restaurantId),
          orderBy('rating', 'desc'),
          limit(20)
        );
      }

      const snapshot = await getDocs(reviewsQuery);
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Review));

      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Fallback query without ordering if index not ready
      try {
        const fallbackQuery = query(
          collection(db, 'reviews'),
          where('restaurantId', '==', restaurantId),
          limit(20)
        );
        const snapshot = await getDocs(fallbackQuery);
        const reviewsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Review));

        // Sort in JavaScript
        reviewsData.sort((a, b) => {
          if (sortBy === 'recent') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          } else {
            return b.rating - a.rating;
          }
        });

        setReviews(reviewsData);
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = ratingFilter === 'all' 
    ? reviews 
    : reviews.filter(review => review.rating === ratingFilter);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 
      : 0
  }));

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${sizeClass} ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
          <p className="text-gray-600">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''} for {restaurantName}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end mb-2">
            {renderStars(averageRating, 'lg')}
          </div>
          <p className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
          <p className="text-gray-600 text-sm">out of 5</p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="mb-8 pb-8 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Rating Distribution</h3>
        <div className="space-y-2">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <button
              key={rating}
              onClick={() => setRatingFilter(ratingFilter === rating ? 'all' : rating)}
              className={`w-full flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                ratingFilter === rating ? 'bg-orange-50' : ''
              }`}
            >
              <div className="flex items-center space-x-1 w-32">
                <span className="font-medium text-gray-900">{rating}</span>
                {renderStars(rating, 'sm')}
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-sm text-gray-600 w-16 text-right">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setRatingFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              ratingFilter === 'all'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Reviews
          </button>
          {[5, 4, 3].map(rating => (
            <button
              key={rating}
              onClick={() => setRatingFilter(ratingFilter === rating ? 'all' : rating)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                ratingFilter === rating
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {rating}★ Only
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'recent' | 'rating')}
          className="px-4 py-2 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
        >
          <option value="recent">Most Recent</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-2xl p-6 h-32"></div>
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {ratingFilter !== 'all' ? `No ${ratingFilter}-star reviews yet` : 'No Reviews Yet'}
          </h3>
          <p className="text-gray-600">
            {ratingFilter !== 'all' 
              ? 'Try selecting a different rating or view all reviews'
              : 'Be the first to review this restaurant after placing an order!'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-gradient-to-br from-gray-50 to-orange-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mr-4">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Customer</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-500">•</span>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

              {/* Review Actions */}
              <div className="flex items-center space-x-4 text-sm">
                <button className="flex items-center text-gray-600 hover:text-orange-600 transition-colors">
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Helpful
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {filteredReviews.length >= 20 && (
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors font-medium">
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;

