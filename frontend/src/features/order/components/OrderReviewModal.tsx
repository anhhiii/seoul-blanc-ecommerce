import React from 'react';
import { Star, X } from 'lucide-react';

export interface OrderReviewModalProps {
  isOpen: boolean;
  productName: string;
  rating: number;
  comment: string;
  onChangeRating: (val: number) => void;
  onChangeComment: (val: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

export const OrderReviewModal: React.FC<OrderReviewModalProps> = ({
  isOpen,
  productName,
  rating,
  comment,
  onChangeRating,
  onChangeComment,
  onSubmit,
  onClose,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-brand-100 pb-4">
          <h3 className="text-sm font-bold text-brand-900 uppercase tracking-wider">
            Đánh giá sản phẩm
          </h3>
          <button
            onClick={onClose}
            className="text-brand-400 hover:text-brand-600 cursor-pointer p-1"
          >
            <X size={16} />
          </button>
        </div>

        <div>
          <span className="text-[11px] text-brand-400 font-light block mb-1">Sản phẩm:</span>
          <p className="text-xs font-semibold text-brand-900 line-clamp-1">{productName}</p>
        </div>

        {/* Star Selection */}
        <div className="space-y-1.5 text-center py-2 bg-brand-50/40 rounded-2xl border border-brand-100">
          <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">Chọn số sao:</span>
          <div className="flex items-center justify-center gap-2 pt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChangeRating(s)}
                className="p-1 hover:scale-110 transition-transform cursor-pointer"
              >
                <Star
                  size={24}
                  className={
                    s <= rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-brand-200 fill-brand-50'
                  }
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-semibold text-amber-600 block">
            {rating === 5 && 'Tuyệt vời'}
            {rating === 4 && 'Hài lòng'}
            {rating === 3 && 'Bình thường'}
            {rating === 2 && 'Không hài lòng'}
            {rating === 1 && 'Rất tệ'}
          </span>
        </div>

        {/* Comment Input */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">
            Nhận xét của bạn (không bắt buộc):
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => onChangeComment(e.target.value)}
            placeholder="Chia sẻ cảm nhận về form dáng, chất vải, độ hoàn thiện của sản phẩm..."
            className="w-full text-xs p-3.5 border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 resize-none font-light text-brand-800"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-brand-200 rounded-xl text-xs font-semibold text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 bg-brand-900 hover:bg-brand-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </div>
      </div>
    </div>
  );
};

