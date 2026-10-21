import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectIsFavorite, toggleFavorite } from "../store/favoritesSlice";
import { useToast } from "../context/ToastContext";
import PlannerModal from "../components/PlannerModal";
import {
  FaDice,
  FaHeart,
  FaRegHeart,
  FaCalendarPlus,
  FaUtensils,
  FaGlobeAmericas,
  FaRedoAlt,
  FaFire,
} from "react-icons/fa";
import "../styles/surpriseMe.css";

const SURPRISE_CATEGORIES = [
  "Any",
  "Vegetarian",
  "Chicken",
  "Beef",
  "Pasta",
  "Seafood",
  "Dessert",
  "Breakfast",
];

const SurpriseMe = () => {
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPreference, setSelectedPreference] = useState("Any");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const dispatch = useDispatch();
  const favorite = useSelector((state) =>
    selectIsFavorite(state, meal?.idMeal)
  );
  const { addToast } = useToast();

  async function getRandomMeal() {
    setLoading(true);
    setIsRolling(true);
    setError("");

    try {
      let data = null;

      if (selectedPreference === "Any") {
        const response = await fetch(
          "https://www.themealdb.com/api/json/v1/1/random.php"
        );
        if (!response.ok) throw new Error("Failed to fetch random meal");
        data = await response.json();
      } else {
        // Fetch category list and pick random from it
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?c=${selectedPreference}`
        );
        if (!response.ok) throw new Error("Failed to fetch category meals");
        const catData = await response.json();

        if (catData.meals && catData.meals.length > 0) {
          const randomIndex = Math.floor(Math.random() * catData.meals.length);
          const picked = catData.meals[randomIndex];

          // Fetch full details
          const detailRes = await fetch(
            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${picked.idMeal}`
          );
          data = await detailRes.json();
        }
      }

      // Add a slight animation delay for the rolling effect
      setTimeout(() => {
        if (!data || !data.meals || data.meals.length === 0) {
          setError("Couldn't find a surprise meal. Please try again!");
        } else {
          setMeal(data.meals[0]);
          addToast("🎉 Found your mystery dish!", "success");
        }
        setLoading(false);
        setIsRolling(false);
      }, 650);
    } catch (err) {
      console.error(err);
      setError("Unable to find a surprise meal. Please check your internet connection.");
      setLoading(false);
      setIsRolling(false);
    }
  }

  // Extract key ingredients for preview
  const keyIngredients = meal
    ? Array.from({ length: 20 }, (_, i) => meal[`strIngredient${i + 1}`])
        .filter((ing) => ing && ing.trim())
        .slice(0, 6)
    : [];

  const handleToggleFavorite = () => {
    dispatch(toggleFavorite(meal));
    addToast(
      favorite
        ? `Removed "${meal.strMeal}" from Favorites`
        : `Added "${meal.strMeal}" to Favorites! ❤️`,
      favorite ? "info" : "heart"
    );
  };

  return (
    <main className="surprise-page">
      {/* HEADER */}
      <section className="surprise-header">
        <p className="surprise-small-title">FEELING ADVENTUROUS?</p>
        <h1>🎲 Culinary Roulette</h1>
        <p>
          Can't decide what to cook? Let CookFusion spin the wheel and pick an exciting mystery recipe for you!
        </p>

        {/* PREFERENCE FILTER */}
        <div className="surprise-filter-container">
          <label>Filter by vibe:</label>
          <div className="surprise-vibe-chips">
            {SURPRISE_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                className={`vibe-chip ${selectedPreference === cat ? "active" : ""}`}
                onClick={() => setSelectedPreference(cat)}
              >
                {cat === "Any" && "✨ "}
                {cat === "Vegetarian" && "🥗 "}
                {cat === "Chicken" && "🍗 "}
                {cat === "Beef" && "🥩 "}
                {cat === "Pasta" && "🍝 "}
                {cat === "Seafood" && "🐟 "}
                {cat === "Dessert" && "🍰 "}
                {cat === "Breakfast" && "🥞 "}
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className={`surprise-btn-primary ${isRolling ? "rolling" : ""}`}
          onClick={getRandomMeal}
          disabled={loading}
        >
          <FaDice className={`dice-icon ${isRolling ? "spin-animation" : ""}`} />
          <span>{loading ? "Spinning the Wheel..." : "🎲 Spin Mystery Recipe!"}</span>
        </button>
      </section>

      {/* ERROR */}
      {error && (
        <div className="surprise-error-box">
          <p>{error}</p>
        </div>
      )}

      {/* RESULT DISPLAY */}
      {!loading && meal && (
        <section className="surprise-result-card">
          <div className="surprise-image-wrapper">
            <img src={meal.strMealThumb} alt={meal.strMeal} />
            <button
              type="button"
              className={`surprise-fav-overlay ${favorite ? "active" : ""}`}
              onClick={handleToggleFavorite}
              title={favorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              {favorite ? <FaHeart /> : <FaRegHeart />}
            </button>
            <span className="surprise-category-pill">{meal.strCategory}</span>
          </div>

          <div className="surprise-content-details">
            <span className="mystery-reveal-tag">🎉 TODAY'S CHEF RECOMMENDATION</span>
            <h2>{meal.strMeal}</h2>

            <div className="surprise-meta-badges">
              {meal.strArea && (
                <span className="meta-badge">
                  <FaGlobeAmericas /> {meal.strArea} Cuisine
                </span>
              )}
              {meal.strCategory && (
                <span className="meta-badge">
                  <FaUtensils /> {meal.strCategory}
                </span>
              )}
              <span className="meta-badge highlight">
                <FaFire /> High Flavor
              </span>
            </div>

            {/* KEY INGREDIENTS PREVIEW */}
            <div className="key-ingredients-preview">
              <span className="preview-label">Key Ingredients:</span>
              <div className="ingredients-pill-list">
                {keyIngredients.map((ing, i) => (
                  <span key={i} className="ing-mini-pill">
                    {ing}
                  </span>
                ))}
                {keyIngredients.length >= 6 && (
                  <span className="ing-mini-pill more">+ more</span>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="surprise-actions-row">
              <Link
                to={`/recipe/${meal.idMeal}`}
                className="btn-cook-now"
              >
                Cook This Recipe &rarr;
              </Link>
              <button
                type="button"
                className="btn-surprise-plan"
                onClick={() => setShowPlanModal(true)}
              >
                <FaCalendarPlus /> Add to Planner
              </button>
              <button
                type="button"
                className="btn-spin-again"
                onClick={getRandomMeal}
              >
                <FaRedoAlt /> Spin Again
              </button>
            </div>
          </div>
        </section>
      )}

      {/* INITIAL STATE */}
      {!loading && !meal && !error && (
        <div className="surprise-intro-box">
          <div className="surprise-intro-emoji">🍳</div>
          <h3>Ready for a culinary adventure?</h3>
          <p>
            Choose your category filter above and hit <strong>"Spin Mystery Recipe"</strong> to discover something sensational!
          </p>
        </div>
      )}

      {/* PLANNER MODAL */}
      {showPlanModal && meal && (
        <PlannerModal
          recipe={meal}
          onClose={() => setShowPlanModal(false)}
        />
      )}
    </main>
  );
};

export default SurpriseMe;