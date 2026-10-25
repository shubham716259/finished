import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  cacheRecipe,
  selectIsFavorite,
  toggleFavorite,
} from "../store/favoritesSlice";
import { usePlanner } from "../context/PlannerContext";
import { useToast } from "../context/ToastContext";
import PlannerModal from "../components/PlannerModal";
import RecipeCard from "../components/Recipecard";
import LoadingStatus from "../components/LoadingStatus";
import {
  FaHeart,
  FaRegHeart,
  FaCalendarPlus,
  FaShoppingCart,
  FaPrint,
  FaShareAlt,
  FaPlay,
  FaClock,
  FaUsers,
  FaUtensils,
  FaCheck,
  FaArrowLeft,
  FaHourglassHalf,
  FaStopwatch,
} from "react-icons/fa";
import "../styles/details.css";

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addToast } = useToast();

  const [recipe, setRecipe] = useState(null);
  const favorite = useSelector((state) => selectIsFavorite(state, recipe?.idMeal));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [relatedRecipes, setRelatedRecipes] = useState([]);

  // Interactive Features
  const [servings, setServings] = useState(4); // Default 4 servings
  const baseServings = 4;
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [activeStep, setActiveStep] = useState(null);

  // Cooking Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInputMinutes, setTimerInputMinutes] = useState(15);

  // Fetch recipe
  useEffect(() => {
    async function fetchRecipe() {
      try {
        setLoading(true);
        setError("");
        setCheckedIngredients({});
        setActiveStep(null);
        setTimerSeconds(0);
        setIsTimerRunning(false);

        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch recipe");
        }

        const data = await response.json();

        if (!data.meals || data.meals.length === 0) {
          setError("Recipe not found.");
          return;
        }

        const meal = data.meals[0];
        setRecipe(meal);
        dispatch(cacheRecipe(meal));

        // Fetch related recipes in same category
        if (meal.strCategory) {
          fetchRelated(meal.strCategory, meal.idMeal);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load recipe details.");
      } finally {
        setLoading(false);
      }
    }

    fetchRecipe();
  }, [id, dispatch]);

  async function fetchRelated(category, currentId) {
    try {
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`
      );
      const data = await res.json();
      if (data.meals) {
        const filtered = data.meals
          .filter((m) => m.idMeal !== currentId)
          .slice(0, 4);
        setRelatedRecipes(filtered);
      }
    } catch (e) {
      console.error("Failed to load related recipes", e);
    }
  }

  // Timer countdown effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((sec) => {
          if (sec <= 1) {
            setIsTimerRunning(false);
            addToast("⏰ Cooking Timer Finished!", "success");
            return 0;
          }
          return sec - 1;
        });
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, addToast]);

  const startTimer = (minutes) => {
    setTimerSeconds(minutes * 60);
    setIsTimerRunning(true);
    addToast(`Timer set for ${minutes} minutes ⏱️`, "info");
  };

  const toggleTimerPause = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Helper to scale ingredient measures
  const scaleMeasure = (measure, multiplier) => {
    if (!measure || !measure.trim()) return "";
    if (multiplier === 1) return measure.trim();

    // Try to find numbers and fractions (e.g. "2 cups", "1/2 tsp", "1.5 kg", "2-3 tbsp")
    return measure.replace(/(\d+\/\d+|\d+\.\d+|\d+)/g, (match) => {
      if (match.includes("/")) {
        const [num, den] = match.split("/").map(Number);
        if (den) {
          const val = (num / den) * multiplier;
          return Number(val.toFixed(2));
        }
      }
      const val = parseFloat(match) * multiplier;
      return Number(val.toFixed(2));
    });
  };

  // Extract ingredients
  const rawIngredients = useMemo(() => {
    if (!recipe) return [];
    const list = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== "") {
        list.push({
          id: i,
          ingredient: ingredient.trim(),
          measure: measure ? measure.trim() : "",
        });
      }
    }
    return list;
  }, [recipe]);

  // Multiplied ingredients
  const multiplier = servings / baseServings;
  const ingredients = useMemo(() => {
    return rawIngredients.map((item) => ({
      ...item,
      scaledMeasure: scaleMeasure(item.measure, multiplier),
      imageUrl: `https://www.themealdb.com/images/ingredients/${encodeURIComponent(
        item.ingredient
      )}-Small.png`,
    }));
  }, [rawIngredients, multiplier]);

  // Extract steps
  const steps = useMemo(() => {
    if (!recipe || !recipe.strInstructions) return [];
    return recipe.strInstructions
      .split(/\r?\n/)
      .map((step) => step.trim())
      .filter((step) => step.length > 5);
  }, [recipe]);

  const toggleIngredientCheck = (idx) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // 1-Click Push to Shopping List
  const handleAddAllToShoppingList = () => {
    if (!ingredients.length) return;

    try {
      const saved = localStorage.getItem("customShoppingItems");
      const existing = saved ? JSON.parse(saved) : [];

      const newItems = ingredients.map((item) => ({
        id: `recipe-${recipe.idMeal}-${item.id}-${Date.now()}`,
        ingredient: item.ingredient,
        measure: item.scaledMeasure || item.measure,
        recipe: recipe.strMeal,
        checked: false,
      }));

      // Add without exact duplicate ingredient/recipe pairs
      const updated = [...existing, ...newItems];
      localStorage.setItem("customShoppingItems", JSON.stringify(updated));

      addToast(
        `Added ${ingredients.length} ingredients to your Shopping List! 🛒`,
        "cart"
      );
    } catch (e) {
      console.error(e);
      addToast("Failed to add to shopping list", "error");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast("Recipe link copied to clipboard! 🔗", "success");
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <main className="recipe-details-page">
        <LoadingStatus
          className="recipe-details-status"
          spinnerClassName="details-loader"
          ariaLabel="Preparing recipe details"
        >
          <p>Preparing recipe details...</p>
        </LoadingStatus>
      </main>
    );
  }

  if (error || !recipe) {
    return (
      <main className="recipe-details-page">
        <div className="recipe-details-status">
          <h2>{error || "Recipe not found"}</h2>
          <Link to="/recipes" className="back-recipes-btn">
            &larr; Back to Recipes
          </Link>
        </div>
      </main>
    );
  }

  const checkedCount = Object.values(checkedIngredients).filter(Boolean).length;
  const handleToggleFavorite = () => {
    dispatch(toggleFavorite(recipe));
    addToast(
      favorite
        ? `Removed "${recipe.strMeal}" from Favorites`
        : `Added "${recipe.strMeal}" to Favorites! ❤️`,
      favorite ? "info" : "heart"
    );
  };

  return (
    <main className="recipe-details-page">
      {/* NAVIGATION / TOP BAR */}
      <div className="details-top-bar">
        <button
          type="button"
          className="back-recipes-btn"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft /> Back
        </button>

        <div className="top-action-buttons">
          <button
            type="button"
            className="action-pill-btn share-btn"
            onClick={handleShare}
            title="Share Recipe"
          >
            <FaShareAlt /> Share
          </button>
          <button
            type="button"
            className="action-pill-btn print-btn"
            onClick={handlePrint}
            title="Print Recipe"
          >
            <FaPrint /> Print
          </button>
        </div>
      </div>

      {/* =========================
          HERO SECTION
      ========================= */}
      <section className="recipe-details-hero">
        <div className="recipe-details-image">
          <img src={recipe.strMealThumb} alt={recipe.strMeal} />
          <button
            type="button"
            className={`details-favorite ${favorite ? "active" : ""}`}
            onClick={handleToggleFavorite}
            title={favorite ? "Remove from Favorites" : "Add to Favorites"}
            aria-label="Toggle Favorite"
          >
            {favorite ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>

        <div className="recipe-details-info">
          <div className="details-category-row">
            {recipe.strCategory && (
              <span className="details-category">{recipe.strCategory}</span>
            )}
            {recipe.strArea && (
              <span className="details-cuisine-badge">🌍 {recipe.strArea} Cuisine</span>
            )}
          </div>

          <h1>{recipe.strMeal}</h1>

          {recipe.strTags && (
            <div className="details-tags">
              {recipe.strTags.split(",").map((tag) => (
                <span key={tag.trim()} className="recipe-tag-chip">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* QUICK SUMMARY PILLS */}
          <div className="details-meta-grid">
            <div className="meta-card">
              <FaUtensils className="meta-icon" />
              <div>
                <span className="meta-label">Ingredients</span>
                <strong>{ingredients.length} items</strong>
              </div>
            </div>
            <div className="meta-card">
              <FaClock className="meta-icon" />
              <div>
                <span className="meta-label">Prep & Cook</span>
                <strong>~35-45 mins</strong>
              </div>
            </div>
            <div className="meta-card">
              <FaUsers className="meta-icon" />
              <div>
                <span className="meta-label">Servings</span>
                <strong>{servings} Servings</strong>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="details-primary-actions">
            <button
              type="button"
              className="btn-plan-recipe"
              onClick={() => setShowPlanModal(true)}
            >
              <FaCalendarPlus /> Add to Weekly Plan
            </button>
            <button
              type="button"
              className="btn-add-shopping"
              onClick={handleAddAllToShoppingList}
            >
              <FaShoppingCart /> Add to Shopping List
            </button>
          </div>
        </div>
      </section>

      {/* =========================
          COOKING COMPANION TOOLS
      ========================= */}
      <section className="cooking-companion-bar">
        {/* SERVINGS SCALER */}
        <div className="servings-scaler-box">
          <span className="scaler-title">
            <FaUsers /> Adjust Servings:
          </span>
          <div className="servings-buttons">
            {[1, 2, 4, 6, 8].map((s) => (
              <button
                key={s}
                type="button"
                className={`serving-pill ${servings === s ? "active" : ""}`}
                onClick={() => setServings(s)}
              >
                {s} {s === 1 ? "Person" : "People"}
              </button>
            ))}
          </div>
        </div>

        {/* COOKING TIMER WIDGET */}
        <div className="cooking-timer-box">
          <span className="timer-title">
            <FaStopwatch /> Step Timer:
          </span>
          <div className="timer-controls">
            {timerSeconds > 0 ? (
              <div className="active-timer-display">
                <span className="timer-clock">{formatTimer(timerSeconds)}</span>
                <button
                  type="button"
                  className="timer-btn-action"
                  onClick={toggleTimerPause}
                >
                  {isTimerRunning ? "Pause" : "Resume"}
                </button>
                <button
                  type="button"
                  className="timer-btn-reset"
                  onClick={resetTimer}
                >
                  Reset
                </button>
              </div>
            ) : (
              <div className="preset-timer-buttons">
                {[5, 10, 15, 20, 30].map((min) => (
                  <button
                    key={min}
                    type="button"
                    className="timer-preset-btn"
                    onClick={() => startTimer(min)}
                  >
                    {min}m
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================
          MAIN RECIPE CONTENT (INGREDIENTS & INSTRUCTIONS)
      ========================= */}
      <section className="recipe-details-content">
        {/* INGREDIENTS SECTION */}
        <div className="ingredients-section">
          <div className="section-header-row">
            <h2>
              Ingredients{" "}
              <span className="item-counter">
                ({checkedCount}/{ingredients.length} prepped)
              </span>
            </h2>
            <button
              type="button"
              className="shopping-list-sync-link"
              onClick={handleAddAllToShoppingList}
            >
              + Send to Grocery List
            </button>
          </div>
          <p className="checklist-subtext">
            Check off ingredients as you prepare your mise en place:
          </p>

          <div className="ingredients-grid-enhanced">
            {ingredients.map((item) => {
              const isChecked = !!checkedIngredients[item.id];
              return (
                <div
                  key={item.id}
                  className={`ingredient-card ${isChecked ? "checked" : ""}`}
                  onClick={() => toggleIngredientCheck(item.id)}
                >
                  <div className="ingredient-thumb">
                    <img
                      src={item.imageUrl}
                      alt={item.ingredient}
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="ingredient-details">
                    <span className="ingredient-name">{item.ingredient}</span>
                    <span className="ingredient-measure">
                      {item.scaledMeasure || item.measure || "To taste"}
                    </span>
                  </div>
                  <div className="ingredient-check-indicator">
                    {isChecked ? <FaCheck /> : <span className="circle-check" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* INSTRUCTIONS SECTION */}
        <div className="instructions-section">
          <h2>Cooking Instructions</h2>
          <div className="instructions-list">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`step-card ${activeStep === idx ? "active" : ""}`}
                onClick={() => setActiveStep(activeStep === idx ? null : idx)}
              >
                <div className="step-number">{idx + 1}</div>
                <div className="step-body">
                  <p>{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* VIDEO SECTION */}
        {recipe.strYoutube && (
          <div className="video-section">
            <h2>
              <FaPlay style={{ color: "#ff914d", marginRight: "10px", fontSize: "20px" }} />
              Video Tutorial
            </h2>
            <div className="video-container">
              <iframe
                src={recipe.strYoutube.replace("watch?v=", "embed/")}
                title={recipe.strMeal}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <a
              href={recipe.strYoutube}
              target="_blank"
              rel="noreferrer"
              className="youtube-direct-link"
            >
              Watch directly on YouTube &rarr;
            </a>
          </div>
        )}
      </section>

      {/* =========================
          RELATED RECIPES CAROUSEL
      ========================= */}
      {relatedRecipes.length > 0 && (
        <section className="related-recipes-section">
          <h2>More {recipe.strCategory} Recipes You Might Love</h2>
          <div className="related-grid">
            {relatedRecipes.map((rel) => (
              <RecipeCard key={rel.idMeal} recipe={rel} />
            ))}
          </div>
        </section>
      )}

      {/* PLANNER MODAL */}
      {showPlanModal && (
        <PlannerModal
          recipe={recipe}
          onClose={() => setShowPlanModal(false)}
        />
      )}
    </main>
  );
};

export default RecipeDetails;