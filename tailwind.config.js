module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      black: {
        DEFAULT: "#2f3160",
      },
      white: {
        DEFAULT: "#fcfbf8",
      },
      grey: {
        light: "#BDC3C7",
        DEFAULT: "#374140",
      },
      red: {
        DEFAULT: "#FA2520",
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
