import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Modal from './Modal';
import SyntaxHighlighter from './SyntaxHighlighter';
import { testCaseMapping, iniSectionToTestMapping } from '../data/testCaseMapping';
import { parseIniContent, randomDate } from '../utils/parseConfig';
import { fetchManufacturers, fetchDeviceConfig } from '../api';

const TestCaseMonitoringDashboard = () => {
  // State management
  const [manufacturers, setManufacturers] = useState({});
  const [testCases, setTestCases] = useState({});
  const [filteredTestCases, setFilteredTestCases] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedModels, setSelectedModels] = useState([]);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [showAllManufacturerModels, setShowAllManufacturerModels] = useState(false);
  const [activeView, setActiveView] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState(null);
  const [deviceConfigs, setDeviceConfigs] = useState({});
  
  // Config viewer modal state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configModalTitle, setConfigModalTitle] = useState('');
  const [configModalContent, setConfigModalContent] = useState('');
  const [editedConfigContent, setEditedConfigContent] = useState('');

  // Debug utility
  const debugLog = (message, ...args) => {
    console.log(`[DEBUG] ${message}`, ...args);
  };

  // Extract the friendly name (base name) from the formatted model string
  const extractBaseName = useCallback((formattedName) => {
    const match = formattedName.match(/^(.+) \(/);
    return match ? match[1] : formattedName;
  }, []);
  
  // Extract just the model code from the formatted name
  const extractModelCode = useCallback((formattedName) => {
    const match = formattedName.match(/\(([^)]+)\)$/);
    return match ? match[1] : null;
  }, []);
  
  // Get a display version of the model name for table headers
  const getDisplayModelName = useCallback((fullModelName) => {
    const baseName = extractBaseName(fullModelName);
    
    // For table headers, prefer the friendly name with a shortened version if needed
    if (baseName.length > 15) {
      return `${baseName.substring(0, 15)}...`;
    }
    
    return baseName;
  }, [extractBaseName]);
  
  // Get full formatted display for hover tooltips
  const getFullModelInfo = useCallback((fullModelName) => {
    return fullModelName; // Return the full formatted name with code
  }, []);
  
  // Get compact display for model chips in selection mode
  const getCompactModelDisplay = useCallback((fullModelName) => {
    const baseName = extractBaseName(fullModelName);
    
    // For model selection chips, show shortened name
    if (baseName.length > 10) {
      return `${baseName.substring(0, 10)}...`;
    }
    
    return baseName;
  }, [extractBaseName]);

  // Function to handle config content changes
  const handleConfigContentChange = (newContent) => {
    debugLog('Config content changed:', {
      contentLength: newContent ? newContent.length : 0,
      firstFewChars: newContent ? newContent.substring(0, 30) + '...' : 'empty'
    });
    setEditedConfigContent(newContent);
  };

  // Function to handle saving the edited content
  const saveConfigChanges = () => {
    try {
      debugLog('Saving changes with content length:', editedConfigContent.length);
      
      // Get the current date and time for the "modified" timestamp
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      // Update the device configs with the edited content
      setDeviceConfigs(prev => ({
        ...prev,
        [selectedModel]: editedConfigContent
      }));
      
      // Update test cases with the new configuration
      const updatedTestCases = generateTestCasesFromConfig(selectedModel, editedConfigContent);
      
      // Update test cases with new modified date
      const testCasesWithNewDate = updatedTestCases.map(tc => ({
        ...tc,
        modified: formattedDate
      }));
      
      setTestCases(prev => ({
        ...prev,
        [selectedModel]: testCasesWithNewDate
      }));
      
      // Update filtered test cases if this is the selected model
      if (selectedModel) {
        let filtered = [...testCasesWithNewDate];
        if (activeView === 'disabled') filtered = filtered.filter(tc => tc.status === 'disabled');
        else if (activeView === 'changes') {
          filtered = filtered.filter(tc => tc.modified === formattedDate);
        }
        if (sortField) {
          filtered.sort((a, b) => {
            let comparison = 0;
            if (sortField === 'testCase') comparison = a.testCase.localeCompare(b.testCase);
            else if (sortField === 'status') comparison = a.status.localeCompare(b.status);
            else if (sortField === 'modified') comparison = new Date(a.modified) - new Date(b.modified);
            return sortDirection === 'asc' ? comparison : -comparison;
          });
        }
        setFilteredTestCases(filtered);
      }
      
      // Update the last updated timestamp
      setLastUpdated(now.toLocaleString());
      
      // Show success message
      const baseName = extractBaseName(selectedModel);
      alert(`Configuration for ${baseName} has been saved successfully.`);
      
    } catch (err) {
      console.error('Error saving configuration:', err);
      setError(`Failed to save configuration: ${err.message}`);
    }
  };

  // Handle showing the configuration for a model
  const showModelConfig = useCallback((model) => {
    const modelCode = extractModelCode(model);
    const baseName = extractBaseName(model);
    
    if (!modelCode || !deviceConfigs[model]) {
      setError(`Configuration file for ${baseName} is not available.`);
      return;
    }
    
    debugLog(`Opening config for ${baseName}`, {
      contentLength: deviceConfigs[model].length,
      firstFewChars: deviceConfigs[model].substring(0, 50)
    });
    
    setConfigModalTitle(`${baseName} Configuration (${modelCode}.ini)`);
    setConfigModalContent(deviceConfigs[model]);
    setEditedConfigContent(deviceConfigs[model]);
    setShowConfigModal(true);
  }, [deviceConfigs, extractBaseName, extractModelCode]);

  // Memoized mapping for grouping sections
  const groupedSections = useMemo(() => {
    const result = {};
    Object.entries(iniSectionToTestMapping).forEach(([section, testId]) => {
      if (!result[testId]) {
        result[testId] = [];
      }
      result[testId].push(section);
    });
    return result;
  }, []);

  // Core test case generator (unchanged)
  const generateTestCasesFromConfig = useCallback((model, configContent) => {
    const { sections, disabledSections } = parseIniContent(configContent);
    const testCaseStatus = {};
    testCaseMapping.forEach(([testId]) => { testCaseStatus[testId] = false; });
    testCaseStatus["root.RootTest"] = true;
    Object.keys(sections).forEach(sectionName => {
      const testId = iniSectionToTestMapping[sectionName];
      if (testId) testCaseStatus[testId] = true;
    });
    Object.entries(groupedSections).forEach(([testId, relatedSections]) => {
      if (testId === "root.RootTest") return;
      const sectionsInConfig = relatedSections.filter(section => sections[section]);
      const disabledSectionsForTest = relatedSections.filter(section => 
        disabledSections.includes(section)
      );
      if (sectionsInConfig.length > 0 && disabledSectionsForTest.length === sectionsInConfig.length) testCaseStatus[testId] = false;
      if (sectionsInConfig.length === 0) testCaseStatus[testId] = false;
    });
    return testCaseMapping.map(([testId, displayName]) => ({
      id: `TC-${testId.split('.')[0]}`,
      testId,
      testCase: displayName,
      status: testCaseStatus[testId] ? "enabled" : "disabled",
      modified: randomDate()
    }));
  }, [groupedSections]);

  // Fetch manufacturers from API on component mount
  useEffect(() => {
    const loadManufacturers = async () => {
      try {
        setLoading(true);
        const data = await fetchManufacturers();
        console.log('API returned manufacturers:', data);
        setManufacturers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching manufacturers:', err);
        setError('Failed to load manufacturers. Please check the server connection.');
      } finally {
        setLoading(false);
      }
    };
  
    loadManufacturers();
  }, []);
  
  // Load device config for a single model
  const loadDeviceConfig = useCallback(async (model) => {
    try {
      if (!deviceConfigs[model]) {
        console.log(`Fetching config for model: "${model}"`);
        const configContent = await fetchDeviceConfig(model);
        console.log(`Config received:`, configContent ? `${configContent.substring(0, 100)}...` : 'No content');
        
        setDeviceConfigs(prev => ({
          ...prev,
          [model]: configContent
        }));
      }
      
      // Generate test cases for the model
      const config = deviceConfigs[model];
      if (config) {
        console.log(`Generating test cases for "${model}" with config`);
        const modelTestCases = generateTestCasesFromConfig(model, config);
        console.log(`Generated ${modelTestCases.length} test cases`);
        
        setTestCases(prev => ({
          ...prev,
          [model]: modelTestCases
        }));
      } else {
        console.log(`No config available for "${model}", creating default test cases`);
        // Create default test cases if no config is available
        const defaultTestCases = testCaseMapping.map(([testId, displayName]) => {
          return {
            id: `TC-${testId.split('.')[0]}`,
            testId,
            testCase: displayName,
            status: Math.random() > 0.3 ? "enabled" : "disabled",
            modified: randomDate()
          };
        });
        
        setTestCases(prev => ({
          ...prev,
          [model]: defaultTestCases
        }));
      }
      
      return true;
    } catch (err) {
      console.error(`Error loading config for ${model}:`, err);
      setError(`Failed to load configuration for ${model}. ${err.message}`);
      return false;
    }
  }, [deviceConfigs, generateTestCasesFromConfig]);

  // Load selected model config
  useEffect(() => {
    const loadSingleModelConfig = async () => {
      if (selectedModel && !isComparisonMode) {
        setLoading(true);
        await loadDeviceConfig(selectedModel);
        setLoading(false);
      }
    };
    
    loadSingleModelConfig();
  }, [selectedModel, isComparisonMode, loadDeviceConfig]);

  // Load multiple model configs in comparison mode
  useEffect(() => {
    const loadMultipleConfigs = async () => {
      if (isComparisonMode && selectedModels.length > 0) {
        setLoading(true);
        
        // Load configs for all selected models
        const loadPromises = selectedModels.map(model => loadDeviceConfig(model));
        await Promise.all(loadPromises);
        
        setLoading(false);
      }
    };
    
    loadMultipleConfigs();
  }, [selectedModels, isComparisonMode, loadDeviceConfig]);

  // Handle "Show All Models for Manufacturer" 
  useEffect(() => {
    const loadAllManufacturerModels = async () => {
      if (showAllManufacturerModels && selectedManufacturer && manufacturers[selectedManufacturer]) {
        setLoading(true);
        setSelectedModels(manufacturers[selectedManufacturer]);
        
        // Load configs for all models of the selected manufacturer
        const allModels = manufacturers[selectedManufacturer];
        const loadPromises = allModels.map(model => loadDeviceConfig(model));
        await Promise.all(loadPromises);
        
        setLoading(false);
      }
    };
    
    loadAllManufacturerModels();
  }, [showAllManufacturerModels, selectedManufacturer, manufacturers, loadDeviceConfig]);

  // Filter and sort test cases for single model view
  useEffect(() => {
    if (selectedModel && testCases[selectedModel] && !isComparisonMode) {
      let filtered = [...testCases[selectedModel]];
      if (activeView === 'disabled') filtered = filtered.filter(tc => tc.status === 'disabled');
      else if (activeView === 'changes') {
        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        filtered = filtered.filter(tc => tc.modified === today);
      }
      if (sortField) {
        filtered.sort((a, b) => {
          let comparison = 0;
          if (sortField === 'testCase') comparison = a.testCase.localeCompare(b.testCase);
          else if (sortField === 'status') comparison = a.status.localeCompare(b.status);
          else if (sortField === 'modified') comparison = new Date(a.modified) - new Date(b.modified);
          return sortDirection === 'asc' ? comparison : -comparison;
        });
      }
      setFilteredTestCases(filtered);
    } else if (!isComparisonMode) {
      setFilteredTestCases([]);
    }
  }, [selectedModel, testCases, activeView, sortField, sortDirection, isComparisonMode]);

  // Dark mode preference
  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(storedDarkMode);
    if (storedDarkMode) document.documentElement.classList.add('dark');
  }, []);

  // Action handlers
  const handleSort = (field) => {
    if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };
  
  const handleManufacturerChange = (e) => {
    const manufacturer = e.target.value;
    setSelectedManufacturer(manufacturer);
    setSelectedModel('');
    setSelectedModels([]);
    setShowAllManufacturerModels(false);
    setIsComparisonMode(false);
    setSortField(null);
    setError(null);
  };
  
  const handleModelChange = (e) => {
    if (isComparisonMode) return;
    setSelectedModel(e.target.value);
    setSortField(null); // Reset sorting when model changes
    setFilteredTestCases([]); // Clear filtered test cases
  };
  
  const handleModelSelectionToggle = (model) => {
    setSelectedModels(prev => {
      if (prev.includes(model)) {
        return prev.filter(m => m !== model);
      } else {
        return [...prev, model];
      }
    });
  };
  
  const toggleComparisonMode = () => {
    const newMode = !isComparisonMode;
    setIsComparisonMode(newMode);
    
    if (newMode) {
      // If entering comparison mode and a model is selected, add it to selectedModels
      if (selectedModel && !selectedModels.includes(selectedModel)) {
        setSelectedModels([selectedModel]);
      }
    } else {
      // If exiting comparison mode, keep the first selected model as the active one
      if (selectedModels.length > 0) {
        setSelectedModel(selectedModels[0]);
      }
    }
  };
  
  const toggleAllManufacturerModels = () => {
    if (!selectedManufacturer) {
      alert('Please select a manufacturer first');
      return;
    }
    
    const newState = !showAllManufacturerModels;
    setShowAllManufacturerModels(newState);
    setIsComparisonMode(newState); // Comparison mode is automatically enabled when showing all models
    
    if (!newState) {
      // If turning off, clear the multiple selections
      setSelectedModels([]);
      if (selectedModel) {
        setSelectedModels([selectedModel]);  
      }
    }
  };
  
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };
  
  const toggleView = (view) => {
    if (isComparisonMode && view === 'changes') {
      alert('Recent Changes view is not available in comparison mode');
      return;
    }
    setActiveView(view);
  };

  // Refresh all data
  const refreshData = () => {
    setLoading(true);
    setFilteredTestCases([]);
    
    // Update timestamp
    setLastUpdated(new Date().toLocaleString());
    
    // Fetch fresh data from API
    const refreshAll = async () => {
      try {
        // Refresh manufacturers
        const manufacturersData = await fetchManufacturers();
        setManufacturers(manufacturersData);
        
        // Clear cached configs to force refresh
        setDeviceConfigs({});
        
        // Refresh configs based on current view mode
        if (isComparisonMode) {
          // Refresh all selected models
          if (selectedModels.length > 0) {
            const refreshPromises = selectedModels.map(async (model) => {
              const configContent = await fetchDeviceConfig(model);
              setDeviceConfigs(prev => ({
                ...prev,
                [model]: configContent
              }));
              
              const modelTestCases = generateTestCasesFromConfig(model, configContent);
              setTestCases(prev => ({
                ...prev,
                [model]: modelTestCases
              }));
            });
            
            await Promise.all(refreshPromises);
          }
        } else if (selectedModel) {
          // Refresh single selected model
          const configContent = await fetchDeviceConfig(selectedModel);
          setDeviceConfigs(prev => ({
            ...prev,
            [selectedModel]: configContent
          }));
          
          const modelTestCases = generateTestCasesFromConfig(selectedModel, configContent);
          setTestCases(prev => ({
            ...prev,
            [selectedModel]: modelTestCases
          }));
        }
        
        setError(null);
      } catch (err) {
        console.error('Error refreshing data:', err);
        setError('Failed to refresh data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    refreshAll();
    setSortField(null);
  };

  // Export data to CSV
  const exportData = () => {
    if (isComparisonMode) {
      if (selectedModels.length === 0) {
        alert('Please select at least one model before exporting.');
        return;
      }
      
      try {
        // Create CSV with multiple model columns
        let testCaseList = [];
        
        // First, collect all test cases
        testCaseMapping.forEach(([testId, displayName]) => {
          testCaseList.push({
            testCase: displayName,
            testId,
            models: {}
          });
        });
        
        // Fill in status for each model
        selectedModels.forEach(model => {
          if (testCases[model]) {
            testCases[model].forEach(tc => {
              const testCaseIndex = testCaseList.findIndex(item => item.testId === tc.testId);
              if (testCaseIndex !== -1) {
                testCaseList[testCaseIndex].models[model] = tc.status;
              }
            });
          }
        });
        
        // Create CSV header with friendly model names
        let csvContent = "Test Case";
        selectedModels.forEach(model => {
          const baseName = extractBaseName(model);
          csvContent += `,${baseName}`;
        });
        csvContent += "\n";
        
        // Add data rows
        testCaseList.forEach(tc => {
          csvContent += `"${tc.testCase}"`;
          selectedModels.forEach(model => {
            const status = tc.models[model] || 'unknown';
            csvContent += `,"${status}"`;
          });
          csvContent += "\n";
        });
        
        // Use date in filename
        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `Multiple_Models_Comparison_${dateStr}.csv`;
        
        // Download the CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Error exporting comparison data:', err);
        alert('Failed to export comparison data. Please check the console for details.');
      }
    } else {
      // Original single model export
      if (!selectedModel || !filteredTestCases.length) {
        alert('Please select a model with test cases before exporting.');
        return;
      }
      
      try {
        // Use friendly name for filename
        const baseName = extractBaseName(selectedModel);
        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `${baseName}_TestCases_${dateStr}.csv`;
        
        let csvContent = "Test Case,Status,Last Modified\n";
        filteredTestCases.forEach(tc => {
          csvContent += `"${tc.testCase}","${tc.status}","${tc.modified}"\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Error exporting data:', err);
        alert('Failed to export data. Please check the console for details.');
      }
    }
  };

  // Helper function for comparison table
const renderComparisonTable = () => {
  // Get all test cases from test case mapping
  const allTestCases = testCaseMapping.map(([testId, displayName]) => ({
    id: testId,
    name: displayName
  }));
  
  // For the disabled tests count summary row
  const getDisabledCountsForModels = () => {
    const disabledCounts = {};
    
    selectedModels.forEach(model => {
      if (testCases[model]) {
        disabledCounts[model] = testCases[model].filter(tc => tc.status === 'disabled').length;
      } else {
        disabledCounts[model] = 0;
      }
    });
    
    return disabledCounts;
  };

  const disabledCounts = getDisabledCountsForModels();

  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray'}`}>
          <div className="inline-block animate-spin mr-2">↻</div>
          Loading test case data...
        </div>
      ) : (
        <div className="models-comparison-container">
          <table className="w-full comparison-table">
            <thead>
              <tr className={`text-left ${darkMode ? 'text-gray-400' : 'text-gray'} text-sm`}>
                <th className={`p-4 sticky left-0 z-10 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <button 
                    className={`flex items-center gap-1 text-left font-medium ${darkMode ? 'text-gray-300 hover:text-gray-200' : 'text-gray-700 hover:text-gray-900'}`}
                    onClick={() => handleSort('testCase')}
                  >
                    Test Case
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    {sortField === 'testCase' && <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  </button>
                </th>
                {selectedModels.map((model, modelIndex) => {
                  const displayName = getDisplayModelName(model);
                  const fullInfo = getFullModelInfo(model);
                  const modelCode = extractModelCode(model);
                  
                  return (
                    <th key={modelIndex} className="p-4 min-w-[150px] text-center">
                      <button 
                        className={`flex flex-col items-center justify-center w-full ${
                          darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                        }`}
                        onClick={() => showModelConfig(model)}
                        title={`Click to view ${fullInfo} configuration file`}
                      >
                        <span className="font-medium">{displayName}</span>
                        {modelCode && (
                          <span className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            {modelCode}
                          </span>
                        )}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className={darkMode ? 'text-gray-300' : ''}>
              {selectedModels.length === 0 ? (
                <tr>
                  <td className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray'}`} colSpan={selectedModels.length + 1}>
                    Please select at least one model to compare
                  </td>
                </tr>
              ) : (
                <>
                  {/* Disabled Count Summary Row - Only show in disabled view */}
                  {activeView === 'disabled' && (
                    <tr className={`${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-100'} border-b font-bold`}>
                      <td className="p-4 sticky left-0 z-10 bg-inherit">Disabled Count</td>
                      {selectedModels.map((model, modelIndex) => (
                        <td key={modelIndex} className="p-4 text-center font-semibold">
                          <span className={`px-2 py-1 rounded-full ${
                            darkMode 
                              ? 'bg-red-900 text-red-100' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {disabledCounts[model] || 0}
                          </span>
                        </td>
                      ))}
                    </tr>
                  )}
                  
                  {/* Test case rows */}
                  {allTestCases.map((tc, index) => {
                    // Filter out test cases based on activeView
                    const testStatuses = selectedModels.map(model => {
                      if (!testCases[model]) return null;
                      const testCase = testCases[model].find(test => test.testId === tc.id);
                      return testCase ? testCase.status : null;
                    });
                    
                    // If in "disabled" view, skip if all models have this test case enabled
                    if (activeView === 'disabled' && testStatuses.every(status => status === 'enabled')) {
                      return null;
                    }
                    
                    // Determine the background color for the first column based on the status
                    const firstStatusCell = testCases[selectedModels[0]]?.find(test => test.testId === tc.id);
                    const isFirstCellEnabled = firstStatusCell?.status === 'enabled';
                    
                    const bgColorClass = darkMode 
                      ? (isFirstCellEnabled ? 'bg-green-900 bg-opacity-20' : 'bg-red-900 bg-opacity-20')
                      : (isFirstCellEnabled ? 'bg-green-50' : 'bg-red-50');
                    
                    return (
                      <tr key={index} className={`${darkMode ? 'border-gray-700' : 'border-gray-100'} border-b`}>
                        <td className={`p-4 sticky left-0 z-10 font-medium ${bgColorClass}`}>
                          <div className="flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                              isFirstCellEnabled
                                ? darkMode ? 'bg-green-500' : 'bg-green-500'
                                : darkMode ? 'bg-red-500' : 'bg-red-500'
                            }`}></span>
                            {tc.name}
                          </div>
                        </td>
                        {selectedModels.map((model, modelIndex) => {
                          const modelTestCases = testCases[model];
                          if (!modelTestCases) {
                            return <td key={modelIndex} className="p-4 text-center">—</td>;
                          }
                          
                          const testCase = modelTestCases.find(test => test.testId === tc.id);
                          if (!testCase) {
                            return <td key={modelIndex} className="p-4 text-center">—</td>;
                          }
                          
                          return (
                            <td key={modelIndex} className="p-4 text-center">
                              <span className={`inline-flex items-center justify-center ${
                                testCase.status === 'enabled' 
                                  ? darkMode 
                                    ? 'text-green-400' 
                                    : 'text-green-600' 
                                  : darkMode 
                                    ? 'text-red-400' 
                                    : 'text-red-600'
                              } font-semibold`}>
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                  testCase.status === 'enabled' 
                                    ? darkMode 
                                      ? 'bg-green-500' 
                                      : 'bg-green-500' 
                                    : darkMode 
                                      ? 'bg-red-500' 
                                      : 'bg-red-500'
                                }`}></span>
                                {testCase.status === 'enabled' ? 'Enabled' : 'Disabled'}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  }).filter(Boolean)}
                </>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

  // Standard single-model view table
  const renderStandardTable = () => {
    return (
      <div className="overflow-x-auto">
        {loading ? (
          <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray'}`}>
            <div className="inline-block animate-spin mr-2">↻</div>
            Loading test case data...
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className={`text-left ${darkMode ? 'text-gray-400' : 'text-gray'} text-sm`}>
                <th className="p-4 md:w-1/3">
                  <button 
                    className={`flex items-center gap-1 text-left font-medium ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray hover:text-dark'}`}
                    onClick={() => handleSort('testCase')}
                  >
                    Test Case
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    {sortField === 'testCase' && <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  </button>
                </th>
                <th className="p-4 md:w-1/3">
                  <button 
                    className={`flex items-center gap-1 text-left font-medium ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray hover:text-dark'}`}
                    onClick={() => handleSort('status')}
                  >
                    Status
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    {sortField === 'status' && <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  </button>
                </th>
                <th className="p-4 md:w-1/3">
                  <button 
                    className={`flex items-center gap-1 text-left font-medium ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray hover:text-dark'}`}
                    onClick={() => handleSort('modified')}
                  >
                    Last Modified
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    {sortField === 'modified' && <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className={darkMode ? 'text-gray-300' : ''}>
              {!selectedModel ? (
                <tr>
                  <td className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray'}`} colSpan="3">
                    Please select a manufacturer and model to view test cases
                  </td>
                </tr>
              ) : filteredTestCases.length === 0 ? (
                <tr>
                  <td className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray'}`} colSpan="3">
                    No test cases match the selected filters
                  </td>
                </tr>
              ) : (
                filteredTestCases.map((tc, index) => (
                  <tr key={index} className={`${darkMode ? 'border-gray-700' : 'border-gray-100'} border-b`}>
                    <td className="p-4">{tc.testCase}</td>
                    <td className="p-4">
                      <span className={`flex items-center ${
                        tc.status === 'enabled' 
                          ? darkMode 
                            ? 'text-green-400' 
                            : 'text-secondary-dark' 
                          : darkMode 
                            ? 'text-red-400' 
                            : 'text-danger'
                      } font-semibold`}>
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          tc.status === 'enabled' 
                            ? darkMode 
                              ? 'bg-green-500' 
                              : 'bg-secondary' 
                            : darkMode 
                              ? 'bg-red-500' 
                              : 'bg-danger'
                        }`}></span>
                        {tc.status === 'enabled' ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4">{tc.modified}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // Calculate counters for single model view
  const totalTestsCount = selectedModel && testCases[selectedModel] ? testCases[selectedModel].length : 0;
  const enabledCount = selectedModel && testCases[selectedModel] ? testCases[selectedModel].filter(tc => tc.status === 'enabled').length : 0;
  const disabledCount = selectedModel && testCases[selectedModel] ? testCases[selectedModel].filter(tc => tc.status === 'disabled').length : 0;

  // UI style helpers for comparison mode
  const getModelSelectStyles = (model) => {
    const isSelected = selectedModels.includes(model);
    return `
      mr-1 mb-1 inline-block px-3 py-1 rounded-full text-sm 
      ${darkMode 
        ? isSelected ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
        : isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } 
      cursor-pointer transition-colors duration-150
    `;
  };

  return (
    <div className={`${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'} min-h-screen transition-colors duration-200`}>
      <div className="max-w-6xl mx-auto p-4">
        {/* ERROR ALERT */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
            <button 
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </button>
          </div>
        )}

        {/* Header */}
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-4 rounded-lg shadow mb-4 flex justify-between items-center transition-colors duration-200`}>
          <div>
            <h1 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-darker'}`}>Test Case Monitoring Dashboard</h1>
            <div className={`${darkMode ? 'text-gray-400' : 'text-gray'} text-sm`}>Monitor and track test case status across device configurations</div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-700'}`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            <div className={`${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-light text-dark'} px-4 py-2 rounded-full text-sm flex items-center transition-colors duration-200`}>
              <span className="mr-2">⏱️</span>
              Last updated: {lastUpdated}
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-4 rounded-lg shadow mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 transition-colors duration-200`}>
          <div>
            <label className={`block mb-2 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-darker'}`}>Manufacturer</label>
            {Object.keys(manufacturers).length === 0 && !loading ? (
              <div className="text-yellow-500 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200 p-2 rounded mb-2">
                No manufacturers found. Please check the server connection.
              </div>
            ) : null}
            <select 
              className={`w-full p-2 border ${darkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-800'} rounded transition-colors duration-200`}
              value={selectedManufacturer}
              onChange={handleManufacturerChange}
              disabled={loading}
            >
              <option value="">Select manufacturer</option>
              {Object.keys(manufacturers).map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
          </div>
          
          {isComparisonMode ? (
            <div>
              <label className={`block mb-2 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-darker'}`}>Select Models to Compare</label>
              <div className="max-h-36 overflow-y-auto p-2 border rounded">
                {selectedManufacturer && manufacturers[selectedManufacturer] ? (
                  manufacturers[selectedManufacturer].length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {manufacturers[selectedManufacturer].map((model, index) => {
                        const displayName = getCompactModelDisplay(model);
                        const fullInfo = getFullModelInfo(model);
                        const modelCode = extractModelCode(model);
                        
                        return (
                          <span 
                            key={index} 
                            className={getModelSelectStyles(model)}
                            onClick={() => handleModelSelectionToggle(model)}
                            title={fullInfo}
                          >
                            <span>{displayName}</span>
                            {modelCode && (
                              <span className={`text-xs ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                ({modelCode})
                              </span>
                            )}
                            {selectedModels.includes(model) && (
                              <span className="ml-1">✓</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={`${darkMode ? 'text-gray-400' : 'text-gray'}`}>No models available for this manufacturer</div>
                  )
                ) : (
                  <div className={`${darkMode ? 'text-gray-400' : 'text-gray'}`}>Please select a manufacturer</div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className={`block mb-2 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-darker'}`}>Model</label>
              <div className="flex items-center">
                <select 
                  className={`flex-1 p-2 border ${darkMode ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-800'} rounded-l transition-colors duration-200`}
                  value={selectedModel}
                  onChange={handleModelChange}
                  disabled={!selectedManufacturer || loading}
                >
                  <option value="">Select model</option>
                  {selectedManufacturer && manufacturers[selectedManufacturer] && 
                    manufacturers[selectedManufacturer].map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))
                  }
                </select>
                {selectedModel && (
                  <button
                    className={`p-2 ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'} rounded-r transition-colors duration-200`}
                    onClick={() => showModelConfig(selectedModel)}
                    title="View configuration file"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Comparison Mode Toggles */}
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-4 rounded-lg shadow mb-4 flex flex-wrap gap-3 transition-colors duration-200`}>
          <button 
            className={`px-4 py-2 rounded ${
              isComparisonMode
                ? darkMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-500 text-white' 
                : darkMode 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-gray-200 text-gray-700'
            } transition-colors duration-200`}
            onClick={toggleComparisonMode}
            disabled={!selectedManufacturer || loading}
          >
            {isComparisonMode ? 'Exit Comparison Mode' : 'Enter Comparison Mode'}
          </button>
          
          <button 
            className={`px-4 py-2 rounded ${
              showAllManufacturerModels
                ? darkMode 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-500 text-white' 
                : darkMode 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-gray-200 text-gray-700'
            } transition-colors duration-200`}
            onClick={toggleAllManufacturerModels}
            disabled={!selectedManufacturer || loading}
          >
            {showAllManufacturerModels ? 'Unselect All Models' : 'Select All Manufacturer Models'}
          </button>
          
          <div className={`ml-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm flex items-center`}>
            {isComparisonMode && selectedModels.length > 0 && (
              <>
                <span className="mr-2">Selected:</span>
                <span className={`px-2 py-1 rounded-full ${
                  darkMode 
                    ? 'bg-blue-900 text-blue-100' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {selectedModels.length} models
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* Toggle View */}
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-light'} rounded-md overflow-hidden flex mb-4 transition-colors duration-200`}>
          <button 
            className={`flex-1 py-2 px-4 text-sm font-semibold ${
              activeView === 'all' 
                ? darkMode 
                  ? 'bg-gray-800 text-blue-400 shadow' 
                  : 'bg-white text-primary shadow' 
                : darkMode 
                  ? 'text-gray-400' 
                  : 'text-gray'
            } transition-colors duration-200`}
            onClick={() => toggleView('all')}
            disabled={loading}
          >
            All Test Cases
          </button>
          <button 
            className={`flex-1 py-2 px-4 text-sm font-semibold ${
              activeView === 'disabled' 
                ? darkMode 
                  ? 'bg-gray-800 text-blue-400 shadow' 
                  : 'bg-white text-primary shadow' 
                : darkMode 
                  ? 'text-gray-400' 
                  : 'text-gray'
            } transition-colors duration-200`}
            onClick={() => toggleView('disabled')}
            disabled={loading}
          >
            Disabled Only
          </button>
          <button 
            className={`flex-1 py-2 px-4 text-sm font-semibold ${
              activeView === 'changes' 
                ? darkMode 
                  ? 'bg-gray-800 text-blue-400 shadow' 
                  : 'bg-white text-primary shadow' 
                : darkMode 
                  ? 'text-gray-400' 
                  : 'text-gray'
            } transition-colors duration-200 ${isComparisonMode ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => toggleView('changes')}
            disabled={loading || isComparisonMode}
            title={isComparisonMode ? 'Not available in comparison mode' : 'Show recent changes'}
          >
            Recent Changes
          </button>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 mb-4">
          <button 
            className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary hover:bg-primary-dark'} text-white py-2 px-4 rounded flex items-center gap-2 disabled:bg-opacity-70 transition-colors duration-200`}
            onClick={refreshData}
            disabled={loading}
          >
            {loading ? 'Loading...' : <><span>↻</span> Refresh Data</>}
          </button>
          <button 
            className={`${
              darkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600' 
                : 'bg-light text-dark hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400'
            } py-2 px-4 rounded transition-colors duration-200`}
            onClick={exportData}
            disabled={loading || (!isComparisonMode ? !filteredTestCases.length : selectedModels.length === 0)}
          >
            Export Report
          </button>
        </div>
        
        {/* Main Table */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden transition-colors duration-200`}>
          <div className={`flex justify-between items-center p-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-light border-gray-200'} border-b transition-colors duration-200`}>
            <div className={`font-semibold ${darkMode ? 'text-white' : 'text-darker'}`}>
              {isComparisonMode ? 'Test Case Comparison' : 'Test Case Status'}
            </div>
            
            {/* Status counters - only show in single model view */}
            {!isComparisonMode && filteredTestCases.length > 0 && (
              <div className="flex gap-2">
                {/* Total tests count */}
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  darkMode 
                    ? 'bg-blue-900 text-blue-100' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {totalTestsCount} Total Tests
                </div>
                
                {/* Enabled tests count */}
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  darkMode 
                    ? 'bg-green-900 text-green-100' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {enabledCount} Enabled Tests
                </div>
                
                {/* Disabled tests count */}
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  darkMode 
                    ? 'bg-amber-900 text-amber-100' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {disabledCount} Disabled Tests
                </div>
              </div>
            )}
          </div>
          
          {/* Conditional render based on view mode */}
          {isComparisonMode ? renderComparisonTable() : renderStandardTable()}
        </div>
        
        {/* Footer */}
        <div className={`text-center ${darkMode ? 'text-gray-500' : 'text-gray'} text-sm mt-8`}>
          Robot Test Case Monitoring System | v1.0.0 | © 2025
        </div>

        {/* Configuration Modal */}
        {showConfigModal && (
          <Modal 
            title={configModalTitle}
            onClose={() => setShowConfigModal(false)}
            darkMode={darkMode}
            onSave={saveConfigChanges}
            isEditable={true}
          >
            <SyntaxHighlighter 
              content={configModalContent} 
              darkMode={darkMode}
              onContentChange={handleConfigContentChange}
            />
          </Modal>
        )}
      </div>
      
      {/* CSS for comparison mode */}
      <style jsx>{`
        .models-comparison-container {
          overflow-x: auto;
          max-width: 100%;
        }
        
        .comparison-table {
          min-width: 100%;
        }
        
        .comparison-table th:first-child,
        .comparison-table td:first-child {
          min-width: 180px;
          max-width: 300px;
        }
      `}</style>
    </div>
  );
};

export default TestCaseMonitoringDashboard;