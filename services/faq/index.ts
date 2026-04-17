import { _axios } from "@/helper/axios";

export interface SaveFaqReviewData {
  doctor_answer: string;
  add_to_kb: boolean;
}

export interface PublishFaqReviewData {
  doctor_answer: string;
  add_to_kb: boolean;
}

export interface CreateFaqData {
  question: string;
  answer: string;
}

export interface EditFaqKnowledgeEntryData {
  question?: string;
  answer?: string;
}

export class faqApiData {
  getFaqReviews = async (status?: "pending_review" | "published") => {
    const params = status ? `?status=${status}` : "";
    return await _axios("get", `/whatsapp/faq-reviews${params}`);
  };

  getFaqCounts = async () => {
    return await _axios("get", "/whatsapp/faq-reviews/counts");
  };

  getFaqMasterSource = async () => {
    return await _axios("get", "/whatsapp/faq-reviews/master-source");
  };

  saveFaqReview = async (id: string, data: SaveFaqReviewData) => {
    return await _axios("put", `/whatsapp/faq-reviews/${id}`, data);
  };

  publishFaqReview = async (id: string, data: PublishFaqReviewData) => {
    return await _axios("put", `/whatsapp/faq-reviews/${id}/publish`, data);
  };

  createFaq = async (data: CreateFaqData) => {
    return await _axios("post", "/whatsapp/faq-reviews", data);
  };

  toggleFaqActive = async (id: string, isActive: boolean) => {
    return await _axios(
      "put",
      `/whatsapp/faq-reviews/${id}/toggle?is_active=${isActive}`
    );
  };

  deleteFaqReview = async (id: string) => {
    return await _axios("delete", `/whatsapp/faq-reviews/${id}/soft`);
  };

  // ── Child FAQ Knowledge Entries ──────────────────────────────────────────

  getFaqKnowledgeEntries = async (page = 1, limit = 50) => {
    return await _axios(
      "get",
      `/whatsapp/faq-reviews/knowledge-entries?page=${page}&limit=${limit}`
    );
  };

  getFaqKnowledgeEntry = async (id: string) => {
    return await _axios("get", `/whatsapp/faq-reviews/knowledge-entries/${id}`);
  };

  editFaqKnowledgeEntry = async (id: string, data: EditFaqKnowledgeEntryData) => {
    return await _axios("put", `/whatsapp/faq-reviews/knowledge-entries/${id}`, data);
  };

  removeFaqKnowledgeEntry = async (id: string) => {
    return await _axios("delete", `/whatsapp/faq-reviews/knowledge-entries/${id}`);
  };
}
