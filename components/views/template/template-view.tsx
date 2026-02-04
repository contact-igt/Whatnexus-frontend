"use client"
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Template, TemplateFormData } from './template-types';
import { TemplateListPage } from './template-list-page';
import { TemplateFormPage } from './template-form-page';
import { TemplatePreviewModal } from './template-preview-modal';
import { toast } from 'sonner';
import { useCreateTemplateMutation, useGetAllTemplateQuery, useGetTemplateByIdQuery, usePermanentDeleteTemplateMutation, useResubmitTemplateMutation, useSoftDeleteTemplateMutation, useSubmitTemplateMutation, useSyncAllTemplateMutation, useSyncTemplateByIdMutation, useUpdateTemplateMutation } from '@/hooks/useTemplateQuery';
import { useAuth } from '@/redux/selectors/auth/authSelector';

// const SAMPLE_TEMPLATES: Template[] = [
//     {
//         id: '1',
//         name: 'appointment_reminder',
//         category: 'UTILITY',
//         language: 'English',
//         status: 'Approved',
//         type: 'TEXT',
//         health: 'High',
//         content: 'Hello {{1}}, this is a reminder for your appointment with Dr. {{2}} on {{3}} at {{4}}. Please arrive 15 minutes early.',
//         footer: 'Powered by WhatsNexus',
//         variables: { '1': 'John Doe', '2': 'Dr. Smith', '3': '19th June 2025', '4': '10 AM IST' },
//         interactiveActions: 'QuickReplies',
//         quickReplies: ['Confirm', 'Reschedule', 'Cancel'],
//         createdAt: '2026-01-10T10:00:00Z',
//     },
//     {
//         id: '2',
//         name: 'lab_results_ready',
//         category: 'UTILITY',
//         language: 'English',
//         status: 'Approved',
//         type: 'TEXT',
//         health: 'High',
//         content: 'Dear {{1}}, your lab results are now available. Please visit our clinic or check your patient portal to view them.',
//         variables: { '1': 'Patient Name' },
//         interactiveActions: 'CTA',
//         ctaButtons: [
//             { id: '1', type: 'URL', label: 'View Results', value: 'https://portal.example.com' }
//         ],
//         createdAt: '2026-01-09T10:00:00Z',
//     },
//     {
//         id: '3',
//         name: 'health_checkup_offer',
//         category: 'MARKETING',
//         language: 'English',
//         status: 'Pending',
//         type: 'IMAGE',
//         health: 'Medium',
//         content: 'Hi {{1}}, get *20% off* on your annual health checkup this month! Book now and prioritize your health. Limited time offer.',
//         variables: { '1': 'Customer Name' },
//         interactiveActions: 'All',
//         ctaButtons: [
//             { id: '1', type: 'URL', label: 'Book Now', value: 'https://booking.example.com' },
//             { id: '2', type: 'PHONE', label: 'Call Us', value: '+1234567890' }
//         ],
//         quickReplies: ['Interested', 'Not Interested'],
//         createdAt: '2026-01-08T10:00:00Z',
//     },
//     {
//         id: '4',
//         name: 'prescription_reminder',
//         category: 'UTILITY',
//         language: 'English',
//         status: 'Draft',
//         type: 'TEXT',
//         health: 'Low',
//         content: 'Dear {{1}}, your prescription for {{2}} is ready for pickup at {{3}}. Valid until {{4}}.',
//         variables: { '1': 'Patient', '2': 'Medicine', '3': 'Pharmacy', '4': 'Date' },
//         interactiveActions: 'None',
//         createdAt: '2026-01-07T10:00:00Z',
//     },
//     {
//         id: '5',
//         name: 'otp_verification',
//         category: 'AUTHENTICATION',
//         language: 'English',
//         status: 'Approved',
//         type: 'TEXT',
//         health: 'High',
//         content: 'Your OTP for verification is *{{1}}*. This code will expire in {{2}} minutes. Do not share this code with anyone.',
//         variables: { '1': '123456', '2': '5' },
//         interactiveActions: 'CTA',
//         ctaButtons: [
//             { id: '1', type: 'COPY_CODE', label: 'Copy Code', value: '{{1}}' }
//         ],
//         createdAt: '2026-01-06T10:00:00Z',
//     },
// ];

type ViewMode = 'list' | 'create' | 'edit' | 'view';

