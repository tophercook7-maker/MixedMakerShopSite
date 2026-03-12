# How to Add Product Images

Your site is now set up to display images of the things you've made! Here's how to add them.

## Quick Steps

1. **Take photos** of your products
2. **Save them** to the `images/products/` folder
3. **Name them** according to the list below
4. **Done!** The images will automatically appear on your site

## Image File Names

Add your photos with these exact names to `images/products/`:

### For the Homepage "What I Make" Section:
- `keychain-vintage.jpg` - Vintage fishing lure keychains
- `fidget.jpg` - 3D printed fidgets  
- `cable-anchors.jpg` - Cable anchors & desk organizers
- `custom-parts.jpg` - Custom 3D printed parts

### For the Shop Page:
- `keychain-vintage.jpg` - Vintage Fishing Lure Keychain ($18.99)
- `keychain-regular.jpg` - Regular Lure Keychain ($12.99)
- `keychain-3d.jpg` - 3D Printed Fishing Keychain ($8.99)
- `fidget.jpg` - Desk-Friendly 3D Printed Fidget ($12.00)
- `cable-anchors.jpg` - Cable Anchors & Desk Organizers ($8.00)

## Image Requirements

- **Format**: JPG or PNG (JPG recommended for smaller file size)
- **Size**: 800x800px to 1200x1200px (square works best)
- **File size**: Keep under 500KB for fast loading
- **Quality**: Good lighting, clear focus, simple background

## What Happens If Images Are Missing?

If an image file doesn't exist, it will automatically hide (graceful fallback). Your site will still work perfectly, just without that image.

## Adding New Products

### To add a new product to the shop:

1. Add your image to `images/products/` (e.g., `my-new-product.jpg`)
2. Open `shop.html`
3. Find the `products` array (around line 547)
4. Add a new product object:

```javascript
{
  id: 'my-product-1',
  name: 'My Awesome Product',
  description: 'A great description of what this is.',
  price: 25.00,
  category: '3dprints', // or 'keychains'
  image: 'images/products/my-new-product.jpg',
  brand: 'MixedMakerShop'
}
```

### To add a new make to the homepage:

1. Add your image to `images/products/`
2. Open `index.html`
3. Find the `makes-grid` section (around line 2682)
4. Add a new make-card:

```html
<article class="make-card">
  <img src="images/products/my-new-product.jpg" alt="Description" class="make-image" onerror="this.style.display='none'" />
  <div class="make-content">
    <h3 class="make-title">My Awesome Product</h3>
    <p style="font-size:0.8rem;color:rgba(243,233,217,0.8);">
      Description of your product here.
    </p>
    <div class="make-meta-row">
      <span class="tag">Tag 1</span>
      <span class="tag">Tag 2</span>
    </div>
  </div>
</article>
```

## Tips for Great Product Photos

- **Lighting**: Natural light or well-lit area
- **Background**: Plain white, black, or simple surface
- **Angle**: Show the product clearly from the front
- **Multiple views**: Consider adding detail shots if helpful
- **Consistency**: Try to use similar lighting/background for all products

## Current Status

✅ Image support added to homepage "What I Make" section
✅ Image support added to shop page products
✅ Image directory created: `images/products/`
✅ Graceful fallback if images don't exist

Just add your photos and they'll appear automatically!
