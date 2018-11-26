import React from 'react';
import {
  Alert, StyleSheet, Text, TouchableHighlight, View,
} from 'react-native';

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
  balanceText: {
    fontSize: 25,
  },
  deleteText: {
    color: 'red',
  },
  defaultText: {
    color: 'blue',
  },
});
export default class AccountCard extends React.Component {
  constructor() {
    super();

    Number.prototype.format = function () {
      if (this == 0) return 0;

      const reg = /(^[+-]?\d+)(\d{3})/;
      let n = `${this}`;

      while (reg.test(n)) n = n.replace(reg, '$1' + ',' + '$2');

      return n;
    };
  }

  deleteAccountCard = () => {
    Alert.alert(
      '주의',
      '정말 삭제 합니까?',
      [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'OK', onPress: () => this.props.deleteAccount(this.props.accId) },
      ],
      { cancelable: false },
    );
  };

  render() {
    const { title, balance, isDefault } = this.props;
    const balanceStr = balance.format();

    return (
      <View style={styles.cardWrap}>
        <View style={styles.header}>
          {isDefault && <Text style={styles.defaultText}>대표</Text>}
          {!isDefault && (
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
          <Text style={styles.titleText}>{title}</Text>
        </View>
        <View style={styles.balanceWrap}>
          <Text style={styles.balanceText}>{balanceStr}</Text>
        </View>
      </View>
    );
  }
}
