/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主色调 - 白色系
        primary: {
          DEFAULT: '#FFFFFF',
          light: '#FAFAFA',
          dark: '#F5F5F5',
        },
        // 次色调 - 蓝色系
        secondary: {
          50: '#EBF5FF',
          100: '#D6EBFF',
          200: '#B3DBFF',
          300: '#80C7FF',
          400: '#4DA8FF',
          500: '#1A8FFF',  // 主蓝色
          600: '#0070E0',
          700: '#0055B8',
          800: '#003D8F',
          900: '#002966',
        },
        // 黑色对比色
        contrast: {
          DEFAULT: '#000000',
          light: '#1A1A1A',
          dark: '#0A0A0A',
        },
        // 五维数值颜色
        attr: {
          de: '#F56C6C',   // 德育 - 红色
          zhi: '#409EFF',  // 智育 - 蓝色
          ti: '#67C23A',   // 体育 - 绿色
          mei: '#E6A23C',  // 美育 - 橙色
          lao: '#909399',  // 劳育 - 灰色
        },
        // 功能色
        success: '#67C23A',
        warning: '#E6A23C',
        danger: '#F56C6C',
        info: '#909399',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 20px rgba(0, 0, 0, 0.12)',
        'strong': '0 8px 30px rgba(0, 0, 0, 0.16)',
        'glow-blue': '0 0 20px rgba(26, 143, 255, 0.3)',
        'glow-white': '0 0 30px rgba(255, 255, 255, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
