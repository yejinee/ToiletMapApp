import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, PanResponder } from 'react-native';
import { Toilet, SearchPlace } from '../app/(tabs)/restroom_finder';

interface ToiletListSheetProps {
  toiletList: Toilet[];
  showDetail: (toilet: Toilet) => void;
  showPlaceDetail: (place: SearchPlace) => void;
  nearbyPlaces?: SearchPlace[];
}

const formatDistance = (distanceStr?: string) => {
  if (!distanceStr) return '';
  const m = parseInt(distanceStr);
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
};

// 카카오 카테고리에서 가장 구체적인 분류 추출
// "음식점 > 한식 > 국밥" → "한식" (2번째 레벨)
// "음식점 > 카페" → "카페"
// "카페,디저트 > 커피전문점" → "커피전문점"
const formatCategory = (category: string) => {
  const parts = category.split(' > ');
  return parts.length >= 2 ? parts[1] : parts[0];
};

const ToiletListSheet: React.FC<ToiletListSheetProps> = ({ toiletList: _toiletList, showDetail: _showDetail, showPlaceDetail, nearbyPlaces = [] }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 드래그로 열고 닫기
  // dy > 40 → 아래로 충분히 내림 → 접기
  // dy < -40 → 위로 충분히 올림 → 펼치기
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 5,
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 40) setIsCollapsed(true);
        else if (gs.dy < -40) setIsCollapsed(false);
      },
    })
  ).current;

  return (
    <View style={[styles.sheetContainer, isCollapsed && styles.sheetCollapsed]}>

      <View {...panResponder.panHandlers} style={styles.handleArea}>
        <View style={styles.sheetHandle} />
        <Text style={styles.toggleHint}>{isCollapsed ? '▲ 목록 열기' : '▼ 목록 닫기'}</Text>
      </View>

      {!isCollapsed && (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

          {/* ── 근처 장소 (음식점/카페) ── */}
          <Text style={styles.sectionHeader}>근처 장소 · 반경 500m</Text>

          {nearbyPlaces.length === 0 ? (
            <Text style={styles.emptyText}>근처 장소를 불러오는 중...</Text>
          ) : (
            nearbyPlaces.map(place => (
              <Pressable key={place.id} style={styles.listItem} onPress={() => showPlaceDetail(place)}>
                <View style={styles.listItemHeader}>
                  <Text style={styles.listItemName} numberOfLines={1}>{place.name}</Text>
                  <Text style={styles.listItemDistance}>{formatDistance(place.distance)}</Text>
                </View>
                <Text style={styles.listItemAddress} numberOfLines={1}>{place.address}</Text>
                <View style={styles.categoryRow}>
                  <Text style={styles.categoryTag}>{formatCategory(place.category)}</Text>
                </View>
                {/* 별점: DB 연동 전까지 0.0 / 0명 평가 표시 */}
                <View style={styles.listItemRating}>
                  <Text style={styles.listItemRatingText}>0.0</Text>
                  <Text style={styles.listItemRatingCount}>(평가 없음)</Text>
                </View>
              </Pressable>
            ))
          )}

          {/*
            ── 근처 화장실 섹션 (임시 더미 데이터) ──
            추후 백엔드 API 연동 후 실제 주변 화장실 데이터로 교체 예정.
            현재는 하드코딩된 판교 주변 데이터라 위치와 무관하게 노출되므로 일단 숨김 처리.
          */}
          {/* <Text style={styles.sectionHeader}>근처 화장실</Text>
          {toiletList.map(toilet => (
            <Pressable key={toilet.id} style={styles.listItem} onPress={() => showDetail(toilet)}>
              <View style={styles.listItemHeader}>
                <Text style={styles.listItemName}>{toilet.name}</Text>
                <Text style={styles.listItemDistance}>{toilet.distance?.toFixed(2)} km</Text>
              </View>
              <Text style={styles.listItemAddress}>{toilet.address}</Text>
              <View style={styles.listItemRating}>
                <Text style={styles.listItemRatingText}>{toilet.rating.average.toFixed(1)}</Text>
                <Text style={styles.listItemRatingCount}>({toilet.rating.count}명 평가)</Text>
              </View>
              <View style={styles.checklistContainer}>
                {toilet.checklist.public && <Text style={styles.checklistTag}>공용</Text>}
                {toilet.checklist.bidet && <Text style={[styles.checklistTag, { backgroundColor: '#A0522D' }]}>비데</Text>}
                {toilet.checklist.paper && <Text style={styles.checklistTag}>휴지</Text>}
                {toilet.checklist.accessible && <Text style={[styles.checklistTag, { backgroundColor: '#D2B48C', color: '#1C1917' }]}>장애인</Text>}
              </View>
            </Pressable>
          ))} */}

        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '66.6%',
    backgroundColor: '#F1ECE2',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#D2B48C',
  },
  sheetCollapsed: {
    height: 56,
  },
  handleArea: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  sheetHandle: {
    width: 48,
    height: 4,
    backgroundColor: '#D2B48C',
    borderRadius: 9999,
    marginBottom: 4,
  },
  toggleHint: {
    fontSize: 11,
    color: '#D2B48C',
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D2B48C',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 10,
  },
  listItem: {
    padding: 16,
    backgroundColor: '#FAF7F2',
    borderRadius: 16,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E0D4',
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1917',
    flex: 1,
    marginRight: 8,
  },
  listItemDistance: {
    fontSize: 12,
    color: '#D2B48C',
    fontWeight: '500',
  },
  listItemAddress: {
    fontSize: 13,
    color: '#D2B48C',
    marginTop: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  categoryTag: {
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#D2B48C',
    borderRadius: 9999,
    color: '#1C1917',
    fontWeight: '600',
  },
  listItemRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  listItemRatingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#A0522D',
  },
  listItemRatingCount: {
    fontSize: 12,
    color: '#D2B48C',
    marginLeft: 4,
  },
  checklistContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 6,
  },
  checklistTag: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#8A9A5B',
    borderRadius: 9999,
    color: '#F1ECE2',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 13,
    color: '#D2B48C',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default ToiletListSheet;
