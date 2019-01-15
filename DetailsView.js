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
      headerRight: (
        <Icon
          name="ios-add"
          type="ionicon"
          color="cornflowerblue"
          size={32}
          containerStyle={{ paddingRight: 15 }}
          onPress={navigation.getParam('add')}
        />
      ),
    };
  }

  constructor(props) {
    super(props);
    this.swipeListViewRef = React.createRef();
    this.animatedRowHeight = {};
    this.state = {
      listViewData: Array(20).fill('').map((_, i) => {
        this.animatedRowHeight[`${i}`] = new Animated.Value(1);
        return { key: `${i}`, text: `Item ${i}` };
      }),
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    navigation.setParams({ add: this.add });
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
            index = prevState.listViewData[prevState.listViewData.length - 1].key + 1;
            const newData = [...prevState.listViewData];
            newData.push({ key: `${index}`, text });
            return { listViewData: newData };
          }, () => {
            this.animatedRowHeight[index] = new Animated.Value(1);
          });
        } else {
          const possibleTimes = renderItem.text.match(/ × (\d)/);
          if (possibleTimes === null) {
            this.updateRenderItem(renderItem.key, { text: `${text} × 2` });
          } else {
            this.updateRenderItem(renderItem.key, { text: `${text} × ${Number(possibleTimes[1]) + 1}` });
          }
        }
        this.swipeListViewRef.scrollToEnd();
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
      return { listViewData: newData };
    });
  }

  archive = () => {
    const { navigation } = this.props;
    const { params } = navigation.state;
    navigation.goBack();
    params.archive(params.item.key);
  }

  render() {
    const { listViewData } = this.state;

    return (
      <View style={{ marginBottom: 30 }}>
        <Button
          raised
          buttonStyle={{ backgroundColor: 'tomato' }}
          icon={{
            name: 'ios-archive',
            type: 'ionicon',
            color: 'white',
          }}
          title="Archive this list"
          onPress={this.archive}
        />
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
