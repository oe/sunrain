import type {
  PracticeRecord,
  PracticeStatistics,
  PracticeCategory
} from '../../types/practice';

/**
 * Manages practice data storage, retrieval, and statistics calculation
 * Handles local storage of practice records and achievement tracking
 */
export class PracticeDataManager {
  private readonly STORAGE_KEYS = {
    RECORDS: 'mental_health_practice_records',
    ACHIEVEMENTS: 'mental_health_practice_achievements',
    STATISTICS: 'mental_health_practice_statistics',
    SETTINGS: 'mental_health_practice_settings'
  };

  private records: PracticeRecord[] = [];
  private unlockedAchievements: Set<string> = new Set();
  private cachedStatistics: PracticeStatistics | null = null;
  private lastStatisticsUpdate: number = 0;
  private readonly STATISTICS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.loadDataFromStorage();
  }

  /**
   * Load all data from local storage
   */
  private loadDataFromStorage(): void {
    try {
      // Load practice records
      const recordsData = localStorage.getItem(this.STORAGE_KEYS.RECORDS);
      if (recordsData) {
        const parsed = JSON.parse(recordsData);
        this.records = parsed.map((record: any) => ({
          ...record,
          completedAt: new Date(record.completedAt)
        }));
      }

      // Load unlocked achievements
      const achievementsData = localStorage.getItem(this.STORAGE_KEYS.ACHIEVEMENTS);
      if (achievementsData) {
        const parsed = JSON.parse(achievementsData);
        this.unlockedAchievements = new Set(parsed.unlockedIds || []);
      }

      // Load cached statistics
      const statisticsData = localStorage.getItem(this.STORAGE_KEYS.STATISTICS);
      if (statisticsData) {
        const parsed = JSON.parse(statisticsData);
        this.cachedStatistics = parsed.statistics;
        this.lastStatisticsUpdate = parsed.timestamp || 0;
      }
    } catch (error) {
      console.error('Failed to load practice data from storage:', error);
      this.initializeEmptyData();
    }
  }

  /**
   * Initialize empty data structures
   */
  private initializeEmptyData(): void {
    this.records = [];
    this.unlockedAchievements = new Set();
    this.cachedStatistics = null;
    this.lastStatisticsUpdate = 0;
  }

  /**
   * Save practice record
   */
  async savePracticeRecord(record: PracticeRecord): Promise<void> {
    try {
      // Add to records array
      this.records.push(record);

      // Sort records by completion date (newest first)
      this.records.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

      // Save to localStorage
      const recordsToSave = this.records.map(r => ({
        ...r,
        completedAt: r.completedAt.toISOString()
      }));
      localStorage.setItem(this.STORAGE_KEYS.RECORDS, JSON.stringify(recordsToSave));

      // Invalidate statistics cache
      this.invalidateStatisticsCache();

      // Check for new achievements
      await this.checkAndUnlockAchievements(record);

    } catch (error) {
      console.error('Failed to save practice record:', error);
      throw error;
    }
  }

  /**
   * Get all practice records
   */
  getAllRecords(): PracticeRecord[] {
    return [...this.records];
  }

  /**
   * Get practice records by date range
   */
  getRecordsByDateRange(startDate: Date, endDate: Date): PracticeRecord[] {
    return this.records.filter(record =>
      record.completedAt >= startDate && record.completedAt <= endDate
    );
  }

  /**
   * Get practice records by practice type
   */
  getRecordsByPracticeType(practiceTypeId: string): PracticeRecord[] {
    return this.records.filter(record => record.practiceTypeId === practiceTypeId);
  }

  /**
   * Get recent practice records
   */
  getRecentRecords(limit: number = 10): PracticeRecord[] {
    return this.records.slice(0, limit);
  }

  /**
   * Get practice statistics
   */
  async getStatistics(): Promise<PracticeStatistics> {
    // Return cached statistics if still valid
    const now = Date.now();
    if (this.cachedStatistics && (now - this.lastStatisticsUpdate) < this.STATISTICS_CACHE_DURATION) {
      return this.cachedStatistics;
    }

    // Calculate fresh statistics
    this.cachedStatistics = this.calculateStatistics();
    this.lastStatisticsUpdate = now;

    // Cache the statistics
    try {
      localStorage.setItem(this.STORAGE_KEYS.STATISTICS, JSON.stringify({
        statistics: this.cachedStatistics,
        timestamp: this.lastStatisticsUpdate
      }));
    } catch (error) {
      console.warn('Failed to cache statistics:', error);
    }

    return this.cachedStatistics;
  }

  /**
   * Calculate comprehensive practice statistics
   */
  private calculateStatistics(): PracticeStatistics {
    if (this.records.length === 0) {
      return this.getEmptyStatistics();
    }

    const totalSessions = this.records.length;
    const totalMinutes = this.records.reduce((sum, record) => sum + record.duration, 0);
    const averageSessionDuration = totalMinutes / totalSessions;

    // Calculate completion rate
    const completedSessions = this.records.filter(r => r.completionPercentage >= 100).length;
    const completionRate = completedSessions / totalSessions;

    // Calculate average rating
    const ratedSessions = this.records.filter(r => r.rating !== undefined);
    const averageRating = ratedSessions.length > 0
      ? ratedSessions.reduce((sum, r) => sum + (r.rating || 0), 0) / ratedSessions.length
      : 0;

    // Calculate streaks
    const { currentStreak, longestStreak } = this.calculateStreaks();

    // Calculate practice frequency
    const practiceFrequency = this.calculatePracticeFrequency();

    // Calculate category statistics
    const categoryStats = this.calculateCategoryStatistics();

    // Calculate effectiveness metrics
    const effectivenessMetrics = this.calculateEffectivenessMetrics();

    // Calculate time patterns
    const timePatterns = this.calculateTimePatterns();

    // Calculate monthly progress
    const monthlyProgress = this.calculateMonthlyProgress();

    return {
      totalSessions,
      totalMinutes,
      averageSessionDuration,
      completionRate,
      averageRating,
      currentStreak,
      longestStreak,
      practiceFrequency,
      categoryStats,
      ...effectivenessMetrics,
      ...timePatterns,
      monthlyProgress
    };
  }

  /**
   * Calculate practice streaks
   */
  private calculateStreaks(): { currentStreak: number; longestStreak: number } {
    if (this.records.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Group records by date
    const recordsByDate = new Map<string, PracticeRecord[]>();
    this.records.forEach(record => {
      const dateKey = record.completedAt.toDateString();
      if (!recordsByDate.has(dateKey)) {
        recordsByDate.set(dateKey, []);
      }
      recordsByDate.get(dateKey)!.push(record);
    });

    const practiceDates = Array.from(recordsByDate.keys())
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime()); // Most recent first

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < practiceDates.length; i++) {
      const practiceDate = new Date(practiceDates[i]);
      practiceDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((today.getTime() - practiceDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === i) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    for (let i = 0; i < practiceDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const currentDate = new Date(practiceDates[i]);
        const previousDate = new Date(practiceDates[i - 1]);
        const daysDiff = Math.floor((previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  }

  /**
   * Calculate practice frequency
   */
  private calculatePracticeFrequency(): { daily: number; weekly: number; monthly: number } {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      daily: this.records.filter(r => r.completedAt >= oneDayAgo).length,
      weekly: this.records.filter(r => r.completedAt >= oneWeekAgo).length,
      monthly: this.records.filter(r => r.completedAt >= oneMonthAgo).length
    };
  }

  /**
   * Calculate category statistics
   */
  private calculateCategoryStatistics(): Record<PracticeCategory, {
    sessions: number;
    minutes: number;
    averageRating: number;
    favoriteType?: string;
  }> {
    const categories: PracticeCategory[] = ['mindfulness', 'breathing', 'meditation', 'relaxation', 'movement', 'visualization'];
    const categoryStats: any = {};

    categories.forEach(category => {
      // This would need practice type information to categorize records
      // For now, we'll create empty stats
      categoryStats[category] = {
        sessions: 0,
        minutes: 0,
        averageRating: 0
      };
    });

    return categoryStats;
  }

  /**
   * Calculate effectiveness metrics
   */
  private calculateEffectivenessMetrics(): {
    averageMoodImprovement: number;
    averageStressReduction: number;
    averageEnergyChange: number;
  } {
    const recordsWithMood = this.records.filter(r => r.moodImprovement !== undefined);
    const recordsWithStress = this.records.filter(r => r.stressReduction !== undefined);
    const recordsWithEnergy = this.records.filter(r => r.energyChange !== undefined);

    return {
      averageMoodImprovement: recordsWithMood.length > 0
        ? recordsWithMood.reduce((sum, r) => sum + (r.moodImprovement || 0), 0) / recordsWithMood.length
        : 0,
      averageStressReduction: recordsWithStress.length > 0
        ? recordsWithStress.reduce((sum, r) => sum + (r.stressReduction || 0), 0) / recordsWithStress.length
        : 0,
      averageEnergyChange: recordsWithEnergy.length > 0
        ? recordsWithEnergy.reduce((sum, r) => sum + (r.energyChange || 0), 0) / recordsWithEnergy.length
        : 0
    };
  }

  /**
   * Calculate time patterns
   */
  private calculateTimePatterns(): {
    preferredTimeOfDay: string;
    mostProductiveDays: string[];
  } {
    // Count sessions by time of day
    const timeOfDayCounts = this.records.reduce((counts, record) => {
      counts[record.timeOfDay] = (counts[record.timeOfDay] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const preferredTimeOfDay = Object.entries(timeOfDayCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'morning';

    // Count sessions by day of week
    const dayOfWeekCounts = this.records.reduce((counts, record) => {
      const dayName = record.completedAt.toLocaleDateString('en-US', { weekday: 'long' });
      counts[dayName] = (counts[dayName] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const mostProductiveDays = Object.entries(dayOfWeekCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day]) => day);

    return {
      preferredTimeOfDay,
      mostProductiveDays
    };
  }

  /**
   * Calculate monthly progress
   */
  private calculateMonthlyProgress(): {
    month: string;
    sessions: number;
    minutes: number;
    averageRating: number;
    moodImprovement: number;
  }[] {
    const monthlyData = new Map<string, {
      sessions: number;
      minutes: number;
      ratings: number[];
      moodImprovements: number[];
    }>();

    this.records.forEach(record => {
      const monthKey = record.completedAt.toISOString().substring(0, 7); // YYYY-MM

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          sessions: 0,
          minutes: 0,
          ratings: [],
          moodImprovements: []
        });
      }

      const data = monthlyData.get(monthKey)!;
      data.sessions++;
      data.minutes += record.duration;

      if (record.rating) {
        data.ratings.push(record.rating);
      }

      if (record.moodImprovement !== undefined) {
        data.moodImprovements.push(record.moodImprovement);
      }
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        sessions: data.sessions,
        minutes: data.minutes,
        averageRating: data.ratings.length > 0
          ? data.ratings.reduce((sum, rating) => sum + rating, 0) / data.ratings.length
          : 0,
        moodImprovement: data.moodImprovements.length > 0
          ? data.moodImprovements.reduce((sum, improvement) => sum + improvement, 0) / data.moodImprovements.length
          : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Get empty statistics structure
   */
  private getEmptyStatistics(): PracticeStatistics {
    return {
      totalSessions: 0,
      totalMinutes: 0,
      averageSessionDuration: 0,
      completionRate: 0,
      averageRating: 0,
      currentStreak: 0,
      longestStreak: 0,
      practiceFrequency: { daily: 0, weekly: 0, monthly: 0 },
      categoryStats: {
        mindfulness: { sessions: 0, minutes: 0, averageRating: 0 },
        breathing: { sessions: 0, minutes: 0, averageRating: 0 },
        meditation: { sessions: 0, minutes: 0, averageRating: 0 },
        relaxation: { sessions: 0, minutes: 0, averageRating: 0 },
        movement: { sessions: 0, minutes: 0, averageRating: 0 },
        visualization: { sessions: 0, minutes: 0, averageRating: 0 }
      },
      averageMoodImprovement: 0,
      averageStressReduction: 0,
      averageEnergyChange: 0,
      preferredTimeOfDay: 'morning',
      mostProductiveDays: [],
      monthlyProgress: []
    };
  }

  /**
   * Check and unlock achievements
   */
  private async checkAndUnlockAchievements(newRecord: PracticeRecord): Promise<void> {
    // This would integrate with the achievement system
    // For now, we'll implement basic achievement checking
    const statistics = await this.getStatistics();

    // Example achievements
    const achievementChecks = [
      {
        id: 'first_session',
        condition: () => statistics.totalSessions >= 1,
        name: 'First Steps'
      },
      {
        id: 'week_streak',
        condition: () => statistics.currentStreak >= 7,
        name: 'Week Warrior'
      },
      {
        id: 'hundred_minutes',
        condition: () => statistics.totalMinutes >= 100,
        name: 'Century Club'
      }
    ];

    const newlyUnlocked: string[] = [];

    achievementChecks.forEach(achievement => {
      if (!this.unlockedAchievements.has(achievement.id) && achievement.condition()) {
        this.unlockedAchievements.add(achievement.id);
        newlyUnlocked.push(achievement.id);
        newRecord.achievementsUnlocked.push(achievement.id);
      }
    });

    if (newlyUnlocked.length > 0) {
      // Save updated achievements
      localStorage.setItem(this.STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify({
        unlockedIds: Array.from(this.unlockedAchievements)
      }));
    }
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements(): string[] {
    return Array.from(this.unlockedAchievements);
  }

  /**
   * Export practice data
   */
  exportData(): {
    records: PracticeRecord[];
    achievements: string[];
    statistics: PracticeStatistics | null;
    exportDate: string;
  } {
    return {
      records: this.records,
      achievements: Array.from(this.unlockedAchievements),
      statistics: this.cachedStatistics,
      exportDate: new Date().toISOString()
    };
  }

  /**
   * Import practice data
   */
  async importData(data: {
    records: PracticeRecord[];
    achievements: string[];
  }): Promise<void> {
    try {
      // Merge records (avoid duplicates)
      const existingIds = new Set(this.records.map(r => r.id));
      const newRecords = data.records.filter(r => !existingIds.has(r.id));

      this.records.push(...newRecords.map(r => ({
        ...r,
        completedAt: new Date(r.completedAt)
      })));

      // Sort records
      this.records.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

      // Merge achievements
      data.achievements.forEach(id => this.unlockedAchievements.add(id));

      // Save to storage
      await this.saveAllData();

      // Invalidate cache
      this.invalidateStatisticsCache();

    } catch (error) {
      console.error('Failed to import practice data:', error);
      throw error;
    }
  }

  /**
   * Clear all practice data
   */
  async clearAllData(): Promise<void> {
    this.records = [];
    this.unlockedAchievements.clear();
    this.cachedStatistics = null;
    this.lastStatisticsUpdate = 0;

    // Clear from localStorage
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Save all data to storage
   */
  private async saveAllData(): Promise<void> {
    try {
      // Save records
      const recordsToSave = this.records.map(r => ({
        ...r,
        completedAt: r.completedAt.toISOString()
      }));
      localStorage.setItem(this.STORAGE_KEYS.RECORDS, JSON.stringify(recordsToSave));

      // Save achievements
      localStorage.setItem(this.STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify({
        unlockedIds: Array.from(this.unlockedAchievements)
      }));

    } catch (error) {
      console.error('Failed to save practice data:', error);
      throw error;
    }
  }

  /**
   * Invalidate statistics cache
   */
  private invalidateStatisticsCache(): void {
    this.cachedStatistics = null;
    this.lastStatisticsUpdate = 0;
  }

  /**
   * Get storage usage information
   */
  getStorageInfo(): {
    recordsCount: number;
    achievementsCount: number;
    estimatedSize: number;
  } {
    const recordsSize = JSON.stringify(this.records).length;
    const achievementsSize = JSON.stringify(Array.from(this.unlockedAchievements)).length;

    return {
      recordsCount: this.records.length,
      achievementsCount: this.unlockedAchievements.size,
      estimatedSize: recordsSize + achievementsSize
    };
  }
}

// Singleton instance
export const practiceDataManager = new PracticeDataManager();
