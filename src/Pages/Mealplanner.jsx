import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { usePlanner, DAYS_OF_WEEK, MEAL_SLOTS } from "../context/PlannerContext";
import { useToast } from "../context/ToastContext";
import {
  lookupMeal,
  searchMealsByName,
} from "../api/mealDb";
import LoadingStatus from "../components/LoadingStatus";
import {
  cacheRecipe,
  selectCachedRecipes,
  selectFavorites,
} from "../store/favoritesSlice";
import {
  FaCalendarAlt,
  FaTrash,
  FaPlus,
  FaMagic,
  FaShoppingCart,
  FaSearch,
  FaHeart,
  FaUtensils,
  FaClock,
} from "react-icons/fa";
import "../styles/planner.css";

const MealPlanner = () => {
  const {
    planner,
    addMeal,
    removeMeal,
    clearDay,
    clearPlanner,
    autoPlanWeek,
    totalPlannedCount,
  } = usePlanner();

  const dispatch = useDispatch();
  const favorites = useSelector(selectFavorites);
  const cachedRecipes = useSelector(selectCachedRecipes);
  const { addToast } = useToast();

  // Selector Modal state: { day, slot }
  const [activeSlotTarget, setActiveSlotTarget] = useState(null);
  const [modalTab, setModalTab] = useState("favorites"); // 'favorites' | 'search'
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Loaded full favorite recipes
  const [favoriteMeals, setFavoriteMeals] = useState([]);
  const [favLoading, setFavLoading] = useState(false);

  // Load detailed objects for favorites modal
  useEffect(() => {
    async function loadFavs() {
      if (favorites.length === 0) {
        setFavoriteMeals([]);
        return;
      }
      setFavLoading(true);
      try {
        const list = await Promise.all(
          favorites.map(async (favItem) => {
            const id = typeof favItem === "object" ? favItem.idMeal : String(favItem);
            if (cachedRecipes[id]) return cachedRecipes[id];
            if (typeof favItem === "object" && favItem.strMeal) return favItem;
            try {
              const data = await lookupMeal(id);
              if (data.meals && data.meals[0]) {
                dispatch(cacheRecipe(data.meals[0]));
                return data.meals[0];
              }
            } catch (e) {
              console.error(e);
            }
            return null;
          })
        );
        setFavoriteMeals(list.filter(Boolean));
      } finally {
        setFavLoading(false);
      }
    }
    loadFavs();
  }, [favorites, cachedRecipes, dispatch]);

  // Search recipes for planner modal
  async function handleModalSearch(e) {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const data = await searchMealsByName(searchQuery.trim());
      setSearchResults(data.meals || []);
    } catch (e) {
      console.error(e);
      addToast("Failed to search recipes", "error");
    } finally {
      setSearchLoading(false);
    }
  }

  const handleSelectRecipeForSlot = (recipe) => {
    if (!activeSlotTarget) return;
    addMeal(activeSlotTarget.day, activeSlotTarget.slot, recipe);
    setActiveSlotTarget(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Quick Auto-Plan Week
  const handleAutoPlan = async () => {
    let pool = [...favoriteMeals];
    if (pool.length < 5) {
      try {
        const data = await searchMealsByName("chicken");
        if (data.meals) pool = [...pool, ...data.meals];
      } catch (e) {
        console.error(e);
      }
    }
    autoPlanWeek(pool);
  };

  // Unique planned recipes count
  const uniquePlannedCount = new Set(
    DAYS_OF_WEEK.flatMap((day) =>
      MEAL_SLOTS.map((slot) => planner[day]?.[slot]?.idMeal).filter(Boolean)
    )
  ).size;

  return (
    <main className="planner-page">
      {/* =========================
          HEADER & METRICS
      ========================= */}
      <section className="planner-header">
        <p className="planner-small-title">SCHEDULE & ORGANIZE</p>
        <h1>📅 Weekly Meal Planner</h1>
        <p>
          Organize your breakfast, lunch, and dinner for the week. Easily assign
          your favorites or explore new recipes.
        </p>

        <div className="planner-stats-row">
          <div className="planner-stat-card">
            <span className="stat-number">{totalPlannedCount}</span>
            <span className="stat-label">Meals Planned</span>
          </div>
          <div className="planner-stat-card">
            <span className="stat-number">{uniquePlannedCount}</span>
            <span className="stat-label">Unique Recipes</span>
          </div>
          <div className="planner-stat-card">
            <span className="stat-number">
              {DAYS_OF_WEEK.filter((day) =>
                MEAL_SLOTS.some((slot) => !!planner[day]?.[slot])
              ).length}{" "}
              / 7
            </span>
            <span className="stat-label">Days Covered</span>
          </div>
        </div>

        {/* ACTIONS TOOLBAR */}
        <div className="planner-header-actions">
          <button
            type="button"
            className="planner-action-btn auto-plan-btn"
            onClick={handleAutoPlan}
          >
            <FaMagic /> Auto-Plan Week
          </button>

          <Link to="/shopping" className="planner-action-btn shopping-link-btn">
            <FaShoppingCart /> View Generated Shopping List
          </Link>

          {totalPlannedCount > 0 && (
            <button
              type="button"
              className="planner-action-btn clear-all-btn"
              onClick={clearPlanner}
            >
              <FaTrash /> Clear Week
            </button>
          )}
        </div>
      </section>

      {/* =========================
          WEEKLY PLANNER GRID
      ========================= */}
      <section className="weekly-planner-grid">
        {DAYS_OF_WEEK.map((day) => {
          const dayMeals = planner[day] || {
            Breakfast: null,
            Lunch: null,
            Dinner: null,
          };
          const hasAnyMeal = MEAL_SLOTS.some((slot) => !!dayMeals[slot]);

          return (
            <div className="planner-day-column" key={day}>
              <div className="day-column-header">
                <h3>{day}</h3>
                {hasAnyMeal && (
                  <button
                    type="button"
                    className="clear-day-btn"
                    onClick={() => clearDay(day)}
                    title={`Clear all meals for ${day}`}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

              <div className="day-slots-container">
                {MEAL_SLOTS.map((slot) => {
                  const meal = dayMeals[slot];

                  return (
                    <div
                      key={slot}
                      className={`meal-slot-box ${meal ? "has-meal" : "empty"}`}
                    >
                      <div className="slot-header">
                        <span className="slot-badge">
                          {slot === "Breakfast" && "🍳 "}
                          {slot === "Lunch" && "🥗 "}
                          {slot === "Dinner" && "🍲 "}
                          {slot}
                        </span>

                        {meal && (
                          <button
                            type="button"
                            className="remove-slot-btn"
                            onClick={() => removeMeal(day, slot)}
                            title="Remove meal"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {meal ? (
                        <div className="slot-meal-content">
                          <img
                            src={meal.strMealThumb}
                            alt={meal.strMeal}
                            loading="lazy"
                          />
                          <div className="slot-meal-info">
                            <h4>{meal.strMeal}</h4>
                            <span className="slot-meal-category">
                              {meal.strCategory || "Recipe"}
                            </span>
                            <div className="slot-footer-links">
                              <Link
                                to={`/recipe/${meal.idMeal}`}
                                className="slot-view-btn"
                              >
                                View Recipe
                              </Link>
                              <button
                                type="button"
                                className="slot-change-btn"
                                onClick={() => setActiveSlotTarget({ day, slot })}
                              >
                                Swap
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="add-slot-meal-btn"
                          onClick={() => setActiveSlotTarget({ day, slot })}
                        >
                          <FaPlus /> Add {slot}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* =========================
          RECIPE SELECTOR MODAL
      ========================= */}
      {activeSlotTarget && (
        <div
          className="planner-modal-overlay"
          onClick={() => setActiveSlotTarget(null)}
        >
          <div
            className="planner-modal recipe-picker-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="planner-close"
              onClick={() => setActiveSlotTarget(null)}
            >
              ×
            </button>

            <h2>
              Choose Recipe for {activeSlotTarget.day} {activeSlotTarget.slot}
            </h2>
            <p>Select from your saved favorites or search all recipes:</p>

            {/* TAB SELECTOR */}
            <div className="modal-tabs">
              <button
                type="button"
                className={`modal-tab ${modalTab === "favorites" ? "active" : ""}`}
                onClick={() => setModalTab("favorites")}
              >
                <FaHeart /> My Favorites ({favoriteMeals.length})
              </button>
              <button
                type="button"
                className={`modal-tab ${modalTab === "search" ? "active" : ""}`}
                onClick={() => setModalTab("search")}
              >
                <FaSearch /> Search Recipes
              </button>
            </div>

            {/* TAB CONTENT: FAVORITES */}
            {modalTab === "favorites" && (
              <div className="modal-tab-body">
                {favLoading ? (
                  <LoadingStatus className="modal-loader">
                    Loading favorites...
                  </LoadingStatus>
                ) : favoriteMeals.length === 0 ? (
                  <div className="modal-empty-state">
                    <p>You have no saved favorites yet.</p>
                    <button
                      type="button"
                      className="btn-switch-tab"
                      onClick={() => setModalTab("search")}
                    >
                      Search for recipes instead &rarr;
                    </button>
                  </div>
                ) : (
                  <div className="modal-recipes-list">
                    {favoriteMeals.map((recipe) => (
                      <button
                        key={recipe.idMeal}
                        type="button"
                        className="modal-recipe-item"
                        onClick={() => handleSelectRecipeForSlot(recipe)}
                      >
                        <img
                          src={recipe.strMealThumb}
                          alt={recipe.strMeal}
                          loading="lazy"
                        />
                        <div className="modal-item-info">
                          <h4>{recipe.strMeal}</h4>
                          <span>
                            {recipe.strCategory} • {recipe.strArea || "Global"}
                          </span>
                        </div>
                        <span className="select-badge">Select &rarr;</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: SEARCH */}
            {modalTab === "search" && (
              <div className="modal-tab-body">
                <form onSubmit={handleModalSearch} className="modal-search-form">
                  <input
                    type="text"
                    placeholder="Search e.g. Salmon, Curry, Pasta, Tacos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <button type="submit">Search</button>
                </form>

                {searchLoading ? (
                  <LoadingStatus className="modal-loader">
                    Searching recipes...
                  </LoadingStatus>
                ) : searchResults.length > 0 ? (
                  <div className="modal-recipes-list">
                    {searchResults.map((recipe) => (
                      <button
                        key={recipe.idMeal}
                        type="button"
                        className="modal-recipe-item"
                        onClick={() => handleSelectRecipeForSlot(recipe)}
                      >
                        <img
                          src={recipe.strMealThumb}
                          alt={recipe.strMeal}
                          loading="lazy"
                        />
                        <div className="modal-item-info">
                          <h4>{recipe.strMeal}</h4>
                          <span>
                            {recipe.strCategory} • {recipe.strArea || "Global"}
                          </span>
                        </div>
                        <span className="select-badge">Select &rarr;</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="modal-empty-state">
                    <p>Type a dish or ingredient name above and press Search.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default MealPlanner;