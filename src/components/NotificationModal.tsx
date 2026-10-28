import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Mail, 
  Phone, 
  Send, 
  Sparkles, 
  ExternalLink, 
  Check, 
  Copy, 
  Clock, 
  CheckCircle2, 
  Trash2,
  Filter,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { OrderNotification, NotificationChannel } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: OrderNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNotificationClick: (notif: OrderNotification) => void;
  onSelectReceiptByOrderNumber?: (orderNumber: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onNotificationClick,
  onSelectReceiptByOrderNumber,
}) => {
  if (!isOpen) return null;

  const [filterChannel, setFilterChannel] = useState<'ALL' | NotificationChannel>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'ORDER_DELIVERED' | 'ORDER_PROCESSING' | 'UNIPOINTS_EARNED'>('ALL');
  const [selectedPreviewNotif, setSelectedPreviewNotif] = useState<OrderNotification | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const filtered = notifications.filter((n) => {
    const channelMatch = filterChannel === 'ALL' || n.channel === filterChannel;
    const typeMatch = filterType === 'ALL' || n.type === filterType;
    return channelMatch && typeMatch;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case 'gmail':
        return <span className="text-red-400 font-bold flex items-center gap-1">📧 Gmail</span>;
      case 'phone_sms':
        return <span className="text-emerald-400 font-bold flex items-center gap-1">📱 SMS</span>;
      case 'telegram':
        return <span className="text-sky-400 font-bold flex items-center gap-1">✈️ Telegram</span>;
      case 'facebook':
        return <span className="text-blue-400 font-bold flex items-center gap-1">🔵 Facebook</span>;
      case 'twitter':
        return <span className="text-slate-300 font-bold flex items-center gap-1">🐦 Twitter/X</span>;
      default:
        return <span className="text-amber-400 font-bold flex items-center gap-1">⚡ UniPin System</span>;
    }
  };

  const getChannelBadge = (channel: NotificationChannel) => {
    switch (channel) {
      case 'gmail':
        return 'bg-red-500/15 border-red-500/30 text-red-300';
      case 'phone_sms':
        return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
      case 'telegram':
        return 'bg-sky-500/15 border-sky-500/30 text-sky-300';
      case 'facebook':
        return 'bg-blue-500/15 border-blue-500/30 text-blue-300';
      case 'twitter':
        return 'bg-slate-700/50 border-slate-600 text-slate-200';
      default:
        return 'bg-amber-500/15 border-amber-500/30 text-amber-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-750 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Order Notification Center
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                  ⚡ 2-3 MIN DISPATCH
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time delivery status alerts across Gmail, Phone SMS, Telegram, Facebook & Twitter
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mark Read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-400 hover:text-white rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Channels Bar */}
        <div className="p-3 bg-slate-850/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Channel:
            </span>
            {(['ALL', 'gmail', 'phone_sms', 'telegram', 'facebook', 'twitter'] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => setFilterChannel(ch)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap text-[11px] ${
                  filterChannel === ch
                    ? 'bg-orange-500 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                }`}
              >
                {ch === 'ALL' ? 'All Channels' : ch === 'gmail' ? '📧 Gmail' : ch === 'phone_sms' ? '📱 SMS' : ch === 'telegram' ? '✈️ Telegram' : ch === 'facebook' ? '🔵 FB' : '🐦 TW'}
              </button>
            ))}
          </div>

          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[11px] text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors ml-auto"
            >
              <Trash2 className="w-3 h-3" /> Clear History
            </button>
          )}
        </div>

        {/* Notification List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-14 text-center text-slate-400 space-y-2">
              <Bell className="w-12 h-12 mx-auto opacity-25 text-orange-400" />
              <div className="text-sm font-semibold">No notifications in this filter</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Orders completed will automatically deliver notifications here and to your linked Gmail, SMS, Telegram, FB, or Twitter ID.
              </p>
            </div>
          ) : (
            filtered.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  onNotificationClick(notif);
                  setSelectedPreviewNotif(notif);
                }}
                className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 relative group ${
                  notif.read
                    ? 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-800/90 border-orange-500/40 hover:border-orange-500/70 shadow-lg shadow-orange-500/5'
                }`}
              >
                {!notif.read && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                )}

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-8 h-8 rounded-xl bg-slate-900 border border-slate-750 flex items-center justify-center shrink-0">
                    {notif.type === 'ORDER_DELIVERED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : notif.type === 'ORDER_PROCESSING' ? (
                      <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                    ) : notif.type === 'UNIPOINTS_EARNED' ? (
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-sky-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${getChannelBadge(notif.channel)}`}>
                        {getChannelIcon(notif.channel)}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {notif.channelTarget}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-auto">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                      {notif.title}
                    </h4>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>

                    {/* Preview details if available */}
                    {notif.previewData && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] bg-slate-900/60 p-2 rounded-xl">
                        {notif.previewData.orderNumber && (
                          <div>
                            <span className="text-slate-500 font-semibold">Order:</span>
                            <div className="font-mono text-orange-400 font-bold">{notif.previewData.orderNumber}</div>
                          </div>
                        )}
                        {notif.previewData.recipientId && (
                          <div>
                            <span className="text-slate-500 font-semibold">Credited ID:</span>
                            <div className="text-slate-200 font-bold truncate">{notif.previewData.recipientId}</div>
                          </div>
                        )}
                        {notif.previewData.serialNumber && (
                          <div className="col-span-2 sm:col-span-1">
                            <span className="text-slate-500 font-semibold">Serial:</span>
                            <div className="text-emerald-400 font-mono text-[10px] truncate">{notif.previewData.serialNumber}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Click to view full message card</span>
                  {notif.orderNumber && onSelectReceiptByOrderNumber && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectReceiptByOrderNumber(notif.orderNumber!);
                      }}
                      className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>View Receipt</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Notification Message Preview Modal */}
        {selectedPreviewNotif && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-20 p-5 flex flex-col overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${getChannelBadge(selectedPreviewNotif.channel)}`}>
                  {getChannelIcon(selectedPreviewNotif.channel)}
                </span>
                <span className="text-xs text-slate-300 font-bold">Message Preview</span>
              </div>
              <button
                onClick={() => setSelectedPreviewNotif(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-auto py-4 space-y-4 max-w-lg mx-auto w-full">
              {/* Channel Simulator Card */}
              {selectedPreviewNotif.channel === 'gmail' && (
                <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                    <div>From: <strong className="text-slate-200">UniPin Official &lt;receipts@unipin.com&gt;</strong></div>
                    <div>To: <strong className="text-slate-200">{selectedPreviewNotif.channelTarget}</strong></div>
                  </div>
                  <h3 className="text-sm font-bold text-white">{selectedPreviewNotif.title}</h3>
                  <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    {selectedPreviewNotif.message}
                  </div>
                </div>
              )}

              {selectedPreviewNotif.channel === 'telegram' && (
                <div className="bg-slate-900 border border-sky-500/30 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs border-b border-slate-800 pb-2">
                    <span className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-black">🤖</span>
                    <div>
                      <div className="font-bold text-white">UniPin Dispatcher Bot (@unipin_orders_bot)</div>
                      <div className="text-[10px] text-sky-400">Delivered to {selectedPreviewNotif.channelTarget}</div>
                    </div>
                  </div>
                  <div className="bg-sky-950/50 border border-sky-500/20 text-xs text-slate-200 p-3.5 rounded-xl whitespace-pre-line leading-relaxed font-sans">
                    {selectedPreviewNotif.message}
                  </div>
                </div>
              )}

              {selectedPreviewNotif.channel === 'phone_sms' && (
                <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="font-bold text-emerald-400">📱 SMS Notification Service</span>
                    <span className="text-slate-400">Recipient: {selectedPreviewNotif.channelTarget}</span>
                  </div>
                  <div className="bg-emerald-950/40 border border-emerald-500/20 text-xs text-slate-200 p-3.5 rounded-xl leading-relaxed">
                    {selectedPreviewNotif.message}
                  </div>
                </div>
              )}

              {(selectedPreviewNotif.channel === 'facebook' || selectedPreviewNotif.channel === 'twitter' || selectedPreviewNotif.channel === 'system') && (
                <div className="bg-slate-900 border border-slate-750 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="text-xs font-bold text-orange-400 border-b border-slate-800 pb-2">
                    {selectedPreviewNotif.channel.toUpperCase()} Instant Direct Notification
                  </div>
                  <div className="bg-slate-950 text-xs text-slate-200 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                    {selectedPreviewNotif.message}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleCopy(selectedPreviewNotif.message, selectedPreviewNotif.id)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl flex items-center gap-1.5"
                >
                  {copiedText === selectedPreviewNotif.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText === selectedPreviewNotif.id ? 'Copied' : 'Copy Message'}</span>
                </button>
                <button
                  onClick={() => setSelectedPreviewNotif(null)}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white rounded-xl shadow"
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Delivery webhook listening active</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl transition-all"
          >
            Close
          </button>
        </div>

      </div>

    </div>
  );
};
