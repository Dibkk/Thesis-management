# Thesis Management System

A comprehensive web application for managing academic theses, facilitating collaboration between students and advisors.

## Features

- **Role-Based Access**: Student, Advisor, and Admin roles.
- **Thesis Management**: Upload, version control, and status tracking.
- **Approval Workflow**: Chapter-by-chapter approval system.
- **Admin Dashboard**: User management, system settings, and global thesis oversight.
- **Public Repository**: Browse and search approved theses.
- **Secure Authentication**: JWT-based auth with middleware protection.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Styling**: Tailwind CSS + Shadcn UI
- **Testing**: Vitest + React Testing Library

## Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up environment variables**:
    Create `.env.local` with:
    ```env
    MONGODB_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    ```
4.  **Run the development server**:
    ```bash
    npm run dev
    ```
5.  **Run tests**:
    ```bash
    npm test
    ```

## Admin Access

To access the Admin Dashboard, ensure your user has `role: "admin"` in the database.
Navigate to `/dashboard` to see Admin-specific controls.
