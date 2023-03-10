const config = {

    content: [
        './src/**/*.{html,js,svelte,ts}',
    ],
    darkMode: 'class',
    theme: {
        extend: {},
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        require('@tailwindcss/line-clamp'),
        require('@skeletonlabs/skeleton/tailwind/theme.cjs')]
};

module.exports = config;
