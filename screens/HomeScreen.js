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
import moment from 'moment';

import DivAccountList from './div_account/DivAccoutList';
import { CURRYSERVER_ORIACCOUNTS, OPENBANKSERVER_ACCOUNT_BALANCE, CURRYSERVER_DIVACCOUNTS } from '../constants/Network';

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
  isEmptyDivAccount?: boolean,
  selOriAccount: any,
  fintechUseNum: string,
};

export default class HomeScreen extends React.Component<Props, State> {
  static navigationOptions = {
    header: null,
  };

  state = {
    defaultAccountBalance: undefined,
    isAccLoaded: undefined,
    isEmptyDivAccount: undefined,
    selOriAccount: null,
    accounts: [],
    divAccounts: [],
    accountDescript: null,
    fintechUseNum: '',
  };

  componentDidMount() {
    const userId = 1; // it will receiv from redux after

    this.reqOriAccounts(userId);
  }

  /**
   * 원통장 변경
   * @param account 변경 될 원통장
   * @returns 
   */
  changeOriAccount = (account) => {
    // validation
    if (account == null) { return; }

    this.setState({
      isEmptyDivAccount: undefined,
      selOriAccount: account,
    });

    this.reqOriAccBalance();
  }

  /**
   * 원통장 삭제
   */
  delOriAccount = () => {};

  /**
   * 원통장 추가 폼 요청(원통장이 없을 때, 원통장 추가 버튼 클릭 시)
   */
  reqOriAccForm = () => {
    this.props.navigation.navigate('Links');
  };

  /**
   * 원통장 리스트 요청
   * @param userId 사용자 아이디
   */
  reqOriAccounts = (userId) => {
    return fetch(`${CURRYSERVER_ORIACCOUNTS}${userId}`)
      .then(response => response.json())
      .then((responseJson) => {
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

  /**
   * 
   */
  reqOriAccBalance = () => {
    const { selOriAccount, inquiryToken } = this.state;
    const paramData = {
      fintech_use_num: selOriAccount.fintech_use_num,
      tran_dtime: moment().format('YYYYMMDDHHmmss'),
    };

    return fetch(
      `${OPENBANKSERVER_ACCOUNT_BALANCE}?fintech_use_num=${encodeURIComponent(
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
        this.addDefaultDivAccount(selOriAccount, responseJson);

        return responseJson;
      })
      .catch((error) => {
        Alert.alert('handleLoadingError', error.message);
        return error;
      });
  }

  requestDivAccountBalance = (oriAccountId) => {
    return fetch(`${CURRYSERVER_DIVACCOUNTS}${oriAccountId}`)
      .then(response => response.json())
      .then((responseJson) => {
        console.log(responseJson);
        this.addDivAccount(responseJson);
        return responseJson;
      })
      .catch((error) => {
        Alert.alert('handleLoadingError', error.message);
        return error;
      });
  }

  refreshDivAccList = (refreshAccount) => {
    this.requestBankAccounBalance(refreshAccount);
  }

  addDivAccount = (newDivAccounts) => {
    const calBalanceDivAccounts = this.calDefaultDivAccountBalance(newDivAccounts);

    this.setState({
      divAccounts: [...calBalanceDivAccounts, ...newDivAccounts],
    });
  }

  calDefaultDivAccountBalance = (newDivAccounts) => {
    const { divAccounts, defaultAccountBalance } = this.state;

    let currDefaultAccBalance = defaultAccountBalance;
    for(var item in newDivAccounts) 
    {
      console.log(newDivAccounts[item]);
      let defaultDivAccounts      = divAccounts[0];
      defaultDivAccounts.balance  = defaultDivAccounts.balance - newDivAccounts[item].balance;

      currDefaultAccBalance       = defaultDivAccounts.balance;
    }

    this.setState({defaultAccountBalance: currDefaultAccBalance});

    return divAccounts;
  }

  addDefaultDivAccount = (account, responseJson) => {
    const rspCode = responseJson.rsp_code;
    // if (rspCode === 'A0000') {
    const newAccount = {
      isDefault: true,
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
    const { selOriAccount } = this.state;

    await fetch(`${CURRYSERVER_DIVACCOUNTS}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oriAccountId: selOriAccount.id,
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
    const { divAccounts, isAccLoaded, isEmptyDivAccount, accounts, fintechUseNum, accountDescript, selOriAccount, defaultAccountBalance } = this.state;

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

        <View style={styles.divAccountListWrap}>
          {!isAccLoaded && (
            <View style={styles.emptyAccount}>
              <Text>Add Account</Text>
            </View>
          )}
          {isAccLoaded && (
            <ScrollView contentContainerStyle={styles.contentContainer}>
              <DivAccountList account={selOriAccount} divAccounts={divAccounts} isEmptyDivAccount={isEmptyDivAccount} 
                requestAddDivAccount={this.requestAddDivAccount} refreshDivAccList={this.refreshDivAccList} defaultAccountBalance={defaultAccountBalance} />
            </ScrollView>
          )}
        </View>
      </View>
    );
  }
}
