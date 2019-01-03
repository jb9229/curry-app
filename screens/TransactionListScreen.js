// @flow
import React from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Picker,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import moment from 'moment';
import { handleJsonResponse, dispatchJsonSuccResponse, handleNetworkError } from '../utils/network-common';
import * as api from '../api/api';
import TransListItem from '../components/molecules/TransListItem';
import colors from '../constants/Colors';
import * as numberUtils from '../utils/number-common';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  moveActionModalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  moveActionModalWrap: {
    backgroundColor: '#FFF',
    padding: 20,
  },
  accInfoWarp: {
    flex: 1.2,
    backgroundColor: colors.mainColorDark,
  },
  accInfoDescWrap: {
    alignItems: 'center',
  },
  accInfoBalWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accInfoCommWrap: {
    alignItems: 'flex-end',
  },
  searchCommandWarp: {
    flex: 0.9,
    alignItems: 'center',
    backgroundColor: colors.mainColorLight,
  },
  transListWarp: {
    flex: 5,
  },
  moveAccPicker: {
    width: 190,
    height: 50,
  },
  moveTransModButWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchDateCommWrap: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  searchDateWrap: {
    flexDirection: 'row',
  },
  searPeriodText: {
    fontSize: 21,
    padding: 5,
  },
  selSearPeriText: {
    color: 'blue',
  },
  desText: {
    color: 'white',
  },
  balText: {
    fontSize: 21,
    color: 'white',
  },
  balUnitText: {
    color: 'white',
  },
  moveCommText: {
    color: 'white',
    textDecorationLine: 'underline',
  },
});

type Props = {
  navigation: Object,
}

type State = {
  inquiryToken: string,
  transactionList: Array<Object>,
  selMoveDivAccount: Object,
  moveTransSelMap: Map<string, Object>,
  searchPeriod: number,
  searchFromDate: string,
  searchTodDate: string,
}

const text = '{ "api_tran_id": "2cfc5541-17ab-40c7-b12f-82fde00f7f5f", "rsp_code": "A0000", "rsp_message": " ", "api_tran_dtm": "20160826111428881", "bank_tran_id": "F010226114NIBXQ5FWVG","bank_tran_date": "20160826","bank_code_tran": "097","bank_rsp_code": "000","bank_rsp_message": " ","fintech_use_num": "101600000169321934052424","balance_amt": "500000","page_index_use_yn": "N","page_index": "1","total_record_cnt": "1","page_record_cnt": "1","next_page_yn": "N","res_list": [{"tran_date": "20181207","tran_time": "024111","inout_type": "입금","tran_type": "현금","print_content": "모로코점","tran_amt": "2500","after_balance_amt": "10000000","branch_name": "분당점"},{"tran_date": "20160612","tran_time": "100000","inout_type": "출금","tran_type": "카드","print_content": "식비","tran_amt": "110000","after_balance_amt": "7000000","branch_name": "수원점"},{"tran_date": "20181207","tran_time": "024111","inout_type": "입금","tran_type": "현금","print_content": "식비","tran_amt": "2500","after_balance_amt": "10000000","branch_name": "모로코점"}]}';
const transTestData = JSON.parse(text, (key, value) => {
  if (key === 'after_balance_amt' || key === 'tran_amt') {
    return parseInt(value);
  }
  return value;
});

export default class TransactionListScreen extends React.PureComponent<Props, State> {
  static navigationOptions = {
    title: '나누기통장 거래내역',
  };

  constructor(props: any) {
    super(props);

    this.state = {
      inquiryToken: 'Bearer 5a965cd7-0ec3-4312-a7aa-dc8da4838e18',
      transactionList: [],
      isVisibleMoveTransModal: false,
      selMoveDivAccount: null,
      moveTransSelMap: (new Map(): Map<string, Object>),
      searchPeriod: 3,
      searchFromDate: '',
      searchToDate: '',
    };
  }

  componentDidMount() {
    const { searchPeriod } = this.state;
    this.searchTransList(searchPeriod);
  }

  calDivAccTransListBalance = (OriTransList, divAccBalance) => {
    OriTransList.forEach((transation) => {
      transation.after_balance_amt = divAccBalance;
      console.log(divAccBalance);
      console.log(transation.tran_amt);
      if (transation.inout_type === '입금') {
        divAccBalance -= transation.tran_amt;
      } else {
        divAccBalance += transation.tran_amt;
      }
    });

    return OriTransList;
  }

