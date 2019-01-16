import React from 'react';
import {
  createStackNavigator,
  createBottomTabNavigator,
  createAppContainer,
} from 'react-navigation';
import { Icon } from 'react-native-elements';
import Current from './CurrentView';
import Details from './DetailsView';
import Archived from './ArchivedView';

const CurrentStack = createStackNavigator(
  { Current, Details },
);

const ArchivedStack = createStackNavigator(
  { Archived },
);

const Main = createBottomTabNavigator(
  { Current: CurrentStack, Archived: ArchivedStack },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;
        if (routeName === 'Current') {
          iconName = 'ios-list';
        } else if (routeName === 'Archived') {
          iconName = `ios-${focused ? 'filing' : 'archive'}`;
        }

        return (
          <Icon
            name={iconName}
            type="ionicon"
            color={tintColor}
          />
        );
      },
    }),
    tabBarOptions: {
      activeTintColor: 'tomato',
      inactiveTintColor: 'gray',
    },
  },
);

export default createAppContainer(Main);
