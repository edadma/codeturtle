import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://codeturtle.dev',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    starlight({
      title: 'CodeTurtle',
      description: 'Learn Logo programming with fun turtle graphics tutorials',
      favicon: '/favicon.ico',
      logo: {
        src: './src/assets/logo.png',
        alt: 'CodeTurtle Logo',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/codeturtle' },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'intro' },
            { label: 'Your First Program', slug: 'first-program' },
          ],
        },
        {
          label: 'Basic Commands',
          items: [
            { label: 'Moving the Turtle', slug: 'basics/movement' },
            { label: 'Turning', slug: 'basics/turning' },
            { label: 'Pen Control', slug: 'basics/pen' },
            { label: 'Colors', slug: 'basics/colors' },
          ],
        },
        {
          label: 'Shapes',
          items: [
            { label: 'Squares', slug: 'shapes/squares' },
            { label: 'Triangles', slug: 'shapes/triangles' },
            { label: 'Circles', slug: 'shapes/circles' },
            { label: 'Polygons', slug: 'shapes/polygons' },
          ],
        },
        {
          label: 'Programming Concepts',
          items: [
            { label: 'Repeat Loops', slug: 'concepts/repeat' },
            { label: 'Procedures', slug: 'concepts/procedures' },
            { label: 'Variables', slug: 'concepts/variables' },
            { label: 'Recursion', slug: 'concepts/recursion' },
          ],
        },
        {
          label: 'Projects',
          items: [
            { label: 'Spiral Art', slug: 'projects/spirals' },
            { label: 'Stars', slug: 'projects/stars' },
            { label: 'Fractals', slug: 'projects/fractals' },
            { label: 'Flowers', slug: 'projects/flowers' },
          ],
        },
        {
          label: 'Reference',
          collapsed: true,
          items: [
            { label: 'Command Reference', slug: 'reference/commands' },
            { label: 'Glossary', slug: 'reference/glossary' },
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
    react(),
    sitemap(),
  ],
})
