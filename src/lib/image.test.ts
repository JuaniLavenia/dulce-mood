import { describe, expect, it } from 'vitest';
import { optimizeImage } from './image';

describe('optimizeImage', () => {
  it('adds format, quality and size transformations to Cloudinary URLs', () => {
    expect(optimizeImage('https://res.cloudinary.com/dulcemood/image/upload/v1712/cookies.jpg')).toBe(
      'https://res.cloudinary.com/dulcemood/image/upload/f_auto,q_auto,w_800,c_limit/v1712/cookies.jpg',
    );
  });

  it('chains after transformations already present in the URL', () => {
    expect(optimizeImage('https://res.cloudinary.com/dulcemood/image/upload/e_sharpen/v1712/cookies.jpg')).toBe(
      'https://res.cloudinary.com/dulcemood/image/upload/f_auto,q_auto,w_800,c_limit/e_sharpen/v1712/cookies.jpg',
    );
  });

  it('does not add the transformation twice', () => {
    const optimized = 'https://res.cloudinary.com/dulcemood/image/upload/f_auto,q_auto,w_800,c_limit/v1712/cookies.jpg';
    expect(optimizeImage(optimized)).toBe(optimized);
  });

  it('leaves URLs from other hosts and empty values unchanged', () => {
    expect(optimizeImage('https://example.com/image/upload/cookies.jpg')).toBe('https://example.com/image/upload/cookies.jpg');
    expect(optimizeImage('')).toBe('');
  });
});
