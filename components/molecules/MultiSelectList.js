// @flow
import React from 'react';
import { FlatList } from 'react-native';
import TransListItem from './TransListItem';

export const TRANSACTION_LIST = 'TRANSACTION_LIST';

type Props = {};

type State = {};
export class MultiSelectList extends React.PureComponent<Props, State> {
  state = { selected: (new Map(): Map<string, boolean>) };

  _keyExtractor = (item: Object) => item.id;

  onPressItem = (id: string) => {
    // updater functions are preferred for transactional updates
    this.setState((state) => {
      // copy the map rather than modifying state.
      const selected = new Map(state.selected);
      selected.set(id, !selected.get(id)); // toggle
      return { selected };
    });
  };

  renderTransListItem = ({ item }) => (
    <TransListItem
      id={item.id}
      onPressItem={this.onPressItem}
      selected={this.state.selected.get(item.id)}
      item={item}
    />
  );

  render() {
    const { data, renderItem } = this.props;
    let propRenderItem;
    if (renderItem === TRANSACTION_LIST) {
      propRenderItem = this.renderTransListItem;
    }
    return (
      <FlatList
        data={data}
        extraData={this.state}
        keyExtractor={this._keyExtractor}
        renderItem={propRenderItem}
      />
    );
  }
}
