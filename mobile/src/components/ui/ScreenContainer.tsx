import React from 'react';
import {SafeAreaView, StyleSheet, type ViewStyle} from 'react-native';
import {colors} from '../../styles/colors';

type ScreenContainerProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

function ScreenContainer({children, style}: ScreenContainerProps) {
  return (
    <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export {ScreenContainer};
