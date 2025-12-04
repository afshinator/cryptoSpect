// __tests__/configScreen.test.js

import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import ConfigScreen from '../app/config';

// --- MOCK DEPENDENCIES ---

// 1. Mock the useApiBlockingStore
const mockSetGlobalBlocking = jest.fn();
const mockSetFeatureBlocking = jest.fn();
const mockSetGlobalPreferences = jest.fn();
const mockSetFeaturePreferences = jest.fn();

let mockStoreState = {
  globalBlocking: {
    blockBackend: false,
    blockCoinGecko: false,
  },
  featureBlocking: {
    currentVolatility: {
      blockPrimary: false,
      blockSecondary: false,
    },
    currentDominance: {
      blockPrimary: false,
      blockSecondary: false,
    },
  },
  globalPreferences: {
    preferredDataSource: 'primary',
    enableFallback: true,
  },
  featurePreferences: {
    currentVolatility: {
      preferredDataSource: 'primary',
      enableFallback: true,
      useGlobalPreferences: true,
    },
    currentDominance: {
      preferredDataSource: 'primary',
      enableFallback: true,
      useGlobalPreferences: true,
    },
  },
  setGlobalBlocking: mockSetGlobalBlocking,
  setFeatureBlocking: mockSetFeatureBlocking,
  setGlobalPreferences: mockSetGlobalPreferences,
  setFeaturePreferences: mockSetFeaturePreferences,
};

jest.mock('@/stores/apiBlockingStore', () => ({
  useApiBlockingStore: jest.fn(() => mockStoreState),
  getEffectivePreferences: jest.fn((featureId) => {
    const prefs = mockStoreState.featurePreferences[featureId];
    if (prefs?.useGlobalPreferences) {
      return mockStoreState.globalPreferences;
    }
    return prefs || mockStoreState.globalPreferences;
  }),
}));

// 2. Mock getAllFeatures
jest.mock('@/constants/features', () => ({
  getAllFeatures: jest.fn(() => [
    {
      id: 'currentVolatility',
      name: 'Current Volatility',
      description: 'Fetches current volatility data',
      supportsSecondarySource: true,
    },
    {
      id: 'currentDominance',
      name: 'Current Dominance',
      description: 'Fetches current dominance data',
      supportsSecondarySource: true,
    },
  ]),
}));

// 3. Mock SegmentedControl
jest.mock('@react-native-segmented-control/segmented-control', () => {
  const { View, TouchableOpacity, Text } = require('react-native');
  return jest.fn(({ values, selectedIndex, onChange }) => (
    <View testID="segmented-control">
      {values.map((value, index) => (
        <TouchableOpacity
          key={value}
          testID={`segment-${value.toLowerCase()}`}
          onPress={() => {
            onChange({
              nativeEvent: {
                selectedSegmentIndex: index,
              },
            });
          }}
        >
          <Text>{value}</Text>
        </TouchableOpacity>
      ))}
    </View>
  ));
});

// 4. Mock Themed components
jest.mock('@/components/ScreenContainer', () => {
  const { View } = require('react-native');
  return { ScreenContainer: ({ children }) => <View>{children}</View> };
});

jest.mock('@/components/themed-text', () => {
  const { Text } = require('react-native');
  return { ThemedText: ({ children, ...props }) => <Text {...props}>{children}</Text> };
});

jest.mock('@/components/themed-view', () => {
  const { View } = require('react-native');
  return { ThemedView: ({ children }) => <View>{children}</View> };
});

jest.mock('@/components/bordered-section', () => {
  const { View } = require('react-native');
  return { BorderedSection: ({ children }) => <View>{children}</View> };
});

// Helper to reset the store state before each test
const setup = (initialState = {}) => {
  jest.clearAllMocks();
  
  mockStoreState = {
    ...mockStoreState,
    ...initialState,
    setGlobalBlocking: mockSetGlobalBlocking,
    setFeatureBlocking: mockSetFeatureBlocking,
    setGlobalPreferences: mockSetGlobalPreferences,
    setFeaturePreferences: mockSetFeaturePreferences,
  };
};

// --- TESTS ---

