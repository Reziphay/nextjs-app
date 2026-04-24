import type { Locale } from "@/i18n/config";

type AuthFlowMessages = {
  recaptcha: {
    live: string;
    developmentBypass: string;
    unavailable: string;
  };
  login: {
    twoFactorTitle: string;
    twoFactorDescription: string;
    twoFactorCodeLabel: string;
    twoFactorCodePlaceholder: string;
    twoFactorSubmit: string;
    twoFactorSubmitting: string;
    twoFactorBack: string;
    twoFactorHelp: string;
    recaptchaError: string;
  };
  register: {
    phoneLabel: string;
    phonePlaceholder: string;
    phoneHint: string;
    phoneInvalidMessage: string;
    successTitle: string;
    successDescription: string;
    successEmail: string;
    successPhone: string;
    restrictionTitle: string;
    createAnother: string;
    loginNow: string;
    recaptchaError: string;
  };
  verifyEmail: {
    title: string;
    description: string;
    verifyingTitle: string;
    verifyingDescription: string;
    successTitle: string;
    successDescription: string;
    invalidTitle: string;
    invalidDescription: string;
    idleTitle: string;
    idleDescription: string;
    resend: string;
    resending: string;
    resendSuccessTitle: string;
    resendSuccessDescription: string;
    resendErrorTitle: string;
    alreadyVerifiedTitle: string;
    alreadyVerifiedDescription: string;
    goToLogin: string;
    openSettings: string;
  };
  forgotPassword: {
    title: string;
    description: string;
    emailLabel: string;
    emailPlaceholder: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successDescription: string;
    errorTitle: string;
    validationError: string;
    backToLogin: string;
  };
  resetPassword: {
    title: string;
    description: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    confirmPasswordLabel: string;
    confirmPasswordPlaceholder: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successDescription: string;
    invalidTitle: string;
    invalidDescription: string;
    mismatch: string;
    passwordHint: string;
    backToLogin: string;
  };
  security: {
    pageTitle: string;
    pageDescription: string;
    verificationTitle: string;
    verificationDescription: string;
    emailVerified: string;
    emailPending: string;
    phoneVerified: string;
    phonePending: string;
    resendEmail: string;
    requestOtp: string;
    requestOtpSubmitting: string;
    verifyPhone: string;
    verifyPhoneSubmitting: string;
    phoneCodeLabel: string;
    phoneCodePlaceholder: string;
    phoneNoNumber: string;
    openAccount: string;
    challengeExpires: string;
    challengeActive: string;
    twoFactorTitle: string;
    twoFactorDescription: string;
    twoFactorEnabled: string;
    twoFactorDisabled: string;
    enableTwoFactor: string;
    enrollTwoFactor: string;
    confirmTwoFactor: string;
    confirmTwoFactorSubmitting: string;
    disableTwoFactor: string;
    disableTwoFactorSubmitting: string;
    twoFactorCodeLabel: string;
    twoFactorCodePlaceholder: string;
    secretLabel: string;
    otpAuthUrlLabel: string;
    verifyBeforeTwoFactor: string;
    refreshSession: string;
  };
  restriction: {
    bannerTitle: string;
    bannerDescription: string;
    details: string;
    goToSettings: string;
    modalTitle: string;
    missingVerificationTitle: string;
    blockedActionsTitle: string;
    missingEmail: string;
    missingPhone: string;
    blockedActions: Record<string, string>;
  };
};

