import React from 'react';
import { ScrollView, Animated } from 'react-native';
import PropTypes from 'prop-types';
import { ListItem } from 'react-native-elements';

export default class CurrentView extends React.Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
  }

  static navigationOptions = {
    title: 'Current lists',
  }

  constructor(props) {
    super(props);
    this.animatedRowHeight = {};
    this.state = {
      listViewData: Array(20).fill('').map((_, i) => {
        this.animatedRowHeight[`${i}`] = new Animated.Value(1);
        return { key: `${i}`, text: `Shopping list ${i}` };
      }),
    };
  }

  archive = (key) => {
    if (!this.animationIsRunning) {
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

  render() {
    const { listViewData } = this.state;
    const { navigation } = this.props;

    return (
      <ScrollView containerStyle={{ marginBottom: 20 }}>
        {listViewData.map(item => (
          <Animated.View
            key={item.key}
            style={{
              height: this.animatedRowHeight[item.key].interpolate({
                inputRange: [0, 1],
                outputRange: [0, 50],
              }),
            }}
          >
            <ListItem
              title={item.text}
              onPress={() => navigation.navigate('Details', { archive: this.archive, item, title: item.text })}
            />
          </Animated.View>
        ))}
      </ScrollView>
    );
  }
}
