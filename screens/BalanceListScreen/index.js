// @flow
import React from 'react';
import {
  Alert, AsyncStorage, StyleSheet, Text, View, TouchableHighlight,
} from 'react-native';
import moment from 'moment';
import BalanceListPresenter from './presenter';
import { handleJsonResponse, dispatchJsonResponse, dispatchJsonSuccResponse, handleNetworkError } from '../../utils/network-common';
import {
  CURRYSERVER_ORIACCOUNTS,
  CURRYSERVER_DIVACCOUNTS,
  OPENBANKSERVER_ACCOUNT_BALANCE,
  PERSISTKEY_OPENBANKINQUIRY,
} from '../../constants/Network';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyAccount: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

type Props = {
  navigation: Object
};

type State = {
  inquiryToken: string,
  oriAccList: Array<Object>,
  selOriAccount: {
    id: number,
    fintech_use_num: string,
  },
  divAccList: Array<Object>,
  isEmptyOriAccList?: boolean,
};

export default class BalanceListScreen extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      inquiryToken: 'Bearer 5a965cd7-0ec3-4312-a7aa-dc8da4838e18',
      isEmptyOriAccList: undefined,
      oriAccList: [],
      selOriAccount: {
        id: 0,
        fintech_use_num: '',
      },
      divAccList: [],
    };
  }

  componentDidMount() {
    const userID = 1; // it will receiv from redux after

    this.requestOriAccList(userID);
  }

  /*
   * 인증 토근 설정 함수, 미구현
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

    return true;
  }

  /**
   * 대표 나누기통장 추가 함수
   * @param {Object} balanceInfo 오픈뱅크 잔액요청 결과정보
   * @returns null
   */
  addDefDivAcc = (balanceInfo: Object) => {
    const { selOriAccount } = this.state;

    // const rspCode = balanceInfo.rsp_code;
    // if (rspCode === 'A0000') {
    const newAccount = {
      id: -1,
      isDefault: true,
      description: '한달 용돈',
      // balance: balanceInfo.balance_amt,
      // date: balanceInfo.bank_tran_date,
      // bank: balanceInfo.bank_code_tran,
      balance: 2980000,
      date: '20181107',
      bank: '098',
      rspCode: balanceInfo.rsp_code,
    };

    this.setState({
      divAccList: [newAccount],
    });

    this.requestDivAccList(selOriAccount.id);
    // }
  };

  /**
   * 나누기 통장 추가 함수
   * @param {Array<Object>} divAccInfoList 추가할 나누기통장 정보 리스트
   * @returns null
   */
  addDivAcc = (divAccInfoList: Array<Object>) => {
    const calBalanceDivAccounts = this.calDefDivAccBalance(divAccInfoList);

    this.setState({
      divAccList: [...calBalanceDivAccounts, ...divAccInfoList],
    });
  };

  /**
   * 원통장 선택 변경
   * @param account 변경 될 원통장
   * @returns null
   */
  changeOriAcc = (account: Object) => {
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
   * 나누기 통장 생성 함수
   * @param {string} description 생성할 나누기통장 설명
   * @param {number} balance 생성할 나누기통장 잔액
   * @returns null
   */
  createDivAcc = (description: string, balance: number) => {
    this.requestCreaDivAcc(description, balance);
  };

  /**
   * 대표통장 잔액 계산 함수
   * @param {Array} newDivAccounts 추가될 나누기통장 리스트
   * @returns divAccList 대표통장의 잔액이 계산된 나누기통장 리스트
   */
  calDefDivAccBalance = (newDivAccounts: Array<Object>) => {
    const { divAccList } = this.state;

    newDivAccounts.forEach((newDivAccount) => {
      const defaultDivAccounts = divAccList[0];
      defaultDivAccounts.balance -= newDivAccount.balance;
    });

    return divAccList;
  };

  /**
   * 나누기 통장 삭제 함수
   *  1. 나누기 통장 서버 Data 삭제
   *  2. 나누기 통장 Refresh
   *
   * @param divAccId: 나누기 통장 Server Data Id
   * @returns null
   */
  deleteDivAcc = (id: number) => {
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
      .catch((error) => {
        Alert.alert('handleLoadingError', error.message);
        return false;
      });
  };

  /**
   * 원통장 리스트 요청
   * @param userID 사용자 아이디
   * @returns null
   */
  requestOriAccList = (userID: number) => {
    fetch(`${CURRYSERVER_ORIACCOUNTS}${userID}`)
      .then(handleJsonResponse)
      .then((resJson) => {
        this.successReqOriAccList(resJson);
      })
      .catch((error) => {
        Alert.alert('원통장 리스트 요청에 실패 했습니다, 통신상태 확인 후 다시 시도해 주세요.', error.message);
        return error;
      });
  };

  /**
   * 원통장 선택 변경이 있을 때, 나누기통장 리스트 재설정 함수
   * @returns null
   */
  refreshDivAccList = () => {
    this.requestOriAccBalance();
    // this.successReqOriAccBalance({a: 'ab'}); // Test
  };

  /**
   * 원통장 잔액 오픈은행서버에 요청 함수
   * @returns null
   */
  requestOriAccBalance = () => {
    const { inquiryToken, selOriAccount } = this.state;

    // valiation
    if (selOriAccount == null) { return; }

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
      .then(res => dispatchJsonSuccResponse(res, this.successReqOriAccBalance))
      .catch(error => handleNetworkError(error, this.successReqOriAccBalance)); // Test code
  }

  /**
   * 나누기통장 리스트 커리서버에 요청 함수
   * @param oriAccID 원통장 아이디
   * @returns null
   */
  requestDivAccList = (oriAccID: number) => fetch(`${CURRYSERVER_DIVACCOUNTS}${oriAccID}`)
    .then(handleJsonResponse)
    .then((responseJson) => {
      this.successReqDivAccList(responseJson);
      return responseJson;
    })
    .catch((error) => {
      Alert.alert('나누기통장 잔액리스트 요청 실패, 통신상태 확인 후 다시 시도해 주세요.', error.message);
      return error;
    });

  /**
   * 커리서버에 나누기 통장추가 요청 함수
   * @param {string} description
   * @param {number} balance
   * @returns null
   */
  requestCreaDivAcc = (description: string, balance: number) => {
    const { selOriAccount } = this.state;

    fetch(`${CURRYSERVER_DIVACCOUNTS}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oriAccID: selOriAccount.id,
        description,
        balance,
      }),
    })
      .then(handleJsonResponse)
      .then((responseJson) => {
        this.successReqCreaDivAcc(responseJson);
        return true;
      })
      .catch((error) => {
        Alert.alert('나누기통장 생성 요청 실패, 통신상태 확인 후 다시 시도해 주세요.', error.message);
        return false;
      });
  };

  /**
   * 원통장 리스트 요청 성공
   * @returns null
   */
  successReqOriAccList = (resOriAccounts: Array<Object>) => {
    let isEmpty = true;

    if (resOriAccounts.length > 0) {
      isEmpty = false;
      this.setState({ selOriAccount: resOriAccounts[0] });
    }

    this.setState({
      isEmptyOriAccList: isEmpty,
      oriAccList: resOriAccounts,
    });

    this.refreshDivAccList();
  };

  /**
   * 원통장 잔액 요청 성공 시, 호출 함수
   * @param {Object} balanceInfo 원통장 잔액
   * @returns null
   */
  successReqOriAccBalance = (balanceInfo: Object) => {
    this.addDefDivAcc(balanceInfo);
  }

  /**
   * 나누기통장정보 리스트 요청 성공 시 호출 함수, 나누기통장 리스트에 추가
   * @param {Array<Object>} divAccInfoList 나누기통장정보 리스트
   * @returns null
   */
  successReqDivAccList = (divAccInfoList: Array<Object>) => {
    this.addDivAcc(divAccInfoList);
  }

  /**
   * 나누기통장 생성 요청 성공 시 호출 함수, 나누기통장 리스트에 추가
   * @param {Object} newDivAccInfo 신규생성된 나누기통장정보
   * @returns null
   */
  successReqCreaDivAcc = (newDivAccInfo: Object) => {
    this.addDivAcc([newDivAccInfo]);
  }

  render() {
    const {
      isEmptyOriAccList, oriAccList, selOriAccount, divAccList,
    } = this.state;
    const { navigation } = this.props;

    const presenterProps = {
      oriAccList,
      selOriAccount,
      divAccList,
      changeOriAcc: this.changeOriAcc,
      createDivAcc: this.createDivAcc,
      deleteDivAcc: this.deleteDivAcc,
      ...this.props,
    };

    return (
      <View style={styles.container}>
        {isEmptyOriAccList && (
          <View style={styles.emptyAccount}>
            <TouchableHighlight
              onPress={() => {
                navigation.navigate('Links');
              }}
            >
              <Text>나눌 통장이 없습니다, 나누기 할 은행 통장을 등록 해 주세요~</Text>
            </TouchableHighlight>
          </View>
        )}
        {!isEmptyOriAccList && <BalanceListPresenter {...presenterProps} />}
      </View>
    );
  }
}
