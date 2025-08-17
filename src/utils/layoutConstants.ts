// Layout constants for consistent spacing and sizing throughout the app

/**
 * Navbar heights for different breakpoints
 * These should be kept in sync with the Navbar component's height classes
 */
export const NAVBAR_HEIGHTS = {
  // Mobile (default)
  DEFAULT: 48, // h-12 (12 * 4 = 48px)
  // Medium screens (md)
  MD: 64, // h-16 (16 * 4 = 64px)
  // Large screens (lg)
  LG: 80, // h-20 (20 * 4 = 80px)
  // Extra wide screens (wide)
  WIDE: 80, // h-20 (20 * 4 = 80px)
};

/**
 * Returns Tailwind classes for calculating full-height containers that account for the navbar
 * Use this for main content containers to ensure they fill the available viewport heigh
 * Example: getFullHeightClasses() => "h-[calc(100vh-48px)] md:h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] wide:h-[calc(100vh-80px)]"
 */
export function getFullHeightClasses(): string {
  return `h-[calc(100vh-${NAVBAR_HEIGHTS.DEFAULT}px)] md:h-[calc(100vh-${NAVBAR_HEIGHTS.MD}px)] lg:h-[calc(100vh-${NAVBAR_HEIGHTS.LG}px)] wide:h-[calc(100vh-${NAVBAR_HEIGHTS.WIDE}px)]`;
}

/**
 * Returns Tailwind classes for navbar heights across breakpoints
 * Example: getNavbarHeightClasses() => "h-12 md:h-16 lg:h-20 wide:h-20"
 */
export function getNavbarHeightClasses(): string {
  return `h-12 md:h-16 lg:h-20 wide:h-20`;
}

/**
 * Returns Tailwind classes for minimum heights of navbar content containers
 * Example: getNavbarMinHeightClasses() => "min-h-[48px] md:min-h-[64px] lg:min-h-[80px] wide:min-h-[80px]"
 */
export function getNavbarMinHeightClasses(): string {
  return `min-h-[${NAVBAR_HEIGHTS.DEFAULT}px] md:min-h-[${NAVBAR_HEIGHTS.MD}px] lg:min-h-[${NAVBAR_HEIGHTS.LG}px] wide:min-h-[${NAVBAR_HEIGHTS.WIDE}px]`;
}