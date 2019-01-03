// @flow
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  BackHandler,
} from 'react-native';
import * as api from '../../api/api';
import BalanceListPresenter from './presenter';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  emptyAccount: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

type Props = {
  navigation: Object,
};

type State = {
  userID: number,
  isLoadingComplete: boolean,
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
      userID: 1, // it will receiv from redux after
      isLoadingComplete: false,
      isEmptyOriAccList: true,
      inquiryToken: 'Bearer 5a965cd7-0ec3-4312-a7aa-dc8da4838e18',
      oriAccList: [],
      selOriAccount: null,
      divAccList: [],
    };
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

    this.init();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
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
   * 화면 기동 초기 설정 함수
   */
  init = () => {
    this.refreshOriAccList();
  };

  /**
   * 대표통장 잔액 계산 함수
   *
   * @param {number} oriAccBalAmount 계산할 원통장 잔액
   * @param {Array} divAccList 계산할 나누기통장 리스트
   *
   * @returns divAccList 대표통장의 잔액이 계산된 나누기통장 리스트
   */
  calDefDivAccBalance = (oriAccBalAmount: number, divAccList: Array<Object>) => {
    let defDivAccBalance = oriAccBalAmount;

    divAccList.forEach((divAccount) => {
      defDivAccBalance -= divAccount.balance;
    });

    return defDivAccBalance;
  };

  /**
   * 나누기 통장 생성 함수
   *
   * @param {string} description 생성할 나누기통장 설명
   * @param {number} balance 생성할 나누기통장 잔액
   * @returns null
   */
  createDivAcc = (description: string, balance: number) => {
    const { selOriAccount } = this.state;

    api.creaDivAcc(selOriAccount.id, description, balance);

    this.setDivAccList(selOriAccount);
  };

  /**
   * 대표 나누기통장 생성 함수
   *
   * @param {number} oriAccBalAmount 원통장 잔액
   * @param {Object} oriAccount 생성할 대표나누기 통장의 원통장
   * @param {Object} divAccList 생성할 대표나누기 통장의 나누기통장 리스트
   * @returns newDefDivAccount
   */
  createDefDivAcc = (oriAccBalAmount: number, oriAccount: Object, divAccList: Array<Object>) => {
    const defDivAccBalance = this.calDefDivAccBalance(oriAccBalAmount, divAccList);

    const newDefDivAccount = {
      id: -1,
      isDefault: true,
      description: oriAccount.defDivaccDescription,
      balance: defDivAccBalance,
    };

    return newDefDivAccount;
  };

  /**
   * 원통장 선택 변경 함수
   *
   * @param newSelAccount 변경 될 원통장
   * @returns null
   */
  changeOriAccSel = (newSelAccount: Object) => {
    // validation
    if (newSelAccount == null) {
      return;
    }

    this.setState({
      selOriAccount: newSelAccount,
    });

    this.setDivAccList(newSelAccount);
  };

  /**
   * 나누기 통장 삭제 함수
   *
   * @param divAccId: 나누기 통장 Server Data Id
   * @returns null
   */
  deleteDivAcc = (divAccId: number) => {
    const { selOriAccount } = this.state;

    api.deleteDivAcc(divAccId).then(() => {
      this.setDivAccList(selOriAccount);
    });
  };

  /**
   * 나누기 통장 리스트 설정 함수
   *
   * @param {Object} oriAccount 나누기통장 리스트의 원통장
   * @returns null
   */
  setDivAccList = async (oriAccount: Object) => {
    // variables
    const { inquiryToken } = this.state;
    const newDivAccList = [];

    const oriAccbalanceAmt = await api.getOpenBankAccBalance(
      inquiryToken,
      oriAccount.fintechUseNum,
    );

    if (oriAccbalanceAmt === undefined) {
      return;
    }

    api
      .getDivAccList(oriAccount.id)
      .then((divAccList) => {
        const defDivAccount = this.createDefDivAcc(oriAccbalanceAmt, oriAccount, divAccList);

        newDivAccList.push(defDivAccount);
        divAccList.forEach(divAccount => newDivAccList.push(divAccount));

        this.setState({ divAccList: newDivAccList });
      })
      .catch((error) => {
        // TODO 재시도 기능 구현 Error 팝업을 띄워우고 wait 해~
        Alert.alert('나누기통장 잔액리스트 요청에 문제가 발생 했습니다.', error.message);

        return undefined;
      });
  };

  /**
   * 원통장 리스트 새로고침 함수
   *
   * @return null
   */
  refreshOriAccList = () => {
    const { userID } = this.state;

    const newOriAccList = api
      .getOriAccList(userID)
      .then((resOriAccountList) => {
        // Validation
        if (resOriAccountList.length === 0) {
          // 원통장 존재안함
          this.setState({ isEmptyOriAccList: true });
          return;
        }

        const defaultOriAccount = resOriAccountList[0];

        this.setState({ oriAccList: resOriAccountList, selOriAccount: defaultOriAccount });

        this.setDivAccList(defaultOriAccount);

        this.setState({ isLoadingComplete: true, isEmptyOriAccList: false });
      })
      .catch((error) => {
        this.setState({ isLoadingComplete: true, isEmptyOriAccList: undefined });

        Alert.alert(`접속이 원활하지 않습니다, 종료 또는 재시도 하세요.${error.message}`, '', [
          { text: '종료', onPress: () => BackHandler.exitApp() },
          { text: '재시도', onPress: () => this.refreshOriAccList() },
        ]);
      });
  };

  render() {
    const {
      isEmptyOriAccList,
      oriAccList,
      selOriAccount,
      divAccList,
      isLoadingComplete,
    } = this.state;
    const { navigation } = this.props;

    const presenterProps = {
      oriAccList,
      selOriAccount,
      divAccList,
      changeOriAccSel: this.changeOriAccSel,
      createDivAcc: this.createDivAcc,
      deleteDivAcc: this.deleteDivAcc,
      ...this.props,
    };

    if (!isLoadingComplete) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }

    if (isEmptyOriAccList === undefined) {
      return (
        <View style={styles.container}>
          <Text>네트워크 통신에 문제가 있습니다, 재시도 해주세요</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {isEmptyOriAccList ? (
          <View style={styles.emptyAccount}>
            <TouchableHighlight
              onPress={() => {
                navigation.navigate('Links');
              }}
            >
              <Text>나눌 통장이 없습니다, 나누기 할 은행 통장을 등록 해 주세요~</Text>
            </TouchableHighlight>
          </View>
        ) : (
          <BalanceListPresenter {...presenterProps} />
        )}
      </View>
    );
  }
}
