import React from 'react';

export interface ProductFilterSidebarProps {
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  onApplyPriceFilter: () => void;
  activeColors: string[];
  onToggleColor: (color: string) => void;
  activeSizes: string[];
  onToggleSize: (size: string) => void;
  colorsList: string[];
  sizesList: string[];
}

export const ProductFilterSidebar: React.FC<ProductFilterSidebarProps> = ({
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onApplyPriceFilter,
  activeColors,
  onToggleColor,
  activeSizes,
  onToggleSize,
  colorsList,
  sizesList,
}) => {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
      {/* Price Filter */}
      <div className="bg-white p-5 rounded-2xl border border-brand-200/50 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-900 mb-4">
          Khoảng giá
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="number"
            placeholder="TỪ"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full text-xs p-2 border border-brand-200 rounded-lg text-center focus:border-brand-500 outline-none"
          />
          <span className="text-brand-400">-</span>
          <input
            type="number"
            placeholder="ĐẾN"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full text-xs p-2 border border-brand-200 rounded-lg text-center focus:border-brand-500 outline-none"
          />
        </div>
        <button
          onClick={onApplyPriceFilter}
          className="w-full bg-brand-900 text-white text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-lg hover:bg-brand-800 transition-colors cursor-pointer"
        >
          Áp dụng
        </button>
      </div>

      {/* Color Filter */}
      <div className="bg-white p-5 rounded-2xl border border-brand-200/50 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-900 mb-4">
          Màu sắc
        </h3>
        <div className="flex flex-wrap gap-2">
          {colorsList.map((color) => {
            const isSelected = activeColors.includes(color);
            return (
              <button
                key={color}
                onClick={() => onToggleColor(color)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? 'border-brand-900 bg-brand-900 text-white shadow-xs'
                    : 'border-brand-200 bg-brand-50 hover:border-brand-400 text-brand-700'
                }`}
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Filter */}
      <div className="bg-white p-5 rounded-2xl border border-brand-200/50 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-900 mb-4">
          Kích thước
        </h3>
        <div className="flex flex-wrap gap-2">
          {sizesList.map((size) => {
            const isSelected = activeSizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => onToggleSize(size)}
                className={`w-10 h-10 rounded-lg text-xs font-semibold transition-all cursor-pointer border flex items-center justify-center ${
                  isSelected
                    ? 'border-brand-900 bg-brand-900 text-white shadow-xs'
                    : 'border-brand-200 bg-brand-50 hover:border-brand-400 text-brand-700'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default ProductFilterSidebar;

