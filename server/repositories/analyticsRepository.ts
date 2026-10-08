import { BaseRepository } from './BaseRepository';

export class AnalyticsRepository extends BaseRepository<any> {
  constructor() {
    super('analytics/events.json');
  }
}
export const analyticsRepository = new AnalyticsRepository();
