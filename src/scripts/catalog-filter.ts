// Client-side search + category filter for the catalog.
// Expects: #search input, .chip buttons with data-category, .product items with
// data-category / data-search, and an #empty message.
export function initCatalogFilter(activeChipClasses: string[], inactiveChipClasses: string[] = []) {
  const search = document.getElementById('search') as HTMLInputElement;
  const chips = document.querySelectorAll<HTMLButtonElement>('.chip');
  const products = document.querySelectorAll<HTMLElement>('.product');
  const empty = document.getElementById('empty')!;
  let activeCategory = '';

  const apply = () => {
    const term = search.value.trim().toLowerCase();
    let visible = 0;
    products.forEach((product) => {
      const matches =
        (!activeCategory || product.dataset.category === activeCategory) &&
        (!term || product.dataset.search!.includes(term));
      // The `hidden` attribute would lose against the `flex` utility, so toggle the class.
      product.classList.toggle('hidden', !matches);
      if (matches) visible++;
    });
    empty.classList.toggle('hidden', visible > 0);
  };

  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      activeCategory = chip.dataset.category ?? '';
      chips.forEach((c) => {
        const active = c === chip;
        activeChipClasses.forEach((cls) => c.classList.toggle(cls, active));
        inactiveChipClasses.forEach((cls) => c.classList.toggle(cls, !active));
      });
      apply();
    }),
  );
  search.addEventListener('input', apply);
}
