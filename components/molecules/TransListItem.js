import React from 'react';
import {
  StyleSheet, TouchableOpacity, Text, View,
} from 'react-native';

const styles = StyleSheet.create({
  transListTableRow: {
    flex: 1,
    flexDirection: 'row',
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
    const textColor = this.props.selected ? 'red' : 'black';

    return (
      <TouchableOpacity onPress={this.onPress}>
        <View style={[styles.transListTableRow, itemStyle]}>
          <Text>
            {item.tran_date}
            {item.tran_time}
          </Text>
          <Text>{item.branch_name}</Text>
          {item.inout_type === '입금' ? (
            <Text style={styles.depositText}>{item.tran_amt}</Text>
          ) : (
            <Text style={styles.withdrawalText}>{item.tran_amt}</Text>
          )}
          <Text>{item.after_balance_amt}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}
