import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Loader2,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { categoryApi } from '../../../category/api/category.api.js';
import type { Category } from '../../../category/types/index.js';
import type {
  Product,
  ProductStatusType,
  ProductVariant,
  SizeType,
  ColorType,
} from '../../types/index.js';

export interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  categories: Category[];
  onSubmit: (payload: {
    name: string;
    description: string;
    categoryId: string;
    thumbnail: string;
    images: string[];
    price: number;
    discountPrice?: number;
    material?: string;
    fit?: string;
    style?: string;
    tags: string[];
    status: ProductStatusType;
    variants: ProductVariant[];
  }) => void;
  isSubmitting?: boolean;
}

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  isOpen,
  onClose,
  editingProduct,
  categories,
  onSubmit,
  isSubmitting = false,
}) => {
  const [activeFormTab, setActiveFormTab] = useState<'info' | 'images' | 'variants'>('info');

  // Form States
  const [name, setName] = useState('');
  const [parentCategoryType, setParentCategoryType] = useState<string>('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [material, setMaterial] = useState('');
  const [fit, setFit] = useState('');
  const [style, setStyle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState<ProductStatusType>('ACTIVE');
  const [variants, setVariants] = useState<ProductVariant[]>([
    { size: 'M', color: 'WHITE', stock: 10 },
  ]);

  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
  const [isImagesUploading, setIsImagesUploading] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      const currentCat = categories.find((c) => c.id === editingProduct.categoryId);
      setParentCategoryType(currentCat?.type || '');
      setCategoryId(editingProduct.categoryId);
      setPrice(editingProduct.price);
      setDiscountPrice(editingProduct.discountPrice || undefined);
      setDescription(editingProduct.description || '');
      setThumbnail(editingProduct.thumbnail);
      setImages(editingProduct.images || []);
      setMaterial(editingProduct.material || '');
      setFit(editingProduct.fit || '');
      setStyle(editingProduct.style || '');
      setTagsInput(editingProduct.tags ? editingProduct.tags.join(', ') : '');
      setStatus(editingProduct.status);
      setVariants(
        editingProduct.variants && editingProduct.variants.length > 0
          ? editingProduct.variants.map((v) => ({
              size: v.size,
              color: v.color,
              stock: v.stock,
              sku: v.sku,
            }))
          : [{ size: 'M', color: 'WHITE', stock: 10 }]
      );
    } else {
      setName('');
      setParentCategoryType('');
      setCategoryId('');
      setPrice(0);
      setDiscountPrice(undefined);
      setDescription('');
      setThumbnail('');
      setImages([]);
      setMaterial('');
      setFit('');
      setStyle('');
      setTagsInput('');
      setStatus('ACTIVE');
      setVariants([{ size: 'M', color: 'WHITE', stock: 10 }]);
    }
    setActiveFormTab('info');
  }, [editingProduct, isOpen, categories]);

  if (!isOpen) return null;

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsThumbnailUploading(true);
      const res = await categoryApi.adminUploadImage(file);
      setThumbnail(res.data.url);
    } catch {
      // Error handled
    } finally {
      setIsThumbnailUploading(false);
    }
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsImagesUploading(true);
      const urls: string[] = [...images];
      for (let i = 0; i < files.length; i++) {
        const res = await categoryApi.adminUploadImage(files[i]);
        urls.push(res.data.url);
      }
      setImages(urls);
    } catch {
      // Error handled
    } finally {
      setIsImagesUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants([...variants, { size: 'M', color: 'WHITE', stock: 10 }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length === 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariantField = (
    index: number,
    field: keyof ProductVariant,
    value: SizeType | ColorType | number | string | undefined
  ) => {
    const updated = variants.map((v, i) => {
      if (i === index) {
        return { ...v, [field]: value };
      }
      return v;
    });
    setVariants(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || !thumbnail || price <= 0) return;

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      categoryId,
      thumbnail,
      images,
      price,
      discountPrice: discountPrice || undefined,
      material: material.trim() || undefined,
      fit: fit.trim() || undefined,
      style: style.trim() || undefined,
      tags: parsedTags,
      status,
      variants,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        onClick={() => !isSubmitting && onClose()}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col relative z-10 mx-4 transform scale-100 transition-all duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <div>
            <h3 className="text-base font-semibold text-brand-900">
              {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Seoul Blanc E-Commerce Product Center
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-150 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-gray-100 px-6 bg-white">
          <button
            type="button"
            onClick={() => setActiveFormTab('info')}
            className={`py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeFormTab === 'info'
                ? 'border-brand-500 text-brand-900'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Thông tin chung
          </button>
          <button
            type="button"
            onClick={() => setActiveFormTab('images')}
            className={`ml-8 py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeFormTab === 'images'
                ? 'border-brand-500 text-brand-900'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Hình ảnh chi tiết
          </button>
          <button
            type="button"
            onClick={() => setActiveFormTab('variants')}
            className={`ml-8 py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeFormTab === 'variants'
                ? 'border-brand-500 text-brand-900'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Biến thể ({variants.length})
          </button>
        </div>

        {/* Form scrollable container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* === TAB 1: General Info === */}
          {activeFormTab === 'info' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-brand-800 uppercase tracking-wider mb-1.5">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Áo Sơ Mi Linen Cổ Đức..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-brand-800 uppercase tracking-wider mb-1.5">
                    Nhóm lớn (Loại) <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={parentCategoryType}
                    onChange={(e) => {
                      setParentCategoryType(e.target.value);
                      setCategoryId('');
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all bg-white"
                  >
                    <option value="">Chọn nhóm lớn...</option>
                    <option value="TOPS">Áo</option>
                    <option value="BOTTOMS">Quần</option>
                    <option value="OUTERWEAR">Áo khoác</option>
                    <option value="DRESSES">Váy / Đầm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-800 uppercase tracking-wider mb-1.5">
                    Danh mục con <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    disabled={!parentCategoryType}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all bg-white disabled:bg-gray-50 disabled:opacity-50"
                  >
                    <option value="">Chọn danh mục...</option>
                    {categories
                      .filter((cat) => cat.type === parentCategoryType)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-800 uppercase tracking-wider mb-1.5">
                    Trạng thái hiển thị
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProductStatusType)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all bg-white"
                  >
                    <option value="ACTIVE">Đang bán (Active)</option>
                    <option value="OUT_OF_STOCK">Tạm hết hàng (Out of Stock)</option>
                    <option value="INACTIVE">Tạm ẩn (Inactive)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-brand-800 uppercase tracking-wider mb-1.5">
                    Giá bán niêm yết (₫) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="Ví dụ: 350000"
                    value={price || ''}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-800 uppercase tracking-wider mb-1.5">
                    Giá sau giảm khuyến mãi (₫)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Để trống nếu không có giảm giá"
                    value={discountPrice || ''}
                    onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-brand-800 uppercase tracking-wider mb-1.5">
                    Chất liệu
                  </label>
                  <input
                    type="text"
                    placeholder="Linen, Cotton..."
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-800 uppercase tracking-wider mb-1.5">
                    Form dáng (Fit)
                  </label>
                  <input
                    type="text"
                    placeholder="Oversized, Slim..."
                    value={fit}
                    onChange={(e) => setFit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-800 uppercase tracking-wider mb-1.5">
                    Phong cách (Style)
                  </label>
                  <input
                    type="text"
                    placeholder="Hàn Quốc, Cổ điển..."
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-brand-800 uppercase tracking-wider mb-1.5">
                  Tags tìm kiếm (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  placeholder="ao, so mi, thoi trang he, linen..."
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-brand-800 uppercase tracking-wider mb-1.5">
                  Mô tả chi tiết sản phẩm <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  placeholder="Nhập thông tin mô tả chi tiết, hướng dẫn chọn size..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* === TAB 2: Images Upload === */}
          {activeFormTab === 'images' && (
            <div className="space-y-5">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                <label className="block text-[10px] font-bold text-brand-800 uppercase tracking-wider mb-3">
                  Ảnh đại diện sản phẩm (Ảnh chính) <span className="text-red-500">*</span>
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {thumbnail ? (
                    <div className="relative w-28 h-36 border border-gray-200 rounded-xl overflow-hidden group bg-white shadow-sm flex-shrink-0">
                      <img
                        src={thumbnail}
                        alt="Main thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setThumbnail('')}
                        className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow hover:scale-105"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-28 h-36 border-2 border-dashed border-gray-200 rounded-xl bg-white flex flex-col items-center justify-center text-center p-3 flex-shrink-0">
                      <ImageIcon className="text-gray-300 mb-1" size={20} />
                      <span className="text-[9px] text-gray-400">Trống</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <label
                      htmlFor="thumbnail-upload"
                      className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:border-brand-400 hover:bg-brand-50/20 text-gray-700 text-[10px] font-semibold uppercase px-4 py-2 rounded-xl cursor-pointer shadow-sm transition-all"
                    >
                      {isThumbnailUploading ? (
                        <Loader2 className="animate-spin text-brand-500" size={12} />
                      ) : (
                        <Sparkles className="text-brand-500" size={12} />
                      )}
                      Tải ảnh chính
                    </label>
                    <input
                      type="file"
                      id="thumbnail-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleThumbnailUpload}
                      disabled={isThumbnailUploading}
                    />
                    <p className="text-[10px] text-gray-400 leading-normal">
                      Kích thước khuyến nghị 3:4. Ảnh đại diện hiển thị ngoài trang chủ và danh sách sản phẩm.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold text-brand-800 uppercase tracking-wider">
                    Album hình ảnh chi tiết ({images.length} ảnh)
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Thêm hình chụp chi tiết phom dáng, chất vải và các góc chụp khác.
                  </p>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-[3/4] border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
                    >
                      <img
                        src={img}
                        alt={`Slide ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow hover:scale-105"
                      >
                        <X size={8} />
                      </button>
                    </div>
                  ))}

                  <label
                    htmlFor="images-upload"
                    className="aspect-[3/4] border-2 border-dashed border-gray-200 hover:border-brand-400 bg-white hover:bg-brand-50/20 rounded-xl flex flex-col items-center justify-center text-center p-3 cursor-pointer transition-all"
                  >
                    {isImagesUploading ? (
                      <Loader2 className="animate-spin text-brand-500" size={16} />
                    ) : (
                      <Plus className="text-gray-400" size={16} />
                    )}
                    <span className="text-[8px] font-bold text-gray-500 mt-1 uppercase tracking-wider">
                      Tải ảnh phụ
                    </span>
                    <input
                      type="file"
                      id="images-upload"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImagesUpload}
                      disabled={isImagesUploading}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* === TAB 3: Variants builder === */}
          {activeFormTab === 'variants' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-[10px] font-bold text-brand-800 uppercase tracking-wider">
                    Danh sách các biến thể
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Mỗi biến thể là sự kết hợp giữa 1 Kích thước (Size) và 1 Màu sắc (Color) cùng số lượng tồn kho.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-500 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg border border-brand-200 transition-all cursor-pointer"
                >
                  <Plus size={10} />
                  Thêm hàng
                </button>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-[9px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Màu sắc</th>
                      <th className="py-2.5 px-3">Kích thước</th>
                      <th className="py-2.5 px-3">Tồn kho</th>
                      <th className="py-2.5 px-3">SKU (Định dạng tự sinh)</th>
                      <th className="py-2.5 px-3 text-right">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {variants.map((v: ProductVariant, index: number) => (
                      <tr key={index} className="hover:bg-gray-50/50">
                        <td className="py-2 px-3">
                          <select
                            value={v.color}
                            onChange={(e) =>
                              updateVariantField(index, 'color', e.target.value as ColorType)
                            }
                            className="px-2 py-1 border border-gray-200 rounded-lg text-xs outline-none bg-white font-medium text-gray-700 w-28"
                          >
                            <option value="WHITE">WHITE (Trắng)</option>
                            <option value="BLACK">BLACK (Đen)</option>
                            <option value="GRAY">GRAY (Xám)</option>
                            <option value="BEIGE">BEIGE (Kem)</option>
                            <option value="BROWN">BROWN (Nâu)</option>
                            <option value="NAVY">NAVY (Xanh navy)</option>
                            <option value="GREEN">GREEN (Xanh lá)</option>
                            <option value="RED">RED (Đỏ)</option>
                            <option value="BLUE">BLUE (Xanh dương)</option>
                            <option value="PINK">PINK (Hồng)</option>
                            <option value="YELLOW">YELLOW (Vàng)</option>
                            <option value="PURPLE">PURPLE (Tím)</option>
                            <option value="ORANGE">ORANGE (Cam)</option>
                          </select>
                        </td>

                        <td className="py-2 px-3">
                          <select
                            value={v.size}
                            onChange={(e) =>
                              updateVariantField(index, 'size', e.target.value as SizeType)
                            }
                            className="px-2 py-1 border border-gray-200 rounded-lg text-xs outline-none bg-white font-medium text-gray-700 w-20"
                          >
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                          </select>
                        </td>

                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min={0}
                            value={v.stock}
                            onChange={(e) =>
                              updateVariantField(index, 'stock', Number(e.target.value))
                            }
                            className="px-2 py-1 border border-gray-200 rounded-lg text-xs outline-none w-16"
                          />
                        </td>

                        <td className="py-2 px-3 align-middle text-gray-400 font-mono text-[10px]">
                          {v.sku || (
                            <span className="italic text-gray-300">
                              {name ? 'Tự động tạo' : 'Nhập tên trước'}
                            </span>
                          )}
                        </td>

                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            disabled={variants.length === 1}
                            className="p-1 rounded text-gray-400 hover:text-red-500 disabled:opacity-30 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </form>

        {/* Footer controls */}
        <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-b-2xl">
          <div className="text-[10px] text-gray-400 flex items-center gap-1">
            <Sparkles size={12} className="text-brand-500" />
            Hãy đảm bảo các trường bắt buộc (*) và ảnh đầy đủ.
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                !name.trim() ||
                !categoryId ||
                !thumbnail ||
                price <= 0 ||
                isSubmitting ||
                isThumbnailUploading ||
                isImagesUploading
              }
              className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white text-xs font-semibold px-5 py-2 rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
            >
              {isSubmitting && <Loader2 className="animate-spin" size={12} />}
              Lưu sản phẩm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
