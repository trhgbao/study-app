import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8b5cf6',   // Tím Violet (Màu chủ đạo)
        secondary: '#1e1b4b', // Xanh đậm Indigo (Màu nền phụ)
        accent: '#f472b6',    // Hồng (Dùng cho các nút quan trọng/quà tặng)
        background: '#0f172a', // Màu nền tối (Slate 900)
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'], // Font chữ mặc định
      },
    },
  },
  plugins: [],
};
export default config;