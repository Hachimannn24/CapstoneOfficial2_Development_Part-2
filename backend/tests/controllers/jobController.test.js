import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getJobs } from '../../controllers/jobController.js';
import Job from '../../models/Job.js';

vi.mock('../../models/Job.js');

describe('Job Controller', () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {
      query: {},
      user: {
        role: 'staff',
        branch: 'Branch A'
      }
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
  });

  describe('getJobs', () => {
    it('should return 403 if req.query.all is true and user is not owner or admin', async () => {
      req.query.all = 'true';
      req.user.role = 'staff';

      await getJobs(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access forbidden. Only Owners and Admins can access historical records.'
      });
    });

    it('should retrieve jobs sorted by updatedAt', async () => {
      req.query.all = 'false';
      req.user.role = 'owner';

      const mockJobs = [{ id: 'job-1' }, { id: 'job-2' }];
      const mockSort = vi.fn().mockResolvedValue(mockJobs);
      Job.find.mockReturnValue({ sort: mockSort });

      await getJobs(req, res);

      expect(Job.find).toHaveBeenCalledWith({ status: { $ne: 'Completed' } });
      expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockJobs);
    });

    it('should apply branch partition security for assistant or sa roles', async () => {
      req.query.all = 'false';
      req.user.role = 'sa';
      req.user.branch = 'Branch B';

      const mockJobs = [{ id: 'job-3' }];
      const mockSort = vi.fn().mockResolvedValue(mockJobs);
      Job.find.mockReturnValue({ sort: mockSort });

      await getJobs(req, res);

      expect(Job.find).toHaveBeenCalledWith({
        status: { $ne: 'Completed' },
        branch: 'Branch B'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockJobs);
    });

    it('should return 500 status on database/query error', async () => {
      req.user.role = 'owner';
      Job.find.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await getJobs(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error retrieving jobs.',
        error: 'Database connection failed'
      });
    });
  });
});
