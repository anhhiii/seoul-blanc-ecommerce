import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit2, ShieldAlert, Check, X, Search, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { useAddress } from '../../features/address/hooks/useAddress.js';
import type { Address } from '../../features/address/types/index.js';
import { AddressMap } from '../../features/address/components/AddressMap.js';

interface ProvinceData {
  province_code: string;
  name: string;
}

interface WardData {
  ward_code: string;
  ward_name: string;
  province_code: string;
  province_name?: string;
  province_short_name?: string;
  merger_details?: string;
  old_units?: string[];
}

export const AddressesPage: React.FC = () => {
  const {
    useGetAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddress();

  const { data: addressesRes, isLoading, isError } = useGetAddresses();
  const addresses = addressesRes?.data?.addresses || [];

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Form States
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [province, setProvince] = useState('');
  const [provinceCode, setProvinceCode] = useState<string | ''>('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [wardCode, setWardCode] = useState<string | ''>('');
  const [detail, setDetail] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isDefault, setIsDefault] = useState(false);

  // API Dropdown Data
  const [provinces, setProvinces] = useState<ProvinceData[]>([]);
  const [wards, setWards] = useState<WardData[]>([]);
  
  // Loading indicators
  const [provincesLoading, setProvincesLoading] = useState(false);
  const [wardsLoading, setWardsLoading] = useState(false);

  // Geocoding helper states
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [reverseGeocodedText, setReverseGeocodedText] = useState('');
  const [rawAddressObj, setRawAddressObj] = useState<any>(null);

  // Fetch Provinces on Mount from the new 34 provinces API
  useEffect(() => {
    const fetchProvinces = async () => {
      setProvincesLoading(true);
      try {
        const res = await fetch('https://34tinhthanh.com/api/provinces');
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        setProvinces(data);
      } catch (err) {
        console.error('Failed to fetch provinces', err);
        toast.error('Không thể tải danh sách Tỉnh/Thành phố mới');
      } finally {
        setProvincesLoading(false);
      }
    };
    fetchProvinces();
  }, []);

  // Helper helper to clean strings for matching
  const cleanStr = (s: string) => {
    return s
      .toLowerCase()
      .replace(/tỉnh|thành phố|tp\.|phường|xã|thị trấn|quận|huyện|đường/g, '')
      .trim();
  };

  // Reset form helper
  const resetForm = () => {
    setFullName('');
    setPhoneNumber('');
    setProvince('');
    setProvinceCode('');
    setDistrict('');
    setWard('');
    setWardCode('');
    setDetail('');
    setLatitude(null);
    setLongitude(null);
    setIsDefault(false);
    setReverseGeocodedText('');
    setRawAddressObj(null);
    setWards([]);
    setEditingAddress(null);
  };

  // Open Modal to Create
  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  // Open Modal to Edit
  const handleOpenEdit = async (address: Address) => {
    resetForm();
    setEditingAddress(address);
    setFullName(address.fullName);
    setPhoneNumber(address.phoneNumber);
    setDetail(address.detail);
    setDistrict(address.district || '');
    setLatitude(address.latitude || null);
    setLongitude(address.longitude || null);
    setIsDefault(address.isDefault);
    setModalOpen(true);

    try {
      setProvincesLoading(true);
      const resP = await fetch('https://34tinhthanh.com/api/provinces');
      const dataP: ProvinceData[] = await resP.json();
      setProvinces(dataP);
      
      const matchP = dataP.find(
        (p) => cleanStr(p.name) === cleanStr(address.province)
      );
      
      if (matchP) {
        setProvince(matchP.name);
        setProvinceCode(matchP.province_code);

        // Fetch new wards
        const resW = await fetch(`https://34tinhthanh.com/api/wards?province_code=${matchP.province_code}`);
        const dataW: WardData[] = await resW.json();
        setWards(dataW);

        const matchW = dataW.find(
          (w) => cleanStr(w.ward_name) === cleanStr(address.ward)
        );
        if (matchW) {
          setWard(matchW.ward_name);
          setWardCode(matchW.ward_code);
        }
      }
    } catch (err) {
      console.error('Failed to load address structures during edit', err);
    } finally {
      setProvincesLoading(false);
    }
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !phoneNumber || !province || !ward || !detail) {
      toast.error('Vui lòng điền đầy đủ các thông tin địa chỉ bắt buộc.');
      return;
    }

    const payload = {
      fullName,
      phoneNumber,
      province,
      district: district || province, // fallback if district is empty
      ward,
      detail,
      latitude,
      longitude,
      isDefault,
    };

    if (editingAddress) {
      updateAddress.mutate(
        { id: editingAddress.id, data: payload },
        {
          onSuccess: () => {
            setModalOpen(false);
            resetForm();
          },
        }
      );
    } else {
      createAddress.mutate(payload, {
        onSuccess: () => {
          setModalOpen(false);
          resetForm();
        },
      });
    }
  };

  // Handle Location Selected from Map
  const handleLocationSelect = async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);

    // Call Reverse Geocode from OpenStreetMap Nominatim
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
      );
      if (res.ok) {
        const data = await res.json();
        setReverseGeocodedText(data.display_name || '');
        setRawAddressObj(data.address || null);
      }
    } catch (err) {
      console.error('Failed to reverse geocode', err);
    }
  };

  // Apply Reverse Geocoded Address Components (Province, Ward, and remaining to Detail)
  const handleApplyReverseGeocode = async () => {
    if (!reverseGeocodedText) return;

    // Retrieve name tokens from OSM address payload
    const rawProvinceName = rawAddressObj?.city || rawAddressObj?.town || rawAddressObj?.state || rawAddressObj?.province || '';
    const rawWardName = rawAddressObj?.ward || rawAddressObj?.quarter || rawAddressObj?.subdistrict || rawAddressObj?.village || rawAddressObj?.neighbourhood || rawAddressObj?.suburb || '';
    const rawDistrictName = rawAddressObj?.city_district || rawAddressObj?.district || rawAddressObj?.county || '';

    // 1. Find matched province
    let foundProvince = null;
    let foundProvinceCode = '';

    // Try mapping with raw names first
    if (rawProvinceName) {
      const match = provinces.find((p) => cleanStr(p.name) === cleanStr(rawProvinceName));
      if (match) {
        foundProvince = match.name;
        foundProvinceCode = match.province_code;
      }
    }

    // Fallback: parse from split parts
    const parts = reverseGeocodedText.split(',').map((p) => p.trim());
    if (!foundProvince) {
      for (const part of parts) {
        const match = provinces.find((p) => cleanStr(p.name) === cleanStr(part));
        if (match) {
          foundProvince = match.name;
          foundProvinceCode = match.province_code;
          break;
        }
      }
    }

    if (!foundProvince || !foundProvinceCode) {
      toast.error('Không thể tự động nhận dạng Tỉnh/Thành phố mới. Vui lòng chọn thủ công.');
      return;
    }

    // Set Province
    setProvince(foundProvince);
    setProvinceCode(foundProvinceCode);
    setWardsLoading(true);

    try {
      // 2. Fetch new wards list for this province
      const res = await fetch(`https://34tinhthanh.com/api/wards?province_code=${foundProvinceCode}`);
      if (res.ok) {
        const dataW: WardData[] = await res.json();
        setWards(dataW);

        // 3. Find matched ward using exact clean name comparison
        let foundWard = null;
        let foundWardCode = '';

        // Match from OSM fields first
        if (rawWardName) {
          const match = dataW.find((w) => cleanStr(w.ward_name) === cleanStr(rawWardName));
          if (match) {
            foundWard = match.ward_name;
            foundWardCode = match.ward_code;
          }
        }

        // Fallback: match from parts
        if (!foundWard) {
          for (const part of parts) {
            const match = dataW.find((w) => cleanStr(w.ward_name) === cleanStr(part));
            if (match) {
              foundWard = match.ward_name;
              foundWardCode = match.ward_code;
              break;
            }
          }
        }

        if (foundWard && foundWardCode) {
          setWard(foundWard);
          setWardCode(foundWardCode);
          setDistrict(rawDistrictName || foundProvince);
        } else {
          setWard('');
          setWardCode('');
          setDistrict(rawDistrictName || foundProvince);
        }

        // 4. Construct detail address from remaining parts
        const filterOut = (part: string) => {
          const p = part.toLowerCase();
          if (p === 'việt nam' || p === 'vietnam') return false;
          if (/^\d{5,6}$/.test(part)) return false; // zip
          if (cleanStr(part) === cleanStr(foundProvince || '')) return false;
          if (foundWard && cleanStr(part) === cleanStr(foundWard)) return false;
          return true;
        };

        const detailParts = parts.filter(filterOut);
        const newDetail = detailParts.join(', ');
        setDetail(newDetail);
        toast.success('Đã tự động áp dụng thông tin địa lý hành chính mới!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải thông tin Phường/Xã mới');
    } finally {
      setWardsLoading(false);
    }
  };

  // Geocode from Address inputs
  const handlePinFromAddress = async () => {
    if (!province) {
      toast.error('Vui lòng chọn Tỉnh/Thành phố trước khi định vị');
      return;
    }

    const searchQuery = [detail, ward, district, province, 'Việt Nam']
      .filter(Boolean)
      .join(', ');

    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1&accept-language=vi`
      );
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();

      if (data && data.length > 0) {
        const match = data[0];
        setLatitude(parseFloat(match.lat));
        setLongitude(parseFloat(match.lon));
        setReverseGeocodedText(match.display_name || '');
        setRawAddressObj(match.address || null);
        toast.success('Định vị vị trí trên bản đồ thành công!');
      } else {
        // Try broader search
        const broadQuery = [ward, province, 'Việt Nam'].filter(Boolean).join(', ');
        const broadRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            broadQuery
          )}&limit=1&accept-language=vi`
        );
        const broadData = await broadRes.json();
        if (broadData && broadData.length > 0) {
          const match = broadData[0];
          setLatitude(parseFloat(match.lat));
          setLongitude(parseFloat(match.lon));
          toast.warning('Không tìm thấy địa chỉ chi tiết. Đã định vị khu vực Phường/Xã.');
        } else {
          toast.error('Không thể tìm thấy địa chỉ này trên bản đồ. Vui lòng chọn thủ công.');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Đã xảy ra lỗi khi tìm kiếm vị trí');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Browser Geolocation position pick
  const handleCurrentPosition = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt của bạn không hỗ trợ tự động định vị.');
      return;
    }

    toast.info('Đang xác định vị trí của bạn...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleLocationSelect(pos.coords.latitude, pos.coords.longitude);
        toast.success('Đã cập nhật vị trí hiện tại của bạn trên bản đồ!');
      },
      (err) => {
        console.error(err);
        toast.error('Không thể định vị tự động. Vui lòng cho phép quyền truy cập vị trí.');
      }
    );
  };

  // Province select change handler
  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selected = provinces.find((p) => p.province_code === code);
    if (selected) {
      setProvince(selected.name);
      setProvinceCode(selected.province_code);
      setWardsLoading(true);

      try {
        const res = await fetch(`https://34tinhthanh.com/api/wards?province_code=${selected.province_code}`);
        if (res.ok) {
          const data = await res.json();
          setWards(data);
        }
      } catch (err) {
        console.error(err);
        toast.error('Không thể tải danh sách Phường/Xã mới');
      } finally {
        setWardsLoading(false);
      }
    } else {
      setProvince('');
      setProvinceCode('');
      setWards([]);
    }

    // Reset ward and district
    setWard('');
    setWardCode('');
    setDistrict('');
  };

  // Ward select change handler
  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selected = wards.find((w) => w.ward_code === code);
    if (selected) {
      setWard(selected.ward_name);
      setWardCode(selected.ward_code);
      setDistrict(selected.province_name || selected.province_short_name || '');
    } else {
      setWard('');
      setWardCode('');
      setDistrict('');
    }
  };

  return (
    <div className="bg-white border border-brand-200/40 rounded-3xl p-6 sm:p-8 shadow-xs relative">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-100 pb-6 mb-6">
        <div>
          <h2 className="text-lg font-light text-brand-900 tracking-wide">Sổ địa chỉ nhận hàng</h2>
          <p className="text-xs text-brand-500 font-light mt-1">Lưu trữ địa chỉ nhận hàng của bạn để thanh toán thuận tiện nhất</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-900 hover:bg-brand-850 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Plus size={14} />
          <span>Thêm địa chỉ</span>
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-2 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="py-10 text-center flex flex-col items-center justify-center gap-2">
          <ShieldAlert className="text-red-500" size={28} />
          <p className="text-xs text-brand-500">Đã xảy ra lỗi khi tải danh sách địa chỉ. Vui lòng thử lại sau.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && addresses.length === 0 && (
        <div className="py-14 text-center max-w-sm mx-auto">
          <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="text-brand-400" size={24} />
          </div>
          <h3 className="text-sm font-medium text-brand-800">Chưa có địa chỉ nào</h3>
          <p className="text-xs text-brand-500 font-light mt-1 mb-6">Bạn chưa tạo địa chỉ nhận hàng nào. Hãy thêm địa chỉ giao hàng đầu tiên để bắt đầu đặt hàng.</p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-3 border border-brand-900 text-brand-900 hover:bg-brand-50 text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
          >
            <Plus size={12} />
            <span>Thêm địa chỉ mới</span>
          </button>
        </div>
      )}

      {/* Address Grid List */}
      {!isLoading && !isError && addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address: Address) => (
            <div
              key={address.id}
              className={`group relative p-5 rounded-2xl border transition-all duration-300 ${
                address.isDefault
                  ? 'border-brand-900 bg-brand-50/10 shadow-xs'
                  : 'border-brand-200/50 bg-white hover:border-brand-350 hover:shadow-xs'
              }`}
            >
              {/* Card Badge default */}
              {address.isDefault && (
                <span className="absolute top-4 right-4 bg-brand-900 text-white text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                  <Check size={10} /> Mặc định
                </span>
              )}

              <div className="space-y-2 pr-12">
                <p className="text-sm font-semibold text-brand-900 flex items-center gap-1.5">
                  {address.fullName}
                </p>
                <p className="text-xs text-brand-500 font-light">
                  Số điện thoại: <span className="font-medium text-brand-800">{address.phoneNumber}</span>
                </p>
                <p className="text-xs text-brand-700 leading-relaxed font-light">
                  {address.detail}, {address.ward}, {address.province}
                </p>

                {address.latitude && address.longitude && (
                  <p className="text-[10px] text-brand-400 flex items-center gap-1 font-light italic">
                    <MapPin size={10} className="text-red-500" />
                    Định vị: {address.latitude.toFixed(5)}, {address.longitude.toFixed(5)}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 border-t border-brand-100/50 pt-4 flex items-center justify-between gap-4">
                <div>
                  {!address.isDefault && (
                    <button
                      onClick={() => setDefaultAddress.mutate(address.id)}
                      className="text-xs text-brand-600 hover:text-brand-900 transition-colors font-medium cursor-pointer"
                    >
                      Thiết lập mặc định
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenEdit(address)}
                    className="p-1.5 text-brand-400 hover:text-brand-900 hover:bg-brand-50 rounded-lg transition-all cursor-pointer"
                    title="Chỉnh sửa địa chỉ"
                  >
                    <Edit2 size={13.5} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Bạn chắc chắn muốn xóa địa chỉ này?')) {
                        deleteAddress.mutate(address.id);
                      }
                    }}
                    className="p-1.5 text-brand-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                    title="Xóa địa chỉ"
                  >
                    <Trash2 size={13.5} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FORM MODAL (Add / Edit) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-brand-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl shadow-xl border border-brand-200 max-w-4xl w-full max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-brand-100 p-6">
              <h3 className="text-base font-light text-brand-900 tracking-wide uppercase">
                {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ giao hàng'}
              </h3>
              <button
                onClick={() => { setModalOpen(false); resetForm(); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-brand-400 hover:text-brand-900 hover:bg-brand-50 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Form fields: 5 cols */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-brand-700 uppercase tracking-wider mb-2">
                      Họ và Tên người nhận <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nhập họ và tên người nhận"
                      className="w-full text-xs font-light px-4 py-3 bg-brand-50/50 border border-brand-200/70 rounded-xl focus:border-brand-900 focus:bg-white transition-all outline-hidden text-brand-900"
                    />
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-brand-700 uppercase tracking-wider mb-2">
                      Số điện thoại nhận hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Số điện thoại nhận hàng"
                      className="w-full text-xs font-light px-4 py-3 bg-brand-50/50 border border-brand-200/70 rounded-xl focus:border-brand-900 focus:bg-white transition-all outline-hidden text-brand-900"
                    />
                  </div>

                  {/* Province Select */}
                  <div>
                    <label className="block text-[10px] font-bold text-brand-700 uppercase tracking-wider mb-2">
                      Tỉnh / Thành phố <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={provinceCode}
                      onChange={handleProvinceChange}
                      disabled={provincesLoading}
                      className="w-full text-xs font-light px-4 py-3 bg-brand-50/50 border border-brand-200/70 rounded-xl focus:border-brand-900 focus:bg-white transition-all outline-hidden text-brand-900 cursor-pointer disabled:opacity-40"
                    >
                      <option value="">{provincesLoading ? 'Đang tải...' : 'Chọn Tỉnh / Thành phố'}</option>
                      {provinces.map((p) => (
                        <option key={p.province_code} value={p.province_code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ward Select */}
                  <div>
                    <label className="block text-[10px] font-bold text-brand-700 uppercase tracking-wider mb-2">
                      Phường / Xã <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={wardCode}
                      onChange={handleWardChange}
                      disabled={wardsLoading || !provinceCode}
                      className="w-full text-xs font-light px-4 py-3 bg-brand-50/50 border border-brand-200/70 rounded-xl focus:border-brand-900 focus:bg-white transition-all outline-hidden text-brand-900 cursor-pointer disabled:opacity-40"
                    >
                      <option value="">
                        {!provinceCode 
                          ? 'Vui lòng chọn Tỉnh / Thành phố trước' 
                          : wardsLoading 
                          ? 'Đang tải...' 
                          : 'Chọn Phường / Xã'}
                      </option>
                      {wards.map((w) => (
                        <option key={w.ward_code} value={w.ward_code}>
                          {w.ward_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Address Details */}
                  <div>
                    <label className="block text-[10px] font-bold text-brand-700 uppercase tracking-wider mb-2">
                      Địa chỉ chi tiết <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={detail}
                      onChange={(e) => setDetail(e.target.value)}
                      placeholder="Số nhà, tên đường, ngõ, Quận/Huyện..."
                      className="w-full text-xs font-light px-4 py-3 bg-brand-50/50 border border-brand-200/70 rounded-xl focus:border-brand-900 focus:bg-white transition-all outline-hidden text-brand-900"
                    />
                  </div>

                  {/* Set default checkbox */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <input
                      type="checkbox"
                      id="isDefaultCheckbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="w-4 h-4 rounded-md border-brand-200 text-brand-900 focus:ring-brand-900 cursor-pointer accent-brand-900"
                    />
                    <label htmlFor="isDefaultCheckbox" className="text-xs text-brand-650 font-light select-none cursor-pointer">
                      Đặt làm địa chỉ nhận hàng mặc định
                    </label>
                  </div>
                </div>

                {/* Map integration: 7 cols */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  <div className="flex items-center justify-between border-b border-brand-100/50 pb-2">
                    <label className="block text-[10px] font-bold text-brand-800 uppercase tracking-wider">
                      Định vị bản đồ (Leaflet / OSM)
                    </label>
                    <div className="flex items-center gap-2">
                      {/* Geolocation Button */}
                      <button
                        type="button"
                        onClick={handleCurrentPosition}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-brand-200 hover:border-brand-400 bg-white hover:bg-brand-50 rounded-lg text-[10px] font-semibold text-brand-700 transition-all cursor-pointer shadow-2xs"
                        title="Dùng GPS/Định vị thiết bị"
                      >
                        <Navigation size={11} className="text-brand-800" />
                        <span>Vị trí hiện tại</span>
                      </button>

                      {/* Sync inputs to marker Button */}
                      <button
                        type="button"
                        onClick={handlePinFromAddress}
                        disabled={isGeocoding || !province}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-brand-900 hover:bg-brand-850 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-[10px] font-bold uppercase tracking-wider text-white transition-all cursor-pointer shadow-2xs"
                      >
                        {isGeocoding ? (
                          <div className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Search size={11} />
                        )}
                        <span>Tìm vị trí gõ</span>
                      </button>
                    </div>
                  </div>

                  {/* Leaflet Map rendering */}
                  <AddressMap
                    lat={latitude}
                    lng={longitude}
                    onLocationSelect={handleLocationSelect}
                    height="320px"
                  />

                  {/* Reverse geocode feedback & Action */}
                  {reverseGeocodedText && (
                    <div className="p-3 bg-brand-50/40 border border-brand-100 rounded-xl space-y-2">
                      <p className="text-[10px] text-brand-500 font-medium uppercase tracking-wider">Vị trí nhận diện từ Bản đồ:</p>
                      <p className="text-xs text-brand-700 font-light leading-relaxed">{reverseGeocodedText}</p>
                      <button
                        type="button"
                        onClick={handleApplyReverseGeocode}
                        className="text-[10px] text-brand-950 hover:underline font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Áp dụng vị trí này vào Form ↑
                      </button>
                    </div>
                  )}

                  {/* Lat/Lng display coordinates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 bg-brand-50/30 border border-brand-100 rounded-xl">
                      <p className="text-[9px] text-brand-400 uppercase tracking-wider font-bold">Vĩ độ (Latitude)</p>
                      <p className="text-xs text-brand-700 font-mono mt-0.5">{latitude !== null ? latitude.toFixed(6) : 'Chưa định vị'}</p>
                    </div>
                    <div className="p-3.5 bg-brand-50/30 border border-brand-100 rounded-xl">
                      <p className="text-[9px] text-brand-400 uppercase tracking-wider font-bold">Kinh độ (Longitude)</p>
                      <p className="text-xs text-brand-700 font-mono mt-0.5">{longitude !== null ? longitude.toFixed(6) : 'Chưa định vị'}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Actions */}
              <div className="border-t border-brand-100 pt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); resetForm(); }}
                  className="px-5 py-3 border border-brand-200 hover:bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createAddress.isPending || updateAddress.isPending}
                  className="px-6 py-3 bg-brand-900 hover:bg-brand-850 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  {createAddress.isPending || updateAddress.isPending ? 'Đang lưu...' : 'Lưu địa chỉ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressesPage;
