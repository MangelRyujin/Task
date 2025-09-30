# Vite & HeroUI Template with Express Server

This is a template for creating applications using **Vite**, **HeroUI (v2)**, and a **Node/Express backend**.

[Try it on CodeSandbox](https://githubbox.com/heroui-inc/vite-template)

## Technologies Used

- [Vite](https://vitejs.dev/guide/)
- [HeroUI](https://heroui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Tailwind Variants](https://tailwind-variants.org)
- [TypeScript](https://www.typescriptlang.org)
- [Framer Motion](https://www.framer.com/motion)
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)

## Environment Variables

This project requires a few environment variables for Google API and Cloudflare AI integration. Create a `.env` or `.env.local` file in the root folder with the following structure:

```env
# Google API
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_API_KEY=your_google_api_key

# Cloudflare AI
CLOUDFLARE_API_KEY=your_cloudflare_api_key
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
```


## How to Use
### 1. Clone the project

You can use npm, yarn, pnpm, or bun. Example using npm:
```
bashgit clone https://github.com/heroui-inc/vite-template.git
You can use npm, yarn, pnpm, or bun. Example using npm:
```
cd vite-template


### 2. Install dependencies

```
npm install
```

### 3. Start the frontend (Vite)
```
npm run dev
```

This will start the Vite development server at http://localhost:5173 (default port).

### 4. Start the backend (Node/Express)
In a separate terminal, run:
```
node server.js
```

This will start the Express server at http://localhost:3000.

