import type { PurchaseRequest, RequestItem } from "../types/requests";
import supabase from "./supabase";

export const getPurchaseRequests = async (organizationId: string) => {
    const { data, error } = await supabase.from('purchase_requests').select('*').eq('organization_id', organizationId);
    if (error) {
        throw new Error(error.message);
    }
    return data as PurchaseRequest[];
}

export const getPurchaseRequestsById = async (id: string) => {
    const { data, error } = await supabase.from('purchase_requests').select('*').eq('id', id).single();
    if (error) {
        throw new Error(error.message);
    }
    return data as PurchaseRequest;
}

export const getRequestItems = async (request_id: string) => {
    const { data, error } = await supabase.from('request_items').select('*').eq('request_id', request_id);
    if (error) {
        throw new Error(error.message);
    }
    return data as RequestItem[];
}