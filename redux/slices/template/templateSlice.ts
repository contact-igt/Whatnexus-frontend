import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TemplateState {
    uploadedMediaUrl: string;
    uploadedMediaType: 'image' | 'video' | 'document' | null;
    isUploading: boolean;
    carouselCards: Array<{
        id: string;
        mediaType: 'IMAGE' | 'VIDEO';
        mediaUrl: string;
        bodyText: string;
        buttons: any[];
    }>;
}

const getInitialMedia = () => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('template_uploaded_media');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return { url: '', type: null };
            }
        }
    }
    return { url: '', type: null };
};

const savedMedia = getInitialMedia();

const initialState: TemplateState = {
    uploadedMediaUrl: savedMedia.url,
    uploadedMediaType: savedMedia.type,
    isUploading: false,
    carouselCards: [
        { id: 'card-1', mediaType: 'IMAGE', mediaUrl: '', bodyText: '', buttons: [] },
        { id: 'card-2', mediaType: 'IMAGE', mediaUrl: '', bodyText: '', buttons: [] },
    ],
};

const templateSlice = createSlice({
    name: 'template',
    initialState,
    reducers: {
        setUploadedMedia: (state, action: PayloadAction<{ url: string; type: 'image' | 'video' | 'document' }>) => {
            state.uploadedMediaUrl = action.payload.url;
            state.uploadedMediaType = action.payload.type;
            state.isUploading = false;
            if (typeof window !== 'undefined') {
                localStorage.setItem('template_uploaded_media', JSON.stringify({ url: action.payload.url, type: action.payload.type }));
            }
        },
        setUploading: (state, action: PayloadAction<boolean>) => {
            state.isUploading = action.payload;
        },
        clearUploadedMedia: (state) => {
            state.uploadedMediaUrl = '';
            state.uploadedMediaType = null;
            state.isUploading = false;
            if (typeof window !== 'undefined') {
                localStorage.removeItem('template_uploaded_media');
            }
        },
        updateCarouselCards: (state, action: PayloadAction<any[]>) => {
            state.carouselCards = action.payload;
        },
        addCarouselCard: (state) => {
            if (state.carouselCards.length < 10) {
                const newId = `card-${state.carouselCards.length + 1}`;
                state.carouselCards.push({
                    id: newId,
                    mediaType: 'IMAGE',
                    mediaUrl: '',
                    bodyText: '',
                    buttons: []
                });
            }
        },
        removeCarouselCard: (state, action: PayloadAction<string>) => {
            if (state.carouselCards.length > 2) {
                state.carouselCards = state.carouselCards.filter(c => c.id !== action.payload);
            }
        }
    },
});

export const { 
    setUploadedMedia, 
    setUploading, 
    clearUploadedMedia, 
    updateCarouselCards,
    addCarouselCard,
    removeCarouselCard
} = templateSlice.actions;

export default templateSlice.reducer;
