import type { Messages } from "../types";
import { enMessages } from "./en";

export const esMessages: Messages = {
  ...enMessages,
  metadata: {
    title: "Reziphay Next App",
    description:
      "Un starter multilingue de Next.js con soporte para español junto con azerbaiyano, inglés, ruso, francés, turco, árabe y alemán.",
  },
  languageSwitcherAriaLabel: "Selector de idioma",
  languageSwitcherDisplayLabel: "Idioma de visualización",
  navigationAriaLabel: "Navegación principal",
  navigation: {
    home: "Inicio",
    aboutUs: "Sobre nosotros",
    questions: "Preguntas",
    contactUs: "Contacto",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
  },
  comingSoon: {
    badge: "Próximamente",
    description: "Esta página aún se está preparando.",
  },
  auth: {
    shell: {
      badge: "Reziphay Access",
      title: "Gestiona tu cuenta de Reziphay desde cualquier lugar",
      description:
        "Reúne los flujos de Propietario del servicio y Cliente en una experiencia de acceso limpia y segura.",
      featureOneTitle: "Experiencia de acceso compartida",
      featureOneDescription:
        "Inicio de sesión, registro y futuras pantallas de acceso viven dentro de una sola estructura reutilizable.",
      featureTwoTitle: "Onboarding por roles",
      featureTwoDescription:
        "Los recorridos de Propietario del servicio y Cliente se mantienen claros y separados sin fricción extra.",
      featureThreeTitle: "Rápido y adaptable",
      featureThreeDescription:
        "El diseño mantiene el foco del formulario tanto en escritorio como en móvil.",
    },
    login: {
      title: "Inicia sesión en tu cuenta",
      description: "Introduce tu correo electrónico para iniciar sesión",
      emailLabel: "Correo electrónico",
      emailPlaceholder: "m@example.com",
      passwordLabel: "Contraseña",
      passwordPlaceholder: "Introduce tu contraseña",
      forgotPassword: "¿Olvidaste tu contraseña?",
      submit: "Iniciar sesión",
      submitting: "Iniciando sesión",
      continueWithGoogle: "Iniciar sesión con Google",
      noAccount: "¿No tienes una cuenta?",
      signUp: "Registrarse",
      errorTitle: "Error al iniciar sesión",
      errorDescription:
        "Algo salió mal al iniciar sesión. Inténtalo de nuevo.",
      configurationErrorDescription:
        "El servicio de acceso aún no está configurado. Revisa la conexión con la API.",
      networkErrorDescription:
        "No se pudo conectar con el servidor. Inténtalo de nuevo.",
      maintenanceDescription:
        "El sistema no está disponible temporalmente. Inténtalo de nuevo en breve.",
      badRequestDescription: "Los datos enviados no fueron aceptados.",
      unauthorizedDescription: "Correo electrónico o contraseña no válidos.",
      forbiddenDescription:
        "No tienes permiso para realizar esta acción.",
      notFoundDescription: "No se encontró el servicio de acceso.",
      rateLimitedDescription:
        "Se realizaron demasiados intentos. Inténtalo más tarde.",
      serverErrorDescription:
        "Se produjo un error del servidor. Inténtalo de nuevo en un momento.",
      validationErrorDescription:
        "Corrige los errores del formulario antes de continuar.",
      requiredMessage: "Este campo es obligatorio.",
      emailInvalidMessage:
        "Introduce una dirección de correo válida.",
      passwordRequiredMessage: "Introduce tu contraseña.",
      showPasswordLabel: "Mostrar contraseña",
      hidePasswordLabel: "Ocultar contraseña",
    },
    register: {
      title: "Crea tu cuenta",
      description:
        "Introduce tus datos para registrar una nueva cuenta",
      firstNameLabel: "Nombre",
      firstNamePlaceholder: "John",
      lastNameLabel: "Apellido",
      lastNamePlaceholder: "Doe",
      birthdayLabel: "Fecha de nacimiento",
      countryLabel: "País",
      countryPlaceholder: "Azerbaiyán",
      noCountryResults: "No se encontró ningún país coincidente.",
      countryPrefixLabel: "Prefijo del país",
      countryPrefixPlaceholder: "+994",
      emailLabel: "Correo electrónico",
      emailPlaceholder: "m@example.com",
      passwordLabel: "Contraseña",
      passwordPlaceholder: "Crea una nueva contraseña",
      passwordHint: "Usa al menos 8 caracteres.",
      typeLabel: "Tipo de usuario",
      typePlaceholder: "Selecciona un tipo de usuario",
      typeDescription:
        "Solo las cuentas de Propietario del servicio y Cliente pueden registrarse aquí.",
      typeUso: "Propietario del servicio",
      typeUsoDescription:
        "Una cuenta para la persona o el equipo que gestiona el servicio.",
      typeUcr: "Cliente",
      typeUcrDescription:
        "Una cuenta para un cliente que utiliza el servicio.",
      noTypeResults: "No se encontró ningún tipo de usuario coincidente.",
      submit: "Crear cuenta",
      submitting: "Enviando",
      termsAgreement:
        "Al crear una cuenta, aceptas los términos y condiciones.",
      successTitle: "Solicitud de registro enviada",
      successDescription:
        "Podrás iniciar sesión después de que se cree tu cuenta.",
      errorTitle: "Registro fallido",
      errorDescription:
        "Algo salió mal durante el registro. Inténtalo de nuevo.",
      configurationErrorDescription:
        "El servicio de registro aún no está configurado. Revisa la conexión con la API.",
      networkErrorDescription:
        "No se pudo conectar con el servidor. Inténtalo de nuevo.",
      maintenanceDescription:
        "El sistema no está disponible temporalmente. Inténtalo de nuevo en breve.",
      badRequestDescription: "Los datos enviados no fueron aceptados.",
      unauthorizedDescription: "Esta solicitud no está autorizada.",
      forbiddenDescription:
        "No tienes permiso para realizar esta acción.",
      notFoundDescription: "No se encontró el servicio de registro.",
      conflictDescription: "Ya existe una cuenta con este correo electrónico.",
      unprocessableEntityDescription:
        "Los datos enviados no superaron la validación.",
      rateLimitedDescription:
        "Se realizaron demasiados intentos. Inténtalo más tarde.",
      serverErrorDescription:
        "Se produjo un error del servidor. Inténtalo de nuevo en un momento.",
      validationErrorDescription:
        "Corrige los errores del formulario antes de continuar.",
      requiredMessage: "Este campo es obligatorio.",
      firstNameInvalidMessage:
        "El nombre debe tener al menos 2 caracteres.",
      lastNameInvalidMessage:
        "El apellido debe tener al menos 2 caracteres.",
      birthdayRequiredMessage:
        "Introduce tu fecha de nacimiento.",
      birthdayAgeMessage:
        "Debes tener al menos 18 años para registrarte.",
      emailInvalidMessage:
        "Introduce una dirección de correo válida.",
      passwordInvalidMessage:
        "La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas y un número.",
      typeRequiredMessage: "Selecciona un tipo de usuario.",
      showPasswordLabel: "Mostrar contraseña",
      hidePasswordLabel: "Ocultar contraseña",
    },
  },
  backendErrors: {
    "auth.invalid_credentials": "Correo electrónico o contraseña no válidos.",
    "errors.validation_error":
      "Los datos enviados no superaron la validación.",
    "errors.missing_token": "Falta el token de autenticación.",
    "errors.invalid_token": "El token de autenticación no es válido.",
    "errors.forbidden":
      "No tienes permiso para realizar esta acción.",
    "user.not_found": "Usuario no encontrado.",
    "user.email_change_not_allowed":
      "Esta dirección de correo ya no se puede cambiar.",
    "user.phone_change_not_allowed":
      "Este número de teléfono ya no se puede cambiar.",
    "user.email_already_in_use":
      "Esta dirección de correo ya está en uso.",
    "user.phone_already_in_use":
      "Este número de teléfono ya está en uso.",
    "media.invalid_file_type":
      "El tipo de archivo seleccionado no es compatible.",
    "media.file_too_large": "El archivo seleccionado es demasiado grande.",
    "media.invalid_logo_ratio":
      "La imagen del logotipo debe usar la proporción requerida.",
    "media.invalid_gallery_ratio":
      "La imagen de la galería debe usar la proporción requerida.",
    "brand.not_found": "Marca no encontrada.",
    "brand.transfer_not_found":
      "Transferencia de marca no encontrada.",
    "brand.transfer_not_pending":
      "Esta transferencia de marca ya no está pendiente.",
    "moderation.brand_not_found": "Marca no encontrada.",
    "moderation.service_not_found": "Servicio no encontrado.",
    "moderation.not_pending": "Esta solicitud ya no está pendiente.",
  },
  hero: {
    eyebrow: "Starter multilingüe de Next.js",
    title: "Reziphay Next App",
    description:
      "El proyecto ahora admite azerbaiyano, inglés, ruso, español, francés, turco, árabe y alemán.",
  },
  api: {
    badge: "API",
    title: "Axios está listo para usarse",
    description:
      "Se ha configurado un cliente `api` reutilizable con `API_URL`. El mismo valor está disponible en el navegador a través de `NEXT_PUBLIC_API_URL`.",
    missingBaseUrl: "Falta API_URL",
  },
  example: {
    badge: "Uso",
    title: "Incluye helper para peticiones",
    description:
      "Puedes usar directamente la instancia compartida `api` o llamar al helper genérico `apiRequest` para peticiones tipadas.",
  },
  dashboard: {
    home: "Inicio",
    search: "Buscar",
    profile: "Perfil",
    account: "Mi cuenta",
    settings: "Configuración",
    notifications: "Notificaciones",
    services: "Servicios",
    brands: "Marcas",
    dashboardPage: "Panel",
    reservations: "Reservas",
    favorites: "Favoritos",
    moderation: "Moderación",
    signOut: "Cerrar sesión",
    signOutConfirmTitle: "¿Seguro que quieres cerrar sesión?",
    signOutConfirmDescription:
      "Esto cerrará tu sesión actual y te devolverá a la página de inicio de sesión.",
    cancel: "Cancelar",
    confirmSignOut: "Cerrar sesión",
    greeting: "Bienvenido",
    platform: "Plataforma",
    support: "Soporte",
    feedback: "Comentarios",
    typeUso: "Propietario del servicio",
    typeUcr: "Cliente",
    typeAdmin: "Administrador",
  },
  brands: {
    ...enMessages.brands,
    pageTitle: "Marcas",
    pageDescription: "Gestiona tus marcas o explora las disponibles.",
    createBrand: "Crear una marca",
    myBrands: "Mis marcas",
    noBrandsTitle: "Aún no hay marcas",
    noBrandsDescription:
      "Todavía no has creado ninguna marca. Empieza creando la primera.",
    editBrand: "Editar marca",
    detailTitle: "Detalles de la marca",
    topRated: "Mejor valoradas",
    mostRecent: "Más recientes",
    explore: "Explorar",
    statusPending: "Pendiente",
    statusActive: "Activa",
    statusRejected: "Rechazada",
    statusClosed: "Cerrada",
    formCreateTitle: "Crear una marca",
    formEditTitle: "Editar marca",
    formSaveChanges: "Guardar cambios",
    basicInfoSection: "Información básica",
    fieldName: "Nombre de la marca",
    fieldNamePlaceholder: "p. ej. Aria Atelier",
    fieldDescription: "Descripción",
    fieldDescriptionPlaceholder:
      "Describe tu marca, su estilo y lo que la hace única...",
    fieldCategories: "Categorías",
    fieldCategoriesPlaceholder: "Selecciona categorías...",
    noCategoriesFound: "No se encontraron categorías.",
    fieldLogo: "Logotipo de la marca",
    fieldLogoHint:
      "Sube un logotipo cuadrado (se recomienda proporción 1:1).",
    fieldLogoUpload: "Subir logotipo",
    fieldLogoFormatHint: "PNG, JPG, WEBP · 1:1",
    fieldGallery: "Galería",
    fieldGalleryHint:
      "Añade varias imágenes de muestra (se recomienda proporción 16:9).",
    fieldGalleryUpload: "Añadir imágenes a la galería",
    fieldGalleryFormatHint: "PNG, JPG, WEBP · 16:9",
    loginRequired: "Debes iniciar sesión.",
    errorGeneric: "Se produjo un error. Inténtalo de nuevo.",
    branchesTitle: "Sucursales",
    addBranch: "Añadir sucursal",
    noBranches: "Aún no se han añadido sucursales.",
    branchModalTitle: "Añadir sucursal",
    branchModalDescription:
      "Introduce los detalles de la ubicación de la sucursal.",
    branchFieldName: "Nombre de la sucursal",
    branchFieldNamePlaceholder: "p. ej. Oficina principal",
    branchFieldDescription: "Descripción",
    branchFieldDescriptionPlaceholder: "Descripción opcional",
    branchFieldAddress1: "Dirección línea 1",
    branchFieldAddress1Placeholder: "Calle, número de edificio",
    branchFieldAddress2: "Dirección línea 2",
    branchFieldAddress2Placeholder: "Piso, apartamento, etc. (opcional)",
    branchFieldPhone: "Teléfono",
    branchFieldPhonePlaceholder: "+994 50 000 00 00",
    branchFieldEmail: "Correo electrónico",
    branchFieldEmailPlaceholder: "sucursal@example.com",
    branchField247: "Abierto 24/7",
    branchFieldOpening: "Hora de apertura",
    branchFieldClosing: "Hora de cierre",
    branchFieldBreaks: "Pausas",
    branchAddBreak: "Añadir pausa",
    branchRemoveBreak: "Quitar",
    branchSave: "Guardar sucursal",
    branchCancel: "Cancelar",
    cancelForm: "Cancelar",
    verificationRequiredTitle: "Verificación requerida",
    verificationRequiredDescription:
      "Debes verificar tu correo electrónico o número de teléfono antes de crear una marca.",
    transferBrand: "Transferir marca",
    transferModalTitle: "Transferir propiedad de la marca",
    transferModalDescription:
      "Busca al usuario al que quieres transferir esta marca.",
    transferSearchPlaceholder: "Buscar por nombre, correo o teléfono",
    transferConfirm: "Transferir",
    transferCancel: "Cancelar",
    transferSuccessDescription:
      "El usuario recibirá una notificación y deberá aceptar la transferencia.",
    transferConfirmStepTitle: "Confirmar transferencia",
    transferConfirmStepDescription:
      "Revisa los detalles a continuación y confirma que quieres continuar.",
    transferTargetLabel: "Transferir a",
    transferChangeTarget: "Cambiar",
    transferBrandLabel: "Marca",
    transferConfirmCheckbox:
      "Entiendo que transferir esta marca es irreversible y quiero continuar.",
    transferSearchHint:
      "Escribe al menos 2 caracteres para buscar por nombre, correo o teléfono.",
    transferNoResults: "No se encontraron usuarios coincidentes.",
    incomingTransfersTitle: "Transferencias de marca entrantes",
    incomingTransfersDescription:
      "Revisa las marcas que otros propietarios de servicios quieren transferirte.",
    outgoingTransfersTitle: "Transferencias salientes pendientes",
    outgoingTransfersDescription:
      "Sigue las solicitudes de transferencia que enviaste y cancélalas mientras sigan pendientes.",
    noIncomingTransfers:
      "No hay transferencias de marca entrantes en este momento.",
    noOutgoingTransfers:
      "No hay transferencias salientes pendientes.",
    transferFrom: "De",
    transferTo: "Para",
    transferRequestedAt: "Solicitada",
    acceptTransfer: "Aceptar",
    rejectTransfer: "Rechazar",
    cancelTransfer: "Cancelar solicitud",
    transferAcceptedDescription: "La transferencia de marca fue aceptada.",
    transferCancelledDescription:
      "La solicitud de transferencia de marca fue cancelada.",
    transferStatusPending: "Pendiente",
    transferStatusAccepted: "Aceptada",
    transferStatusRejected: "Rechazada",
    notificationsSection: "Notificaciones",
    notificationsEmpty: "Aún no hay notificaciones.",
    deleteBrand: "Eliminar marca",
    deleteModalTitle: "¿Eliminar marca?",
    deleteModalDescription:
      "Esta acción no se puede deshacer. La marca se eliminará permanentemente.",
    deleteWithServices: "Eliminar también todos los servicios",
    deleteServicesTransferToMe: "Transferir servicios a mi cuenta",
    deleteServicesTransferToOther:
      "Transferir servicios a otro usuario",
    deleteServiceTransferNote:
      "Las opciones de transferencia de servicios aún no están disponibles. Esta función se habilitará cuando se lance el módulo de servicios. Para eliminar esta marca ahora, activa arriba 'Eliminar también todos los servicios'.",
    deleteConfirm: "Eliminar",
    deleteCancel: "Cancelar",
    createSuccessDescription:
      "Tu marca se envió a revisión y está pendiente de aprobación.",
    updateSuccessDescription:
      "La información de tu marca se ha guardado correctamente.",
    errorDescription:
      "Se produjo un error. Inténtalo de nuevo.",
    forbiddenDescription:
      "No tienes permiso para realizar esta acción.",
    notFoundDescription: "No se pudo encontrar la marca.",
    logoRatioError:
      "El logotipo debe usar una proporción cuadrada de 1:1.",
    galleryRatioError:
      "Las imágenes de la galería deben usar una proporción 16:9.",
    rateBrand: "Valora esta marca",
    yourRating: "Tu valoración",
    ratingSavedDescription: "Tu valoración se ha guardado.",
    brandCardBrandLabel: "Marca",
    brandCardCategoryLabel: "Categoría",
    brandCardDescriptionLabel: "Descripción",
    brandCardOwnerLabel: "Propietario de la marca",
    brandCardReviewsSuffix: "reseñas",
    requiredMessage: "Este campo es obligatorio.",
    nameRequiredMessage: "El nombre de la marca es obligatorio.",
    openingRequiredMessage: "La hora de apertura es obligatoria.",
    closingRequiredMessage: "La hora de cierre es obligatoria.",
    gallery: "Galería",
    discoverBrands: "Descubrir marcas",
    noSectionBrands: "Aún no hay marcas en esta sección.",
    branchEditModalTitle: "Editar sucursal",
    detailDefaultDescription:
      "Este perfil de marca reúne su información principal, sus recursos multimedia y su red de sucursales.",
    detailFilterAllBranches: "Todas las sucursales",
    detailFilterOpen247: "Solo 24/7",
    detailFilterWithContact: "Con contacto",
    detailSearchPlaceholder:
      "Buscar sucursal, dirección, teléfono o correo",
    detailTableBranch: "Sucursal",
    detailTableAddress: "Dirección",
    detailTableAvailability: "Disponibilidad",
    detailTableContact: "Contacto",
    detailBranchOpenDetails: "Ver detalles",
    detailBranchModalTitle: "Detalles de la sucursal",
    detailBranchModalDescription:
      "Aquí se muestra toda la información de la sucursal.",
    detailNoMatchingBranches:
      "Ninguna sucursal coincide con los filtros actuales.",
    detailMetricCategories: "Categorías",
    detailMetricBranches: "Sucursales",
    detailMetricGallery: "Elementos de galería",
    detailMetricTeamMembers: "Miembros del equipo",
    detailMetricRating: "Valoración",
    detailNoGalleryMedia:
      "Aún no se han añadido imágenes de galería para esta marca.",
    detailGalleryPrevious: "Imagen anterior",
    detailGalleryNext: "Imagen siguiente",
    detailGalleryAutoplay: "Reproducción automática activada",
    detailGalleryPaused: "Reproducción automática en pausa",
  },
  profile: {
    ...enMessages.profile,
    title: "Mi perfil",
    description: "Gestiona aquí la información de tu cuenta",
    editDescription:
      "Actualiza los campos que quieras mantener al día en tu cuenta.",
    personalInfo: "Información personal",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo electrónico",
    birthday: "Fecha de nacimiento",
    country: "País",
    phone: "Teléfono",
    phonePlaceholder: "Introduce tu número de teléfono",
    phoneMissing: "No se ha añadido teléfono",
    phonePrefix: "Prefijo telefónico",
    photoAlt: "Foto de perfil",
    changePhoto: "Cambiar foto",
    removePhoto: "Eliminar foto",
    uploadPhoto: "Subir foto de perfil",
    uploadingPhoto: "Subiendo foto de perfil",
    cropPhotoTitle: "Recortar foto de perfil",
    cropPhotoDescription:
      "Ajusta la imagen para que encaje en el marco cuadrado. Arrastra para recolocarla y usa el zoom para escalarla.",
    cropPhotoZoom: "Zoom",
    cropPhotoHint:
      "La vista previa cuadrada se usará como tu foto de perfil.",
    cropPhotoCancel: "Cancelar",
    cropPhotoConfirm: "Recortar y subir",
    cropPhotoProcessing: "Preparando",
    removePhotoConfirmTitle: "¿Eliminar foto de perfil?",
    removePhotoConfirmDescription:
      "Tu foto de perfil actual se eliminará y volverán a mostrarse tus iniciales.",
    removePhotoConfirmAction: "Eliminar",
    photoUpdatedTitle: "Foto de perfil actualizada",
    photoUpdatedDescription:
      "Tu foto de perfil se ha actualizado correctamente.",
    photoRemovedTitle: "Foto de perfil eliminada",
    photoRemovedDescription:
      "Tu foto de perfil se ha eliminado correctamente.",
    photoUpdateErrorTitle:
      "No se pudo actualizar la foto de perfil",
    photoUpdateErrorDescription:
      "Algo salió mal al subir tu foto de perfil.",
    photoConfigurationErrorDescription:
      "El servicio de foto de perfil aún no está configurado. Revisa la conexión con la API.",
    photoInvalidTypeDescription:
      "Solo puedes subir imágenes JPG, PNG o WEBP.",
    photoTooLargeDescription:
      "La foto de perfil debe ser de 5 MB o menos.",
    photoUnauthorizedDescription:
      "Necesitas volver a iniciar sesión para actualizar tu foto de perfil.",
    photoForbiddenDescription:
      "No tienes permiso para actualizar esta foto de perfil.",
    photoNotFoundDescription:
      "No se encontró el servicio de subida de foto de perfil.",
    photoConflictDescription:
      "Esta foto no se pudo subir en este momento. Inténtalo de nuevo.",
    photoRateLimitedDescription:
      "Se realizaron demasiados intentos. Inténtalo más tarde.",
    photoServerErrorDescription:
      "Se produjo un error del servidor. Inténtalo de nuevo en un momento.",
    dismissFeedback: "Cerrar notificación",
    emailLockedDescription:
      "Este correo electrónico está verificado y ya no se puede cambiar.",
    phoneLockedDescription:
      "Este número de teléfono está verificado y ya no se puede cambiar.",
    accountInfo: "Información de la cuenta",
    userType: "Tipo de usuario",
    emailVerified: "Correo verificado",
    emailNotVerified: "Correo no verificado",
    phoneVerified: "Teléfono verificado",
    phoneNotVerified: "Teléfono no verificado",
    memberSince: "Miembro desde",
    brandsSectionTitle: "Marcas",
    brandsSectionDescription:
      "Explora las marcas que este propietario de servicio ha hecho visibles en su perfil.",
    brandsEmptyTitle: "Aún no hay marcas públicas",
    brandsEmptyDescription:
      "Este propietario de servicio no tiene marcas visibles por el momento.",
    viewMoreBrands: "Ver más",
    editProfile: "Editar perfil",
    cancelEditing: "Cancelar",
    saveChanges: "Guardar cambios",
    savingChanges: "Guardando cambios",
    updateSuccessTitle: "Perfil actualizado",
    updateSuccessDescription:
      "La información de tu cuenta se ha guardado correctamente.",
    updateErrorTitle: "No se pudo actualizar el perfil",
    updateErrorDescription:
      "Algo salió mal al guardar los cambios de tu cuenta.",
    configurationErrorDescription:
      "El servicio de actualización de perfil aún no está configurado. Revisa la conexión con la API.",
    networkErrorDescription:
      "No se pudo conectar con el servidor. Inténtalo de nuevo.",
    badRequestDescription: "Los datos enviados no fueron aceptados.",
    unauthorizedDescription:
      "Necesitas volver a iniciar sesión para continuar.",
    forbiddenDescription:
      "No tienes permiso para actualizar esta cuenta.",
    notFoundDescription:
      "No se encontró el servicio de actualización de perfil.",
    conflictDescription:
      "Otra cuenta ya usa este correo o teléfono.",
    unprocessableEntityDescription:
      "Los datos enviados no superaron la validación.",
    rateLimitedDescription:
      "Se realizaron demasiados intentos. Inténtalo más tarde.",
    serverErrorDescription:
      "Se produjo un error del servidor. Inténtalo de nuevo en un momento.",
    validationErrorDescription:
      "Corrige los errores del formulario antes de guardar.",
    requiredMessage: "Este campo es obligatorio.",
    firstNameInvalidMessage:
      "El nombre debe tener al menos 2 caracteres.",
    lastNameInvalidMessage:
      "El apellido debe tener al menos 2 caracteres.",
    birthdayRequiredMessage:
      "Introduce tu fecha de nacimiento.",
    birthdayAgeMessage:
      "Debes tener al menos 18 años.",
    emailInvalidMessage:
      "Introduce una dirección de correo válida.",
    phoneInvalidMessage:
      "Introduce un número de teléfono válido.",
    typeUso: "Propietario del servicio",
    typeUcr: "Cliente",
    typeAdmin: "Administrador",
  },
  categories: {
    food_beverage: "Comida & Bebida",
    beauty_wellness: "Belleza & Bienestar",
    fitness_sports: "Fitness & Deportes",
    fashion_apparel: "Moda & Ropa",
    technology_electronics: "Tecnología & Electrónica",
    home_furniture: "Hogar & Muebles",
    health_pharmacy: "Salud & Farmacia",
    education_training: "Educación & Formación",
    entertainment_media: "Entretenimiento & Medios",
    travel_hospitality: "Viajes & Hostelería",
    haircut_styling: "Corte & Peinado",
    massage_therapy: "Masaje & Terapia",
    personal_training: "Entrenamiento personal",
    nail_care: "Cuidado de uñas",
    facial_treatment: "Tratamiento facial",
    dental_care: "Cuidado dental",
    consulting: "Consultoría",
    photo_session: "Sesión fotográfica",
  },
    calendar: {
    today: "Hoy",
    viewDay: "Día",
    viewWorkWeek: "Semana laboral",
    viewWeek: "Semana",
    viewMonth: "Mes",
    filter: "Filtrar",
    newReservation: "Nuevo",
    myServices: "Mis servicios",
    noServicesYet: "Sin servicios aún",
    noReservationsTitle: "Sin reservaciones aún",
    noReservationsDesc: "Las reservaciones aparecerán aquí cuando los clientes reserven sus servicios.",
    settingsTitle: "Configuración del calendario",
    settingsTimeFormat: "Formato de hora",
    timeFormat12h: "AM/PM",
    timeFormat24h: "24h",
  },
};
