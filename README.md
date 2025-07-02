# Eveladge - AI-Powered Online Proctoring Platform

Eveladge is a modern, React-based online proctoring platform that combines AI-powered monitoring with a user-friendly interface. This project includes both frontend (React + TypeScript + Vite) and backend (Python Flask) components.

## Features

- **AI-Powered Proctoring**: Advanced eye tracking and behavioral analysis
- **Real-time Monitoring**: Live exam supervision with intelligent alerts
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Responsive Design**: Works seamlessly across different devices
- **Secure Testing Environment**: Comprehensive security measures

## Frontend (React + TypeScript + Vite)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Backend (Python Flask)

The backend includes proctoring functionality with:
- Eye tracking monitoring
- System monitoring
- Real-time snapshot capture
- Flask-based API endpoints

## Getting Started

### Quick Setup for Code Execution Testing

1. **Install Python dependencies:**
```bash
pip install flask psutil
```

2. **Start the code execution server:**
```bash
python test_app.py
```
This starts the server on http://localhost:5001

3. **Install frontend dependencies:**
```bash
npm install
```

4. **Start the frontend:**
```bash
npm run dev
```
This starts the frontend on http://localhost:5173

5. **Test the system:**
   - Navigate to http://localhost:5173/exam
   - Select a coding problem (Two Sum, Binary Search, etc.)
   - Write your solution in JavaScript or Python
   - Click "Run Sample" to test with sample input
   - Click "Submit" to run all test cases

### Backend Setup (with Proctoring - requires additional setup)
```bash
pip install -r requirements.txt
python app.py
```

### Testing Code Execution

Run the test script to verify everything works:
```bash
python test_execution.py
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
