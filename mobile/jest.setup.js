/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.I18nManager.isRTL = false;
  rn.I18nManager.doLeftAndRightSwapInRTL = false;
  rn.I18nManager.forceRTL = jest.fn();
  rn.I18nManager.allowRTL = jest.fn();
  rn.I18nManager.getConstants = () => ({
    isRTL: false,
    doLeftAndRightSwapInRTL: false,
  });
  return rn;
});

// Mock other native modules if they throw errors
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: (props) => <View {...props} />,
  };
});

jest.mock('react-native-maps', () => {
  const React = require('react');
  const {View} = require('react-native');
  class MockMapView extends React.Component {
    render() {
      return <View {...this.props}>{this.props.children}</View>;
    }
  }
  class MockMarker extends React.Component {
    render() {
      return <View {...this.props}>{this.props.children}</View>;
    }
  }
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
  };
});
