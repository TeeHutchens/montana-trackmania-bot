# Test Files

This directory contains all test and debugging files for the Montana Trackmania Discord Bot.

## 🧪 Test Files

### **Core Functionality Tests**
- `test-formatter.js` - Tests the leaderboard formatting with rankings and SECRET display
- `test-real-times.js` - Tests time formatting for real completion times vs SECRET
- `test-weekly.js` - Tests basic Weekly Shorts functionality

### **Authentication Tests**
- `test-credentials.js` - Tests credential handling
- `test-dev-auth.js` - Tests development account authentication
- `test-fresh-auth.js` - Tests fresh authentication process
- `test-access-endpoints.js` - Tests API endpoint access

### **Montana-Specific Tests**
- `test-montana-zone.js` - Tests Montana zone filtering and access
- `test-montana-names.js` - Tests Montana player name retrieval
- `test-weekly-montana.js` - Tests Montana Weekly Shorts functionality
- `test-extended-montana.js` - Extended Montana functionality tests
- `test-bot-montana.js` - Bot-specific Montana tests

### **API Tests**
- `test-api.js` - Basic API functionality tests
- `test-apis.js` - Multiple API endpoint tests
- `test-nadeo.js` - Nadeo API specific tests
- `test-openplanet.js` - OpenPlanet API tests

### **Discord Output Tests**
- `test-discord-output.js` - Tests Discord embed formatting
- `final-discord-preview.js` - Complete Discord bot output preview

## 🚀 **Usage**

Run any test from the main project directory:

```bash
# Test the formatter
node test/test-formatter.js

# Test real time formatting
node test/test-real-times.js

# Preview Discord output
node test/final-discord-preview.js
```

## 📋 **Notes**

- All test files have been updated to use correct relative paths (`../functions/`, `../helper/`)
- Tests require valid `.env` configuration in the main directory
- Montana-specific tests require account with Montana zone access
