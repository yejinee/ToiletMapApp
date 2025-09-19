import React from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { Toilet } from '../app/(tabs)/restroom_finder';

interface ToiletListSheetProps {
  toiletList: Toilet[];
  showDetail: (toilet: Toilet) => void;
}

const ToiletListSheet: React.FC<ToiletListSheetProps> = ({ toiletList, showDetail }) => {
  return (
    <View style={styles.sheetContainer}>
      <View style={styles.sheetHandle}></View>
      <ScrollView style={styles.scrollView}>
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
              {toilet.checklist.bidet && <Text style={[styles.checklistTag, { backgroundColor: '#DBEAFE' }]}>비데</Text>}
              {toilet.checklist.paper && <Text style={[styles.checklistTag, { backgroundColor: '#D1FAE5' }]}>휴지</Text>}
              {toilet.checklist.accessible && <Text style={[styles.checklistTag, { backgroundColor: '#EAD1FA' }]}>장애인</Text>}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
  sheetHandle: {
    width: 48,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 9999,
    alignSelf: 'center',
    marginBottom: 16,
  },
  scrollView: {
    paddingHorizontal: 16,
  },
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
    color: '#FFC107',
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
