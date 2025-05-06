import '@testing-library/jest-dom';
import { vi, beforeAll, afterEach } from 'vitest';

// Mock the environment variables
vi.mock('import.meta.env', () => ({
  VITE_API_BASE_URL: 'https://test-api.example.com',
}));

// Mock Firebase authentication
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: {
      getIdToken: vi.fn(() => Promise.resolve('test-token')),
    },
  })),
}));

// Global fetch mock setup
beforeAll(() => {
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
}); 