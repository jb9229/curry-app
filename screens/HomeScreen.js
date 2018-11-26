import React from 'react';

import BalanceListScreen from './BalanceListScreen';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  render() {
    return <BalanceListScreen />;
  }
}
