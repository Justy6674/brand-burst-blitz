import React from 'react';
import { ProfessionalCalendarEngine } from '@/components/calendar/ProfessionalCalendarEngine';

export default function Calendar() {
  return (
    <div className="h-screen flex flex-col">
      <ProfessionalCalendarEngine 
        defaultView="month"
        showPracticeSwitcher={true}
        enableSmartSuggestions={true}
        enableVoiceCapture={true}
        enableDragDrop={true}
        enableRealTimeSync={true}
      />
    </div>
  );
}