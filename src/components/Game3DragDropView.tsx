import React, { useState } from 'react';
import { GAME3_ITEMS, GAME3_ZONES } from '../data/gameContent';
import { ScoreState, DragDropItem } from '../types';
import { 
  Layers, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowRight, 
  Sparkles, 
  HelpCircle,
  Move
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';

interface Game3DragDropViewProps {
  scoreState: ScoreState;
  onUpdateScore: (gameKey: 'game3', newScore: number, matches: Record<string, string>, isCompleted: boolean) => void;
  onNextGame: () => void;
}

export const Game3DragDropView: React.FC<Game3DragDropViewProps> = ({
  scoreState,
  onUpdateScore,
  onNextGame,
}) => {
  const [matches, setMatches] = useState<Record<string, string>>(scoreState.game3.matches || {});
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  // Placed items in zones
  const getItemsInZone = (zoneId: string) => {
    return GAME3_ITEMS.filter((item) => matches[item.id] === zoneId);
  };

  const unassignedItems = GAME3_ITEMS.filter((item) => !matches[item.id]);

  const handleAssignItemToZone = (itemId: string, zoneId: string) => {
    const item = GAME3_ITEMS.find((i) => i.id === itemId);
    if (!item) return;

    soundManager.playClick();
    const nextMatches = { ...matches, [itemId]: zoneId };
    setMatches(nextMatches);
    setSelectedItemId(null);
    setDraggedItemId(null);

    // Calculate score
    let points = 0;
    GAME3_ITEMS.forEach((i) => {
      if (nextMatches[i.id] === i.correctZoneId) {
        points += 5;
      }
    });

    const isAllPlaced = Object.keys(nextMatches).length === GAME3_ITEMS.length;
    if (isAllPlaced) {
      if (points === 25) {
        soundManager.playLevelUp();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      } else {
        soundManager.playCorrect();
      }
    }

    onUpdateScore('game3', points, nextMatches, isAllPlaced);
  };

  const handleRemoveFromZone = (itemId: string) => {
    soundManager.playClick();
    const nextMatches = { ...matches };
    delete nextMatches[itemId];
    setMatches(nextMatches);

    let points = 0;
    GAME3_ITEMS.forEach((i) => {
      if (nextMatches[i.id] === i.correctZoneId) {
        points += 5;
      }
    });

    onUpdateScore('game3', points, nextMatches, false);
  };

  const handleReset = () => {
    soundManager.playClick();
    setMatches({});
    setSelectedItemId(null);
    onUpdateScore('game3', 0, {}, false);
  };

  // Drag handlers
  const onDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData('text/plain', itemId);
    setDraggedItemId(itemId);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (itemId) {
      handleAssignItemToZone(itemId, zoneId);
    }
  };

  const isCompleted = Object.keys(matches).length === GAME3_ITEMS.length;

  return (
    <div id="game3-dragdrop-container" className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-black">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                TRÒ CHƠI 3 / 4
              </span>
              <span className="text-xs font-bold text-slate-500">
                Tối đa: 25 Điểm (5 điểm/mục)
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">
              Kéo Thả Ma Trận Phân Loại Khảo Thí AI
            </h2>
          </div>
        </div>

        {/* Score Counter & Reset */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Làm lại
          </button>

          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Điểm Trò 3:</span>
            <span className="text-lg font-black text-amber-600">
              {scoreState.game3.score} / 25 đ
            </span>
          </div>
        </div>
      </div>

      {/* Guide Note */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-900 flex items-center gap-2">
        <Move className="w-4 h-4 text-indigo-600 shrink-0" />
        <span>
          <strong>Hướng dẫn thao tác:</strong> Kéo và thả thẻ bài vào Vùng tương ứng, hoặc <strong>nhấp chọn 1 thẻ</strong> ở dưới rồi <strong>nhấp vào Vùng muốn xếp</strong>.
        </span>
      </div>

      {/* 3 Drop Zones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {GAME3_ZONES.map((zone) => {
          const itemsInThisZone = getItemsInZone(zone.id);

          return (
            <div
              key={zone.id}
              id={`drop-zone-${zone.id}`}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, zone.id)}
              onClick={() => {
                if (selectedItemId) {
                  handleAssignItemToZone(selectedItemId, zone.id);
                }
              }}
              className={`rounded-3xl border-2 p-5 transition-all flex flex-col justify-between min-h-[220px] ${
                selectedItemId
                  ? 'border-indigo-400 bg-indigo-50/40 ring-2 ring-indigo-200 cursor-pointer'
                  : `${zone.borderLight} ${zone.bgLight}`
              }`}
            >
              <div>
                <div className={`font-black text-xs sm:text-sm uppercase mb-1 ${zone.color}`}>
                  {zone.title}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mb-3">
                  {zone.subtitle}
                </div>

                {/* Items in zone */}
                <div className="space-y-2">
                  {itemsInThisZone.map((item) => {
                    const isCorrect = item.correctZoneId === zone.id;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border bg-white shadow-xs text-xs space-y-1 ${
                          isCorrect ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-rose-300 ring-1 ring-rose-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-slate-800 leading-snug">
                            {item.label}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromZone(item.id);
                            }}
                            className="text-slate-400 hover:text-rose-600 font-black text-sm shrink-0 px-1"
                            title="Bỏ khỏi vùng"
                          >
                            ×
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold">
                          {isCorrect ? (
                            <span className="text-emerald-700 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đúng vị trí (+5đ)
                            </span>
                          ) : (
                            <span className="text-rose-700 flex items-center gap-0.5">
                              <XCircle className="w-3 h-3 text-rose-600" /> Chưa đúng vùng
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {itemsInThisZone.length === 0 && (
                    <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center text-xs text-slate-400 font-medium">
                      Thả thẻ bài vào đây
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] font-bold text-slate-500 text-right">
                Đã xếp: {itemsInThisZone.length} thẻ
              </div>
            </div>
          );
        })}
      </div>

      {/* Unassigned Items Pool */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">
            Danh Sách Nhiệm Vụ Khảo Thí Cần Phân Loại ({unassignedItems.length} thẻ chưa xếp):
          </span>
          {selectedItemId && (
            <span className="text-xs font-bold text-indigo-600 animate-pulse">
              👉 Hãy nhấp vào 1 trong 3 Vùng ở trên để xếp vào!
            </span>
          )}
        </div>

        {unassignedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unassignedItems.map((item) => {
              const isSelected = selectedItemId === item.id;

              return (
                <div
                  key={item.id}
                  id={`item-${item.id}`}
                  draggable
                  onDragStart={(e) => onDragStart(e, item.id)}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedItemId(isSelected ? null : item.id);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-grab active:cursor-grabbing ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-300 scale-102 shadow-md'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="p-1 rounded-md bg-white border border-slate-200 text-slate-500 shrink-0 mt-0.5">
                      <Move className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 leading-snug mb-1">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-500 leading-normal">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center font-bold">
              ✓
            </div>
            <h4 className="text-sm font-bold text-emerald-900">
              Đã xếp đủ 5 thẻ bài vào các vùng ma trận!
            </h4>
            <p className="text-xs text-emerald-700">
              Bạn đạt được: <strong>{scoreState.game3.score} / 25 điểm</strong> ở Trò chơi 3.
            </p>
          </div>
        )}

        {/* Next Game Button */}
        {isCompleted && (
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              id="btn-finish-game3"
              onClick={onNextGame}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 flex items-center gap-1.5 transition-all"
            >
              <span>Hoàn Thành Trò 3 &rarr; Sang Trò 4</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
