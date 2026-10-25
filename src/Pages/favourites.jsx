import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  cacheRecipe,
  clearFavorites,
  removeFavorite,
  selectCachedRecipes,
  selectFavorites,
} from "../store/favoritesSlice";
import { useToast } from "../context/ToastContext";
import { isCompleteMealDetail, lookupMeal } from "../api/mealDb";
import PlannerModal from "../components/PlannerModal";
import LoadingStatus from "../components/LoadingStatus";
import RequestError from "../components/RequestError";
import SearchInput from "../components/SearchInput";
import EmptyState from "../components/EmptyState";
import {
  FaHeart,
  FaTrash,
  FaCalendarPlus,
  FaShoppingCart,
  FaUtensils,
  FaGlobeAmericas,
  FaRedoAlt,
} from "react-icons/fa";
import "../styles/favourite.css";

const Favorites = () => {
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavorites);
  const cachedRecipes = useSelector(selectCachedRecipes);
  const { addToast } = useToast();

  const [detailedFavorites, setDetailedFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activePlanRecipe, setActivePlanRecipe] = useState(null);

  // Load detailed recipe objects for all favorites
  useEffect(() => {
    async function loadDetails() {
      if (favorites.length === 0) {
        setDetailedFavorites([]);
        setLoadingError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadingError("");
      try {
        let requestFailed = false;
        const results = await Promise.all(
          favorites.map(async (favItem) => {
            const id =
              favItem && typeof favItem === "object"
                ? favItem.idMeal
                : favItem;
            if (id === undefined || id === null || id === "") {
              requestFailed = true;
              return null;
            }
            const idString = String(id);

            // Check cache first for instant load
            const cachedRecipe = cachedRecipes[idString];
            if (isCompleteMealDetail(cachedRecipe, idString)) {
              return cachedRecipe;
            }
            if (isCompleteMealDetail(favItem, idString)) {
              return favItem;
            }

            // Fetch missing from API
            try {
              const data = await lookupMeal(idString);
              const meal = data?.meals?.[0];
              if (isCompleteMealDetail(meal, idString)) {
                dispatch(cacheRecipe(meal));
                return meal;
              }
              requestFailed = true;
            } catch (err) {
              console.error("Error loading favorite item details", err);
              requestFailed = true;
            }
            return null;
          })
        );

        setDetailedFavorites(results.filter(Boolean));
        if (requestFailed) {
          setLoadingError(
            "Some saved recipes couldn't be loaded. Check your connection and try again."
          );
        }
      } catch (err) {
        console.error("Failed to load favorites", err);
        setLoadingError(
          "Couldn't load your saved recipes. Check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [favorites, cachedRecipes, dispatch, retryCount]);

  const handleClearFavorites = () => {
    dispatch(clearFavorites());
    addToast("Favorites list cleared", "info");
  };

  const handleResetSearch = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  const handleRemoveFavorite = (recipe) => {
    dispatch(removeFavorite(recipe.idMeal));
    addToast(`Removed "${recipe.strMeal}" from Favorites`, "info");
  };

  // Extract unique categories in favorites
  const categories = useMemo(() => {
    const set = new Set();
    detailedFavorites.forEach((item) => {
      if (item.strCategory) set.add(item.strCategory);
    });
    return ["All", ...Array.from(set)];
  }, [detailedFavorites]);

  // Filtered favorites
  const filteredFavorites = useMemo(() => {
    return detailedFavorites.filter((recipe) => {
      const matchesSearch =
        !searchQuery ||
        recipe.strMeal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.strArea?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.strCategory?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === "All" || recipe.strCategory === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [detailedFavorites, searchQuery, selectedCategory]);

  // Add all favorite ingredients to shopping list
  const handleAddAllToShopping = () => {
    if (detailedFavorites.length === 0) return;

    try {
      const saved = localStorage.getItem("customShoppingItems");
      const existing = saved ? JSON.parse(saved) : [];

      const newItems = [];
      detailedFavorites.forEach((meal) => {
        for (let i = 1; i <= 20; i++) {
          const ing = meal[`strIngredient${i}`];
          const mea = meal[`strMeasure${i}`];
          if (ing && ing.trim()) {
            newItems.push({
              id: `fav-${meal.idMeal}-${i}-${Date.now()}`,
              ingredient: ing.trim(),
              measure: mea ? mea.trim() : "",
              recipe: meal.strMeal,
              checked: false,
            });
          }
        }
      });

      localStorage.setItem(
        "customShoppingItems",
        JSON.stringify([...existing, ...newItems])
      );
      addToast(
        `Added ${newItems.length} ingredients from favorites to your Shopping List! 🛒`,
        "cart"
      );
    } catch (e) {
      console.error(e);
      addToast("Failed to add ingredients to shopping list", "error");
    }
  };

  if (loading && detailedFavorites.length === 0) {
    return (
      <main className="favorites-page">
        <LoadingStatus
          className="favorites-status"
          spinnerClassName="loader"
          ariaLabel="Loading your favorite collection"
        >
          <p>Loading your favorite collection...</p>
        </LoadingStatus>
      </main>
    );
  }

  return (
    <main className="favorites-page">
      {/* HEADER */}
      <section className="favorites-header">
        <p className="favorites-small-title">YOUR PERSONAL COOKBOOK</p>
        <h1>❤️ Saved Favorites</h1>
        <p>
          Your curated collection of recipes, ready to cook, plan, or export to
          your weekly grocery run.
        </p>

        {detailedFavorites.length > 0 && (
          <div className="favorites-toolbar-actions">
            <button
              type="button"
              className="fav-action-btn cart-btn"
              onClick={handleAddAllToShopping}
            >
              <FaShoppingCart /> Add All to Shopping List
            </button>
            <button
              type="button"
              className="fav-action-btn clear-btn"
              onClick={handleClearFavorites}
            >
              <FaTrash /> Clear All Favorites
            </button>
          </div>
        )}
      </section>

      {loadingError && (
        <RequestError
          message={loadingError}
          onRetry={() => setRetryCount((count) => count + 1)}
          className="favorites-load-error"
        />
      )}

      {/* FILTER & SEARCH */}
      {detailedFavorites.length > 0 && (
        <div className="favorites-search-bar-row">
          <SearchInput
            wrapperClassName="fav-search-input"
            ariaLabel="Search favorites"
            placeholder="Search in your favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={handleResetSearch}
          />

          <div className="fav-category-filter">
            <label>Filter:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
          {(searchQuery || selectedCategory !== "All") && (
            <button
              type="button"
              className="fav-action-btn reset-search-btn"
              onClick={handleResetSearch}
              aria-label="Reset favorites search and category filter"
            >
              <FaRedoAlt aria-hidden="true" /> Reset Search &amp; Filter
            </button>
          )}
        </div>
      )}

      {/* FAVORITES GRID / EMPTY */}
      {favorites.length === 0 ? (
        <EmptyState
          className="empty-favorites"
          icon="♡"
          iconClassName="empty-icon"
          title="No Saved Recipes Yet"
          description="Explore our vast recipe collection and click the heart icon on any dish to save it to your personal favorites."
        >
          <Link to="/recipes" className="browse-recipes-btn">
            Explore Recipes &rarr;
          </Link>
        </EmptyState>
      ) : detailedFavorites.length === 0 ? null : filteredFavorites.length === 0 ? (
        <EmptyState
          className="empty-favorites"
          icon="🔍"
          iconClassName="empty-icon"
          title="No Matching Favorites"
          description="Try clearing your search query or choosing another category filter."
        >
          <button
            type="button"
            className="browse-recipes-btn"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
          >
            Reset Filters
          </button>
        </EmptyState>
      ) : (
        <section className="favorites-grid">
          {filteredFavorites.map((recipe) => (
            <article className="favorite-card" key={recipe.idMeal}>
              <div className="favorite-image">
                <img
                  src={recipe.strMealThumb}
                  alt={recipe.strMeal}
                  loading="lazy"
                />

                <div className="fav-card-floating-actions">
                  <button
                    type="button"
                    className="fav-plan-quick-btn"
                    title="Add to Weekly Meal Plan"
                    onClick={() => setActivePlanRecipe(recipe)}
                  >
                    <FaCalendarPlus />
                  </button>
                  <button
                    type="button"
                    className="remove-favorite"
                    title="Remove from Favorites"
                    onClick={() => handleRemoveFavorite(recipe)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="favorite-content">
                <div className="fav-meta-tags">
                  {recipe.strCategory && (
                    <span className="fav-cat-pill">{recipe.strCategory}</span>
                  )}
                  {recipe.strArea && (
                    <span className="fav-cuisine-pill">🌍 {recipe.strArea}</span>
                  )}
                </div>

                <h2>{recipe.strMeal}</h2>

                <div className="fav-card-actions">
                  <Link
                    to={`/recipe/${recipe.idMeal}`}
                    className="favorite-view-btn"
                  >
                    View Recipe &rarr;
                  </Link>
                  <button
                    type="button"
                    className="favorite-plan-btn"
                    onClick={() => setActivePlanRecipe(recipe)}
                  >
                    <FaCalendarPlus /> Plan
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* PLANNER MODAL */}
      {activePlanRecipe && (
        <PlannerModal
          recipe={activePlanRecipe}
          onClose={() => setActivePlanRecipe(null)}
        />
      )}
    </main>
  );
};

export default Favorites;