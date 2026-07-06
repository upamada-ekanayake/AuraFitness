import type { ExerciseRecommendation } from '../../types/aiSuggestions';
import recommendationsData from '../../../../ai/exports/recommendations.json';

// Safe cast of imported JSON data
const typedRecommendations = recommendationsData as unknown as {
  exerciseRecommendations: ExerciseRecommendation[];
};

/**
 * Returns exercise recommendations filtered by target body part.
 */
export function getExerciseRecommendations(bodyPart?: string): ExerciseRecommendation[] {
  const allRecs = typedRecommendations.exerciseRecommendations || [];
  if (!bodyPart) return allRecs;
  
  const query = bodyPart.toLowerCase();
  return allRecs.filter(
    (rec) =>
      rec.body_part.toLowerCase().includes(query) ||
      rec.target_muscle.toLowerCase().includes(query)
  );
}

/**
 * Gets a specific exercise recommendation by ID.
 */
export function getExerciseRecommendationById(id: string): ExerciseRecommendation | undefined {
  const allRecs = typedRecommendations.exerciseRecommendations || [];
  return allRecs.find((rec) => rec.exercise_id === id);
}
