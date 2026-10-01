import { User, UserAddress, WageRule } from '@tebeya/shared';
import { apiClient } from './client';

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  profileImageUrl?: string;
}

export const profileApi = {
  updateProfile(payload: UpdateProfilePayload): Promise<User> {
    return apiClient<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  updateAddress(address: UserAddress): Promise<User> {
    return apiClient<User>('/users/profile/address', {
      method: 'PUT',
      body: JSON.stringify(address),
    });
  },

  getWageRules(): Promise<WageRule> {
    return apiClient<WageRule>('/wage-rules', {
      method: 'GET',
    });
  },

  uploadKycIdProof(imageBase64: string): Promise<{ idProofUrl: string; user: User }> {
    return apiClient<{ idProofUrl: string; user: User }>('/staff/kyc', {
      method: 'POST',
      body: JSON.stringify({ idProof: imageBase64 }),
    });
  },
};
