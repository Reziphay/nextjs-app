import type { Messages } from "../types";
import { enMessages } from "./en";

export const frMessages: Messages = {
  ...enMessages,
  metadata: {
    title: "Reziphay Next App",
    description:
      "Un starter Next.js multilingue avec prise en charge du français aux côtés de l’azerbaïdjanais, de l’anglais, du russe, de l’espagnol, du turc, de l’arabe, de l’allemand et des variantes régionales de l’anglais.",
  },
  languageSwitcherAriaLabel: "Sélecteur de langue",
  languageSwitcherDisplayLabel: "Langue d’affichage",
  navigationAriaLabel: "Navigation principale",
  navigation: {
    home: "Accueil",
    aboutUs: "À propos",
    questions: "Questions",
    contactUs: "Contact",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
  },
  comingSoon: {
    badge: "Bientôt disponible",
    description: "Cette page est encore en préparation.",
  },
  auth: {
    shell: {
      badge: "Reziphay Access",
      title: "Gérez votre compte Reziphay partout",
      description:
        "Réunissez les parcours Propriétaire de service et Client dans une expérience d’authentification claire et sécurisée.",
      featureOneTitle: "Expérience d’auth partagée",
      featureOneDescription:
        "Connexion, inscription et futurs écrans d’authentification vivent dans une seule structure réutilisable.",
      featureTwoTitle: "Onboarding basé sur les rôles",
      featureTwoDescription:
        "Les parcours Propriétaire de service et Client restent clairs et séparés sans friction inutile.",
      featureThreeTitle: "Rapide et responsive",
      featureThreeDescription:
        "La mise en page garde le focus du formulaire intact sur desktop et mobile.",
    },
    login: {
      title: "Connectez-vous à votre compte",
      description:
        "Saisissez votre e-mail ci-dessous pour vous connecter",
      emailLabel: "E-mail",
      emailPlaceholder: "m@example.com",
      passwordLabel: "Mot de passe",
      passwordPlaceholder: "Saisissez votre mot de passe",
      forgotPassword: "Mot de passe oublié ?",
      submit: "Se connecter",
      submitting: "Connexion en cours",
      continueWithGoogle: "Se connecter avec Google",
      noAccount: "Vous n’avez pas de compte ?",
      signUp: "S’inscrire",
      errorTitle: "Échec de la connexion",
      errorDescription:
        "Une erreur s’est produite lors de la connexion. Veuillez réessayer.",
      configurationErrorDescription:
        "Le service de connexion n’est pas encore configuré. Vérifiez la connexion API.",
      networkErrorDescription:
        "Impossible de se connecter au serveur. Veuillez réessayer.",
      maintenanceDescription:
        "Le système est temporairement indisponible. Veuillez réessayer dans un instant.",
      badRequestDescription: "Les données envoyées n’ont pas été acceptées.",
      unauthorizedDescription: "E-mail ou mot de passe invalide.",
      forbiddenDescription:
        "Vous n’avez pas l’autorisation d’effectuer cette action.",
      notFoundDescription: "Le service de connexion est introuvable.",
      rateLimitedDescription:
        "Trop de tentatives ont été effectuées. Veuillez réessayer plus tard.",
      serverErrorDescription:
        "Une erreur serveur s’est produite. Veuillez réessayer dans un instant.",
      validationErrorDescription:
        "Veuillez corriger les erreurs du formulaire avant de continuer.",
      requiredMessage: "Ce champ est obligatoire.",
      emailInvalidMessage: "Veuillez saisir une adresse e-mail valide.",
      passwordRequiredMessage: "Veuillez saisir votre mot de passe.",
      showPasswordLabel: "Afficher le mot de passe",
      hidePasswordLabel: "Masquer le mot de passe",
    },
    register: {
      title: "Créez votre compte",
      description:
        "Saisissez vos informations ci-dessous pour créer un nouveau compte",
      firstNameLabel: "Prénom",
      firstNamePlaceholder: "John",
      lastNameLabel: "Nom",
      lastNamePlaceholder: "Doe",
      birthdayLabel: "Date de naissance",
      countryLabel: "Pays",
      countryPlaceholder: "Azerbaïdjan",
      noCountryResults: "Aucun pays correspondant trouvé.",
      countryPrefixLabel: "Indicatif du pays",
      countryPrefixPlaceholder: "+994",
      emailLabel: "E-mail",
      emailPlaceholder: "m@example.com",
      passwordLabel: "Mot de passe",
      passwordPlaceholder: "Créez un nouveau mot de passe",
      passwordHint: "Utilisez au moins 8 caractères.",
      typeLabel: "Type d’utilisateur",
      typePlaceholder: "Sélectionnez un type d’utilisateur",
      typeDescription:
        "Seuls les comptes Propriétaire de service et Client peuvent s’inscrire ici.",
      typeUso: "Propriétaire de service",
      typeUsoDescription:
        "Un compte pour la personne ou l’équipe qui gère le service.",
      typeUcr: "Client",
      typeUcrDescription:
        "Un compte pour un client qui utilise le service.",
      noTypeResults: "Aucun type d’utilisateur correspondant trouvé.",
      submit: "Créer un compte",
      submitting: "Envoi en cours",
      termsAgreement:
        "En créant un compte, vous acceptez les conditions générales.",
      successTitle: "Demande d’inscription envoyée",
      successDescription:
        "Vous pourrez vous connecter une fois votre compte créé.",
      errorTitle: "Échec de l’inscription",
      errorDescription:
        "Une erreur s’est produite lors de l’inscription. Veuillez réessayer.",
      configurationErrorDescription:
        "Le service d’inscription n’est pas encore configuré. Vérifiez la connexion API.",
      networkErrorDescription:
        "Impossible de se connecter au serveur. Veuillez réessayer.",
      maintenanceDescription:
        "Le système est temporairement indisponible. Veuillez réessayer dans un instant.",
      badRequestDescription: "Les données envoyées n’ont pas été acceptées.",
      unauthorizedDescription: "Cette requête n’est pas autorisée.",
      forbiddenDescription:
        "Vous n’avez pas l’autorisation d’effectuer cette action.",
      notFoundDescription: "Le service d’inscription est introuvable.",
      conflictDescription: "Un compte avec cet e-mail existe déjà.",
      unprocessableEntityDescription:
        "Les données envoyées n’ont pas passé la validation.",
      rateLimitedDescription:
        "Trop de tentatives ont été effectuées. Veuillez réessayer plus tard.",
      serverErrorDescription:
        "Une erreur serveur s’est produite. Veuillez réessayer dans un instant.",
      validationErrorDescription:
        "Veuillez corriger les erreurs du formulaire avant de continuer.",
      requiredMessage: "Ce champ est obligatoire.",
      firstNameInvalidMessage:
        "Le prénom doit contenir au moins 2 caractères.",
      lastNameInvalidMessage:
        "Le nom doit contenir au moins 2 caractères.",
      birthdayRequiredMessage:
        "Veuillez saisir votre date de naissance.",
      birthdayAgeMessage:
        "Vous devez avoir au moins 18 ans pour vous inscrire.",
      emailInvalidMessage: "Veuillez saisir une adresse e-mail valide.",
      passwordInvalidMessage:
        "Le mot de passe doit contenir au moins 8 caractères et inclure une majuscule, une minuscule et un chiffre.",
      typeRequiredMessage:
        "Veuillez sélectionner un type d’utilisateur.",
      showPasswordLabel: "Afficher le mot de passe",
      hidePasswordLabel: "Masquer le mot de passe",
    },
  },
  backendErrors: {
    ...enMessages.backendErrors,
    "auth.invalid_credentials": "E-mail ou mot de passe invalide.",
    "errors.validation_error":
      "Les données envoyées n’ont pas passé la validation.",
    "errors.missing_token": "Le jeton d’authentification est manquant.",
    "errors.invalid_token":
      "Le jeton d’authentification est invalide.",
    "errors.forbidden":
      "Vous n’avez pas l’autorisation d’effectuer cette action.",
    "user.not_found": "Utilisateur introuvable.",
    "user.email_change_not_allowed":
      "Cette adresse e-mail ne peut plus être modifiée.",
    "user.phone_change_not_allowed":
      "Ce numéro de téléphone ne peut plus être modifié.",
    "user.email_already_in_use":
      "Cette adresse e-mail est déjà utilisée.",
    "user.phone_already_in_use":
      "Ce numéro de téléphone est déjà utilisé.",
    "media.invalid_file_type":
      "Le type de fichier sélectionné n’est pas pris en charge.",
    "media.file_too_large": "Le fichier sélectionné est trop volumineux.",
    "media.invalid_logo_ratio":
      "L’image du logo doit respecter le ratio requis.",
    "media.invalid_gallery_ratio":
      "L’image de la galerie doit respecter le ratio requis.",
    "brand.not_found": "Marque introuvable.",
    "brand.transfer_not_found":
      "Transfert de marque introuvable.",
    "brand.transfer_not_pending":
      "Ce transfert de marque n’est plus en attente.",
    "moderation.brand_not_found": "Marque introuvable.",
    "moderation.service_not_found": "Service introuvable.",
    "moderation.not_pending": "Cette soumission n’est plus en attente.",
  },
  hero: {
    eyebrow: "Starter Next.js multilingue",
    title: "Reziphay Next App",
    description:
      "Le projet prend désormais en charge l’azerbaïdjanais, l’anglais, le russe, l’espagnol, le français, le turc, l’arabe, l’allemand et des variantes régionales de l’anglais pour l’Inde, le Royaume-Uni et les États-Unis.",
  },
  api: {
    badge: "API",
    title: "Axios est prêt à l’emploi",
    description:
      "Un client `api` réutilisable est configuré avec `API_URL`. La même valeur est exposée au navigateur via `NEXT_PUBLIC_API_URL`.",
    missingBaseUrl: "API_URL est manquant",
  },
  example: {
    badge: "Utilisation",
    title: "Helper de requête inclus",
    description:
      "Vous pouvez utiliser directement l’instance partagée `api` ou appeler le helper générique `apiRequest` pour des requêtes typées.",
  },
  dashboard: {
    ...enMessages.dashboard,
    home: "Accueil",
    search: "Recherche",
    profile: "Profil",
    account: "Mon compte",
    settings: "Paramètres",
    notifications: "Notifications",
    services: "Services",
    brands: "Marques",
    dashboardPage: "Tableau de bord",
    reservations: "Réservations",
    favorites: "Favoris",
    moderation: "Modération",
    signOut: "Se déconnecter",
    signOutConfirmTitle: "Voulez-vous vraiment vous déconnecter ?",
    signOutConfirmDescription:
      "Cela mettra fin à votre session actuelle et vous ramènera à la page de connexion.",
    cancel: "Annuler",
    confirmSignOut: "Se déconnecter",
    greeting: "Bienvenue",
    platform: "Plateforme",
    support: "Support",
    feedback: "Retour",
    typeUso: "Propriétaire de service",
    typeUcr: "Client",
    typeAdmin: "Administrateur",
  },
  brands: {
    ...enMessages.brands,
    pageTitle: "Marques",
    pageDescription: "Gérez vos marques ou explorez celles disponibles.",
    createBrand: "Créer une marque",
    myBrands: "Mes marques",
    noBrandsTitle: "Aucune marque pour le moment",
    noBrandsDescription:
      "Vous n’avez encore créé aucune marque. Commencez par créer la première.",
    editBrand: "Modifier la marque",
    detailTitle: "Détails de la marque",
    topRated: "Les mieux notées",
    mostRecent: "Les plus récentes",
    explore: "Explorer",
    statusPending: "En attente",
    statusActive: "Active",
    statusRejected: "Rejetée",
    statusClosed: "Fermée",
    formCreateTitle: "Créer une marque",
    formEditTitle: "Modifier la marque",
    formSaveChanges: "Enregistrer les modifications",
    basicInfoSection: "Informations principales",
    fieldName: "Nom de la marque",
    fieldNamePlaceholder: "ex. Aria Atelier",
    fieldDescription: "Description",
    fieldDescriptionPlaceholder:
      "Décrivez votre marque, son style et ce qui la rend unique...",
    fieldCategories: "Catégories",
    fieldCategoriesPlaceholder: "Sélectionnez des catégories...",
    noCategoriesFound: "Aucune catégorie trouvée.",
    fieldLogo: "Logo de la marque",
    fieldLogoHint:
      "Téléversez un logo carré (ratio 1:1 recommandé).",
    fieldLogoUpload: "Téléverser le logo",
    fieldLogoFormatHint: "PNG, JPG, WEBP · 1:1",
    fieldGallery: "Galerie",
    fieldGalleryHint:
      "Ajoutez plusieurs images de présentation (ratio 16:9 recommandé).",
    fieldGalleryUpload: "Ajouter des images à la galerie",
    fieldGalleryFormatHint: "PNG, JPG, WEBP · 16:9",
    loginRequired: "Vous devez être connecté.",
    errorGeneric: "Une erreur s’est produite. Veuillez réessayer.",
    branchesTitle: "Succursales",
    addBranch: "Ajouter une succursale",
    noBranches: "Aucune succursale ajoutée pour le moment.",
    branchModalTitle: "Ajouter une succursale",
    branchModalDescription:
      "Saisissez les détails de l’emplacement de la succursale.",
    branchFieldName: "Nom de la succursale",
    branchFieldNamePlaceholder: "ex. Bureau principal",
    branchFieldDescription: "Description",
    branchFieldDescriptionPlaceholder: "Description optionnelle",
    branchFieldAddress1: "Adresse ligne 1",
    branchFieldAddress1Placeholder: "Rue, numéro du bâtiment",
    branchFieldAddress2: "Adresse ligne 2",
    branchFieldAddress2Placeholder:
      "Étage, appartement, etc. (optionnel)",
    branchFieldPhone: "Téléphone",
    branchFieldPhonePlaceholder: "+994 50 000 00 00",
    branchFieldEmail: "E-mail",
    branchFieldEmailPlaceholder: "succursale@example.com",
    branchField247: "Ouvert 24/7",
    branchFieldOpening: "Heure d’ouverture",
    branchFieldClosing: "Heure de fermeture",
    branchFieldBreaks: "Pauses",
    branchAddBreak: "Ajouter une pause",
    branchRemoveBreak: "Supprimer",
    branchSave: "Enregistrer la succursale",
    branchCancel: "Annuler",
    cancelForm: "Annuler",
    verificationRequiredTitle: "Vérification requise",
    verificationRequiredDescription:
      "Vous devez vérifier votre e-mail ou votre numéro de téléphone avant de créer une marque.",
    transferBrand: "Transférer la marque",
    transferModalTitle: "Transférer la propriété de la marque",
    transferModalDescription:
      "Recherchez l’utilisateur auquel vous souhaitez transférer cette marque.",
    transferSearchPlaceholder: "Rechercher par nom, e-mail ou téléphone",
    transferConfirm: "Transférer",
    transferCancel: "Annuler",
    transferSuccessDescription:
      "L’utilisateur recevra une notification et devra accepter le transfert.",
    transferConfirmStepTitle: "Confirmer le transfert",
    transferConfirmStepDescription:
      "Vérifiez les détails ci-dessous et confirmez que vous souhaitez continuer.",
    transferTargetLabel: "Transférer à",
    transferChangeTarget: "Modifier",
    transferBrandLabel: "Marque",
    transferConfirmCheckbox:
      "Je comprends que le transfert de cette marque est irréversible et je souhaite continuer.",
    transferSearchHint:
      "Tapez au moins 2 caractères pour rechercher par nom, e-mail ou téléphone.",
    transferNoResults: "Aucun utilisateur correspondant trouvé.",
    incomingTransfersTitle: "Transferts de marque entrants",
    incomingTransfersDescription:
      "Examinez les marques que d’autres propriétaires de service souhaitent vous transférer.",
    outgoingTransfersTitle: "Transferts sortants en attente",
    outgoingTransfersDescription:
      "Suivez les demandes de transfert envoyées et annulez-les tant qu’elles sont encore en attente.",
    noIncomingTransfers:
      "Aucun transfert de marque entrant pour le moment.",
    noOutgoingTransfers:
      "Aucun transfert sortant n’est en attente.",
    transferFrom: "De",
    transferTo: "Vers",
    transferRequestedAt: "Demandé le",
    acceptTransfer: "Accepter",
    rejectTransfer: "Refuser",
    cancelTransfer: "Annuler la demande",
    transferAcceptedDescription: "Le transfert de la marque a été accepté.",
    transferCancelledDescription:
      "La demande de transfert de marque a été annulée.",
    transferStatusPending: "En attente",
    transferStatusAccepted: "Accepté",
    transferStatusRejected: "Refusé",
    notificationsSection: "Notifications",
    notificationsEmpty: "Aucune notification pour le moment.",
    deleteBrand: "Supprimer la marque",
    deleteModalTitle: "Supprimer la marque ?",
    deleteModalDescription:
      "Cette action est irréversible. La marque sera supprimée définitivement.",
    deleteWithServices: "Supprimer également tous les services",
    deleteServicesTransferToMe:
      "Transférer les services vers mon compte",
    deleteServicesTransferToOther:
      "Transférer les services vers un autre utilisateur",
    deleteServiceTransferNote:
      "Les options de transfert de services ne sont pas encore disponibles. Cette fonctionnalité sera activée lorsque le module de services sera lancé. Pour supprimer cette marque maintenant, activez 'Supprimer également tous les services' ci-dessus.",
    deleteConfirm: "Supprimer",
    deleteCancel: "Annuler",
    createSuccessDescription:
      "Votre marque a été envoyée pour examen et attend une approbation.",
    updateSuccessDescription:
      "Les informations de votre marque ont été enregistrées avec succès.",
    errorDescription:
      "Une erreur s’est produite. Veuillez réessayer.",
    forbiddenDescription:
      "Vous n’avez pas l’autorisation d’effectuer cette action.",
    notFoundDescription: "La marque est introuvable.",
    logoRatioError:
      "Le logo doit utiliser un ratio carré de 1:1.",
    galleryRatioError:
      "Les images de la galerie doivent utiliser un ratio 16:9.",
    rateBrand: "Noter cette marque",
    yourRating: "Votre note",
    ratingSavedDescription: "Votre note a été enregistrée.",
    brandCardBrandLabel: "Marque",
    brandCardCategoryLabel: "Catégorie",
    brandCardDescriptionLabel: "Description",
    brandCardOwnerLabel: "Propriétaire de la marque",
    brandCardReviewsSuffix: "avis",
    requiredMessage: "Ce champ est obligatoire.",
    nameRequiredMessage: "Le nom de la marque est obligatoire.",
    openingRequiredMessage:
      "L’heure d’ouverture est obligatoire.",
    closingRequiredMessage:
      "L’heure de fermeture est obligatoire.",
    gallery: "Galerie",
    discoverBrands: "Découvrir les marques",
    noSectionBrands:
      "Aucune marque dans cette section pour le moment.",
    branchEditModalTitle: "Modifier la succursale",
    detailDefaultDescription:
      "Ce profil de marque rassemble ses informations essentielles, ses médias et son réseau de succursales.",
    detailFilterAllBranches: "Toutes les succursales",
    detailFilterOpen247: "24/7 uniquement",
    detailFilterWithContact: "Avec contact",
    detailSearchPlaceholder:
      "Rechercher une succursale, une adresse, un téléphone ou un e-mail",
    detailTableBranch: "Succursale",
    detailTableAddress: "Adresse",
    detailTableAvailability: "Disponibilité",
    detailTableContact: "Contact",
    detailBranchOpenDetails: "Voir les détails",
    detailBranchModalTitle: "Détails de la succursale",
    detailBranchModalDescription:
      "Toutes les informations de la succursale sont affichées ici.",
    detailNoMatchingBranches:
      "Aucune succursale ne correspond aux filtres actuels.",
    detailMetricCategories: "Catégories",
    detailMetricBranches: "Succursales",
    detailMetricGallery: "Éléments de galerie",
    detailMetricTeamMembers: "Membres de l’équipe",
    detailMetricRating: "Note",
    detailNoGalleryMedia:
      "Aucune image de galerie n’a encore été ajoutée pour cette marque.",
    detailGalleryPrevious: "Image précédente",
    detailGalleryNext: "Image suivante",
    detailGalleryAutoplay: "Lecture automatique activée",
    detailGalleryPaused: "Lecture automatique en pause",
  },
  profile: {
    ...enMessages.profile,
    title: "Mon profil",
    description: "Gérez ici les informations de votre compte",
    editDescription:
      "Mettez à jour les champs que vous souhaitez garder à jour pour votre compte.",
    personalInfo: "Informations personnelles",
    firstName: "Prénom",
    lastName: "Nom",
    email: "E-mail",
    birthday: "Date de naissance",
    country: "Pays",
    phone: "Téléphone",
    phonePlaceholder: "Saisissez votre numéro de téléphone",
    phoneMissing: "Aucun téléphone ajouté",
    phonePrefix: "Indicatif téléphonique",
    photoAlt: "Photo de profil",
    changePhoto: "Changer la photo",
    removePhoto: "Supprimer la photo",
    uploadPhoto: "Téléverser une photo de profil",
    uploadingPhoto: "Téléversement de la photo de profil",
    cropPhotoTitle: "Recadrer la photo de profil",
    cropPhotoDescription:
      "Ajustez l’image pour qu’elle s’adapte au cadre carré. Faites glisser pour la repositionner et utilisez le zoom pour la redimensionner.",
    cropPhotoZoom: "Zoom",
    cropPhotoHint:
      "L’aperçu carré sera utilisé comme photo de profil.",
    cropPhotoCancel: "Annuler",
    cropPhotoConfirm: "Recadrer et téléverser",
    cropPhotoProcessing: "Préparation",
    removePhotoConfirmTitle: "Supprimer la photo de profil ?",
    removePhotoConfirmDescription:
      "Votre photo de profil actuelle sera supprimée et vos initiales seront de nouveau affichées.",
    removePhotoConfirmAction: "Supprimer",
    photoUpdatedTitle: "Photo de profil mise à jour",
    photoUpdatedDescription:
      "Votre photo de profil a été mise à jour avec succès.",
    photoRemovedTitle: "Photo de profil supprimée",
    photoRemovedDescription:
      "Votre photo de profil a été supprimée avec succès.",
    photoUpdateErrorTitle:
      "Impossible de mettre à jour la photo de profil",
    photoUpdateErrorDescription:
      "Une erreur s’est produite lors du téléversement de votre photo de profil.",
    photoConfigurationErrorDescription:
      "Le service de photo de profil n’est pas encore configuré. Vérifiez la connexion API.",
    photoInvalidTypeDescription:
      "Vous pouvez uniquement téléverser des images JPG, PNG ou WEBP.",
    photoTooLargeDescription:
      "La photo de profil doit faire 5 Mo maximum.",
    photoUnauthorizedDescription:
      "Vous devez vous reconnecter pour mettre à jour votre photo de profil.",
    photoForbiddenDescription:
      "Vous n’avez pas l’autorisation de mettre à jour cette photo de profil.",
    photoNotFoundDescription:
      "Le service de téléversement de photo de profil est introuvable.",
    photoConflictDescription:
      "Cette photo n’a pas pu être téléversée pour le moment. Veuillez réessayer.",
    photoRateLimitedDescription:
      "Trop de tentatives ont été effectuées. Veuillez réessayer plus tard.",
    photoServerErrorDescription:
      "Une erreur serveur s’est produite. Veuillez réessayer dans un instant.",
    dismissFeedback: "Fermer la notification",
    emailLockedDescription:
      "Cet e-mail est vérifié et ne peut plus être modifié.",
    phoneLockedDescription:
      "Ce numéro de téléphone est vérifié et ne peut plus être modifié.",
    accountInfo: "Informations du compte",
    userType: "Type d’utilisateur",
    emailVerified: "E-mail vérifié",
    emailNotVerified: "E-mail non vérifié",
    phoneVerified: "Téléphone vérifié",
    phoneNotVerified: "Téléphone non vérifié",
    memberSince: "Membre depuis",
    brandsSectionTitle: "Marques",
    brandsSectionDescription:
      "Parcourez les marques que ce propriétaire de service a rendues visibles sur son profil.",
    brandsEmptyTitle: "Aucune marque publique pour le moment",
    brandsEmptyDescription:
      "Ce propriétaire de service n’a actuellement aucune marque visible.",
    viewMoreBrands: "Voir plus",
    editProfile: "Modifier le profil",
    cancelEditing: "Annuler",
    saveChanges: "Enregistrer les modifications",
    savingChanges: "Enregistrement en cours",
    updateSuccessTitle: "Profil mis à jour",
    updateSuccessDescription:
      "Les informations de votre compte ont été enregistrées avec succès.",
    updateErrorTitle: "Échec de la mise à jour du profil",
    updateErrorDescription:
      "Une erreur s’est produite lors de l’enregistrement des modifications de votre compte.",
    configurationErrorDescription:
      "Le service de mise à jour du profil n’est pas encore configuré. Vérifiez la connexion API.",
    networkErrorDescription:
      "Impossible de se connecter au serveur. Veuillez réessayer.",
    badRequestDescription:
      "Les données envoyées n’ont pas été acceptées.",
    unauthorizedDescription:
      "Vous devez vous reconnecter pour continuer.",
    forbiddenDescription:
      "Vous n’avez pas l’autorisation de mettre à jour ce compte.",
    notFoundDescription:
      "Le service de mise à jour du profil est introuvable.",
    conflictDescription:
      "Un autre compte utilise déjà cet e-mail ou ce téléphone.",
    unprocessableEntityDescription:
      "Les données envoyées n’ont pas passé la validation.",
    rateLimitedDescription:
      "Trop de tentatives ont été effectuées. Veuillez réessayer plus tard.",
    serverErrorDescription:
      "Une erreur serveur s’est produite. Veuillez réessayer dans un instant.",
    validationErrorDescription:
      "Veuillez corriger les erreurs du formulaire avant d’enregistrer.",
    requiredMessage: "Ce champ est obligatoire.",
    firstNameInvalidMessage:
      "Le prénom doit contenir au moins 2 caractères.",
    lastNameInvalidMessage:
      "Le nom doit contenir au moins 2 caractères.",
    birthdayRequiredMessage:
      "Veuillez saisir votre date de naissance.",
    birthdayAgeMessage:
      "Vous devez avoir au moins 18 ans.",
    emailInvalidMessage:
      "Veuillez saisir une adresse e-mail valide.",
    phoneInvalidMessage:
      "Veuillez saisir un numéro de téléphone valide.",
    typeUso: "Propriétaire de service",
    typeUcr: "Client",
    typeAdmin: "Administrateur",
  },
  categories: {
    food_beverage: "Alimentation & Boissons",
    beauty_wellness: "Beauté & Bien-être",
    fitness_sports: "Fitness & Sports",
    fashion_apparel: "Mode & Vêtements",
    technology_electronics: "Technologie & Électronique",
    home_furniture: "Maison & Mobilier",
    health_pharmacy: "Santé & Pharmacie",
    education_training: "Éducation & Formation",
    entertainment_media: "Divertissement & Médias",
    travel_hospitality: "Voyage & Hôtellerie",
    haircut_styling: "Coupe & Coiffure",
    massage_therapy: "Massage & Thérapie",
    personal_training: "Entraînement personnel",
    nail_care: "Soin des ongles",
    facial_treatment: "Soin du visage",
    dental_care: "Soins dentaires",
    consulting: "Conseil",
    photo_session: "Séance photo",
  },
    calendar: {
    ...enMessages.calendar,
    today: "Aujourd'hui",
    viewDay: "Jour",
    viewWorkWeek: "Semaine de travail",
    viewWeek: "Semaine",
    viewMonth: "Mois",
    filter: "Filtrer",
    newReservation: "Nouveau",
    myServices: "Mes services",
    noServicesYet: "Aucun service encore",
    noReservationsTitle: "Aucune réservation encore",
    noReservationsDesc: "Les réservations apparaîtront ici quand les clients réserveront vos services.",
    settingsTitle: "Paramètres du calendrier",
    settingsTimeFormat: "Format de l'heure",
    timeFormat12h: "AM/PM",
    timeFormat24h: "24h",
  },
};
