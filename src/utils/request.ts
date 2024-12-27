export const sendRequest = (route: string, data?: any, token?: string, method: 'POST' | 'GET' | 'DELETE' | 'PUT' = 'POST') =>
  fetch(`${process.env.REACT_APP_BACKEND_URL}/${route}`, {
    method,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

export const sendFormDataRequest = (route: string, data?: any, token?: string) =>
  fetch(`${process.env.REACT_APP_BACKEND_URL}/${route}`, {
    method: 'POST',
    body: data,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  