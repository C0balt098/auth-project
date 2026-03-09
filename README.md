# Auth Project

A simple project to learn authentication with automatic token refresh.

---

## What is this?

This is a demo project that shows how login, tokens, and automatic token refresh work in a real application.

---

## Features

- Login with username/password
- Token storage
- Automatic token addition to requests
- Automatic token refresh when expired
- Protected page after login

---

## How to Install

### Option 1: Just open files
1. Download all files to one folder
2. Open `index.html` in your browser

### Option 2: Via Git
git clone https://github.com/C0balt098/auth-project.git
cd auth-project

Then open `index.html` in your browser.

---

 Project Structure

Root Folder
The root folder contains TypeScript source files, HTML files, a styles folder, and a compiled JavaScript folder.

index.html - Login Page
This is the first page users see. It contains a form with username and password input fields. The page has a "Sign In" button and hints with test credentials for login. The form is connected to the login.js JavaScript file, which handles the login process.

dashboard.html - Main Page After Login
This is a protected page, accessible only to authenticated users. It displays user information, their access and refresh tokens, and three buttons for testing the API: getting user data, getting products list, and testing expired tokens. Request results are shown in a special block at the bottom of the page.

auth.ts - Authentication Service
This file contains the AuthService class, which handles all login and logout logic. It sends login requests to the server with username and password, receives and saves tokens to localStorage, checks user authentication status, and handles logout. The file exports the AuthService class and an auth instance for use in other files.

api.ts - API Service
This file contains the ApiService class, which wraps the standard fetch and adds an authorization token to every request. If a request returns a 401 error (token expired), the service automatically sends a refresh request with the refresh token, receives a new token pair, saves them, and retries the original request. It also implements a request queue so that when multiple simultaneous requests occur, token refresh happens only once.

dashboard.ts - Dashboard Logic
This file manages everything that happens on the dashboard.html page. It checks if the user is authenticated (if not, redirects to login page), displays user information and their tokens, and handles clicks on the three test buttons by sending corresponding requests through api.ts and showing the results.

login.ts - Login Handler
This file contains the login form logic that was moved from auth.ts. It gets username and password from input fields, calls the auth.login() method, and displays success or error messages. It also handles button states during login and redirects to dashboard on success.

js folder - Compiled JavaScript Files
After running tsc, all TypeScript files are compiled to JavaScript in this folder:

js/auth.js - compiled authentication service

js/api.js - compiled API service

js/dashboard.js - compiled dashboard logic

js/login.js - compiled login handler

styles folder with main.css file
This folder contains all project styles. The main.css file has two main sections: styles for the login page (form, input fields, button, error messages) and styles for the main page after login (user info, token blocks, buttons, and results area).

tsconfig.json
TypeScript configuration file that sets up strict mode and tells the compiler to output JavaScript files to the js folder.
---

## How Files Are Connected

- index.html only uses auth.js because the login page doesn't need API requests.
- dashboard.html includes all three JavaScript files: first auth.js (to check authentication and get tokens), then api.js (to make requests with automatic token refresh), and finally dashboard.js (which manages the page logic).
- auth.js creates a global auth object that is available in all other files. Through this object, you can check if a user is authenticated, get tokens, or logout.
- api.js creates a global api object and uses the auth object from auth.js to get tokens before each request and to save new tokens after refresh.

---

## Data Flow

When a user enters their login and password on index.html, the data is sent to auth.js, which sends a request to the server. The received tokens are saved to localStorage. The user is then redirected to dashboard.html.

On dashboard.html, dashboard.js checks through auth.js for the presence of tokens and displays the information. When the user clicks the "Get User Data" button, dashboard.js calls the api.getCurrentUser() method from api.js. Api.js takes the token from auth.js, adds it to the request header, and sends it to the server.

If the token has expired, the server returns 401. Api.js detects this, gets the refresh token through auth.js, sends a refresh request, receives new tokens, saves them through auth.js, and automatically retries the original request with the new token. The user doesn't notice this process - they just see a successful result.

---

## How to Use

### 1. Login
- Open index.html
- Use test credentials:
  - Username: emilys
  - Password: emilyspass

### 2. Check what's inside
After login you'll see:
- User information
- Tokens (access and refresh)
- Buttons for test requests

### 3. Test features
- Get User Data - get current user info
- Get Products - get products list
- Test Expired Token - check token refresh

---

## How It Works

1. User logs in → gets tokens
2. Tokens saved in localStorage
3. Each request adds token to header
4. If token expired → automatically refresh
5. Retry request with new token

---

## API Endpoints Used

- https://dummyjson.com/auth/login - login
- https://dummyjson.com/auth/me - user data
- https://dummyjson.com/auth/refresh - refresh token
- https://dummyjson.com/products - products list

---

## Common Errors

### "Failed to fetch"
- Check your internet connection
- Open console (F12) to see details

### Can't login
- Check if you entered correct username/password
- Try emilys / emilyspass

---

## Questions?

If something doesn't work:
1. Open console (F12)
2. Check errors
3. Try refreshing the page

---

## Support

If this project helps you - give it a star on GitHub!
