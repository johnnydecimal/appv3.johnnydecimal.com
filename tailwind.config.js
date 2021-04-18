module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      black: {
        DEFAULT: "#2f3130",
      },
      white: {
        DEFAULT: "#fcfbf8",
      },
    },
    extend: {},
    fontFamily: {
      jdcode: ["Fira Code"],
      jdbody: ["Fira Sans"],
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
