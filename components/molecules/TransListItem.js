import React from 'react';
import {
  StyleSheet, TouchableOpacity, Text, View,
} from 'react-native';

const styles = StyleSheet.create({
  cardWrap: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 5,
    marginBottom: 5,
  },
  rowWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftWrap: {},
  rightWrap: {
    alignItems: 'flex-end',
  },
  tranDateText: {
    flex: 1,
    fontWeight: 'bold',
  },
  tranTimeText: {
    flex: 1,
    color: 'gray',
  },
  branchNameText: {
    flex: 1,
    marginBottom: 5,
  },
  tranAmtText: {
    flex: 1,
    flexWrap: 'nowrap',
  },
  tranBalanceText: {
    flex: 1,
    color: 'gray',
  },
  depositText: {
    color: 'blue',
  },
  withdrawalText: {
    color: 'red',
  },
  selectedItem: {
    backgroundColor: '#fffbdd',
  },
});

export default class TransListItem extends React.PureComponent {
  onPress = () => {
    const { id, item, onPressItem } = this.props;
    onPressItem(id, item);
  };

  render() {
    const { item, selected } = this.props;
    const itemStyle = selected ? styles.selectedItem : null;

    return (
      <TouchableOpacity onPress={this.onPress}>
        <View style={[styles.cardWrap, itemStyle]}>
          <View style={styles.rowWrap}>
            <View style={styles.leftWrap}>
              <Text style={styles.tranDateText}>{item.tran_date}</Text>
              <Text style={styles.tranTimeText}>{item.tran_time}</Text>
            </View>

            <View style={styles.rightWrap}>
              <Text style={styles.branchNameText}>{item.branch_name}</Text>
              {item.inout_type === '입금' ? (
                <Text style={[styles.tranAmtText, styles.depositText]}>{item.tran_amt}</Text>
              ) : (
                <Text style={[styles.tranAmtText, styles.withdrawalText]}>
-
                  {item.tran_amt}
                </Text>
              )}

              <Text style={styles.tranBalanceText}>
                잔액
                {item.after_balance_amt}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}
