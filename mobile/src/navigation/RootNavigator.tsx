import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {useSession} from '../hooks/useSession';
import {LoadingIndicator} from '../components/ui/LoadingIndicator';
import {AuthNavigator} from './AuthNavigator';
import {AppNavigator} from './AppNavigator';

function RootNavigator() {
  const {isAuthenticated, loading} = useSession();

  if (loading) {
    return <LoadingIndicator message="Iniciando FitMeet..." />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export {RootNavigator};
