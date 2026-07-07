import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticateUser, requireRole } from '../../middleware/auth.js';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';

vi.mock('jsonwebtoken');
vi.mock('../../models/User.js');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {
      cookies: {}
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
  });

  describe('authenticateUser', () => {
    it('should return 401 if no token is present in cookies', async () => {
      await authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required. Access denied.' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token validation fails', async () => {
      req.cookies.token = 'invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired authentication token.' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not found', async () => {
      req.cookies.token = 'valid-token';
      jwt.verify.mockReturnValue({ id: 'user-id' });
      
      const mockQuery = {
        select: vi.fn().mockResolvedValue(null)
      };
      User.findById.mockReturnValue(mockQuery);

      await authenticateUser(req, res, next);

      expect(User.findById).toHaveBeenCalledWith('user-id');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'User account is inactive or deleted.' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user is inactive', async () => {
      req.cookies.token = 'valid-token';
      jwt.verify.mockReturnValue({ id: 'user-id' });

      const mockQuery = {
        select: vi.fn().mockResolvedValue({ id: 'user-id', isActive: false })
      };
      User.findById.mockReturnValue(mockQuery);

      await authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'User account is inactive or deleted.' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should set req.user and call next if token and user are valid', async () => {
      req.cookies.token = 'valid-token';
      jwt.verify.mockReturnValue({ id: 'user-id' });

      const mockUser = { id: 'user-id', isActive: true, role: 'admin' };
      const mockQuery = {
        select: vi.fn().mockResolvedValue(mockUser)
      };
      User.findById.mockReturnValue(mockQuery);

      await authenticateUser(req, res, next);

      expect(req.user).toBe(mockUser);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should return 401 if req.user is missing', () => {
      const middleware = requireRole(['admin']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required.' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user role is not in the allowed list', () => {
      req.user = { role: 'assistant' };
      const middleware = requireRole(['owner', 'admin']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access forbidden. Insufficient permissions.' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user role is in the allowed list', () => {
      req.user = { role: 'admin' };
      const middleware = requireRole(['owner', 'admin']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
