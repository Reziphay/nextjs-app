export type Messages = {
  metadata: {
    title: string;
    description: string;
  };
  languageSwitcherAriaLabel: string;
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
