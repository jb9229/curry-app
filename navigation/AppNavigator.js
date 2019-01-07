import { createSwitchNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import OpenBankAuthWebView from '../components/organisms/auth/OpenBankAuthWebView';

export default createSwitchNavigator(
  {
    // You could add another route here for authentication.
    // Read more at https://reactnavigation.org/docs/en/auth-flow.html
    Main: MainTabNavigator,
    OpenBankAuth: OpenBankAuthWebView,
  },
  {
    mode: 'modal',
    headerMode: 'none',
  },
);
