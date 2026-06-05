import React from 'react';
import {StyleSheet, Text, View, type ViewStyle} from 'react-native';
import {Tray} from 'phosphor-react-native';
import {colors} from '../../styles/colors';

type EmptyStateProps = {
  title: string;
  description?: string;
  style?: ViewStyle;
};

function EmptyState({title, description, style}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Tray size={48} color={colors.placeholder} weight="light" />
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.title,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export {EmptyState};
