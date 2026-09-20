import type { Lang } from "../shared/selection";

const en = {
  title: "SUPSI DTI timetable",
  autumn: "Autumn semester",
  spring: "Spring semester",
  language: "Language",
  classLabel: "Class",
  choose: "Choose your class",
  weekSpan: "{from} to {to}",
  families: {
    informatica: "Informatica",
    data: "Data Science",
    elettronica: "Elettronica",
    gestionale: "Ingegneria gestionale",
    meccanica: "Ingegneria meccanica",
    mse: "Master MSE",
    other: "Electives and more",
  },
  step2: "Remove what you do not follow",
  step2Help:
    "Everything starts in your calendar. Tap a lesson to take it out, tap again to put it back.",
  splitHelp: "Two groups run at the same time. Tap the one you are not in to remove it.",
  addedHelp:
    "Nothing from this class is in your calendar yet. Tap the lessons you follow to add them.",
  groups: "{n} groups",
  jumpTo: "Jump to a day",
  courses: "Your courses",
  coursesButton: "Courses",
  countOf: "{n} of {total}",
  oneCourse: "1 course",
  coursesCount: "{n} courses",
  addClass: "Add courses from another class",
  removeClass: "Remove this class",
  otherClass: "Another class",
  step3: "Add to your calendar",
  addTo: "Add to {app}",
  apps: { apple: "Apple Calendar", google: "Google Calendar", outlook: "Outlook" },
  notUsing: "Not using {app}?",
  copy: "Copy link",
  copied: "Copied",
  close: "Close",
  linkLabel: "Subscription link",
  academic: "Also add holidays, breaks and exam sessions",
  afterHint:
    "Once added, it updates by itself whenever SUPSI changes the timetable. There is nothing else to do.",
  guideSummary: "The button did nothing? Add it by hand",
  showHow: "Show me how",
  guideIntro: "Copy the link, then paste it where your calendar app asks for a calendar address:",
  guideApple: {
    title: "Apple Calendar",
    sections: [
      {
        where: "iPhone or iPad",
        steps: [
          "Open Settings, then Calendar (under Apps on recent iPhones).",
          "Tap Accounts, then Add Account, then Other.",
          "Tap Add Subscribed Calendar, paste the link and tap Next, then Save.",
        ],
      },
      {
        where: "Mac",
        steps: [
          "In Calendar, open the File menu and choose New Calendar Subscription.",
          "Paste the link, press Subscribe, then OK.",
        ],
      },
    ],
  },
  guideGoogle: {
    title: "Google Calendar",
    sections: [
      {
        where:
          "On a computer. The phone app cannot add links, but the calendar shows up on your phone afterwards.",
        steps: [
          "Open calendar.google.com.",
          'Next to "Other calendars" press the plus sign and choose "From URL".',
          'Paste the link and press "Add calendar".',
        ],
      },
    ],
  },
  guideOutlook: {
    title: "Outlook",
    sections: [
      {
        where: "On the web, with your SUPSI account.",
        steps: [
          "Open outlook.office.com and go to the calendar.",
          'Press "Add calendar", then "Subscribe from web".',
          'Paste the link, give it a name and press "Import".',
        ],
      },
    ],
  },
  nothingSelected: "Keep at least one course to build your calendar.",
  emptyState: "Pick your class to see its timetable.",
  noLessons: "SUPSI has not published lessons for this class yet.",
  loadError: "Couldn't load the timetable. Reload the page, or try again later.",
  unofficial: "Unofficial student project, not affiliated with SUPSI.",
  official: "Official timetable",
  updated: "SUPSI last updated the timetable on {date}.",
  sourceCode: "Source code",
  madeBy: "Made by Azo",
  lecture: "lecture",
  exercises: "exercises",
  lab: "lab",
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

export type Strings = typeof en;

/** The manual steps for one calendar app, one section per device kind. */
export type Guide = Strings["guideApple"];

const it: Strings = {
  title: "Orario SUPSI DTI",
  autumn: "Semestre autunnale",
  spring: "Semestre primaverile",
  language: "Lingua",
  classLabel: "Classe",
  choose: "Scegli la tua classe",
  weekSpan: "dal {from} al {to}",
  families: {
    informatica: "Informatica",
    data: "Data Science",
    elettronica: "Elettronica",
    gestionale: "Ingegneria gestionale",
    meccanica: "Ingegneria meccanica",
    mse: "Master MSE",
    other: "Approfondimenti e altro",
  },
  step2: "Togli quello che non segui",
  step2Help:
    "All'inizio è tutto nel calendario. Tocca una lezione per toglierla, tocca di nuovo per rimetterla.",
  splitHelp: "Due gruppi si svolgono alla stessa ora. Tocca quello in cui non sei per toglierlo.",
  addedHelp:
    "Di questa classe non c'è ancora nulla nel calendario. Tocca le lezioni che segui per aggiungerle.",
  groups: "{n} gruppi",
  jumpTo: "Vai a un giorno",
  courses: "I tuoi corsi",
  coursesButton: "Corsi",
  countOf: "{n} di {total}",
  oneCourse: "1 corso",
  coursesCount: "{n} corsi",
  addClass: "Aggiungi corsi di un'altra classe",
  removeClass: "Togli questa classe",
  otherClass: "Altra classe",
  step3: "Aggiungi al tuo calendario",
  addTo: "Aggiungi a {app}",
  apps: { apple: "Calendario Apple", google: "Google Calendar", outlook: "Outlook" },
  notUsing: "Non usi {app}?",
  copy: "Copia link",
  copied: "Copiato",
  close: "Chiudi",
  linkLabel: "Link di iscrizione",
  academic: "Aggiungi anche vacanze, pause e sessioni d'esame",
  afterHint:
    "Una volta aggiunto, si aggiorna da solo ogni volta che SUPSI cambia l'orario. Non c'è altro da fare.",
  guideSummary: "Il pulsante non ha fatto nulla? Aggiungilo a mano",
  showHow: "Mostrami come",
  guideIntro:
    "Copia il link e incollalo dove la tua app calendario chiede l'indirizzo di un calendario:",
  guideApple: {
    title: "Calendario Apple",
    sections: [
      {
        where: "iPhone o iPad",
        steps: [
          "Apri Impostazioni, poi Calendario (sotto App sugli iPhone recenti).",
          "Tocca Account, poi Aggiungi account, poi Altro.",
          "Tocca Aggiungi calendario in abbonamento, incolla il link e tocca Avanti, poi Salva.",
        ],
      },
      {
        where: "Mac",
        steps: [
          "In Calendario apri il menu File e scegli Nuovo abbonamento a calendario.",
          "Incolla il link, premi Iscriviti, poi OK.",
        ],
      },
    ],
  },
  guideGoogle: {
    title: "Google Calendar",
    sections: [
      {
        where:
          "Da computer. L'app del telefono non può aggiungere link, ma dopo il calendario compare anche sul telefono.",
        steps: [
          "Apri calendar.google.com.",
          'Accanto ad "Altri calendari" premi il più e scegli "Da URL".',
          'Incolla il link e premi "Aggiungi calendario".',
        ],
      },
    ],
  },
  guideOutlook: {
    title: "Outlook",
    sections: [
      {
        where: "Sul web, con il tuo account SUPSI.",
        steps: [
          "Apri outlook.office.com e vai al calendario.",
          'Premi "Aggiungi calendario", poi "Sottoscrivi dal Web".',
          'Incolla il link, dagli un nome e premi "Importa".',
        ],
      },
    ],
  },
  nothingSelected: "Tieni almeno un corso per creare il calendario.",
  emptyState: "Scegli la tua classe per vedere l'orario.",
  noLessons: "SUPSI non ha ancora pubblicato lezioni per questa classe.",
  loadError: "Impossibile caricare l'orario. Ricarica la pagina o riprova più tardi.",
  unofficial: "Progetto studentesco non ufficiale, non affiliato a SUPSI.",
  official: "Orario ufficiale",
  updated: "SUPSI ha aggiornato l'orario il {date}.",
  sourceCode: "Codice sorgente",
  madeBy: "Realizzato da Azo",
  lecture: "lezione",
  exercises: "esercitazione",
  lab: "laboratorio",
  days: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
  months: ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"],
};

export const STRINGS: Record<Lang, Strings> = { en, it };

/** Fills {name} placeholders in a string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}
