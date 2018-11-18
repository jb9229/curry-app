import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { white } from 'ansi-colors';

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
});
export default class AccountCard extends React.Component {
  render() {
    const { title, balance } = this.props;

    return (
      <View style={styles.cardWrap}>
        <View style={styles.titleWrap}>
          <Text style={styles.titleText}>{title}</Text>
        </View>
        <View style={styles.balanceWrap}>
          <Text style={styles.balanceText}>{balance}</Text>
        </View>
      </View>
    );
  }
}
