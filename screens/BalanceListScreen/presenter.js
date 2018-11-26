import React from 'react';
import {
  View, TouchableHighlight, Text, StyleSheet,
} from 'react-native';
// import PropTypes from 'prop-types';
import DivAccListOrganism from '../../components/organisms/DivAccListOrganism';
import OriAccSelOrganism from '../../components/organisms/OriAccSelOrganism';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerWrap: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 20,
    marginLeft: 5,
    marginRight: 5,
  },
  iconImage: {
    width: 62,
    height: 62,
  },
  accountListWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountPicker: {
    width: 190,
    height: 50,
  },
  accCtlButton: {},
  accCtlButtonView: {
    marginRight: 10,
  },
  emptyAccount: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default function BalanceListPresenter({
  isEmptyOriAcc,
  oriAccounts,
  selOriAccount,
  isEmptyDivAcc,
  divAccounts,
  changeOriAccount,
  navigation,
  openAddDivAccModal,
  addDivAccount,
}) {
  return (
    <View style={styles.container}>
      {isEmptyOriAcc && (
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
      {!isEmptyOriAcc && (
        <View style={styles.container}>
          <OriAccSelOrganism
            oriAccounts={oriAccounts}
            selOriAccount={selOriAccount}
            changeOriAccount={changeOriAccount}
          />
          <DivAccListOrganism
            oriAccount={selOriAccount}
            divAccounts={divAccounts}
            isEmptyDivAcc={isEmptyDivAcc}
            openAddDivAccModal={openAddDivAccModal}
            addDivAccount={addDivAccount}
          />
        </View>
      )}
    </View>
  );
}

// BalanceListPresenter.propTypes = {
//   isEmptyOriAccount: PropTypes.bool.isRequired,
//   oriAccounts: PropTypes.array.isRequired,
//   selOriAccount: PropTypes.objectOf(
//     PropTypes.shape({
//       id: PropTypes.number.isRequired,
//     }),
//   ).isRequired,
// };
