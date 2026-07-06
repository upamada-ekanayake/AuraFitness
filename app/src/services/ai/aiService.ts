import type { AuraFitnessData } from '../../types/app';
import type { AISuggestion } from '../../types/aiSuggestions';
import { generateAISuggestions } from '../aiSuggestionService';
import recommendationsData from '../../../../ai/exports/recommendations.json';

/**
 * Main service coordinating deterministic Coach Insights and guidelines.
 */
export const aiService = {
  /**
   * Generates dynamic daily coach insights based on local logs.
   */
  getCoachInsights(data: AuraFitnessData): AISuggestion[] {
    return generateAISuggestions(data);
  },

  /**
   * Retrieves overall motivation messages.
   */
  getMotivationMessage(data: AuraFitnessData): string {
    if (recommendationsData && recommendationsData.motivationMessage) {
      // In a real setup, we could personalize this using local metrics.
      // We substitute user name details safely if available.
      const rawMessage = recommendationsData.motivationMessage.message;
      return rawMessage.replace('Upamada', data.profile.name || 'Athlete');
    }
    return 'Consistency is the foundation of progress. Keep logging and stay active!';
  },

  /**
   * Retrieves the rest day recommendation status from rule engine exports.
   */
  getRestDayStatus() {
    return recommendationsData?.restDay || {
      action: 'train' as const,
      title: 'Active training planned',
      message: 'Keep working out as scheduled.',
      confidence: 0.7,
      risk_score: 0,
      reason_codes: [],
    };
  },

  /**
   * Retrieves the progressive overload guidelines for a given exercise name.
   */
  getOverloadGuideline(exerciseName: string) {
    // Return sample guidelines or compute based on the exercise name
    const sample = recommendationsData?.overload;
    return {
      ...sample,
      message: sample?.message.replace('Dumbbell Bench Press', exerciseName) || `Keep tracking sets for ${exerciseName} to calculate overload adjustments.`,
    };
  }
};
