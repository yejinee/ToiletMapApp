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
        <Text>Error: Toilet data not found.</Text>
      </View>
    );
  }

  const handleRatingSubmit = () => {
    // Implement rating submit logic here (e.g., call API)
    setIsRatingModalVisible(false);
  };
  
  return (
    <View style={styles.pageContainer}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: `https://placehold.co/400x200/FEE2E2/EF4444?text=${toilet.name.replace(/ /g, '+')}` }} 
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
            {toilet.checklist.bidet && <Text style={styles.checklistTag}>비데</Text>}
            {toilet.checklist.paper && <Text style={styles.checklistTag}>휴지</Text>}
            {toilet.checklist.accessible && <Text style={styles.checklistTag}>장애인</Text>}
          </View>
          
          <View style={styles.buttonGroup}>
            <Pressable style={styles.ratingButton} onPress={() => setIsRatingModalVisible(true)}>
              <Text style={styles.buttonText}>평가하기</Text>
            </Pressable>
            <Pressable style={styles.directionsButton}>
              <Text style={styles.buttonText}>길찾기</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>평가 요약</Text>
          <View style={styles.ratingChart}>
            {/* Simplified mock chart */}
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
                      <Ionicons name="star" size={16} color="#FFC107" style={{ marginLeft: 4 }} />
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
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  address: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFC107',
  },
  ratingCount: {
    fontSize: 14,
    color: '#6B7280',
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
    backgroundColor: '#E5E7EB',
    borderRadius: 9999,
    fontSize: 14,
    color: '#4B5563',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  ratingButton: {
    flex: 1,
    backgroundColor: '#FF8C00',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  directionsButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  ratingChart: {
    marginTop: 16,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  chartLabel: {
    width: 32,
    fontSize: 14,
    color: '#6B7280',
  },
  chartBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 9999,
    overflow: 'hidden',
    marginLeft: 8,
  },
  chartBar: {
    height: '100%',
    backgroundColor: '#FFC107',
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
    color: '#6B7280',
  },
  reviewsList: {
    //
  },
  reviewItem: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerInitial: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginLeft: 8,
  },
  reviewStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewStarText: {
    fontWeight: 'bold',
    color: '#FFC107',
  },
  reviewText: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 8,
  },
  reviewTimestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  noReviewsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 24,
  },
});

export default RestroomDetails;
