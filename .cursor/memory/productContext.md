# Product Context: Cosmetic Checker

## Core Problem
Cosmetic and personal care products contain complex, scientific ingredient lists (INCI names) that are difficult for the average consumer to read, understand, or evaluate. Consumers want to quickly know:
- Is this product safe for my skin type?
- Does it contain any ingredients I am allergic to, or want to avoid (e.g., parabens, sulfates, silicones, drying alcohols)?
- What are the active/beneficial ingredients (e.g., niacinamide, hyaluronic acid, salicylic acid)?
- Are there any potential irritants or acne-triggering ingredients?

## Solution
**Cosmetic Checker** is a fast, lightweight, and modern web application optimized for mobile use that allows users to instantly analyze any cosmetic product by simply uploading or taking a photo of its ingredient label or packaging.

The application:
1. Accepts image uploads (supporting modern camera formats like HEIC/HEIF alongside standard JPEG, PNG, and WebP).
2. Performs client-side image optimization and HEIC conversion (so iPhone users have a seamless experience).
3. Submits the processed image to a secure backend endpoint (`/api/check`).
4. Extracts text from the image and analyzes the ingredients (to be implemented).
5. Displays a clear, actionable breakdown of the ingredients, grouping them by safety, purpose, and skin compatibility (to be implemented).

## Key User Experience (UX) Goals
- **Mobile-First Design**: Designed primarily for mobile screens since users will likely take photos of physical products in stores or their bathrooms.
- **Minimalist & Clean Aesthetic**: Soft slate/indigo colors, generous spacing, smooth loading states, and elegant micro-interactions.
- **Zero Friction**: Quick tap-to-upload, immediate feedback during image processing, and clear state transitions.
- **Robust Image Processing**: Graceful handling of HEIC (standard iOS format), converting it client-side to JPEG to prevent server-side format compatibility issues.

## Current & Target Features
- [x] Responsive layout with sticky header and elegant container.
- [x] Interactive `ImageUpload` supporting drag-and-drop and click-to-pick.
- [x] Client-side HEIC-to-JPEG conversion via `heic2any`.
- [x] Image preview with remove/reset capability.
- [ ] Backend route `/api/check` for extracting and analyzing ingredients.
- [ ] Analysis result screen showing safety ratings, ingredient classifications, and helpful insights.
