
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // Quét tất cả file JS/JSX trong src
  ],
  theme: {
    extend: {}, // Tùy chỉnh theme nếu cần (màu sắc, font, v.v.)
  },
  plugins: [],
}