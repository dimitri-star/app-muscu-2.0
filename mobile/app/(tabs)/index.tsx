import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

// ─── Mock Data ────────────────────────────────────────────────────────────────

interface Post {
  id: string;
  username: string;
  handle: string;
  timestamp: string;
  workoutTitle: string;
  tags: { label: string; type: 'blue' | 'green' }[];
  volume: string;
  exercises: number;
  series: number;
  duration: string;
  likes: number;
  comments: number;
  liked: boolean;
}

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    username: 'Thomas R.',
    handle: '@thomasfit',
    timestamp: 'il y a 23 min',
    workoutTitle: 'Push — Pec & Épaules',
    tags: [
      { label: 'Salle de sport', type: 'blue' },
      { label: 'Hypertrophie', type: 'green' },
    ],
    volume: '7 272 kg',
    exercises: 4,
    series: 14,
    duration: '61 min',
    likes: 18,
    comments: 3,
    liked: false,
  },
  {
    id: '2',
    username: 'Julie M.',
    handle: '@juliem_lift',
    timestamp: 'il y a 1h',
    workoutTitle: 'Pull — Dos & Biceps',
    tags: [
      { label: 'Salle de sport', type: 'blue' },
      { label: 'Hypertrophie', type: 'green' },
    ],
    volume: '5 840 kg',
    exercises: 3,
    series: 11,
    duration: '52 min',
    likes: 31,
    comments: 7,
    liked: true,
  },
  {
    id: '3',
    username: 'Marc D.',
    handle: '@marcstrength',
    timestamp: 'il y a 2h',
    workoutTitle: 'Legs',
    tags: [{ label: 'Hypertrophie', type: 'green' }],
    volume: '12 500 kg',
    exercises: 5,
    series: 16,
    duration: '75 min',
    likes: 44,
    comments: 12,
    liked: false,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ size = 36 }: { size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} />
  );
}

function Tag({ label, type }: { label: string; type: 'blue' | 'green' }) {
  const bgColor = type === 'blue' ? Colors.tagBlueBg : Colors.tagGreenBg;
  const textColor = type === 'blue' ? Colors.tagBlueText : Colors.tagGreenText;
  return (
    <View style={[styles.tag, { backgroundColor: bgColor }]}>
      <Text style={[styles.tagText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

function StatColumn({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statColumn}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => (next ? c + 1 : c - 1));
  };

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Avatar size={36} />
        <View style={styles.postUserInfo}>
          <Text style={styles.postUsername}>{post.username}</Text>
          <Text style={styles.postMeta}>
            {post.handle} · {post.timestamp}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.workoutTitle}>{post.workoutTitle}</Text>

      <View style={styles.tagRow}>
        {post.tags.map((t) => (
          <Tag key={t.label} label={t.label} type={t.type} />
        ))}
      </View>

      <View style={styles.statsBar}>
        <StatColumn value={post.volume} label="Volume" />
        <View style={styles.statDivider} />
        <StatColumn value={String(post.exercises)} label="Exercices" />
        <View style={styles.statDivider} />
        <StatColumn value={String(post.series)} label="Séries" />
        <View style={styles.statDivider} />
        <StatColumn value={post.duration} label="Temps" />
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? Colors.likeActive : Colors.textSecondary}
          />
          <Text style={[styles.actionCount, liked && { color: Colors.likeActive }]}>
            {likeCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.actionCount}>{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const [feedTab, setFeedTab] = useState<'pourToi' | 'suivis'>('pourToi');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>FitTrack</Text>

        <View style={styles.feedToggle}>
          <TouchableOpacity
            style={[styles.feedPill, feedTab === 'pourToi' && styles.feedPillActive]}
            onPress={() => setFeedTab('pourToi')}
          >
            <Text style={[styles.feedPillText, feedTab === 'pourToi' && styles.feedPillTextActive]}>
              Pour toi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.feedPill, feedTab === 'suivis' && styles.feedPillActive]}
            onPress={() => setFeedTab('suivis')}
          >
            <Text style={[styles.feedPillText, feedTab === 'suivis' && styles.feedPillTextActive]}>
              Suivis
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="chatbubbles-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed */}
      <ScrollView style={styles.feed} showsVerticalScrollIndicator={false}>
        {MOCK_POSTS.map((post, i) => (
          <React.Fragment key={post.id}>
            <PostCard post={post} />
            {i < MOCK_POSTS.length - 1 && <View style={styles.separator} />}
          </React.Fragment>
        ))}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color={Colors.ctaText} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  logo: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
  },
  feedToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 3,
  },
  feedPill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
  },
  feedPillActive: {
    backgroundColor: Colors.text,
  },
  feedPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  feedPillTextActive: {
    color: Colors.background,
    fontWeight: '600',
  },
  headerIcons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 4,
  },
  iconBtn: {
    padding: 6,
  },

  // Feed
  feed: {
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.separator,
    marginHorizontal: 16,
  },

  // Post card
  postCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    backgroundColor: '#3A3A3C',
    marginRight: 10,
  },
  postUserInfo: {
    flex: 1,
  },
  postUsername: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  postMeta: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  moreBtn: {
    padding: 4,
  },
  workoutTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Stats
  statsBar: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 10,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: Colors.separator,
    marginVertical: 4,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 4,
  },
  actionCount: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
