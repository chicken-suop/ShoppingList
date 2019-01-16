import React from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  AlertIOS,
} from 'react-native';
import PropTypes from 'prop-types';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Icon, Button } from 'react-native-elements';
import RenderItem from './RenderItem';
import Plus from './components/Plus';
import { store, fetch } from './helpers/asyncApi';

const windowWidth = Dimensions.get('window').width;

export default class CurrentView extends React.Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
  }

  static navigationOptions({ navigation }) {
    return {
      title: navigation.getParam('title'),
      headerRight: <Plus onPress={navigation.getParam('add')} />,
    };
  }

  constructor(props) {
    super(props);
    this.swipeListViewRef = React.createRef();
    this.animatedRowHeight = {};
    const { navigation } = props;

    const listViewData = navigation.getParam('shoppingList') || [];
    listViewData.forEach((e) => {
      this.animatedRowHeight[e.key] = new Animated.Value(1);
    });
    this.state = { listViewData };
  }

  async componentDidMount() {
    const { navigation } = this.props;
    navigation.setParams({ add: this.add });
  }

  saveData = async (newData) => {
    const { navigation } = this.props;
    const shoppingLists = await fetch('shoppingLists');
    // shoppingLists looks like: [{ key, text, items: [{ key, text }] }]
    const index = shoppingLists.findIndex(item => item.text === navigation.getParam('title'));
    shoppingLists[index].items = newData;
    store('shoppingLists', shoppingLists);
  }

  add = () => {
    AlertIOS.prompt(
      'New shopping list item',
      null,
      (text) => {
        let index;
        const { listViewData } = this.state;
        const renderItem = listViewData.find(e => e.text.match(new RegExp(`${text}( × (\\d))*`)));
        if (renderItem == null) {
          this.setState((prevState) => {
            index = prevState.listViewData.length > 0
              ? Number(prevState.listViewData[prevState.listViewData.length - 1].key) + 1
              : 0;
            const newData = [...prevState.listViewData];
            newData.push({ key: `${index}`, text });
            this.saveData(newData);
            this.animatedRowHeight[index] = new Animated.Value(1);
            return { listViewData: newData };
          });
        } else {
          const possibleTimes = renderItem.text.match(/ × (\d)/);
          if (possibleTimes === null) {
            this.updateRenderItem(renderItem.key, { text: `${text} × 2` });
          } else {
            this.updateRenderItem(renderItem.key, { text: `${text} × ${Number(possibleTimes[1]) + 1}` });
          }
        }
      },
    );
  }

  onSwipeValueChange = ({ key, value }) => {
    if (value < -windowWidth && !this.animationIsRunning) {
      this.animationIsRunning = true;
      Animated.timing(this.animatedRowHeight[key], { toValue: 0, duration: 200 }).start(() => {
        this.setState((prevState) => {
          const { listViewData } = prevState;
          const newData = [...listViewData];
          const prevIndex = listViewData.findIndex(item => item.key === key);
          newData.splice(prevIndex, 1);
          this.saveData(newData);
          return { listViewData: newData };
        }, () => { this.animationIsRunning = false; });
      });
    }
  }

  updateRenderItem = (key, data) => {
    this.setState((prevState) => {
      const { listViewData } = prevState;
      const newData = [...listViewData];
      const prevIndex = listViewData.findIndex(item => item.key === key);
      Object.assign(newData[prevIndex], data);
      this.saveData(newData);
      return { listViewData: newData };
    });
  }

  archive = () => {
    const { navigation } = this.props;
    const { params } = navigation.state;
    navigation.goBack();
    params.archive(navigation.getParam('key'));
  }

  delete = () => {
    const { navigation } = this.props;
    const { params } = navigation.state;
    navigation.goBack();
    params.delete(navigation.getParam('key'));
  }

  render() {
    const { listViewData } = this.state;

    return (
      <View style={{ marginBottom: 30 }}>
        <View
          style={{
            marginVertical: 10,
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}
        >
          <Button
            raised
            buttonStyle={{ backgroundColor: 'gray' }}
            icon={{
              name: 'ios-archive',
              type: 'ionicon',
              color: 'white',
            }}
            title="Archive this list"
            onPress={this.archive}
          />
          <Button
            raised
            buttonStyle={{ backgroundColor: 'tomato' }}
            icon={{
              name: 'ios-trash',
              type: 'ionicon',
              color: 'white',
            }}
            title="Delete this list"
            onPress={this.delete}
          />
        </View>
        <SwipeListView
          useFlatList
          listViewRef={(ref) => { this.swipeListViewRef = ref; }}
          data={listViewData}
          renderItem={data => (
            <RenderItem
              item={data.item}
              animatedRowHeight={this.animatedRowHeight}
              updateRenderItem={this.updateRenderItem}
            />
          )}
          renderHiddenItem={() => (
            <View style={styles.rowBack}>
              <Icon
                name="ios-trash"
                type="ionicon"
                color="white"
              />
            </View>
          )}
          rightOpenValue={-windowWidth}
          onSwipeValueChange={this.onSwipeValueChange}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#ff0000',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 15,
  },
});
