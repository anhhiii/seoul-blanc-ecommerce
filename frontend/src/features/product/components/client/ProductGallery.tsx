import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ProductGalleryProps {
  thumbnail: string;
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  thumbnail,
  images,
  productName,
}) => {
  const albumImages = [thumbnail, ...(images || [])];
  const [selectedImage, setSelectedImage] = useState<string>(thumbnail);
  const displayImage = selectedImage || thumbnail;

  const handlePrevImage = () => {
    const currentIndex = albumImages.indexOf(displayImage);
    const prevIndex = (currentIndex - 1 + albumImages.length) % albumImages.length;
    setSelectedImage(albumImages[prevIndex]);
  };

  const handleNextImage = () => {
    const currentIndex = albumImages.indexOf(displayImage);
    const nextIndex = (currentIndex + 1) % albumImages.length;
    setSelectedImage(albumImages[nextIndex]);
  };

  return (
    <div className="lg:col-span-6 space-y-4">
      {/* Big active display image */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-brand-200/50 bg-brand-50 group">
        <img
          src={displayImage}
          alt={productName}
          className="w-full h-full object-cover object-center"
        />

        {/* Image Navigation Buttons */}
        {albumImages.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-xs rounded-full shadow-sm border border-brand-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:bg-white"
            >
              <ChevronLeft size={20} className="text-brand-700" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-xs rounded-full shadow-sm border border-brand-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:bg-white"
            >
              <ChevronRight size={20} className="text-brand-700" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails grid */}
      <div className="flex gap-3 overflow-x-auto pb-1 select-none">
        {albumImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(img)}
            className={`w-20 aspect-[3/4] rounded-xl overflow-hidden bg-brand-50 border transition-all flex-shrink-0 cursor-pointer ${
              displayImage === img
                ? 'border-brand-900 scale-98 shadow-xs'
                : 'border-brand-200/40 opacity-70 hover:opacity-100'
            }`}
          >
            <img src={img} alt={`${productName} view ${idx + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;

