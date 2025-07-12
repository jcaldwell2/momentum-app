import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  Task,
  User,
  Streak,
  XPEntry,
  StatsData,
  AppMessage,
  MessageDisplaySettings,
  RecurringTaskTemplate
} from '../types';
import { databaseService } from '../services/database';
import { messagesService } from '../services/messages';
import { planningService } from '../services/planning';

interface AppState {
  user: User | null;
  tasks: Task[];
  streaks: Streak[];
  xpEntries: XPEntry[];
  messages: AppMessage[];
  messageSettings: MessageDisplaySettings;
  recurringTemplates: RecurringTaskTemplate[];
  currentCalendarDate: Date;
  calendarViewType: 'month' | 'week' | 'day';
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
  | { type: 'COMPLETE_TASK'; payload: string }
  | { type: 'SET_MESSAGES'; payload: AppMessage[] }
  | { type: 'DISMISS_MESSAGE'; payload: string }
  | { type: 'SET_MESSAGE_SETTINGS'; payload: MessageDisplaySettings }
  | { type: 'SET_RECURRING_TEMPLATES'; payload: RecurringTaskTemplate[] }
  | { type: 'ADD_RECURRING_TEMPLATE'; payload: RecurringTaskTemplate }
  | { type: 'UPDATE_RECURRING_TEMPLATE'; payload: { id: string; updates: Partial<RecurringTaskTemplate> } }
  | { type: 'DELETE_RECURRING_TEMPLATE'; payload: string }
  | { type: 'SET_CALENDAR_DATE'; payload: Date }
  | { type: 'SET_CALENDAR_VIEW_TYPE'; payload: 'month' | 'week' | 'day' };

const initialState: AppState = {
  user: null,
  tasks: [],
  streaks: [],
  xpEntries: [],
  messages: [],
  messageSettings: {
    showWelcomeMessages: true,
    showFeatureAnnouncements: true,
    showTips: true,
    maxMessagesPerScreen: 3,
    autoHideAfterSeconds: 10,
  },
  recurringTemplates: [],
  currentCalendarDate: new Date(),
  calendarViewType: 'month',
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
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    
    case 'DISMISS_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter(message => message.id !== action.payload),
      };
    
    case 'SET_MESSAGE_SETTINGS':
      return { ...state, messageSettings: action.payload };
    
    case 'SET_CALENDAR_DATE':
      return { ...state, currentCalendarDate: action.payload };
    
    case 'SET_RECURRING_TEMPLATES':
      return { ...state, recurringTemplates: action.payload };
    
    case 'ADD_RECURRING_TEMPLATE':
      return { ...state, recurringTemplates: [...state.recurringTemplates, action.payload] };
    
    case 'UPDATE_RECURRING_TEMPLATE':
      return {
        ...state,
        recurringTemplates: state.recurringTemplates.map(template =>
          template.id === action.payload.id
            ? { ...template, ...action.payload.updates }
            : template
        ),
      };
    
    case 'DELETE_RECURRING_TEMPLATE':
      return {
        ...state,
        recurringTemplates: state.recurringTemplates.filter(template => template.id !== action.payload),
      };
    
    case 'SET_CALENDAR_VIEW_TYPE':
      return { ...state, calendarViewType: action.payload };
    
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
  // Message actions
  loadMessages: () => Promise<void>;
  dismissMessage: (messageId: string) => Promise<void>;
  updateMessageSettings: (settings: Partial<MessageDisplaySettings>) => Promise<void>;
  // Recurring template actions
  loadRecurringTemplates: () => Promise<void>;
  updateRecurringTemplate: (id: string, updates: Partial<RecurringTaskTemplate>) => Promise<void>;
  deleteRecurringTemplate: (id: string) => Promise<void>;
  generateRecurringInstances: () => Promise<void>;
  // Calendar actions
  setCalendarDate: (date: Date) => void;
  setCalendarViewType: (viewType: 'month' | 'week' | 'day') => void;
  getTasksForDateRange: (startDate: Date, endDate: Date) => Task[];
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
      
      console.log('📨 Initializing messages service...');
      await messagesService.initialize();
      console.log('✅ Messages service initialized');
      
      console.log('📋 Initializing planning service...');
      await planningService.initialize();
      console.log('✅ Planning service initialized');
      
      // Load initial data
      console.log('📊 Loading initial data...');
      
