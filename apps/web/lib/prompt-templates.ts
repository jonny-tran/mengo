export interface PromptTemplate {
  category: string;
  title: string;
  content: string; // short 1-3 line description
  prompt: string; // detailed markdown brief
}

// Consolidated list of 10 templates
export const ALL_PROMPT_TEMPLATES: PromptTemplate[] = [
  // Category: Mini-Apps & Tools
  {
    category: "Mini-Apps & Tools",
    title: "Basic To-Do List",
    content:
      "Build a basic To-Do List app. Users must be able to add new tasks and check them off as complete. We also need a way to filter or clear tasks that are already done.",
    prompt: `
**Project Brief: Basic To-Do List Application**

**1. Core Objective:**
Build a responsive, single-page "To-Do List" application. The primary goal is to allow users to manage their daily tasks efficiently. The app must be intuitive, fast, and persist all data on the user's local browser.

**2. Core Functionality (Epics):**
* **Task Management (CRUD):** Users must have full CRUD (Create, Read, Update, Delete) capabilities for tasks. This includes:
    * An input field at the top to add new tasks. Pressing 'Enter' should submit the new task.
    * A 'check' button (or checkbox) to mark tasks as complete. Completed tasks should be visually struck-through and perhaps grayed out.
    * A 'delete' button (\`X\` icon) visible on each task item to remove it from the list.
* **Data Persistence:** The list of tasks, including their text and 'completed' status, must not be lost when the user reloads the page. All application state must be saved to \`localStorage\` and rehydrated on page load.
* **Task Filtering:** A set of controls (buttons or tabs) must be present to filter the task list. The three required filter states are: "All" (default), "Active" (shows only incomplete tasks), and "Completed" (shows only completed tasks).

**3. Technical Constraints & Requirements:**
* **Framework:** Must be built using **React** (v18+).
* **Components:** Must use functional components and **Hooks** (e.g., \`useState\`, \`useEffect\`).
* **Styling:** Use **TailwindCSS** and **shadcn/ui** components (like \`Input\`, \`Button\`, \`Checkbox\`) where possible, consistent with the existing project setup.
* **Storage:** \`localStorage\` is the only storage mechanism required. No backend database or API calls are needed for this project.

**4. Bonus Features (If time allows):**
* Implement a "Clear Completed" button that removes all tasks currently marked as 'complete'.
* Display a live counter (e.g., "3 items left") that shows how many "Active" (incomplete) items are in the list.
`,
  },
  {
    category: "Mini-Apps & Tools",
    title: "Weather Dashboard (API)",
    content:
      "We need a simple weather dashboard. The user should enter a city name, and we must call a public API like OpenWeatherMap. It needs to display the current temperature, humidity, and a forecast for the next 3 days.",
    prompt: `
**Project Brief: Weather Dashboard (API Integration)**

**1. Core Objective:**
Develop a clean, responsive, single-page "Weather Dashboard". The application must fetch and display real-time weather data for a city that the user specifies. The main challenge is handling asynchronous API calls and presenting the data clearly.

**2. Core Functionality (Epics):**
* **City Input & Search:** The UI must feature a primary search bar (using \`Input\` component) and a \`Button\`. When the user types a city name and clicks "Search", the application must initiate the data fetching process.
* **API Integration (Data Fetching):** The application must integrate with a public weather API (e.g., OpenWeatherMap, WeatherAPI). All API calls must be handled client-side. The API key must be stored securely in a local environment variable (\`.env.local\`) and not exposed in the code.
* **Current Weather Display:** A dedicated component (e.g., \`Card\`) must display the *current* weather conditions for the searched city. This card must clearly show the city name, the current temperature (in Celsius), humidity percentage, and wind speed.
* **Forecast Display:** A separate section must display the weather forecast for the *next 3 days*. This should be presented as a list or horizontal row of smaller cards, each showing the date, the high/low temperature, and a simple weather icon (e.g., sunny, cloudy, rainy).
* **Loading & Error States:** The application must provide clear user feedback.
    * A loading state (e.g., \`Spinner\` component) must be displayed while the API call is in progress.
    * If the city is not found or the API request fails, a clear error message (e.g., \`Alert\` component) must be shown to the user.

**3. Technical Constraints & Requirements:**
* **Framework:** Must be built using **React** (v18+).
* **State Management:** Must use functional components and **React Hooks** (e.g., \`useState\`, \`useEffect\`).
* **Data Fetching:** Use the native \`fetch\` API or a lightweight library like \`axios\`.
* **Styling:** Must use **TailwindCSS** and components from the existing **shadcn/ui** library to maintain visual consistency.

**4. Bonus Features (If time allows):**
* Implement a "Use My Location" button that uses the browser's Geolocation API to fetch weather for the user's current coordinates.
* Save the last successfully searched city to \`localStorage\` and automatically fetch its weather when the user revisits the app.
`,
  },
  {
    category: "Mini-Apps & Tools",
    title: "Event Countdown Timer",
    content:
      "Create a countdown timer tool for an event. The user needs to input a future date and time. The app must constantly update and show the remaining days, hours, minutes, and seconds.",
    prompt: `
**Project Brief: Event Countdown Timer**

**1. Core Objective:**
Build a responsive, single-page React application that counts down to a specific future date and time set by the user. The tool's primary purpose is to create anticipation and provide a clear, real-time display of the time remaining.

**2. Core Functionality (Epics):**
* **Target Date Input:** The user must be able to set the target event date and time.
    * Use the \`shadcn/ui\` **Calendar** component for date selection.
    * Use a simple \`shadcn/ui\` **Input** component for time (e.g., format "HH:MM" in 24-hour time).
    * A "Start Countdown" \`Button\` will lock in this target time.
* **Live Countdown Display:** A large, prominent display area (e.g., inside a \`Card\`) must show the remaining time, broken down into four distinct units: **Days**, **Hours**, **Minutes**, and **Seconds**.
* **Timer Logic (The Engine):** This is the core logic of the app.
    * Must use React Hooks (\`useState\`, \`useEffect\`).
    * \`useEffect\` should initialize a \`setInterval\` that fires every 1000ms (1 second).
    * Inside the interval, calculate the time difference between \`new Date()\` and the stored target date, then update the state variables for days, hours, minutes, and seconds.

**3. Technical Constraints & Requirements:**
* **Framework:** React (Functional Components & Hooks only).
* **UI:** Must use components from \`shadcn/ui\` where applicable (Button, Input, Calendar, Card).
* **Logic:** All date/time calculations must be handled robustly in JavaScript (e.g., \`Date\` object math). The \`useEffect\` cleanup function must clear the interval (\`clearInterval\`) to prevent memory leaks.

**4. Acceptance Criteria (Edge Case):**
* When the countdown reaches zero (target date is in the past), the timer must stop (display "0 0 0 0") and show a "The Event is Live!" message.
`,
  },
  {
    category: "Mini-Apps & Tools",
    title: "Game: Rock, Paper, Scissors",
    content:
      "Program a 'Rock, Paper, Scissors' game using JavaScript. The user will click their choice. The computer will pick randomly, and the UI must display the winner (User, Computer, or Draw).",
    prompt: `
**Project Brief: Game: Rock, Paper, Scissors**

**1. Core Objective:**
Develop a simple, interactive "Rock, Paper, Scissors" game where a user can play against a computer-controlled opponent. The application should provide clear user feedback and track the score.

**2. Core Functionality (Epics):**
* **Player Input:** The UI must display three distinct \`Button\` components (ideally with icons or text) for "Rock", "Paper", and "Scissors". The user initiates a round by clicking one of these buttons.
* **Computer Logic:** As soon as the user makes a choice, the app must randomly generate the computer's choice (one of the three options). This should be an internal, non-visible choice until the result is revealed.
* **Game Rules Engine:** Implement a pure function (e.g., \`determineWinner(playerChoice, computerChoice)\`). This function contains the core game logic (Rock > Scissors, Scissors > Paper, Paper > Rock) and returns the result: "Player Wins", "Computer Wins", or "Draw".
* **State & Result Display:** The UI must update to show:
    * The player's selection.
    * The computer's (randomly generated) selection.
    * A clear message declaring the round's winner (e.g., "You Win!" or "Draw").

**3. Technical Constraints & Requirements:**
* **Framework:** React (Functional Components & Hooks).
* **State Management:** Use \`useState\` to manage all game state, including the player's choice, the computer's choice, and the round result.

**4. Bonus Features (Score Tracking):**
* Implement a "Scoreboard" component using \`useState\`.
* Track "Player Wins" vs. "Computer Wins" across multiple rounds.
* Add a "Reset Game" \`Button\` that sets the score back to 0-0.
`,
  },
  {
    category: "Mini-Apps & Tools",
    title: "Random Color Generator",
    content:
      "Build a random color generator. There should be a main button labeled 'Generate'. When clicked, the page's background color changes, and the new HEX code is displayed on screen.",
    prompt: `
**Project Brief: Random Color Generator Utility**

**1. Core Objective:**
Create a fast, single-page utility that generates random hexadecimal (HEX) color codes. The tool should allow users to discover new colors and easily copy the code.

**2. Core Functionality (Epics):**
* **Color Generation Logic:** Write a pure JavaScript function that generates a random, valid 6-digit HEX color code (e.g., \`#FF33AA\`). This function will be the core engine.
* **User Interface (UI):**
    * A large display area (e.g., a \`Card\` or a full-screen \`div\`) must have its \`background-color\` dynamically set to the currently active color.
    * A "Generate New Color" \`Button\` is the primary user interaction.
    * A text element (perhaps a \`Label\`) must clearly display the current HEX code (e.g., \`#FF33AA\`).
* **State Management:**
    * Use React \`useState\` to store the current color string.
    * The \`onClick\` handler for the "Generate" button must call the generator function and update this color state.
    * The UI elements (background and text) must be declaratively linked to this state.

**3. Technical Constraints & Requirements:**
* **Framework:** React (Functional Components & Hooks).
* **UI:** \`shadcn/ui\` components (Button, Card, Label).
* **Styling:** Use inline styles (e.g., \`style={{ backgroundColor: ... }}\`) or Tailwind utility classes for the dynamic background color.

**4. Bonus Features (Clipboard):**
* Add a "Copy Code" button next to the HEX code text.
* When clicked, use the \`navigator.clipboard.writeText()\` API to copy the current color code.
* Provide user feedback, perhaps by changing the button text to "Copied!" for 2 seconds (using a \`Tooltip\` or local state).
`,
  },

  // Category: Frontend & UI Projects
  {
    category: "Frontend & UI Projects",
    title: "Personal Blog Layout",
    content:
      "Design the layout for a personal blog. We need a homepage to list all post titles and a snippet. Clicking a title should lead to a separate 'detail page' showing the full post content (use Markdown).",
    prompt: `
**Project Brief: Personal Blog Layout (Frontend-only)**

**1. Core Objective:**
Build a responsive, multi-page blog *layout* using Next.js 16 (App Router). This project focuses purely on frontend routing and UI components. All data (blog posts) must be mocked in a local JSON or TypeScript file.

**2. Core Functionality (Epics):**
* **Homepage (List View):**
    * Path: \`/\`
    * Display a list of all blog posts, with the most recent first.
    * Each post entry should be a \`Card\` showing: **Title**, **Publication Date**, and a **Snippet** (first 50 words).
    * Clicking a post title must navigate the user to the \`Post Detail Page\`.
* **Post Detail Page (Single View):**
    * Path: \`/blog/[slug]\` (Dynamic Route).
    * This page must fetch the specific post data (from the mock file) based on the \`slug\` parameter.
    * It must display the full post content, including **Title** and **Full Body Content**.
* **Markdown Rendering:**
    * The 'Full Body Content' from the mock data should be written in Markdown.
    * You must use a library (like \`react-markdown\`) to parse and render this Markdown as proper HTML on the detail page.

**3. Technical Constraints & Requirements:**
* **Framework:** Next.js 16 (App Router).
* **Styling:** TailwindCSS and \`shadcn/ui\` components (Card, Badge).
* **Data:** No API. All data must be mocked in a local \`.ts\` or \`.json\` file.
`,
  },
  {
    category: "Frontend & UI Projects",
    title: "Portfolio Website (Single Page)",
    content:
      "Build a single-page personal portfolio website. It must be responsive and include three main sections: 'About Me', 'My Projects' (with images), and a 'Contact' form. Focus on a clean, modern UI.",
    prompt: `
**Project Brief: Single-Page Portfolio (Responsive)**

**1. Core Objective:**
Develop a clean, modern, and fully responsive single-page application (SPA) to serve as a personal portfolio. The entire site will exist on one page, with navigation links smoothly scrolling the user to different sections.

**2. Core Functionality (Epics):**
* **Navbar & Smooth Scroll:**
    * A sticky (fixed) top \`NavigationMenu\` with links: "About", "Projects", "Contact".
    * Clicking these links must smoothly scroll the viewport to the corresponding section, not trigger a page reload.
* **Hero/About Section:**
    * The first section ("About") should contain a brief biography, a professional \`Avatar\`, and links to GitHub/LinkedIn.
* **Projects Section:**
    * A responsive grid (e.g., 2-3 columns on desktop, 1 on mobile) displaying project \`Card\` components.
    * Each \`Card\` must include: Project Image, Title, brief description, and \`Button\` links to "GitHub Repo" and "Live Demo".
* **Contact Form (UI-Only):**
    * A simple, styled form (UI only, no backend logic).
    * Must include fields for "Name" (\`Input\`), "Email" (\`Input\`), and "Message" (\`Textarea\`).

**3. Technical Constraints & Requirements:**
* **Framework:** React (Next.js 16).
* **Styling:** TailwindCSS. Priority on **mobile-first responsiveness**.
* **UI:** \`shadcn/ui\` components must be used.
`,
  },
  {
    category: "Frontend & UI Projects",
    title: "UI Clone (Google Homepage)",
    content:
      "Clone the Google.com homepage. This is purely a UI/CSS challenge. Focus on accurately recreating the logo, the search bar, and the two main buttons ('Google Search', 'I'm Feeling Lucky').",
    prompt: `
**Project Brief: UI Clone Challenge: Google.com**

**1. Core Objective:**
Replicate the visual layout of the Google.com homepage. This is a pure HTML/CSS and layout challenge to test attention to detail and styling skills. No JavaScript functionality (search) is required.

**2. Core Functionality (Epics):**
* **Main Layout:** The entire page content (logo, search, buttons) must be vertically and horizontally centered in the viewport.
* **Logo Component:**
    * Place the Google logo (as an \`img\` or \`svg\`) in the main content area.
* **Search Bar Component:**
    * This is the most complex component. Recreate the search bar using an \`Input\`.
    * It must be styled with rounded corners and contain icons (a search icon on the left, and mic/camera icons on the right) *inside* the input field.
* **Button Group:**
    * Create the two buttons ("Google Search", "I'm Feeling Lucky") below the search bar.
    * Use the \`shadcn/ui\` \`Button\` component and style them to match Google's appearance (e.g., background color, padding).
* **Header/Footer Links:**
    * Replicate the simple text links in the top-right (e.g., "Gmail", "Images") and bottom (e.g., "About", "Settings").

**3. Technical Constraints & Requirements:**
* **Framework:** React (Next.js 16).
* **Styling:** **TailwindCSS**. This project is 90% styling.
* **Functionality:** None. This is a visual-only task.
`,
  },

  // Category: Simple Fullstack (with localStorage)
  {
    category: "Simple Fullstack (with localStorage)",
    title: "Note-Taking App (localStorage)",
    content:
      "Build a simple Note-taking app using React. Users need full CRUD: create, read, edit, and delete notes. All data must persist on the browser, so use \`localStorage\` as the database.",
    prompt: `
**Project Brief: Note-Taking App (với localStorage)**

**1. Core Objective:**
Build a simple note-taking app (similar to Google Keep or Apple Notes) where users can create, view, edit, and delete notes. All data must persist on the user's browser using \`localStorage\`.

**2. Core Functionality (Epics):**
* **Note Creation:**
    * A form (perhaps in a \`Dialog\` or a \`Card\`) with an \`Input\` for "Title" and a \`Textarea\` for "Content".
    * A "Save Note" \`Button\` adds the new note object to the list.
* **Note Display (Grid):**
    * All saved notes should be rendered on the main page in a responsive grid (using \`Card\` components).
    * Each \`Card\` should display the note's Title and a preview of its content.
* **CRUD Operations:**
    * **Update:** Clicking a note \`Card\` should open a \`Dialog\` (modal) pre-filled with that note's data, allowing the user to edit and save changes.
    * **Delete:** Each note \`Card\` must have a "Delete" \`Button\` (perhaps an icon) to remove it.
* **Data Persistence:**
    * The entire array of note objects must be saved to \`localStorage\` every time a note is created, updated, or deleted.
    * On app load, \`useEffect\` must be used to read this array from \`localStorage\` and hydrate the React state.

**3. Technical Constraints & Requirements:**
* **Framework:** React (Hooks: \`useState\`, \`useEffect\`).
* **Storage:** \`localStorage\` is the only database.
* **UI:** \`shadcn/ui\` (Card, Button, Input, Textarea, Dialog).
`,
  },
  {
    category: "Simple Fullstack (with localStorage)",
    title: "E-commerce Cart (Simulation)",
    content:
      "Develop a simple e-commerce product page. It should show a grid of products. Users must be able to click 'Add to Cart', and a separate cart module should update. This is just a simulation; no real payment.",
    prompt: `
**Project Brief: E-commerce Cart (Frontend Simulation)**

**1. Core Objective:**
Simulate the "Add to Cart" functionality of an e-commerce website. This is a frontend-only project focusing on state management. No backend, database, or payment processing is needed.

**2. Core Functionality (Epics):**
* **Product Grid Display:**
    * Create a page that displays a grid of mock products (using \`Card\`).
    * Mock data (from a JSON file) should include \`id\`, \`name\`, \`price\`, and \`imageUrl\`.
    * Each product \`Card\` must have an "Add to Cart" \`Button\`.
* **Global Cart State:**
    * Implement a global state solution (e.g., **React Context** or Zustand) to manage the shopping cart.
    * The cart state should be an array of objects (e.g., \`{ productId, quantity }\`).
* **"Add to Cart" Logic:**
    * Clicking "Add to Cart" on a product card must update the global cart state. If the item is already in the cart, increment its quantity; otherwise, add it.
* **Cart Module/Sidebar:**
    * Create a separate component (e.g., a \`Sheet\` sidebar or a \`Popover\`) triggered by a "Cart" icon.
    * This module must read from the global state and display all items in the cart, their quantities, and a "Total Price".

**3. Technical Constraints & Requirements:**
* **Framework:** React (Hooks: \`useState\`, \`useContext\`).
* **State Management:** React Context (or similar) is required for shared state.
* **UI:** \`shadcn/ui\` (Card, Button, Sheet or Popover).
`,
  },
];

export default ALL_PROMPT_TEMPLATES;


