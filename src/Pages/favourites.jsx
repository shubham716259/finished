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
import PlannerModal from "../components/PlannerModal";
import {
  FaHeart,
  FaTrash,
  FaCalendarPlus,
  FaShoppingCart,
  FaSearch,
  FaUtensils,
  FaGlobeAmericas,
} from "react-icons/fa";
import "../styles/favourite.css";

const Favorites = () => {
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavorites);
  const cachedRecipes = useSelector(selectCachedRecipes);
  const { addToast } = useToast();

  const [detailedFavorites, setDetailedFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activePlanRecipe, setActivePlanRecipe] = useState(null);

  // Load detailed recipe objects for all favorites
  useEffect(() => {
    async function loadDetails() {
      if (favorites.length === 0) {
        setDetailedFavorites([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const results = await Promise.all(
          favorites.map(async (favItem) => {
            const id = typeof favItem === "object" ? favItem.idMeal : String(favItem);

            // Check cache first for instant load
            if (cachedRecipes[id]) {
              return cachedRecipes[id];
            }
            if (typeof favItem === "object" && favItem.strMeal) {
              return favItem;
            }

            // Fetch missing from API
            try {
              const res = await fetch(
                `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
              );
              const data = await res.json();
              if (data.meals && data.meals[0]) {
                dispatch(cacheRecipe(data.meals[0]));
                return data.meals[0];
              }
            } catch (err) {
              console.error("Error loading favorite item details", err);
            }
            return null;
          })
        );

        setDetailedFavorites(results.filter(Boolean));
      } catch (err) {
        console.error("Failed to load favorites", err);
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [favorites, cachedRecipes, dispatch]);

  const handleClearFavorites = () => {
    dispatch(clearFavorites());
    addToast("Favorites list cleared", "info");
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
        recipe.strMeal.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        <div className="favorites-status">
          <div className="loader" />
          <p>Loading your favorite collection...</p>
        </div>
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

      {/* FILTER & SEARCH */}
      {detailedFavorites.length > 0 && (
        <div className="favorites-search-bar-row">
          <div className="fav-search-input">
            <FaSearch />
            <input
              type="text"
              placeholder="Search in your favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
              >
                ×
              </button>
            )}
          </div>

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
        </div>
      )}

      {/* FAVORITES GRID / EMPTY */}
      {detailedFavorites.length === 0 ? (
        <div className="empty-favorites">
          <div className="empty-icon">♡</div>
          <h2>No Saved Recipes Yet</h2>
          <p>
            Explore our vast recipe collection and click the heart icon on any
            dish to save it to your personal favorites.
          </p>
          <Link to="/recipes" className="browse-recipes-btn">
            Explore Recipes &rarr;
          </Link>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="empty-favorites">
          <div className="empty-icon">🔍</div>
          <h2>No Matching Favorites</h2>
          <p>Try clearing your search query or choosing another category filter.</p>
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
        </div>
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