describe('ConfigScreen', () => {
  beforeEach(() => {
    setup();
  });

  it('renders the title and main sections', () => {
    render(<ConfigScreen />);
    
    expect(screen.getByText('API Configuration')).toBeTruthy();
    expect(screen.getByText('Global Data Source Preferences')).toBeTruthy();
    expect(screen.getByText('Global API Blocking')).toBeTruthy();
    expect(screen.getByText('Feature-Specific Settings')).toBeTruthy();
  });

  describe('Global Data Source Preferences', () => {
    it('displays the current preferred data source description', () => {
      setup({ globalPreferences: { preferredDataSource: 'primary', enableFallback: true } });
      render(<ConfigScreen />);
      
      expect(screen.getByText('Primary (Backend API)')).toBeTruthy();
    });

    it('displays secondary description when secondary is selected', () => {
      setup({ globalPreferences: { preferredDataSource: 'secondary', enableFallback: true } });
      render(<ConfigScreen />);
      
      expect(screen.getByText('Secondary (CoinGecko API)')).toBeTruthy();
    });

    it('calls setGlobalPreferences when SegmentedControl changes to secondary', () => {
      setup({ globalPreferences: { preferredDataSource: 'primary', enableFallback: true } });
      render(<ConfigScreen />);
      
      const secondarySegment = screen.getByTestId('segment-secondary');
      fireEvent.press(secondarySegment);

      expect(mockSetGlobalPreferences).toHaveBeenCalledWith({
        preferredDataSource: 'secondary',
      });
      expect(mockSetGlobalPreferences).toHaveBeenCalledTimes(1);
    });

    it('calls setGlobalPreferences when SegmentedControl changes to primary', () => {
      setup({ globalPreferences: { preferredDataSource: 'secondary', enableFallback: true } });
      render(<ConfigScreen />);
      
      const primarySegment = screen.getByTestId('segment-primary');
      fireEvent.press(primarySegment);

      expect(mockSetGlobalPreferences).toHaveBeenCalledWith({
        preferredDataSource: 'primary',
      });
      expect(mockSetGlobalPreferences).toHaveBeenCalledTimes(1);
    });

    it('calls setGlobalPreferences when fallback switch is toggled', () => {
      setup({ globalPreferences: { preferredDataSource: 'primary', enableFallback: true } });
      render(<ConfigScreen />);
      
      const fallbackSwitch = screen.getAllByRole('switch')[0]; // First switch is fallback
      fireEvent(fallbackSwitch, 'valueChange', false);

      expect(mockSetGlobalPreferences).toHaveBeenCalledWith({
        enableFallback: false,
      });
    });
  });

  describe('Feature-Specific Settings', () => {
    it('renders all features', () => {
      render(<ConfigScreen />);
      
      expect(screen.getByText('Current Volatility')).toBeTruthy();
      expect(screen.getByText('Current Dominance')).toBeTruthy();
    });

    it('allows toggling useGlobalPreferences for a feature', () => {
      setup({
        featurePreferences: {
          currentVolatility: {
            preferredDataSource: 'primary',
            enableFallback: true,
            useGlobalPreferences: true,
          },
          currentDominance: {
            preferredDataSource: 'primary',
            enableFallback: true,
            useGlobalPreferences: true,
          },
        },
      });
      render(<ConfigScreen />);
      
      // Find all switches - the "Use Global Preferences" switches should be in the feature sections
      const switches = screen.getAllByRole('switch');
      // The first two switches are global (fallback), the next ones are feature-specific
      // Find a switch that has value=true (useGlobalPreferences is true)
      // and is not the global fallback switch
      const useGlobalSwitches = switches.filter(
        (switchEl) => switchEl.props.value === true
      );
      
      // Should have at least the global fallback switch and feature useGlobalPreferences switches
      expect(useGlobalSwitches.length).toBeGreaterThan(1);
      
      // Toggle the first feature's "Use Global Preferences" switch
      // (skip the first one which is the global fallback)
      if (useGlobalSwitches.length > 1) {
        const featureUseGlobalSwitch = useGlobalSwitches[1];
        fireEvent(featureUseGlobalSwitch, 'valueChange', false);
        
        // Should be called with the feature ID and updated preferences
        expect(mockSetFeaturePreferences).toHaveBeenCalled();
        const calls = mockSetFeaturePreferences.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        // Check that it was called with a feature ID and an object containing useGlobalPreferences
        const lastCall = calls[calls.length - 1];
        expect(['currentVolatility', 'currentDominance']).toContain(lastCall[0]);
        expect(lastCall[1]).toHaveProperty('useGlobalPreferences', false);
      }
    });

    it('shows feature-specific preferences when useGlobalPreferences is false', () => {
      setup({
        featurePreferences: {
          currentVolatility: {
            preferredDataSource: 'secondary',
            enableFallback: false,
            useGlobalPreferences: false,
          },
        },
      });
      render(<ConfigScreen />);
      
      // Should show feature-specific segmented control
      const segmentedControls = screen.getAllByTestId('segmented-control');
      expect(segmentedControls.length).toBeGreaterThan(1); // At least global + one feature
    });

    it('calls setFeaturePreferences when feature-specific SegmentedControl changes', () => {
      setup({
        featurePreferences: {
          currentVolatility: {
            preferredDataSource: 'primary',
            enableFallback: true,
            useGlobalPreferences: false,
          },
        },
      });
      render(<ConfigScreen />);
      
      // Find the feature-specific segmented control segments
      const secondarySegments = screen.getAllByTestId('segment-secondary');
      // The last one should be the feature-specific one
      const featureSecondarySegment = secondarySegments[secondarySegments.length - 1];
      
      fireEvent.press(featureSecondarySegment);

      expect(mockSetFeaturePreferences).toHaveBeenCalledWith('currentVolatility', {
        preferredDataSource: 'secondary',
      });
    });
  });

  describe('Global API Blocking', () => {
    it('calls setGlobalBlocking when backend blocking switch is toggled', () => {
      render(<ConfigScreen />);
      
      // Find switches - backend blocking should be one of them
      const switches = screen.getAllByRole('switch');
      // Backend blocking switch should be in the Global API Blocking section
      const backendSwitch = switches.find(
        (switchEl) => switchEl.props.value === false
      );
      
      if (backendSwitch) {
        fireEvent(backendSwitch, 'valueChange', true);
        expect(mockSetGlobalBlocking).toHaveBeenCalled();
      }
    });
  });
});

