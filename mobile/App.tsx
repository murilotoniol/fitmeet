import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import {SessionProvider} from './src/hooks/SessionContext';
import {RootNavigator} from './src/navigation/RootNavigator';

function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <SessionProvider>
          <RootNavigator />
        </SessionProvider>
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
