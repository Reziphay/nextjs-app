import type { Messages } from "../types";
import { enMessages } from "./en";

export const deMessages: Messages = {
  ...enMessages,
  metadata: {
    title: "Reziphay Next App",
    description:
      "Ein mehrsprachiges Next.js-Starterprojekt mit Unterstützung für 18 Sprachen.",
  },
  languageSwitcherAriaLabel: "Sprachauswahl",
  languageSwitcherDisplayLabel: "Anzeigesprache",
  navigationAriaLabel: "Hauptnavigation",
  navigation: {
    home: "Startseite",
    aboutUs: "Über uns",
    questions: "Fragen",
    contactUs: "Kontakt",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
  },
  comingSoon: {
    badge: "Demnächst",
    description: "Diese Seite wird noch vorbereitet.",
  },
  auth: {
    shell: {
      badge: "Reziphay Access",
      title: "Verwalten Sie Ihr Reziphay-Konto von überall",
      description:
        "Bringen Sie Serviceinhaber- und Kundenflüsse in einer sauberen und sicheren Auth-Erfahrung zusammen.",
      featureOneTitle: "Gemeinsame Auth-Erfahrung",
      featureOneDescription:
        "Anmeldung, Registrierung und zukünftige Auth-Seiten befinden sich in einer wiederverwendbaren Hülle.",
      featureTwoTitle: "Rollenbasiertes Onboarding",
      featureTwoDescription:
        "Die Wege für Serviceinhaber und Kunden bleiben klar und getrennt, ohne zusätzliche Reibung.",
      featureThreeTitle: "Schnell und responsiv",
      featureThreeDescription:
        "Das Layout hält den Fokus des Formulars auf Desktop und Mobilgeräten stabil.",
    },
    login: {
      title: "Melden Sie sich in Ihrem Konto an",
      description:
        "Geben Sie unten Ihre E-Mail-Adresse ein, um sich anzumelden",
      emailLabel: "E-Mail",
      emailPlaceholder: "m@example.com",
      passwordLabel: "Passwort",
      passwordPlaceholder: "Geben Sie Ihr Passwort ein",
      forgotPassword: "Passwort vergessen?",
      submit: "Anmelden",
      submitting: "Anmeldung läuft",
      continueWithGoogle: "Mit Google anmelden",
      noAccount: "Sie haben noch kein Konto?",
      signUp: "Registrieren",
      errorTitle: "Anmeldung fehlgeschlagen",
      errorDescription:
        "Beim Anmelden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
      configurationErrorDescription:
        "Der Anmeldedienst ist noch nicht konfiguriert. Bitte prüfen Sie die API-Verbindung.",
      networkErrorDescription:
        "Verbindung zum Server konnte nicht hergestellt werden. Bitte versuchen Sie es erneut.",
      maintenanceDescription:
        "Das System ist vorübergehend nicht verfügbar. Bitte versuchen Sie es in Kürze erneut.",
      badRequestDescription: "Die gesendeten Daten wurden nicht akzeptiert.",
      unauthorizedDescription: "Ungültige E-Mail oder ungültiges Passwort.",
      forbiddenDescription:
        "Sie haben keine Berechtigung, diese Aktion auszuführen.",
      notFoundDescription: "Der Anmeldedienst konnte nicht gefunden werden.",
      rateLimitedDescription:
        "Zu viele Versuche. Bitte versuchen Sie es später erneut.",
      serverErrorDescription:
        "Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es in einem Moment erneut.",
      validationErrorDescription:
        "Bitte korrigieren Sie die Formularfehler, bevor Sie fortfahren.",
      requiredMessage: "Dieses Feld ist erforderlich.",
      emailInvalidMessage:
        "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      passwordRequiredMessage: "Bitte geben Sie Ihr Passwort ein.",
      showPasswordLabel: "Passwort anzeigen",
      hidePasswordLabel: "Passwort ausblenden",
    },
    register: {
      title: "Erstellen Sie Ihr Konto",
      description:
        "Geben Sie unten Ihre Daten ein, um ein neues Konto zu registrieren",
      firstNameLabel: "Vorname",
      firstNamePlaceholder: "John",
      lastNameLabel: "Nachname",
      lastNamePlaceholder: "Doe",
      birthdayLabel: "Geburtsdatum",
      countryLabel: "Land",
      countryPlaceholder: "Aserbaidschan",
      noCountryResults: "Kein passendes Land gefunden.",
      countryPrefixLabel: "Ländervorwahl",
      countryPrefixPlaceholder: "+994",
      emailLabel: "E-Mail",
      emailPlaceholder: "m@example.com",
      passwordLabel: "Passwort",
      passwordPlaceholder: "Erstellen Sie ein neues Passwort",
      passwordHint: "Verwenden Sie mindestens 8 Zeichen.",
      typeLabel: "Benutzertyp",
      typePlaceholder: "Wählen Sie einen Benutzertyp",
      typeDescription:
        "Hier können sich nur Konten für Serviceinhaber und Kunden registrieren.",
      typeUso: "Serviceinhaber",
      typeUsoDescription:
        "Ein Konto für die Person oder das Team, das den Service verwaltet.",
      typeUcr: "Kunde",
      typeUcrDescription:
        "Ein Konto für einen Kunden, der den Service nutzt.",
      noTypeResults: "Kein passender Benutzertyp gefunden.",
      submit: "Konto erstellen",
      submitting: "Wird gesendet",
      termsAgreement:
        "Durch das Erstellen eines Kontos stimmen Sie den Geschäftsbedingungen zu.",
      successTitle: "Registrierungsanfrage gesendet",
      successDescription:
        "Sie können sich anmelden, sobald Ihr Konto erstellt wurde.",
      errorTitle: "Registrierung fehlgeschlagen",
      errorDescription:
        "Bei der Registrierung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
      configurationErrorDescription:
        "Der Registrierungsdienst ist noch nicht konfiguriert. Bitte prüfen Sie die API-Verbindung.",
      networkErrorDescription:
        "Verbindung zum Server konnte nicht hergestellt werden. Bitte versuchen Sie es erneut.",
      maintenanceDescription:
        "Das System ist vorübergehend nicht verfügbar. Bitte versuchen Sie es in Kürze erneut.",
      badRequestDescription: "Die gesendeten Daten wurden nicht akzeptiert.",
      unauthorizedDescription: "Diese Anfrage ist nicht autorisiert.",
      forbiddenDescription:
        "Sie haben keine Berechtigung, diese Aktion auszuführen.",
      notFoundDescription: "Der Registrierungsdienst konnte nicht gefunden werden.",
      conflictDescription:
        "Es existiert bereits ein Konto mit dieser E-Mail-Adresse.",
      unprocessableEntityDescription:
        "Die gesendeten Daten haben die Validierung nicht bestanden.",
      rateLimitedDescription:
        "Zu viele Versuche. Bitte versuchen Sie es später erneut.",
      serverErrorDescription:
        "Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es in einem Moment erneut.",
      validationErrorDescription:
        "Bitte korrigieren Sie die Formularfehler, bevor Sie fortfahren.",
      requiredMessage: "Dieses Feld ist erforderlich.",
      firstNameInvalidMessage:
        "Der Vorname muss mindestens 2 Zeichen lang sein.",
      lastNameInvalidMessage:
        "Der Nachname muss mindestens 2 Zeichen lang sein.",
      birthdayRequiredMessage:
        "Bitte geben Sie Ihr Geburtsdatum ein.",
      birthdayAgeMessage:
        "Sie müssen mindestens 18 Jahre alt sein, um sich zu registrieren.",
      emailInvalidMessage:
        "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      passwordInvalidMessage:
        "Das Passwort muss mindestens 8 Zeichen lang sein und Großbuchstaben, Kleinbuchstaben sowie eine Zahl enthalten.",
      typeRequiredMessage:
        "Bitte wählen Sie einen Benutzertyp aus.",
      showPasswordLabel: "Passwort anzeigen",
      hidePasswordLabel: "Passwort ausblenden",
    },
  },
  backendErrors: {
    ...enMessages.backendErrors,
    "auth.invalid_credentials": "Ungültige E-Mail oder ungültiges Passwort.",
    "errors.validation_error":
      "Die gesendeten Daten haben die Validierung nicht bestanden.",
    "errors.missing_token": "Authentifizierungs-Token fehlt.",
    "errors.invalid_token": "Authentifizierungs-Token ist ungültig.",
    "errors.forbidden":
      "Sie haben keine Berechtigung, diese Aktion auszuführen.",
    "user.not_found": "Benutzer wurde nicht gefunden.",
    "user.email_change_not_allowed":
      "Diese E-Mail-Adresse kann nicht mehr geändert werden.",
    "user.phone_change_not_allowed":
      "Diese Telefonnummer kann nicht mehr geändert werden.",
    "user.email_already_in_use":
      "Diese E-Mail-Adresse wird bereits verwendet.",
    "user.phone_already_in_use":
      "Diese Telefonnummer wird bereits verwendet.",
    "media.invalid_file_type":
      "Der ausgewählte Dateityp wird nicht unterstützt.",
    "media.file_too_large":
      "Die ausgewählte Datei ist zu groß.",
    "media.invalid_logo_ratio":
      "Das Logo-Bild muss das erforderliche Seitenverhältnis haben.",
    "media.invalid_gallery_ratio":
      "Das Galerie-Bild muss das erforderliche Seitenverhältnis haben.",
    "brand.not_found": "Marke wurde nicht gefunden.",
    "brand.transfer_not_found":
      "Markenübertragung wurde nicht gefunden.",
    "brand.transfer_not_pending":
      "Diese Markenübertragung ist nicht mehr ausstehend.",
    "moderation.brand_not_found": "Marke nicht gefunden.",
    "moderation.service_not_found": "Dienst nicht gefunden.",
    "moderation.not_pending": "Diese Einreichung ist nicht mehr ausstehend.",
  },
  hero: {
    eyebrow: "Mehrsprachiger Next.js-Starter",
    title: "Reziphay Next App",
    description:
      "Das Projekt unterstützt jetzt 18 Sprachen.",
  },
  api: {
    badge: "API",
    title: "Axios ist einsatzbereit",
    description:
      "Ein wiederverwendbarer `api`-Client ist mit `API_URL` konfiguriert. Derselbe Wert wird über `NEXT_PUBLIC_API_URL` im Browser bereitgestellt.",
    missingBaseUrl: "API_URL fehlt",
  },
  example: {
    badge: "Verwendung",
    title: "Request-Helper enthalten",
    description:
      "Sie können die gemeinsame `api`-Instanz direkt verwenden oder den generischen `apiRequest`-Helper für typisierte Requests aufrufen.",
  },
  dashboard: {
    ...enMessages.dashboard,
    home: "Startseite",
    search: "Suche",
    profile: "Profil",
    account: "Mein Konto",
    settings: "Einstellungen",
    notifications: "Benachrichtigungen",
    services: "Dienste",
    brands: "Marken",
    dashboardPage: "Dashboard",
    reservations: "Reservierungen",
    favorites: "Favoriten",
    moderation: "Moderation",
    signOut: "Abmelden",
    signOutConfirmTitle: "Möchten Sie sich wirklich abmelden?",
    signOutConfirmDescription:
      "Dadurch wird Ihre aktuelle Sitzung beendet und Sie werden zur Anmeldeseite zurückgeleitet.",
    cancel: "Abbrechen",
    confirmSignOut: "Abmelden",
    greeting: "Willkommen",
    platform: "Plattform",
    support: "Support",
    feedback: "Feedback",
    typeUso: "Serviceinhaber",
    typeUcr: "Kunde",
    typeAdmin: "Administrator",
  },
  brands: {
    ...enMessages.brands,
    pageTitle: "Marken",
    pageDescription: "Verwalten Sie Ihre Marken oder entdecken Sie verfügbare.",
    createBrand: "Marke erstellen",
    myBrands: "Meine Marken",
    noBrandsTitle: "Noch keine Marken",
    noBrandsDescription:
      "Sie haben noch keine Marke erstellt. Beginnen Sie mit Ihrer ersten Marke.",
    editBrand: "Marke bearbeiten",
    detailTitle: "Markendetails",
    topRated: "Am besten bewertet",
    mostRecent: "Neueste",
    explore: "Entdecken",
    statusPending: "Ausstehend",
    statusActive: "Aktiv",
    statusRejected: "Abgelehnt",
    statusClosed: "Geschlossen",
    formCreateTitle: "Marke erstellen",
    formEditTitle: "Marke bearbeiten",
    formSaveChanges: "Änderungen speichern",
    basicInfoSection: "Grundinformationen",
    fieldName: "Markenname",
    fieldNamePlaceholder: "z. B. Aria Atelier",
    fieldDescription: "Beschreibung",
    fieldDescriptionPlaceholder:
      "Beschreiben Sie Ihre Marke, ihren Stil und was sie einzigartig macht...",
    fieldCategories: "Kategorien",
    fieldCategoriesPlaceholder: "Kategorien auswählen...",
    noCategoriesFound: "Keine Kategorien gefunden.",
    fieldLogo: "Markenlogo",
    fieldLogoHint:
      "Laden Sie ein quadratisches Logo hoch (1:1-Verhältnis empfohlen).",
    fieldLogoUpload: "Logo hochladen",
    fieldLogoFormatHint: "PNG, JPG, WEBP · 1:1",
    fieldGallery: "Galerie",
    fieldGalleryHint:
      "Fügen Sie mehrere Präsentationsbilder hinzu (16:9-Verhältnis empfohlen).",
    fieldGalleryUpload: "Galeriebilder hinzufügen",
    fieldGalleryFormatHint: "PNG, JPG, WEBP · 16:9",
    loginRequired: "Sie müssen angemeldet sein.",
    errorGeneric: "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
    branchesTitle: "Filialen",
    addBranch: "Filiale hinzufügen",
    noBranches: "Noch keine Filialen hinzugefügt.",
    branchModalTitle: "Filiale hinzufügen",
    branchModalDescription:
      "Geben Sie die Details des Filialstandorts ein.",
    branchFieldName: "Filialname",
    branchFieldNamePlaceholder: "z. B. Hauptbüro",
    branchFieldDescription: "Beschreibung",
    branchFieldDescriptionPlaceholder: "Optionale Beschreibung",
    branchFieldAddress1: "Adresszeile 1",
    branchFieldAddress1Placeholder: "Straße, Hausnummer",
    branchFieldAddress2: "Adresszeile 2",
    branchFieldAddress2Placeholder:
      "Etage, Wohnung usw. (optional)",
    branchFieldPhone: "Telefon",
    branchFieldPhonePlaceholder: "+994 50 000 00 00",
    branchFieldEmail: "E-Mail",
    branchFieldEmailPlaceholder: "filiale@example.com",
    branchField247: "24/7 geöffnet",
    branchFieldOpening: "Öffnungszeit",
    branchFieldClosing: "Schließzeit",
    branchFieldBreaks: "Pausen",
    branchAddBreak: "Pause hinzufügen",
    branchRemoveBreak: "Entfernen",
    branchSave: "Filiale speichern",
    branchCancel: "Abbrechen",
    cancelForm: "Abbrechen",
    verificationRequiredTitle: "Verifizierung erforderlich",
    verificationRequiredDescription:
      "Sie müssen Ihre E-Mail-Adresse oder Telefonnummer verifizieren, bevor Sie eine Marke erstellen.",
    transferBrand: "Marke übertragen",
    transferModalTitle: "Markenbesitz übertragen",
    transferModalDescription:
      "Suchen Sie nach dem Benutzer, an den Sie diese Marke übertragen möchten.",
    transferSearchPlaceholder: "Nach Name, E-Mail oder Telefon suchen",
    transferConfirm: "Übertragen",
    transferCancel: "Abbrechen",
    transferSuccessDescription:
      "Der Benutzer erhält eine Benachrichtigung und muss die Übertragung akzeptieren.",
    transferConfirmStepTitle: "Übertragung bestätigen",
    transferConfirmStepDescription:
      "Prüfen Sie die folgenden Details und bestätigen Sie, dass Sie fortfahren möchten.",
    transferTargetLabel: "Übertragen an",
    transferChangeTarget: "Ändern",
    transferBrandLabel: "Marke",
    transferConfirmCheckbox:
      "Ich verstehe, dass die Übertragung dieser Marke nicht rückgängig gemacht werden kann, und möchte fortfahren.",
    transferSearchHint:
      "Geben Sie mindestens 2 Zeichen ein, um nach Name, E-Mail oder Telefon zu suchen.",
    transferNoResults: "Keine passenden Benutzer gefunden.",
    incomingTransfersTitle: "Eingehende Markenübertragungen",
    incomingTransfersDescription:
      "Prüfen Sie die Marken, die andere Serviceinhaber an Sie übertragen möchten.",
    outgoingTransfersTitle: "Ausstehende ausgehende Übertragungen",
    outgoingTransfersDescription:
      "Verfolgen Sie gesendete Übertragungsanfragen und stornieren Sie sie, solange sie noch ausstehen.",
    noIncomingTransfers:
      "Derzeit gibt es keine eingehenden Markenübertragungen.",
    noOutgoingTransfers:
      "Es sind keine ausgehenden Übertragungen ausstehend.",
    transferFrom: "Von",
    transferTo: "An",
    transferRequestedAt: "Angefordert",
    acceptTransfer: "Akzeptieren",
    rejectTransfer: "Ablehnen",
    cancelTransfer: "Anfrage stornieren",
    transferAcceptedDescription: "Die Markenübertragung wurde akzeptiert.",
    transferCancelledDescription:
      "Die Anfrage zur Markenübertragung wurde storniert.",
    transferStatusPending: "Ausstehend",
    transferStatusAccepted: "Akzeptiert",
    transferStatusRejected: "Abgelehnt",
    notificationsSection: "Benachrichtigungen",
    notificationsEmpty: "Noch keine Benachrichtigungen.",
    deleteBrand: "Marke löschen",
    deleteModalTitle: "Marke löschen?",
    deleteModalDescription:
      "Diese Aktion kann nicht rückgängig gemacht werden. Die Marke wird dauerhaft gelöscht.",
    deleteWithServices: "Auch alle Dienste löschen",
    deleteServicesTransferToMe:
      "Dienste auf mein Konto übertragen",
    deleteServicesTransferToOther:
      "Dienste auf einen anderen Benutzer übertragen",
    deleteServiceTransferNote:
      "Optionen zur Dienstübertragung sind noch nicht verfügbar. Diese Funktion wird aktiviert, sobald das Dienste-Modul startet. Um diese Marke jetzt zu löschen, aktivieren Sie oben 'Auch alle Dienste löschen'.",
    deleteConfirm: "Löschen",
    deleteCancel: "Abbrechen",
    createSuccessDescription:
      "Ihre Marke wurde zur Prüfung eingereicht und wartet auf Genehmigung.",
    updateSuccessDescription:
      "Ihre Markeninformationen wurden erfolgreich gespeichert.",
    errorDescription:
      "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
    forbiddenDescription:
      "Sie haben keine Berechtigung, diese Aktion auszuführen.",
    notFoundDescription: "Die Marke konnte nicht gefunden werden.",
    logoRatioError:
      "Das Logo muss ein quadratisches 1:1-Verhältnis haben.",
    galleryRatioError:
      "Galeriebilder müssen ein 16:9-Verhältnis haben.",
    rateBrand: "Diese Marke bewerten",
    yourRating: "Ihre Bewertung",
    ratingSavedDescription: "Ihre Bewertung wurde gespeichert.",
    brandCardBrandLabel: "Marke",
    brandCardCategoryLabel: "Kategorie",
    brandCardDescriptionLabel: "Beschreibung",
    brandCardOwnerLabel: "Markeninhaber",
    brandCardReviewsSuffix: "Bewertungen",
    requiredMessage: "Dieses Feld ist erforderlich.",
    nameRequiredMessage: "Der Markenname ist erforderlich.",
    openingRequiredMessage: "Die Öffnungszeit ist erforderlich.",
    closingRequiredMessage: "Die Schließzeit ist erforderlich.",
    gallery: "Galerie",
    discoverBrands: "Marken entdecken",
    noSectionBrands:
      "In diesem Bereich gibt es noch keine Marken.",
    branchEditModalTitle: "Filiale bearbeiten",
    detailDefaultDescription:
      "Dieses Markenprofil vereint Kerninformationen, Medien und das Filialnetzwerk.",
    detailFilterAllBranches: "Alle Filialen",
    detailFilterOpen247: "Nur 24/7",
    detailFilterWithContact: "Mit Kontakt",
    detailSearchPlaceholder:
      "Filiale, Adresse, Telefon oder E-Mail suchen",
    detailTableBranch: "Filiale",
    detailTableAddress: "Adresse",
    detailTableAvailability: "Verfügbarkeit",
    detailTableContact: "Kontakt",
    detailBranchOpenDetails: "Details anzeigen",
    detailBranchModalTitle: "Filialdetails",
    detailBranchModalDescription:
      "Alle Filialinformationen werden hier angezeigt.",
    detailNoMatchingBranches:
      "Keine Filiale passt zu den aktuellen Filtern.",
    detailMetricCategories: "Kategorien",
    detailMetricBranches: "Filialen",
    detailMetricGallery: "Galerieelemente",
    detailMetricTeamMembers: "Teammitglieder",
    detailMetricRating: "Bewertung",
    detailNoGalleryMedia:
      "Für diese Marke wurden noch keine Galeriebilder hinzugefügt.",
    detailGalleryPrevious: "Vorheriges Bild",
    detailGalleryNext: "Nächstes Bild",
    detailGalleryAutoplay: "Autoplay aktiviert",
    detailGalleryPaused: "Autoplay pausiert",
  },
  profile: {
    ...enMessages.profile,
    title: "Mein Profil",
    description: "Verwalten Sie hier Ihre Kontoinformationen",
    editDescription:
      "Aktualisieren Sie die Felder, die Sie für Ihr Konto aktuell halten möchten.",
    personalInfo: "Persönliche Informationen",
    firstName: "Vorname",
    lastName: "Nachname",
    email: "E-Mail",
    birthday: "Geburtsdatum",
    country: "Land",
    phone: "Telefon",
    phonePlaceholder: "Geben Sie Ihre Telefonnummer ein",
    phoneMissing: "Keine Telefonnummer hinzugefügt",
    phonePrefix: "Telefonvorwahl",
    photoAlt: "Profilfoto",
    changePhoto: "Foto ändern",
    removePhoto: "Foto entfernen",
    uploadPhoto: "Profilfoto hochladen",
    uploadingPhoto: "Profilfoto wird hochgeladen",
    cropPhotoTitle: "Profilfoto zuschneiden",
    cropPhotoDescription:
      "Passen Sie das Bild an den quadratischen Rahmen an. Ziehen Sie es zum Neuplatzieren und verwenden Sie Zoom zum Skalieren.",
    cropPhotoZoom: "Zoom",
    cropPhotoHint:
      "Die quadratische Vorschau wird als Ihr Profilfoto verwendet.",
    cropPhotoCancel: "Abbrechen",
    cropPhotoConfirm: "Zuschneiden und hochladen",
    cropPhotoProcessing: "Wird vorbereitet",
    removePhotoConfirmTitle: "Profilfoto entfernen?",
    removePhotoConfirmDescription:
      "Ihr aktuelles Profilfoto wird entfernt und Ihre Initialen werden wieder angezeigt.",
    removePhotoConfirmAction: "Entfernen",
    photoUpdatedTitle: "Profilfoto aktualisiert",
    photoUpdatedDescription:
      "Ihr Profilfoto wurde erfolgreich aktualisiert.",
    photoRemovedTitle: "Profilfoto entfernt",
    photoRemovedDescription:
      "Ihr Profilfoto wurde erfolgreich entfernt.",
    photoUpdateErrorTitle:
      "Profilfoto konnte nicht aktualisiert werden",
    photoUpdateErrorDescription:
      "Beim Hochladen Ihres Profilfotos ist etwas schiefgelaufen.",
    photoConfigurationErrorDescription:
      "Der Profilfoto-Dienst ist noch nicht konfiguriert. Bitte prüfen Sie die API-Verbindung.",
    photoInvalidTypeDescription:
      "Sie können nur JPG-, PNG- oder WEBP-Bilder hochladen.",
    photoTooLargeDescription:
      "Das Profilfoto darf höchstens 5 MB groß sein.",
    photoUnauthorizedDescription:
      "Sie müssen sich erneut anmelden, um Ihr Profilfoto zu aktualisieren.",
    photoForbiddenDescription:
      "Sie haben keine Berechtigung, dieses Profilfoto zu aktualisieren.",
    photoNotFoundDescription:
      "Der Dienst zum Hochladen von Profilfotos konnte nicht gefunden werden.",
    photoConflictDescription:
      "Dieses Foto konnte derzeit nicht hochgeladen werden. Bitte versuchen Sie es erneut.",
    photoRateLimitedDescription:
      "Zu viele Versuche wurden unternommen. Bitte versuchen Sie es später erneut.",
    photoServerErrorDescription:
      "Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es in einem Moment erneut.",
    dismissFeedback: "Benachrichtigung schließen",
    emailLockedDescription:
      "Diese E-Mail ist verifiziert und kann nicht mehr geändert werden.",
    phoneLockedDescription:
      "Diese Telefonnummer ist verifiziert und kann nicht mehr geändert werden.",
    accountInfo: "Kontoinformationen",
    userType: "Benutzertyp",
    emailVerified: "E-Mail verifiziert",
    emailNotVerified: "E-Mail nicht verifiziert",
    phoneVerified: "Telefon verifiziert",
    phoneNotVerified: "Telefon nicht verifiziert",
    memberSince: "Mitglied seit",
    brandsSectionTitle: "Marken",
    brandsSectionDescription:
      "Durchsuchen Sie die Marken, die dieser Serviceinhaber in seinem Profil sichtbar gemacht hat.",
    brandsEmptyTitle: "Noch keine öffentlichen Marken",
    brandsEmptyDescription:
      "Dieser Serviceinhaber hat derzeit keine sichtbaren Marken.",
    viewMoreBrands: "Mehr anzeigen",
    editProfile: "Profil bearbeiten",
    cancelEditing: "Abbrechen",
    saveChanges: "Änderungen speichern",
    savingChanges: "Änderungen werden gespeichert",
    updateSuccessTitle: "Profil aktualisiert",
    updateSuccessDescription:
      "Ihre Kontoinformationen wurden erfolgreich gespeichert.",
    updateErrorTitle: "Profil konnte nicht aktualisiert werden",
    updateErrorDescription:
      "Beim Speichern Ihrer Kontodaten ist ein Fehler aufgetreten.",
    configurationErrorDescription:
      "Der Profilaktualisierungsdienst ist noch nicht konfiguriert. Bitte prüfen Sie die API-Verbindung.",
    networkErrorDescription:
      "Verbindung zum Server konnte nicht hergestellt werden. Bitte versuchen Sie es erneut.",
    badRequestDescription:
      "Die gesendeten Daten wurden nicht akzeptiert.",
    unauthorizedDescription:
      "Sie müssen sich erneut anmelden, um fortzufahren.",
    forbiddenDescription:
      "Sie haben keine Berechtigung, dieses Konto zu aktualisieren.",
    notFoundDescription:
      "Der Profilaktualisierungsdienst konnte nicht gefunden werden.",
    conflictDescription:
      "Eine andere E-Mail oder Telefonnummer wird bereits von einem anderen Konto verwendet.",
    unprocessableEntityDescription:
      "Die gesendeten Daten haben die Validierung nicht bestanden.",
    rateLimitedDescription:
      "Zu viele Versuche wurden unternommen. Bitte versuchen Sie es später erneut.",
    serverErrorDescription:
      "Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es in einem Moment erneut.",
    validationErrorDescription:
      "Bitte korrigieren Sie die Formularfehler, bevor Sie speichern.",
    requiredMessage: "Dieses Feld ist erforderlich.",
    firstNameInvalidMessage:
      "Der Vorname muss mindestens 2 Zeichen lang sein.",
    lastNameInvalidMessage:
      "Der Nachname muss mindestens 2 Zeichen lang sein.",
    birthdayRequiredMessage:
      "Bitte geben Sie Ihr Geburtsdatum ein.",
    birthdayAgeMessage: "Sie müssen mindestens 18 Jahre alt sein.",
    emailInvalidMessage:
      "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
    phoneInvalidMessage:
      "Bitte geben Sie eine gültige Telefonnummer ein.",
    typeUso: "Serviceinhaber",
    typeUcr: "Kunde",
    typeAdmin: "Administrator",
  },
  categories: {
    food_beverage: "Essen & Getränke",
    beauty_wellness: "Schönheit & Wohlbefinden",
    fitness_sports: "Fitness & Sport",
    fashion_apparel: "Mode & Bekleidung",
    technology_electronics: "Technologie & Elektronik",
    home_furniture: "Heim & Möbel",
    health_pharmacy: "Gesundheit & Apotheke",
    education_training: "Bildung & Weiterbildung",
    entertainment_media: "Unterhaltung & Medien",
    travel_hospitality: "Reise & Gastgewerbe",
    haircut_styling: "Haarschnitt & Styling",
    massage_therapy: "Massage & Therapie",
    personal_training: "Personal Training",
    nail_care: "Nagelpflege",
    facial_treatment: "Gesichtsbehandlung",
    dental_care: "Zahnpflege",
    consulting: "Beratung",
    photo_session: "Fotosession",
  },
    calendar: {
    ...enMessages.calendar,
    today: "Heute",
    viewDay: "Tag",
    viewWorkWeek: "Arbeitswoche",
    viewWeek: "Woche",
    viewMonth: "Monat",
    filter: "Filter",
    newReservation: "Neu",
    myServices: "Meine Dienste",
    noServicesYet: "Noch keine Dienste",
    noReservationsTitle: "Noch keine Reservierungen",
    noReservationsDesc: "Reservierungen erscheinen hier, sobald Kunden Ihre Dienste buchen.",
    settingsTitle: "Kalendereinstellungen",
    settingsTimeFormat: "Zeitformat",
    timeFormat12h: "AM/PM",
    timeFormat24h: "24Std",
  },
  theme: {
    title: "Thema",
    system: "System",
    light: "Hell",
    dark: "Dunkel",
  },
};
