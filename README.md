# Patient Registration System

A frontend-only patient registration application built with React, TypeScript, and Pglite for local data storage. This application allows users to register new patients, manage patient records, and search through patient data using SQL queries.

## Features

- Register new patients with detailed information
- View and manage patient records
- Search patients using SQL queries
- Edit and delete patient records
- Data persistence across page refreshes
- Support for multiple browser tabs
- Modern, responsive UI using Material-UI

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd patient-registration-system
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Registering a New Patient

1. Fill out the patient registration form with the required information:

   - First Name
   - Last Name
   - Date of Birth
   - Gender
   - Email (optional)
   - Phone (optional)
   - Address (optional)

2. Click the "Register Patient" button to save the patient record.

### Managing Patient Records

- View all registered patients in the table below the registration form
- Use the search bar to filter patients by name, email, or phone number
- Click the edit icon to modify patient information
- Click the delete icon to remove a patient record

### Data Persistence

The application uses Pglite for local data storage, which means:

- Patient data persists across page refreshes
- Data is stored in the browser's IndexedDB
- Multiple browser tabs can access the same data

## Development

### Project Structure

```
src/
  ├── components/
  │   ├── PatientForm.tsx    # Patient registration form
  │   └── PatientList.tsx    # Patient records table
  ├── services/
  │   └── database.ts        # Pglite database operations
  ├── App.tsx               # Main application component
  └── main.tsx             # Application entry point
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
