// Updates price, availability badge, WhatsApp link, image and description when
// a variant is picked. Each radio carries its pre-rendered values in data-* attributes.
export function initVariantPicker() {
  document.querySelectorAll<HTMLElement>('.product').forEach((card) => {
    const image = card.querySelector<HTMLImageElement>('[data-image-display]');
    const description = card.querySelector<HTMLElement>('[data-description-display]');
    const price = card.querySelector<HTMLElement>('[data-price-display]');
    const badge = card.querySelector<HTMLElement>('[data-badge-display]');
    const order = card.querySelector<HTMLAnchorElement>('[data-order]');
    const baseBadgeClass = 'text-xs px-2 py-1 rounded-full';

    card.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((radio) =>
      radio.addEventListener('change', () => {
        const { price: priceText, href, badgeText, badgeClass, image: src, description: text } = radio.dataset;
        if (image && src) image.src = src;
        if (description && text) description.textContent = text;
        if (price && priceText) price.textContent = priceText;
        if (order && href) order.href = href;
        if (badge) {
          badge.textContent = badgeText ?? '';
          badge.className = badgeText ? `${baseBadgeClass} ${badgeClass}` : `${baseBadgeClass} hidden`;
        }
      }),
    );
  });
}
