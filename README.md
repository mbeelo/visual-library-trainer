# Visual Library Trainer 2.0 🎨

Transform your drawing skills with personalized visual reference collections. Visual Library Trainer helps artists build visual memory through structured practice while creating a growing library of curated reference images.

![Visual Library Trainer](https://your-domain.com/og-image.png)

## ✨ Features

### 🎯 **Core Training System**
- **Structured Practice Sessions** - Timed drawing challenges with progressive difficulty
- **Algorithm-Based Selection** - Smart subject selection based on your performance
- **Performance Tracking** - Detailed analytics and progress visualization
- **Custom Training Lists** - Create and share your own drawing subject lists

### 🖼️ **Personal Image Collections** (NEW in 2.0)
- **Pinterest-Style Boards** - Beautiful, organized reference collections for each subject
- **One-Click Saving** - Copy image URLs from Pinterest, Google, ArtStation, etc.
- **Cross-Device Sync** - Access your collections from any device
- **Smart Organization** - Auto-arranged grids with drag-and-drop reordering

### 💎 **Freemium Business Model**
- **Free Tier** - Core training features + 3 images per subject
- **Pro Tier** - Unlimited images, cloud sync, advanced analytics
- **Seamless Upgrades** - In-app purchase flow with Stripe integration

### 🔐 **User Management**
- **Progressive Authentication** - Start immediately, sign up when ready
- **Google OAuth + Email** - Multiple sign-in options
- **Data Migration** - Automatic localStorage → cloud migration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account

### 1. Environment Setup
```bash
# Clone the repository
git clone https://github.com/mbeelo/visual-library-trainer.git
cd visual-library-trainer

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 2. Configure Environment Variables
```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 3. Database Setup
1. Create new Supabase project
2. Run SQL scripts from `DATABASE_SCHEMA.md`
3. Configure authentication providers

### 4. Development
```bash
# Start development server
npm run dev

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── AuthModal.tsx           # Authentication modal
│   ├── PersonalImageBoard.tsx  # Image collection display
│   ├── ImageUrlInput.tsx       # URL input for adding images
│   ├── UpgradeModal.tsx        # Stripe upgrade flow
│   ├── MigrationPrompt.tsx     # Data migration UI
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx        # Authentication state
├── services/           # API services
│   ├── imageCollections.ts    # Image CRUD operations
│   └── dataMigration.ts       # localStorage migration
├── lib/                # External service clients
│   ├── supabase.ts            # Database client
│   └── stripe.ts              # Payment client
├── types/              # TypeScript definitions
│   └── index.ts               # All type definitions
├── utils/              # Helper functions
├── data/               # Static data (training lists)
└── hooks/              # Custom React hooks
```

## 🔧 Technology Stack

### Frontend
- **React 19.1.1** - UI framework
- **TypeScript** - Type safety
- **Vite 7.1.7** - Build tool and dev server
- **Tailwind CSS 4.1.13** - Styling and design system
- **Lucide React** - Icon library

### Backend & Services
- **Supabase** - Database, authentication, real-time features
- **PostgreSQL** - Primary database
- **Stripe** - Payment processing and subscription management
- **Vercel/Netlify** - Deployment and hosting

### Key Libraries
- `@supabase/supabase-js` - Supabase client
- `@stripe/stripe-js` - Stripe client-side integration

## 📊 Database Schema

### Core Tables
- **users** - User profiles and subscription tiers
- **image_collections** - Personal reference image collections
- **practice_sessions** - Training session history and analytics
- **custom_lists** - User-created training lists

See `DATABASE_SCHEMA.md` for complete schema and setup instructions.

## 🔌 API Endpoints

### Required Backend Endpoints
- **POST** `/api/create-checkout-session` - Stripe checkout
- **POST** `/api/stripe-webhook` - Webhook handling
- **GET** `/api/user-subscription` - Subscription status

See `API_ENDPOINTS.md` for complete implementation examples.

## 🚢 Deployment

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option 2: Netlify
```bash
# Build
npm run build

# Deploy dist/ folder to Netlify
```

### Option 3: Custom Server
```bash
npm run build
# Upload dist/ folder to your web server
```

See `DEPLOYMENT.md` for comprehensive deployment guide.

## 🧪 Testing

### Development Testing
```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build verification
npm run build
```

### Stripe Testing
Use test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **SCA Required**: `4000 0025 0000 3155`

### Authentication Testing
- Test Google OAuth flow
- Verify data migration from localStorage
- Check subscription upgrades and downgrades

## 📈 Business Model

### Free Tier
- ✅ Core training features
- ✅ Performance analytics
- ✅ Custom list creation
- ✅ 3 images per drawing subject
- ❌ Cloud sync
- ❌ Unlimited images

### Pro Tier ($9/month, $79/year)
- ✅ Everything in Free
- ✅ **Unlimited image collections**
- ✅ **Cross-device cloud sync**
- ✅ **Advanced analytics**
- ✅ **Export collections**
- ✅ **Priority support**

### Conversion Strategy
- Progressive value demonstration
- Contextual upgrade prompts
- Free tier limitations at optimal friction points
- 14-day Pro trial for new signups

## 🔒 Security

### Authentication
- OAuth 2.0 with Google
- JWT tokens managed by Supabase
- Row Level Security (RLS) on all tables

### Data Protection
- User data isolated by user ID
- Image URLs validated before storage
- Secure webhook signature verification

### Payment Security
- PCI-compliant Stripe integration
- No sensitive data stored locally
- Webhook signature validation

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Conventional commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ultimate Visual Library** - Training content inspiration
- **Supabase** - Backend infrastructure
- **Stripe** - Payment processing
- **Tailwind CSS** - Design system
- **Lucide** - Icon library

## 📞 Support

- **Documentation**: Check our comprehensive guides
- **Issues**: [GitHub Issues](https://github.com/mbeelo/visual-library-trainer/issues)
- **Email**: support@your-domain.com
- **Discord**: [Join our community](https://discord.gg/your-invite)

## 🎯 Roadmap

### Phase 2 (Q2 2025)
- **Advanced Analytics** - Performance insights and trends
- **Export Features** - PDF mood boards, collection exports
- **Mobile App** - iOS and Android companion apps

### Phase 3 (Q3 2025)
- **AI-Powered Suggestions** - Smart reference recommendations
- **Collaborative Collections** - Share and discover community boards
- **Integration APIs** - Figma, Adobe, Procreate plugins

---

**Start building your visual library today!** 🎨✨

[Live Demo](https://visual-library-trainer.vercel.app) | [Documentation](./CLAUDE.md) | [Deployment Guide](./DEPLOYMENT.md)