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

import { CURRYSERVER_DIVACCOUNTS, CURRYSERVER_TRANSINFO, OPENBANKSERVER_ACCOUNT_TRANSACTIONLIST } from '../constants/Network';
import { handleJsonResponse } from '../utils/network-common';
import { MultiSelectList, TRANSACTION_LIST } from '../components/molecules/MultiSelectList';
import TransListItem from '../components/molecules/TransListItem';

type Props = {
  divAccount: Object,
};
type State = {
  oriAccTransList: Array<Object>,
  divAccTransList: Array<Object>,
  inquiryToken: '',
  checkedTransList: Array<Object>,
  isVisibleMoveTransModal: boolean,
};

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
  searchCommandWarp: {
    flex: 1,
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
  transListTableHeaderRow: {
    flex: 1,
    flexDirection: 'row',
  },
});

const transTestData = JSON.parse(
  '{ "api_tran_id": "2cfc5541-17ab-40c7-b12f-82fde00f7f5f", "rsp_code": "A0000", "rsp_message": " ", "api_tran_dtm": "20160826111428881", "bank_tran_id": "F010226114NIBXQ5FWVG","bank_tran_date": "20160826","bank_code_tran": "097","bank_rsp_code": "000","bank_rsp_message": " ","fintech_use_num": "101600000169321934052424","balance_amt": "500000","page_index_use_yn": "N","page_index": "1","total_record_cnt": "1","page_record_cnt": "1","next_page_yn": "N","res_list": [{"tran_date": "20160611","tran_time": "024111","inout_type": "입금","tran_type": "현금","print_content": "의료비","tran_amt": "450000","after_balance_amt": "10000000","branch_name": "분당점"},{"tran_date": "20160612","tran_time": "100000","inout_type": "출금","tran_type": "카드","print_content": "식비","tran_amt": "110000","after_balance_amt": "7000000","branch_name": "수원점"}]}',
);
export default class TransactionListScreen extends React.PureComponent<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      inquiryToken: 'Bearer 5a965cd7-0ec3-4312-a7aa-dc8da4838e18',
      transactionList: [],
      oriAccTransList: [],
      divAccTransList: [],
      filtDefAccTransList: [],
      checkedTransList: [],
      isVisibleMoveTransModal: false,
      selMoveDivAccount: null,
      selected: (new Map(): Map<string, boolean>),
    };
  }

  componentDidMount() {
    const { divAccount } = this.props.navigation.state.params;
    const { divAccTransList, filtDefAccTransList } = this.state;

    this.requestOriAccTransList();  //when default divaccount

    if (divAccount.isDefault) {
      this.setState({ transactionList: filtDefAccTransList });
    } else {
      this.setState({ transactionList: divAccTransList });
    }
  }

  changeCheckTransList = (transactionInfo) => {
  };

  moveTransaction = () => {
    const { transactionList, selected } = this.state;
    // validation tobemovelist가 비어 있는지 확인
    // 갯수 20개로 제한!?
    if (selected.size === 0) {
      Alert.alert('옮길 거래내역을 선택 해 주세요.');

      return false;
    }

    const moveList = [];
    selected.forEach((value) => {
      const { selMoveDivAccount } = this.state;
      const moveTrans = value;
      moveTrans.divAccId = selMoveDivAccount.id;
      moveList.push(moveTrans);
    });

    const result = this.requestTransInfoSaveOrUpdate(moveList);

    if(result){this.setState(isVisibleMoveTransModal: true);}
  };

  /**
   * 거래내역 이동을 위한 Action Form 열기
   */
  openMoveTransListModal = async () => {
    const { otherDivAccList } = this.props.navigation.state.params;

    this.setState({
      selMoveDivAccount: otherDivAccList[0],
      isVisibleMoveTransModal: true,
    });
  };

  /**
   * 오픈뱅크서버에 거래내역 리스트 요청 함수
   */
  requestOriAccTransList = () => {
    const { divAccount } = this.props.navigation.state.params;
    const { inquiryToken } = this.state;

    // valiation
    if (divAccount == null) {
      return;
    }

    const paramData = {
      // Default 1일 조회
      fintech_use_num: divAccount.fintech_use_num,
      from_date: '20181203090000',
      to_date: '20181203100000',
      sort_order: 'D', // 정렬순서(D:Descending, A:Ascending)
      page_index: '1', // 페이지번호

      tran_dtime: moment().format('YYYYMMDDHHmmss'), // 요청일시
      befor_inquiry_trace_info: '', // 직전 조회 추적 정보 (옵션?)
      list_tran_seqno: '', // 최종 거래내역 순번(옵션?)
    };

    fetch(
      `${OPENBANKSERVER_ACCOUNT_TRANSACTIONLIST}?
        fintech_use_num=${encodeURIComponent(paramData.fintech_use_num)}
        &from_date=${encodeURIComponent(paramData.from_date)}
        &to_date=${encodeURIComponent(paramData.to_date)}
        &sort_order=${encodeURIComponent(paramData.sort_order)}
        &page_index=${encodeURIComponent(paramData.page_index)}
        &tran_dtime=${encodeURIComponent(paramData.tran_dtime)}
        `,
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
        // this.successReqOriAccTransList(responseJson);

        // This is test code
        this.setState({ divAccTransList: transTestData.res_list });

        console.log(this.state.divAccTransList);
        return responseJson;
      })
      .catch((error) => {
        Alert.alert(
          '원통장 잔액 요청에 실패 했습니다, 통신상태 확인 후 재 시도해 주세요',
          error.message,
        );
        return error;
      });
  };

  requestTransInfoSaveOrUpdate = (tranInfoList) => {
    console.log(tranInfoList);
    fetch(`${CURRYSERVER_TRANSINFO}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(tranInfoList),
    })
      .then(handleJsonResponse)
      .then((responseJson) => {
        // this.successReqOriAccTransList(responseJson);

        // This is test code
        this.setState({ divAccTransList: transTestData.res_list });

        return responseJson;
      })
      .catch((error) => {
        Alert.alert(
          '거래내역 저장 및 수정에 실패 했습니다, 통신상태 확인 후 재 시도해 주세요',
          error.message,
        );
        return error;
      });
  };

  /**
   * 나누기통장 리스트 커리서버에 요청 함수
   * @param oriAccID 원통장 아이디
   * @returns null
   */
  requestDivAccList = (oriAccID: number) => fetch(`${CURRYSERVER_DIVACCOUNTS}${oriAccID}`)
    .then(handleJsonResponse)
    .then(responseJson => responseJson)
    .catch((error) => {
      Alert.alert(
        '나누기통장 잔액리스트 요청 실패, 통신상태 확인 후 다시 시도해 주세요.',
        error.message,
      );
      return error;
    });

  successReqOriAccTransList = (resTransInfo) => {
    // validation
    if (resTransInfo == null) {
      return;
    }

    const rspCode = resTransInfo.rsp_code;
    if (rspCode === 'A0000') {
    }

    const transList = resTransInfo.res_list;
  };

  onPressTransItem = (id: string, item: Object) => {
    // updater functions are preferred for transactional updates
    this.setState((state) => {
      // copy the map rather than modifying state.
      const selected = new Map(state.selected);
      const selTransInfo = selected.get(id);
      console.log(selTransInfo);
      if (selTransInfo === undefined) {
        selected.set(id, item); // toggle
      }else{
        selected.delete(id); // toggle
      }
      return { selected };
    });
  };

  renderTransListItem = ({ item, index}) => (
    <TransListItem
      id={index.toString()}
      onPressItem={this.onPressTransItem}
      selected={this.state.selected.get(index.toString()) === undefined ? false : true}
      item={item}
    />
  );

  render() {
    const { divAccount, otherDivAccList } = this.props.navigation.state.params;
    const {
      filtDefAccTransList,
      divAccTransList,
      selMoveDivAccount,
      isVisibleMoveTransModal,
      selected,
    } = this.state;

    const accountItems = otherDivAccList.map(account => (
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
                  {accountItems}
                </Picker>
                <View style={styles.moveTransModButWrap}>
                  <TouchableHighlight
                    onPress={() => {
                      this.moveTransaction();
                    }}
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
        <View style={styles.searchCommandWarp}>
          <Text>{divAccount.description}</Text>
          <TouchableHighlight
            onPress={() => {
              this.openMoveTransListModal();
            }}
          >
            <Text>거내내역 이동</Text>
          </TouchableHighlight>
          <Text>1일/1주/한달/3달</Text>
        </View>
        <View style={styles.transListWarp}>
          <View style={styles.transListTableHeaderRow}>
            <Text>날짜</Text>
            <Text>사용처</Text>
            <Text>금액</Text>
            <Text>잔액</Text>
          </View>
          <FlatList
            data={divAccTransList}
            extraData={selected}
            keyExtractor={(item, index) => index.toString()}
            renderItem={this.renderTransListItem}
          />
        </View>
      </View>
    );
  }
}
