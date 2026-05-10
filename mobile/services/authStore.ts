let _logout: () => void = () => {};

export const authStore = {
  register: (fn: () => void) => { _logout = fn; },
  logout: () => _logout(),
};
