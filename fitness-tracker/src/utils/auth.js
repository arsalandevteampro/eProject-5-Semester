export const saveToken = (token) => {
  localStorage.setItem("jwt_token", token);
};

export const getToken = () => {
  return localStorage.getItem("jwt_token");
};

export const isAuthenticated = () => {
  return !!getToken(); // true if token exists
};

export const logout = () => {
  localStorage.removeItem("jwt_token");
};
