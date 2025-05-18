/**
 * Parse the INI content to extract section headers and their status
 * 
 * @param {string} content - The INI file content
 * @returns {Object} Object with sections and disabledSections
 */
export const parseIniContent = (content) => {
  const lines = content.split('\n');
  const sections = {};
  const disabledSections = [];
  
  let currentSection = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines and regular comments
    if (!trimmedLine || (trimmedLine.startsWith(';') && !trimmedLine.startsWith('#'))) continue;
    
    // Check for section headers
    const sectionMatch = trimmedLine.match(/^\[(.+?)\]/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      sections[currentSection] = true;
      
      // Check if section is commented out (disabled)
      if (line.startsWith('#')) {
        disabledSections.push(currentSection);
      }
    }
  }
  
  return { sections, disabledSections };
};

/**
 * Generate random dates for the last week
 * 
 * @returns {string} A formatted date string
 */
export const randomDate = () => {
  const today = new Date();
  const daysBack = Math.floor(Math.random() * 7);
  const date = new Date(today);
  date.setDate(today.getDate() - daysBack);
  
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};
