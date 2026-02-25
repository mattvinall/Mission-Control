# 🐉 Hydra Mission Control (Next.js)

A Next.js version of the Mission Control dashboard for Pipeline Labs - Track projects, tasks, and progress toward $10M ARR.

## 🚀 Features

- **Dashboard Overview**: BHAG tracking, current status, and agent status
- **Project Management**: View all projects with task completion progress
- **Task Management**: Detailed task views with status, priority, and notes
- **Activity Log**: Complete history of all project and task activities
- **Statistics**: Visual analytics for task completion, priorities, and project performance
- **Dark Theme**: Developer-friendly dark UI with orange accent colors
- **Mobile Responsive**: Works great on all device sizes
- **Real-time Data**: Static JSON data source (ready for API integration)

## 🛠️ Tech Stack

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS 3** for styling
- **Lucide React** for icons
- **Static Data** from JSON (easily replaceable with API calls)

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚢 Deployment to Vercel

### Quick Deploy

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project" and select your repository
4. Vercel will automatically detect it's a Next.js project
5. Click "Deploy"

### Manual Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy from the project directory:
```bash
vercel
```

3. Follow the prompts to configure your deployment

### Build Verification

Before deploying, verify the build works:
```bash
npm run build
npm run start
```

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles & Tailwind
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main dashboard page
├── components/
│   ├── ActivityView.tsx     # Activity log view
│   ├── DashboardView.tsx    # Main dashboard
│   ├── ProjectsView.tsx     # Projects & tasks view
│   ├── Sidebar.tsx          # Navigation sidebar
│   ├── StatsView.tsx        # Statistics & analytics
│   └── TaskDetail.tsx       # Task detail view
├── lib/
│   ├── data.ts              # Data access functions
│   └── utils.ts             # Utilities & styling helpers
├── types/
│   └── index.ts             # TypeScript type definitions
└── data.json                # Static data source
```

## 🔧 Configuration

### Environment Variables

No environment variables required for basic deployment. The app uses static JSON data.

### Data Source

Currently reads from `data.json`. To integrate with an API:

1. Update functions in `src/lib/data.ts`
2. Replace static imports with API calls
3. Add environment variables for API endpoints
4. Consider adding SWR or React Query for data fetching

### Customization

- **Colors**: Update CSS variables in `globals.css`
- **Theme**: Modify Tailwind config in `tailwind.config.ts`
- **Data Structure**: Update types in `src/types/index.ts`

## 📊 Data Structure

The dashboard expects the following JSON structure:

```json
{
  "meta": {
    "lastUpdated": "ISO date string",
    "agentStatus": "active|inactive|busy",
    "currentTask": "Current task description"
  },
  "bhag": {
    "title": "Big Hairy Audacious Goal",
    "description": "Goal description",
    "icon": "🎯"
  },
  "projects": [
    {
      "id": "unique-id",
      "title": "Project Name",
      "icon": "📁",
      "description": "Project description",
      "stage": "planning|in-progress|review|done",
      "priority": "low|medium|high|critical",
      "tasks": [...]
    }
  ],
  "activityLog": [...]
}
```

## 🎯 Next Steps

1. **API Integration**: Replace static JSON with real API calls
2. **Real-time Updates**: Add WebSocket support for live updates
3. **Task Editing**: Add forms for creating/editing tasks and projects
4. **User Authentication**: Add login/auth if needed
5. **Advanced Analytics**: More detailed statistics and charts
6. **Notifications**: Add browser notifications for task updates

## 🐛 Issues & Contributing

This is a conversion of the original Node.js Mission Control dashboard. All original functionality has been preserved and modernized for Next.js deployment.

## 📄 License

Private - Pipeline Labs internal tool.