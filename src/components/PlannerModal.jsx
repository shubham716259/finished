import  { useState } from "react";
import { usePlanner, DAYS_OF_WEEK, MEAL_SLOTS } from "../context/PlannerContext";
import "../styles/planner.css";

const PlannerModal = ({ recipe, onClose }) => {
  const { addMeal, planner } = usePlanner();
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [selectedSlot, setSelectedSlot] = useState("Dinner");

  if (!recipe) return null;

  const handleSave = (e) => {
    e.preventDefault();
    addMeal(selectedDay, selectedSlot, recipe);
    onClose();
  };

  return (
    <div className="planner-modal-overlay" onClick={onClose}>
      <div className="planner-modal quick-plan-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="planner-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="modal-recipe-preview">
          <img src={recipe.strMealThumb} alt={recipe.strMeal} />
          <div>
            <span className="modal-category">{recipe.strCategory || "Recipe"}</span>
            <h3>{recipe.strMeal}</h3>
            {recipe.strArea && <small>🌍 {recipe.strArea} Cuisine</small>}
          </div>
        </div>

        <h2>Schedule to Meal Plan</h2>
        <p>Choose the day and meal time for this recipe:</p>

        <form onSubmit={handleSave} className="quick-plan-form">
          <div className="form-group">
            <label>Select Day of Week</label>
            <div className="days-chip-group">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  type="button"
                  key={day}
                  className={`day-chip ${selectedDay === day ? "active" : ""}`}
                  onClick={() => setSelectedDay(day)}
                >
                  {day.slice(0, 3)}
                  {planner[day]?.[selectedSlot] && <span className="slot-occupied-dot" title="Slot has a meal" />}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Meal Time / Slot</label>
            <div className="slots-chip-group">
              {MEAL_SLOTS.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  className={`slot-chip ${selectedSlot === slot ? "active" : ""}`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot === "Breakfast" && "🍳 "}
                  {slot === "Lunch" && "🥗 "}
                  {slot === "Dinner" && "🍲 "}
                  {slot}
                  {planner[selectedDay]?.[slot] && (
                    <span className="current-meal-hint">
                      (Replaces: {planner[selectedDay][slot].strMeal.slice(0, 14)}...)
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-footer-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-confirm-plan">
              Add to {selectedDay} {selectedSlot}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlannerModal;
