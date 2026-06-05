import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Plus} from 'phosphor-react-native';
import {colors} from '../../styles/colors';
import {Avatar} from './Avatar';

type HeaderProps = {
  userName: string;
  avatarUri?: string | null;
  onAvatarPress: () => void;
  onAddPress: () => void;
};

function Header({userName, avatarUri, onAvatarPress, onAddPress}: HeaderProps) {
  const firstName = userName.split(' ')[0] ?? userName;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.profileSection}
        onPress={onAvatarPress}
        activeOpacity={0.7}>
        <Avatar uri={avatarUri} size={44} />
        <View>
          <Text style={styles.greeting}>Olá,</Text>
          <Text style={styles.name}>{firstName}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddPress}
        activeOpacity={0.7}>
        <Plus size={24} color={colors.white} weight="bold" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    fontSize: 14,
    color: colors.text,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.title,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary500,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export {Header};
