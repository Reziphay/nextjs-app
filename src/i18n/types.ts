export type Messages = {
  metadata: {
    title: string;
    description: string;
  };
  languageSwitcherAriaLabel: string;
  navigationAriaLabel: string;
  navigation: {
    home: string;
    aboutUs: string;
    questions: string;
    contactUs: string;
  };
  comingSoon: {
    badge: string;
    description: string;
  };
  auth: {
    login: {
      title: string;
      description: string;
      emailLabel: string;
      emailPlaceholder: string;
      passwordLabel: string;
      forgotPassword: string;
      submit: string;
      continueWithGoogle: string;
      noAccount: string;
      signUp: string;
    };
    register: {
      title: string;
      description: string;
      firstNameLabel: string;
      firstNamePlaceholder: string;
      lastNameLabel: string;
      lastNamePlaceholder: string;
      birthdayLabel: string;
      countryLabel: string;
      countryPlaceholder: string;
      noCountryResults: string;
      countryPrefixLabel: string;
      countryPrefixPlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      passwordLabel: string;
      passwordPlaceholder: string;
      passwordHint: string;
      typeLabel: string;
      typePlaceholder: string;
      typeDescription: string;
      typeUso: string;
      typeUsoDescription: string;
      typeUcr: string;
      typeUcrDescription: string;
      noTypeResults: string;
      submit: string;
      submitting: string;
      haveAccount: string;
      signIn: string;
      successTitle: string;
      successDescription: string;
      errorTitle: string;
      errorDescription: string;
      configurationErrorDescription: string;
      networkErrorDescription: string;
      badRequestDescription: string;
      unauthorizedDescription: string;
      forbiddenDescription: string;
      notFoundDescription: string;
      conflictDescription: string;
      unprocessableEntityDescription: string;
      rateLimitedDescription: string;
      serverErrorDescription: string;
      validationErrorDescription: string;
      requiredMessage: string;
      birthdayRequiredMessage: string;
      emailInvalidMessage: string;
      passwordInvalidMessage: string;
      countryPrefixInvalidMessage: string;
      typeRequiredMessage: string;
    };
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
  };
  api: {
    badge: string;
    title: string;
    description: string;
    missingBaseUrl: string;
  };
  example: {
    badge: string;
    title: string;
    description: string;
  };
};
