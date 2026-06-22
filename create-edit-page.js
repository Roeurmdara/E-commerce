const fs = require('fs');
const path = require('path');

const newPagePath = path.join(__dirname, 'app/seller/products/new/page.tsx');
const editPageDir = path.join(__dirname, 'app/seller/products/[id]/edit');
const editPagePath = path.join(editPageDir, 'page.tsx');

let content = fs.readFileSync(newPagePath, 'utf8');

// 1. Add `use` to react imports
content = content.replace(
  "import { useEffect, useState, useRef } from 'react';",
  "import { useEffect, useState, useRef, use } from 'react';"
);

// 2. Change function name and props
content = content.replace(
  "export default function NewProduct() {",
  "export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {\n  const { id } = use(params);"
);

// 3. Add fetching state and isActive to formData
content = content.replace(
  "const [loading, setLoading] = useState(false);",
  "const [loading, setLoading] = useState(false);\n  const [fetching, setFetching] = useState(true);"
);

content = content.replace(
  "reviewCount: '0',",
  "reviewCount: '0',\n    isActive: true,"
);

// 4. Add useEffect to fetch product
const fetchEffect = `
  useEffect(() => {
    if (status !== 'authenticated') return;
    
    const fetchProduct = async () => {
      try {
        const res = await fetch(\`/api/seller/products/\${id}\`);
        if (res.ok) {
          const product = await res.json();
          
          let parsedSizes = '';
          if (product.sizes) {
            try {
              parsedSizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes).join(',') : product.sizes.join(',');
            } catch(e) { parsedSizes = product.sizes; }
          }
          
          let parsedColors = [];
          if (product.colors) {
            try {
              parsedColors = typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors;
            } catch(e) { parsedColors = []; }
          }

          setFormData(prev => ({
            ...prev,
            name: product.name || '',
            description: product.description || '',
            category: product.categoryId || 'CLOTHING',
            price: product.price?.toString() || '',
            originalPrice: product.originalPrice?.toString() || '',
            stock: product.stock?.toString() || '',
            sizes: parsedSizes,
            colors: parsedColors,
            imageUrl: product.images?.[0]?.url || '',
            badge: product.badge || 'NONE',
            averageRating: product.averageRating?.toString() || '4.5',
            reviewCount: product.reviewCount?.toString() || '0',
            isActive: product.isActive ?? true,
          }));
          
          if (product.images?.[0]?.url) {
            setImagePreview(product.images[0].url);
          }
        } else {
          setError('Failed to load product');
        }
      } catch (err) {
        setError('Error fetching product');
      } finally {
        setFetching(false);
      }
    };
    
    fetchProduct();
  }, [id, status]);
`;

content = content.replace(
  "  const handleChange = (",
  fetchEffect + "\n  const handleChange = ("
);

// 5. Change POST to PATCH and URL
content = content.replace(
  "const response = await fetch('/api/seller/products', {",
  "const response = await fetch(`/api/seller/products/${id}`, {"
);

content = content.replace(
  "method: 'POST',",
  "method: 'PATCH',"
);

// 6. Add isActive to submit body
content = content.replace(
  "reviewCount: parseInt(formData.reviewCount),",
  "reviewCount: parseInt(formData.reviewCount),\n          isActive: formData.isActive,"
);

// 7. Update button text and headings
content = content.replace(
  "Add New Product",
  "Edit Product"
);

content = content.replace(
  "Create Product",
  "Save Changes"
);

content = content.replace(
  "Creating...",
  "Saving..."
);

// 8. Add isActive toggle to form
const isActiveToggle = `
          {/* Is Active Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-5 h-5 accent-black"
            />
            <label htmlFor="isActive" className="font-bold text-black cursor-pointer">
              Product is Active (visible to customers)
            </label>
          </div>
`;

content = content.replace(
  "{/* Product Name */}",
  isActiveToggle + "\n\n          {/* Product Name */}"
);

// 9. Update loading state for fetching
content = content.replace(
  "if (status === 'loading') {",
  "if (status === 'loading' || fetching) {"
);

// 10. Update successful response handling
content = content.replace(
  "router.push(`/seller/products/${product.id}/edit`);",
  "router.push('/seller/products');"
);

fs.mkdirSync(editPageDir, { recursive: true });
fs.writeFileSync(editPagePath, content, 'utf8');

console.log('Successfully created edit page at', editPagePath);
