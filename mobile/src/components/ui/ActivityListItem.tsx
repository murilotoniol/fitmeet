import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {CalendarBlank, Users, Lock} from 'phosphor-react-native';
import {colors} from '../../styles/colors';
import {formatDateTime} from '../../utils/formatters';

type ActivityListItemProps = {
  title: string;
  image: string;
  scheduledDate: string;
  participantCount: number;
  isPrivate?: boolean;
  onPress: () => void;
};

function ActivityListItem({
  title,
  image,
  scheduledDate,
  participantCount,
  isPrivate,
  onPress,
}: ActivityListItemProps) {
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
      activeOpacity={0.7}>
      <Image
        source={{uri: image}}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {isPrivate ? (
            <Lock size={14} color={colors.text} weight="fill" />
          ) : null}
        </View>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <CalendarBlank size={14} color={colors.text} />
            <Text style={styles.metaText}>
              {formatDateTime(scheduledDate)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Users size={14} color={colors.text} />
            <Text style={styles.metaText}>{participantCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    height: 88,
  },
  image: {
    width: 88,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.title,
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.text,
  },
});

export {ActivityListItem};