const en: AuthFlowMessages = {
  recaptcha: {
    live: "Protected by reCAPTCHA before the request is sent.",
    developmentBypass:
      "Development bypass is active. A placeholder reCAPTCHA token will be sent locally.",
    unavailable:
      "reCAPTCHA is not configured for this environment yet. Requests may fail in production.",
  },
  login: {
    twoFactorTitle: "Complete your two-factor check",
    twoFactorDescription:
      "Your password was accepted. Enter the 6-digit code from your authenticator app to finish logging in.",
    twoFactorCodeLabel: "Authenticator code",
    twoFactorCodePlaceholder: "123456",
    twoFactorSubmit: "Verify and continue",
    twoFactorSubmitting: "Verifying",
    twoFactorBack: "Use a different account",
    twoFactorHelp: "Codes expire quickly. Open your authenticator app and use the latest 6-digit code.",
    recaptchaError: "We could not prepare reCAPTCHA. Please try again.",
  },
  register: {
    phoneLabel: "Phone number",
    phonePlaceholder: "+994123456789",
    phoneHint: "Optional. Use E.164 format if you want phone verification right away.",
    phoneInvalidMessage: "Please enter a valid phone number in E.164 format.",
    successTitle: "Check your inbox to finish setup",
    successDescription:
      "Your account was created. Email verification is still required before restricted actions unlock.",
    successEmail:
      "We sent an email verification link to your address. Open it from the same device if possible.",
    successPhone:
      "A phone verification challenge is ready for this account. Sign in and finish the OTP step from Security Settings.",
    restrictionTitle: "Current access is limited until verification is complete.",
    createAnother: "Create another account",
    loginNow: "Go to login",
    recaptchaError: "We could not prepare reCAPTCHA. Please try again.",
  },
  verifyEmail: {
    title: "Verify your email",
    description:
      "Open the link from your email, or paste the verification token into this screen through the redirect link.",
    verifyingTitle: "Verifying your email",
    verifyingDescription: "We’re checking the verification link now.",
    successTitle: "Email verified",
    successDescription:
      "Your email is confirmed. If phone verification is still pending, you can finish it from Security Settings after login.",
    invalidTitle: "This verification link can’t be used",
    invalidDescription:
      "The link may be invalid, expired, or already used. Request a new verification email and try again.",
    idleTitle: "Verification link required",
    idleDescription:
      "Open the verification email first, or sign in and resend a fresh verification link from this screen.",
    resend: "Resend verification email",
    resending: "Sending",
    resendSuccessTitle: "Verification email sent",
    resendSuccessDescription:
      "A fresh email verification link is on the way.",
    resendErrorTitle: "Could not resend verification email",
    alreadyVerifiedTitle: "Email already verified",
    alreadyVerifiedDescription:
      "This account is already verified, so you can continue normally.",
    goToLogin: "Go to login",
    openSettings: "Open Security Settings",
  },
  forgotPassword: {
    title: "Forgot your password?",
    description:
      "Enter the email for your Reziphay account and we’ll send a reset link if it exists.",
    emailLabel: "Email",
    emailPlaceholder: "m@example.com",
    submit: "Send reset link",
    submitting: "Sending",
    successTitle: "Check your inbox",
    successDescription:
      "If an account matches that email, a password reset link has been sent.",
    errorTitle: "Could not send reset link",
    validationError: "Please enter a valid email address.",
    backToLogin: "Back to login",
  },
  resetPassword: {
    title: "Reset your password",
    description:
      "Choose a new password for your account. Existing sessions will be signed out after the reset succeeds.",
    passwordLabel: "New password",
    passwordPlaceholder: "Create a new password",
    confirmPasswordLabel: "Confirm password",
    confirmPasswordPlaceholder: "Repeat your new password",
    submit: "Reset password",
    submitting: "Resetting",
    successTitle: "Password updated",
    successDescription:
      "Your password has been reset. Sign in again with the new password.",
    invalidTitle: "This reset link can’t be used",
    invalidDescription:
      "The reset token may be invalid, expired, or already used. Request a new password reset link.",
    mismatch: "Passwords must match.",
    passwordHint:
      "Use at least 8 characters with uppercase, lowercase, and a number.",
    backToLogin: "Back to login",
  },
  security: {
    pageTitle: "Security settings",
    pageDescription:
      "Manage verification and two-factor protection for your Reziphay account.",
    verificationTitle: "Verification status",
    verificationDescription:
      "Some actions stay restricted until both email and phone verification are complete.",
    emailVerified: "Email verified",
    emailPending: "Email verification pending",
    phoneVerified: "Phone verified",
    phonePending: "Phone verification pending",
    resendEmail: "Resend email",
    requestOtp: "Send OTP code",
    requestOtpSubmitting: "Sending code",
    verifyPhone: "Verify phone",
    verifyPhoneSubmitting: "Verifying phone",
    phoneCodeLabel: "OTP code",
    phoneCodePlaceholder: "123456",
    phoneNoNumber:
      "Add a phone number from your account profile before requesting phone verification.",
    openAccount: "Open account profile",
    challengeExpires: "Challenge expires",
    challengeActive: "A verification challenge is active for this phone number.",
    twoFactorTitle: "Two-factor authentication",
    twoFactorDescription:
      "Use an authenticator app to add a second step to future logins.",
    twoFactorEnabled: "Two-factor authentication is enabled on this account.",
    twoFactorDisabled: "Two-factor authentication is not enabled yet.",
    enableTwoFactor: "Start setup",
    enrollTwoFactor: "Start setup",
    confirmTwoFactor: "Confirm setup",
    confirmTwoFactorSubmitting: "Confirming",
    disableTwoFactor: "Disable 2FA",
    disableTwoFactorSubmitting: "Disabling",
    twoFactorCodeLabel: "6-digit authenticator code",
    twoFactorCodePlaceholder: "123456",
    secretLabel: "Manual setup key",
    otpAuthUrlLabel: "Authenticator link",
    verifyBeforeTwoFactor:
      "Finish email and phone verification before enabling two-factor authentication.",
    refreshSession: "Refresh session",
  },
  restriction: {
    bannerTitle: "Restricted access is still active",
    bannerDescription:
      "You can stay signed in, but protected actions remain limited until all required verifications are complete.",
    details: "View details",
    goToSettings: "Open security settings",
    modalTitle: "Restricted access details",
    missingVerificationTitle: "Still missing",
    blockedActionsTitle: "Currently blocked actions",
    missingEmail: "Email verification",
    missingPhone: "Phone verification",
    blockedActions: {
      "brand.create": "Create brands",
      "brand.update": "Edit brands",
      "brand.delete": "Delete brands",
      "brand.transfer": "Transfer brands",
      "brand.rate": "Rate brands",
      "branch.manage": "Manage branches",
      "brand-media.upload": "Upload brand media",
      "team.manage": "Manage team members",
    },
  },
};