  /**
   * 거래내역 조회 함수
   *
   * @param {number} monthPeriod 현재로부터 월 조회 기간
   * @param {number} dayPeriod 현재로부터 일 조회 기간
   * @returns null
   */
  searchTransList = async (dayPeriod: number) => {
    const { navigation } = this.props;
    const { divAccount, fintechUseNum } = navigation.state.params;
    const { inquiryToken } = this.state;

    // 조회 조건 설정
    const fromDate = moment().subtract(dayPeriod, 'days');

    const toDate = moment();

    // 기간 설정(UI 표시를 위한)
    this.setState({ searchPeriod: dayPeriod, searchFromDate: fromDate.format('YYYY-MM-DD'), searchToDate: toDate.format('YYYY-MM-DD') });

    const resDivAccTransList = await this.getDivTransList(fromDate.format('YYYYMMDD'), toDate.format('YYYYMMDD'));
    let divAcctransList;
    if (divAccount.isDefault) {
      const oriAccTransList = await this.requestOriAccTransList();// when default divaccount
      const filtDefAccTransList = this.filterDefDivAccTransList(this.filtCondition)(
        oriAccTransList, resDivAccTransList,
      );

      const divAccBalance = api.getOpenBankAccBalance(inquiryToken, fintechUseNum);

      if (divAccBalance === undefined) {
        // TODO tranList listing fail
      } else {
        divAcctransList = this.calDivAccTransListBalance(filtDefAccTransList, divAccBalance);
      }
    } else {
      const divAccBalance = divAccount.balance;
      divAcctransList = this.calDivAccTransListBalance(resDivAccTransList, divAccBalance);
    }

    this.setState({ transactionList: divAcctransList });
  }

  /**
   * 대표나누기통장 거래내역 필터링 함수
   *
   * @param {function} pred 필터링 조건 함수
   * @param {Array} a 필터링 될 리스트
   * @param {Array} b 필터링 할 리스트
   * @return 필터링 된 리스트
   */
  filterDefDivAccTransList = pred => (a, b) => a.filter(x => !b.some((y) => {
    return pred(x, y);
  }));

  /**
   * 필터링 조건 함수
   *
   * @param {Array} x 필터링 될 리스트
   * @param {Array} y 필터링 할 리스트
   * @return 필터링 조건
   */
  filtCondition = (x, y) => (x.tran_date === y.tran_date && x.tran_time === y.tran_time
    && x.tran_amt === y.tran_amt && x.after_balance_amt === y.after_balance_amt)

  /**
   * 나누기통장 거래내역 리스트 획득 함수
   *
   * @param {number} monthPeriod 현재로부터 월 조회 기간
   * @param {string} fromDate 시작 조회일
   * @param {string} toDate 종료 조회일
   * @return {Array} 나누기통장 거래내역 리스트
   */
  getDivTransList = (fromDate: string, toDate: string) => {
    const { navigation } = this.props;
    const { divAccount, otherDivAccList } = navigation.state.params;

    const searchDivIds = [];
    if (divAccount.isDefault) {
      otherDivAccList.forEach((account) => {
        searchDivIds.push(account.id);
      });
    } else {
      searchDivIds.push(divAccount.id);
    }

    // 요청
    return api.getDivAccTransInfoList(searchDivIds, fromDate, toDate)
      .then(res => dispatchJsonSuccResponse(res, this.successGetDivTransList))
      .catch(handleNetworkError);
  }

  /**
   * 거래내역을 다른 나누기통장으로 옮기기 함수(MoveTransModal창 이동버튼에 의해서만 호출됨)
   */
  moveTransaction = () => {
    const { moveTransSelMap } = this.state;
    const { selMoveDivAccount } = this.state;

    // validation
    if (moveTransSelMap.size === 0) { Alert.alert('옮길 거래내역을 선택 해 주세요.'); return; }
    if (selMoveDivAccount === null) { Alert.alert('거래내역을 옮길 계좌를 선택 해 주세요.'); return; }

    // make new move list
    const moveList = [];
    moveTransSelMap.forEach((item) => {
      const moveTrans = item;
      moveTrans.divAccId = selMoveDivAccount.id;
      moveList.push(moveTrans);
    });

    // request
    if (selMoveDivAccount.isDefault) {
      this.requestDeleteTransList(moveList);
    } else {
      this.requestSaveOrUpdateTransList(moveList);
    }

    // close modal
    this.setState({ isVisibleMoveTransModal: false });

    // refresh tranaction list
    this.searchTransList(3);
  }

  /**
   * 오픈뱅크서버에 거래내역 리스트 요청 함수
   */
  requestOriAccTransList = () => {
    const { navigation } = this.props;
    const { divAccount } = navigation.state.params;
    const { inquiryToken } = this.state;

    const transList = api.getOpenBankTransList(inquiryToken, divAccount)
      .then(res => dispatchJsonSuccResponse(res, this.successReqOriAccTransList));

    // return transList;
    return transTestData.res_list; // testData
  }

  requestSaveOrUpdateTransList = (tranInfoList: Array<Object>) => {
    api.saveOrUpdateTransInfo(tranInfoList)
      .then(handleJsonResponse);
  };

  requestDeleteTransList = (tranInfoList: Array<Object>) => {
    api.deleteTransInfo(tranInfoList)
      .then(handleJsonResponse);
  };

  successGetDivTransList = resTransList => resTransList

