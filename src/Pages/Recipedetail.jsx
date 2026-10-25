import { useEffect, useState, useMemo, useRef } from "react";
import RecipeCard from "../components/Recipecard";
import LoadingStatus from "../components/LoadingStatus";
import SearchInput from "../components/SearchInput";
import {
  filterMealsByArea,
  filterMealsByCategory,
  filterMealsByIngredient,
  searchMealsByName,
} from "../api/mealDb";
import { FaSearch, FaFilter, FaGlobeAmericas, FaUtensils, FaPepperHot, FaLayerGroup, FaRedoAlt } from "react-icons/fa";
import "../styles/recipe.css";

const CATEGORIES = [
  "All",
  "Beef",
  "Breakfast",
  "Chicken",
  "Dessert",
  "Lamb",
  "Miscellaneous",
  "Pasta",
  "Pork",
  "Seafood",
  "Side",
  "Starter",
  "Vegan",
  "Vegetarian",
];

const CUISINES = [
  "All",
  "American",
  "British",
  "Canadian",
  "Chinese",
  "Croatian",
  "Dutch",
  "Egyptian",
  "Filipino",
  "French",
  "Greek",
  "Indian",
  "Irish",
  "Italian",
  "Jamaican",
  "Japanese",
  "Kenyan",
  "Malaysian",
  "Mexican",
  "Moroccan",
  "Polish",
  "Portuguese",
  "Russian",
  "Spanish",
  "Thai",
  "Tunisian",
  "Turkish",
  "Ukrainian",
  "Vietnamese",
];

