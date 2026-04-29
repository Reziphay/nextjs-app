import type { Messages } from "../types";
import { enMessages } from "./en";

export const trMessages: Messages = {
  ...enMessages,
  metadata: {
    title: "Reziphay Next App",
    description:
      "18 dili destekleyen çok dilli bir Next.js başlangıç projesi.",
  },
  languageSwitcherAriaLabel: "Dil seçici",
  languageSwitcherDisplayLabel: "Görüntüleme dili",
  navigationAriaLabel: "Ana gezinme",
  navigation: {
    home: "Ana sayfa",
    aboutUs: "Hakkımızda",
    questions: "Sorular",
    contactUs: "İletişim",
    openMenu: "Menüyü aç",
    closeMenu: "Menüyü kapat",
  },
  comingSoon: {
    badge: "Yakında",
    description: "Bu sayfa hâlâ hazırlanıyor.",
  },
  auth: {
    shell: {
      badge: "Reziphay Access",
      title: "Reziphay hesabınızı her yerden yönetin",
      description:
        "Hizmet Sahibi ve Müşteri akışlarını tek, temiz ve güvenli bir giriş deneyiminde birleştirin.",
      featureOneTitle: "Ortak giriş deneyimi",
      featureOneDescription:
        "Giriş, kayıt ve gelecekteki kimlik doğrulama ekranları tek bir yeniden kullanılabilir yapı içinde yer alır.",
      featureTwoTitle: "Role dayalı onboarding",
      featureTwoDescription:
        "Hizmet Sahibi ve Müşteri yolculukları ek sürtünme olmadan net ve ayrı kalır.",
      featureThreeTitle: "Hızlı ve duyarlı",
      featureThreeDescription:
        "Yerleşim hem masaüstünde hem mobilde form odağını korur.",
    },
    login: {
      title: "Hesabınıza giriş yapın",
      description:
        "Giriş yapmak için e-posta adresinizi aşağıya yazın",
      emailLabel: "E-posta",
      emailPlaceholder: "m@example.com",
      passwordLabel: "Şifre",
      passwordPlaceholder: "Şifrenizi girin",
      forgotPassword: "Şifrenizi mi unuttunuz?",
      submit: "Giriş yap",
      submitting: "Giriş yapılıyor",
      continueWithGoogle: "Google ile giriş yap",
      noAccount: "Hesabınız yok mu?",
      signUp: "Kayıt ol",
      errorTitle: "Giriş başarısız",
      errorDescription:
        "Giriş yapılırken bir sorun oluştu. Lütfen tekrar deneyin.",
      configurationErrorDescription:
        "Giriş servisi henüz yapılandırılmadı. API bağlantısını kontrol edin.",
      networkErrorDescription:
        "Sunucuya bağlanılamadı. Lütfen tekrar deneyin.",
      maintenanceDescription:
        "Sistem geçici olarak kullanılamıyor. Lütfen kısa süre sonra tekrar deneyin.",
      badRequestDescription: "Gönderilen veriler kabul edilmedi.",
      unauthorizedDescription: "Geçersiz e-posta veya şifre.",
      forbiddenDescription:
        "Bu işlemi gerçekleştirmek için yetkiniz yok.",
      notFoundDescription: "Giriş servisi bulunamadı.",
      rateLimitedDescription:
        "Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.",
      serverErrorDescription:
        "Bir sunucu hatası oluştu. Lütfen biraz sonra tekrar deneyin.",
      validationErrorDescription:
        "Devam etmeden önce form hatalarını düzeltin.",
      requiredMessage: "Bu alan zorunludur.",
      emailInvalidMessage:
        "Lütfen geçerli bir e-posta adresi girin.",
      passwordRequiredMessage: "Lütfen şifrenizi girin.",
      showPasswordLabel: "Şifreyi göster",
      hidePasswordLabel: "Şifreyi gizle",
    },
    register: {
      title: "Hesabınızı oluşturun",
      description:
        "Yeni bir hesap oluşturmak için bilgilerinizi aşağıya girin",
      firstNameLabel: "Ad",
      firstNamePlaceholder: "John",
      lastNameLabel: "Soyad",
      lastNamePlaceholder: "Doe",
      birthdayLabel: "Doğum tarihi",
      countryLabel: "Ülke",
      countryPlaceholder: "Azerbaycan",
      noCountryResults: "Eşleşen ülke bulunamadı.",
      countryPrefixLabel: "Ülke kodu",
      countryPrefixPlaceholder: "+994",
      emailLabel: "E-posta",
      emailPlaceholder: "m@example.com",
      passwordLabel: "Şifre",
      passwordPlaceholder: "Yeni bir şifre oluşturun",
      passwordHint: "En az 8 karakter kullanın.",
      typeLabel: "Kullanıcı tipi",
      typePlaceholder: "Bir kullanıcı tipi seçin",
      typeDescription:
        "Buradan yalnızca Hizmet Sahibi ve Müşteri hesapları kayıt olabilir.",
      typeUso: "Hizmet Sahibi",
      typeUsoDescription:
        "Hizmeti yöneten kişi veya ekip için hesap.",
      typeUcr: "Müşteri",
      typeUcrDescription:
        "Hizmeti kullanan müşteri için hesap.",
      noTypeResults: "Eşleşen kullanıcı tipi bulunamadı.",
      submit: "Hesap oluştur",
      submitting: "Gönderiliyor",
      termsAgreement:
        "Hesap oluşturarak şartlar ve koşulları kabul etmiş olursunuz.",
      successTitle: "Kayıt isteği gönderildi",
      successDescription:
        "Hesabınız oluşturulduktan sonra giriş yapabilirsiniz.",
      errorTitle: "Kayıt başarısız",
      errorDescription:
        "Kayıt sırasında bir sorun oluştu. Lütfen tekrar deneyin.",
      configurationErrorDescription:
        "Kayıt servisi henüz yapılandırılmadı. API bağlantısını kontrol edin.",
      networkErrorDescription:
        "Sunucuya bağlanılamadı. Lütfen tekrar deneyin.",
      maintenanceDescription:
        "Sistem geçici olarak kullanılamıyor. Lütfen kısa süre sonra tekrar deneyin.",
      badRequestDescription: "Gönderilen veriler kabul edilmedi.",
      unauthorizedDescription: "Bu istek yetkilendirilmemiş.",
      forbiddenDescription:
        "Bu işlemi gerçekleştirmek için yetkiniz yok.",
      notFoundDescription: "Kayıt servisi bulunamadı.",
      conflictDescription:
        "Bu e-posta adresiyle zaten bir hesap mevcut.",
      unprocessableEntityDescription:
        "Gönderilen veriler doğrulamadan geçemedi.",
      rateLimitedDescription:
        "Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.",
      serverErrorDescription:
        "Bir sunucu hatası oluştu. Lütfen biraz sonra tekrar deneyin.",
      validationErrorDescription:
        "Devam etmeden önce form hatalarını düzeltin.",
      requiredMessage: "Bu alan zorunludur.",
      firstNameInvalidMessage:
        "Ad en az 2 karakter olmalıdır.",
      lastNameInvalidMessage:
        "Soyad en az 2 karakter olmalıdır.",
      birthdayRequiredMessage:
        "Lütfen doğum tarihinizi girin.",
      birthdayAgeMessage:
        "Kayıt olmak için en az 18 yaşında olmalısınız.",
      emailInvalidMessage:
        "Lütfen geçerli bir e-posta adresi girin.",
      passwordInvalidMessage:
        "Şifre en az 8 karakter olmalı ve büyük harf, küçük harf ile bir sayı içermelidir.",
      typeRequiredMessage: "Lütfen bir kullanıcı tipi seçin.",
      showPasswordLabel: "Şifreyi göster",
      hidePasswordLabel: "Şifreyi gizle",
    },
  },
  backendErrors: {
    ...enMessages.backendErrors,
    "auth.invalid_credentials": "Geçersiz e-posta veya şifre.",
    "errors.validation_error":
      "Gönderilen veriler doğrulamadan geçemedi.",
    "errors.missing_token": "Kimlik doğrulama jetonu eksik.",
    "errors.invalid_token": "Kimlik doğrulama jetonu geçersiz.",
    "errors.forbidden":
      "Bu işlemi gerçekleştirmek için yetkiniz yok.",
    "user.not_found": "Kullanıcı bulunamadı.",
    "user.email_change_not_allowed":
      "Bu e-posta adresi artık değiştirilemez.",
    "user.phone_change_not_allowed":
      "Bu telefon numarası artık değiştirilemez.",
    "user.email_already_in_use":
      "Bu e-posta adresi zaten kullanımda.",
    "user.phone_already_in_use":
      "Bu telefon numarası zaten kullanımda.",
    "media.invalid_file_type":
      "Seçilen dosya türü desteklenmiyor.",
    "media.file_too_large": "Seçilen dosya çok büyük.",
    "media.invalid_logo_ratio":
      "Logo görseli gerekli en-boy oranını kullanmalıdır.",
    "media.invalid_gallery_ratio":
      "Galeri görseli gerekli en-boy oranını kullanmalıdır.",
    "brand.not_found": "Marka bulunamadı.",
    "brand.transfer_not_found":
      "Marka transferi bulunamadı.",
    "brand.transfer_not_pending":
      "Bu marka transferi artık beklemede değil.",
    "team.not_found": "Takım bulunamadı.",
    "team.invite_self": "Kendinizi bu şube takımına davet edemezsiniz.",
    "team.invite_non_uso": "Şube takımına yalnızca hizmet sahibi hesaplar davet edilebilir.",
    "team.invite_already_pending": "Bu kullanıcı için zaten bekleyen bir takım daveti var.",
    "team.invite_already_member": "Bu kullanıcı zaten şube takımının kabul edilmiş bir üyesi.",
    "team.membership_not_found": "Takım üyeliği bulunamadı.",
    "team.invite_not_pending": "Bu davet artık beklemede değil.",
    "team.cannot_remove_owner": "Şube sahibinin takım üyeliği kaldırılamaz.",
    "team.already_removed": "Bu üyelik zaten kaldırılmış.",
    "moderation.brand_not_found": "Marka bulunamadı.",
    "moderation.service_not_found": "Hizmet bulunamadı.",
    "moderation.not_pending": "Bu başvuru artık beklemede değil.",
  },
  hero: {
    eyebrow: "Çok dilli Next.js başlangıcı",
    title: "Reziphay Next App",
    description:
      "Proje artık 18 dili destekliyor.",
  },
  api: {
    badge: "API",
    title: "Axios kullanıma hazır",
    description:
      "`API_URL` ile yapılandırılmış yeniden kullanılabilir bir `api` istemcisi hazır. Aynı değer `NEXT_PUBLIC_API_URL` üzerinden tarayıcıya da sunulur.",
    missingBaseUrl: "API_URL eksik",
  },
  example: {
    badge: "Kullanım",
    title: "İstek yardımcısı dahil",
    description:
      "Paylaşılan `api` örneğini doğrudan kullanabilir veya tipli istekler için genel `apiRequest` yardımcısını çağırabilirsiniz.",
  },
  dashboard: {
    ...enMessages.dashboard,
    home: "Ana sayfa",
    search: "Arama",
    profile: "Profil",
    account: "Hesabım",
    settings: "Ayarlar",
    notifications: "Bildirimler",
    services: "Hizmetler",
    brands: "Markalar",
    dashboardPage: "Panel",
    reservations: "Rezervasyonlar",
    favorites: "Favoriler",
    moderation: "Moderasyon",
    signOut: "Çıkış yap",
    signOutConfirmTitle: "Çıkış yapmak istediğinizden emin misiniz?",
    signOutConfirmDescription:
      "Bu işlem mevcut oturumunuzu sonlandırır ve sizi giriş sayfasına döndürür.",
    cancel: "İptal",
    confirmSignOut: "Çıkış yap",
    greeting: "Hoş geldiniz",
    platform: "Platform",
    support: "Destek",
    feedback: "Geri bildirim",
    typeUso: "Hizmet Sahibi",
    typeUcr: "Müşteri",
    typeAdmin: "Yönetici",
  },
  brands: {
    ...enMessages.brands,
    pageTitle: "Markalar",
    pageDescription: "Markalarınızı yönetin veya mevcut markaları keşfedin.",
    createBrand: "Marka oluştur",
    myBrands: "Markalarım",
    noBrandsTitle: "Henüz marka yok",
    noBrandsDescription:
      "Henüz bir marka oluşturmadınız. İlk markanızı oluşturarak başlayın.",
    editBrand: "Markayı düzenle",
    teamWorkspace: "Takım alanı",
    detailTitle: "Marka detayları",
    topRated: "En yüksek puanlılar",
    mostRecent: "En yeniler",
    explore: "Keşfet",
    statusPending: "Beklemede",
    statusActive: "Aktif",
    statusRejected: "Reddedildi",
    statusClosed: "Kapalı",
    formCreateTitle: "Marka oluştur",
    formEditTitle: "Markayı düzenle",
    formSaveChanges: "Değişiklikleri kaydet",
    basicInfoSection: "Temel bilgiler",
    fieldName: "Marka adı",
    fieldNamePlaceholder: "örn. Aria Atelier",
    fieldDescription: "Açıklama",
    fieldDescriptionPlaceholder:
      "Markanızı, stilini ve onu benzersiz kılan şeyleri açıklayın...",
    fieldCategories: "Kategoriler",
    fieldCategoriesPlaceholder: "Kategori seçin...",
    noCategoriesFound: "Kategori bulunamadı.",
    fieldLogo: "Marka logosu",
    fieldLogoHint: "Kare bir logo yükleyin (1:1 oran önerilir).",
    fieldLogoUpload: "Logo yükle",
    fieldLogoFormatHint: "PNG, JPG, WEBP · 1:1",
    fieldGallery: "Galeri",
    fieldGalleryHint:
      "Birden fazla vitrin görseli ekleyin (16:9 oran önerilir).",
    fieldGalleryUpload: "Galeri görselleri ekle",
    fieldGalleryFormatHint: "PNG, JPG, WEBP · 16:9",
    loginRequired: "Giriş yapmış olmanız gerekir.",
    errorGeneric: "Bir hata oluştu. Lütfen tekrar deneyin.",
    branchesTitle: "Şubeler",
    addBranch: "Şube ekle",
    noBranches: "Henüz şube eklenmedi.",
    branchModalTitle: "Şube ekle",
    branchModalDescription: "Şube konumunun detaylarını girin.",
    branchFieldName: "Şube adı",
    branchFieldNamePlaceholder: "örn. Merkez Ofis",
    branchFieldDescription: "Açıklama",
    branchFieldDescriptionPlaceholder: "İsteğe bağlı açıklama",
    branchFieldAddress1: "Adres satırı 1",
    branchFieldAddress1Placeholder: "Sokak, bina no.",
    branchFieldAddress2: "Adres satırı 2",
    branchFieldAddress2Placeholder: "Kat, daire vb. (isteğe bağlı)",
    branchFieldPhone: "Telefon",
    branchFieldPhonePlaceholder: "+994 50 000 00 00",
    branchFieldEmail: "E-posta",
    branchFieldEmailPlaceholder: "sube@example.com",
    branchField247: "7/24 açık",
    branchFieldOpening: "Açılış saati",
    branchFieldClosing: "Kapanış saati",
    branchFieldBreaks: "Molalar",
    branchAddBreak: "Mola ekle",
    branchRemoveBreak: "Kaldır",
    branchSave: "Şubeyi kaydet",
    branchCancel: "İptal",
    cancelForm: "İptal",
    verificationRequiredTitle: "Doğrulama gerekli",
    verificationRequiredDescription:
      "Marka oluşturmadan önce e-posta adresinizi veya telefon numaranızı doğrulamanız gerekir.",
    transferBrand: "Markayı devret",
    transferModalTitle: "Marka sahipliğini devret",
    transferModalDescription:
      "Bu markayı devretmek istediğiniz kullanıcıyı arayın.",
    transferSearchPlaceholder: "Ad, e-posta veya telefonla ara",
    transferConfirm: "Devret",
    transferCancel: "İptal",
    transferSuccessDescription:
      "Kullanıcı bir bildirim alacak ve devri kabul etmesi gerekecek.",
    transferConfirmStepTitle: "Devri onayla",
    transferConfirmStepDescription:
      "Aşağıdaki detayları gözden geçirin ve devam etmek istediğinizi onaylayın.",
    transferTargetLabel: "Devredilen kullanıcı",
    transferChangeTarget: "Değiştir",
    transferBrandLabel: "Marka",
    transferConfirmCheckbox:
      "Bu markanın devrinin geri alınamaz olduğunu anlıyorum ve devam etmek istiyorum.",
    transferSearchHint:
      "Ad, e-posta veya telefonla aramak için en az 2 karakter yazın.",
    transferNoResults: "Eşleşen kullanıcı bulunamadı.",
    incomingTransfersTitle: "Gelen marka devirleri",
    incomingTransfersDescription:
      "Diğer hizmet sahiplerinin size devretmek istediği markaları gözden geçirin.",
    outgoingTransfersTitle: "Bekleyen giden devirler",
    outgoingTransfersDescription:
      "Gönderdiğiniz devir isteklerini takip edin ve hâlâ beklemedeyken iptal edin.",
    noIncomingTransfers: "Şu anda gelen marka devri yok.",
    noOutgoingTransfers: "Bekleyen giden marka devri yok.",
    transferFrom: "Gönderen",
    transferTo: "Alıcı",
    transferRequestedAt: "Talep tarihi",
    acceptTransfer: "Kabul et",
    rejectTransfer: "Reddet",
    cancelTransfer: "Talebi iptal et",
    transferAcceptedDescription: "Marka devri kabul edildi.",
    transferCancelledDescription: "Marka devir talebi iptal edildi.",
    transferStatusPending: "Beklemede",
    transferStatusAccepted: "Kabul edildi",
    transferStatusRejected: "Reddedildi",
    notificationsSection: "Bildirimler",
    notificationsEmpty: "Henüz bildirim yok.",
    deleteBrand: "Markayı sil",
    deleteModalTitle: "Marka silinsin mi?",
    deleteModalDescription:
      "Bu işlem geri alınamaz. Marka kalıcı olarak silinecek.",
    deleteWithServices: "Tüm hizmetleri de sil",
    deleteServicesTransferToMe: "Hizmetleri hesabıma aktar",
    deleteServicesTransferToOther: "Hizmetleri başka bir kullanıcıya aktar",
    deleteServiceTransferNote:
      "Hizmet aktarım seçenekleri henüz kullanılabilir değil. Bu özellik hizmetler modülü yayınlandığında açılacak. Markayı şimdi silmek için yukarıdaki 'Tüm hizmetleri de sil' seçeneğini açın.",
    deleteConfirm: "Sil",
    deleteCancel: "İptal",
    createSuccessDescription:
      "Markanız incelemeye gönderildi ve onay bekliyor.",
    updateSuccessDescription:
      "Marka bilgileriniz başarıyla kaydedildi.",
    errorDescription: "Bir hata oluştu. Lütfen tekrar deneyin.",
    forbiddenDescription:
      "Bu işlemi gerçekleştirmek için yetkiniz yok.",
    notFoundDescription: "Marka bulunamadı.",
    logoRatioError: "Logo 1:1 kare oranında olmalıdır.",
    galleryRatioError: "Galeri görselleri 16:9 oranında olmalıdır.",
    rateBrand: "Bu markayı puanla",
    yourRating: "Puanınız",
    ratingSavedDescription: "Puanınız kaydedildi.",
    brandCardBrandLabel: "Marka",
    brandCardCategoryLabel: "Kategori",
    brandCardDescriptionLabel: "Açıklama",
    brandCardOwnerLabel: "Marka sahibi",
    brandCardReviewsSuffix: "yorum",
    requiredMessage: "Bu alan zorunludur.",
    nameRequiredMessage: "Marka adı zorunludur.",
    openingRequiredMessage: "Açılış saati zorunludur.",
    closingRequiredMessage: "Kapanış saati zorunludur.",
    gallery: "Galeri",
    discoverBrands: "Markaları keşfet",
    noSectionBrands: "Bu bölümde henüz marka yok.",
    branchEditModalTitle: "Şubeyi düzenle",
    detailDefaultDescription:
      "Bu marka profili temel bilgileri, medya varlıkları ve şube ağını bir araya getirir.",
    detailFilterAllBranches: "Tüm şubeler",
    detailFilterOpen247: "Sadece 7/24 açık",
    detailFilterWithContact: "İletişim bilgisi olanlar",
    detailSearchPlaceholder:
      "Şube, adres, telefon veya e-posta ara",
    detailTableBranch: "Şube",
    detailTableAddress: "Adres",
    detailTableAvailability: "Uygunluk",
    detailTableContact: "İletişim",
    detailBranchOpenDetails: "Detayları görüntüle",
    detailBranchModalTitle: "Şube detayları",
    detailBranchModalDescription:
      "Tüm şube bilgileri burada gösterilir.",
    detailNoMatchingBranches:
      "Mevcut filtrelere uyan şube bulunamadı.",
    detailMetricCategories: "Kategoriler",
    detailMetricBranches: "Şubeler",
    detailMetricGallery: "Galeri öğeleri",
    detailMetricTeamMembers: "Takım üyeleri",
    detailMetricRating: "Puan",
    detailNoGalleryMedia:
      "Bu marka için henüz galeri görseli eklenmedi.",
    detailGalleryPrevious: "Önceki görsel",
    detailGalleryNext: "Sonraki görsel",
    detailGalleryAutoplay: "Otomatik oynatma açık",
    detailGalleryPaused: "Otomatik oynatma duraklatıldı",
  },
  profile: {
    ...enMessages.profile,
    title: "Profilim",
    description: "Hesap bilgilerinizi buradan yönetin",
    editDescription:
      "Hesabınız için güncel tutmak istediğiniz alanları güncelleyin.",
    personalInfo: "Kişisel bilgiler",
    firstName: "Ad",
    lastName: "Soyad",
    email: "E-posta",
    birthday: "Doğum tarihi",
    country: "Ülke",
    phone: "Telefon",
    phonePlaceholder: "Telefon numaranızı girin",
    phoneMissing: "Telefon eklenmedi",
    phonePrefix: "Telefon kodu",
    photoAlt: "Profil fotoğrafı",
    changePhoto: "Fotoğrafı değiştir",
    removePhoto: "Fotoğrafı kaldır",
    uploadPhoto: "Profil fotoğrafı yükle",
    uploadingPhoto: "Profil fotoğrafı yükleniyor",
    cropPhotoTitle: "Profil fotoğrafını kırp",
    cropPhotoDescription:
      "Görüntüyü kare çerçeveye uyacak şekilde ayarlayın. Yeniden konumlandırmak için sürükleyin ve ölçeklemek için yakınlaştırmayı kullanın.",
    cropPhotoZoom: "Yakınlaştır",
    cropPhotoHint:
      "Kare önizleme profil fotoğrafınız olarak kullanılacaktır.",
    cropPhotoCancel: "İptal",
    cropPhotoConfirm: "Kırp ve yükle",
    cropPhotoProcessing: "Hazırlanıyor",
    removePhotoConfirmTitle: "Profil fotoğrafı kaldırılsın mı?",
    removePhotoConfirmDescription:
      "Mevcut profil fotoğrafınız kaldırılacak ve baş harfleriniz yeniden gösterilecektir.",
    removePhotoConfirmAction: "Kaldır",
    photoUpdatedTitle: "Profil fotoğrafı güncellendi",
    photoUpdatedDescription:
      "Profil fotoğrafınız başarıyla güncellendi.",
    photoRemovedTitle: "Profil fotoğrafı kaldırıldı",
    photoRemovedDescription:
      "Profil fotoğrafınız başarıyla kaldırıldı.",
    photoUpdateErrorTitle: "Profil fotoğrafı güncellenemedi",
    photoUpdateErrorDescription:
      "Profil fotoğrafınız yüklenirken bir sorun oluştu.",
    photoConfigurationErrorDescription:
      "Profil fotoğrafı servisi henüz yapılandırılmadı. API bağlantısını kontrol edin.",
    photoInvalidTypeDescription:
      "Yalnızca JPG, PNG veya WEBP görseller yükleyebilirsiniz.",
    photoTooLargeDescription:
      "Profil fotoğrafı 5 MB veya daha küçük olmalıdır.",
    photoUnauthorizedDescription:
      "Profil fotoğrafını güncellemek için tekrar giriş yapmanız gerekiyor.",
    photoForbiddenDescription:
      "Bu profil fotoğrafını güncelleme izniniz yok.",
    photoNotFoundDescription:
      "Profil fotoğrafı yükleme servisi bulunamadı.",
    photoConflictDescription:
      "Bu fotoğraf şu anda yüklenemedi. Lütfen tekrar deneyin.",
    photoRateLimitedDescription:
      "Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.",
    photoServerErrorDescription:
      "Bir sunucu hatası oluştu. Lütfen biraz sonra tekrar deneyin.",
    dismissFeedback: "Bildirimi kapat",
    emailLockedDescription:
      "Bu e-posta doğrulandı ve artık değiştirilemez.",
    phoneLockedDescription:
      "Bu telefon numarası doğrulandı ve artık değiştirilemez.",
    accountInfo: "Hesap bilgileri",
    userType: "Kullanıcı tipi",
    emailVerified: "E-posta doğrulandı",
    emailNotVerified: "E-posta doğrulanmadı",
    phoneVerified: "Telefon doğrulandı",
    phoneNotVerified: "Telefon doğrulanmadı",
    memberSince: "Üyelik tarihi",
    brandsSectionTitle: "Markalar",
    brandsSectionDescription:
      "Bu hizmet sahibinin profilinde görünür kıldığı markalara göz atın.",
    brandsEmptyTitle: "Henüz herkese açık marka yok",
    brandsEmptyDescription:
      "Bu hizmet sahibinin şu anda görünür markası bulunmuyor.",
    viewMoreBrands: "Daha fazlasını gör",
    editProfile: "Profili düzenle",
    cancelEditing: "İptal",
    saveChanges: "Değişiklikleri kaydet",
    savingChanges: "Değişiklikler kaydediliyor",
    updateSuccessTitle: "Profil güncellendi",
    updateSuccessDescription:
      "Hesap bilgileriniz başarıyla kaydedildi.",
    updateErrorTitle: "Profil güncellenemedi",
    updateErrorDescription:
      "Hesap değişiklikleri kaydedilirken bir sorun oluştu.",
    configurationErrorDescription:
      "Profil güncelleme servisi henüz yapılandırılmadı. API bağlantısını kontrol edin.",
    networkErrorDescription:
      "Sunucuya bağlanılamadı. Lütfen tekrar deneyin.",
    badRequestDescription: "Gönderilen veriler kabul edilmedi.",
    unauthorizedDescription:
      "Devam etmek için tekrar giriş yapmanız gerekiyor.",
    forbiddenDescription:
      "Bu hesabı güncelleme izniniz yok.",
    notFoundDescription:
      "Profil güncelleme servisi bulunamadı.",
    conflictDescription:
      "Bu e-posta veya telefon başka bir hesap tarafından kullanılıyor.",
    unprocessableEntityDescription:
      "Gönderilen veriler doğrulamadan geçemedi.",
    rateLimitedDescription:
      "Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.",
    serverErrorDescription:
      "Bir sunucu hatası oluştu. Lütfen biraz sonra tekrar deneyin.",
    validationErrorDescription:
      "Kaydetmeden önce form hatalarını düzeltin.",
    requiredMessage: "Bu alan zorunludur.",
    firstNameInvalidMessage: "Ad en az 2 karakter olmalıdır.",
    lastNameInvalidMessage: "Soyad en az 2 karakter olmalıdır.",
    birthdayRequiredMessage:
      "Lütfen doğum tarihinizi girin.",
    birthdayAgeMessage: "En az 18 yaşında olmalısınız.",
    emailInvalidMessage:
      "Lütfen geçerli bir e-posta adresi girin.",
    phoneInvalidMessage:
      "Lütfen geçerli bir telefon numarası girin.",
    typeUso: "Hizmet Sahibi",
    typeUcr: "Müşteri",
    typeAdmin: "Yönetici",
  },
  categories: {
    food_beverage: "Yiyecek & İçecek",
    beauty_wellness: "Güzellik & Sağlık",
    fitness_sports: "Fitness & Spor",
    fashion_apparel: "Moda & Giyim",
    technology_electronics: "Teknoloji & Elektronik",
    home_furniture: "Ev & Mobilya",
    health_pharmacy: "Sağlık & Eczane",
    education_training: "Eğitim & Öğretim",
    entertainment_media: "Eğlence & Medya",
    travel_hospitality: "Seyahat & Konaklama",
    haircut_styling: "Saç Kesimi & Şekillendirme",
    massage_therapy: "Masaj & Terapi",
    personal_training: "Kişisel Antrenman",
    nail_care: "Tırnak Bakımı",
    facial_treatment: "Yüz Bakımı",
    dental_care: "Diş Bakımı",
    consulting: "Danışmanlık",
    photo_session: "Fotoğraf Çekimi",
  },
    calendar: {
    ...enMessages.calendar,
    today: "Bugün",
    viewDay: "Gün",
    viewWorkWeek: "İş haftası",
    viewWeek: "Hafta",
    viewMonth: "Ay",
    filter: "Filtre",
    newReservation: "Yeni",
    myServices: "Hizmetlerim",
    noServicesYet: "Henüz hizmet yok",
    noReservationsTitle: "Henüz rezervasyon yok",
    noReservationsDesc: "Müşteriler hizmetlerinizi rezerve ettiğinde burada görünecek.",
    settingsTitle: "Takvim ayarları",
    settingsTimeFormat: "Saat formatı",
    timeFormat12h: "AM/PM",
    timeFormat24h: "24s",
  },
};