const az: AuthFlowMessages = {
  recaptcha: {
    live: "Sorğu göndərilməzdən əvvəl reCAPTCHA ilə qorunur.",
    developmentBypass:
      "İnkişaf mühitində bypass aktivdir. Lokal olaraq placeholder reCAPTCHA tokeni göndəriləcək.",
    unavailable:
      "Bu mühit üçün reCAPTCHA hələ qurulmayıb. Production mühitində sorğular uğursuz ola bilər.",
  },
  login: {
    twoFactorTitle: "İki mərhələli yoxlamanı tamamlayın",
    twoFactorDescription:
      "Şifrəniz qəbul edildi. Girişi tamamlamaq üçün authenticator tətbiqinizdəki 6 rəqəmli kodu daxil edin.",
    twoFactorCodeLabel: "Authenticator kodu",
    twoFactorCodePlaceholder: "123456",
    twoFactorSubmit: "Təsdiqlə və davam et",
    twoFactorSubmitting: "Təsdiqlənir",
    twoFactorBack: "Başqa hesab istifadə et",
    twoFactorHelp:
      "Kodlar tez-tez yenilənir. Authenticator tətbiqini açın və ən son 6 rəqəmli kodu istifadə edin.",
    recaptchaError: "reCAPTCHA hazırlanmadı. Yenidən cəhd edin.",
  },
  register: {
    phoneLabel: "Telefon nömrəsi",
    phonePlaceholder: "+994123456789",
    phoneHint:
      "İstəyə bağlıdır. Telefon təsdiqini başlatmaq üçün E.164 formatından istifadə edin.",
    phoneInvalidMessage:
      "Telefon nömrəsini E.164 formatında düzgün daxil edin.",
    successTitle: "Quraşdırmanı tamamlamaq üçün emailinizi yoxlayın",
    successDescription:
      "Hesab yaradıldı. Məhdudiyyətlərin açılması üçün email təsdiqi hələ də tələb olunur.",
    successEmail:
      "Email ünvanınıza təsdiq linki göndərdik. Mümkündürsə eyni cihazdan açın.",
    successPhone:
      "Bu hesab üçün telefon təsdiqi sorğusu hazırdır. Daxil olduqdan sonra Təhlükəsizlik ayarlarında OTP addımını tamamlayın.",
    restrictionTitle:
      "Təsdiqləmə tamamlanana qədər giriş imkanları məhduddur.",
    createAnother: "Başqa hesab yarat",
    loginNow: "Giriş səhifəsinə keç",
    recaptchaError: "reCAPTCHA hazırlanmadı. Yenidən cəhd edin.",
  },
  verifyEmail: {
    title: "Email ünvanını təsdiqlə",
    description:
      "Emaildəki linki açın və ya yönləndirmə linki ilə bu ekrana gələn tokeni istifadə edin.",
    verifyingTitle: "Email təsdiqlənir",
    verifyingDescription: "Təsdiq linki hazırda yoxlanılır.",
    successTitle: "Email təsdiqləndi",
    successDescription:
      "Emailiniz təsdiqləndi. Telefon təsdiqi qalırsa, giriş etdikdən sonra Təhlükəsizlik ayarlarında tamamlaya bilərsiniz.",
    invalidTitle: "Bu təsdiq linkindən istifadə etmək olmur",
    invalidDescription:
      "Link etibarsız, vaxtı keçmiş və ya artıq istifadə edilmiş ola bilər. Yeni təsdiq emaili istəyib yenidən cəhd edin.",
    idleTitle: "Təsdiq linki tələb olunur",
    idleDescription:
      "Əvvəlcə emaildəki təsdiq linkini açın və ya daxil olub bu ekrandan yeni link göndərin.",
    resend: "Təsdiq emailini yenidən göndər",
    resending: "Göndərilir",
    resendSuccessTitle: "Təsdiq emaili göndərildi",
    resendSuccessDescription: "Yeni email təsdiq linki göndərildi.",
    resendErrorTitle: "Təsdiq emaili göndərilə bilmədi",
    alreadyVerifiedTitle: "Email artıq təsdiqlənib",
    alreadyVerifiedDescription:
      "Bu hesab artıq təsdiqlənib və normal davam edə bilərsiniz.",
    goToLogin: "Giriş səhifəsinə keç",
    openSettings: "Təhlükəsizlik ayarlarını aç",
  },
  forgotPassword: {
    title: "Şifrəni unutmusunuz?",
    description:
      "Reziphay hesabınızın emailini daxil edin. Hesab varsa, sizə sıfırlama linki göndəriləcək.",
    emailLabel: "Email",
    emailPlaceholder: "m@example.com",
    submit: "Sıfırlama linki göndər",
    submitting: "Göndərilir",
    successTitle: "Emailinizi yoxlayın",
    successDescription:
      "Bu emailə uyğun hesab varsa, şifrə sıfırlama linki göndərildi.",
    errorTitle: "Sıfırlama linki göndərilmədi",
    validationError: "Düzgün email ünvanı daxil edin.",
    backToLogin: "Girişə qayıt",
  },
  resetPassword: {
    title: "Şifrəni yenilə",
    description:
      "Hesabınız üçün yeni şifrə seçin. Sıfırlama uğurlu olduqdan sonra mövcud sessiyalar bağlanacaq.",
    passwordLabel: "Yeni şifrə",
    passwordPlaceholder: "Yeni şifrə yaradın",
    confirmPasswordLabel: "Şifrəni təsdiqlə",
    confirmPasswordPlaceholder: "Yeni şifrəni təkrarlayın",
    submit: "Şifrəni yenilə",
    submitting: "Yenilənir",
    successTitle: "Şifrə yeniləndi",
    successDescription:
      "Şifrəniz yeniləndi. Yeni şifrə ilə yenidən daxil olun.",
    invalidTitle: "Bu sıfırlama linkindən istifadə etmək olmur",
    invalidDescription:
      "Token etibarsız, vaxtı keçmiş və ya artıq istifadə edilmiş ola bilər. Yeni sıfırlama linki istəyin.",
    mismatch: "Şifrələr eyni olmalıdır.",
    passwordHint:
      "Ən azı 8 simvol, böyük hərf, kiçik hərf və rəqəm istifadə edin.",
    backToLogin: "Girişə qayıt",
  },
  security: {
    pageTitle: "Təhlükəsizlik ayarları",
    pageDescription:
      "Reziphay hesabınız üçün təsdiq və iki mərhələli qorumanı idarə edin.",
    verificationTitle: "Təsdiq statusu",
    verificationDescription:
      "Email və telefon təsdiqi tamamlanana qədər bəzi əməliyyatlar məhdud qalır.",
    emailVerified: "Email təsdiqlənib",
    emailPending: "Email təsdiqi gözləyir",
    phoneVerified: "Telefon təsdiqlənib",
    phonePending: "Telefon təsdiqi gözləyir",
    resendEmail: "Emaili yenidən göndər",
    requestOtp: "OTP kodu göndər",
    requestOtpSubmitting: "Kod göndərilir",
    verifyPhone: "Telefonu təsdiqlə",
    verifyPhoneSubmitting: "Telefon təsdiqlənir",
    phoneCodeLabel: "OTP kodu",
    phoneCodePlaceholder: "123456",
    phoneNoNumber:
      "Telefon təsdiqi istəməzdən əvvəl hesab profilinizə nömrə əlavə edin.",
    openAccount: "Hesab profilini aç",
    challengeExpires: "Sorğunun bitmə vaxtı",
    challengeActive: "Bu telefon nömrəsi üçün aktiv təsdiq sorğusu var.",
    twoFactorTitle: "İki mərhələli identifikasiya",
    twoFactorDescription:
      "Gələcək girişlərə əlavə təhlükəsizlik addımı əlavə etmək üçün authenticator tətbiqindən istifadə edin.",
    twoFactorEnabled: "Bu hesabda iki mərhələli identifikasiya aktivdir.",
    twoFactorDisabled: "İki mərhələli identifikasiya hələ aktiv deyil.",
    enableTwoFactor: "Quraşdırmanı başlat",
    enrollTwoFactor: "Quraşdırmanı başlat",
    confirmTwoFactor: "Quraşdırmanı təsdiqlə",
    confirmTwoFactorSubmitting: "Təsdiqlənir",
    disableTwoFactor: "2FA-nı söndür",
    disableTwoFactorSubmitting: "Söndürülür",
    twoFactorCodeLabel: "6 rəqəmli authenticator kodu",
    twoFactorCodePlaceholder: "123456",
    secretLabel: "Manual quraşdırma açarı",
    otpAuthUrlLabel: "Authenticator linki",
    verifyBeforeTwoFactor:
      "İki mərhələli identifikasiyanı aktiv etməzdən əvvəl email və telefon təsdiqini tamamlayın.",
    refreshSession: "Sessiyanı yenilə",
  },
  restriction: {
    bannerTitle: "Məhdud giriş hələ aktivdir",
    bannerDescription:
      "Hesab açıq qala bilər, amma bütün tələb olunan təsdiqlər tamamlanana qədər qorunan əməliyyatlar məhdud qalacaq.",
    details: "Detallara bax",
    goToSettings: "Təhlükəsizlik ayarlarını aç",
    modalTitle: "Məhdud giriş detalları",
    missingVerificationTitle: "Çatışmayanlar",
    blockedActionsTitle: "Hazırda bloklanan əməliyyatlar",
    missingEmail: "Email təsdiqi",
    missingPhone: "Telefon təsdiqi",
    blockedActions: {
      "brand.create": "Brend yaratmaq",
      "brand.update": "Brendi redaktə etmək",
      "brand.delete": "Brendi silmək",
      "brand.transfer": "Brendi köçürmək",
      "brand.rate": "Brendləri qiymətləndirmək",
      "branch.manage": "Filialları idarə etmək",
      "brand-media.upload": "Brend media faylları yükləmək",
      "team.manage": "Komanda üzvlərini idarə etmək",
    },
  },
};

