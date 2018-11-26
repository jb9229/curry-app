import React from 'react';
import {
  Button, Image, Picker, StyleSheet, Text, View,
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
  accountListWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountPicker: {
    width: 190,
    height: 50,
  },
  accCtlButton: {},
  accCtlButtonView: {
    marginRight: 10,
  },
});

export default class OriAccSelOrganism extends React.Component {
  /**
   * 원통장 변경
   * @param account 변경 될 원통장
   * @returns
   */
  changeOriAccount = (account) => {
    // validation
    if (account == null) {
      return;
    }

    this.props.changeOriAccount(account);
  };

  /**
   * 원통장 삭제
   */
  delOriAccount = () => {};

  /**
   * 원통장 추가 폼 요청(원통장이 없을 때, 원통장 추가 버튼 클릭 시)
   */
  reqOriAccForm = () => {
    const { navigation } = this.props;

    navigation.navigate('Links');
  };

  render() {
    const { oriAccounts, selOriAccount } = this.props;
    const accountItems = oriAccounts.map((s, i) => (
      <Picker.Item key={i} value={s} label={s.description} />
    ));

    return (
      <View style={styles.container}>
        <View style={styles.headerWrap}>
          <Image style={styles.iconImage} source={require('../../assets/images/curry-icon.png')} />
          <Text>brand / notice</Text>
        </View>
        <View style={styles.accountListWrap}>
          <Picker
            selectedValue={selOriAccount}
            style={styles.accountPicker}
            onValueChange={(itemValue, itemIndex) => this.changeOriAccount(itemValue, itemIndex)}
          >
            {accountItems}
          </Picker>

          <View style={styles.accCtlButtonView}>
            <Button
              onPress={this.reqOriAccForm}
              title="추가"
              color="#841584"
              accessibilityLabel="Add Account"
              style={styles.accCtlButton}
            />
          </View>
          <View style={styles.accCtlButtonView}>
            <Button
              onPress={this.delOriAccount}
              title="삭제"
              color="#841584"
              accessibilityLabel="Delete Account"
              style={styles.accCtlButton}
            />
          </View>
        </View>
      </View>
    );
  }
}
