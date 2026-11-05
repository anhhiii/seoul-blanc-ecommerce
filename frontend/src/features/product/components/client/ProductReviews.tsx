import React from 'react';
import { Star } from 'lucide-react';

export interface ReviewItem {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: {
    fullName?: string;
    avatar?: string;
  };
}

export interface ProductReviewsProps {
  ratingAverage: number;
  totalReviews: number;
  reviews: ReviewItem[];
  isLoading: boolean;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  ratingAverage,
  totalReviews,
  reviews,
  isLoading,
}) => {
  return (
    <div className="mt-16 bg-white rounded-3xl border border-brand-200/20 p-6 sm:p-8 shadow-xs">
      <div className="border-b border-brand-100 pb-5 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-brand-900 tracking-wide">
            Đánh giá khách hàng
          </h3>
          <p className="text-xs text-brand-500 font-light mt-0.5">
            Xem đánh giá từ các khách hàng đã mua sản phẩm này
          </p>
        </div>
        {totalReviews > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center text-amber-500 gap-1 font-bold text-lg">
              <Star className="fill-amber-400 text-amber-400" size={20} />
              <span>{ratingAverage ? ratingAverage.toFixed(1) : '0.0'}</span>
            </div>
            <span className="text-brand-300 text-lg font-light">|</span>
            <span className="text-xs text-brand-500 font-light">
              {totalReviews} lượt đánh giá
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-brand-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-brand-400 font-light">Đang tải đánh giá...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xs text-brand-400 font-light">
            Sản phẩm này chưa có đánh giá nào. Hãy mua sản phẩm và chia sẻ cảm nhận đầu tiên của bạn!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-brand-100 space-y-6">
          {reviews.map((rev) => {
            const formattedRevDate = new Date(rev.createdAt).toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
            });
            return (
              <div key={rev.id} className="pt-6 first:pt-0 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex-shrink-0 overflow-hidden flex items-center justify-center border border-brand-200">
                  {rev.user?.avatar ? (
                    <img src={rev.user.avatar} alt={rev.user?.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-brand-700 uppercase">
                      {rev.user?.fullName?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1 space-y-1.5 text-left">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-xs font-semibold text-brand-950">
                      {rev.user?.fullName || 'Khách hàng ẩn danh'}
                    </h4>
                    <span className="text-[10px] text-brand-400 font-light">{formattedRevDate}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        className={star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-brand-200'}
                      />
                    ))}
                  </div>
                  {rev.comment && (
                    <p className="text-xs text-brand-700 font-light leading-relaxed pt-0.5">
                      {rev.comment}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;

