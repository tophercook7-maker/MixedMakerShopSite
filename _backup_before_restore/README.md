# MixedMakerShop Website

A modern, responsive website for MixedMakerShop – a tiny studio turning ideas into things you can hold and use: 3D prints, Henry AI, StrainSpotter.app, and GoneFishin Keychains.

## Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI/UX**: Dark theme with green/orange/cream color palette
- **Ventures Showcase**: Featured ventures including Henry AI, StrainSpotter.app, and GoneFishin Keychains
- **Makes Gallery**: Showcase of 3D prints, keychains, and problem-solving products
- **Services**: Custom 3D printing, design, and turning ideas into products
- **Journal Section**: Behind-the-scenes content and build logs
- **Contact Form**: Easy-to-use contact form for inquiries
- **Smooth Scrolling**: Enhanced navigation experience with active section highlighting
- **Mobile Menu**: Hamburger menu for mobile devices

## File Structure

```
MixedMakerShopSite/
├── index.html      # Complete HTML file with embedded CSS and JavaScript
├── README.md       # This file
└── (banner.png)    # Optional: Add banner image
└── (product_tag.png) # Optional: Add product tag image
```

## Getting Started

1. Simply open `index.html` in a web browser
2. No build process or dependencies required
3. All styles and scripts are embedded inline in the HTML file

## Image Assets

The site references two images that you'll want to add:
- `banner.png` - Hero banner image (referenced in the hero section)
- `product_tag.png` - Product tag image (referenced in the makes section)

You can replace these with your own images or remove the `<img>` tags if you don't have them yet.

## Customization

### Colors
Edit the CSS variables in the `<style>` section:
```css
:root {
    --mms-green-dark: #0b2f20;
    --mms-green: #10412a;
    --mms-orange: #f49b1a;
    --mms-cream: #f3e9d9;
    /* ... */
}
```

### Ventures
Add or modify venture cards in the `#ventures` section. Each venture card includes:
- Venture name and badge
- Description
- Meta information
- Action link

### Makes
Add new make cards in the `#makes` section with tags and descriptions.

### Contact Form
The contact form is integrated with Netlify Forms for submission handling and email notifications. See NETLIFY_FORM_SETUP.md for configuration instructions.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest) - Includes `-webkit-` prefixes for backdrop-filter
- Edge (latest)

## Sections

1. **Hero** - Main landing area with tagline and CTA buttons
2. **Ventures** - Featured businesses (Henry AI, StrainSpotter.app, GoneFishin)
3. **Makes** - Products and creations gallery
4. **Services** - Service offerings
5. **Journal** - Blog/devlog section
6. **About** - Studio story and timeline
7. **Contact** - Contact form and information

## License

This project is open source and available for use.
