import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, Check } from 'lucide-react';
import type { CartItem } from '../types/index.js';

export interface CartItemRowProps {
  item: CartItem;
  isSelected: boolean;
  onToggleSelect: (productVariantId: string) => void;
  onUpdateQuantity: (productVariantId: string, currentQty: number, change: number, stock: number) => void;
  onRemoveItem: (productVariantId: string) => void;
  isUpdating?: boolean;
  isRemoving?: boolean;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  isSelected,
  onToggleSelect,
  onUpdateQuantity,
  onRemoveItem,
  isUpdating = false,
  isRemoving = false,
}) => {
  const product = item.variant?.product;
  const variant = item.variant;

  if (!product || !variant) return null;

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-5 sm:p-6 transition-colors ${
        isSelected ? 'bg-white hover:bg-brand-50/10' : 'bg-brand-50/30 hover:bg-brand-50/50 opacity-70'
      }`}
    >
      {/* Checkbox — desktop (col 1) */}
      <div className="hidden sm:flex col-span-1 items-center justify-center">
        <button
          onClick={() => onToggleSelect(item.productVariantId)}
          className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
            isSelected
              ? 'bg-brand-900 border-brand-900'
              : 'bg-white border-brand-300 hover:border-brand-600'
          }`}
        >
          {isSelected && <Check size={10} strokeWidth={3} className="text-white" />}
        </button>
      </div>

      {/* Info details — desktop col-span-5, mobile full */}
      <div className="col-span-1 sm:col-span-5 flex gap-3">
        {/* Checkbox mobile (inline with image) */}
        <button
          onClick={() => onToggleSelect(item.productVariantId)}
          className={`sm:hidden w-5 h-5 mt-1 rounded border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 self-start ${
            isSelected
              ? 'bg-brand-900 border-brand-900'
              : 'bg-white border-brand-300'
          }`}
        >
          {isSelected && <Check size={11} strokeWidth={3} className="text-white" />}
        </button>

        <Link
          to={`/products/${product.slug || product.id}`}
          className="w-20 aspect-[3/4] rounded-xl overflow-hidden bg-brand-50 border border-brand-200/40 flex-shrink-0"
        >
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </Link>
        <div className="flex flex-col justify-center min-w-0">
          <Link
            to={`/products/${product.slug || product.id}`}
            className="text-sm font-light text-brand-900 hover:text-brand-650 transition-colors line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>

          {/* Variant badges */}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className="text-[9px] uppercase tracking-wider text-brand-500 bg-brand-50 border border-brand-200/50 px-2 py-0.5 rounded-md font-semibold">
              Size: {variant.size}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-brand-500 bg-brand-50 border border-brand-200/50 px-2 py-0.5 rounded-md font-semibold">
              Màu: {variant.color}
            </span>
          </div>

          {/* Remove (mobile) */}
          <button
            onClick={() => onRemoveItem(item.productVariantId)}
            className="sm:hidden text-left text-red-500 hover:text-red-700 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 mt-2.5 transition-colors cursor-pointer"
          >
            <Trash2 size={11} />
            Xóa
          </button>
        </div>
      </div>

      {/* Unit price */}
      <div className="col-span-1 sm:col-span-2 text-left sm:text-center flex sm:block justify-between items-center sm:border-0 border-t border-brand-100/55 pt-2 sm:pt-0">
        <span className="sm:hidden text-[10px] font-bold text-brand-800 uppercase">Đơn giá:</span>
        <span className="text-xs font-semibold text-brand-900">
          {item.price.toLocaleString('vi-VN')}₫
        </span>
      </div>

      {/* Quantity Selector */}
      <div className="col-span-1 sm:col-span-2 flex sm:justify-center items-center justify-between sm:border-0 border-t border-brand-100/55 pt-2 sm:pt-0">
        <span className="sm:hidden text-[10px] font-bold text-brand-800 uppercase">Số lượng:</span>
        <div className="flex items-center border border-brand-200 rounded-lg overflow-hidden h-8 bg-white">
          <button
            onClick={() => onUpdateQuantity(item.productVariantId, item.quantity, -1, variant.stock)}
            disabled={item.quantity <= 1 || isUpdating}
            className="w-8 h-full flex items-center justify-center hover:bg-brand-50 text-brand-600 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <Minus size={10} />
          </button>
          <span className="w-8 text-center text-xs font-bold text-brand-900">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.productVariantId, item.quantity, 1, variant.stock)}
            disabled={item.quantity >= variant.stock || isUpdating}
            className="w-8 h-full flex items-center justify-center hover:bg-brand-50 text-brand-600 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <Plus size={10} />
          </button>
        </div>
      </div>

      {/* Line total + delete */}
      <div className="col-span-1 sm:col-span-2 text-right flex sm:block justify-between items-center sm:border-0 border-t border-brand-100/55 pt-2 sm:pt-0">
        <span className="sm:hidden text-[10px] font-bold text-brand-800 uppercase">Tổng:</span>
        <div className="flex sm:flex-col items-center sm:items-end gap-3 justify-end w-full">
          <span className="text-xs font-bold text-brand-900">
            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
          </span>
          <button
            onClick={() => onRemoveItem(item.productVariantId)}
            disabled={isRemoving}
            className="hidden sm:inline-flex text-brand-400 hover:text-red-500 transition-colors p-1 cursor-pointer disabled:opacity-40"
            title="Xóa sản phẩm"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

