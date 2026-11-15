export const mockStats = {
  inboxZeroProgress: 84,
  pendingDrafts: 5,
  urgentItems: 2,
  avgResponseTime: '14m',
}

export const mockThreads = [
  {
    id: 'thread-1',
    clientName: 'Acme Corp (Sarah Jenkins)',
    subject: 'Q3 Contract Renewal & Pricing Discussion',
    snippet:
      "Hi team, we'd like to review the updated pricing terms before signing...",
    classification: 'Urgent',
    category: 'Client',
    timestamp: '10m ago',
    unread: true,
    messages: [
      {
        id: 'm1',
        sender: 'Sarah Jenkins',
        text: 'Hi team, we\'d like to review the updated pricing terms...',
        time: '10:42 AM',
      },
    ],
  },
  {
    id: 'thread-2',
    clientName: 'Globex (Michael Scott)',
    subject: 'Paper Supply Chain Logistics Update',
    snippet: 'Checking in on the shipment status for next Tuesday...',
    classification: 'Follow-up',
    category: 'Logistics',
    timestamp: '1h ago',
    unread: false,
    messages: [
      {
        id: 'm2',
        sender: 'Michael Scott',
        text: 'Checking in on the shipment status for next Tuesday...',
        time: '9:15 AM',
      },
    ],
  },
]
