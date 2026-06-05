import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {colors} from '../../styles/colors';

type CategoryCardProps = {
  title: string;
  image: string;
  selected?: boolean;
  onPress: () => void;
};

function CategoryCard({title, image, selected, onPress}: CategoryCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}>
      <Image
        source={{uri: image}}
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={[styles.title, selected && styles.titleSelected]} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 96,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: colors.primary500,
    backgroundColor: 'rgba(0, 188, 125, 0.06)',
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.border,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  titleSelected: {
    color: colors.primary500,
  },
});

export {CategoryCard};
