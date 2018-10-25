// @flow
import React from 'react';
import {
  Alert, Picker, ScrollView, StyleSheet, Text, View,
} from 'react-native';

import { MonoText } from '../components/StyledText';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  accountPicker: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyAccount: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
});

type Props = {};

type State = {
  isEmptyAccount?: boolean,
};

export default class HomeScreen extends React.Component<Props, State> {
  static navigationOptions = {
    header: null,
  };

  state = {
    isEmptyAccount: undefined,
    accounts: [],
  };

  componentDidMount() {
    this.requestAccountList();
  }

  requestAccountList() {
    return fetch('https://facebook.github.io/react-native/movies.json')
      .then(response => response.json())
      .then((responseJson) => {
        this.setState(
          {
            isEmptyAccount: false,
          },
          () => {},
        );
      })
      .catch((error) => {
        Alert.alert('handleLoadingError', error);
      });
  }

  render() {
    const { isEmptyAccount, accounts } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.accountPicker}>
          <Picker
            selectedValue={accounts}
            style={{ height: 50, width: 200 }}
            onValueChange={(itemValue, itemIndex) => this.setState({ accounts: itemValue })}
          >
            <Picker.Item label="하나 진범 카드" value="hanaAccountJinbeom" />
            <Picker.Item label="하나 정원 카드" value="hanaAccountJeongwon" />
          </Picker>
        </View>
        {isEmptyAccount === undefined && (
          <View style={styles.emptyAccount}>
            <Text>쪼갠 통장 로딩 중....</Text>
          </View>
        )}
        {isEmptyAccount && (
          <View style={styles.emptyAccount}>
            <Text>add Account</Text>
          </View>
        )}
        {!isEmptyAccount && (
          <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} />
        )}
      </View>
    );
  }
}
