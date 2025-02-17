# LaTeX Flashcard Creator

A React-based flashcard application that allows users to create, edit, and review flashcards with LaTeX-rendered mathematical notation using **KaTeX**. The app supports **macros**, **tagging**, **filters**, and an interactive **flashcard review mode**.

## To Do:
- [x] Create skeleton of the app
- [x] Add flashcard mode
- [ ] Polish app appearance (UI improvements, better styling)
- [ ] Add more missing LaTeX functionalities in KaTeX

## Usage Guide and Features

### Creating a Flashcard
1. Enter the front-side content in the left text box.  
2. Enter the back-side content in the right text box.  
3. Use LaTeX notation for mathematical expressions (e.g., `\frac{a}{b}`).  
4. Click **Submit Flashcard** to save it.

### Editing a Flashcard
1. Click **Edit** on any existing flashcard.  
2. Modify the content in the input fields.  
3. Click **Update Flashcard** to save changes.

### Tagging and Filtering
- Click **Tag** to assign categories to flashcards.  
- Use the **Filter by Tag** dropdown to view only specific categories in both the flashcard list and flashcard mode.

### Flashcard Review Mode
1. Click **View Flashcards** to enter review mode.  
2. Use **arrow keys** or **buttons** to navigate through flashcards.  
3. Press **spacebar** or **click** the flashcard to flip it.  
4. Click **Shuffle** to randomize flashcards.

### Importing & Exporting
- Click **Export** to download your flashcards as a JSON file.  
- Click **Import**, select a `.json` file, and load flashcards into the app.

## Installation

### Prerequisites

- Node.js (>=16.0)
- npm or yarn

### Setup

```bash
git clone https://github.com/nathancyc/latexcards.git
cd latexcards

npm install
npm start
```

