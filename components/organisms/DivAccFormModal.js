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

export default class DivAccFormModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      divAccDescError: null,
      divAccDescErrorMessage: null,
      divAccBalError: null,
      divAccBalErrorMessage: null,
      addDivAccDescription: null,
      addDivAccBalance: null,
    };
  }

  /**
   * Divide Account 추가
   */
  creaDivAccount = () => {
    if (!this.isValidSubmitInfo()) {
      return;
    }

    const { addDivAccDescription, addDivAccBalance } = this.state;

    this.props.creaDivAccount(addDivAccDescription, addDivAccBalance);
  };

  isValidSubmitInfo = () => {
    const { addDivAccDescription, addDivAccBalance } = this.state;

    let v = validate('textMax', addDivAccDescription, true, 10);
    if (!v[0]) {
      // console.log('invalid addDivAccDescription');
      this.setState({ divAccDescErrorMessage: v[1] });
      return false;
    }

    // let intTest = Number(addDivAccBalance); propsType 넣을때 함께 수정!!!!!!!!!!!!!!!!!!!!!!!!!
    // v = validate('decimalMax', addDivAccBalance, true, this.props.defaultAccountBalance);
    let intTest = Number(addDivAccBalance);
    v = validate('decimalMax', intTest, true, this.props.defaultAccountBalance);
    if (!v[0]) {
      // console.log('invalid addDivAccBalance');
      this.setState({ divAccBalErrorMessage: v[1] });
      return false;
    }

    return true;
  };

  render() {
    const { isVisibleOriAccForm, setOriAccFormModalVisible } = this.props;
    const {
      addDivAccBalance,
      divAccBalErrorMessage,
      addDivAccDescription,
      divAccDescErrorMessage,
    } = this.state;
    return (
      <View style={{ marginTop: 22 }}>
        <Modal
          animationType="slide"
          transparent
          visible={isVisibleOriAccForm}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}
        >
          <View style={styles.addDivAccModalContainer}>
            <View style={styles.addDivAccModalWrap}>
              <Text>통장 설명: </Text>
              <TextInput
                placeholder="통장 설명"
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
                onChangeText={(text) => {
                  this.setState({ addDivAccBalance: text });
                  const v = validate('text', text, true);
                  this.setState({ divAccDescErrorMessage: v[1] });
                }}
              />
              <Text style={styles.errorMessage}>{divAccBalErrorMessage}</Text>

              <View style={styles.addDivAccModButWrap}>
                <TouchableHighlight
                  onPress={() => {
                    this.creaDivAccount();
                  }}
                >
                  <Text>생성</Text>
                </TouchableHighlight>

                <TouchableHighlight
                  onPress={() => {
                    setOriAccFormModalVisible(!isVisibleOriAccForm);
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
