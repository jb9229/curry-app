// @flow
import React from 'react';
import {
  Alert, TouchableHighlight, Modal, StyleSheet, Text, TextInput, View,
} from 'react-native';

import { validate } from '../../utils/validation';

const styles = StyleSheet.create({
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
  divAccDescErrorMessage: string,
  divAccBalErrorMessage: string,
  addDivAccDescription: string,
  addDivAccBalance: number,
};
export default class DivAccFormModal extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      divAccDescErrorMessage: '',
      divAccBalErrorMessage: '',
      addDivAccDescription: '',
      addDivAccBalance: 0,
    };
  }

  /**
   * Divide Account 추가
   */
  createDivAcc = () => {
    const { createDivAcc } = this.props;

    if (!this.isValidSubmitInfo()) {
      return;
    }

    const { addDivAccDescription, addDivAccBalance } = this.state;

    createDivAcc(addDivAccDescription, addDivAccBalance);
  };

  isValidSubmitInfo = () => {
    const { addDivAccDescription, addDivAccBalance } = this.state;
    const { defDivAccBalance } = this.props;

    let v = validate('textMax', addDivAccDescription, true, 10);
    if (!v[0]) {
      // console.log('invalid addDivAccDescription');
      this.setState({ divAccDescErrorMessage: v[1] });
      return false;
    }

    v = validate('decimalMax', addDivAccBalance, true, defDivAccBalance);
    if (!v[0]) {
      this.setState({ divAccBalErrorMessage: v[1] });
      return false;
    }

    return true;
  };

  render() {
    const { isVisibleDivAccFormModal, setVisibleDivAccFormModal, defDivAccBalance } = this.props;
    const {
      addDivAccDescription,
      addDivAccBalance,
      divAccBalErrorMessage,
      divAccDescErrorMessage,
    } = this.state;
    return (
      <View style={{ marginTop: 22 }}>
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
                value={addDivAccDescription}
                onChangeText={(text) => {
                  this.setState({ addDivAccDescription: text });
                  const v = validate('text', text, true);
                  this.setState({ divAccDescErrorMessage: v[1] });
                }}
              />
              <Text style={styles.errorMessage}>{divAccDescErrorMessage}</Text>
              <Text>초기 금액: </Text>
              <TextInput
                placeholder="최대 가능 금액: "
                keyboardType="numeric"
                value={`${addDivAccBalance}`}
                onChangeText={(text) => {
                  const value = Number.parseInt(text, 10);
                  const v = validate('decimalMax', value, true, defDivAccBalance);
                  this.setState({ addDivAccBalance: value, divAccBalErrorMessage: v[1] });
                }}
              />
              <Text style={styles.errorMessage}>{divAccBalErrorMessage}</Text>

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
