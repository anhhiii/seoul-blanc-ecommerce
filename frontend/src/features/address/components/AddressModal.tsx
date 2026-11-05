import React, { useState, useEffect } from 'react';
import { X, Search, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import type { Address } from '../types/index.js';
import { AddressMap } from './AddressMap.js';

export interface ProvinceData {
  province_code: string;
  name: string;
}

export interface WardData {
  ward_code: string;
  ward_name: string;
  province_code: string;
  province_name?: string;
  province_short_name?: string;
}

export interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    fullName: string;
    phoneNumber: string;
    province: string;
    district: string;
    ward: string;
    detail: string;
    latitude: number | null;
    longitude: number | null;
    isDefault: boolean;
  }) => void;
  editingAddress: Address | null;
  isSubmitting?: boolean;
}

const cleanStr = (s: string) => {
  return s
    .toLowerCase()
    .replace(/tỉnh|thành phố|tp\.|phường|xã|thị trấn|quận|huyện|đường/g, '')
    .trim();
};

// Dynamic Geocoding using free public APIs (No API key, CORS enabled)
const geocodeLocation = async (
  query: string
): Promise<{ lat: number; lng: number; displayName: string } | null> => {
  // 1. Try Photon Geocoder (Komoot - CORS enabled, fast)
  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        const name = data.features[0].properties?.name || query;
        return { lat, lng, displayName: name };
      }
    }
  } catch {
    // Fallback
  }

  // 2. Try Open-Meteo Geocoding API (Fast, CORS enabled, no key)
  try {
    const cleanQ = query.replace(', Việt Nam', '').trim();
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQ)}&count=1&language=vi&format=json`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return {
          lat: data.results[0].latitude,
          lng: data.results[0].longitude,
          displayName: `${data.results[0].name}, Việt Nam`,
        };
      }
    }
  } catch {
    // Fallback
  }

  // 3. Try Nominatim Geocoder
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=vi`
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name,
        };
      }
    }
  } catch {
    // Fallback
  }

  return null;
};

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingAddress,
  isSubmitting = false,
}) => {
  // Form States
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [province, setProvince] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [wardCode, setWardCode] = useState('');
  const [detail, setDetail] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isDefault, setIsDefault] = useState(false);
  const [manualWardInput, setManualWardInput] = useState(false);

  // API Dropdown Data
  const [provinces, setProvinces] = useState<ProvinceData[]>([]);
  const [wards, setWards] = useState<WardData[]>([]);
  const [provincesLoading, setProvincesLoading] = useState(false);
  const [wardsLoading, setWardsLoading] = useState(false);

  // Geocoding helper states
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [reverseGeocodedText, setReverseGeocodedText] = useState('');

  // Helper to fetch wards for a given province code with multi-source fallback
  const fetchWardsForProvince = async (code: string): Promise<WardData[]> => {
    const numCode = Number(code);

    // 1. Primary: try provinces.open-api.vn (Official 63 Vietnam provinces/wards)
    if (!isNaN(numCode)) {
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/p/${numCode}?depth=3`);
        if (res.ok) {
          const data = await res.json();
          const fallbackWards: WardData[] = [];
          if (data.districts) {
            data.districts.forEach((d: any) => {
              if (d.wards) {
                d.wards.forEach((w: any) => {
                  fallbackWards.push({
                    ward_code: String(w.code),
                    ward_name: `${w.name} (${d.name})`,
                    province_code: code,
                    province_name: d.name,
                  });
                });
              }
            });
          }
          if (fallbackWards.length > 0) return fallbackWards;
        }
      } catch {
        // Fallback
      }
    }

    // 2. Secondary fallback: 34tinhthanh / custom API
    try {
      const res = await fetch(`https://34tinhthanh.com/api/wards?province_code=${code}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.data || data?.wards || [];
        if (list.length > 0) return list;
      }
    } catch {
      // Fallback
    }

    return [];
  };

  // Fetch provinces on open (Standard 63 provinces of Vietnam)
  useEffect(() => {
    if (!isOpen) return;

    const fetchProvinces = async () => {
      setProvincesLoading(true);
      let loadedProvinces: ProvinceData[] = [];

      // 1. Primary: provinces.open-api.vn (Standard 63 provinces)
      try {
        const res = await fetch('https://provinces.open-api.vn/api/p/');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            loadedProvinces = data.map((p: any) => ({
              province_code: String(p.code),
              name: p.name,
            }));
          }
        }
      } catch {
        // Fallback
      }

      // 2. Fallback: esgoo.net (Full 63 provinces)
      if (loadedProvinces.length === 0) {
        try {
          const res = await fetch('https://esgoo.net/api-tinhthanh/1/0.htm');
          if (res.ok) {
            const data = await res.json();
            const list = data?.data || [];
            if (Array.isArray(list) && list.length > 0) {
              loadedProvinces = list.map((p: any) => ({
                province_code: String(p.id),
                name: p.full_name || p.name,
              }));
            }
          }
        } catch {
          // Fallback
        }
      }

      // 3. Fallback: 34tinhthanh.com
      if (loadedProvinces.length === 0) {
        try {
          const res = await fetch('https://34tinhthanh.com/api/provinces');
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : data?.data || [];
            if (list.length > 0) {
              loadedProvinces = list;
            }
          }
        } catch {
          // Fallback
        }
      }

      setProvinces(loadedProvinces);

      // If editing an existing address, match its province and wards
      if (editingAddress && loadedProvinces.length > 0) {
        const matchP = loadedProvinces.find(
          (p) => cleanStr(p.name) === cleanStr(editingAddress.province)
        );
        if (matchP) {
          setProvince(matchP.name);
          setProvinceCode(matchP.province_code);

          const dataW = await fetchWardsForProvince(matchP.province_code);
          setWards(dataW);

          const matchW = dataW.find(
            (w) => cleanStr(w.ward_name) === cleanStr(editingAddress.ward)
          );
          if (matchW) {
            setWard(matchW.ward_name);
            setWardCode(matchW.ward_code);
          } else {
            setWard(editingAddress.ward);
            setWardCode(editingAddress.ward);
            setManualWardInput(true);
          }
        }
      }

      setProvincesLoading(false);
    };

    fetchProvinces();
  }, [isOpen, editingAddress]);

  // Populate or reset form fields
  useEffect(() => {
    if (editingAddress) {
      setFullName(editingAddress.fullName);
      setPhoneNumber(editingAddress.phoneNumber);
      setDetail(editingAddress.detail);
      setDistrict(editingAddress.district || '');
      setLatitude(editingAddress.latitude || null);
      setLongitude(editingAddress.longitude || null);
      setIsDefault(editingAddress.isDefault);
      setWard(editingAddress.ward);
      setWardCode(editingAddress.ward);
    } else {
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
      setWards([]);
      setManualWardInput(false);
    }
  }, [editingAddress, isOpen]);

  if (!isOpen) return null;

  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selected = provinces.find((p) => p.province_code === code);
    if (selected) {
      setProvince(selected.name);
      setProvinceCode(selected.province_code);
      setWardsLoading(true);

      // Dynamically geocode province center if coordinates not yet picked
      if (!latitude && !longitude) {
        geocodeLocation(`${selected.name}, Việt Nam`).then((pos) => {
          if (pos) {
            setLatitude(pos.lat);
            setLongitude(pos.lng);
          }
        });
      }

      const dataW = await fetchWardsForProvince(selected.province_code);
      setWards(dataW);
      setWardsLoading(false);

      if (dataW.length === 0) {
        setManualWardInput(true);
      } else {
        setManualWardInput(false);
      }
    } else {
      setProvince('');
      setProvinceCode('');
      setWards([]);
      setManualWardInput(false);
    }

    setWard('');
    setWardCode('');
    setDistrict('');
  };

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

  const handleLocationSelect = async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);

    // 1. Try Photon reverse geocode (supports CORS)
    try {
      const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const props = data.features[0].properties;
          const label = [props.name, props.street, props.district || props.city, props.state, props.country]
            .filter(Boolean)
            .join(', ');
          setReverseGeocodedText(label || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          return;
        }
      }
    } catch {
      // Fallback
    }

    // 2. Try Nominatim reverse geocode
    try {
      const res2 = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
      );
      if (res2.ok) {
        const data2 = await res2.json();
        setReverseGeocodedText(data2.display_name || '');
        return;
      }
    } catch {
      // Fallback
    }

    setReverseGeocodedText(`Tọa độ: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  };

  const handleApplyReverseGeocode = () => {
    if (!reverseGeocodedText) return;
    if (!detail) {
      setDetail(reverseGeocodedText);
    }
    toast.success('Đã áp dụng thông tin vị trí vào ô Địa chỉ chi tiết!');
  };

  const handlePinFromAddress = async () => {
    const fullQuery = [detail, ward, province, 'Việt Nam'].filter(Boolean).join(', ');
    if (!fullQuery && !province) {
      toast.warning('Vui lòng chọn Tỉnh/Thành phố hoặc nhập địa chỉ trước khi tìm vị trí.');
      return;
    }

    setIsGeocoding(true);

    // Call dynamic Geocoding APIs (Photon -> Open-Meteo -> Nominatim)
    const pos =
      (await geocodeLocation(fullQuery)) ||
      (province ? await geocodeLocation(`${province}, Việt Nam`) : null);

    if (pos) {
      setLatitude(pos.lat);
      setLongitude(pos.lng);
      setReverseGeocodedText(pos.displayName);
      toast.success('Đã tìm thấy vị trí và ghim lên bản đồ!');
    } else {
      toast.warning('Không tìm thấy tọa độ chi tiết. Bạn có thể bấm trực tiếp lên bản đồ để ghim vị trí nhé!');
    }

    setIsGeocoding(false);
  };

  const handleCurrentPosition = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt của bạn không hỗ trợ định vị GPS');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        handleLocationSelect(lat, lng);
        toast.success('Đã cập nhật vị trí GPS của bạn trên bản đồ!');
      },
      (err) => {
        console.error(err);
        toast.error('Không thể lấy vị trí GPS. Vui lòng cho phép quyền truy cập vị trí trên trình duyệt.');
      }
    );
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phoneNumber || !province || !ward || !detail) {
      toast.error('Vui lòng điền đầy đủ các thông tin địa chỉ bắt buộc.');
      return;
    }

    onSubmit({
      fullName,
      phoneNumber,
      province,
      district: district || province,
      ward,
      detail,
      latitude,
      longitude,
      isDefault,
    });
  };

  return (
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
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-brand-400 hover:text-brand-900 hover:bg-brand-50 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmitForm} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form fields: 5 cols */}
            <div className="lg:col-span-5 space-y-4">
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
                  <option value="">{provincesLoading ? 'Đang tải danh sách...' : 'Chọn Tỉnh / Thành phố'}</option>
                  {provinces.map((p) => (
                    <option key={p.province_code} value={p.province_code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-bold text-brand-700 uppercase tracking-wider">
                    Phường / Xã <span className="text-red-500">*</span>
                  </label>
                  {provinceCode && (
                    <button
                      type="button"
                      onClick={() => setManualWardInput(!manualWardInput)}
                      className="text-[9px] text-brand-600 hover:text-brand-900 underline font-medium cursor-pointer"
                    >
                      {manualWardInput ? '← Chọn từ danh sách' : 'Nhập tay Phường/Xã'}
                    </button>
                  )}
                </div>

                {manualWardInput ? (
                  <input
                    type="text"
                    required
                    value={ward}
                    onChange={(e) => {
                      setWard(e.target.value);
                      setWardCode(e.target.value);
                    }}
                    placeholder="Nhập Phường / Xã..."
                    className="w-full text-xs font-light px-4 py-3 bg-brand-50/50 border border-brand-200/70 rounded-xl focus:border-brand-900 focus:bg-white transition-all outline-hidden text-brand-900"
                  />
                ) : (
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
                        ? 'Đang tải danh sách...'
                        : 'Chọn Phường / Xã'}
                    </option>
                    {wards.map((w) => (
                      <option key={w.ward_code} value={w.ward_code}>
                        {w.ward_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

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
                <div>
                  <label className="block text-[10px] font-bold text-brand-800 uppercase tracking-wider">
                    Định vị bản đồ (Bấm trực tiếp lên bản đồ để chọn)
                  </label>
                  <p className="text-[9px] text-brand-400 font-light">
                    Click vào vị trí bạn muốn trên bản đồ để ghim tọa độ giao hàng
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCurrentPosition}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-brand-200 hover:border-brand-400 bg-white hover:bg-brand-50 rounded-lg text-[10px] font-semibold text-brand-700 transition-all cursor-pointer shadow-2xs"
                    title="Dùng GPS/Định vị thiết bị"
                  >
                    <Navigation size={11} className="text-brand-800" />
                    <span>Vị trí hiện tại</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePinFromAddress}
                    disabled={isGeocoding || (!province && !detail)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-brand-900 hover:bg-brand-850 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-[10px] font-bold uppercase tracking-wider text-white transition-all cursor-pointer shadow-2xs"
                  >
                    {isGeocoding ? (
                      <div className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search size={11} />
                    )}
                    <span>Tìm vị trí gõ</span>
                  </button>
                </div>
              </div>

              {/* Leaflet Map with CartoDB Voyager tiles */}
              <AddressMap
                lat={latitude}
                lng={longitude}
                onLocationSelect={handleLocationSelect}
                height="320px"
              />

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

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-brand-50/30 border border-brand-100 rounded-xl">
                  <p className="text-[9px] text-brand-400 uppercase tracking-wider font-bold">Vĩ độ (Latitude)</p>
                  <p className="text-xs text-brand-700 font-mono mt-0.5 font-semibold">
                    {latitude !== null ? latitude.toFixed(6) : 'Chưa định vị (bấm lên bản đồ)'}
                  </p>
                </div>
                <div className="p-3.5 bg-brand-50/30 border border-brand-100 rounded-xl">
                  <p className="text-[9px] text-brand-400 uppercase tracking-wider font-bold">Kinh độ (Longitude)</p>
                  <p className="text-xs text-brand-700 font-mono mt-0.5 font-semibold">
                    {longitude !== null ? longitude.toFixed(6) : 'Chưa định vị (bấm lên bản đồ)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="border-t border-brand-100 pt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 border border-brand-200 hover:bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-brand-900 hover:bg-brand-850 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu địa chỉ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
