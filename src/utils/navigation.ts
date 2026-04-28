/**
 * Navigation utility functions
 */

/**
 * Smoothly scroll to an element identified by a selector
 * @param href - CSS selector (e.g., '#about', '#contact')
 */
export const scrollToSection = (href: string): void => {
  const element = document.querySelector(href);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};
