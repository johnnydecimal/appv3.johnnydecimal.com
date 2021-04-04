module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      black: {
        DEFAULT: "#191919",
      },
      green: {
        DEFAULT: "rgb(40, 254, 20)",
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
