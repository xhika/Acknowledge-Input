let mix = require('laravel-mix');

mix.postCss('tailwind.css', 'build/css', [
  require('tailwindcss'),
])

mix.js('index.js', 'build/js')
