// @flow
import React from 'react';
import {
  Alert, StyleSheet, Text, TouchableHighlight, View,
} from 'react-native';
import * as numberUtils from '../../utils/number-common';

const styles = StyleSheet.create({
  cardWrap: {
    flex: 1,
    flexWrap: 'wrap',
    backgroundColor: 'white',
    marginLeft: 15,
    marginRight: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  header: {},
  titleWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 50,
  },
  balanceWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commandWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 25,
  },
  deleteText: {
    color: 'red',
  },
  commandText: {
    color: 'blue',
  },
  defaultText: {
    color: 'blue',
  },
});

type Props = {
  divAccount: Object,
  deleteAccount: Function,
  navigateTransListScreen: Function,
};

export default class AccountCard extends React.Component<Props> {
  cancelDeleAcc = () => {};

  deleteAccountCard = () => {
    const { deleteAccount, divAccount } = this.props;
    Alert.alert(
      '주의',
      '정말 삭제 합니까?',
      [
        { text: 'OK', onPress: () => deleteAccount(divAccount.id) },
        { text: 'CANCEL', onPress: () => this.cancelDeleAcc() },
      ],
      { cancelable: false },
    );
  };

  render() {
    const { divAccount, navigateTransListScreen } = this.props;
    const balanceStr = numberUtils.currencyformat(divAccount.balance);

    return (
      <View style={styles.cardWrap}>
        <View style={styles.header}>
          {divAccount.isDefault && <Text style={styles.defaultText}>대표</Text>}
          {!divAccount.isDefault && (
            <TouchableHighlight
              onPress={() => {
                this.deleteAccountCard();
              }}
            >
              <Text style={styles.deleteText}>삭제</Text>
            </TouchableHighlight>
          )}
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.titleText}>{divAccount.description}</Text>
        </View>
        <View style={styles.balanceWrap}>
          <Text style={styles.balanceText}>{balanceStr}</Text>
        </View>
        <View style={styles.commandWrap}>
          <TouchableHighlight
            onPress={() => {
              navigateTransListScreen(divAccount);
            }}
          >
            <Text style={styles.commandText}>거래내역</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}
