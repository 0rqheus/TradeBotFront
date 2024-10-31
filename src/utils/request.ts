export const requestBackend = (route: string, data?: any, token?: string) =>
  fetch(`${process.env.REACT_APP_BACKEND_URL}/${route}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });