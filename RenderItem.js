import React from 'react';
import {
  Text,
  TextInput,
  TouchableHighlight,
  Animated,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';

export default class RenderItem extends React.Component {
  static propTypes = {
    item: PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    }).isRequired,
    animatedRowHeight: PropTypes.shape({}).isRequired,
    updateRenderItem: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.textInput = React.createRef();
    this.state = {
      text: '',
    };
  }

  edit(key, text) {
    this.setState({ editing: key, text }, () => {
      this.textInput.current.focus();
    });
  }

  render() {
    const { text, editing } = this.state;
    const { item, animatedRowHeight, updateRenderItem } = this.props;
    return (
      <Animated.View style={[styles.rowFrontContainer,
        {
          height: animatedRowHeight[item.key].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 50],
          }),
        },
      ]}
      >
        <TouchableHighlight
          onPress={() => this.edit(item.key, item.text)}
          style={styles.rowFront}
          underlayColor="#AAA"
        >
          {editing === item.key ? (
            <TextInput
              ref={this.textInput}
              placeholder="Shopping list item"
              onChangeText={t => this.setState({ text: t })}
              onBlur={() => this.setState({ editing: null })}
              onSubmitEditing={() => updateRenderItem(item.key, { text })}
              value={text}
            />
          ) : (
            <Text>
              {item.text}
            </Text>
          )}
        </TouchableHighlight>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  rowFront: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    justifyContent: 'center',
    height: 50,
  },
});
