# Layout System Documentation

This document provides an overview of the layout system used in the POS application, specifically focusing on how element heights and spacing are determined.

## Navbar Heights

The application uses a consistent navbar height system across different screen sizes:

| Breakpoint | Height Class | Pixel Value |
|------------|--------------|-------------|
| Mobile     | h-12         | 48px        |
| md         | h-16         | 64px        |
| lg         | h-20         | 80px        |
| wide       | h-20         | 80px        |

These values are defined in the `layoutConstants.ts` utility file to ensure consistency.

## Content Container Heights

Content containers should adjust their heights based on the navbar size at different breakpoints. This is achieved by using calc values:

```css
h-[calc(100vh-48px)] md:h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] wide:h-[calc(100vh-80px)]
```

## Utility Functions

To make it easier to maintain consistency, we provide several utility functions:

- `getNavbarHeightClasses()`: Returns the classes for navbar heights
- `getNavbarMinHeightClasses()`: Returns min-height classes for logo container
- `getFullHeightClasses()`: Returns the calc classes for content containers

## PageContainer Component

The `PageContainer` component is a reusable wrapper that applies the correct height calculations automatically. Use this component for all new pages to ensure layout consistency.

Example usage:

```tsx
import { Navbar } from '../components/Navbar';
import { PageContainer } from '../components/PageContainer';

export function YourPage() {
  return (
    <>
      <Navbar />
      <PageContainer>
        {/* Your page content here */}
      </PageContainer>
    </>
  );
}
```

## Logo Sizes

The merchant logo uses the following sizes across breakpoints:

| Breakpoint | Height | Max Width    |
|------------|--------|--------------|
| Mobile     | h-8    | max-w-[160px]|
| md         | h-10   | max-w-[220px]|
| lg         | h-14   | max-w-[280px]|
| wide       | h-14   | max-w-[300px]|

## Guidelines for Maintaining Consistency

1. Always use the provided utility functions or PageContainer component for new pages
2. Don't hardcode navbar or container heights; use the constants
3. When modifying layout-related values, update them in the layoutConstants.ts file
4. If you need to change navbar heights, update all related constants

By following these guidelines, we can ensure a consistent layout across the application and make future changes easier to implement.