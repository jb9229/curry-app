// @flow
import React from 'react';
import {
  Image, Picker, StyleSheet, Text, View,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: '#fff',
  },
  headerWrap: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 20,
    marginLeft: 5,
    marginRight: 5,
  },
  iconImage: {
    width: 62,
    height: 62,
  },
  oriAccListWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  oriAccPicker: {
    width: 190,
    height: 50,
  },
});

type Props = {
  changeOriAcc: Function,
  oriAccList: Array<Object>,
  selOriAccount: Object,
};
export default class OriAccSelOrganism extends React.Component<Props> {
  /**
   * 원통장 선택 변경
   * @param account 변경 될 원통장
   * @returns null
   */
  changeOriAcc = (account: Object) => {
    const { changeOriAcc } = this.props;

    // validation
    if (account == null) {
      return;
    }

    changeOriAcc(account);
  };

  render() {
    const { oriAccList, selOriAccount } = this.props;
    const accountItems = oriAccList.map(account => (
      <Picker.Item key={account.id} value={account} label={account.description} />
    ));

    return (
      <View style={styles.container}>
        <View style={styles.headerWrap}>
          <Image style={styles.iconImage} source={require('../../assets/images/curry-icon.png')} />
          <Text>brand / notice</Text>
        </View>
        <View style={styles.oriAccListWrap}>
          <Text>은행 통장: </Text>
          <Picker
            selectedValue={selOriAccount}
            style={styles.oriAccPicker}
            onValueChange={itemValue => this.changeOriAcc(itemValue)}
          >
            {accountItems}
          </Picker>
        </View>
      </View>
    );
  }
}
