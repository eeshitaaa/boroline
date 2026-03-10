(() => {
  const ENDPOINT =
    "https://www.birdsofparadyes.com/collections/semi-permanent-hair-color/products.json?limit=250";

  const grid = document.getElementById("grid");
  const cardTemplate = document.getElementById("card-template");
  const count = document.getElementById("count");
  const search = document.getElementById("search");
  const typeFilter = document.getElementById("type-filter");
  const sort = document.getElementById("sort");
  const empty = document.getElementById("empty");
  const refreshLoader = document.getElementById("refresh-loader");
  const loaderBottle = document.getElementById("loader-bottle");

  let products = [];
  const bottleImages = [
    "https://cdn.shopify.com/s/files/1/0533/6006/6741/files/Jars_Bleach_Listing_2024_6ab3a533-eba2-4cbd-9386-619d45834673.jpg?v=1768276802",
    "https://cdn.shopify.com/s/files/1/0533/6006/6741/files/Jars_Bleach_Listing_2024.jpg?v=1746695231",
    "https://cdn.shopify.com/s/files/1/0533/6006/6741/files/Sapphire_Navy_24acb683-790f-4438-8dcc-73f2533f284b.jpg?v=1746695493",
    "https://cdn.shopify.com/s/files/1/0533/6006/6741/files/Superba_Aqua_202bf3c5-0f2a-4cb0-b439-05bbce2c4e2b.jpg?v=1746695162",
    "https://cdn.shopify.com/s/files/1/0533/6006/6741/files/6_28c32df8-7543-4111-9530-41e7c1705020.jpg?v=1746691993"
  ];
  const lastBottleKey = "paradyes-loader-last-index";
  const fallbackProducts = [
    {
      title: "Ruby Wine Semi-Permanent Hair Color",
      handle: "ruby-wine-semi-permanent-hair-color",
      images: [
        { src: "https://cdn.shopify.com/s/files/1/0533/6006/6741/files/2_1910163a-51c5-420e-a199-35fe6c50f144.jpg?v=1746692031" }
      ],
      product_type: "Semi-Permanent Hair Color",
      variants: [{ price: "599.00", compare_at_price: null }]
    },
    {
      title: "Sapphire Navy Semi-Permanent Hair Color",
      handle: "sapphire-navy-semi-permanent-hair-color",
      images: [
        { src: "https://cdn.shopify.com/s/files/1/0533/6006/6741/files/Sapphire_Navy_24acb683-790f-4438-8dcc-73f2533f284b.jpg?v=1746695493" }
      ],
      product_type: "Semi-Permanent Hair Color",
      variants: [{ price: "599.00", compare_at_price: null }]
    },
    {
      title: "Amethyst Plum Semi-Permanent Hair Color",
      handle: "amethyst-plum-semi-permanent-hair-color",
      images: [
        { src: "https://cdn.shopify.com/s/files/1/0533/6006/6741/files/100_21f07912-74fc-46d5-ae1d-ae9a4860110f.jpg?v=1746691774" }
      ],
      product_type: "Semi-Permanent Hair Color",
      variants: [{ price: "599.00", compare_at_price: null }]
    }
  ];

  function setRandomBottle() {
    if (!loaderBottle) return;
    if (bottleImages.length === 0) return;
    let lastIndex = NaN;
    try {
      lastIndex = Number(localStorage.getItem(lastBottleKey));
    } catch (error) {
      lastIndex = NaN;
    }
    let randomIndex = Math.floor(Math.random() * bottleImages.length);

    if (bottleImages.length > 1 && Number.isInteger(lastIndex) && randomIndex === lastIndex) {
      randomIndex = (randomIndex + 1) % bottleImages.length;
    }

    loaderBottle.src = bottleImages[randomIndex];
    try {
      localStorage.setItem(lastBottleKey, String(randomIndex));
    } catch (error) {
      // Ignore storage failures and continue loading.
    }
  }

  function hideLoader() {
    if (!refreshLoader) return;
    refreshLoader.classList.add("is-hidden");
  }

  function normalizeTitle(title) {
    if (!title) return "";
    return title.replace(/Lovelang/gi, "Lover's Latte");
  }

  function formatMoney(value) {
    const amount = Number(value || 0);
    return `Rs. ${amount.toFixed(2)}`;
  }

  function classifyType(title) {
    const text = (title || "").toLowerCase();
    if (text.includes("timeless")) return "timeless";
    if (text.includes("glossy")) return "glossy";
    return "other";
  }

  function getFilteredProducts() {
    const term = (search.value || "").trim().toLowerCase();
    const type = typeFilter.value;
    const sortValue = sort.value;

    let items = products.filter((item) => {
      const title = (item.title || "").toLowerCase();
      const typeMatch = type === "all" || classifyType(item.title) === type;
      const searchMatch = !term || title.includes(term);
      return typeMatch && searchMatch;
    });

    if (sortValue === "title-asc") {
      items = items.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortValue === "title-desc") {
      items = items.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortValue === "price-asc") {
      items = items.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortValue === "price-desc") {
      items = items.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return items;
  }

  function renderProducts() {
    const items = getFilteredProducts();
    grid.innerHTML = "";

    const fragment = document.createDocumentFragment();

    items.forEach((product) => {
      const node = cardTemplate.content.cloneNode(true);

      const link = node.querySelector(".card-media-link");
      const image = node.querySelector(".card-image");
      const title = node.querySelector(".card-title");
      const type = node.querySelector(".card-type");
      const price = node.querySelector(".price");
      const compare = node.querySelector(".compare-price");

      const productUrl = `https://www.birdsofparadyes.com/products/${product.handle}`;
      const imageUrl = product.images?.[0]?.src || "";

      link.href = productUrl;
      image.src = imageUrl;
      image.alt = product.title;
      title.textContent = normalizeTitle(product.title);
      type.textContent = product.product_type || "Semi-Permanent Hair Color";
      price.textContent = formatMoney(product.variants?.[0]?.price);

      const compareValue = Number(product.variants?.[0]?.compare_at_price || 0);
      const priceValue = Number(product.variants?.[0]?.price || 0);
      if (compareValue > priceValue) {
        compare.textContent = formatMoney(compareValue);
        compare.classList.remove("is-hidden");
      } else {
        compare.classList.add("is-hidden");
      }

      fragment.appendChild(node);
    });

    grid.appendChild(fragment);
    count.textContent = `${items.length} products`;
    empty.classList.toggle("is-hidden", items.length !== 0);
  }

  async function loadProducts() {
    try {
      const response = await Promise.race([
        fetch(ENDPOINT),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out")), 7000)
        )
      ]);
      if (!response.ok) throw new Error("Failed to load products");
      const payload = await response.json();
      products = (payload.products || []).map((item) => ({
        title: item.title,
        handle: item.handle,
        images: item.images,
        product_type: item.product_type,
        price: item.variants?.[0]?.price,
        variants: item.variants || []
      }));
      if (products.length === 0) {
        products = fallbackProducts;
      }
      renderProducts();
      setTimeout(hideLoader, 700);
    } catch (error) {
      products = fallbackProducts;
      renderProducts();
      count.textContent = `${products.length} products (fallback)`;
      setTimeout(hideLoader, 700);
    }
  }

  [search, typeFilter, sort].forEach((control) => {
    control.addEventListener("input", renderProducts);
    control.addEventListener("change", renderProducts);
  });

  setRandomBottle();
  // Failsafe: never keep overlay forever if any runtime error happens.
  setTimeout(hideLoader, 3500);
  loadProducts();
})();
