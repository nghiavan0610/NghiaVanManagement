import { Vietnamese } from 'flatpickr/dist/l10n/vn.js';
import 'flatpickr/dist/plugins/monthSelect/style.css';
import React from 'react';
import Flatpickr from 'react-flatpickr';

function Datepicker({
  onChange,
  defaultDate = new Date(),
  value,
  mode = 'single',
  limitDate = true,
  enableTime = false
}) {
  const options = {
    monthSelectorType: 'static',
    dateFormat: enableTime ? 'j M, Y H:i' : 'j M, Y',
    defaultDate,
    locale: Vietnamese,
    maxDate: limitDate && new Date(),
    enableTime: enableTime,
    minuteIncrement: 1,
    allowInput: true,
    time_24hr: true,
    mode,
    prevArrow:
      '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M5.4 10.8l1.4-1.4-4-4 4-4L5.4 0 0 5.4z" /></svg>',
    nextArrow:
      '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M1.4 10.8L0 9.4l4-4-4-4L1.4 0l5.4 5.4z" /></svg>',
    // plugins: [new MonthSelectPlugin({})],
    onReady: (selectedDates, dateStr, instance) => {
      instance.element.value = dateStr.replace('to', '-');
    },
    onChange: (selectedDates, dateStr, instance) => {
      onChange(selectedDates[0]);
      instance.element.value = dateStr.replace('to', '-');
    },
    onClose: (selectedDates, dateStr, instance) => {
      onChange(selectedDates[0]);
      instance.element.value = dateStr.replace('to', '-');
    },
  };

  return (
    <div className='relative'>
      <Flatpickr
        className='form-input pl-9 text-slate-500 hover:text-slate-600 font-medium focus:border-slate-300 w-full'
        options={options}
        value={value}
      />
      <div className='absolute top-3 right-auto flex items-center pointer-events-none'>
        <svg
          className='w-4 h-4 fill-current text-slate-500 ml-3'
          viewBox='0 0 16 16'
        >
          <path d='M15 2h-2V0h-2v2H9V0H7v2H5V0H3v2H1a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V3a1 1 0 00-1-1zm-1 12H2V6h12v8z' />
        </svg>
      </div>
    </div>
  );
}

export default Datepicker;
