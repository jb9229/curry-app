// @flow
import React from 'react';
import {
  Alert, AsyncStorage, FlatList, Modal, TextInput, TouchableHighlight, Text, StyleSheet, View,
} from 'react-native';

import AccountCard from '../../components/AccountCard';
import { serverApiUrl_divAccounts } from '../../constants/Network';
import { validate } from '../../utils/validation';

const styles = StyleSheet.create({
  accountList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  addDivaccButton: {
    width: 50,
  },
  addDivAccModalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  addDivAccModalWrap: {
    backgroundColor: '#FFF',
    padding: 20,
  },
  addDivAccModButWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorMessage: {
    color: 'red',
  },
});

type Props = {
  accountDescript: string,
  fintech_use_num: string,
};

type State = {
  inquiryToken: string,
  modalVisible: boolean,
  addDivAccDescription: string,
  addDivAccBalance: string,
};

export default class DivAccountList extends React.Component<Props, State> {
  state = {
    inquiryToken: 'Bearer 5a965cd7-0ec3-4312-a7aa-dc8da4838e18',
    modalVisible: false,
    addDivAccDescription: null,
    addDivAccBalance: null,
    divAccDescError: null,
    divAccDescErrorMessage: null,
    divAccBalError: null,
    divAccBalErrorMessage: null,
  };

  componentDidMount() {
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

  openAddDivAccModal = () => {
    this.setState({
      ...this.state,
      modalVisible: true,
    });
  };

  setModalVisible(visible) {
    this.setState({ ...this.state, modalVisible: visible });
  }

  isValidSubmitInfo = () => {
    let v = validate('text', this.state.addDivAccDescription, true);
    if(!v[0])
    {
      console.log('invalid addDivAccDescription');
      this.setState({divAccDescErrorMessage: v[1]});
      return false;
    }

    v = validate('text', this.state.addDivAccBalance, true);
    if (!v[0])
    {
      console.log('invalid addDivAccBalance');
      this.setState({divAccBalErrorMessage: v[1]});
      return false;
    }

    return true;
  }

  addDivAccount = () => {
    if (!this.isValidSubmitInfo()){ return; }

    const {addDivAccDescription, addDivAccBalance} = this.state;

    this.props.requestAddDivAccount(addDivAccDescription, addDivAccBalance);
    
    this.setModalVisible(false);
  }

  render() {
    const { modalVisible } = this.state;
    const { isEmptyDivAccount } = this.props;

    const { divAccounts } = this.props;
    return (
      <View style={styles.accountList}>
        {isEmptyDivAccount === undefined && (
          <View>
            <Text>쪼갠 통장 로딩 중....</Text>
          </View>
        )}

        {isEmptyDivAccount !== undefined
          && !isEmptyDivAccount && (
            <View>
              <FlatList
                data={divAccounts}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <AccountCard balance={item.balance} title={item.description} />
                )}
              />

              <View style={{ marginTop: 22 }}>
                <Modal
                  animationType="slide"
                  transparent
                  visible={modalVisible}
                  onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                  }}
                >
                  <View style={styles.addDivAccModalContainer}>
                    <View style={styles.addDivAccModalWrap}>
                      <Text>통장 설명: </Text>
                      <TextInput placeholder="통장 설명" 
                        onChangeText={(text) => {
                          this.setState({...this.state, addDivAccDescription: text});
                          let v = validate('text', text, true);
                          this.setState({divAccDescErrorMessage: v[1]});
                        }}
                      />
                      <Text style={styles.errorMessage}>{this.state.divAccDescErrorMessage}</Text>
                      <Text>초기 금액: </Text>
                      <TextInput placeholder="최대 가능 금액: " 
                        onChangeText={(text) => {
                          this.setState({...this.state, addDivAccBalance: text});
                          let v = validate('text', text, true);
                          this.setState({divAccDescErrorMessage: v[1]});
                        }}
                      />
                      <Text style={styles.errorMessage}>{this.state.divAccBalErrorMessage}</Text>

                      <View style={styles.addDivAccModButWrap}>
                        <TouchableHighlight
                          onPress={() => {
                            this.addDivAccount();
                          }}
                        >
                          <Text>생성</Text>
                        </TouchableHighlight>
                        <TouchableHighlight
                          onPress={() => {
                            this.setModalVisible(!modalVisible);
                          }}
                        >
                          <Text>취소</Text>
                        </TouchableHighlight>
                      </View>
                    </View>
                  </View>
                </Modal>

                <TouchableHighlight
                  onPress={() => {
                    this.openAddDivAccModal();
                  }}
                >
                  <Text>통장 나누기 추가</Text>
                </TouchableHighlight>
              </View>
            </View>
        )}
      </View>
    );
  }
}
