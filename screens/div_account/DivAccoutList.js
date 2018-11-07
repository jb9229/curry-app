// @flow
import React from 'react';
import {
  Alert, AsyncStorage, FlatList, Text, View,
} from 'react-native';
import moment from 'moment';

import { bankOpenApiUrl_accountbalance, serverApiUrl_divAccounts } from '../../constants/Network';

type Props = {
  accountDescript: string,
  fintech_use_num: string,
};

type State = {
  isEmptyDivAccount?: boolean,
  divAccounts: Array,
  inquiryToken: string,
};

export default class DivAccountList extends React.Component<Props, State> {
  state = {
    isEmptyDivAccount: undefined,
    divAccounts: [],
    inquiryToken: 'Bearer 5a965cd7-0ec3-4312-a7aa-dc8da4838e18',
  };

  componentDidMount() {
    this.requestBankAccounBalance();
  }

  async setInquiryToken() {
    try {
      const inquiryToken = await AsyncStorage.getItem(PERSISTKEY_OPENBANKINQUIRY);

      if (inquiryToken != null && inquiryToken !== '') {
        this.setState(state => ({
          inquiryToken,
        }));
      } else {
        this.setState(state => ({
          inquiryToken: undefined,
        }));
      }
    } catch (error) {
      Alert.alert('getInquiryToken', error.message);
      return false;
    }
  }

  addDefaultDivAccount(responseJson) {
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
      ...this.state,
      isEmptyDivAccount: false,
      divAccounts: [newAccount],
    });

    this.requestDivAccountBalance(3);
    // }
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

      console.log(defaultDivAccounts.balance);

      defaultDivAccounts.balance  = defaultDivAccounts.balance - newDivAccounts[item].balance;

      console.log(defaultDivAccounts.balance);
    }

    return divAccounts;
  }

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

  requestBankAccounBalance() {
    const { fintech_use_num, accountDescript } = this.props;
    const { inquiryToken } = this.state;
    const paramData = {
      fintech_use_num,
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
        this.addDefaultDivAccount(responseJson);

        return responseJson;
      })
      .catch((error) => {
        Alert.alert('handleLoadingError', error.message);
        return error;
      });
  }

  render() {
    const { divAccounts, isEmptyDivAccount } = this.state;

    return (
      <View>
        {isEmptyDivAccount === undefined && (
          <View>
            <Text>쪼갠 통장 로딩 중....</Text>
          </View>
        )}

        {isEmptyDivAccount !== undefined
          && !isEmptyDivAccount && (
            <FlatList
              data={divAccounts}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Text>{item.description}:{item.balance}</Text>
              )}
            />
        )}
      </View>
    );
  }
}
