import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {HomeScreen} from '../screens/home/HomeScreen';
import {PreferencesScreen} from '../screens/preferences/PreferencesScreen';
import {ActivityByCategoryScreen} from '../screens/activities/ActivityByCategoryScreen';
import {ActivityDetailsScreen} from '../screens/activities/ActivityDetailsScreen';
import {NewActivityScreen} from '../screens/activities/NewActivityScreen';
import {EditActivityScreen} from '../screens/activities/EditActivityScreen';
import {ProfileScreen} from '../screens/profile/ProfileScreen';
import {EditProfileScreen} from '../screens/profile/EditProfileScreen';

export type AppStackParamList = {
  Home: undefined;
  Preferences: {fromEdit?: boolean} | undefined;
  ActivityByCategory: {typeId?: string} | undefined;
  ActivityDetails: {activityId: string};
  NewActivity: undefined;
  EditActivity: {activityId: string};
  Profile: undefined;
  EditProfile: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();

function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
      <Stack.Screen
        name="ActivityByCategory"
        component={ActivityByCategoryScreen}
      />
      <Stack.Screen
        name="ActivityDetails"
        component={ActivityDetailsScreen}
      />
      <Stack.Screen name="NewActivity" component={NewActivityScreen} />
      <Stack.Screen name="EditActivity" component={EditActivityScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}

export {AppNavigator};
