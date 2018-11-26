import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import HomeScreen from '../../screens/HomeScreen';

describe('Request Divide Account Balance', () => {
  it('Fetch API Test', async () => {
    // global.fetch = jest.fn().mockImplementation(() => {
    //   const p = new Promise((resolve, reject) => {
    //     resolve({
    //       json() {
    //         return [{ balance: 50000, description: '만연필', id: 2 }];
    //       },
    //     });
    //   });
    //   return p;
    // });

    const homescreenComponent = renderer.create(<HomeScreen />).getInstance();
    // await homescreenComponent.reqOriAccounts(1);
    homescreenComponent.setState({
      divAccounts: [
        {
          isDefault: true,
          description: '한달 용돈',
          // balance: responseJson.balance_amt,
          // date: responseJson.bank_tran_date,
          // bank: responseJson.bank_code_tran,
          balance: 2980000,
          date: '20181107',
          bank: '098',
        },
      ],
    });
    const response = await homescreenComponent.requestDivAccountBalance(3);
    expect(response[0].balance).toBe(888000);

    // expect.assertions(1);

    // const homescreenComponent = renderer.create(<DivAccoutList />).getInstance();

    // expect(homescreenComponent.state.isEmptyDivAccount).toEqual(undefined);

    // const response = await homescreenComponent.requestDivAccountBalance();

    // console.log(response);

    // expect(homescreenComponent.state.isEmptyDivAccount).toEqual(true);
  });
});
