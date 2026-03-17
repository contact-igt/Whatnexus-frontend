import React from 'react';

export const MessageStatusTicks = ({ status }: { status: string | null }) => {
    if (status === 'read') {
        // Double blue ticks
        return <svg viewBox="0 0 16 11" width="16" height="11" className="text-[#53bdeb]"><path fill="currentColor" d="M11.053 1.514L5.373 7.194 2.433 4.254a.553.553 0 00-.783.783l3.333 3.333a.553.553 0 00.783 0l6.07-6.07a.553.553 0 00-.783-.783zM15.053 1.514L9.373 7.194l-1.636-1.636a.553.553 0 00-.783.783l2.027 2.027a.553.553 0 00.783 0l6.07-6.07a.553.553 0 00-.783-.783z"></path></svg>;
    }
    if (status === 'delivered') {
        // Double gray ticks
        return <svg viewBox="0 0 16 11" width="16" height="11" className="text-[#8696a0]"><path fill="currentColor" d="M11.053 1.514L5.373 7.194 2.433 4.254a.553.553 0 00-.783.783l3.333 3.333a.553.553 0 00.783 0l6.07-6.07a.553.553 0 00-.783-.783zM15.053 1.514L9.373 7.194l-1.636-1.636a.553.553 0 00-.783.783l2.027 2.027a.553.553 0 00.783 0l6.07-6.07a.553.553 0 00-.783-.783z"></path></svg>;
    }
    if (status === 'sent') {
        // Single gray tick
        return <svg viewBox="0 0 12 11" width="12" height="11" className="text-[#8696a0]"><path fill="currentColor" d="M11.053 1.514L5.373 7.194 2.433 4.254a.553.553 0 00-.783.783l3.333 3.333a.553.553 0 00.783 0l6.07-6.07a.553.553 0 00-.783-.783z"></path></svg>;
    }
    if (status === 'failed') {
        // Red error icon
        return <svg viewBox="0 0 16 16" width="12" height="12" className="text-red-500"><path fill="currentColor" d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zM8.75 8a.75.75 0 01-1.5 0V5a.75.75 0 011.5 0v3z"></path></svg>;
    }
    // Default: single gray tick (no status yet)
    return <svg viewBox="0 0 12 11" width="12" height="11" className="text-[#8696a0]"><path fill="currentColor" d="M11.053 1.514L5.373 7.194 2.433 4.254a.553.553 0 00-.783.783l3.333 3.333a.553.553 0 00.783 0l6.07-6.07a.553.553 0 00-.783-.783z"></path></svg>;
};

export const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffDays =
        (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7)
        return date.toLocaleDateString("en-US", { weekday: "long" });

    return date.toLocaleDateString("en-GB");
};

export const formattedTime = (dateString: any) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}
