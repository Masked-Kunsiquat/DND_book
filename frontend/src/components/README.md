## Example Components directory Layout
```
components/
│── ui/                # Generic, reusable UI elements (buttons, inputs, modals, etc.)
│   ├── Button.jsx
│   ├── InputField.jsx
│   ├── Modal.jsx
│   ├── Card.jsx
│   ├── LoadingSpinner.jsx
│   ├── Form.jsx
│   ├── ...
│
│── layout/            # Page layout components (headers, footers, sidebars, navbars)
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── Sidebar.jsx
│   ├── NavBar.jsx
│
│── form/              # Form-specific inputs and validation components
│   ├── PasswordField.jsx
│   ├── SelectField.jsx
│   ├── Checkbox.jsx
│   ├── RadioGroup.jsx
│   ├── FormError.jsx
│
│── shared/            # High-level components shared across multiple pages
│   ├── AuthProvider.jsx
│   ├── ProtectedRoute.jsx
│   ├── ThemeToggle.jsx
│
│── pages/             # Page-specific components (only used inside one page)
│   ├── LoginForm.jsx
│   ├── RegisterForm.jsx
│   ├── DashboardStats.jsx
│
```