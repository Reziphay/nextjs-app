export type Messages = {
  // App
  appName: string;
  appTagline: string;

  // Onboarding
  onboardingTitle: string;
  onboardingSubtitle: string;
  onboardingCustomer: string;
  onboardingCustomerDesc: string;
  onboardingProvider: string;
  onboardingProviderDesc: string;
  onboardingContinue: string;

  // Auth
  phoneEntryTitle: string;
  phoneEntrySubtitle: string;
  phoneEntryPlaceholder: string;
  phoneEntryContinue: string;
  otpTitle: string;
  otpSubtitle: (phone: string) => string;
  otpResendIn: (sec: number) => string;
  otpResend: string;
  registerTitle: string;
  registerSubtitle: string;
  registerNameLabel: string;
  registerNamePlaceholder: string;
  registerEmailLabel: string;
  registerEmailPlaceholder: string;
  registerSubmit: string;

  // Navigation — UCR
  navExplore: string;
  navReservations: string;
  navNotifications: string;
  navProfile: string;

  // Navigation — USO
  navIncoming: string;
  navServices: string;
  navBrands: string;

  // Explore
  exploreGreeting: (name: string) => string;
  exploreSearch: string;
  exploreCategories: string;
  explorePopularBrands: string;
  exploreNearby: string;
  exploreFeatured: string;
  exploreSeeAll: string;
  exploreNoResults: string;

  // Search
  searchTitle: string;
  searchServices: string;
  searchBrands: string;
  searchProviders: string;
  searchPlaceholder: string;
  searchFilters: string;
  searchSortBy: string;
  searchSortRelevance: string;
  searchSortRating: string;
  searchSortNearest: string;
  searchSortPriceLow: string;
  searchSortPriceHigh: string;
  searchSortPopular: string;
  searchPriceRange: string;
  searchCategory: string;
  searchApplyFilters: string;
  searchClearFilters: string;
  searchNoResults: string;
  searchTryDifferent: string;

  // Service Detail
  serviceDetailBook: string;
  serviceDetailRequestBook: string;
  serviceDetailPrice: string;
  serviceDetailFree: string;
  serviceDetailDuration: string;
  serviceDetailCategory: string;
  serviceDetailOwner: string;
  serviceDetailApprovalAuto: string;
  serviceDetailApprovalManual: string;
  serviceDetailActiveReservation: string;
  serviceDetailDescription: string;
  serviceDetailPhotos: string;
  serviceDetailRating: string;
  serviceDetailReviews: string;

  // Brand Detail
  brandDetailServices: string;
  brandDetailOwner: string;
  brandDetailWebsite: string;
  brandDetailContact: string;

  // Reservation
  reservationTitle: string;
  reservationUpcoming: string;
  reservationPast: string;
  reservationEmpty: string;
  reservationEmptyDesc: string;
  reservationCreateTitle: string;
  reservationDate: string;
  reservationTime: string;
  reservationNote: string;
  reservationNotePlaceholder: string;
  reservationConfirm: string;
  reservationCancel: string;
  reservationCancelReason: string;
  reservationCancelConfirm: string;
  reservationStatus_PENDING: string;
  reservationStatus_CONFIRMED: string;
  reservationStatus_REJECTED: string;
  reservationStatus_CANCELLED_BY_CUSTOMER: string;
  reservationStatus_CANCELLED_BY_OWNER: string;
  reservationStatus_COMPLETED: string;
  reservationStatus_NO_SHOW: string;
  reservationStatus_EXPIRED: string;
  reservationStatus_CHANGE_REQUESTED_BY_CUSTOMER: string;
  reservationStatus_CHANGE_REQUESTED_BY_OWNER: string;
  changeRequestTitle: string;
  changeRequestAccept: string;
  changeRequestReject: string;
  changeRequestNewDate: string;
  changeRequestReason: string;

  // Favorites
  favoritesTitle: string;
  favoritesServices: string;
  favoritesBrands: string;
  favoritesOwners: string;
  favoritesEmpty: string;
  favoritesEmptyDesc: string;

  // Profile
  profileEditTitle: string;
  profileName: string;
  profileEmail: string;
  profilePhone: string;
  profileSave: string;
  profileSwitchToProvider: string;
  profileSwitchToCustomer: string;
  profileBecomeProvider: string;
  profileLogout: string;
  profileLogoutConfirm: string;
  profileMyFavorites: string;
  profileMyServices: string;
  profileMyBrands: string;

  // Settings
  settingsTitle: string;
  settingsAppearance: string;
  settingsTheme: string;
  settingsThemeSystem: string;
  settingsThemeLight: string;
  settingsThemeDark: string;
  settingsLanguage: string;
  settingsReminders: string;
  settingsReminderEnabled: string;
  settingsReminderMinutes: string;

  // USO Incoming
  incomingTitle: string;
  incomingPending: string;
  incomingConfirmed: string;
  incomingHistory: string;
  incomingAccept: string;
  incomingReject: string;
  incomingComplete: string;
  incomingEmpty: string;
  incomingRejectReason: string;

  // USO Services
  myServicesTitle: string;
  myServicesCreate: string;
  myServicesEmpty: string;
  myServicesEmptyDesc: string;
  myServicesArchive: string;
  myServicesEdit: string;
  serviceFormTitle: string;
  serviceFormName: string;
  serviceFormDescription: string;
  serviceFormPrice: string;
  serviceFormCategory: string;
  serviceFormBrand: string;
  serviceFormApprovalMode: string;
  serviceFormApprovalAuto: string;
  serviceFormApprovalManual: string;
  serviceFormServiceType: string;
  serviceFormTypeSolo: string;
  serviceFormTypeMulti: string;
  serviceFormWaitingTime: string;
  serviceFormMinAdvance: string;
  serviceFormMaxAdvance: string;
  serviceFormCancellationDeadline: string;
  serviceFormSchedule: string;
  serviceFormPhotos: string;
  serviceFormSave: string;

  // USO Brands
  myBrandsTitle: string;
  myBrandsCreate: string;
  myBrandsEmpty: string;
  myBrandsEmptyDesc: string;
  myBrandsEdit: string;
  myBrandsDelete: string;
  brandFormTitle: string;
  brandFormName: string;
  brandFormEmail: string;
  brandFormPhone: string;
  brandFormDescription: string;
  brandFormWebsite: string;
  brandFormAddress: string;
  brandFormLogo: string;
  brandFormSave: string;

  // Notifications
  notificationsTitle: string;
  notificationsEmpty: string;
  notificationsComingSoon: string;

  // Common
  commonBack: string;
  commonClose: string;
  commonConfirm: string;
  commonCancel: string;
  commonSave: string;
  commonDelete: string;
  commonEdit: string;
  commonLoading: string;
  commonError: string;
  commonRetry: string;
  commonNoResults: string;
  commonOptional: string;
  commonMin: string;
  commonMax: string;
  commonFree: string;
  commonVip: string;
  commonReviews: (n: number) => string;
  commonRating: (r: number) => string;
  commonDistance: (km: number) => string;
};
