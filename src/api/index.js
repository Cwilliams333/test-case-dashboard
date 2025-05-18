const API_URL = 'http://localhost:3001/api';

export const fetchManufacturers = async () => {
  try {
    console.log('Fetching manufacturers from:', `${API_URL}/devices`);
    const response = await fetch(`${API_URL}/devices`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server returned error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch manufacturers: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Manufacturers data received:', data);
    
    // Check if data is in expected format
    if (typeof data !== 'object' || data === null) {
      console.error('Unexpected data format:', data);
      throw new Error('Invalid data format received from API');
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchManufacturers:', error);
    throw error;
  }
};

export const fetchTestCaseMapping = async () => {
  try {
    console.log('Fetching test case mapping from:', `${API_URL}/pythia-config`);
    const response = await fetch(`${API_URL}/pythia-config`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server returned error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch test case mapping: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Test case mapping received:', data);
    
    return data;
  } catch (error) {
    console.error('Error in fetchTestCaseMapping:', error);
    throw error;
  }
};

export const fetchDeviceConfig = async (model) => {
  try {
    const encodedModel = encodeURIComponent(model);
    console.log(`Fetching config for model "${model}" from:`, `${API_URL}/device?model=${encodedModel}`);
    
    const response = await fetch(`${API_URL}/device?model=${encodedModel}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server returned error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to fetch config for ${model}: ${response.status}`);
    }
    
    const text = await response.text();
    console.log(`Received config data (${text.length} bytes) for model "${model}"`);
    return text;
  } catch (error) {
    console.error(`Error in fetchDeviceConfig for ${model}:`, error);
    throw error;
  }
};