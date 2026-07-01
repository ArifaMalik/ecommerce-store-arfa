const API_URL = 'https://fakestoreapi.com/products';

const fetchAllProducts = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return await response.json();
};