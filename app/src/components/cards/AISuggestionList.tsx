import type { AISuggestion } from '../../types/aiSuggestions';
import AISuggestionCard from './AISuggestionCard';

export interface AISuggestionListProps {
  suggestions: AISuggestion[];
  title?: string;
  emptyMessage?: string;
}

export default function AISuggestionList({
  suggestions,
  title = 'AI Suggestion Cards',
  emptyMessage = 'No suggestions available at the moment. Keep tracking your parameters.',
}: AISuggestionListProps) {
  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-bold text-slate-100 tracking-tight">
          {title}
        </h3>
      )}

      {suggestions.length === 0 ? (
        <div className="p-6 border border-dashed border-slate-800 rounded-2xl bg-slate-900/5 text-center text-xs text-slate-500 font-semibold leading-relaxed">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((sug) => (
            <AISuggestionCard
              key={sug.id}
              title={sug.title}
              message={sug.message}
              confidence={sug.confidence}
              type={sug.type}
              actionLabel={sug.actionLabel}
              route={sug.route}
            />
          ))}
        </div>
      )}
    </div>
  );
}
