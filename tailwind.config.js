/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          main: "var(--primary-main)",
          light: "var(--primary-light)",
          dark: "var(--primary-dark)",
          contrast: "var(--primary-contrast)",
        },
        secondary: {
          main: "var(--secondary-main)",
          light: "var(--secondary-light)",
          dark: "var(--secondary-dark)",
          contrast: "var(--secondary-contrast)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          disabled: "var(--text-disabled)",
        },
        background: {
          default: "var(--background-default)",
          paper: "var(--background-paper)",
          light: "var(--background-light)",
        },
        border: {
          light: "var(--border-light)",
          medium: "var(--border-medium)",
        },
        error: {
          main: "var(--error-main)",
          light: "var(--error-light)",
          dark: "var(--error-dark)",
        },
        success: {
          main: "var(--success-main)",
          light: "var(--success-light)",
          dark: "var(--success-dark)",
        },
        info: {
          main: "var(--info-main)",
          light: "var(--info-light)",
          dark: "var(--info-dark)",
        },
        neutral: {
          main: "var(--neutral-main)",
          light: "var(--neutral-light)",
          dark: "var(--neutral-dark)",
        },
        pastel: {
          pink: "var(--pastel-pink)",
          yellow: "var(--pastel-yellow)",
          green: "var(--pastel-green)",
          blue: "var(--pastel-blue)",
          purple: "var(--pastel-purple)",
        },
      },
      borderRadius: {
        sm: "var(--border-radius-sm)",
        md: "var(--border-radius-md)",
        lg: "var(--border-radius-lg)",
      },
      fontSize: {
        xs: "var(--font-size-xs)",
        sm: "var(--font-size-sm)",
        md: "var(--font-size-md)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
        "2xl": "var(--font-size-xxl)",
      },
      spacing: {
        0.5: "2px",
        1: "4px",
        1.5: "6px",
        2: "8px",
        2.5: "10px",
        3: "12px",
        3.5: "14px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
        16: "64px",
        20: "80px",
        24: "96px",
      },
    },
  },
  plugins: [],
};