export const TemplateView = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    // const [templates, setTemplates] = useState<Template[]>(SAMPLE_TEMPLATES);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
    const [editTemplateById, setEditTemplateById] = useState<Template | null>(null);
    const { data: templateData } = useGetAllTemplateQuery();
    const { data: templateDataById, isPending: getTemplateByIdLoading } = useGetTemplateByIdQuery(editTemplateById || previewTemplate?.template_id);
    const { mutate: createTemplateMutate, isPending: createTemplateLoading } = useCreateTemplateMutation();
    const { mutate: updateTemplateMutate, isPending: updateTemplateLoading } = useUpdateTemplateMutation();
    const { mutate: submitTemplateMutate, isPending: submitTemplateLoading } = useSubmitTemplateMutation();
    const { mutate: syncTemplateByIdMutate, isPending: syncTemplateLoading } = useSyncTemplateByIdMutation();
    const { mutate: syncAllTemplatesMutate, isPending: syncAllTemplatesLoading } = useSyncAllTemplateMutation();
    const { mutate: softDeleteTemplateMutate, isPending: softDeleteTemplateLoading } = useSoftDeleteTemplateMutation();
    const { mutate: permanentDeleteTemplateMutate, isPending: permanentDeleteTemplateLoading } = usePermanentDeleteTemplateMutation();
    const { mutate: reSubmitTemplateMutate, isPending: reSubmitTemplateLoading } = useResubmitTemplateMutation();
    // const {mutate: restoreTemplateMutate, isPending: restoreTemplateLoading} = useRestoreTemplateMutation();
    const handleCreateNew = () => {
        setSelectedTemplate(null);
        setEditTemplateById(null);
        setPreviewTemplate(null);
        setViewMode('create');
    };

    const handleEdit = (template: any) => {
        setEditTemplateById(template?.template_id);
        setViewMode('edit');
    };

    const handleView = (template: any) => {
        setEditTemplateById(template?.template_id);
        setViewMode('view');
    };

    const handleClosePreview = () => {
        setPreviewTemplate(null);
    };

    const handleSubmitTemplate = (template_id: string) => {
        submitTemplateMutate(template_id, {
            onSuccess: () => {
                toast.success('Template submitted successfully');
            },
            onError: (error: any) => {
                toast.error(error.message);
            }
        });
    }

    const handleResubmitTemplate = (template_id: string) => {
        reSubmitTemplateMutate(template_id);
    }
    const handleSyncTemplate = (template_id: string) => {
        syncTemplateByIdMutate(template_id, {
            onSuccess: () => {
                toast.success('Template synced successfully');
            },
            onError: (error: any) => {
                toast.error(error.message);
            }
        });
    }
    const handleSoftDelete = (templateId: string) => {
        softDeleteTemplateMutate(templateId);
        // if (confirm('Are you sure you want to delete this template?')) {
        //     setTemplates(templates.filter(t => t.id !== templateId));
        //     toast.success('Template deleted successfully');
        // }
    };

    const handlePermanentDelete = (templateId: string) => {
        permanentDeleteTemplateMutate(templateId);
    }

    const handleSync = () => {
        syncAllTemplatesMutate(undefined, {
            onSuccess: () => {
                toast.success('Templates synced successfully');
            },
            onError: (error: any) => {
                toast.error(error.message);
            }
        });
    };

    const handleBack = () => {
        setViewMode('list');
        setSelectedTemplate(null);
    };

    const handleSave = (formData: TemplateFormData) => {
        if (viewMode === 'edit' && editTemplateById) {
            updateTemplateMutate({ templateId: editTemplateById, data: formData }, {
                onSuccess: () => {
                    setViewMode('list');
                    setEditTemplateById(null);
                },

            });
            toast.success('Template updated successfully!');
        } else {
            createTemplateMutate((formData), {
                onSuccess: () => {
                    handleBack();
                }
            })
        }
    };

    // Render based on view mode
    if (viewMode === 'create' || viewMode === 'edit' || viewMode === 'view') {
        const selectedTemplateData = templateDataById?.data;
        const initialData: Partial<TemplateFormData> | undefined = selectedTemplateData ? {
            category: selectedTemplateData.category,
            language: selectedTemplateData.language,
            name: selectedTemplateData.template_name || selectedTemplateData.name,
            type: selectedTemplateData.template_type || selectedTemplateData.type,

            // Handle Header
            headerType: (selectedTemplateData.components.find((c: any) => c.component_type === "header")?.header_format || 'NONE'),

            headerValue: (selectedTemplateData.components.find((c: any) => c.component_type === "header")?.text_content || ''),

            // Handle Content (Body)
            content: (selectedTemplateData.components.find((c: any) => c.component_type === "body")?.text_content || selectedTemplateData.components.find((c: any) => c.component_type === "body")?.text || ''),

            // Handle Footer
            footer: (selectedTemplateData.components.find((c: any) => c.component_type === "footer")?.text_content || ''),

            variables: selectedTemplateData.variables,
            // interactiveActions: selectedTemplateData.interactive_actions,
            // ctaButtons: selectedTemplateData.ctaButtons || [],
            // quickReplies: selectedTemplateData.quickReplies || [],
        } : undefined;
        console.log("initialData1", initialData)
        return (
            <TemplateFormPage
                templateId={selectedTemplateData?.template_id}
                initialData={initialData}
                onBack={handleBack}
                onSave={handleSave}
                isViewMode={viewMode === 'view'}
            />
        );
    }

    return (
        <>
            <TemplateListPage
                isDarkMode={isDarkMode}
                templates={templateData?.data || []}
                onCreateNew={handleCreateNew}
                onEdit={handleEdit}
                isLoading={submitTemplateLoading || reSubmitTemplateLoading || syncTemplateLoading || softDeleteTemplateLoading || permanentDeleteTemplateLoading || syncAllTemplatesLoading}
                onSyncTemplate={handleSyncTemplate}
                onSubmitTemplate={handleSubmitTemplate}
                onResubmitTemplate={handleResubmitTemplate}
                onView={handleView}
                onSoftDelete={handleSoftDelete}
                onPermanentDelete={handlePermanentDelete}
                onSync={handleSync}
            />

            {/* Preview Modal */}
            {previewTemplate && (
                <TemplatePreviewModal
                    template={templateDataById?.data || previewTemplate}
                    isDarkMode={isDarkMode}
                    onClose={handleClosePreview}
                />
            )}
        </>
    );
};