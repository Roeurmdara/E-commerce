# E-Commerce Platform Setup Guide

## Prerequisites
- Node.js 18+ and pnpm installed
- Neon PostgreSQL database connection string

## Installation Steps

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="your_neon_connection_string"

# Auth.js Configuration
NEXTAUTH_SECRET="your_secret_key_here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: set your own admin account used by seed
ADMIN_EMAIL="your_email@example.com"
ADMIN_PASSWORD="your_admin_password"
```

Generate a secure secret for NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 3. Initialize Database
Push the Prisma schema to your database:

```bash
npx prisma db push
```

### 4. Seed Initial Data
Run the seed script to create sample data:

```bash
npx ts-node scripts/seed.ts
```

This creates:
- Admin user (`ADMIN_EMAIL` / `ADMIN_PASSWORD` if set, otherwise admin@example.com / admin123)
- Seller user (seller@example.com / seller123)
- Customer user (customer@example.com / customer123)
- Sample products with categories

### 5. Start Development Server
```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## Default Test Accounts

### Admin Account
- Email: `ADMIN_EMAIL` from your env (or `admin@example.com` by default)
- Password: `ADMIN_PASSWORD` from your env (or `admin123` by default)
- Access: `/admin/dashboard`

### Seller Account
- Email: `seller@example.com`
- Password: `seller123`
- Access: `/seller/dashboard`

### Customer Account
- Email: `customer@example.com`
- Password: `customer123`
- Access: Full customer functionality

## Project Structure

```
app/
├── api/                          # API routes
│   ├── auth/                     # Authentication routes
│   ├── products/                 # Product APIs
│   ├── cart/                     # Cart management
│   ├── wishlist/                 # Wishlist management
│   ├── orders/                   # Order management
│   ├── reviews/                  # Review management
│   ├── seller/                   # Seller-specific APIs
│   └── admin/                    # Admin APIs
├── auth/                         # Authentication pages
│   ├── signin/
│   └── signup/
├── products/                     # Product pages
│   ├── page.tsx                 # Product listing
│   └── [id]/                    # Product details
├── cart/                         # Cart page
├── wishlist/                     # Wishlist page
├── checkout/                     # Checkout page
├── orders/                       # Customer orders
├── seller/                       # Seller dashboard
│   ├── dashboard/
│   ├── products/
│   ├── orders/
│   └── analytics/
├── admin/                        # Admin panel
│   ├── dashboard/
│   ├── users/
│   ├── sellers/
│   ├── products/
│   ├── orders/
│   └── analytics/
└── page.tsx                      # Home page

prisma/
├── schema.prisma                 # Database schema

lib/
├── prisma.ts                     # Prisma client
auth.ts                           # Auth.js configuration
```

## Key Features

### Customer Features
- Browse products with filtering (category, price)
- Add/remove items from cart
- Save items to wishlist
- View product reviews and ratings
- Create orders
- Track order status
- Leave product reviews

### Seller Features
- Register seller account (approval required)
- Manage product listings (CRUD)
- View and manage orders
- Update order shipping status
- View sales analytics
- Track revenue and top products

### Admin Features
- Dashboard with platform metrics
- User management
- Seller approval/rejection
- Product moderation
- View all orders
- Platform analytics
- Top sellers and products

## Database Models

### Core Models
- **User** - Customer, Seller, Admin roles
- **SellerProfile** - Seller business information
- **Product** - Product listings
- **ProductImage** - Product images
- **Category** - Product categories
- **CartItem** - Shopping cart items
- **Wishlist** - User saved items
- **Order** - Customer orders
- **OrderItem** - Items in an order
- **Review** - Product reviews and ratings

### Administrative Models
- **Coupon** - Discount codes
- **Discount** - Product discounts
- **Promotion** - Seller promotions
- **SellerAnalytics** - Seller metrics
- **PlatformAnalytics** - Platform metrics

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `GET/POST /api/auth/[...nextauth]` - Auth.js routes

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/[id]` - Get product details

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add item
- `PATCH /api/cart/[id]` - Update item
- `DELETE /api/cart/[id]` - Remove item

### Wishlist
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist` - Add item
- `DELETE /api/wishlist/[id]` - Remove item

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get customer orders

### Reviews
- `POST /api/reviews` - Create review

### Seller
- `POST /api/seller/register` - Register as seller
- `GET /api/seller/stats` - Seller statistics
- `GET/POST /api/seller/products` - Product management
- `GET /api/seller/orders` - Seller orders

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - Manage users
- `GET /api/admin/sellers` - Manage sellers
- `GET /api/admin/products` - Manage products
- `GET /api/admin/orders` - View all orders
- `GET /api/admin/analytics` - Platform analytics

## Deployment

### Deploy to Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel project settings
4. Deploy

```bash
vercel
```

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Neon database is accessible
- Run `npx prisma db push` to sync schema

### Auth Issues
- Ensure NEXTAUTH_SECRET is set
- Clear browser cookies and try again
- Check NEXTAUTH_URL matches your domain

### Image Loading Issues
- Ensure product image URLs are valid
- Images should be fully qualified URLs (http/https)
- Check CORS if using external image sources

## Next Steps

1. Customize branding (colors, logo, store name)
2. Integrate payment processor (Stripe, PayPal)
3. Add email notifications
4. Implement advanced search
5. Add user profile pages
6. Create admin moderation dashboard
7. Add analytics charts
8. Implement SMS notifications for orders

## Support

For issues or questions, refer to the documentation:
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Auth.js: https://authjs.dev
- Tailwind CSS: https://tailwindcss.com/docs
