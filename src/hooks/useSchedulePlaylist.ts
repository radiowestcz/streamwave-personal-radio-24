import { useMemo } from 'react';
import { useScheduleSlots } from './useScheduleSlots';
import { useContentItems, ContentItem, ContentType } from './useContentItems';
import type { TemplateSlot } from './useTemplates';

/**
 * Builds a playlist from the current schedule slot (based on current day/hour)
 * by resolving each template slot to a matching content item.
 */
export const useSchedulePlaylist = () => {
  const { data: scheduleSlots = [] } = useScheduleSlots();
  const { data: contentItems = [] } = useContentItems();

  const playlist = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0=Sunday
    const currentHour = now.getHours();

    // Find the active schedule slot for right now
    const activeSlot = scheduleSlots.find(
      s => s.day_of_week === currentDay && s.start_hour <= currentHour && s.end_hour > currentHour
    );

    if (!activeSlot?.template?.slots || !Array.isArray(activeSlot.template.slots)) {
      return { activeSlot, items: [] as ContentItem[] };
    }

    const templateSlots = activeSlot.template.slots as TemplateSlot[];
    const usedIds = new Set<string>();

    const items: ContentItem[] = templateSlots
      .map((slot) => {
        // If manual override
        if (slot.contentId) {
          const item = contentItems.find(c => c.id === slot.contentId && c.is_active);
          if (item) { usedIds.add(item.id); return item; }
        }

        // Auto-select by type + tags
        const candidates = contentItems.filter(c =>
          c.is_active &&
          c.type === slot.contentType &&
          (c.file_url || c.external_url) &&
          !usedIds.has(c.id)
        );

        // Filter by tags if present
        let filtered = candidates;
        if (slot.filters?.tags?.length) {
          filtered = candidates.filter(c =>
            c.tags?.some(t => slot.filters!.tags!.includes(t))
          );
          if (filtered.length === 0) filtered = candidates;
        }

        // Pick random from candidates
        const picked = filtered[Math.floor(Math.random() * filtered.length)] || null;
        if (picked) usedIds.add(picked.id);
        return picked;
      })
      .filter(Boolean) as ContentItem[];

    return { activeSlot, items };
  }, [scheduleSlots, contentItems]);

  return playlist;
};
