// @flow
import React from 'react';
import {
  Alert, TouchableHighlight, Modal, StyleSheet, Text, TextInput, View,
} from 'react-native';

import { validate } from '../../utils/validation';

const styles = StyleSheet.create({
  container: {
    marginTop: 22,
  },
  addDivAccModalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  formWrap: {
    backgroundColor: '#FFF',
    padding: 20,
  },
  titleWrap: {
    alignItems: 'center',
    marginBottom: 10,
  },
  descWrap: {
    flexDirection: 'row',
  },
  balWrap: {
    flexDirection: 'row',
  },
  commButWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorMessage: {
    color: 'red',
  },
  descTextInput: {
    width: 150,
  },
  balTextInput: {
    width: 150,
  },
  titleText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

type Props = {
  isVisibleDivAccFormModal: boolean,
  setVisibleDivAccFormModal: Function,
  createDivAcc: Function,
  defDivAccBalance: number,
};

type State = {
  addDescErrorMessage: string,
  addBalErrorMessage: string,
  addDescription: string,
  addBalance: number,
};
export default class DivAccFormModal extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      addDescription: '',
      addBalance: '',
      addDescErrorMessage: '',
      addBalErrorMessage: '',
    };
  }

  /**
   * Divide Account 추가
   */
  createDivAcc = () => {
    const { createDivAcc, setVisibleDivAccFormModal } = this.props;

    if (!this.isValidDivAccCreaSubmit()) {
      return;
    }

    const { addDescription, addBalance } = this.state;

    createDivAcc(addDescription, addBalance);

    setVisibleDivAccFormModal(false);
  };

  /**
   * 나누기통장 생성 유효성검사 함수
   * @returns result 유효검사 결과
   */
  isValidDivAccCreaSubmit = () => {
    const { addDescription, addBalance } = this.state;
    const { defDivAccBalance } = this.props;

    let v = validate('textMax', addDescription, true, 10);
    if (!v[0]) {
      // console.log('invalid addDescription');
      this.setState({ addDescErrorMessage: v[1] });
      return false;
    }

    v = validate('decimalMax', addBalance, true, defDivAccBalance);
    if (!v[0]) {
      this.setState({ addBalErrorMessage: v[1] });
      return false;
    }

    return true;
  };

  render() {
    const { isVisibleDivAccFormModal, setVisibleDivAccFormModal, defDivAccBalance } = this.props;
    const {
      addDescription, addBalance, addBalErrorMessage, addDescErrorMessage,
    } = this.state;
    return (
      <View style={styles.container}>
        <Modal
          animationType="slide"
          transparent
          visible={isVisibleDivAccFormModal}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}
        >
          <View style={styles.addDivAccModalContainer}>
            <View style={styles.formWrap}>
              <View style={styles.titleWrap}>
                <Text style={styles.titleText}>나누기통장 추가</Text>
              </View>
              <View style={styles.descWrap}>
                <Text>통장 설명: </Text>
                <TextInput
                  placeholder="통장 설명"
                  value={addDescription}
                  onChangeText={(text) => {
                    this.setState({ addDescription: text });
                    const v = validate('text', text, true);
                    this.setState({ addDescErrorMessage: v[1] });
                  }}
                  style={styles.descTextInput}
                />
              </View>
              <View>
                <Text style={styles.errorMessage}>{addDescErrorMessage}</Text>
              </View>
              <View style={styles.balWrap}>
                <Text>초기 금액: </Text>
                <TextInput
                  placeholder="최대 가능 금액: "
                  keyboardType="numeric"
                  value={`${addBalance}`}
                  onChangeText={(balanceStr) => {
                    let balance = '';
                    if (balanceStr !== '') { balance = Number.parseInt(balanceStr, 10); }
                    const v = validate('decimalMax', balance, true, defDivAccBalance);
                    this.setState({ addBalance: balance, addBalErrorMessage: v[1] });
                  }}
                  style={styles.balTextInput}
                />

              </View>
              <View>
                <Text style={styles.errorMessage}>{addBalErrorMessage}</Text>
              </View>

              <View style={styles.commButWrap}>
                <TouchableHighlight
                  onPress={() => {
                    this.createDivAcc();
                  }}
                >
                  <Text>생성</Text>
                </TouchableHighlight>

                <TouchableHighlight
                  onPress={() => {
                    setVisibleDivAccFormModal(!isVisibleDivAccFormModal);
                  }}
                >
                  <Text>취소</Text>
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}
