import { BaseRepository } from './BaseRepository';

export class AdminRepository extends BaseRepository<any> {
  constructor() {
    super('admin/audit-logs.json');
  }
}
export const adminRepository = new AdminRepository();
