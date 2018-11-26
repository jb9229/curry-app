import React from 'react';
import { Alert } from 'react-native';
import moment from 'moment';
import BalanceListPresenter from './presenter';

import { handleJsonResponse } from '../../utils/network-common';
import {
  CURRYSERVER_ORIACCOUNTS,
  CURRYSERVER_DIVACCOUNTS,
  OPENBANKSERVER_ACCOUNT_BALANCE,
} from '../../constants/Network';

export default class BalanceListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inquiryToken: 'Bearer 5a965cd7-0ec3-4312-a7aa-dc8da4838e18',
      isEmptyOriAcc: undefined,
      oriAccounts: [],
      selOriAccount: null,
      isEmptyDivAcc: undefined,
      divAccounts: [],
    };
  }

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
    if (account == null) {
      return;
    }

    this.setState({
      selOriAccount: account,
    });

    this.refreshDivAccList();
  };

  /**
   * 원통장 리스트 요청
   * @param userId 사용자 아이디
   */
  reqOriAccounts = userId => fetch(`${CURRYSERVER_ORIACCOUNTS}${userId}`)
    .then(handleJsonResponse)
    .then((resJson) => {
      this.succReqOriAccounts(resJson);
    })
    .catch((error) => {
      Alert.alert('handleLoadingError', error.message);
      return error;
    });

  /**
   * 원통장 리스트 요청 성공
   */
  succReqOriAccounts = (resAccounts) => {
    let isEmpty = true;

    if (resAccounts.length > 0) {
      isEmpty = false;
      this.setState({ selOriAccount: resAccounts[0] });
    }

    this.setState({
      isEmptyOriAnt: isEmpty,
      oriAccounts: resAccounts,
    });
  };

  /*
   * ??
   */
  async setInquiryToken() {
    try {
      const inquiryToken = await AsyncStorage.getItem(PERSISTKEY_OPENBANKINQUIRY);

      if (inquiryToken != null && inquiryToken !== '') {
        this.setState({
          inquiryToken,
        });
      } else {
        this.setState({
          inquiryToken: undefined,
        });
      }
    } catch (error) {
      Alert.alert('getInquiryToken', error.message);
      return false;
    }
  }

  refreshDivAccList = () => {
    this.reqOriAccBalance();
  };

  requestDivAccountBalance = oriAccountId => fetch(`${CURRYSERVER_DIVACCOUNTS}${oriAccountId}`)
    .then(handleJsonResponse)
    .then((responseJson) => {
      // console.log(responseJson);
      this.addDivAccount(responseJson);
      return responseJson;
    })
    .catch((error) => {
      Alert.alert('handleLoadingError', error.message);
      return error;
    });

  /**
   *
   */
  reqOriAccBalance = () => {
    const { inquiryToken, selOriAccount } = this.state;

    // valiation
    if (selOriAccount == null) {
      return;
    }
    const paramData = {
      fintech_use_num: selOriAccount.fintech_use_num,
      tran_dtime: moment().format('YYYYMMDDHHmmss'),
    };

    fetch(
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
      .then(handleJsonResponse)
      .then((responseJson) => {
        this.addDefaultDivAccount(responseJson);

        return responseJson;
      })
      .catch((error) => {
        Alert.alert('handleLoadingError', error.message);
        return error;
      });
  };

  addDefaultDivAccount = (responseJson) => {
    const { selOriAccount } = this.state;

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
      isEmptyDivAcc: false,
      divAccounts: [newAccount],
    });

    this.requestDivAccountBalance(selOriAccount.id);
    // }
  };

  addDivAccount = (newDivAccounts) => {
    const calBalanceDivAccounts = this.calDefaultDivAccountBalance(newDivAccounts);

    this.setState({
      divAccounts: [...calBalanceDivAccounts, ...newDivAccounts],
    });
  };

  calDefaultDivAccountBalance = (newDivAccounts) => {
    const { divAccounts } = this.state;

    for (const item in newDivAccounts) {
      // console.log(newDivAccounts[item]);
      const defaultDivAccounts = divAccounts[0];
      defaultDivAccounts.balance -= newDivAccounts[item].balance;
    }

    return divAccounts;
  };

  /**
   * 나누기 통장 삭제
   *  1. 나누기 통장 서버 Data 삭제
   *  2. 나누기 통장 Refresh
   *
   * @param divAccId: 나누기 통장 Server Data Id
   * @returns null
   */
  deleteDivAccount = (id) => {
    // console.log(`delete will be ${id}`);
    fetch(`${CURRYSERVER_DIVACCOUNTS}${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(handleJsonResponse)
      .then(() => {
        this.refreshDivAccList();
      })
      .catch(err => console.error(err));

    // console.log(`delete request complete ${id}`);
  };

  render() {
    const {
      isEmptyOriAcc, oriAccounts, selOriAccount, isEmptyDivAcc, divAccounts,
    } = this.state;

    const { navigation } = this.props;

    const presenterProps = {
      isEmptyOriAcc,
      oriAccounts,
      selOriAccount,
      isEmptyDivAcc,
      divAccounts,
      changeOriAccount: this.changeOriAccount,
      navigation,
      openAddDivAccModal: this.openAddDivAccModal,
      addDivAccount: this.addDivAccount,
    };

    return <BalanceListPresenter {...presenterProps} />;
  }
}
