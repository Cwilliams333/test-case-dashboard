# Device Test Case Monitoring Dashboard

A comprehensive web application for monitoring and tracking test case status across different device configurations. This dashboard allows for efficient comparison of test results across multiple device models and manufacturers.

![Dashboard Preview](https://via.placeholder.com/800x450)

## Features

- **Device Management**: Browse and select from multiple device manufacturers (Apple, Google, Samsung, Motorola, TCL, etc.)
- **Test Case Tracking**: Monitor which tests are enabled or disabled for each device
- **Comparison Mode**: Compare test statuses across multiple devices simultaneously
- **Configuration Viewer/Editor**: View and edit device configurations with syntax highlighting
- **Filtering Options**: Filter test cases by status (all, disabled, recent changes)
- **Export Capabilities**: Export test case reports in CSV format
- **Dark/Light Mode**: Toggle between dark and light interface themes
- **Responsive Design**: Works on desktop and mobile browsers

## Technology Stack

- **Frontend**: React.js with modern hooks and functional components
- **Backend**: Node.js with Express
- **Styling**: Tailwind CSS for responsive and clean UI
- **State Management**: React hooks for local state management
- **Code Organization**: Modular architecture with separated concerns

## Getting Started

### Prerequisites

- Node.js (v14.0 or higher)
- npm (v7.0 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/device-test-monitoring-dashboard.git
   cd device-test-monitoring-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Start the production server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3001`.

## Project Structure

```
├── public/
├── src/
│   ├── api/
│   │   └── index.js            # API client functions
│   ├── components/
│   │   ├── Modal.js            # Reusable modal component
│   │   ├── SyntaxHighlighter.js # Config file syntax highlighter
│   │   └── TestCaseMonitoringDashboard.js # Main dashboard component
│   ├── data/
│   │   └── testCaseMapping.js  # Test case data mappings
│   ├── utils/
│   │   └── parseConfig.js      # Configuration file parser
│   └── server.js               # Express backend server
└── package.json
```

## API Endpoints

The dashboard communicates with a Node.js backend server through these endpoints:

- `GET /api/devices` - Get all manufacturers and device models
- `GET /api/pythia-config` - Get Pythia configuration mapping
- `GET /api/device?model=[modelName]` - Get device configuration by model name

## Configuration Files

The system reads and processes `.ini` configuration files with device specifications:

- Each device has its own `.ini` configuration file
- Test cases are enabled/disabled based on configuration sections
- The system maps configuration sections to test cases using predefined mappings

## Usage Examples

### Single Device Inspection

1. Select a manufacturer (e.g., Apple)
2. Choose a specific device model (e.g., iPhone 14 Pro)
3. View enabled/disabled test cases
4. Click "View Configuration" to see or edit the raw config file

### Multi-Device Comparison

1. Toggle "Enter Comparison Mode"
2. Select multiple devices from the same manufacturer
3. View a side-by-side comparison of test case statuses
4. Export the comparison as a CSV report

### Configuration Editing

1. Select a device and view its configuration
2. Toggle "Edit Mode" in the configuration viewer
3. Make desired changes to the configuration
4. Save changes to update the test case statuses

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Test framework integration with mobile device configurations
- Advanced React patterns for efficient state management
- Responsive design principles with Tailwind CSS
