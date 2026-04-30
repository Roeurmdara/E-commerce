'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#F5F5F5', '#1A1A2E', '#16213E',
  '#E63946', '#FF6B6B', '#FF8C42', '#FFD166', '#F4D35E',
  '#06D6A0', '#1B998B', '#2EC4B6', '#0077B6', '#023E8A',
  '#7B2D8B', '#C77DFF', '#E040FB', '#F48FB1', '#BCAAA4',
  '#795548', '#546E7A', '#607D8B', '#90A4AE', '#CFD8DC',
];

type Badge = 'NONE' | 'BEST_SELLER' | 'NEW_ARRIVAL' | 'SALE';

const BADGE_OPTIONS: { value: Badge; label: string; color: string }[] = [
  { value: 'NONE', label: 'No Badge', color: '#9E9E9E' },
  { value: 'BEST_SELLER', label: 'Best Seller', color: '#FF6B00' },
  { value: 'NEW_ARRIVAL', label: 'New Arrival', color: '#0077B6' },
  { value: 'SALE', label: 'Sale', color: '#E63946' },
];

function ColorPickerSwatch({
  color,
  selected,
  onClick,
}: {
  color: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={color}
      style={{ backgroundColor: color }}
      className={`w-7 h-7 rounded-full border-2 transition-all ${
        selected
          ? 'border-black scale-110 shadow-md'
          : 'border-transparent hover:border-gray-400 hover:scale-105'
      }`}
    />
  );
}

