import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'react-native-elements';

const Plus = ({ onPress }) => (
  <Icon
    name="ios-add"
    type="ionicon"
    color="cornflowerblue"
    size={32}
    containerStyle={{ paddingRight: 15 }}
    onPress={onPress}
  />
);

Plus.propTypes = {
  onPress: PropTypes.func,
};

Plus.defaultProps = {
  onPress: () => {},
};

export default Plus;
