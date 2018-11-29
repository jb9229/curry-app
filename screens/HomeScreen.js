// @flow
import React from 'react';

import BalanceListScreen from './BalanceListScreen';

type Props = {};
export default class HomeScreen extends React.Component<Props> {
  static navigationOptions = {
    header: null,
  };

  render() {
    return <BalanceListScreen />;
  }
}