function ColorPicker({
  selectedColors,
  onChange,
}: {
  selectedColors: string[];
  onChange: (colors: string[]) => void;
}) {
  const [customColor, setCustomColor] = useState('#000000');
  const [inputValue, setInputValue] = useState('');

  const toggle = (color: string) => {
    if (selectedColors.includes(color)) {
      onChange(selectedColors.filter(c => c !== color));
    } else {
      onChange([...selectedColors, color]);
    }
  };

  const addCustom = () => {
    const hex = inputValue.trim();
    const valid = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
    const colorToAdd = valid ? hex : customColor;
    if (!selectedColors.includes(colorToAdd)) {
      onChange([...selectedColors, colorToAdd]);
    }
    setInputValue('');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map(c => (
          <ColorPickerSwatch
            key={c}
            color={c}
            selected={selectedColors.includes(c)}
            onClick={() => toggle(c)}
          />
        ))}
      </div>

      {/* Custom color input */}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={customColor}
          onChange={e => {
            setCustomColor(e.target.value);
            setInputValue(e.target.value);
          }}
          className="w-9 h-9 border border-black cursor-pointer rounded p-0.5 bg-white"
          title="Pick custom color"
        />
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="#HEX or pick above"
          className="border border-black px-3 py-1.5 text-sm bg-white text-black w-48 font-mono"
        />
        <button
          type="button"
          onClick={addCustom}
          className="px-3 py-1.5 border border-black text-sm font-bold hover:bg-black hover:text-white transition"
        >
          + Add
        </button>
      </div>

      {/* Selected colors display */}
      {selectedColors.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selectedColors.map(c => (
            <div key={c} className="flex items-center gap-1 border border-gray-300 px-2 py-1 text-xs">
              <span
                className="w-4 h-4 rounded-full inline-block border border-gray-200"
                style={{ backgroundColor: c }}
              />
              <span className="font-mono">{c}</span>
              <button
                type="button"
                onClick={() => toggle(c)}
                className="ml-1 text-gray-400 hover:text-red-600 font-bold leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BadgeSelector({
  value,
  onChange,
}: {
  value: Badge;
  onChange: (v: Badge) => void;
}) {
  return (
    <div className="flex gap-3 flex-wrap">
      {BADGE_OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-2 px-4 py-2 border-2 font-bold text-sm transition-all ${
            value === opt.value
              ? 'border-black bg-black text-white'
              : 'border-gray-300 bg-white text-black hover:border-black'
          }`}
        >
          {opt.value !== 'NONE' && (
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: opt.color }}
            />
          )}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function NewProduct() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'CLOTHING',
    price: '',
    originalPrice: '',
    stock: '',
    sizes: 'S,M,L,XL',
    colors: [] as string[],
    imageUrl: '',
    badge: 'NONE' as Badge,
        // ✅ seller can set rating
        averageRating: '4.5',
        reviewCount: '0',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          stock: parseInt(formData.stock),
          sizes: formData.sizes.split(',').map(s => s.trim()),
          colors: formData.colors,
          imageUrl: formData.imageUrl,
          badge: formData.badge === 'NONE' ? null : formData.badge,
          averageRating: parseFloat(formData.averageRating),
          reviewCount: parseInt(formData.reviewCount),
        }),
      });

      if (response.ok) {
        const product = await response.json();
        router.push(`/seller/products/${product.id}/edit`);
      } else {
        const err = await response.json();
        setError(err.error || 'Failed to create product');
      }
    } catch (err) {
      setError('Failed to create product. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="flex min-h-[40vh] items-center justify-center">Loading...</div>;
  }

  return (
    <div className="max-w-3xl">
        <Link href="/seller/products" className="text-gray-600 hover:text-black mb-6 inline-block">
          ← Back to Products
        </Link>

        <h1 className="text-4xl font-bold text-black mb-8">Add New Product</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="border border-red-600 bg-red-50 p-4 text-red-600">{error}</div>
          )}

          {/* Product Name */}
          <div>
            <label className="block font-bold text-black mb-2">Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-black px-4 py-2 bg-white text-black"
              placeholder="Enter product name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-black mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full border border-black px-4 py-2 bg-white text-black"
              placeholder="Enter product description"
            />
          </div>

          {/* Category + Price */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block font-bold text-black mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-black px-4 py-2 bg-white text-black"
              >
                <option value="CLOTHING">Clothing</option>
                <option value="ACCESSORIES">Accessories</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-black mb-2">Price *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="w-full border border-black px-4 py-2 bg-white text-black"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Original Price + Stock */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block font-bold text-black mb-2">Original Price (optional)</label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full border border-black px-4 py-2 bg-white text-black"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block font-bold text-black mb-2">Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                className="w-full border border-black px-4 py-2 bg-white text-black"
                placeholder="0"
              />
            </div>
          </div>
           {/* Rating + Reviews */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block font-bold mb-2">Average Rating</label>
            <input
              type="number"
              name="averageRating"
              min="0"
              max="5"
              step="0.1"
              value={formData.averageRating}
              onChange={handleChange}
              className="w-full border border-black px-4 py-2"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Review Count</label>
            <input
              type="number"
              name="reviewCount"
              min="0"
              value={formData.reviewCount}
              onChange={handleChange}
              className="w-full border border-black px-4 py-2"
            />
          </div>
        </div>

          {/* Sizes */}
          <div>
            <label className="block font-bold text-black mb-2">Available Sizes</label>
            <input
              type="text"
              name="sizes"
              value={formData.sizes}
              onChange={handleChange}
              className="w-full border border-black px-4 py-2 bg-white text-black"
              placeholder="S,M,L,XL"
            />
            <p className="text-sm text-gray-600 mt-1">Comma-separated</p>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block font-bold text-black mb-2">
              Available Colors
              {formData.colors.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({formData.colors.length} selected)
                </span>
              )}
            </label>
            <div className="border border-black p-4 bg-gray-50">
              <ColorPicker
                selectedColors={formData.colors}
                onChange={colors => setFormData(prev => ({ ...prev, colors }))}
              />
            </div>
          </div>

          {/* Badge / Display Tag */}
          <div>
            <label className="block font-bold text-black mb-2">Product Badge</label>
            <p className="text-sm text-gray-600 mb-3">
              Highlight this product with a badge on listing pages.
            </p>
            <BadgeSelector
              value={formData.badge}
              onChange={badge => setFormData(prev => ({ ...prev, badge }))}
            />
          </div>

          {/* Image */}
          <div>
            <label className="block font-bold text-black mb-2">Main Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full border border-black px-4 py-2 bg-white text-black mb-3"
            />
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
              onChange={handleChange}
              className="w-full border border-black px-4 py-2 bg-white text-black"
              placeholder="Or paste image URL (optional)"
            />
            {imagePreview && (
              <div className="mt-3 border border-black p-2 inline-block">
                <img src={imagePreview} alt="Preview" className="h-28 w-28 object-cover" />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white px-6 py-3 border border-black font-bold hover:bg-white hover:text-black transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
            <Link
              href="/seller/products"
              className="flex-1 bg-white text-black px-6 py-3 border border-black font-bold hover:bg-black hover:text-white transition text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
    </div>
  );
}