// @flow
import React from 'react';
import { View, StyleSheet } from 'react-native';
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
});
type Props = {
  oriAccounts: Array<Object>,
  divAccounts: Array<Object>,
  selOriAccount: Object,
  changeOriAcc: Function,
  createDivAcc: Function,
  deleteDivAcc: Function,
};
export default function BalanceListPresenter(props_: Props) {
  const {
    oriAccounts,
    divAccounts,
    selOriAccount,
    changeOriAcc,
    createDivAcc,
    deleteDivAcc,
  } = props_;
  return (
    <View style={styles.container}>
      <OriAccSelOrganism
        oriAccounts={oriAccounts}
        selOriAccount={selOriAccount}
        changeOriAcc={changeOriAcc}
      />
      <DivAccListOrganism
        divAccounts={divAccounts}
        createDivAcc={createDivAcc}
        deleteDivAcc={deleteDivAcc}
      />
    </View>
  );
}
