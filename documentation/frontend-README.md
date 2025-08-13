# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

# Fixing 404 Errors on Refresh or Direct Navigation

If you encounter a 404 error when refreshing or directly navigating to a route (e.g., `/pets/PET-0003`), you need to configure your server to serve `index.html` for all routes. This is required for client-side routing to work with Create React App.

## For Development (npm start)
- No changes needed. The built-in dev server handles this automatically.

## For Production (npm run build)
- If you deploy to **Netlify**, add a `_redirects` file to your `public` folder with this content:
  ```
  /*    /index.html   200
  ```
- If you deploy to **Vercel**, **Firebase Hosting**, or another provider, check their documentation for SPA (Single Page App) routing support.
- If you use **Apache**, add this to your `.htaccess`:
  ```
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
  ```
- If you use **Nginx**, add this to your config:
  ```
  location / {
    try_files $uri /index.html;
  }
  ```

## Summary
- Always serve `index.html` for unknown routes so the React app can handle routing.
- This is required for all client-side routers, including TanStack Router and React Router.
