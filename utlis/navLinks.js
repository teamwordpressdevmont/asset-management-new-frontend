// ─── Role definitions ────────────────────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  USER: "user",
};

// ─── Visibility shortcuts  ────────────────────────────────────────────────────
// Use these in the `roles` field of each nav item:

export const ALL_ROLES = null; // everyone sees it
export const ADMIN_UP = [ROLES.SUPER_ADMIN, ROLES.ADMIN]; // admin + super admin
export const ADMIN_ONLY = [ROLES.ADMIN]; // admin + super admin
export const SUPER_ONLY = [ROLES.SUPER_ADMIN]; // super admin only
export const USER_ONLY = [ROLES.USER]; // regular users only
// Add custom combos as needed:
// export const FINANCE   = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.USER];

// ─────────────────────────────────────────────────────────────────────────────

export const NAV_LINKS = [
  {
    section: "Workspace",
    items: [
      {
        label: "Overview",
        href: "/dashboard",
        roles: ALL_ROLES,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
      {
        label: "Assets",
        href: "/assets",
        roles: ADMIN_UP,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        ),
        children: [
          { label: "Add Asset", href: "/assets/add" },
          { label: "Asset List", href: "/assets" },
        ],
      },
      {
        label: "Assets",
        href: "/own-assets",
        roles: USER_ONLY,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        ),
        children: [
          { label: "My Assets", href: "/own-assets" },
        ],
      },
      {
        label: "Categories",
        href: "/assets-category",
        roles: ADMIN_UP,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 12h8m-8 6h16" />
            <circle cx="18" cy="12" r="3" />
          </svg>
        ),
        children: [
          { label: "Add Category", href: "/assets-category/add" },
          { label: "Category List", href: "/assets-category" },
        ],
      },
      {
        label: "Vendors",
        href: "/vendors",
        roles: ADMIN_UP,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 3h15v13H1z" />
            <path d="M16 8h4l3 3v5h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        ),
        children: [
          { label: "Add Vendor", href: "/vendors/add" },
          { label: "Vendor List", href: "/vendors" },
        ],
      },
    ],
  },
  {
    section: "Directory",
    items: [
      {
        label: "Organizations",
        href: "/company",
        roles: SUPER_ONLY,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        ),
        children: [
          { label: "Add Company", href: "/company/add" },
          { label: "Company List", href: "/company" },
        ],
      },
      {
        label: "Users",
        href: "/users",
        roles: ADMIN_UP,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
        children: [
          { label: "Add User", href: "/users/add" },
          { label: "User List", href: "/users" },
        ],
      },
    ],
  },
  {
    section: "Operations",
    items: [
      {
        label: "Return Requests",
        href: "/return-requests",
        roles: ADMIN_ONLY,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
          </svg>
        ),
      },
      {
        label: "Issue Reports",
        href: "/issue-reports",
        roles: ADMIN_UP,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ),
      },
      {
        label: "Issue Reports",
        href: "/issue-reports",
        roles: USER_ONLY,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ),
        children: [
          { label: "Report Issue", href: "/issue/create" },
          { label: "My Issues", href: "/issue" },
        ],
      },
    ],
  },
];