  successReqOriAccTransList = (resTransInfo) => {
    // validation
    if (resTransInfo == null) {
      return;
    }

    const rspCode = resTransInfo.rsp_code;
    if (rspCode === 'A0000') {
    }

    const transList = resTransInfo.res_list;
  }

  failReqOriAccTransList = () => {
    console.log('failReqOriAccTransList');
  }

  onPressTransItem = (id: string, item: Object) => {
    // updater functions are preferred for transactional updates
    this.setState((state) => {
      // copy the map rather than modifying state.
      const moveTransSelMap = new Map(state.moveTransSelMap);
      const selTransInfo = moveTransSelMap.get(id);

      if (selTransInfo === undefined) {
        moveTransSelMap.set(id, item); // toggle
      } else {
        moveTransSelMap.delete(id); // toggle
      }

      return { moveTransSelMap };
    });
  };

  renderTransListItem = (item) => {
    const { moveTransSelMap } = this.state;

    return (
      <TransListItem
        id={item.index.toString()}
        onPressItem={this.onPressTransItem}
        selected={moveTransSelMap.get(item.index.toString()) !== undefined}
        item={item.item}
      />
    );
  }

  render() {
    const { navigation } = this.props;
    const { divAccount, otherDivAccList } = navigation.state.params;
    const {
      transactionList,
      selMoveDivAccount,
      isVisibleMoveTransModal,
      moveTransSelMap,
      searchPeriod,
      searchFromDate,
      searchToDate
    } = this.state;

    const otherDivAccPickerItems = otherDivAccList.map(account => (
      <Picker.Item key={account.id} value={account} label={account.description} />
    ));

    return (
      <View style={styles.container}>
        <View style={styles.moveActionModal}>
          <Modal
            animationType="slide"
            transparent
            visible={isVisibleMoveTransModal}
            onRequestClose={() => {
              Alert.alert('Modal has been closed.');
            }}
          >
            <View style={styles.moveActionModalContainer}>
              <View style={styles.moveActionModalWrap}>
                <Picker
                  selectedValue={selMoveDivAccount}
                  style={styles.moveAccPicker}
                  onValueChange={itemValue => this.setState({ selMoveDivAccount: itemValue })}
                >
                  <Picker.Item value={null} label="==선택해 주세요==" />
                  {otherDivAccPickerItems}
                </Picker>
                <View style={styles.moveTransModButWrap}>
                  <TouchableHighlight
                    onPress={() => this.moveTransaction()}
                  >
                    <Text>이동</Text>
                  </TouchableHighlight>

                  <TouchableHighlight
                    onPress={() => {
                      this.setState({ isVisibleMoveTransModal: false });
                    }}
                  >
                    <Text>취소</Text>
                  </TouchableHighlight>
                </View>
              </View>
            </View>
          </Modal>
        </View>
        <View style={styles.accInfoWarp}>
          <View style={styles.accInfoDescWrap}>
            <Text style={styles.desText}>{divAccount.description}</Text>
          </View>
          <View style={styles.accInfoBalWrap}>
            <Text style={styles.balText}>{numberUtils.currencyformat(divAccount.balance)}</Text>
            <Text style={styles.balUnitText}> 원</Text>
          </View>
          <View style={styles.accInfoCommWrap}>
            <TouchableHighlight
              onPress={() => this.setState({ isVisibleMoveTransModal: true })}
            >
              <Text style={styles.moveCommText}>거내내역 이동</Text>
            </TouchableHighlight>
          </View>
        </View>
        <View style={styles.searchCommandWarp}>
          <View style={styles.searchDateCommWrap}>
            <TouchableHighlight onPress={() => this.searchTransList(3)}>
              <Text style={[styles.searPeriodText, (searchPeriod === 3 ? styles.selSearPeriText : null)]}>3일</Text>
            </TouchableHighlight>

            <TouchableHighlight
              onPress={() => this.searchTransList(7)}
            >
              <Text style={[styles.searPeriodText, (searchPeriod === 7 ? styles.selSearPeriText : null)]}>1주일</Text>
            </TouchableHighlight>

            <TouchableHighlight
              onPress={() => this.searchTransList(30)}
            >
              <Text style={[styles.searPeriodText, (searchPeriod === 30 ? styles.selSearPeriText : null)]}>1개월</Text>
            </TouchableHighlight>

            <TouchableHighlight onPress={() => this.searchTransList(90)}>
              <Text style={[styles.searPeriodText, (searchPeriod === 90 ? styles.selSearPeriText : null)]}>3개월</Text>
            </TouchableHighlight>
          </View>
          <View style={styles.searchDateWrap}>
            <Text>{searchFromDate}</Text>
            <Text> ~ </Text>
            <Text>{searchFromDate}</Text>
          </View>
        </View>
        <View style={styles.transListWarp}>
          <FlatList
            data={transactionList}
            extraData={moveTransSelMap}
            keyExtractor={(item, index) => index.toString()}
            renderItem={this.renderTransListItem}
          />
        </View>
      </View>
    );
  }
}
