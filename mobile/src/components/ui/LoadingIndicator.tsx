import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {colors} from '../../styles/colors';

type LoadingIndicatorProps = {
  message?: string;
};

function LoadingIndicator({message = 'Carregando...'}: LoadingIndicatorProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary500} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  text: {
    fontSize: 14,
    color: colors.text,
  },
});

export {LoadingIndicator};
