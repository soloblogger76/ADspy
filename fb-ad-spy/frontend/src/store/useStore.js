import { create } from 'zustand';
import client from '../api/client';

const useStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  team: null,

  ads: [],
  total: 0,
  page: 1,
  totalPages: 0,
  loading: false,
  error: null,

  stats: {},

  filters: {
    search: '',
    country: '',
    niche: '',
    age: '',
    platform: '',
    format: '',
    funnel: '',
    sort: 'newest'
  },

  selectedAds: [],
  swipeFile: [],
  competitors: [],
  alerts: [],
  aiHistory: [],

  toast: null,

  showToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 4000);
  },

  clearToast: () => set({ toast: null }),

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, ads: [], stats: {}, swipeFile: [], competitors: [], alerts: [] });
  },

  fetchAds: async () => {
    set({ loading: true, error: null });
    try {
      const { filters, page } = get();
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.country) params.set('country', filters.country);
      if (filters.niche) params.set('niche', filters.niche);
      if (filters.age) params.set('age', filters.age);
      if (filters.platform) params.set('platform', filters.platform);
      if (filters.format) params.set('format', filters.format);
      if (filters.funnel) params.set('funnel', filters.funnel);
      if (filters.sort) params.set('sort', filters.sort);
      params.set('page', String(page));
      params.set('limit', '20');

      const res = await client.get(`/api/ads?${params.toString()}`);
      set({
        ads: res.data.ads,
        total: res.data.total,
        totalPages: res.data.total_pages,
        loading: false
      });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message, loading: false });
    }
  },

  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters },
      page: 1
    }));
  },

  resetFilters: () => {
    set({
      filters: { search: '', country: '', niche: '', age: '', platform: '', format: '', funnel: '', sort: 'newest' },
      page: 1
    });
  },

  nextPage: () => {
    const { page, totalPages } = get();
    if (page < totalPages) {
      set({ page: page + 1 });
    }
  },

  prevPage: () => {
    const { page } = get();
    if (page > 1) {
      set({ page: page - 1 });
    }
  },

  setPage: (p) => set({ page: p }),

  fetchStats: async () => {
    try {
      const res = await client.get('/api/stats');
      set({ stats: res.data });
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  },

  toggleSelectAd: (adId) => {
    set(state => {
      const exists = state.selectedAds.includes(adId);
      if (exists) {
        return { selectedAds: state.selectedAds.filter(id => id !== adId) };
      }
      if (state.selectedAds.length >= 3) return state;
      return { selectedAds: [...state.selectedAds, adId] };
    });
  },

  clearSelected: () => set({ selectedAds: [] }),

  saveToSwipeFile: async (ad, collectionName = 'My Swipe File', notes = '') => {
    try {
      await client.post('/api/swipefile', {
        fb_ad_id: ad.fb_ad_id,
        ad_data: ad,
        collection_name: collectionName,
        notes
      });
      get().showToast('Saved to swipe file!', 'success');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save';
      get().showToast(msg, 'error');
    }
  },

  fetchSwipeFile: async (collection, search) => {
    try {
      const params = new URLSearchParams();
      if (collection) params.set('collection', collection);
      if (search) params.set('search', search);
      const res = await client.get(`/api/swipefile?${params.toString()}`);
      set({ swipeFile: res.data });
    } catch (err) {
      console.error('Swipe file fetch error:', err);
    }
  },

  addCompetitor: async (data) => {
    try {
      const res = await client.post('/api/competitors', data);
      set(state => ({ competitors: [res.data, ...state.competitors] }));
      get().showToast('Competitor added!', 'success');
    } catch (err) {
      get().showToast(err.response?.data?.error || 'Failed to add', 'error');
    }
  },

  removeCompetitor: async (id) => {
    try {
      await client.delete(`/api/competitors/${id}`);
      set(state => ({ competitors: state.competitors.filter(c => c.id !== id) }));
      get().showToast('Competitor removed', 'success');
    } catch (err) {
      get().showToast('Failed to remove', 'error');
    }
  },

  fetchCompetitors: async () => {
    try {
      const res = await client.get('/api/competitors');
      set({ competitors: res.data });
    } catch (err) {
      console.error('Competitors fetch error:', err);
    }
  },

  createAlert: async (data) => {
    try {
      const res = await client.post('/api/alerts', data);
      set(state => ({ alerts: [res.data, ...state.alerts] }));
      get().showToast('Alert created!', 'success');
    } catch (err) {
      get().showToast(err.response?.data?.error || 'Failed to create alert', 'error');
    }
  },

  toggleAlert: async (id, isActive) => {
    try {
      await client.put(`/api/alerts/${id}`, { is_active: isActive });
      set(state => ({
        alerts: state.alerts.map(a => a.id === id ? { ...a, is_active: isActive ? 1 : 0 } : a)
      }));
    } catch (err) {
      get().showToast('Failed to update alert', 'error');
    }
  },

  deleteAlert: async (id) => {
    try {
      await client.delete(`/api/alerts/${id}`);
      set(state => ({ alerts: state.alerts.filter(a => a.id !== id) }));
      get().showToast('Alert deleted', 'success');
    } catch (err) {
      get().showToast('Failed to delete alert', 'error');
    }
  },

  fetchAlerts: async () => {
    try {
      const res = await client.get('/api/alerts');
      set({ alerts: res.data });
    } catch (err) {
      console.error('Alerts fetch error:', err);
    }
  },

  fetchAIHistory: async () => {
    try {
      const res = await client.get('/api/ai/history');
      set({ aiHistory: res.data });
    } catch (err) {
      console.error('AI history fetch error:', err);
    }
  }
}));

export default useStore;
