import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1ECE2', // Terra Linen
  },
  searchBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1C1917', // Amber Black
    alignItems: 'center',
    paddingTop: 50,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: '#2C2520',
    borderWidth: 1,
    borderColor: '#D2B48C', // Sand Beige
    color: '#F1ECE2',       // Terra Linen text
  },
  searchButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A0522D', // Terracotta
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  recenterButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1ECE2', // Terra Linen
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  messageModalContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: '80%',
    zIndex: 10,
  },
  messageBox: {
    backgroundColor: '#1C1917', // Amber Black
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D2B48C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  messageText: {
    color: '#F1ECE2', // Terra Linen
    textAlign: 'center',
  },
  previewCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F1ECE2', // Terra Linen
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: '#D2B48C',
  },
  previewCardClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  previewCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917', // Amber Black
    marginRight: 28,
    letterSpacing: 0.3,
  },
  previewCardAddress: {
    fontSize: 13,
    color: '#D2B48C', // Sand Beige
    marginTop: 4,
  },
  previewCardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  previewCardRatingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#A0522D', // Terracotta
  },
  previewCardRatingCount: {
    fontSize: 12,
    color: '#D2B48C', // Sand Beige
  },
  previewCardDistance: {
    fontSize: 12,
    color: '#D2B48C', // Sand Beige
    marginLeft: 'auto',
  },
  previewCardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  checklistTag: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#8A9A5B', // Moss Green
    borderRadius: 9999,
    color: '#F1ECE2',            // Terra Linen text
    fontWeight: '500',
  },
  previewCardDetailBtn: {
    marginTop: 16,
    backgroundColor: '#A0522D', // Terracotta
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  previewCardDetailText: {
    color: '#F1ECE2', // Terra Linen
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});

export default styles;
