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
      addBalance: 0,
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
      addDescription,
      addBalance,
      addBalErrorMessage,
      addDescErrorMessage,
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
            <View style={styles.addDivAccModalWrap}>
              <Text>통장 설명: </Text>
              <TextInput
                placeholder="통장 설명"
                value={addDescription}
                onChangeText={(text) => {
                  this.setState({ addDescription: text });
                  const v = validate('text', text, true);
                  this.setState({ addDescErrorMessage: v[1] });
                }}
              />
              <Text style={styles.errorMessage}>{addDescErrorMessage}</Text>
              <Text>초기 금액: </Text>
              <TextInput
                placeholder="최대 가능 금액: "
                keyboardType="numeric"
                value={`${addBalance}`}
                onChangeText={(text) => {
                  const value = Number.parseInt(text, 10);
                  const v = validate('decimalMax', value, true, defDivAccBalance);
                  this.setState({ addBalance: value, addBalErrorMessage: v[1] });
                }}
              />
              <Text style={styles.errorMessage}>{addBalErrorMessage}</Text>

              <View style={styles.addDivAccModButWrap}>
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
