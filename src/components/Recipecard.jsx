import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectIsFavorite, toggleFavorite } from "../store/favoritesSlice";
import { useToast } from "../context/ToastContext";
import PlannerModal from "./PlannerModal";
import { FaHeart, FaRegHeart, FaCalendarPlus, FaUtensils } from "react-icons/fa";

const RecipeCard = ({ recipe }) => {
  const dispatch = useDispatch();
  const favorite = useSelector((state) =>
    selectIsFavorite(state, recipe?.idMeal)
  );
  const { addToast } = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  if (!recipe) return null;

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
    <>
      <article className="recipe-card" data-id={recipe.idMeal}>
        {/* IMAGE CONTAINER */}
        <div className="recipe-image">
          {/* Skeleton Shimmer */}
          {!imageLoaded && <div className="image-skeleton-shimmer" />}

          <img
            src={recipe.strMealThumb}
            alt={recipe.strMeal}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={imageLoaded ? "loaded" : "loading"}
          />

          {/* BADGES */}
          <div className="card-top-badges">
            {recipe.strCategory && (
              <span className="card-category-pill">{recipe.strCategory}</span>
            )}
            {recipe.strArea && (
              <span className="card-cuisine-pill">🌍 {recipe.strArea}</span>
            )}
          </div>

          {/* ACTION OVERLAYS */}
          <div className="card-floating-actions">
            {/* Quick Plan */}
            <button
              type="button"
              className="quick-plan-btn"
              title="Add to Weekly Meal Plan"
              aria-label="Add to Weekly Meal Plan"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowPlanModal(true);
              }}
            >
              <FaCalendarPlus />
            </button>

            {/* Favorite Button */}
            <button
              type="button"
              className={`favorite-btn ${favorite ? "favorite-active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleFavorite();
              }}
              title={favorite ? "Remove from Favorites" : "Add to Favorites"}
              aria-label="Toggle favorite"
            >
              {favorite ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="recipe-content">
          <div className="recipe-header-row">
            <span className="recipe-category-tag">
              {recipe.strCategory || "Chef's Special"}
            </span>
          </div>

          <h2 title={recipe.strMeal}>{recipe.strMeal}</h2>

          <div className="recipe-info">
            <span>
              <FaUtensils style={{ marginRight: "6px", opacity: 0.7 }} />
              {recipe.strArea ? `${recipe.strArea} Dish` : "Delicious Meal"}
            </span>
          </div>

          {/* BUTTONS */}
          <div className="card-footer-buttons">
            <Link to={`/recipe/${recipe.idMeal}`} className="view-recipe-btn">
              View Recipe &rarr;
            </Link>
          </div>
        </div>
      </article>

      {/* PLANNER MODAL */}
      {showPlanModal && (
        <PlannerModal
          recipe={recipe}
          onClose={() => setShowPlanModal(false)}
        />
      )}
    </>
  );
};

export default RecipeCard;
