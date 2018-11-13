import React from 'react';
import { createSwitchNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import BankAPIAuthWebView from '../screens/auth/BankAPIAuthWebView';

export default createSwitchNavigator(
  {
    // You could add another route here for authentication.
    // Read more at https://reactnavigation.org/docs/en/auth-flow.html
    Main: MainTabNavigator,
    BankApiAuthModal: BankAPIAuthWebView,
  },
  {
    mode: 'modal',
    headerMode: 'none',
  },
);
