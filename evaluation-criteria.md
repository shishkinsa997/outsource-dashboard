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

## Deploy [Outsource Dashboard](https://shishkinsa997.github.io/outsource-dashboard/)

## Features

- [] Add, edit, and delete employees.
- [x] Add and delete projects.
- [x] Assign employees to projects with capacity and fit coefficients.
- [] Track vacation days with a calendar popup.
- [] View project and employee details in popups.
- [] Sort and filter table columns.
- [x] Switch between monthly snapshots.
- [] Copy data from one month to another.
- [x] Save all data in localStorage automatically.
- [x] Responsive sidebar and modal UI.

#### All detailed features you can see in **[Evaluation Criteria](evaluation-criteria.md)**

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- localStorage
- GitHub Pages

## How to Run

### Local setup
1. Clone the repository:
   ```bash
   git clone https://github.com/shishkinsa997/outsource-dashboard
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run developer mode:
   ```bash
   npm run dev
   ```

## Project Structure

```bash
.
├── index.html
├── src
|  ├── data
|  |  └── appData.json
|  ├── js
|  |  ├── app.js
|  |  ├── modules
|  |  |  ├── tables.js
|  |  |  └── ui.js
|  |  ├── services
|  |  |  ├── metricsService.js
|  |  |  └── storageService.js
|  |  ├── state
|  |  |  └── appState.js
|  |  └── utils
|  |     ├── date.js
|  |     └── format.js
|  ├── main.js
|  └── style.css
└── public
```

## Important Notes

- The app does not use any framework or library.
- All data is stored in `localStorage` under the `monthlyData` key.
- Each month has an independent snapshot of employees and projects.
- Vacation days are stored separately for every month.
- If no saved data exists, the app initializes with sample data.
