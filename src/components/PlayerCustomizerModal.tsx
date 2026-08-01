import React, { useState } from 'react';
import { PlayerProfile, Position } from '../types';
import { NATIONAL_TEAMS } from '../data/mockData';
import { X, Check, Globe, User, Palette, Shield, Sparkles } from 'lucide-react';

interface PlayerCustomizerModalProps {
  player: PlayerProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProfile: PlayerProfile) => void;
}

const SKIN_TONES = ['#FAD7BD', '#F3C498', '#D6986A', '#AA6A43', '#7A4B2A', '#4A2A14'];
const HAIR_COLORS = ['#1A1A1A', '#38281A', '#7A4A28', '#D4AF37', '#800020', '#C0C0C0'];
const POSITIONS: Position[] = ['ST', 'LW', 'RW', 'CAM', 'CM'];

export const PlayerCustomizerModal: React.FC<PlayerCustomizerModalProps> = ({
  player,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(player.name);
  const [countryCode, setCountryCode] = useState(player.countryCode);
  const [position, setPosition] = useState<Position>(player.position);
  const [skinTone, setSkinTone] = useState(player.appearance.skinTone);
  const [hairStyle, setHairStyle] = useState(player.appearance.hairStyle);
  const [hairColor, setHairColor] = useState(player.appearance.hairColor);
  const [number, setNumber] = useState(player.appearance.number);

  if (!isOpen) return null;

  const handleSave = () => {
    const selectedTeam = NATIONAL_TEAMS.find((t) => t.code === countryCode) || NATIONAL_TEAMS[0];
    const updated: PlayerProfile = {
      ...player,
      name: name.trim() || 'Kerem Atak',
      nationality: selectedTeam.name,
      countryCode: selectedTeam.code,
      position,
      appearance: {
        ...player.appearance,
        skinTone,
        hairStyle,
        hairColor,
        number,
      },
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Oyuncu ve Milli Takım Özelleştirme</h2>
              <p className="text-xs text-slate-400">Ülkeni seç, milli takımı temsil et ve görünümünü oluştur</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form content */}
        <div className="p-6 space-y-6">
          {/* Player Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Futbolcu Adı & Soyadı
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold focus:outline-none focus:border-emerald-500 transition"
              placeholder="Örn: Arda Güler"
              maxLength={25}
            />
          </div>

          {/* Nationality / Country Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Temsil Edilecek Milli Takım (Ülke Seçimi)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {NATIONAL_TEAMS.map((team) => (
                <button
                  key={team.code}
                  type="button"
                  onClick={() => setCountryCode(team.code)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition ${
                    countryCode === team.code
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-2xl">{team.flag}</span>
                  <span className="text-xs font-bold mt-1 truncate w-full text-center">
                    {team.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Position & Number Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Mevki
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPosition(pos)}
                    className={`py-2.5 rounded-xl text-xs font-black transition border ${
                      position === pos
                        ? 'bg-emerald-600 border-emerald-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Forma Numarası (1-99)
              </label>
              <input
                type="number"
                min={1}
                max={99}
                value={number}
                onChange={(e) => setNumber(Math.min(99, Math.max(1, Number(e.target.value) || 10)))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Skin Tone */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Ten Rengi</span>
            </label>
            <div className="flex items-center gap-3">
              {SKIN_TONES.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setSkinTone(tone)}
                  className={`w-10 h-10 rounded-full border-2 transition transform hover:scale-110 ${
                    skinTone === tone ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: tone }}
                />
              ))}
            </div>
          </div>

          {/* Hair Color */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Saç Rengi
            </label>
            <div className="flex items-center gap-3">
              {HAIR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setHairColor(color)}
                  className={`w-10 h-10 rounded-full border-2 transition transform hover:scale-110 ${
                    hairColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900/95">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition text-sm"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <Check className="w-4 h-4" />
            <span>Kaydet & Milli Takımı Temsil Et</span>
          </button>
        </div>
      </div>
    </div>
  );
};
