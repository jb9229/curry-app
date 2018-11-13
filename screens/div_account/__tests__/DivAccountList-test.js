import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import DivAccoutList from '../DivAccoutList';
import 'isomorphic-fetch';

describe('Home Screen Component', () => {
  it('Fetch API Test', async () => {
    expect.assertions(1);

    const homescreenComponent = renderer.create(<DivAccoutList />).getInstance();

    expect(homescreenComponent.state.isEmptyDivAccount).toEqual(undefined);

    const response = await homescreenComponent.requestDivAccountBalance();

    console.log(response);

    expect(homescreenComponent.state.isEmptyDivAccount).toEqual(true);
  });
});
