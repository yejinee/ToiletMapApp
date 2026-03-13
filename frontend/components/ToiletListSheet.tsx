/**
 * ToiletListSheet.tsx
 *
 * 화면 하단에 표시되는 화장실 목록 시트 컴포넌트
 *
 * 주요 기능:
 *  - 거리 순으로 정렬된 화장실 목록을 카드 형태로 표시
 *  - 핸들(손잡이) 부분을 눌러 목록 접기/펼치기 가능
 *  - 각 화장실 카드를 누르면 상세 페이지로 이동
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { Toilet } from '../app/(tabs)/restroom_finder';

/** 부모 컴포넌트로부터 받는 props */
interface ToiletListSheetProps {
  toiletList: Toilet[];                  // 표시할 화장실 목록 (거리순 정렬됨)
  showDetail: (toilet: Toilet) => void;  // 카드 클릭 시 상세 페이지 이동 콜백
}

const ToiletListSheet: React.FC<ToiletListSheetProps> = ({ toiletList, showDetail }) => {
  // 목록 접힘 여부 (true = 접힘, false = 펼쳐짐)
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    // isCollapsed가 true이면 sheetCollapsed 스타일 추가 → 높이 56px로 줄어듦
    <View style={[styles.sheetContainer, isCollapsed && styles.sheetCollapsed]}>

      {/* 핸들 영역: 누르면 접기/펼치기 토글 */}
      <Pressable onPress={() => setIsCollapsed(v => !v)} style={styles.handleArea}>
        <View style={styles.sheetHandle} />
        <Text style={styles.toggleHint}>{isCollapsed ? '▲ 목록 열기' : '▼ 목록 닫기'}</Text>
      </Pressable>

      {/* 펼쳐진 경우에만 목록 표시 */}
      {!isCollapsed && (
        <ScrollView style={styles.scrollView}>
          {toiletList.map(toilet => (
            // 화장실 카드 1개 - 누르면 showDetail 호출
            <Pressable key={toilet.id} style={styles.listItem} onPress={() => showDetail(toilet)}>

              {/* 화장실 이름 + 거리 */}
              <View style={styles.listItemHeader}>
                <Text style={styles.listItemName}>{toilet.name}</Text>
                <Text style={styles.listItemDistance}>{toilet.distance?.toFixed(2)} km</Text>
              </View>

              {/* 주소 */}
              <Text style={styles.listItemAddress}>{toilet.address}</Text>

              {/* 별점 */}
              <View style={styles.listItemRating}>
                <Text style={styles.listItemRatingText}>{toilet.rating.average.toFixed(1)}</Text>
                <Text style={styles.listItemRatingCount}>({toilet.rating.count}명 평가)</Text>
              </View>

              {/* 편의시설 태그 */}
              <View style={styles.checklistContainer}>
                {toilet.checklist.public && <Text style={styles.checklistTag}>공용</Text>}
                {toilet.checklist.bidet && <Text style={[styles.checklistTag, { backgroundColor: '#DBEAFE' }]}>비데</Text>}
                {toilet.checklist.paper && <Text style={[styles.checklistTag, { backgroundColor: '#D1FAE5' }]}>휴지</Text>}
                {toilet.checklist.accessible && <Text style={[styles.checklistTag, { backgroundColor: '#EAD1FA' }]}>장애인</Text>}
              </View>

            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // 시트 컨테이너: 화면 하단 고정, 높이 66.6%
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '66.6%',
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    paddingTop: 16,
  },
  // 접힌 상태: 핸들만 보이도록 높이 56px
  sheetCollapsed: {
    height: 56,
  },
  // 핸들 터치 영역
  handleArea: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  // 핸들 바 (회색 막대)
  sheetHandle: {
    width: 48,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 9999,
    marginBottom: 4,
  },
  // "목록 열기 / 닫기" 힌트 텍스트
  toggleHint: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  // 화장실 카드 1개
  listItem: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  listItemDistance: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  listItemAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  listItemRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  listItemRatingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFC107',
  },
  listItemRatingCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  checklistContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  checklistTag: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 9999,
    color: '#4B5563',
  },
});

export default ToiletListSheet;
