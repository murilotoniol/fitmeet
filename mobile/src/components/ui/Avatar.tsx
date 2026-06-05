import React from 'react';
import {Image, StyleSheet, View, type ImageStyle, type ViewStyle} from 'react-native';
import {User} from 'phosphor-react-native';
import {colors} from '../../styles/colors';

type AvatarProps = {
  uri?: string | null;
  size?: number;
  style?: ImageStyle | ViewStyle;
};

function Avatar({uri, size = 40, style}: AvatarProps) {
  const borderRadius = size / 2;

  if (uri) {
    return (
      <Image
        source={{uri}}
        style={[
          styles.image,
          {width: size, height: size, borderRadius},
          style,
        ]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {width: size, height: size, borderRadius},
        style,
      ]}>
      <User size={size * 0.5} color={colors.placeholder} weight="fill" />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.border,
  },
  placeholder: {
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export {Avatar};
