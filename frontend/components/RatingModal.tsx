import React from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Checklist } from '../app/(tabs)/restroom_finder';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface RatingModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  ratingData: { star: number; checklist: Checklist; text: string; };
  setRatingData: React.Dispatch<React.SetStateAction<{ star: number; checklist: Checklist; text: string; }>>;
}

const RatingModal: React.FC<RatingModalProps> = ({ isVisible, onClose, onSubmit, ratingData, setRatingData }) => {

  const handleStarPress = (star: number) => {
    setRatingData(prev => ({ ...prev, star }));
  };

  const handleToggleChecklist = (key: keyof Checklist) => {
    setRatingData(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [key]: !prev.checklist[key]
      }
    }));
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade">
      <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.modalContent}>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close-circle" size={32} color="#D1D5DB" />
            </Pressable>
            <Text style={styles.title}>이 화장실 어땠나요?</Text>
            <Text style={styles.subtitle}>별점과 속성을 선택하고, 리뷰를 남겨주세요.</Text>
            
            <View style={styles.starRatingContainer}>
              {[5, 4, 3, 2, 1].map((star) => (
                <Pressable key={star} onPress={() => handleStarPress(star)}>
                  <Ionicons 
                    name={star <= ratingData.star ? 'star' : 'star-outline'} 
                    size={40} 
                    color="#FFC107"
                  />
                </Pressable>
              ))}
            </View>
            
            <View style={styles.checklistGroup}>
              <Pressable style={[styles.toggleBtn, ratingData.checklist.public && styles.toggleBtnToggled]} onPress={() => handleToggleChecklist('public')}>
                <Text style={styles.toggleText}>공용 화장실</Text>
              </Pressable>
              <Pressable style={[styles.toggleBtn, ratingData.checklist.bidet && styles.toggleBtnToggled]} onPress={() => handleToggleChecklist('bidet')}>
                <Text style={styles.toggleText}>비데 있음</Text>
              </Pressable>
              <Pressable style={[styles.toggleBtn, ratingData.checklist.paper && styles.toggleBtnToggled]} onPress={() => handleToggleChecklist('paper')}>
                <Text style={styles.toggleText}>휴지 구비</Text>
              </Pressable>
              <Pressable style={[styles.toggleBtn, ratingData.checklist.accessible && styles.toggleBtnToggled]} onPress={() => handleToggleChecklist('accessible')}>
                <Text style={styles.toggleText}>장애인 화장실</Text>
              </Pressable>
            </View>
            
            <TextInput
              style={styles.reviewInput}
              placeholder="자세한 리뷰를 남겨주세요..."
              multiline
              value={ratingData.text}
              onChangeText={(text) => setRatingData(prev => ({ ...prev, text }))}
            />
            
            <Pressable style={styles.saveButton} onPress={onSubmit}>
              <Text style={styles.saveButtonText}>저장하기</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  starRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  checklistGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  toggleBtnToggled: {
    backgroundColor: '#FFC107',
    borderColor: '#FFC107',
  },
  toggleText: {
    fontSize: 14,
    color: '#4B5563',
  },
  reviewInput: {
    width: '100%',
    minHeight: 120,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#374151',
  },
  saveButton: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#FF8C00',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default RatingModal;