const ru: AuthFlowMessages = {
  recaptcha: {
    live: "Перед отправкой запрос защищается reCAPTCHA.",
    developmentBypass:
      "В режиме разработки включен bypass. Локально будет отправлен placeholder-токен reCAPTCHA.",
    unavailable:
      "reCAPTCHA еще не настроена для этой среды. В production запросы могут завершаться ошибкой.",
  },
  login: {
    twoFactorTitle: "Завершите двухфакторную проверку",
    twoFactorDescription:
      "Пароль принят. Введите 6-значный код из приложения-аутентификатора, чтобы завершить вход.",
    twoFactorCodeLabel: "Код аутентификатора",
    twoFactorCodePlaceholder: "123456",
    twoFactorSubmit: "Подтвердить и продолжить",
    twoFactorSubmitting: "Проверка",
    twoFactorBack: "Использовать другой аккаунт",
    twoFactorHelp:
      "Коды быстро обновляются. Откройте приложение-аутентификатор и используйте актуальный 6-значный код.",
    recaptchaError: "Не удалось подготовить reCAPTCHA. Попробуйте еще раз.",
  },
  register: {
    phoneLabel: "Номер телефона",
    phonePlaceholder: "+994123456789",
    phoneHint:
      "Необязательно. Используйте формат E.164, если хотите сразу подготовить проверку телефона.",
    phoneInvalidMessage:
      "Введите корректный номер телефона в формате E.164.",
    successTitle: "Проверьте почту, чтобы завершить настройку",
    successDescription:
      "Аккаунт создан. Подтверждение email все еще требуется, чтобы снять ограничения.",
    successEmail:
      "Мы отправили ссылку для подтверждения email на ваш адрес. По возможности откройте ее с того же устройства.",
    successPhone:
      "Для этого аккаунта уже подготовлен запрос на подтверждение телефона. Войдите и завершите OTP-шаг в настройках безопасности.",
    restrictionTitle:
      "Пока проверка не завершена, доступ к части возможностей ограничен.",
    createAnother: "Создать еще один аккаунт",
    loginNow: "Перейти ко входу",
    recaptchaError: "Не удалось подготовить reCAPTCHA. Попробуйте еще раз.",
  },
  verifyEmail: {
    title: "Подтвердите email",
    description:
      "Откройте ссылку из письма или используйте токен, переданный через ссылку-переход на этот экран.",
    verifyingTitle: "Подтверждаем email",
    verifyingDescription: "Сейчас мы проверяем ссылку подтверждения.",
    successTitle: "Email подтвержден",
    successDescription:
      "Ваш email подтвержден. Если подтверждение телефона еще не завершено, вы сможете сделать это после входа в настройках безопасности.",
    invalidTitle: "Эту ссылку подтверждения нельзя использовать",
    invalidDescription:
      "Ссылка может быть неверной, просроченной или уже использованной. Запросите новое письмо и попробуйте снова.",
    idleTitle: "Нужна ссылка подтверждения",
    idleDescription:
      "Сначала откройте письмо с подтверждением или войдите в аккаунт и отправьте новую ссылку с этого экрана.",
    resend: "Отправить письмо еще раз",
    resending: "Отправка",
    resendSuccessTitle: "Письмо отправлено",
    resendSuccessDescription:
      "Новая ссылка для подтверждения email уже в пути.",
    resendErrorTitle: "Не удалось отправить письмо",
    alreadyVerifiedTitle: "Email уже подтвержден",
    alreadyVerifiedDescription:
      "Этот аккаунт уже подтвержден, можно продолжать работу.",
    goToLogin: "Перейти ко входу",
    openSettings: "Открыть настройки безопасности",
  },
  forgotPassword: {
    title: "Забыли пароль?",
    description:
      "Введите email вашего аккаунта Reziphay, и мы отправим ссылку для сброса, если такой аккаунт существует.",
    emailLabel: "Email",
    emailPlaceholder: "m@example.com",
    submit: "Отправить ссылку",
    submitting: "Отправка",
    successTitle: "Проверьте почту",
    successDescription:
      "Если аккаунт с таким email существует, ссылка для сброса уже отправлена.",
    errorTitle: "Не удалось отправить ссылку",
    validationError: "Введите корректный email.",
    backToLogin: "Вернуться ко входу",
  },
  resetPassword: {
    title: "Сброс пароля",
    description:
      "Выберите новый пароль для аккаунта. После успешного сброса все активные сессии будут завершены.",
    passwordLabel: "Новый пароль",
    passwordPlaceholder: "Создайте новый пароль",
    confirmPasswordLabel: "Подтвердите пароль",
    confirmPasswordPlaceholder: "Повторите новый пароль",
    submit: "Сбросить пароль",
    submitting: "Сброс",
    successTitle: "Пароль обновлен",
    successDescription:
      "Пароль был сброшен. Войдите снова уже с новым паролем.",
    invalidTitle: "Эту ссылку сброса нельзя использовать",
    invalidDescription:
      "Токен может быть неверным, просроченным или уже использованным. Запросите новую ссылку для сброса пароля.",
    mismatch: "Пароли должны совпадать.",
    passwordHint:
      "Минимум 8 символов, включая заглавную, строчную букву и цифру.",
    backToLogin: "Вернуться ко входу",
  },
  security: {
    pageTitle: "Настройки безопасности",
    pageDescription:
      "Управляйте подтверждением и двухфакторной защитой вашего аккаунта Reziphay.",
    verificationTitle: "Статус подтверждения",
    verificationDescription:
      "Некоторые действия останутся ограниченными, пока не будут подтверждены и email, и телефон.",
    emailVerified: "Email подтвержден",
    emailPending: "Подтверждение email ожидается",
    phoneVerified: "Телефон подтвержден",
    phonePending: "Подтверждение телефона ожидается",
    resendEmail: "Отправить письмо еще раз",
    requestOtp: "Отправить OTP-код",
    requestOtpSubmitting: "Отправка кода",
    verifyPhone: "Подтвердить телефон",
    verifyPhoneSubmitting: "Подтверждение телефона",
    phoneCodeLabel: "OTP-код",
    phoneCodePlaceholder: "123456",
    phoneNoNumber:
      "Сначала добавьте номер телефона в профиле, затем запрашивайте подтверждение телефона.",
    openAccount: "Открыть профиль",
    challengeExpires: "Срок действия запроса",
    challengeActive: "Для этого номера телефона уже активен запрос на подтверждение.",
    twoFactorTitle: "Двухфакторная аутентификация",
    twoFactorDescription:
      "Используйте приложение-аутентификатор, чтобы добавить второй шаг в будущие входы.",
    twoFactorEnabled: "Двухфакторная аутентификация включена для этого аккаунта.",
    twoFactorDisabled: "Двухфакторная аутентификация пока не включена.",
    enableTwoFactor: "Начать настройку",
    enrollTwoFactor: "Начать настройку",
    confirmTwoFactor: "Подтвердить настройку",
    confirmTwoFactorSubmitting: "Подтверждение",
    disableTwoFactor: "Отключить 2FA",
    disableTwoFactorSubmitting: "Отключение",
    twoFactorCodeLabel: "6-значный код аутентификатора",
    twoFactorCodePlaceholder: "123456",
    secretLabel: "Ключ для ручной настройки",
    otpAuthUrlLabel: "Ссылка аутентификатора",
    verifyBeforeTwoFactor:
      "Завершите подтверждение email и телефона перед включением двухфакторной аутентификации.",
    refreshSession: "Обновить сессию",
  },
  restriction: {
    bannerTitle: "Ограниченный доступ все еще активен",
    bannerDescription:
      "Вы можете оставаться в системе, но защищенные действия останутся ограниченными, пока не завершены все обязательные подтверждения.",
    details: "Показать детали",
    goToSettings: "Открыть настройки безопасности",
    modalTitle: "Детали ограниченного доступа",
    missingVerificationTitle: "Еще не завершено",
    blockedActionsTitle: "Сейчас заблокировано",
    missingEmail: "Подтверждение email",
    missingPhone: "Подтверждение телефона",
    blockedActions: {
      "brand.create": "Создание брендов",
      "brand.update": "Редактирование брендов",
      "brand.delete": "Удаление брендов",
      "brand.transfer": "Передача брендов",
      "brand.rate": "Оценка брендов",
      "branch.manage": "Управление филиалами",
      "brand-media.upload": "Загрузка бренд-медиа",
      "team.manage": "Управление участниками команды",
    },
  },
};

const localizedMessages: Partial<Record<Locale, AuthFlowMessages>> = {
  az,
  en,
  ru,
};

export function getAuthFlowMessages(locale: Locale) {
  return localizedMessages[locale] ?? en;
}
