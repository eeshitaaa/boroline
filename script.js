(() => {
  const ENDPOINT = "https://shop.boroline.com/collections/all/products.json?limit=250";

  const grid = document.getElementById("grid");
  const cardTemplate = document.getElementById("card-template");
  const count = document.getElementById("count");
  const search = document.getElementById("search");
  const chips = Array.from(document.querySelectorAll(".chip"));
  const navFilters = Array.from(document.querySelectorAll(".nav-filter"));
  const empty = document.getElementById("empty");
  const loadMoreBtn = document.getElementById("load-more");
  const refreshLoader = document.getElementById("refresh-loader");
  const loaderProduct = document.getElementById("loader-product");

  let products = [];
  let activeChip = "all";
  const pageSize = 8;
  let visibleCount = pageSize;

  const fallbackProducts = [
    {
      title: "Boroline Antiseptic Cream",
      handle: "boroline-antiseptic-ayurvedic-cream-40-gm-soften-smoothen-dry-chapped-lips-repair-cracked-heels-pack-of-1",
      images: [{ src: "https://shop.boroline.com/cdn/shop/files/Shopify_Product_Images_9.png?v=1746010295" }],
      product_type: "Cream",
      variants: [{ price: "80.00", compare_at_price: null }]
    },
    {
      title: "Bo Lips Nourishing Lip Balm",
      handle: "boroline-bo-lips-vanilla-flavoured-lip-balm-with-almonds-oil",
      images: [{ src: "https://shop.boroline.com/cdn/shop/files/Shopify_Product_Images_10.png?v=1746010295" }],
      product_type: "Lip Balm",
      variants: [{ price: "75.00", compare_at_price: null }]
    },
    {
      title: "Suthol Active Neem Liquid",
      handle: "borolines-suthol-active-antiseptic-liquid-with-neem-turmeric-marigold-aloevera-stop-prickly-heat-rashes-summer-skin-itchiness-body-hygiene-liquid",
      images: [{ src: "https://shop.boroline.com/cdn/shop/files/Shopify_Product_Images_7.png?v=1746010295" }],
      product_type: "Liquid",
      variants: [{ price: "47.00", compare_at_price: null }]
    }
  ];

  const loaderImages = [
    "https://shop.boroline.com/cdn/shop/files/Shopify_Product_Images_9.png?v=1746010295",
    "https://shop.boroline.com/cdn/shop/files/Shopify_Product_Images_10.png?v=1746010295",
    "https://shop.boroline.com/cdn/shop/files/Shopify_Product_Images_7.png?v=1746010295"
  ];

  function setLoaderImage() {
    if (!loaderProduct) return;
    const idx = Math.floor(Math.random() * loaderImages.length);
    loaderProduct.src = loaderImages[idx];
  }

  function hideLoader() {
    if (!refreshLoader) return;
    refreshLoader.classList.add("is-hidden");
  }

  function formatMoney(value) {
    const amount = Number(value || 0);
    return `Rs. ${amount.toFixed(2)}`;
  }

  function matchesChip(product) {
    if (activeChip === "all") return true;
    const type = (product.product_type || "").toLowerCase();
    return type === activeChip.toLowerCase();
  }

  function getFilteredProducts() {
    const term = (search.value || "").trim().toLowerCase();

    return products.filter((product) => {
      const title = (product.title || "").toLowerCase();
      const searchMatch = !term || title.includes(term);
      return searchMatch && matchesChip(product);
    });
  }

  function renderProducts() {
    const allItems = getFilteredProducts();
    const items = allItems.slice(0, visibleCount);
    grid.innerHTML = "";

    const fragment = document.createDocumentFragment();

    items.forEach((product) => {
      const node = cardTemplate.content.cloneNode(true);

      const link = node.querySelector(".card-link");
      const image = node.querySelector(".card-image");
      const title = node.querySelector(".card-title");
      const type = node.querySelector(".card-type");
      const price = node.querySelector(".price");
      const compare = node.querySelector(".compare-price");
      const cardCta = node.querySelector(".card-cta");

      const productUrl = `https://shop.boroline.com/products/${product.handle}`;
      const imageUrl = product.images?.[0]?.src || "";
      const primaryVariant = product.variants?.[0] || {};

      link.href = productUrl;
      image.src = imageUrl;
      image.alt = product.title;
      cardCta.href = productUrl;
      title.textContent = product.title;
      type.textContent = product.product_type || "Boroline Product";
      price.textContent = formatMoney(primaryVariant.price);

      const compareValue = Number(primaryVariant.compare_at_price || 0);
      const priceValue = Number(primaryVariant.price || 0);
      if (compareValue > priceValue) {
        compare.textContent = formatMoney(compareValue);
        compare.classList.remove("is-hidden");
      } else {
        compare.classList.add("is-hidden");
      }

      fragment.appendChild(node);
    });

    grid.appendChild(fragment);
    count.textContent = `${items.length} of ${allItems.length} products`;
    empty.classList.toggle("is-hidden", allItems.length !== 0);

    if (loadMoreBtn) {
      const shouldShow = allItems.length > visibleCount;
      loadMoreBtn.classList.toggle("is-hidden", !shouldShow);
    }
  }

  async function loadProducts() {
    try {
      const response = await Promise.race([
        fetch(ENDPOINT),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timed out")), 7000))
      ]);
      if (!response.ok) throw new Error("Fetch failed");

      const payload = await response.json();
      products = payload.products || [];

      if (!products.length) {
        products = fallbackProducts;
      }

      renderProducts();
      setTimeout(hideLoader, 600);
    } catch (error) {
      products = fallbackProducts;
      renderProducts();
      count.textContent = `${products.length} products (fallback)`;
      setTimeout(hideLoader, 600);
    }
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((item) => item.classList.remove("is-on"));
      chip.classList.add("is-on");
      activeChip = chip.dataset.chip || "all";
      navFilters.forEach((item) => item.classList.toggle("is-on", (item.dataset.chip || "all") === activeChip));
      visibleCount = pageSize;
      renderProducts();
    });
  });

  navFilters.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeChip = btn.dataset.chip || "all";
      navFilters.forEach((item) => item.classList.toggle("is-on", item === btn));
      chips.forEach((chip) => chip.classList.toggle("is-on", (chip.dataset.chip || "all") === activeChip));
      visibleCount = pageSize;
      document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
      renderProducts();
    });
  });

  if (search) {
    search.addEventListener("input", () => {
      visibleCount = pageSize;
      renderProducts();
    });
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      visibleCount += pageSize;
      renderProducts();
    });
  }

  setLoaderImage();
  setTimeout(hideLoader, 3500);
  loadProducts();
})();
