## Evaluation Criteria 📊

This section provides a breakdown of evaluation points. **Points are awarded for working functionality only** - we evaluate whether features work correctly, not how the code is structured or styled.

### 1. Data Persistence & Monthly Snapshots (25 points)

- [x] **5 pts** - Data persists in localStorage and loads on page refresh
- [x] **5 pts** - Each month stores independent data (changes in one month don't affect others)
- [x] **5 pts** - Month/Year selectors switch between different months' data correctly
- [ ] **5 pts** - Seed Data feature copies data from one month to another
- [ ] **5 pts** - Vacation days are cleared when copying data to new month

### 2. Employee CRUD Operations (15 points)

- [ ] **5 pts** - Add Employee form creates new employees with all fields
- [ ] **5 pts** - Delete Employee button removes employee and all their assignments
- [ ] **5 pts** - Inline editing works for Position (dropdown) and Salary (number input)

### 3. Project CRUD Operations (10 points)

- [ ] **5 pts** - Add Project form creates new projects with all fields
- [x] **5 pts** - Delete Project button removes project and unassigns all employees

### 4. Assignment Management (20 points)

- [ ] **8 pts** - Assign button opens popup and successfully assigns employee to project with capacity and fit
- [ ] **7 pts** - Unassign confirmation popup shows financial details and successfully unassigns
- [ ] **5 pts** - Edit assignment popup successfully updates capacity and fit values

### 5. Financial Calculations (30 points)

- [x] **8 pts** - Effective capacity calculated correctly: capacity × fit × vacation coefficient
- [ ] **7 pts** - Revenue calculations correct (per employee and per project)
- [ ] **7 pts** - Cost calculations correct (minimum 0.5 × salary, bench payments)
- [ ] **8 pts** - Profit/Income values correct and color-coded (green/red)

### 6. Forms & Validation (15 points)

- [ ] **5 pts** - Employee form validates all fields (name, surname, DOB 18+, position, salary)
- [ ] **5 pts** - Project form validates all fields (project name, company, budget, capacity)
- [ ] **5 pts** - Submit buttons disabled until all fields valid, error messages appear/disappear correctly

### 7. Tables Display (15 points)

- [ ] **4 pts** - Projects table displays all data correctly (capacity as "used/total", income color-coded)
- [ ] **4 pts** - Employees table displays all data correctly (age calculated, assignments count shown)
- [ ] **4 pts** - Total Estimated Income displayed below projects table with correct calculation
- [ ] **3 pts** - Assign button disabled when employee at max capacity (1.5)

### 8. Sorting (10 points)

- [ ] **5 pts** - Clicking sort icons sorts columns ascending/descending (both tables)
- [ ] **5 pts** - Sort icons update to show current state (↑ ↓ ⇅)

### 9. Filtering (10 points)

- [ ] **5 pts** - Filter popups work for text columns and Position dropdown
- [ ] **3 pts** - Filter chips display active filters and can be removed individually
- [ ] **2 pts** - "Clear Filters" appears when 2+ filters active

### 10. Details Popups (15 points)

- [ ] **5 pts** - "Show Employees" popup displays all employees on project with correct calculations
- [ ] **5 pts** - "Show Assignments" popup displays all employee assignments with correct calculations
- [ ] **3 pts** - Popups have close button and click-outside-to-close functionality
- [ ] **2 pts** - Empty state message shown when no data

### 11. Assignment Popup Positioning (5 points)

- [ ] **3 pts** - Assignment popup positioned near button and stays within viewport
- [ ] **2 pts** - Popup repositions on scroll and resize

### 12. Availability Calendar (20 points)

- [ ] **5 pts** - Calendar displays correct month/year from current viewing period
- [ ] **5 pts** - Weekends visually distinguished, today highlighted (if current month)
- [ ] **5 pts** - Click days to select vacations, working days count updates in real-time
- [ ] **5 pts** - Vacation days formatted correctly ("DD.MM" or "DD.MM-DD.MM" ranges)

### 13. Navigation & UI (10 points)

- [x] **3 pts** - Projects/Employees tabs switch content correctly
- [x] **3 pts** - Sidebar collapses/expands with toggle button
- [ ] **4 pts** - "See at Projects/Employees" links navigate and apply filters

---

## Total Points: **200 points**

### Grading Scale:

- **180-200 pts (90%+)**: Excellent - All features working perfectly
- **160-179 pts (80-89%)**: Very Good - All major features working
- **140-159 pts (70-79%)**: Good - Most features working
- **120-139 pts (60-69%)**: Satisfactory - Core features working
- **Below 120 pts (<60%)**: Needs Improvement - Missing significant functionality
