import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Checklist, Review, Toilet } from './restroom_finder';
import { Ionicons } from '@expo/vector-icons';
import RatingModal from '../../components/RatingModal';

const RestroomDetails: React.FC = () => {
  const { toilet: toiletJson } = useLocalSearchParams();
  const toilet: Toilet = toiletJson ? JSON.parse(toiletJson as string) : null;

  const [isRatingModalVisible, setIsRatingModalVisible] = useState<boolean>(false);
  const [ratingData, setRatingData] = useState<{ star: number; checklist: Checklist; text: string; }>({ star: 0, checklist: { public: false, bidet: false, paper: false, accessible: false }, text: '' });

  if (!toilet) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ color: '#1C1917' }}>Error: Toilet data not found.</Text>
      </View>
    );
  }

  const handleRatingSubmit = () => {
    setIsRatingModalVisible(false);
  };

  return (
    <View style={styles.pageContainer}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `https://placehold.co/400x200/D2B48C/1C1917?text=${toilet.name.replace(/ /g, '+')}` }}
            style={styles.image}
          />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.name}>{toilet.name}</Text>
          <Text style={styles.address}>{toilet.address}</Text>

          <View style={styles.ratingInfo}>
            <Text style={styles.ratingText}>{toilet.rating.average.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({toilet.rating.count}명 평가함)</Text>
          </View>

          <View style={styles.checklistContainer}>
            {toilet.checklist.public && <Text style={styles.checklistTag}>공용</Text>}
            {toilet.checklist.bidet && <Text style={[styles.checklistTag, { backgroundColor: '#A0522D' }]}>비데</Text>}
            {toilet.checklist.paper && <Text style={styles.checklistTag}>휴지</Text>}
            {toilet.checklist.accessible && <Text style={[styles.checklistTag, { backgroundColor: '#D2B48C', color: '#1C1917' }]}>장애인</Text>}
          </View>

          <View style={styles.buttonGroup}>
            <Pressable style={styles.ratingButton} onPress={() => setIsRatingModalVisible(true)}>
              <Text style={styles.buttonText}>평가하기</Text>
            </Pressable>
            <Pressable style={styles.directionsButton}>
              <Text style={styles.directionsButtonText}>길찾기</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>평가 요약</Text>
          <View style={styles.ratingChart}>
            {Array.from({ length: 5 }, (_, i) => 5 - i).map(star => (
              <View key={star} style={styles.chartRow}>
                <Text style={styles.chartLabel}>{star}점</Text>
                <View style={styles.chartBarBackground}>
                  <View style={[styles.chartBar, { width: `${(Math.random() * 80) + 20}%` }]}></View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>리뷰 ({toilet.reviews.length}개)</Text>
            <Pressable>
              <Text style={styles.sortText}>최신순 ▼</Text>
            </Pressable>
          </View>
          <View style={styles.reviewsList}>
            {toilet.reviews.length > 0 ? (
              toilet.reviews.map(review => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      <View style={styles.reviewerAvatar}>
                        <Text style={styles.reviewerInitial}>{review.author[0]}</Text>
                      </View>
                      <Text style={styles.reviewerName}>{review.author}</Text>
                    </View>
                    <View style={styles.reviewStars}>
                      <Text style={styles.reviewStarText}>{review.star}</Text>
                      <Ionicons name="star" size={16} color="#A0522D" style={{ marginLeft: 4 }} />
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{review.text}</Text>
                  <Text style={styles.reviewTimestamp}>{review.timestamp}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noReviewsText}>아직 리뷰가 없습니다.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Rating Modal */}
      <RatingModal
        isVisible={isRatingModalVisible}
        onClose={() => setIsRatingModalVisible(false)}
        onSubmit={handleRatingSubmit}
        ratingData={ratingData}
        setRatingData={setRatingData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#F1ECE2', // Terra Linen
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1ECE2',
  },
  scrollView: {
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 24,
    backgroundColor: '#FAF7F2', // 따뜻한 오프화이트
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderBottomWidth: 1,
    borderColor: '#E8E0D4',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1917', // Amber Black
    letterSpacing: 0.3,
  },
  address: {
    fontSize: 14,
    color: '#D2B48C', // Sand Beige
    marginTop: 4,
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A0522D', // Terracotta
  },
  ratingCount: {
    fontSize: 14,
    color: '#D2B48C', // Sand Beige
    marginLeft: 8,
  },
  checklistContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  checklistTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#8A9A5B', // Moss Green
    borderRadius: 9999,
    fontSize: 14,
    color: '#F1ECE2',            // Terra Linen
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  ratingButton: {
    flex: 1,
    backgroundColor: '#A0522D', // Terracotta
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  directionsButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D2B48C', // Sand Beige
  },
  buttonText: {
    color: '#F1ECE2', // Terra Linen
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  directionsButtonText: {
    color: '#1C1917', // Amber Black
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  sectionContainer: {
    backgroundColor: '#FAF7F2', // 따뜻한 오프화이트
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E8E0D4',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917', // Amber Black
    letterSpacing: 0.2,
  },
  ratingChart: {
    marginTop: 16,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  chartLabel: {
    width: 32,
    fontSize: 13,
    color: '#D2B48C', // Sand Beige
  },
  chartBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E8E0D4',
    borderRadius: 9999,
    overflow: 'hidden',
    marginLeft: 8,
  },
  chartBar: {
    height: '100%',
    backgroundColor: '#A0522D', // Terracotta
    borderRadius: 9999,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sortText: {
    fontSize: 14,
    color: '#D2B48C', // Sand Beige
  },
  reviewsList: {
    //
  },
  reviewItem: {
    backgroundColor: '#F1ECE2', // Terra Linen
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E0D4',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    backgroundColor: '#D2B48C', // Sand Beige
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerInitial: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1C1917', // Amber Black
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1C1917', // Amber Black
    marginLeft: 8,
  },
  reviewStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewStarText: {
    fontWeight: 'bold',
    color: '#A0522D', // Terracotta
  },
  reviewText: {
    fontSize: 14,
    color: '#1C1917', // Amber Black
    marginTop: 8,
    lineHeight: 20,
  },
  reviewTimestamp: {
    fontSize: 12,
    color: '#D2B48C', // Sand Beige
    marginTop: 8,
  },
  noReviewsText: {
    fontSize: 14,
    color: '#D2B48C', // Sand Beige
    textAlign: 'center',
    paddingVertical: 24,
  },
});

export default RestroomDetails;
