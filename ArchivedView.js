import React from 'react';
import PropTypes from 'prop-types';
import { ScrollView, AlertIOS } from 'react-native';
import { ListItem } from 'react-native-elements';
import { store, fetch } from './helpers/asyncApi';

export default class ArchivedView extends React.Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
  }

  static navigationOptions = {
    title: 'Archived Lists',
  }

  constructor(props) {
    super(props);
    this.state = { listViewData: [] };
  }

  componentDidMount() {
    this.fetchData();
    const { navigation } = this.props;

    this.willFocusSubscription = navigation.addListener(
      'willFocus',
      this.fetchData,
    );
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }

  fetchData = async () => {
    const listViewData = await fetch('archivedShoppingLists') || [];
    this.setState({ listViewData });
  }

  unarchive = (key) => {
    AlertIOS.alert(
      'Unarchive this list',
      null,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unarchive',
          onPress: () => this.setState((prevState) => {
            const { listViewData } = prevState;
            const newData = [...listViewData];
            const prevIndex = listViewData.findIndex(item => item.key === key);
            const unarchivedData = newData.splice(prevIndex, 1)[0];
            store('archivedShoppingLists', newData);

            this.storeUnarchivedData(unarchivedData);
            return { listViewData: newData };
          }),
        },
      ],
    );
  }

  storeUnarchivedData = async (unarchivedData) => {
    const { navigation } = this.props;
    const shoppingLists = await fetch('shoppingLists') || [];
    const index = shoppingLists.length > 0
      ? Number(shoppingLists[shoppingLists.length - 1].key) + 1
      : 0;

    // Reassign key
    Object.assign(unarchivedData, { key: `${index}` });
    shoppingLists.push(unarchivedData);
    await store('shoppingLists', shoppingLists);
    navigation.navigate('Current');
  }

  render() {
    const { listViewData } = this.state;

    return (
      <ScrollView containerStyle={{ marginBottom: 20 }}>
        {listViewData.map(item => (
          <ListItem
            title={item.text}
            key={item.key}
            onPress={() => this.unarchive(item.key)}
          />
        ))}
      </ScrollView>
    );
  }
}