      // Load user first, then other data that depends on user
      await loadUser();
      
      // Load the rest in parallel (except messages which needs user data)
      console.log('📊 Loading tasks, streaks, XP entries, and recurring templates...');
      await Promise.all([
        loadTasks(),
        loadStreaks(),
        loadXPEntries(),
        loadRecurringTemplates(),
      ]);

      // Generate recurring instances in the background
      console.log('🔄 Generating recurring task instances...');
      await generateRecurringInstances();
      
      // Load messages after user is definitely available
      console.log('📨 Loading messages after user data is available...');
      await loadMessages();
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

  const loadMessages = async () => {
    console.log('📨 loadMessages function called');
    try {
      // Get user directly from database service to ensure we have the latest user data
      const user = await databaseService.getUser();
      console.log('📨 Loading messages for user:', user?.id, 'level:', user?.level);
      const messages = await messagesService.getMessagesForUser(user);
      console.log('📨 Loaded messages:', messages.length);
      dispatch({ type: 'SET_MESSAGES', payload: messages });
      
      // Load message settings
      const settings = messagesService.getSettings();
      console.log('📨 Loaded settings:', settings);
      dispatch({ type: 'SET_MESSAGE_SETTINGS', payload: settings });
    } catch (error) {
      console.error('Failed to load messages:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load messages' });
    }
  };

  const dismissMessage = async (messageId: string) => {
    try {
      if (state.user) {
        await messagesService.dismissMessage(messageId, state.user.id);
        dispatch({ type: 'DISMISS_MESSAGE', payload: messageId });
      }
    } catch (error) {
      console.error('Failed to dismiss message:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to dismiss message' });
    }
  };

  const updateMessageSettings = async (newSettings: Partial<MessageDisplaySettings>) => {
    try {
      await messagesService.updateSettings(newSettings);
      const updatedSettings = messagesService.getSettings();
      dispatch({ type: 'SET_MESSAGE_SETTINGS', payload: updatedSettings });
      
      // Reload messages with new settings
      await loadMessages();
    } catch (error) {
      console.error('Failed to update message settings:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update message settings' });
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

  const setCalendarDate = (date: Date) => {
    dispatch({ type: 'SET_CALENDAR_DATE', payload: date });
  };

  const setCalendarViewType = (viewType: 'month' | 'week' | 'day') => {
    dispatch({ type: 'SET_CALENDAR_VIEW_TYPE', payload: viewType });
  };

  const getTasksForDateRange = (startDate: Date, endDate: Date): Task[] => {
    const startString = startDate.toISOString().split('T')[0];
    const endString = endDate.toISOString().split('T')[0];
    
    return state.tasks.filter(task => {
      return task.scheduledDate >= startString && task.scheduledDate <= endString;
    });
  };

  // Recurring template functions
  const loadRecurringTemplates = async () => {
    try {
      const templates = await databaseService.getRecurringTemplates();
      dispatch({ type: 'SET_RECURRING_TEMPLATES', payload: templates });
    } catch (error) {
      console.error('Failed to load recurring templates:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load recurring templates' });
    }
  };

  const updateRecurringTemplate = async (id: string, updates: Partial<RecurringTaskTemplate>) => {
    try {
      await databaseService.updateRecurringTemplate(id, updates);
      dispatch({ type: 'UPDATE_RECURRING_TEMPLATE', payload: { id, updates } });
    } catch (error) {
      console.error('Failed to update recurring template:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update recurring template' });
    }
  };

  const deleteRecurringTemplate = async (id: string) => {
    try {
      await databaseService.deleteRecurringTemplate(id);
      dispatch({ type: 'DELETE_RECURRING_TEMPLATE', payload: id });
      // Reload tasks to remove instances
      await loadTasks();
    } catch (error) {
      console.error('Failed to delete recurring template:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete recurring template' });
    }
  };

  const generateRecurringInstances = async () => {
    try {
      await databaseService.generateRecurringInstances();
      // Reload tasks to show new instances
      await loadTasks();
    } catch (error) {
      console.error('Failed to generate recurring instances:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate recurring instances' });
    }
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
    loadMessages,
    dismissMessage,
    updateMessageSettings,
    loadRecurringTemplates,
    updateRecurringTemplate,
    deleteRecurringTemplate,
    generateRecurringInstances,
    setCalendarDate,
    setCalendarViewType,
    getTasksForDateRange,
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