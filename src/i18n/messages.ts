export type Locale = "es" | "gl" | "en";

export const messages = {
  es: {
    appTitle: "BACKLOG PIXEL",
    welcomeSubtitle: "Tu gestor de ocio",
    welcomeNameQuestion: "¿Cómo te llamas, Jugador 1?",
    welcomePlaceholder: "Escribe tu nombre...",
    welcomeStart: "Comenzar Aventura",
    loading: "Cargando...",
    onboardingContinue: "Presiona ENTER para continuar",
    configureCategories: "Configura tus categorías de ocio",
    newCategory: "Nueva categoría",
    add: "Añadir",
    cancel: "Cancelar",
    dashboardTitle: "ORGANIZADOR DE OCIO",
    categories: "Categorías",
  },
  gl: {
    appTitle: "BACKLOG PIXEL",
    welcomeSubtitle: "O teu xestor de lecer",
    welcomeNameQuestion: "Como te chamas, Xogador 1?",
    welcomePlaceholder: "Escribe o teu nome...",
    welcomeStart: "Comezar Aventura",
    loading: "Cargando...",
    onboardingContinue: "Preme ENTER para continuar",
    configureCategories: "Configura as túas categorías de lecer",
    newCategory: "Nova categoría",
    add: "Engadir",
    cancel: "Cancelar",
    dashboardTitle: "ORGANIZADOR DE LECER",
    categories: "Categorías",
  },
  en: {
    appTitle: "BACKLOG PIXEL",
    welcomeSubtitle: "Your entertainment organizer",
    welcomeNameQuestion: "What's your name, Player 1?",
    welcomePlaceholder: "Type your name...",
    welcomeStart: "Start Adventure",
    loading: "Loading...",
    onboardingContinue: "Press ENTER to continue",
    configureCategories: "Set up your entertainment categories",
    newCategory: "New category",
    add: "Add",
    cancel: "Cancel",
    dashboardTitle: "ENTERTAINMENT ORGANIZER",
    categories: "Categories",
  },
} as const;

export type TranslationKey = keyof (typeof messages)["es"];

