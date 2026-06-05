import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {MapPin, Users} from 'phosphor-react-native';
import {colors} from '../../styles/colors';
import {formatDateTime} from '../../utils/formatters';

type ActivityCardProps = {
  title: string;
  image: string;
  scheduledDate: string;
  participantCount: number;
  onPress: () => void;
};

function ActivityCard({
  title,
  image,
  scheduledDate,
  participantCount,
  onPress,
}: ActivityCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}>
      <Image
        source={{uri: image}}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={2}>
          {title.toUpperCase()}
        </Text>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <MapPin size={14} color={colors.white} weight="fill" />
            <Text style={styles.metaText}>
              {formatDateTime(scheduledDate)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Users size={14} color={colors.white} weight="fill" />
            <Text style={styles.metaText}>{participantCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
    padding: 12,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.white,
  },
});

export {ActivityCard};
