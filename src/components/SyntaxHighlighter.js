import React, { useState, useEffect } from 'react';

const SyntaxHighlighter = ({ content, isEditing, onContentChange }) => {
  // Keep track of the editable content
  const [editableContent, setEditableContent] = useState(content || '');

  // Update our internal state when content or isEditing changes
  useEffect(() => {
    console.log("SyntaxHighlighter: content or isEditing changed", { isEditing, contentLength: content?.length });
    if (content) {
      setEditableContent(content);
    }
  }, [content, isEditing]);

  // Handle changes in the textarea
  const handleChange = (e) => {
    const newValue = e.target.value;
    console.log("Textarea changed:", newValue.substring(0, 20) + "...");
    setEditableContent(newValue);
    
    if (onContentChange) {
      onContentChange(newValue);
    }
  };

  // If in edit mode, return a simple textarea
  if (isEditing) {
    console.log("Rendering in EDIT mode");
    return (
      <textarea
        value={editableContent}
        onChange={handleChange}
        className="w-full h-[70vh] p-2 font-mono text-sm border rounded focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700 focus:ring-blue-400 dark:focus:ring-blue-500"
        spellCheck="false"
      />
    );
  }

  console.log("Rendering in VIEW mode");
  
  // If not editing, show the syntax highlighted view
  if (!content) return null;

  // Split the content into lines
  const lines = content.split('\n');
  
  // Text colors using Tailwind dark mode classes
  const colors = {
    section: 'text-orange-600 dark:text-yellow-300',
    comment: 'text-gray-500 dark:text-gray-500',
    key: 'text-blue-600 dark:text-blue-400',
    value: 'text-green-600 dark:text-green-400',
    default: 'text-gray-800 dark:text-gray-300',
  };

  // Group the lines by section for proper spacing
  const sections = [];
  let currentSection = [];
  
  lines.forEach(line => {
    // If it's a section header and we already have content in current section
    if (line.trim().match(/^\[.+\]$/) && currentSection.length > 0) {
      sections.push([...currentSection]);
      currentSection = [];
    }
    
    currentSection.push(line);
  });
  
  // Add the last section if it exists
  if (currentSection.length > 0) {
    sections.push(currentSection);
  }

  // Process each line and apply formatting
  return (
    <div className="ini-content text-left w-full whitespace-pre">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-4 w-full">
          {section.map((line, lineIndex) => {
            // Check for comment lines (start with # or ;)
            if (line.trim().startsWith(';') || line.trim().startsWith('#')) {
              return (
                <div key={`${sectionIndex}-${lineIndex}`} className={`${colors.comment} text-left w-full`}>
                  {line}
                </div>
              );
            }
            
            // Check for section headers [SectionName]
            const sectionMatch = line.trim().match(/^\[(.+)\]$/);
            if (sectionMatch) {
              return (
                <div key={`${sectionIndex}-${lineIndex}`} className={`font-bold ${colors.section} text-left w-full`}>
                  {line}
                </div>
              );
            }
            
            // Check for key-value pairs
            const keyValueMatch = line.match(/^([^=]+)=(.*)$/);
            if (keyValueMatch) {
              const [, key, value] = keyValueMatch;
              return (
                <div key={`${sectionIndex}-${lineIndex}`} className="text-left w-full">
                  <span className={`${colors.key}`}>{key}</span>
                  <span className={colors.default}>=</span>
                  <span className={colors.value}>{value}</span>
                </div>
              );
            }
            
            // Default formatting for any other lines
            return (
              <div key={`${sectionIndex}-${lineIndex}`} className={`${colors.default} text-left w-full`}>
                {line}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default SyntaxHighlighter;