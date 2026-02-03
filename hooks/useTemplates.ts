import { useState, useEffect } from 'react';
import { templateApiData } from '@/services/template';

const templateApi = new templateApiData();

export interface Template {
    template_id: string;
    id?: string;
    name?: string;
    template_name?: string;
    element_name?: string;
    category?: string;
    language?: string;
    status?: string;
    body?: string;
    header_type?: string;
    header_content?: string;
    footer?: string;
    buttons?: any[];
    components?: any[];
    variables?: any[]; // Full variable list from API
    variables_count?: number;
    created_at?: string;
    updated_at?: string;
}

interface UseTemplatesReturn {
    templates: Template[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useTemplates = (): UseTemplatesReturn => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await templateApi.getAllTemplate();

            // Handle response based on API structure
            const templateData = response?.data?.templates || response?.data || [];
            setTemplates(templateData);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to fetch templates');
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    return {
        templates,
        loading,
        error,
        refetch: fetchTemplates,
    };
};