const POPULAR_INGREDIENTS = [
  "Chicken",
  "Beef",
  "Tomato",
  "Cheese",
  "Garlic",
  "Potato",
  "Salmon",
  "Egg",
  "Onion",
  "Lemon",
  "Pasta",
  "Rice",
  "Mushroom",
  "Pork",
  "Avocado",
];

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search modes: 'name' | 'ingredient' | 'cuisine' | 'category'
  const [searchMode, setSearchMode] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [viewMode, setViewMode] = useState("paged"); // 'paged' | 'infinite'
  const [infiniteLimit, setInfiniteLimit] = useState(12);

  const gridRef = useRef(null);

  // Load initial popular recipes on mount
  useEffect(() => {
    loadInitialRecipes();
  }, []);

  async function loadInitialRecipes() {
    setLoading(true);
    setError("");
    try {
      // Fetch diverse categories to build an impressive initial pool
      const initialCategories = ["Chicken", "Beef", "Pasta", "Vegetarian", "Seafood", "Dessert"];
      const responses = await Promise.all(
        initialCategories.map((cat) =>
          filterMealsByCategory(cat, { checkStatus: true })
        )
      );

      const allMeals = responses.flatMap((data) => data.meals || []);
      const uniqueMeals = Array.from(
        new Map(allMeals.map((meal) => [meal.idMeal, meal])).values()
      );

      setRecipes(uniqueMeals);
      setCurrentPage(1);
      setInfiniteLimit(12);
    } catch (err) {
      console.error(err);
      setError("Unable to load recipes. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Search submit
  async function handleSearch(e) {
    if (e) e.preventDefault();
    const query = searchQuery.trim();

    if (!query) {
      loadInitialRecipes();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const requestOptions = {
        checkStatus: true,
      };
      let data;
      if (searchMode === "name") {
        data = await searchMealsByName(query, requestOptions);
      } else if (searchMode === "ingredient") {
        data = await filterMealsByIngredient(query.toLowerCase(), requestOptions);
      } else if (searchMode === "cuisine") {
        data = await filterMealsByArea(query, requestOptions);
      } else if (searchMode === "category") {
        data = await filterMealsByCategory(query, requestOptions);
      }

      if (!data.meals || data.meals.length === 0) {
        setRecipes([]);
      } else {
        setRecipes(data.meals);
      }
      setCurrentPage(1);
      setInfiniteLimit(12);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch recipes matching your search.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Category selection
  async function handleCategorySelect(category) {
    setSelectedCategory(category);
    setSelectedCuisine("All");
    setSelectedIngredient("");
    setSearchQuery("");
    setCurrentPage(1);
    setInfiniteLimit(12);

    if (category === "All") {
      loadInitialRecipes();
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await filterMealsByCategory(category, { checkStatus: true });
      setRecipes(data.meals || []);
    } catch (err) {
      console.error(err);
      setError(`Unable to load ${category} recipes.`);
    } finally {
      setLoading(false);
    }
  }

  // Handle Cuisine selection
  async function handleCuisineSelect(cuisine) {
    setSelectedCuisine(cuisine);
    setSelectedCategory("All");
    setSelectedIngredient("");
    setSearchQuery("");
    setCurrentPage(1);
    setInfiniteLimit(12);

    if (cuisine === "All") {
      loadInitialRecipes();
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await filterMealsByArea(cuisine, { checkStatus: true });
      setRecipes(data.meals || []);
    } catch (err) {
      console.error(err);
      setError(`Unable to load ${cuisine} recipes.`);
    } finally {
      setLoading(false);
    }
  }

  // Handle Quick Ingredient chip
  async function handleIngredientSelect(ingredient) {
    setSelectedIngredient(ingredient);
    setSelectedCategory("All");
    setSelectedCuisine("All");
    setSearchQuery(ingredient);
    setSearchMode("ingredient");
    setCurrentPage(1);
    setInfiniteLimit(12);

    setLoading(true);
    setError("");
    try {
      const data = await filterMealsByIngredient(ingredient.toLowerCase(), {
        checkStatus: true,
      });
      setRecipes(data.meals || []);
    } catch (err) {
      console.error(err);
      setError(`Unable to load recipes with ${ingredient}.`);
    } finally {
      setLoading(false);
    }
  }

  // Reset all filters
  function handleResetFilters() {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedCuisine("All");
    setSelectedIngredient("");
    setSearchMode("name");
    setSortBy("featured");
    loadInitialRecipes();
  }

  // Sorted and filtered list
  const processedRecipes = useMemo(() => {
    let result = [...recipes];

    if (sortBy === "az") {
      result.sort((a, b) => a.strMeal.localeCompare(b.strMeal));
    } else if (sortBy === "za") {
      result.sort((a, b) => b.strMeal.localeCompare(a.strMeal));
    }

    return result;
  }, [recipes, sortBy]);

  // Paginated slices
  const totalPages = Math.ceil(processedRecipes.length / itemsPerPage) || 1;

  const displayedRecipes = useMemo(() => {
    if (viewMode === "infinite") {
      return processedRecipes.slice(0, infiniteLimit);
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedRecipes.slice(startIndex, startIndex + itemsPerPage);
  }, [processedRecipes, currentPage, itemsPerPage, viewMode, infiniteLimit]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleLoadMore = () => {
    setInfiniteLimit((prev) => prev + 12);
  };

  return (
    <main className="recipes-page">
      {/* =========================
          HERO HEADER
      ========================= */}
      <section className="recipes-header">
        <p className="recipes-small-title">CULINARY DISCOVERY</p>
        <h1>Explore Delicious Recipes</h1>
        <p className="recipes-description">
          Find your next favorite meal from thousands of international cuisines, ingredients, and categories.
        </p>
      </section>

      {/* =========================
          SEARCH MODE TABS
      ========================= */}
      <div className="search-mode-tabs-container">
        <div className="search-mode-tabs">
          <button
            type="button"
            className={`mode-tab ${searchMode === "name" ? "active" : ""}`}
            onClick={() => setSearchMode("name")}
          >
            <FaSearch /> By Recipe Name
          </button>
          <button
            type="button"
            className={`mode-tab ${searchMode === "ingredient" ? "active" : ""}`}
            onClick={() => setSearchMode("ingredient")}
          >
            <FaPepperHot /> By Main Ingredient
          </button>
          <button
            type="button"
            className={`mode-tab ${searchMode === "cuisine" ? "active" : ""}`}
            onClick={() => setSearchMode("cuisine")}
          >
            <FaGlobeAmericas /> By Cuisine / Area
          </button>
          <button
            type="button"
            className={`mode-tab ${searchMode === "category" ? "active" : ""}`}
            onClick={() => setSearchMode("category")}
          >
            <FaUtensils /> By Category
          </button>
        </div>
      </div>

      {/* =========================
          SEARCH FORM & CONTROLS
      ========================= */}
      <div className="search-controls-wrapper">
        <form className="recipe-search-enhanced" onSubmit={handleSearch}>
          <SearchInput
            wrapperClassName="search-input-group"
            iconClassName="search-input-icon"
            ariaLabel="Search recipes"
            placeholder={
              searchMode === "name"
                ? "Search by recipe name (e.g. Pasta, Curry, Pie, Burger)..."
                : searchMode === "ingredient"
                ? "Search by ingredient (e.g. Chicken, Garlic, Avocado, Cheese)..."
                : searchMode === "cuisine"
                ? "Search by cuisine (e.g. Italian, Mexican, Indian, Japanese)..."
                : "Search by category (e.g. Seafood, Dessert, Vegetarian)..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
          />
          <button type="submit" className="search-submit-btn">
            Search
          </button>
        </form>

        {/* Secondary dropdowns */}
        <div className="filter-dropdowns-row">
          <div className="dropdown-wrapper">
            <label>
              <FaGlobeAmericas /> Cuisine / Area:
            </label>
            <select
              value={selectedCuisine}
              onChange={(e) => handleCuisineSelect(e.target.value)}
            >
              {CUISINES.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "🌍 All Cuisines" : `${c} Cuisine`}
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown-wrapper">
            <label>
              <FaLayerGroup /> Sort By:
            </label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="featured">Featured / Popular</option>
              <option value="az">Name: A to Z</option>
              <option value="za">Name: Z to A</option>
            </select>
          </div>

          <div className="dropdown-wrapper">
            <label>
              <FaFilter /> View Style:
            </label>
            <div className="view-toggle-buttons">
              <button
                type="button"
                className={`toggle-btn ${viewMode === "paged" ? "active" : ""}`}
                onClick={() => setViewMode("paged")}
              >
                Pagination
              </button>
              <button
                type="button"
                className={`toggle-btn ${viewMode === "infinite" ? "active" : ""}`}
                onClick={() => setViewMode("infinite")}
              >
                Infinite Scroll
              </button>
            </div>
          </div>

          {(selectedCategory !== "All" || selectedCuisine !== "All" || selectedIngredient || searchQuery) && (
            <button
              type="button"
              className="reset-all-filters-btn"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              <FaRedoAlt /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* =========================
          POPULAR INGREDIENTS QUICK PILLS
      ========================= */}
      <div className="quick-tags-section">
        <span className="quick-tags-label">Popular Ingredients:</span>
        <div className="quick-tags-list">
          {POPULAR_INGREDIENTS.map((ing) => (
            <button
              key={ing}
              type="button"
              className={`quick-tag-chip ${selectedIngredient === ing ? "active" : ""}`}
              onClick={() => handleIngredientSelect(ing)}
            >
              {ing}
            </button>
          ))}
        </div>
      </div>

      {/* =========================
          CATEGORY TABS
      ========================= */}
      <div className="recipe-categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={selectedCategory === cat ? "active" : ""}
            onClick={() => handleCategorySelect(cat)}
          >
            {cat === "All" && "✨ "}
            {cat === "Vegetarian" && "🥗 "}
            {cat === "Vegan" && "🌱 "}
            {cat === "Seafood" && "🐟 "}
            {cat === "Dessert" && "🍰 "}
            {cat === "Breakfast" && "🥞 "}
            {cat === "Pasta" && "🍝 "}
            {cat === "Chicken" && "🍗 "}
            {cat === "Beef" && "🥩 "}
            {cat}
          </button>
        ))}
      </div>

      {/* =========================
          RESULTS COUNT BAR
      ========================= */}
      <div className="results-status-bar" ref={gridRef}>
        <span>
          Found <strong>{processedRecipes.length}</strong> recipes
          {selectedCategory !== "All" && ` in ${selectedCategory}`}
          {selectedCuisine !== "All" && ` • ${selectedCuisine} Cuisine`}
          {selectedIngredient && ` • with ${selectedIngredient}`}
        </span>

        {viewMode === "paged" && processedRecipes.length > 0 && (
          <div className="items-per-page-selector">
            <span>Show:</span>
            {[8, 12, 24, 36].map((size) => (
              <button
                key={size}
                type="button"
                className={itemsPerPage === size ? "active" : ""}
                onClick={() => {
                  setItemsPerPage(size);
                  setCurrentPage(1);
                }}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* =========================
          LOADING STATE
      ========================= */}
      {loading && (
        <LoadingStatus
          className="recipe-grid skeleton-grid"
          ariaLabel="Loading recipes"
        >
          {Array.from({ length: itemsPerPage }).map((_, i) => (
            <div key={i} className="recipe-card-skeleton">
              <div className="skeleton-image" />
              <div className="skeleton-content">
                <div className="skeleton-line short" />
                <div className="skeleton-line long" />
                <div className="skeleton-line medium" />
              </div>
            </div>
          ))}
        </LoadingStatus>
      )}

      {/* =========================
          ERROR STATE
      ========================= */}
      {!loading && error && (
        <div className="recipe-status error">
          <p>{error}</p>
          <button type="button" onClick={loadInitialRecipes} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      {/* =========================
          RECIPES GRID
      ========================= */}
      {!loading && !error && (
        <>
          {displayedRecipes.length > 0 ? (
            <section className="recipe-grid">
              {displayedRecipes.map((recipe) => (
                <RecipeCard key={recipe.idMeal} recipe={recipe} />
              ))}
            </section>
          ) : (
            <div className="no-recipes-found-box">
              <div className="empty-emoji">🍳</div>
              <h3>No matching recipes found</h3>
              <p>Try refining your search term, picking a different category, or clearing your filters.</p>
              <button type="button" className="btn-explore-reset" onClick={handleResetFilters}>
                Browse All Recipes
              </button>
            </div>
          )}

          {/* =========================
              PAGINATION CONTROLS
          ========================= */}
          {viewMode === "paged" && totalPages > 1 && (
            <div className="pagination-container">
              <button
                type="button"
                className="page-btn nav-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                aria-label="Previous Page"
              >
                &larr; Prev
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                // Show condensed page numbers for large page counts
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      className={`page-btn ${currentPage === pageNum ? "active" : ""}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                }
                if (
                  (pageNum === 2 && currentPage > 4) ||
                  (pageNum === totalPages - 1 && currentPage < totalPages - 3)
                ) {
                  return (
                    <span key={pageNum} className="pagination-dots">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                type="button"
                className="page-btn nav-btn"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                aria-label="Next Page"
              >
                Next &rarr;
              </button>
            </div>
          )}

          {/* =========================
              INFINITE SCROLL / LOAD MORE
          ========================= */}
          {viewMode === "infinite" && infiniteLimit < processedRecipes.length && (
            <div className="load-more-container">
              <button type="button" className="btn-load-more" onClick={handleLoadMore}>
                Load More Recipes ({processedRecipes.length - infiniteLimit} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default Recipes;