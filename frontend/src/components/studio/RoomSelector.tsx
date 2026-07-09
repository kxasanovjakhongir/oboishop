import { useTranslation } from 'react-i18next';
import { ROOMS } from './BaseRoom';
import useStore from '../../store/useStore';
import type { RoomId } from '../../types';

const ROOM_LIST = Object.values(ROOMS);

export default function RoomSelector() {
  const { t } = useTranslation();
  const { currentRoom, setCurrentRoom, resetRoom } = useStore();

  const handleChange = (id: RoomId) => {
    setCurrentRoom(id);
    resetRoom();
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-1 px-2 scrollbar-hide">
      {ROOM_LIST.map((room) => (
        <button
          key={room.id}
          onClick={() => handleChange(room.id as RoomId)}
          className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
            currentRoom === room.id
              ? 'bg-orange-600 text-white shadow-lg scale-105'
              : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
          }`}
        >
          <span className="text-lg leading-none">{room.icon}</span>
          <span className="text-[10px] font-semibold whitespace-nowrap leading-none">{t(`studio.rooms.${room.id}`)}</span>
        </button>
      ))}
    </div>
  );
}
