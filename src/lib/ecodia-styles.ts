/**
 * Ecodia Shared Styles & Classname Utilities
 * Extracted from ecodia-site design system for consistency
 *
 * Usage:
 * import { inputStylesBright, buttonStyles } from '@/lib/ecodia-styles';
 * <input className={inputStylesBright} />
 */

// ============================================================================
// Input Styles (Light Theme)
// ============================================================================
export const inputStylesBright =
  "w-full rounded-lg bg-[#edf0ef] text-[#0e1511] placeholder:text-[#a8b4b0] border border-[#c6cecc] px-3.5 py-2.5 outline-none ring-2 ring-transparent ring-offset-2 ring-offset-white focus:ring-[#7fd069] focus:border-[#7fd069] transition-colors duration-200 disabled:opacity-60 disabled:bg-[#f6f8f7]";

// ============================================================================
// Label Styles
// ============================================================================
export const labelStylesBright =
  "block text-xs font-semibold text-[#000000] mb-1.5";

// ============================================================================
// Checkbox Styles
// ============================================================================
export const checkboxStylesBright = "accent-[#7fd069] scale-110";

// ============================================================================
// Ecodia-Site Card Styles
// ============================================================================

/**
 * Brutalist card with offset shadow (ecodia-site signature)
 * Asymmetric border radius, organic feel
 */
export const cardBrutalistClasses =
  "bg-white border-3 border-[#396041] rounded-[40px_15px_45px_20px] shadow-[12px_12px_0px_0px_#26492d] transition-all duration-300 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[16px_16px_0px_0px_#26492d]";

/**
 * Standard elevated card with glassmorphism
 */
export const cardGlassClasses =
  "bg-[var(--surface-elevated)] backdrop-blur-[12px] border border-[var(--border-subtle)] rounded-lg shadow-lg";

/**
 * Interactive card that lifts on hover
 */
export const cardInteractiveClasses =
  "bg-[var(--surface-elevated)] backdrop-blur-[12px] border border-[var(--border-subtle)] rounded-lg shadow-lg transition-all duration-160 hover:translate-y-[-2px] hover:shadow-[0_8px_20px_rgba(127,208,105,0.25)] active:scale-[0.98]";

// ============================================================================
// Button Styles
// ============================================================================

/**
 * Primary button: Forest → Mint gradient with spring animation
 */
export const buttonPrimaryClasses =
  "px-5 py-3 rounded-full font-bold text-white bg-gradient-to-r from-[#2D4A33] via-[#396041] to-[#7FD069] border border-[rgba(246,255,249,0.14)] shadow-[0_14px_28px_rgba(15,23,18,0.22),0_6px_12px_rgba(57,96,65,0.22),inset_0_1px_0_rgba(246,255,249,0.16)] transition-all duration-120 hover:translate-y-[-2px] hover:shadow-[0_18px_36px_rgba(15,23,18,0.26),0_8px_16px_rgba(57,96,65,0.24)] active:scale-[0.96]";

/**
 * Secondary button: Gold gradient
 */
export const buttonSecondaryClasses =
  "px-5 py-3 rounded-full font-bold text-[#1C1408] bg-gradient-to-br from-[#ab872d] via-[#F4D35E] to-[#FFE59A] border border-[rgba(244,211,94,0.70)] shadow-[0_14px_28px_rgba(15,23,18,0.16),0_6px_12px_rgba(244,211,94,0.22),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all duration-120 hover:translate-y-[-2px] hover:shadow-[0_18px_36px_rgba(15,23,18,0.18)] active:scale-[0.96]";

/**
 * Tertiary button: White/Cream with subtle mint ring on focus
 */
export const buttonTertiaryClasses =
  "px-5 py-3 rounded-full font-bold text-[#0F1712] bg-gradient-to-b from-white to-[#F6FFF9] border border-[#e7ece9] shadow-[0_10px_22px_rgba(15,23,18,0.10),inset_0_1px_0_rgba(255,255,255,0.75)] transition-all duration-120 hover:translate-y-[-2px] hover:border-[rgba(127,208,105,0.55)] hover:shadow-[0_14px_28px_rgba(15,23,18,0.12),0_0_0_3px_rgba(127,208,105,0.18)] active:scale-[0.96]";

/**
 * Danger button: Red gradient
 */
export const buttonDangerClasses =
  "px-5 py-3 rounded-full font-bold text-[#B91C1C] bg-gradient-to-b from-[#FEF2F2] to-[#FEE2E2] border border-[#FECACA] shadow-[0_12px_24px_rgba(15,23,18,0.12),inset_0_1px_0_rgba(255,255,255,0.65)] transition-all duration-120 hover:translate-y-[-2px] active:scale-[0.96] active:bg-gradient-to-b active:from-[#EF4444] active:to-[#DC2626] active:text-white";

/**
 * Alive button: Mint-Gold gradient for hero CTAs
 */
export const buttonAliveClasses =
  "px-5 py-3 rounded-full font-bold text-[#0c1310] bg-gradient-to-r from-[#7FD069] to-[#F4D35E] shadow-[0_8px_20px_-4px_rgba(127,208,105,0.4)] transition-all duration-120 hover:translate-y-[-2px] active:scale-[0.96] font-extrabold tracking-wider";

/**
 * Butter nav pill: Compact, animated, subtle active state
 */
