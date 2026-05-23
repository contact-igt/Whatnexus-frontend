/**
 * Button Parser Utilities for Frontend
 * Parses button information from chat list items for display
 */

/**
 * Extract button metadata from chat list item
 * @param {string} message - Chat message text
 * @param {object} buttonsInfo - Pre-calculated button info from backend
 * @returns {object} Button metadata for UI rendering
 */
export const parseButtonsFromMessage = (message: string, buttonsInfo?: any) => {
  // Method 1: Use pre-calculated metadata from backend
  if (buttonsInfo?.hasButtons) {
    return {
      hasButtons: true,
      count: buttonsInfo.buttonCount,
      types: buttonsInfo.interactiveType ? [buttonsInfo.interactiveType] : [],
      preview: buttonsInfo.preview,
      all: buttonsInfo.buttons,
    };
  }

  // Method 2: Fallback to message text parsing
  if (!message) {
    return {
      hasButtons: false,
      count: 0,
      types: [],
      preview: '',
      all: [],
    };
  }

  const buttonRegex = /\[Button:\s*([^\]]+)\]/gi;
  const matches = message.matchAll(buttonRegex);
  const buttons = Array.from(matches).map((m) => {
    const text = m[1].trim();
    return { text, type: 'quick_reply' };
  });

  if (buttons.length === 0) {
    return {
      hasButtons: false,
      count: 0,
      types: [],
      preview: '',
      all: [],
    };
  }

  return {
    hasButtons: true,
    count: buttons.length,
    types: buttons.length > 0 ? ['BUTTON'] : [],
    preview: buttons
      .slice(0, 2)
      .map((b) => b.text)
      .join(' • '),
    all: buttons,
  };
};

/**
 * Get button type icon for chat list
 * @param {string[]} buttonTypes - Array of button types from backend
 * @returns {string} Emoji icon representing the button type
 */
export const getButtonIcon = (buttonTypes: string[] | string): string => {
  let types = Array.isArray(buttonTypes) ? buttonTypes : [buttonTypes];

  if (!types || types.length === 0) {
    return '⚡';
  }

  const typeMap: Record<string, string> = {
    button: '🔘',
    list: '📋',
    QUICK_REPLY: '🔘',
    LIST_ITEM: '📋',
    TEXT_MARKER: '📌',
    appointment: '📅',
    unknown: '⚡',
  };

  // Return first type's icon, or check for 'list' type specifically
  const primaryType = types[0];
  return typeMap[primaryType] || (types.includes('list') ? '📋' : '⚡');
};

/**
 * Format button count for display
 * @param {number} count - Number of buttons
 * @param {string} type - Type of buttons (button, list, etc.)
 * @returns {string} Formatted display string
 */
export const formatButtonDisplay = (count: number, type?: string): string => {
  if (count === 0) {
    return '';
  }

  const typeLabel =
    type === 'list' || type === 'LIST_ITEM' ? 'options' : 'actions';
  if (count === 1) {
    return `1 ${typeLabel}`;
  }
  if (count <= 3) {
    return `${count} ${typeLabel}`;
  }
  return `${count}+ ${typeLabel}`;
};

/**
 * Strip button text from message display
 * @param {string} message - Original message with button markers
 * @returns {string} Clean message without button markers
 */
export const stripButtonsFromMessage = (message: string): string => {
  if (!message) {
    return '';
  }
  return message
    .replace(/\[Button:\s*[^\]]+\]/gi, '')
    .replace(/\n+/g, ' ')
    .trim();
};

/**
 * Truncate message text to a reasonable length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (default 60)
 * @returns {string} Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number = 60): string => {
  if (!text) {
    return '';
  }
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

/**
 * Format timestamp for display
 * @param {string | Date} timestamp - ISO timestamp or Date object
 * @returns {string} Human-readable timestamp (e.g., "5m ago", "2h ago")
 */
export const formatTime = (timestamp: string | Date): string => {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return 'now';
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString();
};

/**
 * Check if message has interactive elements
 * @param {object} chat - Chat item from backend
 * @returns {boolean} Whether the chat has interactive buttons
 */
export const hasInteractiveElements = (chat: any): boolean => {
  return (
    chat?.buttons_info?.hasButtons ||
    (chat?.message && chat.message.includes('[Button:')) ||
    chat?.message_type === 'interactive'
  );
};

/**
 * Get button preview for tooltip
 * @param {object} buttonInfo - Button info object from parseButtonsFromMessage
 * @param {number} maxItems - Maximum items to show (default 5)
 * @returns {string[]} Array of button text for tooltip
 */
export const getButtonPreview = (buttonInfo: any, maxItems: number = 5): string[] => {
  if (!buttonInfo?.all || buttonInfo.all.length === 0) {
    return [];
  }

  return buttonInfo.all
    .slice(0, maxItems)
    .map((btn: any) => btn.text || btn.title || '');
};
