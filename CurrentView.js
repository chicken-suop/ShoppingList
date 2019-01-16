import React from 'react';
import { ScrollView, AlertIOS } from 'react-native';
import PropTypes from 'prop-types';
import { ListItem } from 'react-native-elements';
import Plus from './components/Plus';
import { store, fetch } from './helpers/asyncApi';

export default class CurrentView extends React.Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
  }

  static navigationOptions({ navigation }) {
    return {
      title: 'Current lists',
      headerRight: <Plus onPress={navigation.getParam('add')} />,
    };
  }

  constructor(props) {
    super(props);
    this.scrollViewRef = React.createRef();
    this.state = { listViewData: [] };
  }

  componentDidMount() {
    const { navigation } = this.props;
    navigation.setParams({ add: this.add });
    this.fetchData();
    this.willFocusSubscription = navigation.addListener(
      'willFocus',
      this.fetchData,
    );
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }

  fetchData = async () => {
    const listViewData = await fetch('shoppingLists') || [];
    this.setState({ listViewData });
  }

  add = () => {
    AlertIOS.prompt(
      'New shopping list',
      null,
      (text) => {
        const { listViewData } = this.state;
        const renderItem = listViewData.find(e => e.text === text);
        if (renderItem == null) {
          this.setState((prevState) => {
            const index = prevState.listViewData.length > 0
              ? Number(prevState.listViewData[prevState.listViewData.length - 1].key) + 1
              : 0;
            const newData = [...prevState.listViewData];
            newData.push({ key: `${index}`, text });
            store('shoppingLists', newData);
            return { listViewData: newData };
          }, () => this.scrollViewRef.scrollToEnd());
        } else {
          alert('Can\'t create duplicate shopping list');
        }
      },
    );
  }

  delete = (key, callback) => {
    let deletedData;
    this.setState((prevState) => {
      const { listViewData } = prevState;
      const newData = [...listViewData];
      const prevIndex = listViewData.findIndex(item => item.key === key);
      [deletedData] = newData.splice(prevIndex, 1);
      store('shoppingLists', newData);

      return { listViewData: newData };
    }, () => callback(deletedData));
  }

  archive = key => this.delete(
    key,
    deletedData => this.storeDeletedData(deletedData),
  );

  storeDeletedData = async (deletedData) => {
    const archivedData = await fetch('archivedShoppingLists') || [];
    const index = archivedData.length > 0
      ? Number(archivedData[archivedData.length - 1].key) + 1
      : 0;

    // Reassign key
    Object.assign(deletedData, { key: `${index}` });
    archivedData.push(deletedData);
    store('archivedShoppingLists', archivedData);
  }

  render() {
    const { listViewData } = this.state;
    const { navigation } = this.props;

    return (
      <ScrollView
        containerStyle={{ marginBottom: 20 }}
        ref={(ref) => { this.scrollViewRef = ref; }}
      >
        {listViewData.map(item => (
          <ListItem
            title={item.text}
            key={item.key}
            onPress={() => navigation.navigate(
              'Details',
              {
                archive: this.archive,
                delete: key => this.delete(key, () => {}),
                shoppingList: item.items,
                key: item.key,
                title: item.text,
              },
            )}
          />
        ))}
      </ScrollView>
    );
  }
}
