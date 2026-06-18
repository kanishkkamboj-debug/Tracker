# UI/UX Improvement Tasks

## 1. Foundations & Theming
- [x] Refactor `index.css` to use CSS variables for light and dark modes
- [x] Refactor `tailwind.config.js` to map to new CSS variables
- [x] Create a ThemeToggle component and place it in the Navbar
- [x] Inject the brand palette dynamically into `HeroScene.tsx`

## 2. Component Abstraction & A11y
- [x] Create a `ToastProvider` and `useToast` hook for global notifications
- [x] Abstract a reusable `<Select />` component matching the style of `<Input />`
- [x] Abstract a `<Skeleton />` component for loading states
- [x] Upgrade `Modal.tsx` to include FocusTrap, `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`
- [x] Update `<Button />` and other interactive elements to use proper `focus-visible` outlines
- [x] Add `aria-invalid` and visible error icons to `<Input />`

## 3. UX Enhancements
- [x] Implement Skeleton loaders for the `DashboardPage`
- [x] Implement Skeleton loaders for the `ProjectsPage`
- [x] Implement Skeleton loaders for `ProjectDetailPage` (the Kanban board)
- [x] Add explicit Pagination controls (Next/Prev) to `ProjectsPage.tsx`
- [x] Create a beautiful `<EmptyState />` component and use it on Dashboard and Projects pages
- [x] Update `axiosInstance.ts` to show a toast notification when redirecting on 401
- [x] Implement progressive disclosure in `ProjectForm` and `TaskForm`

## 4. Kanban & Board Interaction
- [x] Wire up toast notifications for drag-and-drop failures in `ProjectDetailPage.tsx`
- [x] Add a screen-reader/keyboard accessible menu on `KanbanCard.tsx` to move tasks without drag-and-drop
- [x] Slow down or pause `HeroScene` particles if `prefers-reduced-motion` is active
- [x] Implement scroll restoration on navigation in `AppRouter.tsx`

## 5. Final Review
- [x] Walkthrough the app
- [x] Build and verify frontend
