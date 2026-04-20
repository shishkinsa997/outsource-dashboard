# Employee & Project Dashboard 📋

A vanilla JavaScript application for managing employees, projects, assignments, and monthly planning.

## Overview

Employee & Project Dashboard is a frontend management app for tracking:
- employees and their salaries,
- projects and budgets,
- assignments with capacity and fit values,
- vacation days per month,
- financial calculations and profit estimates.

The app uses monthly snapshots, so each month has its own independent data in localStorage.

## Features

- Add, edit, and delete employees.
- Add and delete projects.
- Assign employees to projects with capacity and fit coefficients.
- Track vacation days with a calendar popup.
- View project and employee details in popups.
- Sort and filter table columns.
- Switch between monthly snapshots.
- Copy data from one month to another.
- Save all data in localStorage automatically.
- Responsive sidebar and modal UI.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- localStorage
- Tailwind
- Lucide
- GitHub Pages

## How to Run

### Local setup
1. Clone the repository:
   ```bash
   git clone https://github.com/shishkinsa997/outsource-dashboard
   ```
2. Open `index.html` in your browser.

### If using a local server
You can also run the project with any static server, for example:
```bash
npx serve
```

## Project Structure

```bash
.
├── index.html
├── styles.css
├── app.js
└── README.md
```

## Important Notes

- The app does not use any framework or library.
- All data is stored in `localStorage` under the `monthlyData` key.
- Each month has an independent snapshot of employees and projects.
- Vacation days are stored separately for every month.
- If no saved data exists, the app initializes with sample data.
