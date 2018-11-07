import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import HomeScreen from '../HomeScreen';

describe('Home Screen Component', () => {
  it('Fetch API Test', async () => {
    expect.assertions(1);

    const homescreenComponent = renderer.create(<HomeScreen />).getInstance();

    expect(homescreenComponent.state.isEmptyAccount).toEqual(undefined);

    const response = await homescreenComponent.requestAccounBalance();

    console.log(response);

    expect(homescreenComponent.state.isEmptyAccount).toEqual(true);
  });
});
