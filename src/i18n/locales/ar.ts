import type { Messages } from "../types";
import { enMessages } from "./en";

export const arMessages: Messages = {
  ...enMessages,
  metadata: {
    title: "Reziphay Next App",
    description:
      "مشروع Next.js متعدد اللغات يدعم العربية إلى جانب الأذربيجانية والإنجليزية والروسية والإسبانية والفرنسية والتركية والألمانية ونسخ الإنجليزية الإقليمية.",
  },
  languageSwitcherAriaLabel: "مبدّل اللغة",
  languageSwitcherDisplayLabel: "لغة العرض",
  navigationAriaLabel: "التنقل الرئيسي",
  navigation: {
    home: "الرئيسية",
    aboutUs: "من نحن",
    questions: "الأسئلة",
    contactUs: "اتصل بنا",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
  },
  comingSoon: {
    badge: "قريبًا",
    description: "هذه الصفحة ما زالت قيد التحضير.",
  },
  auth: {
    shell: {
      badge: "Reziphay Access",
      title: "أدر حساب Reziphay من أي مكان",
      description:
        "اجمع مسارات مالك الخدمة والعميل في تجربة دخول واحدة أنيقة وآمنة.",
      featureOneTitle: "تجربة دخول مشتركة",
      featureOneDescription:
        "تسجيل الدخول والتسجيل وشاشات المصادقة المستقبلية تعمل كلها ضمن هيكل واحد قابل لإعادة الاستخدام.",
      featureTwoTitle: "تهيئة حسب الدور",
      featureTwoDescription:
        "تبقى رحلات مالك الخدمة والعميل واضحة ومنفصلة من دون تعقيد إضافي.",
      featureThreeTitle: "سريع ومتجاوب",
      featureThreeDescription:
        "يحافظ التصميم على تركيز النموذج على الشاشات المكتبية والمحمولة.",
    },
    login: {
      title: "سجّل الدخول إلى حسابك",
      description:
        "أدخل بريدك الإلكتروني أدناه لتسجيل الدخول إلى حسابك",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "m@example.com",
      passwordLabel: "كلمة المرور",
      passwordPlaceholder: "أدخل كلمة المرور",
      forgotPassword: "هل نسيت كلمة المرور؟",
      submit: "تسجيل الدخول",
      submitting: "جارٍ تسجيل الدخول",
      continueWithGoogle: "تسجيل الدخول باستخدام Google",
      noAccount: "ليس لديك حساب؟",
      signUp: "إنشاء حساب",
      errorTitle: "فشل تسجيل الدخول",
      errorDescription:
        "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.",
      configurationErrorDescription:
        "خدمة تسجيل الدخول غير مهيأة بعد. يرجى التحقق من اتصال الـ API.",
      networkErrorDescription:
        "تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
      maintenanceDescription:
        "النظام غير متاح مؤقتًا. يرجى المحاولة بعد قليل.",
      badRequestDescription: "لم يتم قبول البيانات المرسلة.",
      unauthorizedDescription:
        "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      forbiddenDescription:
        "ليست لديك صلاحية لتنفيذ هذا الإجراء.",
      notFoundDescription: "تعذر العثور على خدمة تسجيل الدخول.",
      rateLimitedDescription:
        "تم إجراء عدد كبير جدًا من المحاولات. يرجى المحاولة لاحقًا.",
      serverErrorDescription:
        "حدث خطأ في الخادم. يرجى المحاولة مرة أخرى بعد قليل.",
      validationErrorDescription:
        "يرجى تصحيح أخطاء النموذج قبل المتابعة.",
      requiredMessage: "هذا الحقل مطلوب.",
      emailInvalidMessage:
        "يرجى إدخال عنوان بريد إلكتروني صالح.",
      passwordRequiredMessage: "يرجى إدخال كلمة المرور.",
      showPasswordLabel: "إظهار كلمة المرور",
      hidePasswordLabel: "إخفاء كلمة المرور",
    },
    register: {
      title: "أنشئ حسابك",
      description:
        "أدخل بياناتك أدناه لتسجيل حساب جديد",
      firstNameLabel: "الاسم الأول",
      firstNamePlaceholder: "John",
      lastNameLabel: "اسم العائلة",
      lastNamePlaceholder: "Doe",
      birthdayLabel: "تاريخ الميلاد",
      countryLabel: "الدولة",
      countryPlaceholder: "أذربيجان",
      noCountryResults: "لم يتم العثور على دولة مطابقة.",
      countryPrefixLabel: "مقدمة الدولة",
      countryPrefixPlaceholder: "+994",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "m@example.com",
      passwordLabel: "كلمة المرور",
      passwordPlaceholder: "أنشئ كلمة مرور جديدة",
      passwordHint: "استخدم 8 أحرف على الأقل.",
      typeLabel: "نوع المستخدم",
      typePlaceholder: "اختر نوع المستخدم",
      typeDescription:
        "يمكن فقط لحسابات مالك الخدمة والعميل التسجيل هنا.",
      typeUso: "مالك الخدمة",
      typeUsoDescription:
        "حساب للشخص أو الفريق الذي يدير الخدمة.",
      typeUcr: "عميل",
      typeUcrDescription:
        "حساب لعميل يستخدم الخدمة.",
      noTypeResults: "لم يتم العثور على نوع مستخدم مطابق.",
      submit: "إنشاء الحساب",
      submitting: "جارٍ الإرسال",
      termsAgreement:
        "بإنشاء حساب فإنك توافق على الشروط والأحكام.",
      successTitle: "تم إرسال طلب التسجيل",
      successDescription:
        "ستتمكن من تسجيل الدخول بعد إنشاء الحساب.",
      errorTitle: "فشل التسجيل",
      errorDescription:
        "حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.",
      configurationErrorDescription:
        "خدمة التسجيل غير مهيأة بعد. يرجى التحقق من اتصال الـ API.",
      networkErrorDescription:
        "تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
      maintenanceDescription:
        "النظام غير متاح مؤقتًا. يرجى المحاولة بعد قليل.",
      badRequestDescription: "لم يتم قبول البيانات المرسلة.",
      unauthorizedDescription: "هذا الطلب غير مصرح به.",
      forbiddenDescription:
        "ليست لديك صلاحية لتنفيذ هذا الإجراء.",
      notFoundDescription: "تعذر العثور على خدمة التسجيل.",
      conflictDescription:
        "يوجد حساب يستخدم هذا البريد الإلكتروني بالفعل.",
      unprocessableEntityDescription:
        "فشلت البيانات المرسلة في التحقق.",
      rateLimitedDescription:
        "تم إجراء عدد كبير جدًا من المحاولات. يرجى المحاولة لاحقًا.",
      serverErrorDescription:
        "حدث خطأ في الخادم. يرجى المحاولة مرة أخرى بعد قليل.",
      validationErrorDescription:
        "يرجى تصحيح أخطاء النموذج قبل المتابعة.",
      requiredMessage: "هذا الحقل مطلوب.",
      firstNameInvalidMessage:
        "يجب أن يحتوي الاسم الأول على حرفين على الأقل.",
      lastNameInvalidMessage:
        "يجب أن يحتوي اسم العائلة على حرفين على الأقل.",
      birthdayRequiredMessage:
        "يرجى إدخال تاريخ الميلاد.",
      birthdayAgeMessage:
        "يجب أن يكون عمرك 13 عامًا على الأقل للتسجيل.",
      emailInvalidMessage:
        "يرجى إدخال عنوان بريد إلكتروني صالح.",
      passwordInvalidMessage:
        "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل وأن تحتوي على حرف كبير وحرف صغير ورقم.",
      typeRequiredMessage: "يرجى اختيار نوع المستخدم.",
      showPasswordLabel: "إظهار كلمة المرور",
      hidePasswordLabel: "إخفاء كلمة المرور",
    },
  },
  backendErrors: {
    "auth.invalid_credentials":
      "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    "errors.validation_error":
      "فشلت البيانات المرسلة في التحقق.",
    "errors.missing_token": "رمز المصادقة مفقود.",
    "errors.invalid_token": "رمز المصادقة غير صالح.",
    "errors.forbidden":
      "ليست لديك صلاحية لتنفيذ هذا الإجراء.",
    "user.not_found": "المستخدم غير موجود.",
    "user.email_change_not_allowed":
      "لا يمكن تغيير عنوان البريد الإلكتروني هذا بعد الآن.",
    "user.phone_change_not_allowed":
      "لا يمكن تغيير رقم الهاتف هذا بعد الآن.",
    "user.email_already_in_use":
      "عنوان البريد الإلكتروني هذا مستخدم بالفعل.",
    "user.phone_already_in_use":
      "رقم الهاتف هذا مستخدم بالفعل.",
    "media.invalid_file_type":
      "نوع الملف المحدد غير مدعوم.",
    "media.file_too_large": "الملف المحدد كبير جدًا.",
    "media.invalid_logo_ratio":
      "يجب أن تستخدم صورة الشعار النسبة المطلوبة.",
    "media.invalid_gallery_ratio":
      "يجب أن تستخدم صورة المعرض النسبة المطلوبة.",
    "brand.not_found": "العلامة التجارية غير موجودة.",
    "brand.transfer_not_found":
      "لم يتم العثور على نقل العلامة التجارية.",
    "brand.transfer_not_pending":
      "لم يعد نقل العلامة التجارية هذا قيد الانتظار.",
    "moderation.brand_not_found": "العلامة التجارية غير موجودة.",
    "moderation.service_not_found": "الخدمة غير موجودة.",
    "moderation.not_pending": "هذا الطلب لم يعد قيد الانتظار.",
  },
  hero: {
    eyebrow: "مشروع Next.js متعدد اللغات",
    title: "Reziphay Next App",
    description:
      "يدعم المشروع الآن الأذربيجانية والإنجليزية والروسية والإسبانية والفرنسية والتركية والعربية والألمانية، بالإضافة إلى نسخ إنجليزية إقليمية للهند والمملكة المتحدة والولايات المتحدة.",
  },
  api: {
    badge: "API",
    title: "Axios جاهز للاستخدام",
    description:
      "تم إعداد عميل `api` قابل لإعادة الاستخدام باستخدام `API_URL`. كما يتم توفير القيمة نفسها في المتصفح عبر `NEXT_PUBLIC_API_URL`.",
    missingBaseUrl: "API_URL مفقود",
  },
  example: {
    badge: "الاستخدام",
    title: "مساعد الطلبات مضمّن",
    description:
      "يمكنك استخدام نسخة `api` المشتركة مباشرة أو استدعاء المساعد العام `apiRequest` لطلبات ذات أنواع محددة.",
  },
  dashboard: {
    home: "الرئيسية",
    search: "البحث",
    profile: "الملف الشخصي",
    account: "حسابي",
    settings: "الإعدادات",
    notifications: "الإشعارات",
    services: "الخدمات",
    brands: "العلامات التجارية",
    dashboardPage: "لوحة التحكم",
    reservations: "الحجوزات",
    favorites: "المفضلة",
    moderation: "الإشراف",
    signOut: "تسجيل الخروج",
    signOutConfirmTitle: "هل أنت متأكد أنك تريد تسجيل الخروج؟",
    signOutConfirmDescription:
      "سيؤدي هذا إلى إنهاء جلستك الحالية وإعادتك إلى صفحة تسجيل الدخول.",
    cancel: "إلغاء",
    confirmSignOut: "تسجيل الخروج",
    greeting: "مرحبًا",
    platform: "المنصة",
    support: "الدعم",
    feedback: "الملاحظات",
    typeUso: "مالك الخدمة",
    typeUcr: "عميل",
    typeAdmin: "مشرف",
  },
  brands: {
    ...enMessages.brands,
    pageTitle: "العلامات التجارية",
    pageDescription: "أدر علاماتك التجارية أو استكشف المتاح منها.",
    createBrand: "إنشاء علامة تجارية",
    myBrands: "علاماتي التجارية",
    noBrandsTitle: "لا توجد علامات تجارية بعد",
    noBrandsDescription:
      "لم تنشئ أي علامة تجارية بعد. ابدأ بإنشاء أول علامة لك.",
    editBrand: "تعديل العلامة التجارية",
    detailTitle: "تفاصيل العلامة التجارية",
    topRated: "الأعلى تقييمًا",
    mostRecent: "الأحدث",
    explore: "استكشاف",
    statusPending: "قيد الانتظار",
    statusActive: "نشطة",
    statusRejected: "مرفوضة",
    statusClosed: "مغلقة",
    formCreateTitle: "إنشاء علامة تجارية",
    formEditTitle: "تعديل العلامة التجارية",
    formSaveChanges: "حفظ التغييرات",
    basicInfoSection: "المعلومات الأساسية",
    fieldName: "اسم العلامة التجارية",
    fieldNamePlaceholder: "مثال: Aria Atelier",
    fieldDescription: "الوصف",
    fieldDescriptionPlaceholder:
      "صف علامتك التجارية وأسلوبها وما الذي يجعلها مميزة...",
    fieldCategories: "الفئات",
    fieldCategoriesPlaceholder: "اختر الفئات...",
    noCategoriesFound: "لم يتم العثور على فئات.",
    fieldLogo: "شعار العلامة التجارية",
    fieldLogoHint:
      "ارفع شعارًا مربعًا (يُوصى بنسبة 1:1).",
    fieldLogoUpload: "رفع الشعار",
    fieldLogoFormatHint: "PNG, JPG, WEBP · 1:1",
    fieldGallery: "المعرض",
    fieldGalleryHint:
      "أضف عدة صور عرض (يُوصى بنسبة 16:9).",
    fieldGalleryUpload: "إضافة صور إلى المعرض",
    fieldGalleryFormatHint: "PNG, JPG, WEBP · 16:9",
    loginRequired: "يجب عليك تسجيل الدخول.",
    errorGeneric: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    branchesTitle: "الفروع",
    addBranch: "إضافة فرع",
    noBranches: "لم تتم إضافة أي فروع بعد.",
    branchModalTitle: "إضافة فرع",
    branchModalDescription: "أدخل تفاصيل موقع الفرع.",
    branchFieldName: "اسم الفرع",
    branchFieldNamePlaceholder: "مثال: المكتب الرئيسي",
    branchFieldDescription: "الوصف",
    branchFieldDescriptionPlaceholder: "وصف اختياري",
    branchFieldAddress1: "سطر العنوان 1",
    branchFieldAddress1Placeholder: "الشارع، رقم المبنى",
    branchFieldAddress2: "سطر العنوان 2",
    branchFieldAddress2Placeholder:
      "الطابق، الشقة، إلخ (اختياري)",
    branchFieldPhone: "الهاتف",
    branchFieldPhonePlaceholder: "+994 50 000 00 00",
    branchFieldEmail: "البريد الإلكتروني",
    branchFieldEmailPlaceholder: "branch@example.com",
    branchField247: "مفتوح 24/7",
    branchFieldOpening: "وقت الافتتاح",
    branchFieldClosing: "وقت الإغلاق",
    branchFieldBreaks: "فترات الاستراحة",
    branchAddBreak: "إضافة استراحة",
    branchRemoveBreak: "إزالة",
    branchSave: "حفظ الفرع",
    branchCancel: "إلغاء",
    cancelForm: "إلغاء",
    verificationRequiredTitle: "التحقق مطلوب",
    verificationRequiredDescription:
      "يجب عليك التحقق من بريدك الإلكتروني أو رقم هاتفك قبل إنشاء علامة تجارية.",
    transferBrand: "نقل العلامة التجارية",
    transferModalTitle: "نقل ملكية العلامة التجارية",
    transferModalDescription:
      "ابحث عن المستخدم الذي تريد نقل هذه العلامة التجارية إليه.",
    transferSearchPlaceholder: "ابحث بالاسم أو البريد أو الهاتف",
    transferConfirm: "نقل",
    transferCancel: "إلغاء",
    transferSuccessDescription:
      "سيتلقى المستخدم إشعارًا وسيتعين عليه قبول النقل.",
    transferConfirmStepTitle: "تأكيد النقل",
    transferConfirmStepDescription:
      "راجع التفاصيل أدناه وأكد أنك تريد المتابعة.",
    transferTargetLabel: "النقل إلى",
    transferChangeTarget: "تغيير",
    transferBrandLabel: "العلامة التجارية",
    transferConfirmCheckbox:
      "أفهم أن نقل هذه العلامة التجارية لا يمكن التراجع عنه وأرغب في المتابعة.",
    transferSearchHint:
      "اكتب حرفين على الأقل للبحث بالاسم أو البريد أو الهاتف.",
    transferNoResults: "لم يتم العثور على مستخدمين مطابقين.",
    incomingTransfersTitle: "عمليات نقل العلامات الواردة",
    incomingTransfersDescription:
      "راجع العلامات التجارية التي يريد مالكو الخدمات الآخرون نقلها إليك.",
    outgoingTransfersTitle: "عمليات النقل الصادرة المعلقة",
    outgoingTransfersDescription:
      "تابع طلبات النقل التي أرسلتها وألغها ما دامت لا تزال معلقة.",
    noIncomingTransfers:
      "لا توجد عمليات نقل علامات واردة حاليًا.",
    noOutgoingTransfers:
      "لا توجد عمليات نقل صادرة معلقة.",
    transferFrom: "من",
    transferTo: "إلى",
    transferRequestedAt: "تاريخ الطلب",
    acceptTransfer: "قبول",
    rejectTransfer: "رفض",
    cancelTransfer: "إلغاء الطلب",
    transferAcceptedDescription: "تم قبول نقل العلامة التجارية.",
    transferCancelledDescription: "تم إلغاء طلب نقل العلامة التجارية.",
    transferStatusPending: "قيد الانتظار",
    transferStatusAccepted: "مقبول",
    transferStatusRejected: "مرفوض",
    notificationsSection: "الإشعارات",
    notificationsEmpty: "لا توجد إشعارات بعد.",
    deleteBrand: "حذف العلامة التجارية",
    deleteModalTitle: "هل تريد حذف العلامة التجارية؟",
    deleteModalDescription:
      "لا يمكن التراجع عن هذا الإجراء. سيتم حذف العلامة التجارية نهائيًا.",
    deleteWithServices: "احذف جميع الخدمات أيضًا",
    deleteServicesTransferToMe: "انقل الخدمات إلى حسابي",
    deleteServicesTransferToOther: "انقل الخدمات إلى مستخدم آخر",
    deleteServiceTransferNote:
      "خيارات نقل الخدمات غير متاحة بعد. سيتم تفعيل هذه الميزة عند إطلاق وحدة الخدمات. لحذف هذه العلامة الآن، فعّل خيار 'احذف جميع الخدمات أيضًا' أعلاه.",
    deleteConfirm: "حذف",
    deleteCancel: "إلغاء",
    createSuccessDescription:
      "تم إرسال علامتك التجارية للمراجعة وهي بانتظار الموافقة.",
    updateSuccessDescription:
      "تم حفظ معلومات علامتك التجارية بنجاح.",
    errorDescription: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    forbiddenDescription: "ليست لديك صلاحية لتنفيذ هذا الإجراء.",
    notFoundDescription: "تعذر العثور على العلامة التجارية.",
    logoRatioError: "يجب أن تكون نسبة الشعار 1:1.",
    galleryRatioError: "يجب أن تكون صور المعرض بنسبة 16:9.",
    rateBrand: "قيّم هذه العلامة التجارية",
    yourRating: "تقييمك",
    ratingSavedDescription: "تم حفظ تقييمك.",
    brandCardBrandLabel: "العلامة التجارية",
    brandCardCategoryLabel: "الفئة",
    brandCardDescriptionLabel: "الوصف",
    brandCardOwnerLabel: "مالك العلامة التجارية",
    brandCardReviewsSuffix: "مراجعات",
    requiredMessage: "هذا الحقل مطلوب.",
    nameRequiredMessage: "اسم العلامة التجارية مطلوب.",
    openingRequiredMessage: "وقت الافتتاح مطلوب.",
    closingRequiredMessage: "وقت الإغلاق مطلوب.",
    gallery: "المعرض",
    discoverBrands: "اكتشف العلامات التجارية",
    noSectionBrands: "لا توجد علامات في هذا القسم بعد.",
    branchEditModalTitle: "تعديل الفرع",
    detailDefaultDescription:
      "يجمع هذا الملف الخاص بالعلامة التجارية معلوماتها الأساسية ووسائطها وشبكة فروعها.",
    detailFilterAllBranches: "كل الفروع",
    detailFilterOpen247: "24/7 فقط",
    detailFilterWithContact: "مع معلومات اتصال",
    detailSearchPlaceholder:
      "ابحث عن فرع أو عنوان أو هاتف أو بريد إلكتروني",
    detailTableBranch: "الفرع",
    detailTableAddress: "العنوان",
    detailTableAvailability: "التوفر",
    detailTableContact: "التواصل",
    detailBranchOpenDetails: "عرض التفاصيل",
    detailBranchModalTitle: "تفاصيل الفرع",
    detailBranchModalDescription:
      "تظهر هنا جميع معلومات الفرع.",
    detailNoMatchingBranches:
      "لا توجد فروع تطابق عوامل التصفية الحالية.",
    detailMetricCategories: "الفئات",
    detailMetricBranches: "الفروع",
    detailMetricGallery: "عناصر المعرض",
    detailMetricTeamMembers: "أعضاء الفريق",
    detailMetricRating: "التقييم",
    detailNoGalleryMedia:
      "لم تتم إضافة صور معرض لهذه العلامة التجارية بعد.",
    detailGalleryPrevious: "الصورة السابقة",
    detailGalleryNext: "الصورة التالية",
    detailGalleryAutoplay: "التشغيل التلقائي مفعّل",
    detailGalleryPaused: "تم إيقاف التشغيل التلقائي مؤقتًا",
  },
  profile: {
    ...enMessages.profile,
    title: "ملفي الشخصي",
    description: "أدر معلومات حسابك من هنا",
    editDescription:
      "حدّث الحقول التي تريد إبقاءها محدثة في حسابك.",
    personalInfo: "المعلومات الشخصية",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    email: "البريد الإلكتروني",
    birthday: "تاريخ الميلاد",
    country: "الدولة",
    phone: "الهاتف",
    phonePlaceholder: "أدخل رقم هاتفك",
    phoneMissing: "لم تتم إضافة رقم هاتف",
    phonePrefix: "مقدمة الهاتف",
    photoAlt: "صورة الملف الشخصي",
    changePhoto: "تغيير الصورة",
    removePhoto: "إزالة الصورة",
    uploadPhoto: "رفع صورة الملف الشخصي",
    uploadingPhoto: "جارٍ رفع صورة الملف الشخصي",
    cropPhotoTitle: "قص صورة الملف الشخصي",
    cropPhotoDescription:
      "اضبط الصورة لتلائم الإطار المربع. اسحب لإعادة التموضع واستخدم التكبير للتصغير أو التوسيع.",
    cropPhotoZoom: "تكبير",
    cropPhotoHint:
      "ستُستخدم المعاينة المربعة كصورة ملفك الشخصي.",
    cropPhotoCancel: "إلغاء",
    cropPhotoConfirm: "قص ورفع",
    cropPhotoProcessing: "جارٍ التحضير",
    removePhotoConfirmTitle: "إزالة صورة الملف الشخصي؟",
    removePhotoConfirmDescription:
      "ستتم إزالة صورة ملفك الشخصي الحالية وسيتم عرض أحرفك الأولى مرة أخرى.",
    removePhotoConfirmAction: "إزالة",
    photoUpdatedTitle: "تم تحديث صورة الملف الشخصي",
    photoUpdatedDescription:
      "تم تحديث صورة ملفك الشخصي بنجاح.",
    photoRemovedTitle: "تمت إزالة صورة الملف الشخصي",
    photoRemovedDescription:
      "تمت إزالة صورة ملفك الشخصي بنجاح.",
    photoUpdateErrorTitle: "تعذر تحديث صورة الملف الشخصي",
    photoUpdateErrorDescription:
      "حدث خطأ أثناء رفع صورة ملفك الشخصي.",
    photoConfigurationErrorDescription:
      "خدمة صورة الملف الشخصي غير مهيأة بعد. يرجى التحقق من اتصال الـ API.",
    photoInvalidTypeDescription:
      "يمكنك فقط رفع صور JPG أو PNG أو WEBP.",
    photoTooLargeDescription:
      "يجب أن تكون صورة الملف الشخصي بحجم 5 ميغابايت أو أقل.",
    photoUnauthorizedDescription:
      "تحتاج إلى تسجيل الدخول مرة أخرى لتحديث صورة ملفك الشخصي.",
    photoForbiddenDescription:
      "ليست لديك صلاحية لتحديث صورة الملف الشخصي هذه.",
    photoNotFoundDescription:
      "تعذر العثور على خدمة رفع صورة الملف الشخصي.",
    photoConflictDescription:
      "تعذر رفع هذه الصورة الآن. يرجى المحاولة مرة أخرى.",
    photoRateLimitedDescription:
      "تم إجراء عدد كبير جدًا من المحاولات. يرجى المحاولة لاحقًا.",
    photoServerErrorDescription:
      "حدث خطأ في الخادم. يرجى المحاولة مرة أخرى بعد قليل.",
    dismissFeedback: "إغلاق الإشعار",
    emailLockedDescription:
      "تم التحقق من هذا البريد الإلكتروني ولا يمكن تغييره بعد الآن.",
    phoneLockedDescription:
      "تم التحقق من رقم الهاتف هذا ولا يمكن تغييره بعد الآن.",
    accountInfo: "معلومات الحساب",
    userType: "نوع المستخدم",
    emailVerified: "البريد الإلكتروني موثّق",
    emailNotVerified: "البريد الإلكتروني غير موثّق",
    phoneVerified: "الهاتف موثّق",
    phoneNotVerified: "الهاتف غير موثّق",
    memberSince: "عضو منذ",
    brandsSectionTitle: "العلامات التجارية",
    brandsSectionDescription:
      "تصفح العلامات التجارية التي جعلها مالك الخدمة مرئية على ملفه الشخصي.",
    brandsEmptyTitle: "لا توجد علامات عامة بعد",
    brandsEmptyDescription:
      "لا يملك مالك الخدمة هذا أي علامات مرئية في الوقت الحالي.",
    viewMoreBrands: "عرض المزيد",
    editProfile: "تعديل الملف الشخصي",
    cancelEditing: "إلغاء",
    saveChanges: "حفظ التغييرات",
    savingChanges: "جارٍ حفظ التغييرات",
    updateSuccessTitle: "تم تحديث الملف الشخصي",
    updateSuccessDescription:
      "تم حفظ معلومات حسابك بنجاح.",
    updateErrorTitle: "تعذر تحديث الملف الشخصي",
    updateErrorDescription:
      "حدث خطأ أثناء حفظ تغييرات الحساب.",
    configurationErrorDescription:
      "خدمة تحديث الملف الشخصي غير مهيأة بعد. يرجى التحقق من اتصال الـ API.",
    networkErrorDescription:
      "تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
    badRequestDescription: "لم يتم قبول البيانات المرسلة.",
    unauthorizedDescription:
      "تحتاج إلى تسجيل الدخول مرة أخرى للمتابعة.",
    forbiddenDescription:
      "ليست لديك صلاحية لتحديث هذا الحساب.",
    notFoundDescription:
      "تعذر العثور على خدمة تحديث الملف الشخصي.",
    conflictDescription:
      "هناك حساب آخر يستخدم هذا البريد الإلكتروني أو رقم الهاتف.",
    unprocessableEntityDescription:
      "فشلت البيانات المرسلة في التحقق.",
    rateLimitedDescription:
      "تم إجراء عدد كبير جدًا من المحاولات. يرجى المحاولة لاحقًا.",
    serverErrorDescription:
      "حدث خطأ في الخادم. يرجى المحاولة مرة أخرى بعد قليل.",
    validationErrorDescription:
      "يرجى تصحيح أخطاء النموذج قبل الحفظ.",
    requiredMessage: "هذا الحقل مطلوب.",
    firstNameInvalidMessage:
      "يجب أن يحتوي الاسم الأول على حرفين على الأقل.",
    lastNameInvalidMessage:
      "يجب أن يحتوي اسم العائلة على حرفين على الأقل.",
    birthdayRequiredMessage: "يرجى إدخال تاريخ الميلاد.",
    birthdayAgeMessage: "يجب أن يكون عمرك 13 عامًا على الأقل.",
    emailInvalidMessage:
      "يرجى إدخال عنوان بريد إلكتروني صالح.",
    phoneInvalidMessage:
      "يرجى إدخال رقم هاتف صالح.",
    typeUso: "مالك الخدمة",
    typeUcr: "عميل",
    typeAdmin: "مشرف",
  },
};
