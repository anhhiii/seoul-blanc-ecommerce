export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressInput {
  fullName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault?: boolean;
}

export interface UpdateAddressInput {
  fullName?: string;
  phoneNumber?: string;
  province?: string;
  district?: string;
  ward?: string;
  detail?: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault?: boolean;
}

export interface AddressesResponse {
  success: boolean;
  message: string;
  data: {
    addresses: Address[];
  };
}

export interface AddressResponse {
  success: boolean;
  message: string;
  data: {
    address: Address;
  };
}
