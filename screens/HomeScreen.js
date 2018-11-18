// @flow
import React from 'react';
import {
  Alert,
  Button,
  Image,
  Picker,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import DivAccountList from './div_account/DivAccoutList';
import { serverApiUrl_oriAccounts, bankOpenApiUrl_accountbalance, serverApiUrl_divAccounts } from '../constants/Network';
import moment from 'moment';

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  divAccountListWrap: {
    flex: 5,
  },
  accountPicker: {
    width: 190,
    height: 50,
  },
  accCtlButton: {},
  accCtlButtonView: {
    marginRight: 10,
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
  divAccounts: Array,
  isAccLoaded?: boolean,
  isEmptyDivAccount: boolean,
  fintechUseNum: string,
};

export default class HomeScreen extends React.Component<Props, State> {
  static navigationOptions = {
    header: null,
  };

  state = {
    isAccLoaded: undefined,
    isEmptyDivAccount: undefined,
    selAccount: null,
    accounts: [],
    divAccounts: [],
    accountDescript: null,
    fintechUseNum: null,
  };

  componentDidMount() {
    let userId  = 1;

    this.requestAccounts(userId);
  }

  changeAccount = (account, itemIndex) => {
    console.log("changeAccount:"+account.fintechUseNum);
    this.setState({
      isEmptyDivAccount: undefined,
      selAccount: account,
    });
    this.requestBankAccounBalance(account);
  }

  requestAccounts = (userId) => {
    // this.setState({
    //   accounts: [],
    // });

    return fetch(`${serverApiUrl_oriAccounts}${userId}`)
      .then(response => response.json())
      .then((responseJson) => {
        console.log(responseJson);
        this.setState({
          isAccLoaded: true,
          accounts: responseJson,
        });
      })
      .catch((error) => {
        Alert.alert('handleLoadingError', error.message);
        return error;
      });
  };

  addAccount = () => {
    this.props.navigation.navigate('Links');
  };

  deleteAccount = () => {};

  requestDivAccountBalance(oriAccountId) {
    return fetch(`${serverApiUrl_divAccounts}${oriAccountId}`)
      .then(response => response.json())
      .then((responseJson) => {
        console.log(responseJson);
        this.addDivAccount(responseJson);
      })
      .catch((error) => {
        Alert.alert('handleLoadingError', error.message);
        return error;
      });
  }
  
  addDivAccount(newDivAccounts) {
    const calBalanceDivAccounts = this.calDefaultDivAccountBalance(newDivAccounts);
    
    this.setState({
      divAccounts: [...calBalanceDivAccounts, ...newDivAccounts],
    });
  }

  calDefaultDivAccountBalance(newDivAccounts) {
    const { divAccounts } = this.state;

    for(var item in newDivAccounts) {
      let defaultDivAccounts  = divAccounts[0];
      defaultDivAccounts.balance  = defaultDivAccounts.balance - newDivAccounts[item].balance;
    }

    return divAccounts;
  }

  requestBankAccounBalance(account) {
    const { inquiryToken } = this.state;
    const paramData = {
      fintech_use_num: account.fintech_use_num,
      tran_dtime: moment().format('YYYYMMDDHHmmss'),
    };

    return fetch(
      `${bankOpenApiUrl_accountbalance}?fintech_use_num=${encodeURIComponent(
        paramData.fintech_use_num,
      )}&tran_dtime=${encodeURIComponent(paramData.tran_dtime)}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=UTF-8',
          Authorization: inquiryToken,
        },
      },
    )
      .then(response => response.json())
      .then((responseJson) => {
        this.addDefaultDivAccount(account, responseJson);

        return responseJson;
      })
      .catch((error) => {
        Alert.alert('handleLoadingError', error.message);
        return error;
      });
  }

  addDefaultDivAccount(account, responseJson) {
    const rspCode = responseJson.rsp_code;
    // if (rspCode === 'A0000') {
    const newAccount = {
      description: '한달 용돈',
      // balance: responseJson.balance_amt,
      // date: responseJson.bank_tran_date,
      // bank: responseJson.bank_code_tran,
      balance: 2980000,
      date: '20181107',
      bank: '098',
    };

    this.setState({
      isEmptyDivAccount: false,
      divAccounts: [newAccount],
    });

    this.requestDivAccountBalance(account.id);
    // }
  }

  requestAddDivAccount = async (addDivAccDescription, addDivAccBalance) => {
    const { selAccount } = this.state;

    await fetch(`${serverApiUrl_divAccounts}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oriAccountId: selAccount.id,
          description: addDivAccDescription,
          balance: addDivAccBalance,
        }),
      })
      .then(response => response.json())
      .then((responseJson) => {
        this.addDivAccount(responseJson);
      })
      .catch((error) => {
        Alert.alert('handleLoadingError', error.message);
        return error;
      });
  };

  render() {
    const { divAccounts, isAccLoaded, isEmptyDivAccount, accounts, fintechUseNum, accountDescript, selAccount } = this.state;

    const accountItems = this.state.accounts.map((s, i) => (
      <Picker.Item key={i} value={s} label={s.description} />
    ));

    return (
      <View style={styles.container}>
        <View style={styles.headerWrap}>
          <Image style={styles.iconImage} source={require('../assets/images/curry-icon.png')} />
          <Text>brand / notice</Text>
        </View>
        <View style={styles.accountListWrap}>
          <Picker
            selectedValue={selAccount}
            style={styles.accountPicker}
            onValueChange={(itemValue, itemIndex) => this.changeAccount(itemValue, itemIndex)}
          >
            {accountItems}
          </Picker>

          <View style={styles.accCtlButtonView}>
            <Button
              onPress={this.addAccount}
              title="추가"
              color="#841584"
              accessibilityLabel="Add Account"
              style={styles.accCtlButton}
            />
          </View>
          <View style={styles.accCtlButtonView}>
            <Button
              onPress={this.deleteAccount}
              title="삭제"
              color="#841584"
              accessibilityLabel="Delete Account"
              style={styles.accCtlButton}
            />
          </View>
        </View>

        <View style={styles.divAccountListWrap}>
          {!isAccLoaded && (
            <View style={styles.emptyAccount}>
              <Text>Add Account</Text>
            </View>
          )}
          {isAccLoaded && (
            <ScrollView contentContainerStyle={styles.contentContainer}>
              <DivAccountList account={selAccount} divAccounts={divAccounts} isEmptyDivAccount={isEmptyDivAccount} requestAddDivAccount={this.requestAddDivAccount}/>
            </ScrollView>
          )}
        </View>
      </View>
    );
  }
}
