/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs"],
  mode: "jit",
  theme: {
    extend: {
      colors: {
        primary: "#FC4C02"
      },
      fontFamily: {
        receipt: ["Share Tech Mono", "monospace"],
        receiptTitle: ["Anton", "sans-serif"]
      }
    },
  },
  plugins: [],
};
