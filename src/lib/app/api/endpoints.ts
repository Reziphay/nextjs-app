const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000') + '/api/v1';

export const E = {
  base: BASE,

  // Auth
  requestPhoneOtp: `${BASE}/auth/request-phone-otp`,
  verifyPhoneOtp: `${BASE}/auth/verify-phone-otp`,
  completeRegistration: `${BASE}/auth/complete-registration`,
  refresh: `${BASE}/auth/refresh`,
  logout: `${BASE}/auth/logout`,
  authMe: `${BASE}/auth/me`,

  // User
  userMe: `${BASE}/users/me`,
  userMeAvatar: `${BASE}/users/me/avatar`,
  activateUso: `${BASE}/users/me/activate-uso`,
  getRoles: `${BASE}/users/me/roles`,
  switchRole: `${BASE}/users/me/switch-role`,

  // Discovery & Search
  search: `${BASE}/search`,
  nearbyServices: `${BASE}/services/nearby`,
  services: `${BASE}/services`,
  brands: `${BASE}/brands`,
  categories: `${BASE}/categories`,
  serviceById: (id: string) => `${BASE}/services/${id}`,
  brandById: (id: string) => `${BASE}/brands/${id}`,

  // Reservations — UCR
  createReservation: `${BASE}/reservations`,
  myReservations: `${BASE}/reservations/my`,
  reservationById: (id: string) => `${BASE}/reservations/${id}`,
  cancelReservation: (id: string) => `${BASE}/reservations/${id}/cancel-by-customer`,
  createChangeRequest: (id: string) => `${BASE}/reservations/${id}/change-requests`,
  acceptChangeRequest: (crId: string) => `${BASE}/reservations/change-requests/${crId}/accept`,
  rejectChangeRequest: (crId: string) => `${BASE}/reservations/change-requests/${crId}/reject`,

  // Reservations — USO
  incomingReservations: `${BASE}/reservations/incoming`,
  incomingStats: `${BASE}/reservations/incoming/stats`,
  acceptReservation: (id: string) => `${BASE}/reservations/${id}/accept`,
  rejectReservation: (id: string) => `${BASE}/reservations/${id}/reject`,
  cancelByOwner: (id: string) => `${BASE}/reservations/${id}/cancel-by-owner`,
  completeManually: (id: string) => `${BASE}/reservations/${id}/complete-manually`,

  // Services — USO
  myServices: `${BASE}/services/mine`,
  createService: `${BASE}/services`,
  updateService: (id: string) => `${BASE}/services/${id}`,
  archiveService: (id: string) => `${BASE}/services/${id}`,
  serviceAvailRules: (id: string) => `${BASE}/services/${id}/availability-rules`,
  servicePhotos: (id: string) => `${BASE}/services/${id}/photos`,
  deleteServicePhoto: (id: string, photoId: string) => `${BASE}/services/${id}/photos/${photoId}`,

  // Brands — USO
  myBrands: `${BASE}/brands/mine`,
  createBrand: `${BASE}/brands`,
  updateBrand: (id: string) => `${BASE}/brands/${id}`,
  deleteBrand: (id: string) => `${BASE}/brands/${id}`,
  uploadBrandLogo: (id: string) => `${BASE}/brands/${id}/logo`,

  // Favorites — UCR
  favoriteBrands: `${BASE}/users/me/favorites/brands`,
  favoriteOwners: `${BASE}/users/me/favorites/owners`,
  favoriteServices: `${BASE}/users/me/favorites/services`,
  addFavoriteBrand: (id: string) => `${BASE}/users/me/favorites/brands/${id}`,
  removeFavoriteBrand: (id: string) => `${BASE}/users/me/favorites/brands/${id}`,
  favoriteBrandStatus: (id: string) => `${BASE}/users/me/favorites/brands/${id}/status`,
  addFavoriteOwner: (id: string) => `${BASE}/users/me/favorites/owners/${id}`,
  removeFavoriteOwner: (id: string) => `${BASE}/users/me/favorites/owners/${id}`,
  favoriteOwnerStatus: (id: string) => `${BASE}/users/me/favorites/owners/${id}/status`,
  addFavoriteService: (id: string) => `${BASE}/users/me/favorites/services/${id}`,
  removeFavoriteService: (id: string) => `${BASE}/users/me/favorites/services/${id}`,
  favoriteServiceStatus: (id: string) => `${BASE}/users/me/favorites/services/${id}/status`,
} as const;
