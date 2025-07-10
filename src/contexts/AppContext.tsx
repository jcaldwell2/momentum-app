import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task, User, Streak, XPEntry, StatsData } from '../types';
import { databaseService } from '../services/database';

interface AppState {
  user: User | null;
  tasks: Task[];
  streaks: Streak[];
  xpEntries: XPEntry[];
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_STREAKS'; payload: Streak[] }
  | { type: 'SET_XP_ENTRIES'; payload: XPEntry[] }
  | { type: 'COMPLETE_TASK'; payload: string };

const initialState: AppState = {
  user: null,
  tasks: [],
  streaks: [],
  xpEntries: [],
  isLoading: true,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates }
            : task
        ),
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    
    case 'COMPLETE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, status: 'completed', completedAt: new Date().toISOString() }
            : task
        ),
      };
    
    case 'SET_STREAKS':
      return { ...state, streaks: action.payload };
    
    case 'SET_XP_ENTRIES':
      return { ...state, xpEntries: action.payload };
    
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  // Task actions
  loadTasks: (date?: string) => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  // User actions
  loadUser: () => Promise<void>;
  // Stats actions
  loadStreaks: () => Promise<void>;
  loadXPEntries: () => Promise<void>;
  getStatsData: () => StatsData;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize database and load initial data
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Starting app initialization...');
      dispatch({ type: 'SET_LOADING', payload: true });
      
      console.log('📦 Initializing database service...');
      await databaseService.initialize();
      console.log('✅ Database service initialized');
      
      // Load initial data
      console.log('📊 Loading initial data...');
      await Promise.all([
        loadUser(),
        loadTasks(),
        loadStreaks(),
        loadXPEntries(),
      ]);
      console.log('✅ Initial data loaded');
      
      dispatch({ type: 'SET_LOADING', payload: false });
      console.log('🎉 App initialization complete!');
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize app' });
    }
  };

  const loadUser = async () => {
    try {
      const user = await databaseService.getUser();
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      console.error('Failed to load user:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load user data' });
    }
  };

  const loadTasks = async (date?: string) => {
    try {
      const tasks = await databaseService.getTasks(date);
      dispatch({ type: 'SET_TASKS', payload: tasks });
    } catch (error) {
      console.error('Failed to load tasks:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load tasks' });
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTask = await databaseService.createTask(taskData);
      dispatch({ type: 'ADD_TASK', payload: newTask });
    } catch (error) {
      console.error('Failed to create task:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create task' });
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      await databaseService.updateTask(id, updates);
      dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
    } catch (error) {
      console.error('Failed to update task:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update task' });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await databaseService.deleteTask(id);
      dispatch({ type: 'DELETE_TASK', payload: id });
    } catch (error) {
      console.error('Failed to delete task:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete task' });
    }
  };

  const completeTask = async (id: string) => {
    try {
      await databaseService.completeTask(id);
      dispatch({ type: 'COMPLETE_TASK', payload: id });
      
      // Reload user data to get updated XP and level
      await loadUser();
      await loadStreaks();
      await loadXPEntries();
    } catch (error) {
      console.error('Failed to complete task:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to complete task' });
    }
  };

  const loadStreaks = async () => {
    try {
      const streaks = await databaseService.getStreaks();
      dispatch({ type: 'SET_STREAKS', payload: streaks });
    } catch (error) {
      console.error('Failed to load streaks:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load streaks' });
    }
  };

  const loadXPEntries = async () => {
    try {
      const xpEntries = await databaseService.getXPEntries(20);
      dispatch({ type: 'SET_XP_ENTRIES', payload: xpEntries });
    } catch (error) {
      console.error('Failed to load XP entries:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load XP entries' });
    }
  };

  const getStatsData = (): StatsData => {
    const completedTasks = state.tasks.filter(task => task.status === 'completed');
    const totalXP = state.user?.totalXP || 0;
    const currentLevel = state.user?.level || 1;
    const activeStreaks = state.streaks.filter(streak => streak.isActive && streak.currentCount > 0);

    // Calculate weekly progress (last 7 days)
    const weeklyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = state.tasks.filter(task => task.scheduledDate === dateStr);
      const dayCompleted = dayTasks.filter(task => task.status === 'completed');
      
      weeklyProgress.push({
        date: dateStr,
        completed: dayCompleted.length,
        total: dayTasks.length,
      });
    }

    // Calculate category breakdown
    const categoryBreakdown = state.streaks.map(streak => {
      const categoryTasks = state.tasks.filter(task => task.category === streak.category);
      const categoryCompleted = categoryTasks.filter(task => task.status === 'completed');
      
      return {
        category: streak.category,
        completed: categoryCompleted.length,
        total: categoryTasks.length,
      };
    });

    return {
      totalTasksCompleted: completedTasks.length,
      totalXPEarned: totalXP,
      currentLevel,
      activeStreaks,
      weeklyProgress,
      categoryBreakdown,
    };
  };

  const contextValue: AppContextType = {
    state,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    loadUser,
    loadStreaks,
    loadXPEntries,
    getStatsData,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}