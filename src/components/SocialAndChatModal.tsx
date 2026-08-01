import React, { useState } from 'react';
import { PlayerProfile } from '../types';
import { Share2, Users, MessageSquare, Send, Award, Check, Sparkles, Copy, Gift } from 'lucide-react';

interface SocialAndChatModalProps {
  player: PlayerProfile;
  onInviteFriend: () => void;
}

interface ChatMessage {
  id: string;
  sender: string;
  club: string;
  text: string;
  time: string;
  isUser?: boolean;
}

export const SocialAndChatModal: React.FC<SocialAndChatModalProps> = ({ player, onInviteFriend }) => {
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'Kenan Y.',
      club: 'Juventus',
      text: 'Milli Takım turnuvasında finale kalan var mı? Frikikler harika olmuş!',
      time: '12:45',
    },
    {
      id: '2',
      sender: 'Semih K.',
      club: 'Beşiktaş',
      text: 'Şampiyonlar Ligi yarı finalinde 90. dakikada frikikten astım 🚀',
      time: '12:48',
    },
    {
      id: '3',
      sender: 'Barış A.',
      club: 'Galatasaray',
      text: 'Altın şampiyon formasını mağazadan alan var mı, şut gücünü artırıyor mu?',
      time: '12:51',
    },
  ]);

  const inviteCode = `SCC-STR-${player.name.slice(0, 4).toUpperCase()}-2025`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: player.name,
      club: player.currentClub,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setChatInput('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
      {/* Invite & Social Share Column */}
      <div className="space-y-6 lg:col-span-1">
        {/* Friend Invite Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Arkadaş Davet Sistemi</span>
          </div>

          <h3 className="text-xl font-black text-white">Arkadaşlarını Davet Et, Altın & Elmas Kazan!</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sana özel davet kodunu arkadaşlarınla paylaş. Oyuna katılan her arkadaşın için anında +1,000 Altın ve +25 Elmas ödül kazan!
          </p>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="font-mono font-bold text-amber-400 text-sm">{inviteCode}</span>
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
            </button>
          </div>

          <button
            onClick={onInviteFriend}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Davet Linki Paylaş (+1,000 Altın)</span>
          </button>
        </div>

        {/* Community Loyalty Benefits */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Topluluk & Sadakat Avantajları</span>
          </div>
          <h4 className="text-base font-black text-white">Sadakat Seviyesi: Elit Yıldız</h4>
          <p className="text-xs text-slate-400">
            Topluluk etkinliklerine katıldıkça ve günlük giriş yaptıkça sadakat puanın artar. Özel formalar ve transfer indirimleri açılır!
          </p>
        </div>
      </div>

      {/* Live In-Game Chat Column */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col h-[520px]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <MessageSquare className="w-4 h-4" />
              <span>Canlı Oyun İçi Sohbet</span>
            </div>
            <h3 className="text-xl font-black text-white mt-0.5">Oyuncular & Kupa Şampiyonları Odası</h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>248 Oyuncu Çevrimiçi</span>
          </span>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 text-xs mb-1">
                <span className="font-extrabold text-white">{msg.sender}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {msg.club}
                </span>
                <span className="text-[10px] text-slate-500">{msg.time}</span>
              </div>
              <div
                className={`max-w-md px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed ${
                  msg.isUser
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-sm'
                    : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Chat input */}
        <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Sohbete mesaj yaz..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-emerald-500 transition"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition flex items-center gap-1.5 text-xs shadow-lg"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Gönder</span>
          </button>
        </form>
      </div>
    </div>
  );
};
