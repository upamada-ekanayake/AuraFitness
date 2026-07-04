import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import ActiveExerciseCard from '../components/cards/ActiveExerciseCard';
import SessionSummaryCard from '../components/cards/SessionSummaryCard';
import { useAppData } from '../hooks/useAppData';
import { getTodayIsoDate, getTodayDayName } from '../utils/date';
import {
  createSessionExercisesFromRoutine,
  calculateSessionProgress,
  estimatePlannedDurationMinutes,
} from '../utils/session';
import { createId } from '../utils/id';
import type { WorkoutSessionLog, WorkoutSessionExerciseLog } from '../types/app';
import { Play, Dumbbell, Award, Calendar, RefreshCcw, Heart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WorkoutSession() {
  const { data, isReady, addWorkoutLog } = useAppData();

  // Active workout states
  const [isActiveSession, setIsActiveSession] = useState(false);
  const [activeExercises, setActiveExercises] = useState<WorkoutSessionExerciseLog[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Finished session state for showing summary card
  const [loggedSession, setLoggedSession] = useState<WorkoutSessionLog | null>(null);

  if (!isReady || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400 font-semibold">
        Loading active session...
      </div>
    );
  }

  const todayName = getTodayDayName();
  const todayRoutine = data.weeklyRoutine.find((day) => day.dayName === todayName);

  // Handlers
  const handleStartWorkout = () => {
    if (!todayRoutine || todayRoutine.isRestDay || todayRoutine.exercises.length === 0) return;
    
    const initialLogs = createSessionExercisesFromRoutine(todayRoutine);
    setActiveExercises(initialLogs);
    setActiveIndex(0);
    setStartTime(Date.now());
    setIsActiveSession(true);
    setLoggedSession(null);
  };

  const handleCancelWorkout = () => {
    if (window.confirm('Cancel active workout session? Current logged set progression will be discarded.')) {
      setIsActiveSession(false);
      setActiveExercises([]);
      setActiveIndex(0);
      setStartTime(null);
    }
  };

  const handleExerciseChange = (updated: WorkoutSessionExerciseLog) => {
    setActiveExercises((prev) =>
      prev.map((ex, idx) => (idx === activeIndex ? updated : ex))
    );
  };

  const handleCompleteWorkout = () => {
    if (!todayRoutine || !startTime) return;

    // Estimate duration elapsed
    const elapsedMinutes = Math.max(
      Math.round((Date.now() - startTime) / 60000),
      1
    );

    const newLog: WorkoutSessionLog = {
      id: createId('log'),
      date: getTodayIsoDate(),
      dayName: todayName,
      status: 'completed',
      focus: todayRoutine.focus,
      durationMinutes: elapsedMinutes,
      exercises: activeExercises,
    };

    addWorkoutLog(newLog);
    setLoggedSession(newLog);
    setIsActiveSession(false);
    setActiveExercises([]);
    setActiveIndex(0);
    setStartTime(null);
  };

  // State calculations
  const progressPercent = calculateSessionProgress(activeExercises);

  // View state determination
  if (loggedSession) {
    // 6. Completed session view
    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        <PageHeader
          title="Workout Completed!"
          subtitle="Congratulations on completing today's routine split."
        />
        <SessionSummaryCard log={loggedSession} />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={() => setLoggedSession(null)} className="flex items-center gap-1.5">
            <RefreshCcw className="w-4 h-4" /> Start another session
          </Button>
          <Link to="/">
            <Button variant="primary">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isActiveSession) {
    // 5. In active session view
    const currentEx = activeExercises[activeIndex];
    
    return (
      <div className="space-y-8 max-w-3xl mx-auto">
        <PageHeader
          title="Workout Session In Progress"
          subtitle={`Tracking ${todayRoutine?.focus || 'Workout Day'}`}
          actions={
            <div className="flex items-center gap-3">
              <span className="text-xs text-indigo-400 font-bold tracking-wider">{progressPercent}% complete</span>
              <div className="w-24 bg-slate-900 rounded-full h-2 border border-slate-800">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Active movement card */}
          <div className="md:col-span-2 space-y-6">
            {currentEx && (
              <ActiveExerciseCard
                exercise={currentEx}
                index={activeIndex}
                total={activeExercises.length}
                onChange={handleExerciseChange}
                onPrevious={() => setActiveIndex((p) => p - 1)}
                onNext={() => setActiveIndex((p) => p + 1)}
                canGoPrevious={activeIndex > 0}
                canGoNext={activeIndex < activeExercises.length - 1}
              />
            )}
          </div>

          {/* Sidebar tracker index */}
          <div className="space-y-6">
            <Card title="Routine Tracker" subtitle="Tap movement to jump index">
              <div className="space-y-2.5">
                {activeExercises.map((ex, idx) => {
                  const isCurrent = idx === activeIndex;
                  const isDone = ex.completedSets === ex.plannedSets;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`w-full text-left p-3 rounded-xl border flex justify-between items-center transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-600/10 border-indigo-500/40 text-slate-100'
                          : 'bg-slate-950/40 border-slate-900/60 text-slate-400 hover:border-slate-800'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-xs font-bold block truncate">{ex.name}</span>
                        <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                          {ex.completedSets} / {ex.plannedSets} sets
                        </span>
                      </div>
                      {isDone && (
                        <Badge variant="success" className="text-[9px] px-1.5 font-bold uppercase">
                          Done
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-slate-900 pt-4 mt-4 space-y-3">
                <Button
                  variant="primary"
                  className="w-full flex items-center justify-center gap-1.5"
                  onClick={handleCompleteWorkout}
                >
                  <Award className="w-4 h-4" /> Complete workout
                </Button>
                
                <Button
                  variant="danger"
                  className="w-full flex items-center justify-center gap-1.5"
                  onClick={handleCancelWorkout}
                >
                  <Trash2 className="w-4 h-4" /> Cancel session
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // 1. Not in session - view todays splits
  const isRest = todayRoutine?.isRestDay ?? true;
  const exercisesCount = todayRoutine?.exercises.length ?? 0;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <PageHeader
        title="Workout Session"
        subtitle="Track your active sets, weight, reps, and overload criteria in real-time."
      />

      {isRest ? (
        // 2. Rest Day State
        <Card className="flex flex-col items-center justify-center text-center p-10 bg-slate-900/15 border border-slate-900">
          <div className="p-4 rounded-full bg-slate-950/80 text-indigo-400 mb-4 border border-slate-900">
            <Heart className="w-8 h-8 animate-pulse text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">Today is planned as recovery</h3>
          <p className="text-xs text-slate-500 font-semibold max-w-sm mt-2 leading-relaxed">
            Your weekly schedule designates {todayName} as a Rest Day. Focus on hydration, stretching, and nutrition.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/planner">
              <Button variant="secondary" className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Go to Routine Planner
              </Button>
            </Link>
          </div>
        </Card>
      ) : exercisesCount === 0 ? (
        // 3. No exercises planned
        <Card className="flex flex-col items-center justify-center text-center p-10 bg-slate-900/15 border border-slate-900">
          <div className="p-4 rounded-full bg-slate-950/80 text-slate-650 mb-4 border border-slate-900">
            <Dumbbell className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">No workout movements planned today</h3>
          <p className="text-xs text-slate-500 font-semibold max-w-sm mt-2 leading-relaxed">
            {todayName} split has empty exercise entries. Add exercises to your day in the planner.
          </p>
          <div className="mt-8">
            <Link to="/planner">
              <Button variant="primary" className="flex items-center gap-1.5">
                <Play className="w-4 h-4" /> Go to Routine Planner
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        // 4. Ready to Start
        <Card className="p-8 border border-slate-900 bg-slate-900/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-slate-900">
            <div>
              <Badge variant="info" className="mb-2.5">
                Today's Split: {todayName}
              </Badge>
              <h3 className="text-2xl font-bold text-slate-100 tracking-tight">{todayRoutine?.focus}</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Estimated duration: {estimatePlannedDurationMinutes(todayRoutine!)} minutes
              </p>
            </div>
            
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartWorkout}
              className="flex items-center gap-2 animate-glow cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" /> Start workout
            </Button>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Exercises List ({exercisesCount})
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayRoutine?.exercises.map((ex) => (
                <div
                  key={ex.id}
                  className="p-4 bg-slate-950/40 rounded-2xl border border-slate-900 flex justify-between items-center"
                >
                  <div>
                    <span className="text-sm font-bold text-slate-200 block">{ex.name}</span>
                    <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                      {ex.bodyPart} · {ex.targetMuscle}
                    </span>
                  </div>
                  <Badge variant="neutral">
                    {ex.sets} sets × {ex.mode === 'reps' ? `${ex.reps} reps` : `${ex.durationSeconds}s`}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