export const buttonButterClasses =
  "inline-flex items-center gap-2 h-10 px-3 rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-base)] font-semibold text-sm transition-all duration-360 cubic-bezier-[0.22,1,0.36,1] hover:bg-[var(--surface-subtle)] hover:translate-y-[-1px] hover:scale-[1.01] active:scale-[0.985] data-[active=true]:bg-gradient-to-r data-[active=true]:from-[var(--ec-mint-50)] data-[active=true]:to-[var(--ec-gold-50)] data-[active=true]:border-[var(--ec-mint-300)] data-[active=true]:text-[var(--ec-forest-900)] data-[active=true]:shadow-[0_8px_20px_rgba(127,208,105,0.25)]";

// ============================================================================
// Chip Styles
// ============================================================================

/**
 * Primary chip: Mint background
 */
export const chipPrimaryClasses =
  "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#7fd069] text-[#0b2e13] border border-[#6ec45c] transition-all duration-200 hover:brightness-[1.07] active:scale-[0.95]";

/**
 * Secondary chip: Gold background
 */
export const chipSecondaryClasses =
  "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#f4d35e] text-[#3a2a00] border border-[#eec84b] transition-all duration-200 hover:brightness-[1.05] active:scale-[0.95]";

// ============================================================================
// Text & Typography
// ============================================================================

/**
 * Heading with Fjalla One (ecodia-site signature)
 */
export const headingClasses =
  "font-[var(--ec-font-head)] font-bold tracking-wider text-[var(--text-strong)]";

/**
 * Body text with Inter and body line height
 */
export const bodyClasses =
  "font-[var(--ec-font-body)] text-[var(--text-base)] leading-[var(--ec-lh-body)]";

/**
 * Muted/secondary text
 */
export const mutedClasses = "text-[var(--text-muted)]";

/**
 * Gradient text: Mint to Forest
 */
export const gradientTextClasses =
  "bg-gradient-to-r from-[#7fd069] to-[#396041] bg-clip-text text-transparent";

// ============================================================================
// Layout & Container
// ============================================================================

/**
 * Main page container with safe area padding
 */
export const containerPageClasses =
  "w-full max-w-6xl mx-auto px-[calc(var(--safe-left)+var(--space-3))] pr-[calc(var(--safe-right)+var(--space-3))]";

/**
 * Roomy page container with top/bottom padding
 */
export const containerPageRoomyClasses =
  "container-page--roomy";

/**
 * Flex stack layout (vertical with spacing)
 */
export const stackClasses = "flex flex-col gap-[var(--space-3)]";

/**
 * Grid auto-fit (responsive columns)
 */
export const gridAutofitClasses =
  "grid gap-[var(--space-3)] auto-cols-[minmax(16rem,1fr)]";

// ============================================================================
// Mobile & Touch
// ============================================================================

/**
 * Native iOS scroll behavior
 */
export const scrollNativeClasses =
  "overflow-y-auto -webkit-overflow-scrolling-touch overscroll-y-contain";

/**
 * Touch target (44px minimum for accessibility)
 */
export const touchTargetClasses = "min-w-[44px] min-h-[44px]";

/**
 * Active push animation: Scale down on press
 */
export const activePushClasses =
  "transition-transform duration-100 cubic-bezier-[0.2,0,0,1] active:scale-[0.96]";

// ============================================================================
// Visual Effects
// ============================================================================

/**
 * Glassmorphism blur overlay
 */
export const glassOverlayClasses =
  "backdrop-blur-[12px] -webkit-backdrop-filter-blur-[12px] bg-[var(--surface-glass)]";

/**
 * Paper texture (noise overlay)
 */
export const texturepaperClasses = "tx-paper";

/**
 * Dot grid background
 */
export const dotGridClasses = "tx-dotgrid";

/**
 * Eco brutalist card shadow
 */
export const brutalistShadowClasses =
  "shadow-[12px_12px_0px_0px_var(--ec-forest-900)]";

/**
 * Eco glow effect (mint shadow)
 */
export const ecoGlowClasses = "shadow-[0_8px_20px_rgba(127,208,105,0.25)]";

// ============================================================================
// Animation Classes
// ============================================================================

/**
 * Float up animation
 */
export const animateFloatClasses = "animate-floatUp";

/**
 * Pulse animation
 */
export const animatePulseClasses = "animate-pulse";

/**
 * Eco mint pulse
 */
export const animateEcoMintPulseClasses = "animate-eco-mint-pulse";

/**
 * Eco float (ecodia-site signature)
 */
export const animateEcoFloatClasses = "animate-eco-float";

/**
 * Eco glow (breathing glow)
 */
export const animateEcoGlowClasses = "animate-eco-glow";

/**
 * Eco bounce
 */
export const animateEcoBounceClasses = "animate-eco-bounce";

// ============================================================================
// Utility Combinations
// ============================================================================

/**
 * Complete primary CTA button (button + primary + touch target)
 */
export const ctaPrimaryClasses = `
  btn btn-primary touch-target active-push
  inline-flex items-center justify-center
  font-bold whitespace-nowrap
`;

/**
 * Complete interactive card (card + interactive + touch friendly)
 */
export const cardInteractiveFullClasses = `
  card card-interactive
  touch-target p-4
  tappable-card
`;

/**
 * Complete form field (input + label wrapper)
 */
export const formFieldClasses = `
  flex flex-col gap-1.5
  mb-4
`;

/**
 * Complete modal backdrop
 */
export const modalBackdropClasses = `
  fixed inset-0
  bg-black/50
  backdrop-blur-sm
  z-[var(--ec-z-overlay)]
  flex items-center justify-center
`;

/**
 * Complete modal content
 */
export const modalContentClasses = `
  relative
  max-w-md w-full mx-4
  rounded-xl
  bg-[var(--surface-base)]
  shadow-[var(--ec-elev-4)]
  p-6
  z-[var(--ec-z-modal)]
`;
