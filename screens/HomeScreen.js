// @flow
import React from 'react';
import {
  Button, Picker, ScrollView, StyleSheet, Text, View,
} from 'react-native';

import DivAccountList from './div_account/DivAccoutList';

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
  fintechUseNum: string,
};

export default class HomeScreen extends React.Component<Props, State> {
  static navigationOptions = {
    header: null,
  };

  state = {
    isEmptyAccount: undefined,
    accounts: [],
    accountDescript: null,
    fintechUseNum: null,
  };

  componentDidMount() {
    this.requestAccounts();
  }

  requestAccounts() {
    this.setState({
      isEmptyAccount: false,
      accounts: [],
      accountDescript: '월 용돈',
      fintechUseNum: '101600000169321934052424',
    });
  }

  addAccount = () => {
    this.props.navigation.navigate('Links');
  };

  deleteAccount = () => {};

  render() {
    const {
      isEmptyAccount, accounts, fintechUseNum, accountDescript,
    } = this.state;

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
        <View>
          <Button
            onPress={this.addAccount}
            title="추가"
            color="#841584"
            accessibilityLabel="Add Account"
          />
          <Button
            onPress={this.deleteAccount}
            title="삭제(통제해제)"
            color="#841584"
            accessibilityLabel="Delete Account"
          />
        </View>
        {isEmptyAccount && (
          <View style={styles.emptyAccount}>
            <Text>Add Account</Text>
          </View>
        )}
        {!isEmptyAccount && (
          <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <DivAccountList accountDescript={accountDescript} fintech_use_num={fintechUseNum} />
          </ScrollView>
        )}
      </View>
    );
  }
}
